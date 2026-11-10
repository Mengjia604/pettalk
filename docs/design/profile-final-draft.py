from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT = os.path.join(ROOT, "docs", "design", "profile-final-draft.png")
IMAGES = os.path.join(ROOT, "frontend", "images")

REGULAR = "C:/Windows/Fonts/msyh.ttc"
BOLD = "C:/Windows/Fonts/msyhbd.ttc"

ACCENT = "#F7780A"
SOFT = "#FFF1E4"
TEXT = "#3A302D"
SECONDARY = "#8C7B74"
META = "#A8968E"


def font(size, bold=False):
    return ImageFont.truetype(BOLD if bold else REGULAR, size)


def text(draw, xy, value, size, color, bold=False, anchor="la"):
    draw.text(xy, value, font=font(size, bold), fill=color, anchor=anchor)


def tinted_paw(path, color=(242, 161, 93), opacity=80):
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


def gradient_button(img, box, radius, top="#FF9A44", bottom="#FC6076"):
    w, h = int(box[2] - box[0]), int(box[3] - box[1])
    grad = Image.new("RGB", (w, h), top)
    gd = ImageDraw.Draw(grad)
    for y in range(h):
        t = y / max(h - 1, 1)
        color = tuple(int(int(top[i:i + 2], 16) + (int(bottom[i:i + 2], 16) - int(top[i:i + 2], 16)) * t) for i in (1, 3, 5))
        gd.line([(0, y), (w, y)], fill=color)
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, w - 1, h - 1], radius=radius, fill=255)
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    layer.paste(grad, (0, 0), mask)
    img.alpha_composite(layer, (int(box[0]), int(box[1])))


def make_cover(size=(620, 460)):
    w, h = size
    cover = Image.new("RGBA", size, (0, 0, 0, 0))
    grad = Image.new("RGB", size, "#FFF2E2")
    gd = ImageDraw.Draw(grad)
    for y in range(h):
        t = y / max(h - 1, 1)
        top = (255, 242, 226)
        bottom = (255, 214, 174)
        color = tuple(int(top[i] + (bottom[i] - top[i]) * t) for i in range(3))
        gd.line([(0, y), (w, y)], fill=color)
    cover.paste(grad, (0, 0))
    cd = ImageDraw.Draw(cover)
    cd.ellipse([420, -40, 760, 300], fill="#FFFFFF")
    cd.ellipse([-80, 330, 190, 600], fill="#FFE8CE")
    cd.ellipse([230, 220, 500, 490], fill="#FFE0BF")
    paste_image_contain(cover, tinted_paw(os.path.join(IMAGES, "paw.png"), opacity=75), [70, 100, 180, 210])
    paste_image_contain(cover, tinted_paw(os.path.join(IMAGES, "paw.png"), opacity=70), [480, 300, 570, 390])
    return cover


def draw_status(draw, color):
    text(draw, (34, 30), "9:41", 22, color, True)
    draw.rounded_rectangle([548, 34, 574, 48], radius=7, outline=color, width=2)
    draw.rounded_rectangle([578, 37, 584, 45], radius=2, fill=color)
    draw.rounded_rectangle([522, 32, 540, 50], radius=4, outline=color, width=2)


def draw_avatar(draw):
    draw.ellipse([44, 360, 184, 500], fill="#F7780A", outline="#FFFFFF", width=7)
    text(draw, (114, 430), "宠", 42, "#FFFFFF", True, "mm")


def draw_pet_card(img, draw, x, name, breed, char):
    draw.rounded_rectangle([x, 669, x + 180, 769], radius=22, fill="#FFF8F1")
    draw.ellipse([x + 14, 693, x + 62, 741], fill="#FFE3CB")
    text(draw, (x + 38, 717), char, 24, "#B85B12", True, "mm")
    text(draw, (x + 76, 688), name, 24, TEXT, True)
    text(draw, (x + 76, 726), breed, 19, META)


def draw_channel_card(img, draw, x, name, members):
    draw.rounded_rectangle([x, 833, x + 180, 933], radius=22, fill="#FFF8F1")
    draw.ellipse([x + 14, 857, x + 62, 905], fill="#FFF1E4")
    paw = Image.open(os.path.join(IMAGES, "paw.png")).convert("RGBA")
    paste_image_contain(img, paw, [x + 27, 870, x + 49, 892])
    text(draw, (x + 76, 852), name, 24, TEXT, True)
    text(draw, (x + 76, 890), members, 19, META)


def draw_tabs(draw):
    draw.rectangle([0, 960, 619, 1030], fill="#FFFFFF")
    draw.line([0, 960, 619, 960], fill="#F3ECE7", width=1)
    text(draw, (30, 978), "我的动态", 28, ACCENT, True)
    draw.rounded_rectangle([28, 1018, 138, 1024], radius=3, fill=ACCENT)


def draw_feed(draw):
    draw.rounded_rectangle([20, 1048, 600, 1185], radius=20, fill="#FFFFFF")
    draw.ellipse([40, 1068, 94, 1122], fill="#F2EAE4")
    text(draw, (42, 1086), "小", 22, "#FFFFFF", True)
    text(draw, (110, 1074), "小宠日记", 25, "#333333", True)
    text(draw, (110, 1108), "刚刚 · #猫咪频道", 19, "#B0B0B0")
    draw.rounded_rectangle([40, 1136, 560, 1154], radius=9, fill="#F5F1EE")


