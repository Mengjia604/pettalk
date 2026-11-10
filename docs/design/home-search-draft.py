# -*- coding: utf-8 -*-
from PIL import Image, ImageDraw, ImageFont

W, H = 1680, 1090
BG = "#F5F6F8"
INK = "#1F2329"
MUTED = "#9AA0A6"
PRIMARY = "#3B82F6"
HILITE = "#F97316"
CARD_TEXT = "#333333"
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
        if ch == "\n":
            lines.append(cur); cur = ""; continue
        if tw(draw, cur + ch, size) <= maxw:
            cur += ch
        else:
            lines.append(cur); cur = ch
    if cur:
        lines.append(cur)
    return lines

def rich_lines(draw, xy, lines, size, maxw, lineh, keyword=None):
    x, y = xy
    for line in lines:
        if keyword and keyword in line:
            parts = line.split(keyword)
            cx = x
            for i, part in enumerate(parts):
                if part:
                    draw.text((cx, y), part, font=f(size), fill=CARD_TEXT)
                    cx += tw(draw, part, size)
                if i < len(parts) - 1:
                    draw.text((cx, y), keyword, font=f(size), fill=HILITE)
                    cx += tw(draw, keyword, size)
        else:
            draw.text((x, y), line, font=f(size), fill=CARD_TEXT)
        y += lineh

def paw(draw, cx, cy, scale=1.0, color=(255, 255, 255, 220)):
    r = 4.2 * scale
    draw.ellipse((cx - r*1.5, cy - r*0.4, cx + r*1.5, cy + r*2.4), fill=color)
    for dx, dy in [(-2.1, -2.0), (-0.2, -3.0), (1.8, -2.4)]:
        draw.ellipse((cx + dx*r - r*0.55, cy + dy*r - r*0.55,
                      cx + dx*r + r*0.55, cy + dy*r + r*0.55), fill=color)

