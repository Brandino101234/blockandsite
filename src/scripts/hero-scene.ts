// Hero 3D scene: ~120 blocks that keep rebuilding themselves into different shapes (a website, the logo,
// a phone, a wave, a vortex) behind the headline. Plain WebGL2 with instanced cubes, no libraries, so it
// stays small (a few KB) and loads after the page is interactive.
//
// Interaction: the cursor (or finger) pushes blocks out of the way, dragging spins the scene, and a click
// or tap blows the blocks apart and they rebuild into the next shape.

type RGB = [number, number, number];

const BLUE: RGB = [0.263, 0.643, 0.957];
const RED: RGB = [0.957, 0.263, 0.298];
const YELLOW: RGB = [0.957, 0.922, 0.263];
const GRAY: RGB = [0.24, 0.24, 0.24];
const CARD: RGB = [0.3, 0.3, 0.3];
const LIGHT: RGB = [0.8, 0.8, 0.8];
const FRAME: RGB = [0.16, 0.16, 0.16];

const N = 120;

// ---------------------------------------------------------------------------------------------
// Formations
// ---------------------------------------------------------------------------------------------

// A target is 12 floats: position xyz, rotation xyz, scale xyz, color rgb.
type Out = Float32Array;
interface Formation {
  count: number;
  get(slot: number, t: number, out: Out): void;
}

interface CellStyle {
  color: RGB;
  scale: [number, number, number];
  z: number;
}

const set = (o: Out, p: number[], r: number[], s: number[], c: RGB) => {
  o[0] = p[0]; o[1] = p[1]; o[2] = p[2];
  o[3] = r[0]; o[4] = r[1]; o[5] = r[2];
  o[6] = s[0]; o[7] = s[1]; o[8] = s[2];
  o[9] = c[0]; o[10] = c[1]; o[11] = c[2];
};

/** Build a static formation from an ASCII map: each character is one block, '.' is empty. */
function fromMap(rows: string[], styles: Record<string, CellStyle>, yaw = 0): Formation {
  const cells: number[][] = [];
  const h = rows.length;
  const w = rows[0].length;
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  rows.forEach((row, r) => {
    [...row].forEach((ch, c) => {
      const st = styles[ch];
      if (!st) return;
      const x = c - (w - 1) / 2;
      const y = (h - 1) / 2 - r;
      const z = st.z;
      cells.push([x * cy + z * sy, y, -x * sy + z * cy, 0, yaw, 0, ...st.scale, ...st.color]);
    });
  });
  return {
    count: cells.length,
    get(slot, _t, out) {
      out.set(cells[slot]);
    },
  };
}

const S = (color: RGB, sx: number, sy: number, sz: number, z: number): CellStyle => ({ color, scale: [sx, sy, sz], z });

// A small website: nav, headline lines, hero image, call button, three cards.
const site = fromMap(
  [
    'rrr.......ggg.ggg',
    '.................',
    'wwwwwwwwww..bbbbb',
    'wwwwwwww....bbbbb',
    'wwwwwwwwww..bbbbb',
    '............bbbbb',
    'BBBBBB......bbbbb',
    '.................',
    'yyyyy.RRRRR.kkkkk',
    'yyyyy.RRRRR.kkkkk',
    'yyyyy.RRRRR.kkkkk',
  ],
  {
    r: S(RED, 0.92, 0.92, 0.6, 0.2),
    g: S(GRAY, 0.9, 0.42, 0.4, 0),
    w: S(LIGHT, 0.94, 0.4, 0.3, 0),
    b: S(BLUE, 0.94, 0.94, 0.9, 0.3),
    B: S(BLUE, 0.94, 0.78, 1.2, 1.1),
    y: S(YELLOW, 0.94, 0.94, 0.7, 0.6),
    R: S(RED, 0.94, 0.94, 0.7, 0.6),
    k: S(CARD, 0.94, 0.94, 0.7, 0.6),
  },
);

