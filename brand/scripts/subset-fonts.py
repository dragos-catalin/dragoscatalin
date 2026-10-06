"""Subset Bricolage Grotesque for dragoscatalin.ro (brand Keystone, V3-02).

    python brand/scripts/subset-fonts.py <BricolageGrotesque[opsz,wdth,wght].ttf>

Writes:
    src/fonts/bricolage-display.woff2   variable: wght 700-800 (the only display weights used: 700
                                                                            section headings, 720 wordmark, 800 h1), opsz pinned at 96
                                                                            and wdth at 88 = the wordmark cut (next/font/local)
  src/assets/og/bricolage-720.ttf     static wght 720 / opsz 96 / wdth 88 (OG titles; satori needs TTF)
  src/assets/og/bricolage-500.ttf     static wght 500 / opsz 24 / wdth 100 (OG body lines)

Unicode: Basic Latin, Latin-1, Latin Extended-A, the four comma-below letters (U+0218-021B),
typographic punctuation, euro, trade mark, minus. Source: upstream OFL file from google/fonts
(brand/concepts/src/fetch-fonts.ps1). Run check-glyphs.py --union on the outputs afterwards.
"""
from __future__ import annotations

import io
import sys
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parents[2]
UNICODES = (
    list(range(0x20, 0x7F))
    + list(range(0xA0, 0x100))
    + list(range(0x100, 0x180))
    + list(range(0x218, 0x21C))
    + [0x2C6, 0x2DA, 0x2DC, 0x2013, 0x2014, 0x2018, 0x2019, 0x201A, 0x201C, 0x201D, 0x201E]
    + [0x2022, 0x2026, 0x2030, 0x2039, 0x203A, 0x20AC, 0x2122, 0x2192, 0x2212]
)


def make(src: Path, axes: dict, out: Path, flavor: str | None) -> None:
    font = TTFont(str(src))
    font = instantiateVariableFont(font, axes, inplace=False)
    opts = subset.Options()
    opts.layout_features = ["*"]
    opts.name_IDs = ["*"]
    opts.name_languages = ["*"]
    opts.notdef_outline = True
    opts.flavor = flavor
    opts.desubroutinize = True
    sub = subset.Subsetter(opts)
    sub.populate(unicodes=UNICODES)
    sub.subset(font)
    out.parent.mkdir(parents=True, exist_ok=True)
    buf = io.BytesIO()
    font.flavor = flavor
    font.save(buf)
    out.write_bytes(buf.getvalue())
    print(f"{out.relative_to(ROOT)}  {len(buf.getvalue()) / 1024:.1f} KB  axes={axes}")


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    src = Path(sys.argv[1])
    make(src, {"wdth": 88, "wght": (700, 800), "opsz": 96},
         ROOT / "src/fonts/bricolage-display.woff2", "woff2")
    make(src, {"wdth": 88, "wght": 720, "opsz": 96}, ROOT / "src/assets/og/bricolage-720.ttf", None)
    make(src, {"wdth": 100, "wght": 500, "opsz": 24}, ROOT / "src/assets/og/bricolage-500.ttf", None)


if __name__ == "__main__":
    main()
