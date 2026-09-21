# -*- coding: utf-8 -*-
"""مخطط المشروع الكامل بأسلوب هندسي: يولّد من نموذج واحد
  - public/diagram/dropship-ar.drawio  (صفحتان: العربية والإنجليزية، الصور تُحمَّل من الموقع)
  - public/diagram/architecture-{ar,en}-{light,dark}.svg  (الصور مضمّنة داخل الملف)
  - public/diagram/thumbs/*  (مصغّرات الصور + خريطة المناطق) و public/diagram/icons/*.svg
  - src/stages.json (المراحل للموقع)

    python scripts/diagram.py
"""
import base64
import html
import json
import os
import re
import sys

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "diagram")
THUMBS = os.path.join(OUT, "thumbs")
ICONS = os.path.join(OUT, "icons")
for d in (OUT, THUMBS, ICONS):
    os.makedirs(d, exist_ok=True)
SITE = "https://ryanathlawi.github.io/dropship-site/"

W, H = 1920, 1400
VERSION = "v3.1.4"


def T(ar, en):
    return {"ar": ar, "en": en}


# ------------------------------------------------------------------ الألوان
PAL = {
    "dark": {
        "bg": "#0a1017", "grid": "#121b25", "text": "#eef4f6", "muted": "#9fb3bd", "faint": "#5f7380",
        "card": "#111a24", "card_line": "#22303d", "edge": "#c7d2dc", "label_bg": "#0f1720",
        "zone": {"pc": ("#0d151d", "#2f4152", "#7dd3fc"), "bliz": ("#160f0b", "#5b3a1f", "#fb923c"),
                 "up": ("#171208", "#5f4a14", "#fbbf24"), "ar": ("#081716", "#155e56", "#2dd4bf"),
                 "stages": ("#0f0d1a", "#3b2f6b", "#a78bfa")},
        "shot_line": "#2c3a48", "accent": "#2dd4bf", "gold": "#fbbf24",
    },
    "light": {
        "bg": "#f4f7fa", "grid": "#e6ecf2", "text": "#0b1220", "muted": "#4b5b68", "faint": "#8a99a6",
        "card": "#ffffff", "card_line": "#d9e1ea", "edge": "#334155", "label_bg": "#f4f7fa",
        "zone": {"pc": ("#eef3f8", "#b9c8d6", "#0369a1"), "bliz": ("#fff4ea", "#f5c9a3", "#c2410c"),
                 "up": ("#fff8e6", "#f2d98a", "#a16207"), "ar": ("#e9faf6", "#8fdcd0", "#0f766e"),
                 "stages": ("#f1eefc", "#c9bdf3", "#6d28d9")},
        "shot_line": "#c9d3dd", "accent": "#0f766e", "gold": "#b45309",
    },
}

# ------------------------------------------------------------------ الأيقونات (lucide)
LUCIDE = os.path.join(ROOT, "node_modules", "lucide-react", "dist", "esm", "icons")
ICON_CACHE = {}


def icon_nodes(name):
    """يقرأ عناصر أيقونة lucide من حزمة الموقع: [(tag, {attr: value})]"""
    if name in ICON_CACHE:
        return ICON_CACHE[name]
    src = open(os.path.join(LUCIDE, f"{name}.mjs"), encoding="utf-8").read()
    alias = re.search(r"export \{ default \} from './([\w-]+)\.mjs'", src)
    if alias:  # بعض الأسماء مجرد اسم بديل لأيقونة أخرى
        return icon_nodes(alias.group(1))
    body = src[src.index("node: [") + 6:]
    nodes = []
    for m in re.finditer(r'\[\s*"(\w+)",\s*\{([^}]*)\}\s*\]', body):
        attrs = dict(re.findall(r'(\w+):\s*"([^"]*)"', m.group(2)))
        for k, v in re.findall(r'(\w+):\s*([\d.]+)', m.group(2)):
            attrs.setdefault(k, v)
        attrs.pop("key", None)
        nodes.append((m.group(1), attrs))
    ICON_CACHE[name] = nodes
    return nodes


def icon_svg_inner(name, color, x, y, size):
    s = size / 24
    parts = [f'<g transform="translate({x:.1f} {y:.1f}) scale({s:.4f})" fill="none" stroke="{color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">']
    for tag, attrs in icon_nodes(name):
        parts.append(f"<{tag} " + " ".join(f'{k}="{v}"' for k, v in attrs.items()) + "/>")
    parts.append("</g>")
    return "".join(parts)


def write_icon_file(name, color):
    inner = "".join(f"<{tag} " + " ".join(f'{k}="{v}"' for k, v in attrs.items()) + "/>" for tag, attrs in icon_nodes(name))
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#{color.lstrip("#")}" '
           f'stroke-width="2" stroke-linecap="round" stroke-linejoin="round">{inner}</svg>')
    fn = f"{name}-{color.lstrip('#')}.svg"
    with open(os.path.join(ICONS, fn), "w", encoding="utf-8") as f:
        f.write(svg)
    return f"{SITE}diagram/icons/{fn}"