// The same site on a phone, turned a little toward the viewer.
const phone = fromMap(
  [
    'fffffffff',
    'frr...ggf',
    'f.......f',
    'fbbbbbbbf',
    'fbbbbbbbf',
    'fbbbbbbbf',
    'fwwwww..f',
    'fwwww...f',
    'f.......f',
    'fBBBBBBBf',
    'f.......f',
    'fyyy.RRRf',
    'fyyy.RRRf',
    'f.......f',
    'fkkkkkkkf',
    'fffffffff',
  ],
  {
    f: S(FRAME, 0.96, 0.96, 1.3, -0.4),
    r: S(RED, 0.9, 0.9, 0.6, 0.2),
    g: S(GRAY, 0.9, 0.42, 0.4, 0),
    b: S(BLUE, 0.94, 0.94, 0.8, 0.3),
    w: S(LIGHT, 0.94, 0.4, 0.3, 0),
    B: S(BLUE, 0.94, 0.8, 1.2, 1.2),
    y: S(YELLOW, 0.94, 0.94, 0.7, 0.6),
    R: S(RED, 0.94, 0.94, 0.7, 0.6),
    k: S(CARD, 0.94, 0.94, 0.7, 0.4),
  },
  -0.42,
);

// The logo mark: blue and yellow squares overlapping, with the overlap in red and lifted forward.
const logo: Formation = (() => {
  const rows: string[] = [];
  for (let r = 0; r < 12; r++) {
    let row = '';
    for (let c = 0; c < 12; c++) {
      const inBlue = r < 8 && c < 8;
      const inYellow = r >= 4 && c >= 4;
      const blueCorner = inBlue && (r === 0 || r === 7) && (c === 0 || c === 7) && !inYellow;
      const yellowCorner = inYellow && (r === 4 || r === 11) && (c === 4 || c === 11) && !inBlue;
      if (inBlue && inYellow) row += 'r';
      else if (inBlue && !blueCorner) row += 'b';
      else if (inYellow && !yellowCorner) row += 'y';
      else row += '.';
    }
    rows.push(row);
  }
  return fromMap(rows, {
    b: S(BLUE, 0.94, 0.94, 1, 0),
    y: S(YELLOW, 0.94, 0.94, 1, 0),
    r: S(RED, 0.94, 0.94, 1.6, 0.9),
  });
})();

const mix = (a: RGB, b: RGB, k: number): RGB => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const smooth = (e0: number, e1: number, x: number) => {
  const k = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return k * k * (3 - 2 * k);
};

// A floor of blocks with a ripple running through it. Color follows height.
const wave: Formation = {
  count: 13 * 9,
  get(slot, t, out) {
    const c = slot % 13;
    const r = Math.floor(slot / 13);
    const x = (c - 6) * 1.05;
    const zz = (r - 4) * 1.05;
    const d = Math.hypot(x, zz);
    const h = Math.sin(d * 0.9 - t * 2.8) * 0.95 + Math.sin(c * 0.55 + t * 1.6) * 0.35;
    const a = 0.62;
    let col = mix(GRAY, BLUE, smooth(-0.7, 0.2, h));
    col = mix(col, YELLOW, smooth(0.55, 1.05, h));
    col = mix(col, RED, smooth(1.05, 1.3, h));
    set(out, [x, h * Math.cos(a) - zz * Math.sin(a), h * Math.sin(a) + zz * Math.cos(a)], [a, 0, 0], [0.86, 0.86, 0.86], col);
  },
};

const baseColor = (i: number): RGB => {
  const k = i % 10;
  if (k < 3) return BLUE;
  if (k < 5) return RED;
  if (k < 7) return YELLOW;
  return [0.2 + (k - 7) * 0.05, 0.2 + (k - 7) * 0.05, 0.2 + (k - 7) * 0.05];
};

// A spinning spiral galaxy of blocks.
const vortex: Formation = {
  count: N,
  get(slot, t, out) {
    const r = 1.1 + Math.sqrt(slot / N) * 7.6;
    const ang = slot * 2.39996 + t * (2.4 / (0.5 + r * 0.3));
    const y = Math.sin(ang * 3 + t * 2) * 0.55;
    const px = Math.cos(ang) * r;
    const pz = Math.sin(ang) * r;
    const tilt = 1.05;
    const qy = y * Math.cos(tilt) - pz * Math.sin(tilt);
    const qz = y * Math.sin(tilt) + pz * Math.cos(tilt);
    const roll = 0.35;
    const s = 0.45 + 0.5 * (((slot * 7) % 10) / 10);
    set(
      out,
      [px * Math.cos(roll) - qy * Math.sin(roll), px * Math.sin(roll) + qy * Math.cos(roll), qz],
      [t * 1.6 + slot, t * 1.1 + slot * 0.7, slot * 0.3],
      [s, s, s],
      baseColor(slot),
    );
  },
};

