"""
scissors.png をブラウザ用カーソルサイズ（128×128）に縮小して出力する。
CSS のホットスポットは ThinningPrototypePage の SCISSORS_CURSOR_HOTSPOT と合わせること。
"""
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    raise SystemExit("pip install Pillow が必要です") from None

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public" / "assets" / "ui" / "thinning" / "scissors.png"
OUT = ROOT / "public" / "assets" / "ui" / "thinning" / "scissors-cursor-128.png"
SIZE = 128


def main() -> None:
    if not SRC.is_file():
        raise SystemExit(f"見つかりません: {SRC}")
    im = Image.open(SRC).convert("RGBA")
    im = im.resize((SIZE, SIZE), Image.Resampling.LANCZOS)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    im.save(OUT, optimize=True)
    print(f"書き出し: {OUT} ({SIZE}×{SIZE})")


if __name__ == "__main__":
    main()
