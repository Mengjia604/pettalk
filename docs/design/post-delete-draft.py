# -*- coding: utf-8 -*-
from PIL import Image, ImageDraw, ImageFont

W, H = 1680, 1090
BG = "#F5F6F8"
INK = "#1F2329"
MUTED = "#8A9099"
RED = "#E5484D"
FONT = "C:/Windows/Fonts/msyh.ttc"
FONT_B = "C:/Windows/Fonts/msyhbd.ttc"

cache = {}
def f(size, bold=False):
    key = (size, bold)
    if key not in cache:
        cache[key] = ImageFont.truetype(FONT_B if bold else FONT, size, index=0)
    return cache[key]

def rr(draw, box, r, fill=None, outline=None, width=1):
    draw.rounded_rectangle(box, radius=r, fill=fill, outline=outline, width=width)

def text(draw, xy, s, size=13, bold=False, fill=INK, anchor="la"):
    draw.text(xy, s, font=f(size, bold), fill=fill, anchor=anchor)

def tw(draw, s, size=13, bold=False):
    return draw.textlength(s, font=f(size, bold))

def wrap(draw, s, size, maxw):
    lines, cur = [], ""
    for ch in s:
        if tw(draw, cur + ch, size) <= maxw:
            cur += ch
        else:
            lines.append(cur)
            cur = ch
    if cur:
        lines.append(cur)
    return lines

def paw(draw, cx, cy, scale=1.0, color=(255, 255, 255, 220)):
    r = 4.2 * scale
    draw.ellipse((cx - r*1.5, cy - r*0.4, cx + r*1.5, cy + r*2.4), fill=color)
    for dx, dy in [(-2.1, -2.0), (-0.2, -3.0), (1.8, -2.4)]:
        draw.ellipse((cx + dx*r - r*0.55, cy + dy*r - r*0.55,
                      cx + dx*r + r*0.55, cy + dy*r + r*0.55), fill=color)

def tile(draw, box, c1, c2):
    x1, y1, x2, y2 = [int(v) for v in box]
    w, h = x2 - x1, y2 - y1
    base = Image.new("RGB", (w, h))
    bd = ImageDraw.Draw(base)
    for i in range(h):
        t = i / max(h - 1, 1)
        bd.line([(0, i), (w, i)], fill=tuple(int(c1[j] + (c2[j] - c1[j]) * t) for j in range(3)))
    ov = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    od = ImageDraw.Draw(ov)
    paw(od, w*0.62, h*0.56, max(w, h)/100.0)
    base = Image.alpha_composite(base.convert("RGBA"), ov).convert("RGB")
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, w-1, h-1), radius=10, fill=255)
    draw._image.paste(base, (x1, y1), mask)

def search_icon(draw, cx, cy):
    draw.ellipse((cx-6, cy-6, cx+3, cy+3), outline="#8A9099", width=2)
    draw.line((cx+3, cy+3, cx+8, cy+8), fill="#8A9099", width=2)

def status(draw, x, y, w):
    text(draw, (x + 24, y + 12), "9:41", 11, True, "#FFFFFF")
    bx = x + w - 30
    draw.rounded_rectangle((bx, y + 13, bx + 17, y + 23), radius=2, fill="#FFFFFF")
    draw.rectangle((bx + 2, y + 15, bx + 11, y + 21), fill="#111111")
    for i in range(4):
        hh = 3 + i * 2
        draw.rectangle((x + w - 70 + i*4, y + 23 - hh, x + w - 68 + i*4, y + 23), fill="#FFFFFF")

def nav(draw, sx, sy, sw):
    rr(draw, (sx, sy, sx + sw, sy + 96), 28, fill="#141518")
    draw.rectangle((sx, sy + 50, sx + sw, sy + 96), fill="#141518")
    status(draw, sx, sy, sw)
    text(draw, (sx + sw/2, sy + 68), "宠物圈", 17, True, "#FFFFFF", anchor="mm")

def search(draw, sx, sy, sw):
    rr(draw, (sx, sy, sx + sw, sy + 58), 0, fill="#FFFFFF")
    rr(draw, (sx + 12, sy + 10, sx + sw - 12, sy + 48), 19, fill="#F0F2F5")
    search_icon(draw, sx + 30, sy + 29)
    text(draw, (sx + 46, sy + 29), "搜索帖子、猫咪、狗狗…", 12.5, False, "#A7ADB5", anchor="lm")