def gradient_tile(draw, box, c1, c2, paw_alpha=210):
    x1, y1, x2, y2 = box
    tile = Image.new("RGB", (int(x2-x1), int(y2-y1)))
    td = ImageDraw.Draw(tile)
    w, h = tile.size
    for i in range(h):
        t = i / max(h - 1, 1)
        col = tuple(int(c1[j] + (c2[j] - c1[j]) * t) for j in range(3))
        td.line([(0, i), (w, i)], fill=col)
    overlay = Image.new("RGBA", tile.size, (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.ellipse((w*0.16, h*0.18, w*0.52, h*0.56), fill=(255,255,255,28))
    paw(od, w*0.62, h*0.55, scale=max(w, h)/100.0, color=(255,255,255,paw_alpha))
    tile = Image.alpha_composite(tile.convert("RGBA"), overlay).convert("RGB")
    mask = Image.new("L", tile.size, 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle((0, 0, w-1, h-1), radius=10, fill=255)
    draw._image.paste(tile, (int(x1), int(y1)), mask)

def heart(draw, cx, cy, s, color):
    draw.polygon([(cx, cy + s*0.9), (cx - s, cy - s*0.15), (cx - s*0.55, cy - s*0.75),
                  (cx, cy - s*0.25), (cx + s*0.55, cy - s*0.75), (cx + s, cy - s*0.15)], fill=color)

def draw_status(draw, x, y, w):
    text(draw, (x + 24, y + 12), "9:41", 11, True, "#FFFFFF")
    bx = x + w - 30
    draw.rounded_rectangle((bx, y + 13, bx + 17, y + 23), radius=2, fill="#FFFFFF")
    draw.rectangle((bx + 2, y + 15, bx + 11, y + 21), fill="#111111")
    for i in range(4):
        hh = 3 + i * 2
        draw.rectangle((x + w - 70 + i*4, y + 23 - hh, x + w - 68 + i*4, y + 23), fill="#FFFFFF")

def draw_nav(draw, sx, sy, sw):
    # 黑色状态栏 + 导航栏
    rr(draw, (sx, sy, sx + sw, sy + 96), 28, fill="#141518")
    draw.rectangle((sx, sy + 50, sx + sw, sy + 96), fill="#141518")
    draw_status(draw, sx, sy, sw)
    text(draw, (sx + sw/2, sy + 68), "宠物圈", 17, True, "#FFFFFF", anchor="mm")

def search_icon(draw, cx, cy, color="#8A9099"):
    draw.ellipse((cx-6, cy-6, cx+3, cy+3), outline=color, width=2)
    draw.line((cx+3, cy+3, cx+8, cy+8), fill=color, width=2)

def draw_search(draw, sx, sy, sw, active=False, keyword="", show_action=False):
    fy = sy + 10
    fw = sw - 24 - (38 if show_action else 0)
    rr(draw, (sx + 12, fy, sx + 12 + fw, fy + 38), 19, fill="#F0F2F5")
    search_icon(draw, sx + 30, fy + 19)
    if keyword:
        text(draw, (sx + 46, fy + 19), keyword, 13, False, INK, anchor="lm")
        # 清除按钮
        cx, cy = sx + 12 + fw - 18, fy + 19
        draw.ellipse((cx-7, cy-7, cx+7, cy+7), fill="#C9CDD3")
        draw.line((cx-3, cy-3, cx+3, cy+3), fill="#FFFFFF", width=2)
        draw.line((cx+3, cy-3, cx-3, cy+3), fill="#FFFFFF", width=2)
    else:
        text(draw, (sx + 46, fy + 19), "搜索帖子、猫咪、狗狗…", 12.5, False, "#A7ADB5", anchor="lm")
    if show_action:
        text(draw, (sx + sw - 14, fy + 19), "搜索", 13, True, PRIMARY, anchor="rm")

def draw_chip(draw, x, y, label, hot=False):
    w = tw(draw, label, 12) + 28
    h = 30
    rr(draw, (x, y, x + w, y + h), 15, fill="#FFFFFF" if not hot else "#FFF3EC",
       outline="#E9EBEF" if not hot else "#FFD9C2", width=1)
    if hot:
        text(draw, (x + 14, y + 15), label, 12, False, "#B45309", anchor="lm")
    else:
        text(draw, (x + 14, y + 15), label, 12, False, "#4B5563", anchor="lm")
    return w

def draw_avatar(draw, x, y, initial, color="#A9B8E8"):
    draw.ellipse((x, y, x + 36, y + 36), fill=color)
    text(draw, (x + 18, y + 18), initial, 13, True, "#FFFFFF", anchor="mm")

def draw_footer(draw, cx, y, w, liked, like_count, comment_count):
    right = cx + w
    comment = f"评论 {comment_count}"
    like = f"点赞 {like_count}"
    cw = tw(draw, comment, 10.5)
    lw = tw(draw, like, 10.5)
    text(draw, (right, y), comment, 10.5, False, "#8A9099", anchor="ra")
    like_right = right - cw - 28
    text(draw, (like_right, y), like, 10.5, False, PRIMARY if liked else "#8A9099", anchor="ra")
    if liked:
        heart(draw, like_right - lw - 8, y - 5, 4.0, PRIMARY)

def draw_card(draw, x, y, w, nickname, initial, tm, content, images, liked, likes, comments,
              keyword=None, avatar_color="#A9B8E8"):
    pad = 14
    lines = wrap(draw, content, 12.5, w - pad*2) if content else []
    h = pad + 36 + 10 + len(lines)*20 + 8
    if images:
        size = (w - pad*2 - 16) / 3
        h += size + 12
    h += 24 + pad
    rr(draw, (x, y, x + w, y + h), 14, fill="#FFFFFF")
    draw_avatar(draw, x + pad, y + pad, initial, avatar_color)
    text(draw, (x + pad + 46, y + pad + 2), nickname, 12.5, True, INK)
    text(draw, (x + pad + 46, y + pad + 20), tm, 9.5, False, "#B0B4BA")
    cy = y + pad + 36 + 10
    rich_lines(draw, (x + pad, cy), lines, 12.5, w - pad*2, 20, keyword)
    cy += len(lines)*20 + 8
    if images:
        size = (w - pad*2 - 16) / 3
        colors = [((255, 220, 196), (255, 177, 148)), ((205, 225, 255), (166, 197, 250)),
                  ((210, 240, 222), (154, 219, 186)), ((255, 234, 196), (250, 201, 128))]
        for i in range(images):
            gx = x + pad + i*(size + 8)
            gradient_tile(draw, (gx, cy, gx + size, cy + size), colors[i % 4][0], colors[i % 4][1])
        cy += size + 12
    # 分割线
    draw.line((x + pad, cy, x + w - pad, cy), fill="#F1F2F4", width=1)
    draw_footer(draw, x + pad, cy + 16, w - pad*2, liked, likes, comments)
    return h

def draw_tabbar(draw, sx, sy, sw, sh):
    th = 70
    y = sy + sh - th
    rr(draw, (sx, y, sx + sw, sy + sh), 28, fill="#FFFFFF")
    draw.rectangle((sx, y, sx + sw, y + 30), fill="#FFFFFF")
    draw.line((sx, y, sx + sw, y), fill="#EDEFF2", width=1)
    cw = sw / 3
    # 首页 active
    cx = sx + cw*0.5
    paw(draw, cx, y + 25, 1.15, "#1F2329")
    text(draw, (cx, y + 50), "首页", 10.5, True, "#1F2329", anchor="mm")
    # 发布
    cx = sx + cw*1.5
    draw.ellipse((cx-12, y + 13, cx+12, y + 37), fill="#EEF2F7")
    draw.line((cx-5, y + 25, cx+5, y + 25), fill="#555B63", width=2)
    draw.line((cx, y + 20, cx, y + 30), fill="#555B63", width=2)
    text(draw, (cx, y + 50), "发布", 10.5, False, "#7D838B", anchor="mm")
    # 我的
    cx = sx + cw*2.5
    draw.ellipse((cx-11, y + 14, cx+11, y + 36), fill="#EEF2F7")
    draw.ellipse((cx-4, y + 19, cx+4, y + 27), fill="#8A9099")
    draw.arc((cx-8, y + 25, cx+8, y + 38), 200, 340, fill="#8A9099", width=2)
    text(draw, (cx, y + 50), "我的", 10.5, False, "#7D838B", anchor="mm")

def draw_phone_base(draw, x, y):
    w, h = 420, 880
    rr(draw, (x, y, x + w, y + h), 42, fill="#17191C")
    rr(draw, (x + 10, y + 10, x + w - 10, y + h - 10), 34, fill="#F4F6F8")
    return x + 10, y + 10, w - 20, h - 20

img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)
# 背景点状装饰
for gx in range(0, W, 48):
    for gy in range(0, H, 48):
        d.point((gx, gy), fill="#E7EAEE")

text(d, (90, 38), "PetTalk 首页搜索 · 草稿图", 28, True, "#1B1E23")
text(d, (90, 78), "顶部常驻搜索框，按关键词检索动态正文；沿用现有信息流样式与分页", 13.5, False, "#6B7280")
text(d, (W - 90, 46), "v1 · 2026-11-09", 12, False, "#9AA0A6", anchor="ra")

positions = [90, 570, 1050]
screens = [draw_phone_base(d, px, 120) for px in positions]

# ---------------- 1 默认首页 ----------------
sx, sy, sw, sh = screens[0]
draw_nav(d, sx, sy, sw)
d.rectangle((sx, sy + 96, sx + sw, sy + 96 + 58), fill="#FFFFFF")
draw_search(d, sx, sy + 96, sw)
draw_card(d, sx + 12, sy + 170, sw - 24, "团子妈妈", "团", "10 分钟前", "今天带团子去公园晒太阳，遇到一只超乖的小柯基～", 3, False, 12, 3)
draw_card(d, sx + 12, sy + 456, sw - 24, "奶盖铲屎官", "奶", "1 小时前", "新手养猫必看：猫粮怎么选？整理了三个月的踩坑经验", 0, True, 28, 9, avatar_color="#F3B7B7")
text(d, (sx + sw/2, sy + 665), "— 没有更多了 —", 10, False, "#B0B4BA", anchor="mm")
draw_tabbar(d, sx, sy, sw, sh)

# ---------------- 2 输入态 ----------------
sx, sy, sw, sh = screens[1]
draw_nav(d, sx, sy, sw)
panel_h = 330
d.rectangle((sx, sy + 96, sx + sw, sy + 96 + panel_h), fill="#FFFFFF")
draw_search(d, sx, sy + 96, sw, active=True, keyword="柯基", show_action=True)
text(d, (sx + 16, sy + 166), "热门搜索", 12.5, True, INK)
chips = [("猫咪日常", False), ("柯基", True), ("领养代替购买", False), ("新手养宠", False), ("宠物友好餐厅", False), ("猫粮推荐", False)]
cx, cy = sx + 16, sy + 188
for label, hot in chips:
    cw = tw(d, label, 12) + 28
    if cx + cw > sx + sw - 16:
        cx = sx + 16; cy += 40
    draw_chip(d, cx, cy, label, hot)
    cx += cw + 8
cy += 48
d.line((sx + 16, cy, sx + sw - 16, cy), fill="#F1F2F4", width=1)
text(d, (sx + 16, cy + 16), "猜你喜欢", 12.5, True, INK)
text(d, (sx + sw - 16, cy + 18), "换一批", 10.5, False, "#9AA0A6", anchor="ra")
rows = [("猫", "猫咪掉毛季，家里这样清理最省力", "#FFF0E6"), ("狗", "下班后陪狗狗玩的 15 分钟小游戏", "#EAF2FF")]
ry = cy + 42
for tag, title, bgc in rows:
    rr(d, (sx + 16, ry, sx + 54, ry + 38), 10, fill=bgc)
    text(d, (sx + 35, ry + 19), tag, 13, True, "#9A6B3F" if tag == "猫" else "#4F6FA8", anchor="mm")
    text(d, (sx + 66, ry + 10), title, 11.5, False, "#3A3F46")
    text(d, (sx + 66, ry + 27), "热门内容 · 2.3 万浏览", 9, False, "#A3A8AF")
    ry += 50
# 底部信息流被面板遮住
draw_card(d, sx + 12, sy + 440, sw - 24, "橘子汽水", "橘", "2 小时前", "今天的云朵像一只大橘猫。", 0, False, 6, 1, avatar_color="#F5C98D")
draw_card(d, sx + 12, sy + 600, sw - 24, "厨房里的猫", "厨", "3 小时前", "深夜放毒：第一次尝试自制猫饭，光盘了。", 0, False, 9, 2, avatar_color="#E8C48F")
draw_tabbar(d, sx, sy, sw, sh)

# ---------------- 3 结果态 ----------------
sx, sy, sw, sh = screens[2]
draw_nav(d, sx, sy, sw)
d.rectangle((sx, sy + 96, sx + sw, sy + 96 + 58), fill="#FFFFFF")
draw_search(d, sx, sy + 96, sw, active=False, keyword="柯基", show_action=True)
text(d, (sx + 16, sy + 145), "找到 8 条相关动态", 10, False, "#8A9099", anchor="lm")
text(d, (sx + sw - 16, sy + 145), "按时间排序", 10, False, "#8A9099", anchor="rm")
draw_card(d, sx + 12, sy + 166, sw - 24, "短腿饲养员", "短", "3 小时前", "周末带柯基去宠物公园，跑了一下午，回家直接睡成小猪。", 2, False, 23, 6, keyword="柯基")
draw_card(d, sx + 12, sy + 438, sw - 24, "豆包的爸爸", "豆", "昨天", "柯基幼犬接回家第一周，这些准备一定要做好。", 0, True, 41, 12, keyword="柯基", avatar_color="#9FD3B6")
draw_card(d, sx + 12, sy + 592, sw - 24, "小短腿日记", "短", "2 天前", "柯基掉毛真的名不虚传，梳毛梳出一只新狗。", 0, False, 17, 4, keyword="柯基", avatar_color="#C3B2E8")
draw_tabbar(d, sx, sy, sw, sh)

# 说明
notes = [
    ("① 默认", "搜索框常驻导航下方，不输入时展示全部动态"),
    ("② 输入", "聚焦后展示热门搜索与猜你喜欢，帮助发现内容"),
    ("③ 结果", "关键词高亮，展示匹配数量；空结果提示“未找到相关内容”"),
]
for i, (tag, desc) in enumerate(notes):
    x = positions[i]
    text(d, (x + 10, 1022), tag, 13, True, PRIMARY)
    text(d, (x + 10, 1046), desc, 10.5, False, "#6B7280")

img.save("docs/design/home-search-draft.png", quality=95)
print("saved", img.size)