/** Blocks a formation doesn't use orbit loosely around it. */
function orbit(k: number, t: number, out: Out) {
  const ang = k * 1.7 + t * 0.35;
  const r = 9.6 + (k % 3) * 0.9;
  set(out, [Math.cos(ang) * r * 1.15, Math.sin(ang) * r * 0.55, -3 - (k % 4)], [t * 0.8 + k, t * 0.6 + k, 0], [0.42, 0.42, 0.42], baseColor(k));
}

const FORMATIONS = [site, vortex, logo, wave, phone];
const HOLD = [6.5, 4.2, 5, 5.5, 5];
const SPAN_W = 17; // widest formation, in block units
const SPAN_H = 16; // tallest formation

// ---------------------------------------------------------------------------------------------
// WebGL
// ---------------------------------------------------------------------------------------------

const VERT = `#version 300 es
layout(location=0) in vec3 aPos;
layout(location=1) in vec3 aNormal;
layout(location=2) in vec3 iPos;
layout(location=3) in vec3 iRot;
layout(location=4) in vec3 iScale;
layout(location=5) in vec3 iColor;
uniform mat4 uProj;
uniform mat4 uModel;
uniform float uCamZ;
out vec3 vNormal;
out vec3 vLocal;
out vec3 vHalf;
out vec3 vColor;
out vec3 vWorld;
mat3 rot(vec3 r) {
  vec3 s = sin(r), c = cos(r);
  mat3 rx = mat3(1., 0., 0., 0., c.x, s.x, 0., -s.x, c.x);
  mat3 ry = mat3(c.y, 0., -s.y, 0., 1., 0., s.y, 0., c.y);
  mat3 rz = mat3(c.z, s.z, 0., -s.z, c.z, 0., 0., 0., 1.);
  return rz * ry * rx;
}
void main() {
  mat3 R = rot(iRot);
  vec3 local = aPos * iScale;
  vec4 w = uModel * vec4(R * local + iPos, 1.);
  vNormal = normalize(mat3(uModel) * (R * aNormal));
  vLocal = local;
  vHalf = iScale * .5;
  vColor = iColor;
  vWorld = w.xyz;
  gl_Position = uProj * vec4(w.xy, w.z - uCamZ, 1.);
}`;

const FRAG = `#version 300 es
precision highp float;
in vec3 vNormal;
in vec3 vLocal;
in vec3 vHalf;
in vec3 vColor;
in vec3 vWorld;
uniform float uCamZ;
uniform vec2 uFog;
uniform vec4 uRect;
uniform float uSoft;
uniform float uDim;
out vec4 outColor;
void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(vec3(0., 0., uCamZ) - vWorld);
  vec3 L = normalize(vec3(-.45, .75, .6));
  float diff = max(dot(N, L), 0.);
  float fill = max(dot(N, normalize(vec3(.7, -.35, .4))), 0.);
  float rim = pow(1. - max(dot(N, V), 0.), 3.);
  float spec = pow(max(dot(N, normalize(L + V)), 0.), 40.);
  // Bevel: brighten pixels close to a cube edge so the blocks read as crisp solid pieces.
  vec3 d = vHalf - abs(vLocal);
  float mn = min(min(d.x, d.y), d.z);
  float mx = max(max(d.x, d.y), d.z);
  float mid = d.x + d.y + d.z - mn - mx;
  float edge = 1. - smoothstep(.0, .05, mid);
  vec3 col = vColor * (.22 + .9 * diff + .18 * fill) + vColor * rim * .45 + spec * .3 + edge * (.12 + .25 * diff);
  float fog = smoothstep(uFog.x, uFog.y, distance(vec3(0., 0., uCamZ), vWorld));
  col = mix(col, vec3(0.), fog);
  // Darken blocks that sit behind the headline so the text stays readable.
  vec2 q = max(uRect.xy - gl_FragCoord.xy, gl_FragCoord.xy - uRect.zw);
  float outside = smoothstep(0., uSoft, length(max(q, 0.)));
  col *= mix(uDim, 1., outside);
  outColor = vec4(col, 1.);
}`;