def avatar(draw, x, y, label, color):
    draw.ellipse((x, y, x + 36, y + 36), fill=color)
    text(draw, (x + 18, y + 18), label, 13, True, "#FFFFFF", anchor="mm")

def post_card(draw, x, y, w, show_more=True):
    h = 300
    rr(draw, (x, y, x + w, y + h), 14, fill="#FFFFFF")
    avatar(draw, x + 14, y + 14, "团", "#A9B8E8")
    text(draw, (x + 62, y + 16), "团子妈妈", 12.5, True, INK)
    text(draw, (x + 62, y + 35), "10 分钟前", 9.5, False, "#B0B4BA")
    if show_more:
        rr(draw, (x + w - 58, y + 12, x + w - 14, y + 44), 16, fill="#F3F5F8")
        for dx in (-8, 0, 8):
            draw.ellipse((x + w - 38 + dx, y + 25, x + w - 34 + dx, y + 29), fill="#5F6670")
    content = "今天带团子去公园晒太阳，遇到一只超乖的小柯基～"
    lines = wrap(draw, content, 12.5, w - 28)
    yy = y + 66
    for line in lines:
        text(draw, (x + 14, yy), line, 12.5, False, "#333333")
        yy += 20
    yy += 6
    size = (w - 28 - 16) / 3
    for i, (c1, c2) in enumerate([((255,220,196),(255,177,148)), ((205,225,255),(166,197,250)), ((210,240,222),(154,219,186))]):
        tile(draw, (x + 14 + i*(size+8), yy, x + 14 + i*(size+8) + size, yy + size), c1, c2)
    fy = y + h - 34
    draw.line((x + 14, fy - 10, x + w - 14, fy - 10), fill="#F1F2F4", width=1)
    text(draw, (x + w - 14, fy), "点赞 12     评论 3", 10.5, False, MUTED, anchor="ra")

def tabbar(draw, sx, sy, sw, sh):
    y = sy + sh - 70
    rr(draw, (sx, y, sx + sw, sy + sh), 28, fill="#FFFFFF")
    draw.rectangle((sx, y, sx + sw, y + 30), fill="#FFFFFF")
    draw.line((sx, y, sx + sw, y), fill="#EDEFF2", width=1)
    cw = sw / 3
    cx = sx + cw*0.5
    paw(draw, cx, y + 25, 1.15, INK)
    text(draw, (cx, y + 50), "首页", 10.5, True, INK, anchor="mm")
    cx = sx + cw*1.5
    draw.ellipse((cx-12, y + 13, cx+12, y + 37), fill="#EEF2F7")
    draw.line((cx-5, y + 25, cx+5, y + 25), fill="#555B63", width=2)
    draw.line((cx, y + 20, cx, y + 30), fill="#555B63", width=2)
    text(draw, (cx, y + 50), "发布", 10.5, False, "#7D838B", anchor="mm")
    cx = sx + cw*2.5
    draw.ellipse((cx-11, y + 14, cx+11, y + 36), fill="#EEF2F7")
    draw.ellipse((cx-4, y + 19, cx+4, y + 27), fill=MUTED)
    draw.arc((cx-8, y + 25, cx+8, y + 38), 200, 340, fill=MUTED, width=2)
    text(draw, (cx, y + 50), "我的", 10.5, False, "#7D838B", anchor="mm")

def phone_base(draw, x, y):
    w, h = 420, 880
    rr(draw, (x, y, x + w, y + h), 42, fill="#17191C")
    rr(draw, (x + 10, y + 10, x + w - 10, y + h - 10), 34, fill="#F4F6F8")
    return x + 10, y + 10, w - 20, h - 20

def overlay(draw, sx, sy, sw, sh):
    draw.rectangle((sx, sy, sx + sw, sy + sh), fill=(17, 20, 24, 110))

def dim(img, box, alpha=110):
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(layer).rectangle(box, fill=(17, 20, 24, alpha))
    return Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB")

img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)
draw = d
for gx in range(0, W, 48):
    for gy in range(0, H, 48):
        d.point((gx, gy), fill="#E7EAEE")

