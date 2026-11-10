from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT = os.path.join(ROOT, "docs", "design", "profile-cute-draft.png")
IMAGES = os.path.join(ROOT, "frontend", "images")

REGULAR = "C:/Windows/Fonts/msyh.ttc"
BOLD = "C:/Windows/Fonts/msyhbd.ttc"

PALETTES = [
    {
        "label": "A 蜜桃奶糖（推荐）",
        "nav": "#FFF3F0",
        "header": ((255, 228, 232), (255, 241, 217)),
        "bubble": "#FFF0EC",
        "avatar": "#E88495",
        "text": "#4A3438",
        "secondary": "#8B6F75",
        "accent": "#EF8298",
        "card": "#FFF7F5",
        "icon": "#FFE3E7",
        "meta": "#A58D93",
        "soft_pill": "#FFF1F3",
        "soft_text": "#8B6F75"
    },
    {
        "label": "B 奶油草莓",
        "nav": "#FFF2F7",
        "header": ((255, 235, 244), (255, 246, 232)),
        "bubble": "#FFF0F8",
        "avatar": "#A78BD9",
        "text": "#443548",
        "secondary": "#8C7A92",
        "accent": "#E58FB3",
        "card": "#FFF7FB",
        "icon": "#FBE4F1",
        "meta": "#A894A4",
        "soft_pill": "#FCEFF7",
        "soft_text": "#8C7A92"
    },
    {
        "label": "C 薄荷布丁",
        "nav": "#F0FBF7",
        "header": ((226, 247, 240), (255, 249, 226)),
        "bubble": "#EDFAF3",
        "avatar": "#5FBFA1",
        "text": "#314A42",
        "secondary": "#6F8A80",
        "accent": "#5FBFA1",
        "card": "#F4FCF8",
        "icon": "#DDF4EC",
        "meta": "#8AA79C",
        "soft_pill": "#EAF8F2",
        "soft_text": "#5F7C71"
    }
]


def font(size, bold=False):
    return ImageFont.truetype(BOLD if bold else REGULAR, size)


def text(draw, xy, value, size, color, bold=False, anchor="la"):
    draw.text(xy, value, font=font(size, bold), fill=color, anchor=anchor)


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


def draw_nav(draw, palette):
    draw.rounded_rectangle([0, 0, 619, 210], radius=44, fill=palette["nav"])
    draw.rectangle([0, 90, 619, 210], fill=palette["nav"])
    text(draw, (34, 30), "9:41", 22, palette["text"], True)
    draw.rounded_rectangle([548, 34, 574, 48], radius=7, outline=palette["text"], width=2)
    draw.rounded_rectangle([578, 37, 584, 45], radius=2, fill=palette["text"])
    draw.rounded_rectangle([522, 32, 540, 50], radius=4, outline=palette["text"], width=2)
    text(draw, (310, 128), "我的", 30, palette["text"], True, "mm")


def draw_header(img, draw, palette):
    top, bottom = palette["header"]
    grad = Image.new("RGB", (620, 440), top)
    gd = ImageDraw.Draw(grad)
    for y in range(440):
        t = y / 439
        color = tuple(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3))
        gd.line([(0, y), (620, y)], fill=color)
    mask = Image.new("L", (620, 440), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, 619, 439], radius=40, fill=255)
    header = Image.new("RGBA", (620, 440), (0, 0, 0, 0))
    header.paste(grad, (0, 0), mask)
    img.alpha_composite(header, (0, 210))

    draw.ellipse([470, 220, 700, 450], fill=palette["bubble"])
    draw.ellipse([-60, 520, 120, 700], fill=palette["bubble"])
    paste_contain(img, os.path.join(IMAGES, "paw.png"), [502, 250, 566, 314], 55)

    draw.ellipse([250, 258, 370, 378], fill=palette["avatar"], outline="#FFFFFF", width=5)
    text(draw, (310, 318), "宠", 42, "#FFFFFF", True, "mm")
    text(draw, (310, 402), "小宠日记", 34, palette["text"], True, "mm")
    text(draw, (310, 448), "和毛孩子一起长大", 21, palette["secondary"], False, "mm")

    stats = [("12", "关注"), ("86", "粉丝"), ("24", "动态")]
    for index, (number, label) in enumerate(stats):
        cx = 130 + index * 180
        text(draw, (cx, 515), number, 32, palette["text"], True, "mm")
        text(draw, (cx, 565), label, 21, palette["secondary"], False, "mm")