# ------------------------------------------------------------------ الصور المصغّرة
def thumb(src, name, w, h):
    """يقصّ الصورة لنسبة w:h ويصغّرها إلى webp؛ يعيد (المسار النسبي، base64)"""
    im = Image.open(os.path.join(ROOT, "public", src)).convert("RGB")
    ar_src, ar_dst = im.width / im.height, w / h
    if ar_src > ar_dst:
        nw = int(im.height * ar_dst)
        im = im.crop(((im.width - nw) // 2, 0, (im.width - nw) // 2 + nw, im.height))
    elif ar_src < ar_dst:
        nh = int(im.width / ar_dst)
        im = im.crop((0, 0, im.width, nh))
    im = im.resize((w * 2, h * 2), Image.LANCZOS)
    path = os.path.join(THUMBS, f"{name}.webp")
    im.save(path, quality=78, method=6)
    return f"thumbs/{name}.webp", base64.b64encode(open(path, "rb").read()).decode()


REGIONS = [  # (code, lat, lon)
    ("ams1", 52.37, 4.9), ("gen1", 60.57, 27.2), ("gmec2", 26.43, 50.1), ("gsg1", 1.35, 103.82), ("gtk1", 35.68, 139.69),
    ("tpe1", 25.03, 121.57), ("syd2", -33.87, 151.21), ("gue4", 38.95, -77.45), ("ord1", 41.88, -87.63),
    ("las1", 36.17, -115.14), ("gbr1", -23.55, -46.63),
]
YOU = (24.7, 46.7)


def regions_map(theme, w=560, h=236):
    """خريطة العالم المنقّطة مع المناطق ومسارات منك إليها، من قناع src/world.ts"""
    src = open(os.path.join(ROOT, "src", "world.ts"), encoding="utf-8").read()
    rows = re.findall(r'"([01]{180})"', src)
    lat_top, lat_bot = 84.0, -58.0
    pal = PAL[theme]
    S = 2
    bg = tuple(int(pal["zone"]["bliz"][0].lstrip("#")[i:i + 2], 16) for i in (0, 2, 4))
    im = Image.new("RGB", (w * S, h * S), bg)
    d = ImageDraw.Draw(im)
    dot = (56, 116, 108) if theme == "dark" else (150, 190, 180)
    cw, ch = w * S / 180, h * S / len(rows)
    for j, row in enumerate(rows):
        for i, c in enumerate(row):
            if c == "1":
                cx, cy = i * cw + cw / 2, j * ch + ch / 2
                d.ellipse((cx - 1.7, cy - 1.7, cx + 1.7, cy + 1.7), fill=dot)

    def proj(lat, lon):
        return ((lon + 180) / 360 * w * S, (lat_top - lat) / (lat_top - lat_bot) * h * S)

    font = ImageFont.truetype("C:/Windows/Fonts/consola.ttf", 11 * S)
    ac = (45, 212, 191) if theme == "dark" else (15, 118, 110)
    gold = (251, 191, 36) if theme == "dark" else (180, 83, 9)
    yx, yy = proj(*YOU)
    for code, lat, lon in REGIONS:
        x, y = proj(lat, lon)
        mx, my = (yx + x) / 2, (yy + y) / 2 - abs(x - yx) * 0.18
        pts = [(yx * (1 - t) ** 2 + 2 * mx * t * (1 - t) + x * t ** 2, yy * (1 - t) ** 2 + 2 * my * t * (1 - t) + y * t ** 2)
               for t in [k / 24 for k in range(25)]]
        for k in range(0, 24, 2):
            d.line([pts[k], pts[k + 1]], fill=ac, width=2)
    for code, lat, lon in REGIONS:
        x, y = proj(lat, lon)
        col = gold if code == "gmec2" else ac
        d.ellipse((x - 9, y - 9, x + 9, y + 9), outline=col, width=2)
        d.ellipse((x - 4, y - 4, x + 4, y + 4), fill=col)
        tw = d.textlength(code, font=font)
        tx = x + 12 if x < w * S - 90 else x - 12 - tw
        d.rectangle((tx - 4, y - 9, tx + tw + 4, y + 9), fill=bg)
        d.text((tx, y - 8), code, font=font, fill=(238, 244, 246) if theme == "dark" else (11, 18, 32))
    d.ellipse((yx - 6, yy - 6, yx + 6, yy + 6), fill=(255, 255, 255) if theme == "dark" else (11, 18, 32))
    path = os.path.join(THUMBS, f"regions-{theme}.png")
    im.save(path, optimize=True)
    return f"thumbs/regions-{theme}.png", base64.b64encode(open(path, "rb").read()).decode()


# ------------------------------------------------------------------ المحتوى
STAGES = [
    ("2026-08", "img/en-expanded.webp",
     T(["الأصل: dropship v3", "من stormy — إعادة كتابة كاملة، واجهة إنجليزية، حظر عبر WFP"],
       ["Origin: dropship v3", "by stormy — a full rewrite, English UI, WFP blocking"])),
    ("2026-09-19", "img/stage-ar-v30.webp",
     T(["النسخة العربية 3.0.6–3.0.8", "تعريب كامل، خط ثمانية، ترحيب وجولة، إصلاحان للأصل"],
       ["Arabic edition 3.0.6–3.0.8", "full RTL UI, Thmanyah font, welcome + tour, two fixes upstream"])),
    ("2026-09-19", "img/stage-site.webp",
     T(["الموقع", "React 19 + Vite، عربي/إنجليزي، إحصائيات حيّة، نسخة تجريبية"],
       ["The website", "React 19 + Vite, Arabic/English, live stats, playable replica"])),
    ("2026-09-20", "img/ar-presets.webp",
     T(["تصميم الواجهة", "لوحة تحكم ✗ → HUD ✗ → لانشر ✓ · تيل على غرافيت"],
       ["Designing the UI", "dashboard ✗ → HUD ✗ → launcher ✓ · teal on graphite"])),
    ("2026-09-21", "img/ar-main-dark.webp",
     T(["v3.1.0 — اللانشر", "خريطة حيّة، أعلام، أفضل مسار، اختصارات بمفاتيح"],
       ["v3.1.0 — the launcher", "live map, flags, best route, hotkey presets"])),
    ("2026-09-21", "img/stage-credits.webp",
     T(["v3.1.1 — الحقوق والتواصل", "ديسكورد عربي، دعم PayPal، معلومات الإصدار في الـ exe"],
       ["v3.1.1 — credits & contact", "Arabic Discord, PayPal, exe version info"])),
    ("2026-09-21", "img/stage-ping.webp",
     T(["v3.1.2 — بنق حيّ", "كل 15 ث لكل السيرفرات، حتى اللي تتجاهل الـ ping"],
       ["v3.1.2 — live ping", "every 15 s for every server, even silent ones"])),
    ("2026-09-21", "img/stage-mobile.webp",
     T(["الجوال + المخطط", "اللانشر كتطبيق جوال، وهذا المخطط في الموقع"],
       ["Phones + this map", "the launcher as a mobile app, and this map on the site"])),
]

CALLOUTS = [  # (x, y داخل لقطة 1001×698، {ar, en})
    ((600, 300), T(["الخريطة", "مسارات منك لكل سيرفر مسموح، نقرة = حظر"], ["The map", "routes from you to every allowed server; click = block"])),
    ((177, 380), T(["لوحة السيرفرات", "علم، اسم، بنق حيّ، مفتاح، ترتيب حسب البنق"], ["Servers panel", "flag, name, live ping, switch, sort by ping"])),
    ((254, 155), T(["الاختصارات", "أوروبا = F1، وأنشئ اختصارك: اسم ومفتاح وسيرفرات"], ["Presets", "Europe = F1; make your own: name, key, servers"])),
    ((780, 585), T(["أفضل مسار", "أقل بنق مسموح · دائم / أثناء التشغيل"], ["Best route", "lowest allowed ping · permanent / while open"])),
    ((971, 200), T(["الشريط الجانبي", "الخريطة، الألعاب، الأخبار، السجل، المساعدة، الخيارات"], ["Side rail", "map, games, news, log, help, options"])),
    ((640, 55), T(["الحالة", "الفلتر شغّال؟ كم محظور؟ اللعبة مفتوحة؟"], ["Status chips", "filter on? how many blocked? game open?"])),
    ((500, 677), T(["الاختصارات والحالة", "Esc · L · R · F1 وآخر رسالة من السجل"], ["Keys & status", "Esc · L · R · F1 and the latest log line"])),
]

MODULES = [  # (icon, {ar, en})
    ("shield-check", T(["الجدار الناري", "فلاتر WFP دائمة أو مؤقتة"], ["Firewall", "WFP filters, permanent/session"])),
    ("activity", T(["البنق", "IcmpSendEcho كل 15 ث"], ["Ping", "IcmpSendEcho every 15 s"])),
    ("gamepad-2", T(["اللعبة", "sysinfo كل 0.9 ث"], ["Game", "sysinfo every 0.9 s"])),
    ("refresh-cw", T(["المحدّث", "GitHub كل 2.5 س → exe"], ["Updater", "GitHub 2.5 h → swaps exe"])),
    ("list", T(["قائمة السيرفرات", "ips.json كل 15 د"], ["Server list", "ips.json every 15 min"])),
    ("settings-2", T(["الإعدادات", "app.ron: محظور، اختصارات"], ["Config", "app.ron: blocked, presets"])),
    ("terminal", T(["السجل", "بالعربي + شريط الحالة"], ["Log", "Arabic + status bar"])),
    ("clock", T(["المجدوِل", "مؤقتات tokio"], ["Scheduler", "tokio timers"])),
    ("zap", T(["الأوامر ← الأحداث", "الواجهة ↔ المهام"], ["Commands → events", "UI ↔ tasks"])),
]

UNDER = [
    ("hard-drive", T(["الحالة المحفوظة", "app.ron · كل 30 ث"], ["Persisted state", "app.ron · every 30 s"])),
    ("map-pin", T(["موقعك", "منطقة ويندوز → عاصمتك"], ["Your location", "Windows region → capital"])),
    ("sparkles", T(["النسخة المتحركة", "25 إطارًا والنافذة مركّزة"], ["Animated build", "25 fps while focused"])),
]

TXT = {
    "title": T("dropship — النسخة العربية · المخطط الهندسي للمشروع", "dropship — Arabic edition · engineering map of the project"),
    "subtitle": T("كيف يشتغل البرنامج من اللعبة إلى السيرفر، وما بُني حوله — تطوير ريان الأثلاوي، مبني على dropship من stormy",
                  "How the app works from the game to the server, and everything built around it — developed by Ryan Athlawi, built on dropship by stormy"),
    "chips": T([VERSION, "GPL-3.0", "Rust · egui 0.36", "Windows 10/11"], [VERSION, "GPL-3.0", "Rust · egui 0.36", "Windows 10/11"]),
    "z_pc": T("01 · جهاز اللاعب", "01 · Player's PC"),
    "z_bliz": T("02 · Blizzard والإنترنت", "02 · Blizzard & the internet"),
    "z_up": T("03 · الأصل — stormy", "03 · Upstream — stormy"),
    "z_ar": T("04 · النسخة العربية — ريان الأثلاوي", "04 · Arabic edition — Ryan Athlawi"),
    "z_stages": T("05 · مراحل التطوير", "05 · Development stages"),
    "app": T(f"dropship — النسخة العربية {VERSION} · Rust · eframe/egui · tokio", f"dropship — Arabic edition {VERSION} · Rust · eframe/egui · tokio"),
    "ow": T(["Overwatch 2", "Overwatch.exe عبر Battle.net أو Steam"], ["Overwatch 2", "Overwatch.exe via Battle.net or Steam"]),
    "wfp": T(["جدار حماية ويندوز (WFP)", "فلاتر dropship ترمي حركة Overwatch.exe إلى نطاقات المناطق المحظورة"],
             ["Windows Filtering Platform", "dropship's filters drop Overwatch.exe traffic to blocked regions' IP blocks"]),
    "mm": T(["تسجيل الدخول والماتش ميكر", "يختار أقرب منطقة يستطيع الوصول إليها — المحظورة لا تُختار أبدًا"],
            ["Login & matchmaker", "picks the nearest region it can reach — blocked ones are never picked"]),
    "regions": T("مناطق سيرفرات اللعبة — 11 منطقة، نطاقات IP من ips.json، والذهبي أقرب واحدة لك", "Game server regions — 11 regions, IP blocks from ips.json, gold = the one nearest you"),
    "ips": T(["ips.json", "الرمز، النطاقات، عنوان ping — من stormy"], ["ips.json", "code, IP blocks, ping IP — by stormy"]),
    "uprepo": T(["stowmyy/dropship", "الأصل: الحظر، اللعبة، المحدّث"], ["stowmyy/dropship", "original: blocking, game, updater"]),
    "shot_up": T("dropship v3 الأصلي (إنجليزي)", "the original dropship v3 (English)"),
    "repo": T(["dropship-ar", "الكود"], ["dropship-ar", "source"]),
    "actions": T(["Actions", "cargo xwin"], ["Actions", "cargo xwin"]),
    "rel": T(["Releases", "exe + متحرك"], ["Releases", "exe + animated"]),
    "users": T(["اللاعبون", "تحديث تلقائي"], ["Players", "auto-update"]),
    "site": T("dropship-site · React 19 · Vite · GitHub Pages", "dropship-site · React 19 · Vite · GitHub Pages"),
    "phone": T("على الجوال", "on phones"),
    "comm": T(["المجتمع", "ديسكورد · PayPal"], ["Community", "Discord · PayPal"]),
    "gh": T(["GitHub API", "إحصائيات الموقع"], ["GitHub API", "site stats"]),
    "shot_app": T("واجهة اللانشر — لقطة حقيقية من البرنامج، والأرقام مشروحة على اليمين", "the launcher — a real screenshot of the app; the numbers are explained on the right"),
    "layers": T("محرّك البرنامج", "The engine"),
    "under": T("تحت الغطاء", "Under the hood"),
    "legend": T("الأسهم: تدفق البيانات · المتقطّع: يتكرر دوريًا · الأرقام الذهبية على اللقطة تشرح كل جزء من الواجهة",
                "arrows: data flow · dashed: periodic · gold numbers on the screenshot explain each part of the UI"),
    "credit": T("تصميم وتطوير النسخة العربية: ريان الأثلاوي · الأصل: stormy (GPL-3.0) · 2026", "Arabic edition designed and developed by Ryan Athlawi · original by stormy (GPL-3.0) · 2026"),
    "e_traffic": T("حركة اللعبة (UDP)", "game traffic (UDP)"),
    "e_allowed": T("المناطق المسموحة فقط", "allowed regions only"),
    "e_filters": T("يضيف / يزيل الفلاتر", "adds / removes filters"),
    "e_running": T("هل اللعبة شغّالة؟ 0.9 ث", "game running? 0.9 s"),
    "e_ping": T("ping كل 15 ث", "ping every 15 s"),
    "e_list": T("القائمة كل 15 د", "list every 15 min"),
    "e_update": T("تحديث؟ كل 2.5 س", "update? every 2.5 h"),
    "e_fork": T("fork · GPL-3.0", "fork · GPL-3.0"),
}


# ------------------------------------------------------------------ التخطيط (بإحداثيات LTR تُعكس للعربية)
class Layout:
    def __init__(self, rtl):
        self.rtl = rtl
        self.items = []

    def X(self, x, w):
        return W - x - w if self.rtl else x

    def zone(self, key, x, y, w, h, title):
        self.items.append(("zone", dict(key=key, x=self.X(x, w), y=y, w=w, h=h, title=title)))

    def card(self, key, x, y, w, h, icon, lines, zone):
        self.items.append(("card", dict(key=key, x=self.X(x, w), y=y, w=w, h=h, icon=icon, lines=lines, zone=zone)))

    def image(self, key, x, y, w, h, src, b64, caption=None):
        self.items.append(("image", dict(key=key, x=self.X(x, w), y=y, w=w, h=h, src=src, b64=b64, caption=caption)))

    def text(self, key, x, y, w, size, txt, color="text", bold=False):
        self.items.append(("text", dict(key=key, x=self.X(x, w), y=y, w=w, size=size, txt=txt, color=color, bold=bold)))

    def edge(self, key, pts, label, lpos, dashed=False):
        p = [((W - x) if self.rtl else x, y) for x, y in pts]
        lp = ((W - lpos[0]) if self.rtl else lpos[0], lpos[1])
        self.items.append(("edge", dict(key=key, pts=p, label=label, lpos=lp, dashed=dashed)))

    def callout(self, key, x, y, n, mirror=True):
        self.items.append(("callout", dict(key=key, x=(W - x) if (self.rtl and mirror) else x, y=y, n=n)))

    def stage(self, key, x, y, w, src, b64, date, lines, idx):
        self.items.append(("stage", dict(key=key, x=self.X(x, w), y=y, w=w, src=src, b64=b64, date=date, lines=lines, idx=idx)))


def build(lang, assets):
    L = Layout(lang == "ar")
    tx = lambda k: TXT[k][lang]

    # 01 جهاز اللاعب
    L.zone("pc", 40, 150, 1180, 760, tx("z_pc"))
    L.card("ow", 80, 200, 300, 80, "gamepad-2", tx("ow"), "pc")
    L.card("wfp", 520, 200, 420, 80, "shield-check", tx("wfp"), "pc")
    L.zone("app", 70, 320, 1120, 560, tx("app"))
    sx, sy, sw, sh = 100, 372, 560, 390
    L.image("shot_app", sx, sy, sw, sh, *assets["launcher"], caption=tx("shot_app"))
    isx = L.X(sx, sw)  # اللقطة نفسها لا تُعكس، فالأرقام تُحسب من موضعها الفعلي
    for i, (pt, _) in enumerate(CALLOUTS):
        L.callout(f"c{i}", isx + pt[0] * sw / 1001, sy + pt[1] * sh / 698, i + 1, mirror=False)
    lx, ly = 690, 372
    for i, (_, label) in enumerate(CALLOUTS):
        # في العربية تُعكس الإحداثيات، فالرقم يقف يمين النص بعد العكس تلقائيًا
        L.callout(f"cl{i}", lx + 12, ly + 14 + i * 34, i + 1)
        L.text(f"ct{i}", lx + 32, ly + 4 + i * 34, 440, 12.5, label[lang][0], bold=True)
        L.text(f"cb{i}", lx + 32, ly + 19 + i * 34, 440, 10.5, label[lang][1], color="muted")
    L.text("layers", lx, 622, 460, 12, tx("layers"), color="faint", bold=True)
    for i, (icon, label) in enumerate(MODULES):
        col, row = i % 3, i // 3
        L.card(f"m{i}", lx + col * 160, 642 + row * 64, 150, 56, icon, label[lang], "pc")
    L.text("under", sx, 784, 560, 12, tx("under"), color="faint", bold=True)
    for i, (icon, label) in enumerate(UNDER):
        L.card(f"u{i}", sx + i * 190, 804, 180, 66, icon, label[lang], "pc")

    # 02 Blizzard
    L.zone("bliz", 1260, 150, 620, 410, tx("z_bliz"))
    L.card("mm", 1290, 200, 560, 70, "compass", tx("mm"), "bliz")
    L.image("regions", 1290, 292, 560, 236, *assets["regions"], caption=tx("regions"))

    # 03 الأصل
    L.zone("up", 1260, 590, 620, 280, tx("z_up"))
    L.card("ips", 1290, 640, 260, 95, "file-json", tx("ips"), "up")
    L.card("uprepo", 1290, 755, 260, 95, "git-fork", tx("uprepo"), "up")
    L.image("shot_up", 1580, 640, 270, 187, *assets["original"], caption=tx("shot_up"))

    # 04 النسخة العربية
    L.zone("ar", 1260, 900, 620, 400, tx("z_ar"))
    for i, (k, icon) in enumerate([("repo", "git-branch"), ("actions", "workflow"), ("rel", "package"), ("users", "download")]):
        L.card(k, 1290 + i * 145, 950, 135, 72, icon, tx(k), "ar")
    L.image("shot_site", 1290, 1062, 270, 142, *assets["site"], caption=tx("site"))
    L.image("shot_phone", 1580, 1062, 90, 162, *assets["phone"], caption=tx("phone"))
    L.card("comm", 1690, 1062, 160, 72, "users", tx("comm"), "ar")
    L.card("gh", 1690, 1150, 160, 60, "chart-bar", tx("gh"), "ar")

    # 05 المراحل
    L.zone("stages", 40, 930, 1180, 370, tx("z_stages"))
    for i, (date, src, label) in enumerate(STAGES):
        L.stage(f"s{i}", 62 + i * 146, 980, 136, *assets["stages"][i], date, label[lang], i)

    # الأسهم
    L.edge("e1", [(380, 240), (520, 240)], tx("e_traffic"), (450, 224))
    L.edge("e2", [(940, 240), (1100, 240), (1100, 235), (1290, 235)], tx("e_allowed"), (1180, 220))
    L.edge("e3", [(700, 320), (700, 280)], tx("e_filters"), (790, 300))
    L.edge("e4", [(200, 320), (200, 280)], tx("e_running"), (300, 300), dashed=True)
    L.edge("e5", [(1190, 410), (1225, 410), (1225, 400), (1290, 400)], tx("e_ping"), (1225, 378), dashed=True)
    L.edge("e6", [(1190, 687), (1290, 687)], tx("e_list"), (1242, 668), dashed=True)
    L.edge("e7", [(1190, 860), (1225, 860), (1225, 1040), (1652, 1040), (1652, 1022)], tx("e_update"), (1440, 1054), dashed=True)
    L.edge("e8", [(1355, 850), (1355, 950)], tx("e_fork"), (1420, 872))
    L.edge("e9", [(1425, 986), (1435, 986)], "", (0, 0))
    L.edge("e10", [(1570, 986), (1580, 986)], "", (0, 0))
    L.edge("e11", [(1715, 986), (1725, 986)], "", (0, 0))
    return L


# ------------------------------------------------------------------ SVG
def render_svg(L, lang, theme):
    pal = PAL[theme]
    rtl = L.rtl
    esc = html.escape
    font = "'IBM Plex Sans Arabic','Thmanyah Sans',system-ui,sans-serif" if rtl else "Inter,system-ui,sans-serif"
    mono = "'DM Mono','JetBrains Mono',Consolas,monospace"
    o = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-label="{esc(TXT["title"][lang])}" lang="{lang}" direction="{"rtl" if rtl else "ltr"}">',
         f'<style>text{{font-family:{font};direction:{"rtl" if rtl else "ltr"};unicode-bidi:plaintext}}.m{{font-family:{mono}}}</style>',
         f'<defs><pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="{pal["grid"]}" stroke-width="1"/></pattern>'
         f'<marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="{pal["edge"]}"/></marker>'
         f'<filter id="sh" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000" flood-opacity="{0.45 if theme == "dark" else 0.12}"/></filter></defs>',
         f'<rect width="{W}" height="{H}" fill="{pal["bg"]}"/><rect width="{W}" height="{H}" fill="url(#g)"/>']

    def txt(x, y, size, s, color, bold=False, mono_=False, anchor="start"):
        cls = ' class="m"' if mono_ else ""
        return (f'<text{cls} x="{x:.0f}" y="{y:.0f}" font-size="{size}" font-weight="{700 if bold else 400}" fill="{color}" '
                f'text-anchor="{anchor}">{esc(s)}</text>')

    # الترويسة
    hx = W - 60 if rtl else 60
    o.append(f'<circle cx="{hx}" cy="60" r="30" fill="{pal["accent"]}"/>')
    o.append(icon_svg_inner("zap", pal["bg"], hx - 16, 44, 32))
    tx0 = W - 110 if rtl else 110
    o.append(txt(tx0, 52, 26, TXT["title"][lang], pal["text"], bold=True))
    o.append(txt(tx0, 84, 13.5, TXT["subtitle"][lang], pal["muted"]))
    offset = 0
    for c in TXT["chips"][lang][::-1]:
        cw = len(c) * 7.6 + 26
        xx = (60 + offset) if rtl else (W - 60 - offset - cw)
        o.append(f'<rect x="{xx:.0f}" y="44" width="{cw:.0f}" height="30" rx="15" fill="{pal["card"]}" stroke="{pal["card_line"]}"/>')
        o.append(txt(xx + cw / 2, 63, 12, c, pal["text"], mono_=True, anchor="middle"))
        offset += cw + 10
    o.append(f'<line x1="40" y1="118" x2="{W - 40}" y2="118" stroke="{pal["card_line"]}"/>')

    for kind, it in L.items:
        if kind != "zone":
            continue
        inner = it["key"] == "app"
        fill, line, acc = pal["zone"]["pc" if inner else it["key"]]
        dash = "" if inner else ' stroke-dasharray="10 7"'
        o.append(f'<rect x="{it["x"]}" y="{it["y"]}" width="{it["w"]}" height="{it["h"]}" rx="18" fill="{pal["card"] if inner else fill}" '
                 f'stroke="{line}" stroke-width="{1.5 if inner else 2}"{dash} opacity="{0.92 if inner else 1}"/>')
        tw = len(it["title"]) * (8.4 if rtl else 8.0) + 40
        tx_ = it["x"] + it["w"] - 16 - tw if rtl else it["x"] + 16
        o.append(f'<rect x="{tx_:.0f}" y="{it["y"] - 16}" width="{tw:.0f}" height="32" rx="10" fill="{acc}"/>')
        o.append(txt(tx_ + tw / 2, it["y"] + 5, 13 if inner else 14, it["title"], pal["bg"] if theme == "dark" else "#ffffff", bold=True, anchor="middle"))

    for kind, it in L.items:
        if kind == "card":
            acc = pal["zone"][it["zone"]][2]
            o.append(f'<rect x="{it["x"]}" y="{it["y"]}" width="{it["w"]}" height="{it["h"]}" rx="12" fill="{pal["card"]}" stroke="{pal["card_line"]}" stroke-width="1.2" filter="url(#sh)"/>')
            isz = 22 if it["h"] >= 66 else 18
            ix = it["x"] + it["w"] - 12 - isz if rtl else it["x"] + 12
            iy = it["y"] + (it["h"] - isz) / 2
            o.append(f'<rect x="{ix - 6:.0f}" y="{iy - 6:.0f}" width="{isz + 12}" height="{isz + 12}" rx="9" fill="{acc}" opacity="0.14"/>')
            o.append(icon_svg_inner(it["icon"], acc, ix, iy, isz))
            tx_ = it["x"] + it["w"] - 12 - isz - 18 if rtl else it["x"] + 12 + isz + 18
            lines = it["lines"]
            lh = 14
            base = it["y"] + it["h"] / 2 - ((len(lines) - 1) * lh) / 2 + 4
            for i, ln in enumerate(lines):
                o.append(txt(tx_, base + i * lh, 12.5 if i == 0 else 10.5, ln, pal["text"] if i == 0 else pal["muted"], bold=(i == 0)))
        elif kind == "image":
            o.append(f'<rect x="{it["x"] - 4}" y="{it["y"] - 4}" width="{it["w"] + 8}" height="{it["h"] + 8}" rx="10" fill="{pal["card"]}" stroke="{pal["shot_line"]}" filter="url(#sh)"/>')
            mime = "image/png" if it["src"].endswith(".png") else "image/webp"
            o.append(f'<image x="{it["x"]}" y="{it["y"]}" width="{it["w"]}" height="{it["h"]}" href="data:{mime};base64,{it["b64"]}" preserveAspectRatio="xMidYMid slice"/>')
            if it["caption"]:
                o.append(txt(it["x"] + it["w"] if rtl else it["x"], it["y"] + it["h"] + 20, 10.5, it["caption"], pal["muted"]))
        elif kind == "callout":
            o.append(f'<circle cx="{it["x"]:.0f}" cy="{it["y"]:.0f}" r="11" fill="{pal["gold"]}" stroke="{pal["bg"]}" stroke-width="2"/>')
            o.append(txt(it["x"], it["y"] + 4, 11, str(it["n"]), pal["bg"] if theme == "dark" else "#ffffff", bold=True, mono_=True, anchor="middle"))
        elif kind == "text":
            o.append(txt(it["x"] + it["w"] if rtl else it["x"], it["y"] + it["size"], it["size"], it["txt"], pal[it["color"]], bold=it["bold"]))
        elif kind == "stage":
            x, y, w = it["x"], it["y"], it["w"]
            acc = pal["zone"]["stages"][2]
            ih = int((w - 16) * 0.7)
            o.append(f'<rect x="{x}" y="{y}" width="{w}" height="270" rx="12" fill="{pal["card"]}" stroke="{pal["card_line"]}" filter="url(#sh)"/>')
            o.append(f'<image x="{x + 8}" y="{y + 8}" width="{w - 16}" height="{ih}" href="data:image/webp;base64,{it["b64"]}" preserveAspectRatio="xMidYMid slice"/>')
            ty = y + 8 + ih + 20
            o.append(txt(x + w / 2, ty, 10, it["date"], acc, mono_=True, anchor="middle"))
            o.append(txt(x + w / 2, ty + 18, 11.5, it["lines"][0], pal["text"], bold=True, anchor="middle"))
            words, lines, cur = it["lines"][1].split(" "), [], ""
            for wd in words:
                if len(cur) + len(wd) > 22 and cur:
                    lines.append(cur)
                    cur = wd
                else:
                    cur = (cur + " " + wd).strip()
            lines.append(cur)
            for i, ln in enumerate(lines[:4]):
                o.append(txt(x + w / 2, ty + 34 + i * 13, 9.5, ln, pal["muted"], anchor="middle"))
            o.append(f'<circle cx="{x + w / 2}" cy="{y + 285}" r="5" fill="{acc}"/>')
            if it["idx"] < len(STAGES) - 1:
                step = (w + 10) if not rtl else -(w + 10)
                o.append(f'<line x1="{x + w / 2 + (6 if not rtl else -6)}" y1="{y + 285}" x2="{x + w / 2 + step - (6 if not rtl else -6)}" y2="{y + 285}" stroke="{acc}" stroke-width="2" stroke-dasharray="4 4"/>')

    for kind, it in L.items:
        if kind != "edge":
            continue
        d = " ".join(f"{'M' if i == 0 else 'L'}{px:.0f} {py:.0f}" for i, (px, py) in enumerate(it["pts"]))
        dash = ' stroke-dasharray="6 5"' if it["dashed"] else ""
        o.append(f'<path d="{d}" fill="none" stroke="{pal["edge"]}" stroke-width="2"{dash} marker-end="url(#arr)"/>')
        if it["label"]:
            lx, ly = it["lpos"]
            tw = len(it["label"]) * (6.6 if rtl else 6.3) + 16
            o.append(f'<rect x="{lx - tw / 2:.0f}" y="{ly - 9}" width="{tw:.0f}" height="18" rx="6" fill="{pal["label_bg"]}" stroke="{pal["card_line"]}"/>')
            o.append(txt(lx, ly + 4, 10.5, it["label"], pal["muted"], anchor="middle"))

    fx = W - 40 if rtl else 40
    o.append(txt(fx, 1338, 11.5, TXT["legend"][lang], pal["muted"]))
    o.append(txt(fx, 1360, 11.5, TXT["credit"][lang], pal["faint"]))
    o.append("</svg>\n")
    return "".join(o)


# ------------------------------------------------------------------ draw.io
def render_drawio(L, lang, page_id):
    pal = PAL["light"]
    rtl = L.rtl
    esc = lambda s: html.escape(s, quote=True)
    tdir = "textDirection=rtl;" if rtl else ""
    # draw.io يعكس معنى align مع textDirection=rtl (وبدون whiteSpace=wrap يفيض النص خارج الصندوق)،
    # فالمحاذاة إلى بداية السطر في الاتجاهين هي align=left مع لفّ النص دائمًا
    align = "left"
    cells = ['<mxCell id="0"/>', '<mxCell id="1" parent="0"/>']
    P = page_id
    # الصور تُحمَّل من الموقع مع رقم نسخة حتى لا تعلق نسخة قديمة في كاش draw.io
    img_v = "?v=" + VERSION.lstrip("v")

    def add(c):
        cells.append(c)

    def vertex(cid, x, y, w, h, style, value=""):
        add(f'<mxCell id="{cid}_{P}" value="{esc(value)}" style="{style}" vertex="1" parent="1"><mxGeometry x="{x:.0f}" y="{y:.0f}" width="{w:.0f}" height="{h:.0f}" as="geometry"/></mxCell>')

    vertex("hdr_logo", W - 90 if rtl else 30, 30, 60, 60, f"ellipse;fillColor={pal['accent']};strokeColor=none;")
    vertex("hdr_logo_i", W - 76 if rtl else 44, 44, 32, 32, f"shape=image;image={write_icon_file('zap', 'ffffff')};")
    vertex("hdr", W - 1310 if rtl else 110, 30, 1200, 60, f"text;html=1;whiteSpace=wrap;align={align};verticalAlign=middle;fontSize=22;fontColor={pal['text']};{tdir}",
           f"<b>{TXT['title'][lang]}</b><br><font style=\"font-size:12px\" color=\"{pal['muted']}\">{TXT['subtitle'][lang]}</font>")
    offset = 0
    for i, c in enumerate(TXT["chips"][lang][::-1]):
        cw = len(c) * 7.6 + 26
        x = (60 + offset) if rtl else (W - 60 - offset - cw)
        vertex(f"chip{i}", x, 44, cw, 30, f"rounded=1;arcSize=50;html=1;fillColor={pal['card']};strokeColor={pal['card_line']};fontSize=11;fontFamily=Consolas;fontColor={pal['text']};", c)
        offset += cw + 10

    for kind, it in L.items:
        if kind == "zone":
            inner = it["key"] == "app"
            fill, line, acc = pal["zone"]["pc" if inner else it["key"]]
            vertex(it["key"], it["x"], it["y"], it["w"], it["h"],
                   f"rounded=1;arcSize=4;html=1;fillColor={pal['card'] if inner else fill};strokeColor={line};strokeWidth=2;{'' if inner else 'dashed=1;'}fontSize=1;fontColor={fill};")
            tw = len(it["title"]) * 8.6 + 40
            tx_ = it["x"] + it["w"] - 16 - tw if rtl else it["x"] + 16
            vertex(it["key"] + "_t", tx_, it["y"] - 16, tw, 32, f"rounded=1;arcSize=40;html=1;fillColor={acc};strokeColor=none;fontColor=#ffffff;fontStyle=1;fontSize=13;{tdir}", it["title"])
    for kind, it in L.items:
        if kind == "card":
            acc = pal["zone"][it["zone"]][2]
            vertex(it["key"], it["x"], it["y"], it["w"], it["h"], f"rounded=1;arcSize=14;html=1;fillColor={pal['card']};strokeColor={pal['card_line']};shadow=1;fontSize=1;")
            isz = 22 if it["h"] >= 66 else 18
            ix = it["x"] + it["w"] - 12 - isz if rtl else it["x"] + 12
            iy = it["y"] + (it["h"] - isz) / 2
            vertex(it["key"] + "_i", ix, iy, isz, isz, f"shape=image;image={write_icon_file(it['icon'], acc)};")
            tx_ = it["x"] + 12 if rtl else it["x"] + 12 + isz + 14
            tw = it["w"] - 24 - isz - 14
            lines = it["lines"]
            value = f"<b>{lines[0]}</b>" + "".join(f'<br><font style="font-size:10px" color="{pal["muted"]}">{ln}</font>' for ln in lines[1:])
            vertex(it["key"] + "_l", tx_, it["y"], tw, it["h"], f"text;html=1;whiteSpace=wrap;align={align};verticalAlign=middle;fontSize=12;fontColor={pal['text']};{tdir}", value)
        elif kind == "image":
            vertex(it["key"], it["x"], it["y"], it["w"], it["h"], f"shape=image;imageAspect=0;image={SITE}diagram/{it['src']}{img_v};rounded=1;strokeColor={pal['shot_line']};shadow=1;")
            if it["caption"]:
                vertex(it["key"] + "_c", it["x"], it["y"] + it["h"] + 4, it["w"], 20, f"text;html=1;whiteSpace=wrap;align={align};verticalAlign=top;fontSize=10;fontColor={pal['muted']};{tdir}", it["caption"])
        elif kind == "callout":
            vertex(it["key"], it["x"] - 11, it["y"] - 11, 22, 22, f"ellipse;fillColor={pal['gold']};strokeColor=#ffffff;strokeWidth=2;fontColor=#ffffff;fontStyle=1;fontSize=11;fontFamily=Consolas;", str(it["n"]))
        elif kind == "text":
            vertex(it["key"], it["x"], it["y"], it["w"], it["size"] + 8, f"text;html=1;whiteSpace=wrap;overflow=hidden;align={align};verticalAlign=middle;fontSize={it['size']};fontColor={pal[it['color']]};{'fontStyle=1;' if it['bold'] else ''}{tdir}", it["txt"])
        elif kind == "stage":
            x, y, w = it["x"], it["y"], it["w"]
            acc = pal["zone"]["stages"][2]
            ih = int((w - 16) * 0.7)
            vertex(it["key"], x, y, w, 270, f"rounded=1;arcSize=10;html=1;fillColor={pal['card']};strokeColor={pal['card_line']};shadow=1;fontSize=1;")
            vertex(it["key"] + "_i", x + 8, y + 8, w - 16, ih, f"shape=image;imageAspect=0;image={SITE}diagram/{it['src']}{img_v};rounded=1;")
            vertex(it["key"] + "_t", x + 6, y + 8 + ih + 4, w - 12, 270 - ih - 20,
                   f"text;html=1;whiteSpace=wrap;align=center;verticalAlign=top;fontSize=11;fontColor={pal['text']};{tdir}",
                   f'<font style="font-size:10px" color="{acc}">{it["date"]}</font><br><b>{it["lines"][0]}</b><br><font style="font-size:9px" color="{pal["muted"]}">{it["lines"][1]}</font>')
            vertex(it["key"] + "_d", x + w / 2 - 5, y + 280, 10, 10, f"ellipse;fillColor={acc};strokeColor=none;")
            if it["idx"] < len(STAGES) - 1:
                x1, x2 = (x + w / 2 + 6, x + w / 2 + w + 10 - 6) if not rtl else (x + w / 2 - 6, x + w / 2 - w - 10 + 6)
                add(f'<mxCell id="{it["key"]}_ln_{P}" style="edgeStyle=none;strokeColor={acc};strokeWidth=2;dashed=1;endArrow=none;" edge="1" parent="1">'
                    f'<mxGeometry relative="1" as="geometry"><mxPoint x="{x1:.0f}" y="{y + 285}" as="sourcePoint"/><mxPoint x="{x2:.0f}" y="{y + 285}" as="targetPoint"/></mxGeometry></mxCell>')
    for kind, it in L.items:
        if kind != "edge":
            continue
        pts = it["pts"]
        style = (f"edgeStyle=none;html=1;rounded=1;strokeColor={pal['edge']};strokeWidth=2;endArrow=blockThin;endFill=1;fontSize=10;"
                 f"fontColor={pal['muted']};labelBackgroundColor={pal['bg']};{'dashed=1;' if it['dashed'] else ''}{tdir}")
        inner = "".join(f'<mxPoint x="{px:.0f}" y="{py:.0f}"/>' for px, py in pts[1:-1])
        add(f'<mxCell id="{it["key"]}_{P}" value="{esc(it["label"])}" style="{style}" edge="1" parent="1"><mxGeometry relative="1" as="geometry">'
            f'<mxPoint x="{pts[0][0]:.0f}" y="{pts[0][1]:.0f}" as="sourcePoint"/><mxPoint x="{pts[-1][0]:.0f}" y="{pts[-1][1]:.0f}" as="targetPoint"/>'
            + (f'<Array as="points">{inner}</Array>' if inner else "") + "</mxGeometry></mxCell>")
    vertex("legend", 40, 1322, 1840, 22, f"text;html=1;whiteSpace=wrap;align={align};fontSize=11;fontColor={pal['muted']};{tdir}", TXT["legend"][lang])
    vertex("credit", 40, 1346, 1840, 22, f"text;html=1;whiteSpace=wrap;align={align};fontSize=11;fontColor={pal['faint']};{tdir}", TXT["credit"][lang])
    name = "العربية" if rtl else "English"
    return (f'<diagram id="{P}" name="{name}"><mxGraphModel dx="1600" dy="1000" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" '
            f'page="1" pageScale="1" pageWidth="{W}" pageHeight="{H}" background="{pal["bg"]}" math="0" shadow="0"><root>{"".join(cells)}</root></mxGraphModel></diagram>')


# ------------------------------------------------------------------ main
def main():
    assets = {
        "launcher": thumb("img/ar-main-dark.webp", "launcher", 560, 390),
        "original": thumb("img/en-expanded.webp", "original", 270, 187),
        "site": thumb("img/stage-site.webp", "site", 270, 142),
        "phone": thumb("img/stage-phone.webp", "phone", 90, 162),
        "stages": [thumb(src, f"stage-{i}", 120, 84) for i, (_, src, _) in enumerate(STAGES)],
    }
    pages = []
    for lang in ("ar", "en"):
        for theme in ("light", "dark"):
            a = dict(assets)
            a["regions"] = regions_map(theme)
            L = build(lang, a)
            with open(os.path.join(OUT, f"architecture-{lang}-{theme}.svg"), "w", encoding="utf-8", newline="\n") as f:
                f.write(render_svg(L, lang, theme))
            if theme == "light":
                pages.append(render_drawio(L, lang, lang))
    xml = ('<?xml version="1.0" encoding="UTF-8"?>\n<mxfile host="dropship-site" modified="2026-09-21T00:00:00.000Z" agent="scripts/diagram.py" version="24.0.0" type="device">'
           + "".join(pages) + "</mxfile>\n")
    with open(os.path.join(OUT, "dropship-ar.drawio"), "w", encoding="utf-8", newline="\n") as f:
        f.write(xml)
    with open(os.path.join(ROOT, "src", "stages.json"), "w", encoding="utf-8", newline="\n") as f:
        json.dump([{"date": d, "img": i, "ar": l["ar"], "en": l["en"]} for d, i, l in STAGES], f, ensure_ascii=False, indent=2)
    print("wrote", OUT)


if __name__ == "__main__":
    sys.exit(main())
