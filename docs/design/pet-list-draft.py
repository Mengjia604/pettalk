from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
IMAGES = os.path.join(ROOT, "frontend", "images")
OUT = os.path.join(ROOT, "docs", "design", "pet-list-draft.png")

REGULAR = "C:/Windows/Fonts/msyh.ttc"
BOLD = "C:/Windows/Fonts/msyhbd.ttc"


def font(size, bold=False):
    return ImageFont.truetype(BOLD if bold else REGULAR, size)


def text(draw, xy, value, size, color, bold=False, anchor="la"):
    draw.text(xy, value, font=font(size, bold), fill=color, anchor=anchor)


def rounded(draw, box, radius, fill):
    draw.rounded_rectangle(box, radius=radius, fill=fill)


def gradient_circle(size, top, bottom):
    grad = Image.new("RGB", (size, size), top)
    gd = ImageDraw.Draw(grad)
    for y in range(size):
        t = y / max(size - 1, 1)
        color = tuple(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3))
        gd.line([(0, y), (size, y)], fill=color)
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).ellipse([0, 0, size - 1, size - 1], fill=255)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(grad, (0, 0), mask)
    return out


def paste_contain(base, path, box, opacity=255):
    img = Image.open(path).convert("RGBA")
    target_w, target_h = box[2] - box[0], box[3] - box[1]
    ratio = min(target_w / img.width, target_h / img.height)
    size = (max(1, int(img.width * ratio)), max(1, int(img.height * ratio)))
    img = img.resize(size, Image.LANCZOS)
    if opacity < 255:
        alpha = img.getchannel("A").point(lambda a: a * opacity // 255)
        img.putalpha(alpha)
    x = box[0] + (target_w - size[0]) // 2
    y = box[1] + (target_h - size[1]) // 2
    base.alpha_composite(img, (x, y))


def draw_header(draw, title="\u5ba0\u7269\u6863\u6848"):
    rounded(draw, [0, 0, 619, 210], 44, "#0E0F12")
    draw.rectangle([0, 90, 619, 210], fill="#0E0F12")
    text(draw, (34, 30), "9:41", 22, "#FFFFFF", True)
    draw.rounded_rectangle([548, 34, 574, 48], radius=7, outline="#FFFFFF", width=2)
    draw.rounded_rectangle([578, 37, 584, 45], radius=2, fill="#FFFFFF")
    draw.rounded_rectangle([522, 32, 540, 50], radius=4, outline="#FFFFFF", width=2)
    text(draw, (34, 128), "\u2039", 40, "#FFFFFF", False, "lm")
    text(draw, (310, 128), title, 32, "#FFFFFF", True, "mm")


def draw_pet_card(img, draw, y, name, breed, birthday):
    left, width, height = 30, 560, 190
    draw.rounded_rectangle([left, y + 7, left + width, y + 7 + height], radius=26, fill="#DDE3EA")
    rounded(draw, [left, y, left + width, y + height], 26, "#FFFFFF")
    draw.ellipse([left + 26, y + 36, left + 144, y + 154], fill="#FFF0E1")
    paste_contain(img, os.path.join(IMAGES, "paw.png"), [left + 50, y + 60, left + 120, y + 130], 235)
    text(draw, (left + 172, y + 32), name, 32, "#1F2329", True)
    pill = [left + 172, y + 80, left + 172 + 34 + len(breed) * 22, y + 118]
    rounded(draw, pill, 19, "#FFF1E4")
    text(draw, ((pill[0] + pill[2]) // 2, (pill[1] + pill[3]) // 2), breed, 20, "#F7780A", True, "mm")
    text(draw, (left + 172, y + 134), "\u751f\u65e5 " + birthday, 21, "#9AA1AB")
    text(draw, (left + 532, y + 82), "\u203a", 40, "#C4CAD1", False, "mm")


def draw_fab(img, draw, cx=524, cy=1180):
    draw.ellipse([cx - 53, cy - 45, cx + 53, cy + 61], fill="#C9D0D8")
    fab = gradient_circle(104, (255, 172, 86), (252, 88, 96))
    img.alpha_composite(fab, (cx - 52, cy - 52))
    draw.rounded_rectangle([cx - 21, cy - 4, cx + 21, cy + 4], radius=4, fill="#FFFFFF")
    draw.rounded_rectangle([cx - 4, cy - 21, cx + 4, cy + 21], radius=4, fill="#FFFFFF")


def new_phone():
    return Image.new("RGBA", (620, 1320), (0, 0, 0, 0))


def finish_phone(phone):
    mask = Image.new("L", (620, 1320), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, 619, 1319], radius=44, fill=255)
    phone.putalpha(mask)
    ImageDraw.Draw(phone).rounded_rectangle([0, 0, 619, 1319], radius=44, outline="#C9D0D8", width=2)
    return phone


def build_list_phone():
    img = new_phone()
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle([0, 0, 619, 1319], radius=44, fill="#F4F6F8")
    draw_header(draw)
    text(draw, (30, 236), "\u6211\u7684\u5ba0\u7269", 26, "#303540", True)
    text(draw, (590, 240), "\u5171 3 \u53ea", 21, "#9AA1AB", False, "ra")
    draw_pet_card(img, draw, 282, "\u8c46\u8c46", "\u67ef\u57fa", "2023-05-01")
    draw_pet_card(img, draw, 494, "\u54aa\u54aa", "\u82f1\u77ed", "2022-11-18")
    draw_pet_card(img, draw, 706, "\u56e2\u5b50", "\u91d1\u6bdb", "2024-03-09")
    text(draw, (310, 1060), "\u70b9\u51fb\u5361\u7247\u53ef\u67e5\u770b\u6216\u7f16\u8f91\u5ba0\u7269", 20, "#A3A9B2", False, "mm")
    draw_fab(img, draw)
    return finish_phone(img)


def build_empty_phone():
    img = new_phone()
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle([0, 0, 619, 1319], radius=44, fill="#F4F6F8")
    draw_header(draw)
    draw.ellipse([198, 426, 422, 650], fill="#FFF0E1")
    paste_contain(img, os.path.join(IMAGES, "paw.png"), [252, 480, 368, 596], 235)
    text(draw, (310, 686), "\u6863\u6848\u4e3a\u7a7a~", 30, "#303540", True, "mm")
    text(draw, (310, 750), "\u70b9\u51fb\u53f3\u4e0b\u89d2\u6309\u94ae", 23, "#9AA1AB", False, "mm")
    text(draw, (310, 790), "\u6dfb\u52a0\u6211\u7684\u7b2c\u4e00\u53ea\u5b9d\u8d1d", 23, "#9AA1AB", False, "mm")
    draw_fab(img, draw)
    return finish_phone(img)


def main():
    canvas = Image.new("RGBA", (1560, 1520), "#E9EDF2")
    draw = ImageDraw.Draw(canvas)
    text(draw, (100, 62), "\u2460 \u6709\u5ba0\u7269\u65f6", 28, "#344054", True)
    text(draw, (840, 62), "\u2461 \u65e0\u5ba0\u7269\u65f6", 28, "#344054", True)

    for phone, x in ((build_list_phone(), 100), (build_empty_phone(), 840)):
        shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
        sd = ImageDraw.Draw(shadow)
        sd.rounded_rectangle([x, 120, x + 620, 1440], radius=48, fill=(31, 43, 61, 70))
        shadow = shadow.filter(ImageFilter.GaussianBlur(18))
        canvas.alpha_composite(shadow)
        canvas.alpha_composite(phone, (x, 120))

    canvas.convert("RGB").save(OUT, quality=95)
    print(OUT)


if __name__ == "__main__":
    main()