def draw_channel_card(img, draw, x, name, members, palette):
    draw.rounded_rectangle([x, 720, x + 180, 840], radius=22, fill=palette["card"])
    draw.ellipse([x + 14, 746, x + 66, 798], fill=palette["icon"])
    paste_contain(img, os.path.join(IMAGES, "paw.png"), [x + 27, 759, x + 53, 785], 235)
    text(draw, (x + 78, 744), name, 24, palette["text"], True)
    text(draw, (x + 78, 782), members, 19, palette["meta"])


def draw_tabs(draw, palette):
    draw.rectangle([0, 900, 619, 975], fill="#FFFFFF")
    draw.line([0, 900, 619, 900], fill="#F7EEF0", width=1)
    text(draw, (30, 920), "我的动态", 28, palette["accent"], True)
    draw.rounded_rectangle([28, 962, 138, 968], radius=3, fill=palette["accent"])
    draw.rounded_rectangle([398, 916, 500, 962], radius=23, fill=palette["soft_pill"])
    text(draw, (449, 939), "宠物档案", 20, palette["soft_text"], False, "mm")
    draw.rounded_rectangle([512, 916, 610, 962], radius=23, fill=palette["accent"])
    text(draw, (561, 939), "发布动态", 20, "#FFFFFF", True, "mm")


def draw_feed(draw):
    draw.rounded_rectangle([20, 992, 600, 1182], radius=20, fill="#FFFFFF")
    draw.ellipse([40, 1014, 96, 1070], fill="#F1E9EC")
    text(draw, (42, 1032), "小", 22, "#FFFFFF", True)
    text(draw, (112, 1020), "小宠日记", 25, "#333333", True)
    text(draw, (112, 1054), "刚刚 · #猫咪频道", 19, "#B0B0B0")
    draw.rounded_rectangle([40, 1092, 560, 1112], radius=10, fill="#F5F1F3")
    draw.rounded_rectangle([40, 1128, 470, 1148], radius=10, fill="#F5F1F3")


def draw_tabbar(draw, palette):
    draw.rectangle([0, 1200, 619, 1319], fill="#FFFFFF")
    draw.line([0, 1200, 619, 1200], fill="#F5EEF0", width=1)
    items = [("首页", "#A7ADB5"), ("发布+", "#A7ADB5"), ("我的", palette["accent"])]
    for index, (label, color) in enumerate(items):
        cx = 110 + index * 200
        draw.ellipse([cx - 10, 1236, cx + 10, 1256], fill=color)
        text(draw, (cx, 1276), label, 19, color, index == 2, "mm")


def new_phone():
    return Image.new("RGBA", (620, 1320), (0, 0, 0, 0))


def finish_phone(phone):
    mask = Image.new("L", (620, 1320), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, 619, 1319], radius=44, fill=255)
    phone.putalpha(mask)
    ImageDraw.Draw(phone).rounded_rectangle([0, 0, 619, 1319], radius=44, outline="#C9D0D8", width=2)
    return phone


def build_phone(palette):
    img = new_phone()
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle([0, 0, 619, 1319], radius=44, fill="#F7F5F6")
    draw_nav(draw, palette)
    draw_header(img, draw, palette)
    draw.rectangle([0, 650, 619, 900], fill="#FFFFFF")
    text(draw, (30, 672), "加入的频道", 26, palette["text"], True)
    text(draw, (590, 678), "共 3 个", 20, palette["meta"], False, "ra")
    draw_channel_card(img, draw, 30, "猫咪", "128 成员", palette)
    draw_channel_card(img, draw, 226, "狗狗", "96 成员", palette)
    draw_channel_card(img, draw, 422, "小宠", "42 成员", palette)
    draw_tabs(draw, palette)
    draw_feed(draw)
    draw_tabbar(draw, palette)
    return finish_phone(img)


def main():
    canvas = Image.new("RGBA", (2060, 1520), "#E9EDF2")
    draw = ImageDraw.Draw(canvas)
    positions = [50, 720, 1390]
    for index, palette in enumerate(PALETTES):
        x = positions[index]
        text(draw, (x, 62), palette["label"], 28, "#344054", True)
        phone = build_phone(palette)
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
