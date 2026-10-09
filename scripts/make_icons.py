"""Render the site's "SV" monogram favicon set into app/.

Writes app/favicon.ico (16, 32, 48 px), app/icon.png (512 px), and
app/apple-icon.png (180 px). Next.js serves these as the site icons.

Run: uv run --with pillow python3 scripts/make_icons.py
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

APP_DIR = Path(__file__).resolve().parent.parent / "app"
FONT_PATH = "/System/Library/Fonts/SFNSMono.ttf"
BACKGROUND = (10, 10, 10, 255)
FOREGROUND = (34, 211, 238, 255)  # matches the dark theme --primary (#22d3ee)
MASTER_SIZE = 1024


def render_master() -> Image.Image:
    image = Image.new("RGBA", (MASTER_SIZE, MASTER_SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle(
        (0, 0, MASTER_SIZE - 1, MASTER_SIZE - 1),
        radius=MASTER_SIZE // 5,
        fill=BACKGROUND,
    )
    font = ImageFont.truetype(FONT_PATH, size=int(MASTER_SIZE * 0.5))
    font.set_variation_by_name("Bold")
    left, top, right, bottom = draw.textbbox((0, 0), "SV", font=font)
    x = (MASTER_SIZE - (right - left)) / 2 - left
    y = (MASTER_SIZE - (bottom - top)) / 2 - top
    draw.text((x, y), "SV", font=font, fill=FOREGROUND)
    return image


def main() -> None:
    master = render_master()
    master.resize((512, 512), Image.LANCZOS).save(APP_DIR / "icon.png", optimize=True)
    # Apple touch icons are shown without transparency, so flatten onto the background.
    apple = Image.new("RGBA", (180, 180), BACKGROUND)
    apple.alpha_composite(master.resize((180, 180), Image.LANCZOS))
    apple.convert("RGB").save(APP_DIR / "apple-icon.png", optimize=True)
    master.save(APP_DIR / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
    for name in ("icon.png", "apple-icon.png", "favicon.ico"):
        print(f"{name}: {(APP_DIR / name).stat().st_size} bytes")


if __name__ == "__main__":
    main()
