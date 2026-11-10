# -*- coding: utf-8 -*-
from PIL import Image, ImageDraw, ImageFont

W, H = 1920, 1200
BG = "#EDF0F4"
INK = "#1F2329"
MUTED = "#8F969F"
ORANGE = "#F97316"
WHITE = "#FFFFFF"
CARD = "#FFFFFF"
BORDER = "#EEF0F3"
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

def wrap(draw, s, size, maxw, bold=False):
    lines, cur = [], ""
    for ch in s:
        if ch == "\n":
            lines.append(cur); cur = ""
            continue
        if tw(draw, cur + ch, size, bold) <= maxw:
            cur += ch
        else:
            lines.append(cur); cur = ch
    if cur:
        lines.append(cur)
    return lines

def paw(draw, cx, cy, s=8, color=(255,255,255,235)):
    draw.ellipse((cx-s*1.15, cy-s*0.2, cx+s*1.15, cy+s*1.55), fill=color)
    for dx, dy in [(-1.4,-1.35),(-0.45,-1.9),(0.55,-1.75),(1.25,-0.9)]:
        draw.ellipse((cx+dx*s-s*0.39, cy+dy*s-s*0.39,
                      cx+dx*s+s*0.39, cy+dy*s+s*0.39), fill=color)

def _rgb(value):
    if isinstance(value, str):
        value = value.lstrip('#')
        return tuple(int(value[i:i+2], 16) for i in (0, 2, 4))
    return value


