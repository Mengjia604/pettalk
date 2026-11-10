from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT = os.path.join(ROOT, "docs", "design", "breed-picker-draft.png")

REGULAR = "C:/Windows/Fonts/msyh.ttc"
BOLD = "C:/Windows/Fonts/msyhbd.ttc"


def font(size, bold=False):
    return ImageFont.truetype(BOLD if bold else REGULAR, size)


def text(draw, xy, value, size, color, bold=False, anchor="la"):
    draw.text(xy, value, font=font(size, bold), fill=color, anchor=anchor)


def draw_header(draw, title):
    draw.rounded_rectangle([0, 0, 619, 210], radius=44, fill="#0E0F12")
    draw.rectangle([0, 90, 619, 210], fill="#0E0F12")
    text(draw, (34, 30), "9:41", 22, "#FFFFFF", True)
    draw.rounded_rectangle([548, 34, 574, 48], radius=7, outline="#FFFFFF", width=2)
    draw.rounded_rectangle([578, 37, 584, 45], radius=2, fill="#FFFFFF")
    draw.rounded_rectangle([522, 32, 540, 50], radius=4, outline="#FFFFFF", width=2)
    text(draw, (34, 128), "\u2039", 40, "#FFFFFF", False, "lm")
    text(draw, (310, 128), title, 32, "#FFFFFF", True, "mm")


def draw_search(draw, keyword="", placeholder="搜索品种，如：柯基"):
    draw.rounded_rectangle([30, 238, 590, 314], radius=38, fill="#F2F4F7")
    draw.ellipse([52, 258, 76, 282], outline="#9AA1AB", width=3)
    draw.line([73, 279, 82, 288], fill="#9AA1AB", width=3)
    if keyword:
        text(draw, (98, 261), keyword, 24, "#1F2329")
        text(draw, (552, 257), "\u00d7", 26, "#B0B6BF")
    else:
        text(draw, (98, 261), placeholder, 24, "#9AA1AB")


def draw_categories(draw, active="狗狗", muted=False):
    categories = ["狗狗", "猫咪", "兔子", "仓鼠", "鸟类", "鱼类", "爬宠", "其他"]
    draw.rectangle([0, 338, 190, 1210], fill="#F6F7F9")
    for index, name in enumerate(categories):
        y = 338 + index * 96
        is_active = name == active and not muted
        if is_active:
            draw.rectangle([0, y, 190, y + 96], fill="#FFFFFF")
            draw.rounded_rectangle([0, y + 26, 6, y + 70], radius=3, fill="#F7780A")
        text(draw, (34, y + 34), name, 27, "#1F2329" if is_active else "#606873", is_active)
    draw.line([0, 1210, 190, 1210], fill="#EDEFF2", width=1)


def draw_breeds(draw, selected="柯基", muted=False):
    breeds = ["柯基", "金毛", "拉布拉多", "泰迪", "比熊", "博美", "萨摩耶", "哈士奇", "边境牧羊犬", "柴犬"]
    for index, name in enumerate(breeds):
        y = 338 + index * 92
        is_selected = name == selected and not muted
        if is_selected:
            draw.rectangle([190, y, 620, y + 92], fill="#FFF8F1")
        text(draw, (230, y + 30), name, 27, "#F7780A" if is_selected else "#303540", is_selected)
        if is_selected:
            draw.line([552, y + 46, 560, y + 54, 574, y + 36], fill="#F7780A", width=4)
        if index < len(breeds) - 1:
            draw.line([230, y + 91, 590, y + 91], fill="#F1F3F5", width=1)


def draw_footer(draw):
    draw.rectangle([0, 1210, 620, 1320], fill="#FFFFFF")
    draw.line([0, 1210, 620, 1210], fill="#EDEFF2", width=1)
    text(draw, (30, 1258), "找不到想要的品种？", 22, "#9AA1AB")
    draw.rounded_rectangle([458, 1244, 590, 1296], radius=26, fill="#FFF1E4")
    text(draw, (524, 1270), "客服反馈", 22, "#F7780A", True, "mm")


def draw_empty_result(img, draw, keyword):
    cx = 405
    draw.ellipse([cx - 82, 486, cx + 82, 650], fill="#FFF1E4")
    draw.ellipse([cx - 34, 528, cx + 18, 580], outline="#F7780A", width=5)
    draw.line([cx + 12, 572, cx + 40, 600], fill="#F7780A", width=5)
    text(draw, (cx, 704), f"没有找到「{keyword}」", 26, "#303540", True, "mm")
    text(draw, (cx, 750), "暂时没有收录这个品种", 22, "#9AA1AB", False, "mm")
    draw.rounded_rectangle([cx - 112, 796, cx + 112, 864], radius=34, fill="#FFF1E4")
    text(draw, (cx, 830), "客服反馈", 24, "#F7780A", True, "mm")
    text(draw, (cx, 910), "告诉我们，我们会尽快补充", 21, "#B0B6BF", False, "mm")


def build_picker_phone():
    img = Image.new("RGBA", (620, 1320), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle([0, 0, 619, 1319], radius=44, fill="#FFFFFF")
    draw_header(draw, "选择品种")
    draw_search(draw)
    draw_categories(draw, "狗狗")
    draw_breeds(draw, "柯基")
    draw_footer(draw)
    return finish_phone(img)


def build_empty_phone():
    img = Image.new("RGBA", (620, 1320), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle([0, 0, 619, 1319], radius=44, fill="#FFFFFF")
    draw_header(draw, "选择品种")
    draw_search(draw, "独角兽")
    draw_categories(draw, "狗狗", muted=True)
    draw_empty_result(img, draw, "独角兽")
    draw_footer(draw)
    return finish_phone(img)


def finish_phone(phone):
    mask = Image.new("L", (620, 1320), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, 619, 1319], radius=44, fill=255)
    phone.putalpha(mask)
    ImageDraw.Draw(phone).rounded_rectangle([0, 0, 619, 1319], radius=44, outline="#C9D0D8", width=2)
    return phone


def main():
    canvas = Image.new("RGBA", (1560, 1520), "#E9EDF2")
    draw = ImageDraw.Draw(canvas)
    text(draw, (100, 62), "\u2460 选择品种", 28, "#344054", True)
    text(draw, (840, 62), "\u2461 搜索无结果", 28, "#344054", True)

    for phone, x in ((build_picker_phone(), 100), (build_empty_phone(), 840)):
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