def draw_tabbar(draw):
    draw.rectangle([0, 1200, 619, 1319], fill="#FFFFFF")
    draw.line([0, 1200, 619, 1200], fill="#F3ECE7", width=1)
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
    draw.rounded_rectangle([0, 0, 619, 1319], radius=44, fill="#FFFFFF")
    img.alpha_composite(make_cover(), (0, 0))
    shade = Image.new("RGBA", (620, 180), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shade)
    for y in range(180):
        alpha = int(80 * (1 - y / 179))
        sd.line([(0, y), (620, y)], fill=(31, 20, 24, alpha))
    img.alpha_composite(shade, (0, 0))
    draw_status(draw, "#FFFFFF")
    text(draw, (310, 126), "我的", 30, "#FFFFFF", True, "mm")

    draw.rounded_rectangle([0, 420, 619, 1319], radius=40, fill="#FFFFFF")
    draw_avatar(draw)
    text(draw, (204, 418), "小宠日记", 34, TEXT, True)
    text(draw, (204, 468), "和毛孩子一起长大", 21, SECONDARY)

    stats = [("12", "关注", 76), ("86", "粉丝", 196), ("24", "动态", 316)]
    for number, label, cx in stats:
        text(draw, (cx, 545), number, 32, TEXT, True)
        text(draw, (cx, 593), label, 21, SECONDARY)
    gradient_button(img, (438, 535, 590, 593), 29)
    text(draw, (514, 564), "编辑主页", 22, "#FFFFFF", True, "mm")

    text(draw, (30, 637), "宠物档案", 26, TEXT, True)
    text(draw, (590, 643), "管理 ›", 20, ACCENT, True, "ra")
    draw_pet_card(img, draw, 30, "豆豆", "柯基", "豆")
    draw_pet_card(img, draw, 226, "咪咪", "英短", "咪")
    draw_pet_card(img, draw, 422, "团子", "金毛", "团")

    text(draw, (30, 801), "加入的频道", 26, TEXT, True)
    text(draw, (590, 807), "共 3 个", 20, META, False, "ra")
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
    draw.rounded_rectangle([0, 0, 619, 1319], radius=44, fill="#FFFFFF")
    draw.rounded_rectangle([0, 0, 619, 210], radius=44, fill="#FFFFFF")
    draw.rectangle([0, 90, 619, 210], fill="#FFFFFF")
    draw_status(draw, TEXT)
    text(draw, (34, 128), "\u2039", 40, TEXT, False, "lm")
    text(draw, (310, 128), "编辑主页", 30, TEXT, True, "mm")

    cover = make_cover().crop((0, 0, 620, 410))
    img.alpha_composite(cover, (0, 210))
    gradient_button(img, (420, 238, 590, 296), 29)
    draw.rounded_rectangle([438, 258, 462, 276], radius=5, outline="#FFFFFF", width=2)
    draw.ellipse([444, 263, 456, 272], outline="#FFFFFF", width=2)
    text(draw, (478, 267), "更换背景", 21, "#FFFFFF", True, "lm")

    draw.rounded_rectangle([0, 600, 619, 1319], radius=40, fill="#FFFFFF")
    draw.ellipse([235, 545, 385, 695], fill="#F7780A", outline="#FFFFFF", width=7)
    text(draw, (310, 620), "宠", 44, "#FFFFFF", True, "mm")
    draw.ellipse([350, 652, 396, 698], fill="#FFFFFF")
    draw.rounded_rectangle([361, 670, 385, 684], radius=4, outline=ACCENT, width=2)
    draw.ellipse([368, 674, 378, 681], outline=ACCENT, width=2)
    text(draw, (310, 716), "更换头像", 20, ACCENT, True, "mm")

    text(draw, (40, 772), "名字", 26, SECONDARY)
    text(draw, (180, 770), "小宠日记", 27, TEXT, True)
    draw.line([40, 836, 590, 836], fill="#F3ECE7", width=1)
    text(draw, (592, 824), "\u203a", 34, "#C9B6AE", False, "ra")

    text(draw, (40, 888), "简介", 26, SECONDARY)
    text(draw, (180, 884), "和毛孩子一起长大", 25, TEXT)
    text(draw, (180, 930), "记录每一天的小可爱", 25, TEXT)
    text(draw, (592, 950), "18/200", 19, "#B7A49C", False, "ra")
    draw.line([40, 986, 590, 986], fill="#F3ECE7", width=1)

    gradient_button(img, (40, 1040, 580, 1116), 38)
    text(draw, (310, 1078), "保存", 26, "#FFFFFF", True, "mm")
    text(draw, (310, 1156), "可修改头像、名字、简介和背景图", 20, "#B7A49C", False, "mm")
    return finish_phone(img)


def main():
    canvas = Image.new("RGBA", (1560, 1520), "#E9EDF2")
    draw = ImageDraw.Draw(canvas)
    text(draw, (100, 62), "① 个人主页（白底·橙色按钮）", 28, "#344054", True)
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
