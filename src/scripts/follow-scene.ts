// Blocks that follow you down the page: as the hero scrolls away, six blocks peel off the hero scene,
// travel with you while you scroll, and land in the Packages cards as the 1 / 2 / 3 block stacks.
// A few extra blocks tag along and fly off. Everything is driven by scroll position, so scrolling back
// up reverses it. Drawn on one fixed, click-through canvas above the page.

import { createCubeRenderer, type HeroSceneApi } from './hero-scene';

type RGB = [number, number, number];

interface Flyer {
  hero: number; // index of the hero block it comes from
  slot: HTMLElement | null; // DOM block it lands in (null = escort that flies off)
  color: RGB;
  p: number; // progress 0..1
  s0: number; // scroll position where it takes off
  s1: number; // scroll position where it lands
  // captured at take-off (viewport px)
  sx: number;
  sy: number;
  size: number;
  scolor: RGB;
  side: number;
  spin: [number, number, number];
  landed: boolean;
  land: number; // how far down the screen (0..1) the slot is when this block lands
}

const parseColor = (el: HTMLElement): RGB => {
  const m = getComputedStyle(el).backgroundColor.match(/[\d.]+/g) || ['255', '255', '255'];
  return [+m[0] / 255, +m[1] / 255, +m[2] / 255];
};
const clamp = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);
const smoothstep = (a: number, b: number, x: number) => {
  const k = clamp((x - a) / (b - a));
  return k * k * (3 - 2 * k);
};
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export function initFollow(scene: HeroSceneApi, hero: HTMLElement) {
  const slots = [...document.querySelectorAll<HTMLElement>('.pkg__block')];
  if (!slots.length) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'follow-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, {
    position: 'fixed',
    inset: '0',
    width: '100%',
    height: '100%',
    zIndex: '30',
    pointerEvents: 'none',
  });
  document.body.append(canvas);

  const r = createCubeRenderer(canvas, 32);
  if (!r) {
    canvas.remove();
    return;
  }
  const { gl, inst, instBuf, u } = r;
  gl.uniform1f(u.uOrtho, 1);
  gl.uniform1f(u.uCamZ, 1000);
  gl.uniform2f(u.uFog, 1e6, 2e6);
  gl.uniform4f(u.uRect, -1e5, -1e5, -1e5, -1e5);
  gl.uniform1f(u.uSoft, 1);
  gl.uniform1f(u.uDim, 1);
  gl.uniformMatrix4fv(u.uModel, false, new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]));

  const flyers: Flyer[] = [];
  const make = (hero: number, slot: HTMLElement | null, k: number): Flyer => ({
    hero,
    slot,
    color: slot ? parseColor(slot) : [1, 1, 1],
    p: 0,
    s0: 0,
    s1: 1,
    sx: 0,
    sy: 0,
    size: 0,
    scolor: [1, 1, 1],
    side: k % 2 ? 1 : -1,
    spin: [1 + (k % 3), 1 + ((k + 1) % 2), (k % 2) * 0.5],
    land: 0.7,
    landed: true, // flips to "waiting" on the first tick if the block has not arrived yet
  });
  // Land card by card, and within a card from the bottom block up.
  const stacks = [...new Set(slots.map((el) => el.parentElement))];
  const order = [...slots].sort((a, b) => {
    const sa = stacks.indexOf(a.parentElement), sb = stacks.indexOf(b.parentElement);
    if (sa !== sb) return sa - sb;
    return [...b.parentElement!.children].indexOf(b) - [...a.parentElement!.children].indexOf(a);
  });
  slots.forEach((el, k) => {
    const fl = make(k, el, k);
    fl.land = 0.76 - order.indexOf(el) * 0.025;
    flyers.push(fl);
  });
  for (let k = 0; k < 10; k++) flyers.push(make(slots.length + k, null, k + slots.length));

  let W = 1;
  let H = 1;

  const measure = () => {
    W = innerWidth;
    H = innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    const n = 1, f = 3000;
    gl.uniformMatrix4fv(u.uProj, false, new Float32Array([2 / W, 0, 0, 0, 0, 2 / H, 0, 0, 0, 0, -2 / (f - n), 0, -1, -1, -(f + n) / (f - n), 1]));

    const heroBottom = hero.getBoundingClientRect().bottom + scrollY;
    const s0 = Math.max(40, heroBottom - H * 0.85);
    flyers.forEach((fl, k) => {
      fl.s0 = s0 + (k % 6) * 12;
      if (fl.slot) {
        const b = fl.slot.getBoundingClientRect();
        // land when the slot reaches its landing line (60-76% down the screen)
        fl.s1 = Math.max(fl.s0 + H * 0.35, b.top + b.height / 2 + scrollY - H * fl.land);
      } else {
        fl.s1 = fl.s0 + H * (0.6 + (k % 4) * 0.1);
      }
    });
    tick();
  };

  let raf = 0;
  let time = 0;
  let lastNow = 0;
  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(frame);
  };

  const tick = () => {
    const y = scrollY;
    let count = 0;
    let active = false;
    for (const fl of flyers) {
      const prev = fl.p;
      fl.p = clamp((y - fl.s0) / (fl.s1 - fl.s0));

      // take-off: grab the block from the hero scene
      if (prev <= 0 && fl.p > 0) {
        const b = scene.blockScreen(fl.hero);
        fl.sx = b.x;
        fl.sy = b.y + (y - fl.s0); // where it was when the take-off scroll position was crossed
        fl.size = Math.max(8, Math.min(60, b.size));
        fl.scolor = b.color;
      }
      scene.setHidden(fl.hero, fl.p > 0);

      if (fl.slot) {
        const landed = fl.p >= 1;
        if (landed !== fl.landed) {
          fl.landed = landed;
          fl.slot.classList.toggle('is-waiting', !landed);
          fl.slot.classList.toggle('is-landed', landed && prev > 0);
        }
      }
      if (fl.p <= 0 || fl.p >= 1) continue;
      active = true;

      const e = ease(fl.p);
      const arc = Math.sin(Math.PI * fl.p);
      let ex: number, ey: number, es: number;
      if (fl.slot) {
        const b = fl.slot.getBoundingClientRect();
        ex = b.left + b.width / 2;
        ey = H * fl.land;
        es = b.width;
      } else {
        ex = fl.side > 0 ? W + 60 : -60;
        ey = H * 1.15;
        es = 0;
      }
      // the slot's y at landing time is fixed on screen; before that the block lives in screen space
      // While travelling, blocks ride along the page margins (left or right) so they stay off the text,
      // then swing in to their slot at the end.
      const narrow = W < 900;
      const margin = narrow ? 20 : Math.max(48, (W - 1152) / 4 + 40);
      const rail = fl.side > 0 ? W - margin + (fl.hero % 3) * (narrow ? -4 : 14) : margin - (fl.hero % 3) * (narrow ? -4 : 14);
      const inK = smoothstep(0, 0.22, fl.p);
      const outK = fl.slot ? smoothstep(0.72, 1, fl.p) : 0;
      const x = lerp(lerp(fl.sx, rail, inK), ex, outK);
      const sy = lerp(fl.sy, ey, e) + Math.sin(time * 2.2 + fl.hero) * 8 * arc;
      const midSize = narrow ? 26 : Math.max(fl.size, 34) * 1.4;
      const size = fl.slot ? lerp(lerp(fl.size, midSize, inK), es, outK) : lerp(fl.size, midSize, inK) * (1 - smoothstep(0.6, 1, fl.p));
      const k = count * 12;
      inst[k] = x;
      inst[k + 1] = H - sy;
      inst[k + 2] = 200 * arc;
      const unwind = (1 - e) * Math.PI * 2;
      inst[k + 3] = fl.spin[0] * unwind + 0.35 * Math.sin(time * 1.7 + fl.hero) * arc;
      inst[k + 4] = fl.spin[1] * unwind + 0.35 * Math.cos(time * 1.3 + fl.hero) * arc;
      inst[k + 5] = fl.spin[2] * unwind;
      inst[k + 6] = inst[k + 7] = inst[k + 8] = size;
      const ck = fl.slot ? clamp(fl.p * 2) : 0;
      inst[k + 9] = lerp(fl.scolor[0], fl.color[0], ck);
      inst[k + 10] = lerp(fl.scolor[1], fl.color[1], ck);
      inst[k + 11] = lerp(fl.scolor[2], fl.color[2], ck);
      count++;
    }
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if (count) {
      gl.bindBuffer(gl.ARRAY_BUFFER, instBuf);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, inst, 0, count * 12);
      gl.drawElementsInstanced(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0, count);
    }
    return active;
  };

  const frame = (now: number) => {
    raf = 0;
    time += lastNow ? Math.min(0.05, (now - lastNow) / 1000) : 0;
    lastNow = now;
    // keep animating the wobble while any block is mid-flight
    if (tick()) schedule();
    else lastNow = 0;
  };

  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', measure);
  // layout shifts (fonts, images) move the landing spots
  new ResizeObserver(measure).observe(document.body);
  // stacks start empty until their block arrives (unless the page loaded already past them)
  measure();
}