text(d, (90, 38), "PetTalk 帖子删除 · 交互草稿", 28, True, "#1B1E23")
text(d, (90, 78), "仅作者本人可见删除入口，二次确认后删除并移出列表", 13.5, False, "#6B7280")
text(d, (W - 90, 46), "v1 · 2026-11-09", 12, False, "#9AA0A6", anchor="ra")

xs = [90, 570, 1050]
screens = [phone_base(d, x, 120) for x in xs]

# ① 入口
sx, sy, sw, sh = screens[0]
nav(d, sx, sy, sw)
search(d, sx, sy + 96, sw)
post_card(d, sx + 12, sy + 170, sw - 24)
rr(d, (sx + sw - 118, sy + 104, sx + sw - 12, sy + 134), 15, fill="#FFF3EC")
text(d, (sx + sw - 65, sy + 119), "仅本人可见", 10.5, True, "#B45309", anchor="mm")
d.line((sx + sw - 65, sy + 134, sx + sw - 36, sy + 170), fill="#F59E0B", width=2)
tabbar(d, sx, sy, sw, sh)

# ② 操作菜单
sx, sy, sw, sh = screens[1]
nav(d, sx, sy, sw)
search(d, sx, sy + 96, sw)
post_card(d, sx + 12, sy + 170, sw - 24)
img = dim(img, (sx, sy, sx + sw, sy + sh))
draw = d = ImageDraw.Draw(img)
sheet_y = sy + sh - 196
rr(d, (sx, sheet_y, sx + sw, sy + sh), 28, fill="#FFFFFF")
draw.rectangle((sx, sheet_y + 24, sx + sw, sy + sh), fill="#FFFFFF")
text(d, (sx + sw/2, sheet_y + 30), "帖子操作", 10.5, False, "#9AA0A6", anchor="mm")
text(d, (sx + sw/2, sheet_y + 72), "删除帖子", 16, False, RED, anchor="mm")
draw.line((sx + 16, sheet_y + 106, sx + sw - 16, sheet_y + 106), fill="#F0F1F3", width=1)
text(d, (sx + sw/2, sheet_y + 142), "取消", 16, False, INK, anchor="mm")
draw.line((sx, sheet_y + 172, sx + sw, sheet_y + 172), fill="#F5F6F8", width=10)

# ③ 二次确认
sx, sy, sw, sh = screens[2]
nav(d, sx, sy, sw)
search(d, sx, sy + 96, sw)
post_card(d, sx + 12, sy + 170, sw - 24)
img = dim(img, (sx, sy, sx + sw, sy + sh))
draw = d = ImageDraw.Draw(img)
mx1, my1, mx2, my2 = sx + 36, sy + 300, sx + sw - 36, sy + 480
rr(d, (mx1, my1, mx2, my2), 18, fill="#FFFFFF")
text(d, (sx + sw/2, my1 + 34), "删除帖子？", 16, True, INK, anchor="mm")
text(d, (sx + sw/2, my1 + 68), "删除后无法恢复，确定要删除吗？", 11.5, False, "#6B7280", anchor="mm")
draw.line((mx1, my2 - 46, mx2, my2 - 46), fill="#F0F1F3", width=1)
draw.line((sx + sw/2, my2 - 46, sx + sw/2, my2), fill="#F0F1F3", width=1)
text(d, (sx + sw/2 - 72, my2 - 23), "取消", 15, False, "#4B5563", anchor="mm")
text(d, (sx + sw/2 + 72, my2 - 23), "删除", 15, True, RED, anchor="mm")

notes = [
    ("① 入口", "本人帖子卡片右上角显示更多按钮，他人帖子不显示"),
    ("② 操作", "点击更多按钮弹出底部菜单，选择“删除帖子”"),
    ("③ 确认", "二次确认后调用删除接口，并从当前列表移除")
]
for i, (tag, desc) in enumerate(notes):
    x = xs[i]
    text(d, (x + 10, 1022), tag, 13, True, "#3B82F6")
    text(d, (x + 10, 1046), desc, 10.5, False, "#6B7280")

img.save("docs/design/post-delete-draft.png", quality=95)
print("saved", img.size)


