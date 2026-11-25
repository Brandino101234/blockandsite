import sys, io
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
import uharfbuzz as hb

"""Regenerates public/brand logo SVGs with the wordmark outlined from Outfit 700.
Usage: python tools/make-logo.py public/fonts/outfit.woff2 public/brand   (needs: pip install fonttools brotli uharfbuzz)
"""
src, out = sys.argv[1], sys.argv[2]
font = TTFont(src)
inst = instantiateVariableFont(font, {"wght": 700})
buf = io.BytesIO(); inst.flavor=None; inst.save(buf); data = buf.getvalue()
upm = inst['head'].unitsPerEm
cap = inst['OS/2'].sCapHeight
gs = inst.getGlyphSet()

face = hb.Face(data); hbfont = hb.Font(face)
b = hb.Buffer(); b.add_str("Block and Site"); b.guess_segment_properties()
hb.shape(hbfont, b, {"kern": True, "liga": True})
order = inst.getGlyphOrder()

FS = 30.0              # font size in logo units (mark is 48 tall)
scale = FS / upm
track = -0.02 * upm    # -0.02em letter-spacing
GAP = 12
x0 = 48 + GAP
baseline = 24 + (cap * scale) / 2   # center cap height on the mark

pen = SVGPathPen(gs)
x = 0
for info, pos in zip(b.glyph_infos, b.glyph_positions):
    name = order[info.codepoint]
    # glyph space -> logo space: flip y, scale, translate
    tp = TransformPen(pen, (scale, 0, 0, -scale, x0 + (x + pos.x_offset) * scale, baseline - pos.y_offset * scale))
    gs[name].draw(tp)
    x += pos.x_advance + track
text_w = (x - track) * scale
W = round(x0 + text_w + 1, 2)
text_d = pen.getCommands()

B,R,Y = '#43A4F4','#F4434C','#F4EB43'
mark = f'''<rect x="2" y="2" width="30" height="30" rx="5" fill="{B}"/><rect x="16" y="16" width="30" height="30" rx="5" fill="{Y}"/><path d="M21 16H32V27A5 5 0 0 1 27 32H16V21A5 5 0 0 1 21 16Z" fill="{R}"/>'''

def svg(w,h,body,title): return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w*4}" height="{h*4}" role="img" aria-label="{title}"><title>{title}</title>{body}</svg>\n'
files = {
 'mark.svg': svg(48,48,mark,'Block and Site'),
 'logo-on-dark.svg': svg(W,48,mark+f'<path d="{text_d}" fill="#FFFFFF"/>','Block and Site'),
 'logo-on-light.svg': svg(W,48,mark+f'<path d="{text_d}" fill="#000000"/>','Block and Site'),
 'app-icon.svg': f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="512" height="512"><title>Block and Site</title><rect width="64" height="64" rx="14" fill="#000000"/><g transform="translate(8 8)">{mark}</g></svg>\n',
}
for n,c in files.items(): open(f'{out}/{n}','w').write(c)
print('width', W, 'cap', cap, 'upm', upm)
