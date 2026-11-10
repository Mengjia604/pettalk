from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT = os.path.join(ROOT, "docs", "design", "profile-edit-draft.png")
IMAGES = os.path.join(ROOT, "frontend", "images")

REGULAR = "C:/Windows/Fonts/msyh.ttc"
BOLD = "C:/Windows/Fonts/msyhbd.ttc"

ACCENT = "#EF8298"
ACCENT_SOFT = "#FFF1F3"
TEXT = "#3F2E33"
SECONDARY = "#8B6F75"
META = "#A58D93"


def font(size, bold=False):
    return ImageFont.truetype(BOLD if bold else REGULAR, size)


def text(draw, xy, value, size, color, bold=False, anchor="la"):
    draw.text(xy, value, font=font(size, bold), fill=color, anchor=anchor)


def tinted_paw(path, color=(255, 255, 255), opacity=70):
    img = Image.open(path).convert("RGBA")
    solid = Image.new("RGBA", img.size, color + (255,))
    solid.putalpha(img.getchannel("A").point(lambda a: a * opacity // 255))
    return solid


def paste_image_contain(base, img, box):
    target_w, target_h = box[2] - box[0], box[3] - box[1]
    ratio = min(target_w / img.width, target_h / img.height)
    size = (max(1, int(img.width * ratio)), max(1, int(img.height * ratio)))
    img = img.resize(size, Image.LANCZOS)
    x = box[0] + (target_w - size[0]) // 2
    y = box[1] + (target_h - size[1]) // 2
    base.alpha_composite(img, (x, y))


def make_cover(size=(620, 520)):
    w, h = size
    cover = Image.new("RGBA", size, (0, 0, 0, 0))
    grad = Image.new("RGB", size, "#F6B6A6")
    gd = ImageDraw.Draw(grad)
    for y in range(h):
        t = y / max(h - 1, 1)
        top = (246, 182, 166)
        bottom = (255, 230, 203)
        color = tuple(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3))
        gd.line([(0, y), (w, y)], fill=color)
    mask = Image.new("L", size, 255)
    cover.paste(grad, (0, 0), mask)
    cd = ImageDraw.Draw(cover)
    cd.ellipse([410, -40, 760, 300], fill="#FFF1E9")
    cd.ellipse([-80, 360, 190, 630], fill="#FFD7C8")
    cd.ellipse([230, 250, 500, 520], fill="#FFE7D2")
    paste_image_contain(cover, tinted_paw(os.path.join(IMAGES, "paw.png"), opacity=60), [70, 120, 180, 230])
    paste_image_contain(cover, tinted_paw(os.path.join(IMAGES, "paw.png"), opacity=55), [480, 330, 570, 420])
    return cover


def draw_status(draw, color):
    text(draw, (34, 30), "9:41", 22, color, True)
    draw.rounded_rectangle([548, 34, 574, 48], radius=7, outline=color, width=2)
    draw.rounded_rectangle([578, 37, 584, 45], radius=2, fill=color)
    draw.rounded_rectangle([522, 32, 540, 50], radius=4, outline=color, width=2)


def draw_avatar(img, draw):
    draw.ellipse([44, 416, 204, 576], fill="#E88495", outline="#FFFFFF", width=7)
    text(draw, (124, 496), "宠", 46, "#FFFFFF", True, "mm")


def draw_channel_card(img, draw, x, name, members):
    draw.rounded_rectangle([x, 760, x + 180, 880], radius=22, fill="#FFF7F5")
    draw.ellipse([x + 14, 786, x + 66, 838], fill="#FFE3E7")
    paw = Image.open(os.path.join(IMAGES, "paw.png")).convert("RGBA")
    paste_image_contain(img, paw, [x + 27, 799, x + 53, 825])
    text(draw, (x + 78, 784), name, 24, TEXT, True)
    text(draw, (x + 78, 822), members, 19, META)


def draw_tabs(draw):
    draw.rectangle([0, 910, 619, 985], fill="#FFFFFF")
    draw.line([0, 910, 619, 910], fill="#F7EEF0", width=1)
    text(draw, (30, 930), "我的动态", 28, ACCENT, True)
    draw.rounded_rectangle([28, 972, 138, 978], radius=3, fill=ACCENT)
    draw.rounded_rectangle([398, 926, 500, 972], radius=23, fill=ACCENT_SOFT)
    text(draw, (449, 949), "宠物档案", 20, SECONDARY, False, "mm")
    draw.rounded_rectangle([512, 926, 610, 972], radius=23, fill=ACCENT)
    text(draw, (561, 949), "发布动态", 20, "#FFFFFF", True, "mm")


def draw_feed(draw):
    draw.rounded_rectangle([20, 1002, 600, 1182], radius=20, fill="#FFFFFF")
    draw.ellipse([40, 1024, 96, 1080], fill="#F1E9EC")
    text(draw, (42, 1042), "小", 22, "#FFFFFF", True)
    text(draw, (112, 1030), "小宠日记", 25, "#333333", True)
    text(draw, (112, 1064), "刚刚 · #猫咪频道", 19, "#B0B0B0")
    draw.rounded_rectangle([40, 1102, 560, 1122], radius=10, fill="#F5F1F3")
    draw.rounded_rectangle([40, 1138, 470, 1158], radius=10, fill="#F5F1F3")


def draw_tabbar(draw):
    draw.rectangle([0, 1200, 619, 1319], fill="#FFFFFF")
    draw.line([0, 1200, 619, 1200], fill="#F5EEF0", width=1)
    items = [("首页", "#A7ADB5"), ("发布+", "#A7ADB5"), ("我的", ACCENT)]
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


def build_profile_phone():
    img = new_phone()
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle([0, 0, 619, 1319], radius=44, fill="#F7F5F6")
    img.alpha_composite(make_cover(), (0, 0))

    shade = Image.new("RGBA", (620, 190), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shade)
    for y in range(190):
        alpha = int(88 * (1 - y / 189))
        sd.line([(0, y), (620, y)], fill=(31, 20, 24, alpha))
    img.alpha_composite(shade, (0, 0))
    draw_status(draw, "#FFFFFF")
    text(draw, (310, 128), "我的", 30, "#FFFFFF", True, "mm")

    draw.rounded_rectangle([0, 470, 619, 1319], radius=40, fill="#FFFFFF")
    draw_avatar(img, draw)
    text(draw, (228, 466), "小宠日记", 34, TEXT, True)
    text(draw, (228, 518), "和毛孩子一起长大", 21, SECONDARY)

    stats = [("12", "关注", 76), ("86", "粉丝", 196), ("24", "动态", 316)]
    for number, label, cx in stats:
        text(draw, (cx, 620), number, 32, TEXT, True)
        text(draw, (cx, 668), label, 21, SECONDARY)
    draw.rounded_rectangle([438, 612, 590, 670], radius=29, fill=ACCENT_SOFT)
    text(draw, (514, 641), "编辑主页", 22, ACCENT, True, "mm")

    text(draw, (30, 720), "加入的频道", 26, TEXT, True)
    text(draw, (590, 726), "共 3 个", 20, META, False, "ra")
    draw_channel_card(img, draw, 30, "猫咪", "128 成员")
    draw_channel_card(img, draw, 226, "狗狗", "96 成员")
    draw_channel_card(img, draw, 422, "小宠", "42 成员")
    draw_tabs(draw)
    draw_feed(draw)
    draw_tabbar(draw)
    return finish_phone(img)


def build_edit_phone():
    img = new_phone()
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle([0, 0, 619, 1319], radius=44, fill="#FFF9F7")

    draw.rounded_rectangle([0, 0, 619, 210], radius=44, fill="#FFF3F0")
    draw.rectangle([0, 90, 619, 210], fill="#FFF3F0")
    draw_status(draw, TEXT)
    text(draw, (34, 128), "\u2039", 40, TEXT, False, "lm")
    text(draw, (310, 128), "编辑主页", 30, TEXT, True, "mm")

    cover = make_cover().crop((0, 0, 620, 410))
    img.alpha_composite(cover, (0, 210))
    draw.rounded_rectangle([426, 238, 590, 296], radius=29, fill="#7A5A56")
    draw.rounded_rectangle([446, 258, 470, 276], radius=5, outline="#FFFFFF", width=2)
    draw.ellipse([452, 263, 464, 272], outline="#FFFFFF", width=2)
    text(draw, (486, 267), "更换背景", 21, "#FFFFFF", True, "lm")

    draw.rounded_rectangle([0, 600, 619, 1319], radius=40, fill="#FFFFFF")
    text(draw, (40, 686), "名字", 26, SECONDARY)
    text(draw, (180, 684), "小宠日记", 27, TEXT, True)
    draw.line([40, 754, 590, 754], fill="#F5ECEF", width=1)
    text(draw, (592, 742), "\u203a", 34, "#C9B6BC", False, "ra")

    text(draw, (40, 806), "简介", 26, SECONDARY)
    text(draw, (180, 802), "和毛孩子一起长大", 25, TEXT)
    text(draw, (180, 848), "记录每一天的小可爱", 25, TEXT)
    text(draw, (592, 870), "18/200", 19, "#B7A3A9", False, "ra")
    draw.line([40, 904, 590, 904], fill="#F5ECEF", width=1)

    draw.rounded_rectangle([40, 980, 580, 1056], radius=38, fill=ACCENT)
    text(draw, (310, 1018), "保存", 26, "#FFFFFF", True, "mm")
    text(draw, (310, 1096), "只修改名字、简介和背景图", 20, "#B7A3A9", False, "mm")
    return finish_phone(img)


def main():
    canvas = Image.new("RGBA", (1560, 1520), "#E9EDF2")
    draw = ImageDraw.Draw(canvas)
    text(draw, (100, 62), "① 个人主页（参考抖音布局）", 28, "#344054", True)
    text(draw, (840, 62), "② 编辑主页", 28, "#344054", True)

    for phone, x in ((build_profile_phone(), 100), (build_edit_phone(), 840)):
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