function cubeGeometry() {
  const faces: [number[], number[], number[]][] = [
    [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
    [[-1, 0, 0], [0, 1, 0], [0, 0, -1]],
    [[0, 1, 0], [0, 0, 1], [1, 0, 0]],
    [[0, -1, 0], [0, 0, -1], [1, 0, 0]],
    [[0, 0, 1], [1, 0, 0], [0, 1, 0]],
    [[0, 0, -1], [-1, 0, 0], [0, 1, 0]],
  ];
  const data: number[] = [];
  const idx: number[] = [];
  faces.forEach(([n, u, v], f) => {
    for (const [a, b] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      data.push(
        (n[0] + a * u[0] + b * v[0]) * 0.5,
        (n[1] + a * u[1] + b * v[1]) * 0.5,
        (n[2] + a * u[2] + b * v[2]) * 0.5,
        ...n,
      );
    }
    const o = f * 4;
    idx.push(o, o + 1, o + 2, o, o + 2, o + 3);
  });
  return { data: new Float32Array(data), idx: new Uint16Array(idx) };
}

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) || 'shader');
  return sh;
}

// ---------------------------------------------------------------------------------------------
// Scene
// ---------------------------------------------------------------------------------------------

export function initHeroScene(canvas: HTMLCanvasElement, hero: HTMLElement, copy: HTMLElement): boolean {
  const gl = canvas.getContext('webgl2', { antialias: true, alpha: true, premultipliedAlpha: true, powerPreference: 'low-power' });
  if (!gl) return false;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let prog: WebGLProgram;
  try {
    prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
  } catch {
    return false;
  }
  gl.useProgram(prog);
  const u = (n: string) => gl.getUniformLocation(prog, n);
  const uProj = u('uProj');
  const uModel = u('uModel');
  const uCamZ = u('uCamZ');
  const uFog = u('uFog');
  const uRect = u('uRect');
  const uSoft = u('uSoft');
  const uDim = u('uDim');

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const geo = cubeGeometry();
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, geo.data, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 24, 0);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 24, 12);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geo.idx, gl.STATIC_DRAW);

  const inst = new Float32Array(N * 12);
  const instBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, instBuf);
  gl.bufferData(gl.ARRAY_BUFFER, inst.byteLength, gl.DYNAMIC_DRAW);
  for (let a = 0; a < 4; a++) {
    gl.enableVertexAttribArray(2 + a);
    gl.vertexAttribPointer(2 + a, 3, gl.FLOAT, false, 48, a * 12);
    gl.vertexAttribDivisor(2 + a, 1);
  }
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.clearColor(0, 0, 0, 0);

  // Per-block simulation state
  const pos = new Float32Array(N * 3);
  const vel = new Float32Array(N * 3);
  const rot = new Float32Array(N * 3);
  const avel = new Float32Array(N * 3);
  const scl = new Float32Array(N * 3).fill(0.8);
  const col = new Float32Array(N * 3);
  const delay = new Float32Array(N);
  const follow = new Int8Array(N); // formation each block is currently heading to
  const perms: Int16Array[] = FORMATIONS.map(() => new Int16Array(N));
  const tgt = new Float32Array(12);

  const shuffle = (p: Int16Array) => {
    for (let i = 0; i < N; i++) p[i] = i;
    for (let i = N - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }
  };

  const targetFor = (i: number, f: number, t: number, out: Out) => {
    const form = FORMATIONS[f];
    const slot = perms[f][i];
    if (slot < form.count) form.get(slot, t, out);
    else orbit(slot - form.count, t, out);
  };

  let time = 0;
  let current = 0;
  let switchAt = 0; // when the current formation started
  let nextAt = HOLD[0];

  const activate = (f: number, intro = false) => {
    current = f;
    switchAt = time;
    nextAt = time + HOLD[f] + (intro ? 1.2 : 0);
    shuffle(perms[f]);
    for (let i = 0; i < N; i++) {
      targetFor(i, f, time, tgt);
      // Intro: build from the bottom row up. Later: sweep left to right.
      delay[i] = intro
        ? 0.15 + (1 - (tgt[1] + 6) / 12) * 0.9 + Math.random() * 0.15
        : Math.max(0, (tgt[0] + 9) / 18) * 0.45 + Math.random() * 0.2;
    }
  };

  // Start: blocks scattered above the view, then they fall into the website.
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 26;
    pos[i * 3 + 1] = 13 + Math.random() * 12;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    for (let a = 0; a < 3; a++) rot[i * 3 + a] = Math.random() * 6.28;
    const c = baseColor(i);
    col.set(c, i * 3);
  }
  activate(0, true);

  // View / layout
  let W = 1;
  let H = 1;
  let dpr = 1;
  const camZ = 30;
  const fov = (30 * Math.PI) / 180;
  let ppu = 1; // CSS px per world unit at z = 0
  let scale = 1;
  let offX = 0;
  let offY = 0;

  const proj = new Float32Array(16);
  const model = new Float32Array(16);

  const layout = () => {
    const r = hero.getBoundingClientRect();
    W = Math.max(1, r.width);
    H = Math.max(1, r.height);
    dpr = Math.min(devicePixelRatio || 1, W < 700 ? 1.75 : 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);

    const f = 1 / Math.tan(fov / 2);
    const aspect = W / H;
    const near = 1;
    const far = 120;
    proj.fill(0);
    proj[0] = f / aspect;
    proj[5] = f;
    proj[10] = (far + near) / (near - far);
    proj[11] = -1;
    proj[14] = (2 * far * near) / (near - far);

    ppu = H / (2 * camZ * Math.tan(fov / 2));
    const narrow = W < 900;
    const c = copy.getBoundingClientRect();
    const cTop = c.top - r.top;
    const cBottom = c.bottom - r.top;
    const wantW = narrow ? W * 1.2 : W * 0.5;
    const maxH = narrow ? H * 0.62 : H * 0.8;
    scale = Math.min(wantW / (SPAN_W * ppu), maxH / (SPAN_H * ppu));
    const ax = narrow ? W * 0.5 : Math.max(W * 0.68, c.right - wantW * 0.18);
    const ay = narrow ? Math.min(H - (SPAN_H * scale * ppu) / 2 + 20, cBottom + 10) : H * 0.5;
    offX = (ax - W / 2) / ppu;
    offY = -(ay - H / 2) / ppu;

    const pad = 20;
    gl.uniform4f(
      uRect,
      (c.left - r.left - pad) * dpr,
      (H - cBottom - pad) * dpr,
      (c.right - r.left + pad) * dpr,
      (H - cTop + pad) * dpr,
    );
    gl.uniform1f(uSoft, 70 * dpr);
    gl.uniform1f(uDim, narrow ? 0.34 : 0.3);
    gl.uniformMatrix4fv(uProj, false, proj);
    gl.uniform1f(uCamZ, camZ);
    gl.uniform2f(uFog, camZ - 4 * scale, camZ + 22 * scale);
  };

  // Group rotation (sway + hover tilt + drag)
  let yaw = 0;
  let pitch = 0;
  let hoverX = 0;
  let hoverY = 0;
  let dragYaw = 0;
  let dragPitch = 0;
  let dragVYaw = 0;
  let dragVPitch = 0;
  const R = new Float32Array(9); // row-major 3x3

  const updateModel = () => {
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    // R = Ry(yaw) * Rx(pitch)
    R[0] = cy; R[1] = sy * sp; R[2] = sy * cp;
    R[3] = 0; R[4] = cp; R[5] = -sp;
    R[6] = -sy; R[7] = cy * sp; R[8] = cy * cp;
    // column-major T * S * R
    model[0] = R[0] * scale; model[1] = R[3] * scale; model[2] = R[6] * scale; model[3] = 0;
    model[4] = R[1] * scale; model[5] = R[4] * scale; model[6] = R[7] * scale; model[7] = 0;
    model[8] = R[2] * scale; model[9] = R[5] * scale; model[10] = R[8] * scale; model[11] = 0;
    model[12] = offX; model[13] = offY; model[14] = 0; model[15] = 1;
  };

  // Pointer state (CSS px relative to the hero)
  let px = 0;
  let py = 0;
  let pvx = 0;
  let pvy = 0;
  let pointerIn = false;
  const toWorld = (x: number, y: number) => [(x - W / 2) / ppu, -(y - H / 2) / ppu];

  /** Push a world-space vector (on the screen plane) into block-local space. */
  const toLocal = (wx: number, wy: number, wz: number, out: number[]) => {
    out[0] = (R[0] * wx + R[3] * wy + R[6] * wz) / scale;
    out[1] = (R[1] * wx + R[4] * wy + R[7] * wz) / scale;
    out[2] = (R[2] * wx + R[5] * wy + R[8] * wz) / scale;
  };
  const tmp = [0, 0, 0];

  /** Screen-plane position (world units at z = 0) of block i. */
  const project = (i: number) => {
    const x = pos[i * 3], y = pos[i * 3 + 1], z = pos[i * 3 + 2];
    const wx = offX + scale * (R[0] * x + R[1] * y + R[2] * z);
    const wy = offY + scale * (R[3] * x + R[4] * y + R[5] * z);
    const wz = scale * (R[6] * x + R[7] * y + R[8] * z);
    const k = camZ / Math.max(1, camZ - wz);
    return [wx * k, wy * k];
  };

  const explode = (x: number, y: number) => {
    const [cx, cy] = toWorld(x, y);
    for (let i = 0; i < N; i++) {
      const [bx, by] = project(i);
      let dx = bx - cx, dy = by - cy;
      const d = Math.hypot(dx, dy) || 1;
      dx /= d; dy /= d;
      const m = 26 * Math.exp(-d / (6 * scale)) + 7;
      toLocal(dx * m, dy * m, (Math.random() * 0.8 + 0.3) * m, tmp);
      vel[i * 3] += tmp[0]; vel[i * 3 + 1] += tmp[1]; vel[i * 3 + 2] += tmp[2];
      for (let a = 0; a < 3; a++) avel[i * 3 + a] += (Math.random() - 0.5) * 30;
    }
    // Rebuild into the next shape once the blast has spread out.
    nextAt = Math.min(nextAt, time + 0.55);
  };

  // ---- simulation step ----
  const step = (dt: number) => {
    time += dt;
    if (time >= nextAt) activate((current + 1) % FORMATIONS.length);

    // group motion
    if (!dragging) {
      dragYaw += dragVYaw * dt;
      dragPitch += dragVPitch * dt;
      dragVYaw *= Math.exp(-dt * 2.2);
      dragVPitch *= Math.exp(-dt * 2.2);
      dragYaw *= Math.exp(-dt * 0.5);
      dragPitch *= Math.exp(-dt * 1.2);
    }
    const ty = Math.sin(time * 0.35) * 0.22 + hoverX * 0.45 + dragYaw;
    const tp = Math.sin(time * 0.27) * 0.08 + hoverY * 0.25 + dragPitch;
    yaw += (ty - yaw) * (1 - Math.exp(-dt * 4));
    pitch += (tp - pitch) * (1 - Math.exp(-dt * 4));
    updateModel();

    const [cx, cy] = toWorld(px, py);
    const radius = 2.8 * scale;
    const cvx = pvx / ppu, cvy = -pvy / ppu;
    pvx *= Math.exp(-dt * 10);
    pvy *= Math.exp(-dt * 10);
    const k = 55, c = 9, kr = 32, cr = 7.5;
    const ease = 1 - Math.exp(-dt * 7);

    for (let i = 0; i < N; i++) {
      if (follow[i] !== current && time >= switchAt + delay[i]) follow[i] = current;
      targetFor(i, follow[i], time, tgt);
      const o = i * 3;

      // pointer: push blocks away from the cursor and drag them along its motion
      if (pointerIn) {
        const [bx, by] = project(i);
        const dx = bx - cx, dy = by - cy;
        const d = Math.hypot(dx, dy);
        if (d < radius) {
          const f = (1 - d / radius) ** 2;
          const inv = 1 / (d || 1);
          const push = 140 * f * dt;
          toLocal(dx * inv * push + cvx * f * dt * 9, dy * inv * push + cvy * f * dt * 9, push * 0.7, tmp);
          vel[o] += tmp[0]; vel[o + 1] += tmp[1]; vel[o + 2] += tmp[2];
          avel[o] += (dy * inv) * 40 * f * dt;
          avel[o + 1] += (dx * inv) * 40 * f * dt;
        }
      }

      for (let a = 0; a < 3; a++) {
        const acc = (tgt[a] - pos[o + a]) * k - vel[o + a] * c;
        vel[o + a] += acc * dt;
        pos[o + a] += vel[o + a] * dt;

        let dr = tgt[3 + a] - rot[o + a];
        dr = Math.atan2(Math.sin(dr), Math.cos(dr));
        avel[o + a] += (dr * kr - avel[o + a] * cr) * dt;
        rot[o + a] += avel[o + a] * dt;

        scl[o + a] += (tgt[6 + a] - scl[o + a]) * ease;
        col[o + a] += (tgt[9 + a] - col[o + a]) * ease;
      }
    }
  };

  const settle = () => {
    // Reduced motion: place every block exactly on the website, no movement.
    for (let i = 0; i < N; i++) {
      targetFor(i, 0, 0, tgt);
      pos.set(tgt.subarray(0, 3), i * 3);
      rot.set(tgt.subarray(3, 6), i * 3);
      scl.set(tgt.subarray(6, 9), i * 3);
      col.set(tgt.subarray(9, 12), i * 3);
    }
    yaw = -0.18;
    pitch = 0.05;
    updateModel();
  };

  const draw = () => {
    for (let i = 0; i < N; i++) {
      const o = i * 12, s = i * 3;
      inst[o] = pos[s]; inst[o + 1] = pos[s + 1]; inst[o + 2] = pos[s + 2];
      inst[o + 3] = rot[s]; inst[o + 4] = rot[s + 1]; inst[o + 5] = rot[s + 2];
      inst[o + 6] = scl[s]; inst[o + 7] = scl[s + 1]; inst[o + 8] = scl[s + 2];
      inst[o + 9] = col[s]; inst[o + 10] = col[s + 1]; inst[o + 11] = col[s + 2];
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, instBuf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, inst);
    gl.uniformMatrix4fv(uModel, false, model);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElementsInstanced(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0, N);
  };

  layout();

  if (reduced) {
    settle();
    draw();
    new ResizeObserver(() => {
      layout();
      updateModel();
      draw();
    }).observe(hero);
    return true;
  }

  // ---- input ----
  let dragging = false;
  let downX = 0;
  let downY = 0;
  let moved = 0;
  let lastX = 0;
  let lastY = 0;
  let canDrag = false;

  const local = (e: PointerEvent) => {
    const r = hero.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };
  const interactive = (t: EventTarget | null) => t instanceof Element && !!t.closest('a, button, input, textarea, select, label');

  hero.addEventListener('pointermove', (e) => {
    const [x, y] = local(e);
    if (pointerIn) {
      pvx = pvx * 0.6 + (x - px) * 0.4 * 60;
      pvy = pvy * 0.6 + (y - py) * 0.4 * 60;
    }
    px = x;
    py = y;
    pointerIn = true;
    hoverX = x / W - 0.5;
    hoverY = y / H - 0.5;
    if (dragging) {
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      moved += Math.abs(dx) + Math.abs(dy);
      if (canDrag) {
        dragYaw += dx * 0.006;
        dragPitch = Math.max(-0.7, Math.min(0.7, dragPitch + dy * 0.004));
        dragVYaw = dx * 0.006 * 60;
        dragVPitch = dy * 0.004 * 60;
      }
      lastX = e.clientX;
      lastY = e.clientY;
    }
  });
  hero.addEventListener('pointerleave', () => {
    pointerIn = false;
    hoverX = hoverY = 0;
  });
  hero.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || interactive(e.target)) return;
    dragging = true;
    // Drag-to-spin only outside the text (so the headline stays selectable) and only with a mouse/pen.
    canDrag = e.pointerType !== 'touch' && !copy.contains(e.target as Node);
    downX = lastX = e.clientX;
    downY = lastY = e.clientY;
    moved = 0;
    if (canDrag) hero.setPointerCapture(e.pointerId);
  });
  const end = (e: PointerEvent) => {
    if (!dragging) return;
    dragging = false;
    const selected = String(getSelection() || '').length > 0;
    if (moved < 8 && Math.hypot(e.clientX - downX, e.clientY - downY) < 8 && !selected) {
      const [x, y] = local(e);
      explode(x, y);
    }
  };
  hero.addEventListener('pointerup', end);
  hero.addEventListener('pointercancel', () => {
    dragging = false;
  });

  // ---- loop, paused when off screen or the tab is hidden ----
  let visible = true;
  let raf = 0;
  let last = 0;
  const frame = (now: number) => {
    raf = 0;
    const dt = last ? Math.min(0.033, (now - last) / 1000) : 0.016;
    last = now;
    // two half-steps keep the springs stable on slow frames
    step(dt / 2);
    step(dt / 2);
    draw();
    if (visible && !document.hidden) raf = requestAnimationFrame(frame);
  };
  const resume = () => {
    if (!raf && visible && !document.hidden) {
      last = 0;
      raf = requestAnimationFrame(frame);
    }
  };
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    resume();
  }).observe(hero);
  document.addEventListener('visibilitychange', resume);
  new ResizeObserver(layout).observe(hero);

  resume();
  return true;
}