def gradient_box(draw, box, c1, c2, radius=16):
    c1, c2 = _rgb(c1), _rgb(c2)
    x1,y1,x2,y2 = [int(v) for v in box]
    tw_, th_ = x2-x1, y2-y1
    tile = Image.new("RGB", (tw_, th_))
    td = ImageDraw.Draw(tile)
    for i in range(th_):
        t = i / max(th_-1, 1)
        col = tuple(int(c1[j] + (c2[j]-c1[j])*t) for j in range(3))
        td.line([(0,i),(tw_,i)], fill=col)
    mask = Image.new("L", tile.size, 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle((0,0,tw_-1,th_-1), radius=radius, fill=255)
    draw._image.paste(tile, (x1,y1), mask)

def search_icon(draw, cx, cy, color=MUTED):
    draw.ellipse((cx-6,cy-6,cx+3,cy+3), outline=color, width=2)
    draw.line((cx+3,cy+3,cx+8,cy+8), fill=color, width=2)

def heart(draw, cx, cy, s=7, color="#F97316"):
    draw.polygon([(cx,cy+s*0.9),(cx-s,cy-s*0.1),(cx-s*0.55,cy-s*0.7),
                  (cx,cy-s*0.2),(cx+s*0.55,cy-s*0.7),(cx+s,cy-s*0.1)], fill=color)

def chat_icon(draw, cx, cy, s=6, color="#8F969F"):
    rr(draw,(cx-s,cy-s*0.75,cx+s,cy+s*0.55),3,fill=None,outline=color,width=2)
    draw.line((cx-s*0.45,cy+s*0.55,cx-s*0.9,cy+s*1.05),fill=color,width=2)

def share_icon(draw, cx, cy, s=7, color=ORANGE):
    draw.line((cx-s*0.4,cy+s*0.55,cx+s*0.65,cy-s*0.65),fill=color,width=2)
    draw.line((cx+s*0.65,cy-s*0.65,cx+s*0.15,cy-s*0.7),fill=color,width=2)
    draw.line((cx+s*0.65,cy-s*0.65,cx+s*0.6,cy-s*0.15),fill=color,width=2)
    draw.arc((cx-s,cy+s*0.15,cx+s*0.25,cy+s*1.15), 205, 335, fill=color, width=2)

def status(draw, x, y, w):
    text(draw,(x+18,y+9),"9:41",11,True,INK)
    bx=x+w-28
    rr(draw,(bx,y+10,bx+16,y+19),2,fill=INK)
    draw.rectangle((bx+2,y+12,bx+11,y+17),fill=WHITE)
    for i in range(4):
        hh=3+i*2
        draw.rectangle((x+w-65+i*4,y+20-hh,x+w-63+i*4,y+20),fill=INK)

def home_header(draw, sx, sy, sw, active):
    rr(draw,(sx,sy,sx+sw,sy+148),26,fill=WHITE)
    draw.rectangle((sx,sy+80,sx+sw,sy+148),fill=WHITE)
    status(draw,sx,sy,sw)
    # brand
    rr(draw,(sx+18,sy+28,sx+50,sy+60),9,fill="#FDBA74")
    paw(draw,sx+34,sy+42,4.4)
    text(draw,(sx+58,sy+35),"PetTalk",18,True,INK)
    text(draw,(sx+sw-22,sy+38),"···",17,True,MUTED,anchor="rm")
    draw.ellipse((sx+sw-38,sy+34,sx+sw-22,sy+50),outline=INK,width=2)
    draw.ellipse((sx+sw-33,sy+39,sx+sw-27,sy+45),fill=INK)
    # search
    rr(draw,(sx+16,sy+70,sx+sw-16,sy+106),18,fill="#F2F4F7")
    search_icon(draw,sx+35,sy+88)
    text(draw,(sx+50,sy+82),"搜索频道和帖子",12,False,"#A2A8B0")
    # tabs
    tabs=[("热门",sx+56),("频道",sx+sw/2+30)]
    for i,(label,cx) in enumerate(tabs):
        on=(i==active)
        text(draw,(cx,sy+128),label,13,on,INK if on else "#7F8790",anchor="mm")
        if on:
            rr(draw,(cx-12,sy+143,cx+12,sy+146),2,fill=ORANGE)

def bottom_tab(draw,sx,sy,sw,sh,selected=0):
    y=sy+sh-58
    draw.rectangle((sx,y,sx+sw,sy+sh),fill=WHITE)
    draw.line((sx,y,sx+sw,y),fill="#F0F1F3",width=1)
    items=[("首页",sx+sw/6),("发布+",sx+sw/2),("我的",sx+5*sw/6)]
    for i,(label,cx) in enumerate(items):
        on=(i==selected)
        color=ORANGE if on else "#9AA0A6"
        if i==1:
            rr(draw,(cx-17,y+10,cx+17,y+44),12,fill=ORANGE if on else "#F2F3F5")
            text(draw,(cx,y+27),"+",20,True,WHITE if on else "#8F969F",anchor="mm")
            text(draw,(cx,y+51),label,9.5,on,color,anchor="mm")
        else:
            draw.ellipse((cx-7,y+14,cx+7,y+28),outline=color,width=2)
            text(draw,(cx,y+41),label,9.5,on,color,anchor="mm")

def post_card(draw,sx,sy,sw,title,name,time,channel,lines,img=True,hot=True):
    h=246 if img else 170
    rr(draw,(sx,sy,sx+sw,sy+h),18,fill=CARD)
    # avatar
    rr(draw,(sx+18,sy+18,sx+54,sy+54),18,fill="#DCE8FF")
    text(draw,(sx+36,sy+36),"宠",14,True,"#4C79C7",anchor="mm")
    text(draw,(sx+64,sy+20),name,12.5,True,INK)
    text(draw,(sx+64,sy+40),time,9.5,False,MUTED)
    if hot:
        rr(draw,(sx+sw-54,sy+20,sx+sw-16,sy+40),10,fill="#FFF0E6")
        text(draw,(sx+sw-35,sy+30),"热门",9,True,"#C65B10",anchor="mm")
    # channel chip
    rr(draw,(sx+18,sy+66,sx+18+tw(draw,channel,9.5)+22,sy+86),10,fill="#FFF4EB")
    text(draw,(sx+29,sy+76),channel,9.5,False,"#B45A16",anchor="lm")
    # title
    text(draw,(sx+18,sy+98),title,13.5,True,INK)
    yy=sy+122
    for line in lines:
        text(draw,(sx+18,yy),line,10.5,False,"#4B5563")
        yy+=17
    if img:
        gradient_box(draw,(sx+18,sy+158,sx+sw-18,sy+198),'#D9C0A8','#9E7D63',12) if False else None
        # simple warm placeholder
        rr(draw,(sx+18,sy+154,sx+sw-18,sy+198),12,fill="#F6E7D8")
        paw(draw,sx+sw/2,sy+176,15,(205,155,110,120))
        text(draw,(sx+sw/2,sy+176),"动态图片",10,False,"#B88B61",anchor="mm")
    # footer
    fy=sy+h-26
    heart(draw,sx+24,fy-1,5.5,"#F97316")
    text(draw,(sx+36,fy-7),"32",9.5,False,MUTED)
    chat_icon(draw,sx+74,fy-1,4.5)
    text(draw,(sx+84,fy-7),"8",9.5,False,MUTED)
    share_icon(draw,sx+sw-38,fy-1,5.5)
    text(draw,(sx+sw-54,fy-7),"转发",9.5,True,ORANGE)

def channel_card(draw,x,y,w,h,name,c1,c2,count,today):
    gradient_box(draw,(x,y,x+w,y+h),c1,c2,14)
    draw.ellipse((x+w-54,y-18,x+w+20,y+56),fill=(255,255,255,26))
    paw(draw,x+w-34,y+18,10,(255,255,255,150))
    text(draw,(x+16,y+18),name,17,True,WHITE)
    text(draw,(x+16,y+h-34),f"{count} 帖子",9.5,False,(255,255,255,225))
    text(draw,(x+16,y+h-18),f"今日 {today}",9.5,False,(255,255,255,210))

img=Image.new("RGB",(W,H),BG)
d=ImageDraw.Draw(img)
text(d,(80,34),"PetTalk 新功能草稿",24,True,INK)
text(d,(80,72),"频道只分宠物品类大类；热门仅展示热门帖子；转发调用微信好友分享。",13,False,"#636B75")

phones=[(100,125),(760,125),(1420,125)]
pw,ph=400,820

for i,(x,y) in enumerate(phones):
    rr(d,(x-8,y-8,x+pw+8,y+ph+8),32,fill="#DDE2E9")
    rr(d,(x,y,x+pw,y+ph),26,fill=WHITE)

# ---------- screen 1: hot posts ----------
sx,sy=pw and phones[0]
home_header(d,sx,sy,pw,0)
text(d,(sx+20,sy+168),"热门帖子",16,True,INK)
text(d,(sx+pw-20,sy+171),"按点赞 / 评论排序",9.5,False,MUTED,anchor="ra")
post_card(d,sx+18,sy+198,pw-36,"新手养猫必看：猫粮怎么选？","奶盖铲屎官","12 分钟前","猫咪频道",["整理了三个月的踩坑经验，","从配料表到适口性一次讲清。"],True,True)
post_card(d,sx+18,sy+458,pw-36,"周末带柯基去宠物公园","短腿饲养员","1 小时前","狗狗频道",["跑了一下午，回家直接睡成小猪。"],False,True)
# floating plus
rr(d,(sx+pw-58,sy+ph-120,sx+pw-22,sy+ph-84),18,fill=ORANGE)
text(d,(sx+pw-40,sy+ph-102),"+",24,True,WHITE,anchor="mm")
bottom_tab(d,sx,sy,pw,ph,0)

# ---------- screen 2: channels ----------
sx,sy=phones[1]
home_header(d,sx,sy,pw,1)
text(d,(sx+20,sy+168),"全部频道",16,True,INK)
text(d,(sx+20,sy+190),"按宠物大类浏览，不再细分品种",9.5,False,MUTED)
colors=[("猫咪","#F3A683","#E77F67",128,6),("狗狗","#7FB3D5","#5A8FB8",96,4),("小宠","#F5CD79","#E7A93C",54,2),("鸟类","#82C9A7","#4FA37C",38,1),("水族","#74B9FF","#4A8EDB",47,2),("爬宠","#A29BFE","#7A6FDB",33,1),("其他","#B2BEC3","#84939B",21,0)]
for i,(name,c1,c2,count,today) in enumerate(colors):
    col=i%2; row=i//2
    x=sx+18+col*186; y=sy+216+row*116
    channel_card(d,x,y,178,104,name,c1,c2,count,today)
bottom_tab(d,sx,sy,pw,ph,0)

# ---------- screen 3: detail + share ----------
sx,sy=phones[2]
rr(d,(sx,sy,sx+pw,sy+148),26,fill=WHITE)
d.rectangle((sx,sy+75,sx+pw,sy+148),fill=WHITE)
status(d,sx,sy,pw)
text(d,(sx+22,sy+42),"‹",28,False,INK)
text(d,(sx+pw/2,sy+48),"帖子详情",14,True,INK,anchor="mm")
# share icon top right
share_icon(d,sx+pw-34,sy+46,7,INK)
# post body
rr(d,(sx+16,sy+164,sx+pw-16,sy+540),18,fill=WHITE)
rr(d,(sx+34,sy+184,sx+70,sy+220),18,fill="#DCE8FF")
text(d,(sx+52,sy+202),"宠",14,True,"#4C79C7",anchor="mm")
text(d,(sx+80,sy+188),"奶盖铲屎官",13,True,INK)
text(d,(sx+80,sy+208),"12 分钟前 · 猫咪频道",9.5,False,MUTED)
rr(d,(sx+34,sy+238,sx+pw-34,sy+320),14,fill="#F7F8FA")
text(d,(sx+48,sy+252),"新手养猫必看：猫粮怎么选？",15,True,INK)
text(d,(sx+48,sy+278),"整理了三个月的踩坑经验，从配料表",10.5,False,"#4B5563")
text(d,(sx+48,sy+297),"到适口性一次讲清。",10.5,False,"#4B5563")
rr(d,(sx+34,sy+338,sx+pw-34,sy+438),14,fill="#F6E7D8")
paw(d,sx+pw/2,sy+388,21,(205,155,110,120))
text(d,(sx+pw/2,sy+388),"动态图片",11,False,"#B88B61",anchor="mm")
text(d,(sx+34,sy+462),"收藏这份选粮清单，少走弯路。",10.5,False,"#4B5563")
text(d,(sx+34,sy+490),"#猫咪日常  #新手养宠",9.5,False,"#7B8490")
# stats
text(d,(sx+34,sy+516),"32 赞 · 8 评论",9.5,False,MUTED)
# bottom action bar
by=sy+ph-72
d.rectangle((sx,by,sx+pw,sy+ph),fill=WHITE)
d.line((sx,by,sx+pw,by),fill="#F0F1F3",width=1)
rr(d,(sx+16,by+16,sx+220,by+50),18,fill="#F3F5F7")
text(d,(sx+32,by+33),"说点什么...",10.5,False,"#A2A8B0",anchor="lm")
heart(d,sx+246,by+31,6.5,ORANGE)
text(d,(sx+258,by+25),"点赞",9.5,True,"#6F7780")
chat_icon(d,sx+300,by+31,5.5)
text(d,(sx+312,by+25),"评论",9.5,True,"#6F7780")
rr(d,(sx+344,by+15,sx+pw-16,by+52),19,fill="#FFF1E7")
share_icon(d,sx+357,by+31,5.5)
text(d,(sx+368,by+25),"转发",10,True,ORANGE)
# share hint bubble
rr(d,(sx+166,by-70,sx+pw-20,by-16),14,fill="#1F2937")
text(d,(sx+184,by-57),"点击转发，打开微信",10,True,WHITE)
text(d,(sx+184,by-38),"选择好友发送帖子卡片",10,False,"#E5E7EB")
d.polygon([(sx+pw-52,by-16),(sx+pw-40,by-2),(sx+pw-30,by-16)],fill="#1F2937")
# preview card
rr(d,(sx+38,by-164,sx+pw-38,by-82),12,fill=WHITE,outline="#E6E9ED")
rr(d,(sx+48,by-154,sx+118,by-92),8,fill="#F6E7D8")
paw(d,sx+83,by-123,10,(205,155,110,120))
text(d,(sx+130,by-150),"新手养猫必看：猫粮怎么选？",10.5,True,INK)
text(d,(sx+130,by-126),"PetTalk 小程序",9,False,MUTED)
text(d,(sx+130,by-108),"点击查看完整帖子",9,False,ORANGE)

# captions
notes=[
    ("① 热门帖子","首页默认展示，按互动热度排序，不再叫“热门分享”。"),
    ("② 频道","只保留猫咪、狗狗、小宠、鸟类、水族、爬宠、其他大类。"),
    ("③ 转发给好友","详情页点击“转发”，调用微信原生好友分享卡片。"),
]
for i,(tag,desc) in enumerate(notes):
    x=100+i*660
    text(d,(x,1010),tag,14,True,ORANGE)
    text(d,(x,1040),desc,11,False,"#59616B")

img.save(r"docs/design/channel-hot-share-draft.png", quality=95)
print("saved", img.size)

