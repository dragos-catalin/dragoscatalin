"""Outline the "Dragoș Cătălin" wordmarks and monogram glyphs to SVG path data.

    python wordmark.py            -> writes build/glyphs.json

Each wordmark is shaped with HarfBuzz (real GPOS kerning) from a variable-font instance, then
re-spaced with a per-concept tracking value. Where a concept owns the comma-below, the text is
shaped with a plain "s" and the anchor of that "s" is exported so build.mjs can draw the
concept's own comma (lettering, not typing). Coordinates: baseline y = 0, y grows DOWN,
scaled so the cap height = 100 units.
"""
from __future__ import annotations

import io
import json
from pathlib import Path

import uharfbuzz as hb
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

HERE = Path(__file__).parent
FONTS = HERE / "fonts"
OUT = HERE / "build"

WORDMARKS = {
    # id: (font file, axis location, text, tracking in em, own comma?)
    "a": ("MartianMono[wdth,wght].ttf", {"wght": 560, "wdth": 87.5}, "Dragoș Cătălin", 0.0, False),
    "b": ("InstrumentSerif-Regular.ttf", {}, "Dragos Cătălin", -0.01, True),
    "c": ("Fraunces[SOFT,WONK,opsz,wght].ttf", {"wght": 620, "opsz": 72, "SOFT": 100, "WONK": 1}, "Dragoș Cătălin", -0.012, False),
    "d": ("SpaceMono-Bold.ttf", {}, "DRAGOȘ CĂTĂLIN", 0.02, False),
    "e": ("BricolageGrotesque[opsz,wdth,wght].ttf", {"wght": 720, "opsz": 96, "wdth": 88}, "Dragos Cătălin", -0.025, True),
}

GLYPHS = {
    # monogram source glyphs for concept B (editorial ligature)
    "b_D": ("InstrumentSerif-Regular.ttf", {}, "D"),
    "b_C": ("InstrumentSerif-Italic.ttf", {}, "C"),
}


def load_instance(name: str, loc: dict) -> tuple[TTFont, bytes]:
    font = TTFont(str(FONTS / name))
    if loc and "fvar" in font:
        font = instantiateVariableFont(font, loc, inplace=False)
    buf = io.BytesIO()
    font.save(buf)
    data = buf.getvalue()
    return TTFont(io.BytesIO(data)), data


def cap_height(font: TTFont) -> float:
    os2 = font["OS/2"]
    ch = getattr(os2, "sCapHeight", 0) or 0
    if ch <= 0:
        gs = font.getGlyphSet()
        bp = BoundsPen(gs)
        gs["H"].draw(bp)
        ch = bp.bounds[3]
    return float(ch)


def outline(text: str, font: TTFont, data: bytes, tracking_em: float) -> dict:
    upem = font["head"].unitsPerEm
    scale = 100.0 / cap_height(font)
    face = hb.Face(data)
    hbfont = hb.Font(face)
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(hbfont, buf, {"kern": True, "liga": True})
    order = font.getGlyphOrder()
    gs = font.getGlyphSet()
    x = 0.0
    parts: list[str] = []
    anchors: list[dict] = []
    track = tracking_em * upem
    minx, miny, maxx, maxy = 1e9, 1e9, -1e9, -1e9
    for i, (info, pos) in enumerate(zip(buf.glyph_infos, buf.glyph_positions)):
        gname = order[info.codepoint]
        ch = text[info.cluster]
        pen = SVGPathPen(gs)
        ox, oy = x + pos.x_offset, pos.y_offset
        tp = TransformPen(pen, (scale, 0, 0, -scale, ox * scale, -oy * scale))
        gs[gname].draw(tp)
        d = pen.getCommands()
        if d:
            parts.append(d)
        bp = BoundsPen(gs)
        gs[gname].draw(bp)
        if bp.bounds:
            b0, b1, b2, b3 = bp.bounds
            minx = min(minx, (ox + b0) * scale)
            maxx = max(maxx, (ox + b2) * scale)
            miny = min(miny, -(oy + b3) * scale)
            maxy = max(maxy, -(oy + b1) * scale)
        if ch == "s" and bp.bounds:
            anchors.append({
                "char": "s",
                "x0": (ox + bp.bounds[0]) * scale,
                "x1": (ox + bp.bounds[2]) * scale,
                "top": -(oy + bp.bounds[3]) * scale,
            })
        x += pos.x_advance + (track if i < len(buf.glyph_infos) - 1 else 0)
    return {
        "d": " ".join(parts),
        "advance": x * scale,
        "bounds": [minx, miny, maxx, maxy],
        "xHeight": float(getattr(font["OS/2"], "sxHeight", 0) or 0) * scale,
        "anchors": anchors,
    }


def main() -> None:
    OUT.mkdir(exist_ok=True)
    result: dict = {"wordmarks": {}, "glyphs": {}}
    for key, (fname, loc, text, track, own_comma) in WORDMARKS.items():
        font, data = load_instance(fname, loc)
        o = outline(text, font, data, track)
        o.update({"font": fname, "axes": loc, "text": text, "ownComma": own_comma})
        result["wordmarks"][key] = o
    for key, (fname, loc, text) in GLYPHS.items():
        font, data = load_instance(fname, loc)
        result["glyphs"][key] = outline(text, font, data, 0.0)
    (OUT / "glyphs.json").write_text(json.dumps(result, indent=1), encoding="utf-8")
    for k, v in result["wordmarks"].items():
        print(k, v["font"], "advance", round(v["advance"], 1), "bounds", [round(b, 1) for b in v["bounds"]], "anchors", v["anchors"])
    for k, v in result["glyphs"].items():
        print(k, "bounds", [round(b, 1) for b in v["bounds"]])


if __name__ == "__main__":
    main()
