from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT = os.path.join(ROOT, "docs", "design", "profile-channels-draft.png")
IMAGES = os.path.join(ROOT, "frontend", "images")

REGULAR = "C:/Windows/Fonts/msyh.ttc"
BOLD = "C:/Windows/Fonts/msyhbd.ttc"


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


def draw_nav(draw):
    draw.rounded_rectangle([0, 0, 619, 210], radius=44, fill="#0E0F12")
    draw.rectangle([0, 90, 619, 210], fill="#0E0F12")
    text(draw, (34, 30), "9:41", 22, "#FFFFFF", True)
    draw.rounded_rectangle([548, 34, 574, 48], radius=7, outline="#FFFFFF", width=2)
    draw.rounded_rectangle([578, 37, 584, 45], radius=2, fill="#FFFFFF")
    draw.rounded_rectangle([522, 32, 540, 50], radius=4, outline="#FFFFFF", width=2)
    text(draw, (310, 128), "PetTalk", 30, "#FFFFFF", True, "mm")


def draw_header(img, draw):
    grad = Image.new("RGB", (620, 440), "#F7780A")
    gd = ImageDraw.Draw(grad)
    for y in range(440):
        t = y / 439
        color = (
            int(247 + (255 - 247) * t),
            int(120 + (195 - 120) * t),
            int(10 + (30 - 10) * t)
        )
        gd.line([(0, y), (620, y)], fill=color)
    mask = Image.new("L", (620, 440), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, 619, 439], radius=40, fill=255)
    header = Image.new("RGBA", (620, 440), (0, 0, 0, 0))
    header.paste(grad, (0, 0), mask)
    img.alpha_composite(header, (0, 210))

    draw.ellipse([250, 258, 370, 378], fill="#9FACE6", outline="#FFFFFF", width=5)
    text(draw, (310, 318), "宠", 42, "#FFFFFF", True, "mm")
    text(draw, (310, 402), "小宠日记", 34, "#FFFFFF", True, "mm")
    text(draw, (310, 448), "和毛孩子一起长大", 21, "#FFF3E6", False, "mm")

    stats = [("12", "关注"), ("86", "粉丝"), ("24", "动态")]
    for index, (number, label) in enumerate(stats):
        cx = 130 + index * 180
        text(draw, (cx, 515), number, 32, "#FFFFFF", True, "mm")
        text(draw, (cx, 565), label, 21, "#FFF3E6", False, "mm")


def draw_channel_card(img, draw, x, name, members):
    draw.rounded_rectangle([x, 720, x + 180, 840], radius=18, fill="#F7F8FA")
    draw.ellipse([x + 14, 746, x + 66, 798], fill="#FFF1E4")
    paste_contain(img, os.path.join(IMAGES, "paw.png"), [x + 27, 759, x + 53, 785], 235)
    text(draw, (x + 78, 744), name, 24, "#1F2329", True)
    text(draw, (x + 78, 782), members, 19, "#9AA1AB")


def draw_section_title(draw):
    text(draw, (30, 672), "加入的频道", 26, "#1F2329", True)


def draw_tabs(draw):
    draw.rectangle([0, 900, 619, 975], fill="#FFFFFF")
    draw.line([0, 900, 619, 900], fill="#F0F1F3", width=1)
    text(draw, (30, 920), "我的动态", 28, "#4A90E2", True)
    draw.rounded_rectangle([28, 962, 138, 968], radius=3, fill="#4A90E2")
    draw.rounded_rectangle([398, 916, 500, 962], radius=23, fill="#F5F6F8")
    text(draw, (449, 939), "宠物档案", 20, "#666666", False, "mm")
    draw.rounded_rectangle([512, 916, 610, 962], radius=23, fill="#FC7A55")
    text(draw, (561, 939), "发布动态", 20, "#FFFFFF", True, "mm")


def draw_feed(draw):
    draw.rounded_rectangle([20, 992, 600, 1182], radius=16, fill="#FFFFFF")
    draw.ellipse([40, 1014, 96, 1070], fill="#E9EEF5")
    text(draw, (42, 1032), "小", 22, "#FFFFFF", True)
    text(draw, (112, 1020), "小宠日记", 25, "#333333", True)
    text(draw, (112, 1054), "刚刚 · #猫咪频道", 19, "#B0B0B0")
    draw.rounded_rectangle([40, 1092, 560, 1112], radius=10, fill="#F2F3F5")
    draw.rounded_rectangle([40, 1128, 470, 1148], radius=10, fill="#F2F3F5")


def draw_tabbar(draw):
    draw.rectangle([0, 1200, 619, 1319], fill="#FFFFFF")
    draw.line([0, 1200, 619, 1200], fill="#F0F1F3", width=1)
    items = [("首页", "#A7ADB5"), ("发布+", "#A7ADB5"), ("我的", "#F7780A")]
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


def build_filled_phone():
    img = new_phone()
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle([0, 0, 619, 1319], radius=44, fill="#F5F5F5")
    draw_nav(draw)
    draw_header(img, draw)
    draw.rectangle([0, 650, 619, 900], fill="#FFFFFF")
    draw_section_title(draw)
    text(draw, (590, 678), "共 3 个", 20, "#9AA1AB", False, "ra")
    draw_channel_card(img, draw, 30, "猫咪", "128 成员")
    draw_channel_card(img, draw, 226, "狗狗", "96 成员")
    draw_channel_card(img, draw, 422, "小宠", "42 成员")
    draw_tabs(draw)
    draw_feed(draw)
    draw_tabbar(draw)
    return finish_phone(img)


def build_empty_phone():
    img = new_phone()
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle([0, 0, 619, 1319], radius=44, fill="#F5F5F5")
    draw_nav(draw)
    draw_header(img, draw)
    draw.rectangle([0, 650, 619, 900], fill="#FFFFFF")
    draw_section_title(draw)
    text(draw, (30, 744), "还没有加入频道", 21, "#9AA1AB")
    draw.rounded_rectangle([462, 720, 590, 770], radius=25, fill="#FFF1E4")
    text(draw, (526, 745), "去逛逛 ›", 21, "#F7780A", True, "mm")
    draw_tabs(draw)
    draw_feed(draw)
    draw_tabbar(draw)
    return finish_phone(img)


def main():
    canvas = Image.new("RGBA", (1560, 1520), "#E9EDF2")
    draw = ImageDraw.Draw(canvas)
    text(draw, (100, 62), "① 有已加入频道", 28, "#344054", True)
    text(draw, (840, 62), "② 未加入频道（自己）", 28, "#344054", True)

    for phone, x in ((build_filled_phone(), 100), (build_empty_phone(), 840)):
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
