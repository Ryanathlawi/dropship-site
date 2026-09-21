# -*- coding: utf-8 -*-
"""مخطط المشروع الهندسي — مولّد واحد لنسختين:

  site      → public/diagram/architecture-{ar,en}-{light,dark}[-mobile].svg + dropship-ar.drawio  (ألوان الموقع، النسخة العربية)
  upstream  → <out>/architecture{,-light}.svg  بالإنجليزية وبألوان stormy — يُرفق مع طلب الدمج

    python scripts/diagram_map.py site
    python scripts/diagram_map.py upstream <screenshots dir> <out dir>

كل شيء يُبنى كقائمة عناصر بإحداثيات LTR ثم يُعكس للعربية ويُرسم SVG أو draw.io.
"""
import base64
import html
import os
import re
import sys

from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from diagram import icon_svg_inner, write_icon_file, ROOT, OUT, THUMBS, SITE  # noqa: E402

W, H = 1920, 1460
MW = 440  # عرض صفحة الجوال


def T(ar, en):
    return {"ar": ar, "en": en}


# ------------------------------------------------------------------ الألوان
def palette(accent_dark, accent_light):
    return {
        "dark": {
            "bg": "#0b0d10", "grid": "#13171c", "text": "#eef0f3", "muted": "#a3adb8", "faint": "#606a75",
            "card": "#12161b", "card_line": "#252c35", "edge": "#c9d1d9", "label_bg": "#0b0d10",
            "accent": accent_dark, "accent_soft": "#1c2a26" if accent_dark.startswith("#2d") else "#3a2a10", "gold": "#fbbf24",
            "zone": {"pc": ("#0e1216", "#2b3540", "#8fa3b8"), "net": ("#14100a", "#4a3617", "#f5a524"),
                     "gh": ("#100f16", "#3a3650", "#a99bd6"), "life": ("#0d1412", "#234139", "#34d399")},
            "shot_line": "#2b3540",
        },
        "light": {
            "bg": "#f6f7f9", "grid": "#e8ebef", "text": "#0f1319", "muted": "#4d5966", "faint": "#8b95a1",
            "card": "#ffffff", "card_line": "#d8dee6", "edge": "#2f3a46", "label_bg": "#f6f7f9",
            "accent": accent_light, "accent_soft": "#e6f7f3" if accent_light.startswith("#0f") else "#fff1d6", "gold": "#b45309",
            "zone": {"pc": ("#eef1f5", "#b8c4d1", "#3b4d61"), "net": ("#fff6e8", "#efc98f", "#b16400"),
                     "gh": ("#f1eefb", "#c7bde8", "#5b48a8"), "life": ("#e9f8f2", "#95d8bf", "#0f766e")},
            "shot_line": "#c9d3dd",
        },
    }


PALS = {"upstream": palette("#f5a524", "#c77700"), "site": palette("#2dd4bf", "#0f766e")}

REGIONS = [("ams1", 52.37, 4.9), ("gen1", 60.57, 27.2), ("gmec2", 26.43, 50.1), ("gsg1", 1.35, 103.82), ("gtk1", 35.68, 139.69),
           ("tpe1", 25.03, 121.57), ("syd2", -33.87, 151.21), ("gue4", 38.95, -77.45), ("ord1", 41.88, -87.63),
           ("las1", 36.17, -115.14), ("gbr1", -23.55, -46.63)]


def hexrgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def b64(path):
    return base64.b64encode(open(path, "rb").read()).decode()


def shot(src, name, w, h, out_dir):
    """يقصّ الصورة لنسبة w:h ويصغّرها إلى 2x webp؛ يعيد (المسار النسبي، base64)"""
    im = Image.open(src).convert("RGB")
    ar_src, ar_dst = im.width / im.height, w / h
    if ar_src > ar_dst:
        nw = int(im.height * ar_dst)
        im = im.crop(((im.width - nw) // 2, 0, (im.width - nw) // 2 + nw, im.height))
    elif ar_src < ar_dst:
        nh = int(im.width / ar_dst)
        im = im.crop((0, 0, im.width, nh))
    im = im.resize((w * 2, h * 2), Image.LANCZOS)
    path = os.path.join(out_dir, f"{name}.webp")
    im.save(path, quality=80, method=6)
    return f"thumbs/{name}.webp", b64(path)


def regions_map(pal, you, name, out_dir, w=560, h=236):
    """خريطة العالم المنقّطة مع المناطق ومسارات من اللاعب إليها"""
    src = open(os.path.join(ROOT, "src", "world.ts"), encoding="utf-8").read()
    rows = re.findall(r'"([01]{180})"', src)
    lat_top, lat_bot = 84.0, -58.0
    S = 2
    dark = pal["bg"].startswith("#0")
    bg = hexrgb(pal["zone"]["net"][0])
    im = Image.new("RGB", (w * S, h * S), bg)
    d = ImageDraw.Draw(im)
    dot = (78, 70, 52) if dark else (222, 200, 160)
    cw, ch = w * S / 180, h * S / len(rows)
    for j, row in enumerate(rows):
        for i, c in enumerate(row):
            if c == "1":
                cx, cy = i * cw + cw / 2, j * ch + ch / 2
                d.ellipse((cx - 1.7, cy - 1.7, cx + 1.7, cy + 1.7), fill=dot)

    def proj(lat, lon):
        return ((lon + 180) / 360 * w * S, (lat_top - lat) / (lat_top - lat_bot) * h * S)

    font = ImageFont.truetype("C:/Windows/Fonts/consola.ttf", 11 * S)
    ac, text = hexrgb(pal["zone"]["net"][2]), hexrgb(pal["text"])
    yx, yy = proj(*you)
    for code, lat, lon in REGIONS:
        x, y = proj(lat, lon)
        mx, my = (yx + x) / 2, (yy + y) / 2 - abs(x - yx) * 0.18
        pts = [(yx * (1 - t) ** 2 + 2 * mx * t * (1 - t) + x * t ** 2, yy * (1 - t) ** 2 + 2 * my * t * (1 - t) + y * t ** 2)
               for t in [k / 24 for k in range(25)]]
        for k in range(0, 24, 2):
            d.line([pts[k], pts[k + 1]], fill=ac, width=2)
    for code, lat, lon in REGIONS:
        x, y = proj(lat, lon)
        d.ellipse((x - 9, y - 9, x + 9, y + 9), outline=ac, width=2)
        d.ellipse((x - 4, y - 4, x + 4, y + 4), fill=ac)
        tw = d.textlength(code, font=font)
        tx = x + 12 if x < w * S - 90 else x - 12 - tw
        d.rectangle((tx - 4, y - 9, tx + tw + 4, y + 9), fill=bg)
        d.text((tx, y - 8), code, font=font, fill=text)
    d.ellipse((yx - 7, yy - 7, yx + 7, yy + 7), fill=text)
    d.ellipse((yx - 3, yy - 3, yx + 3, yy + 3), fill=bg)
    path = os.path.join(out_dir, f"{name}.png")
    im.save(path, optimize=True)
    return f"thumbs/{name}.png", b64(path)


# ------------------------------------------------------------------ المحتوى
CALLOUTS = {  # نقاط داخل لقطة 1001×698 — اللانشر الإنجليزي (اللوحة يمينًا) والعربي (اللوحة يسارًا)
    "upstream": [(400, 300), (820, 380), (752, 157), (220, 585), (29, 200), (350, 55), (800, 677)],
    "site": [(600, 300), (177, 380), (254, 155), (780, 585), (971, 200), (640, 55), (500, 677)],
}
CALLOUT_TXT = [
    T(["الخريطة", "عالم منقّط ومسار منك إلى كل سيرفر مسموح؛ نقرة على نقطته تحجبه، ونقرة يمين تفرده وحده"],
      ["The map", "dotted world, a route from you to every allowed server; click a dot to block it, right-click to solo it"]),
    T(["لوحة السيرفرات", "علم، اسم، شريط بينق حيّ، مفتاح تشغيل — ترتيب حسب البينق؛ نفس قائمة الواجهة الكلاسيكية"],
      ["Servers panel", "flag, name, live ping bar, on/off switch — sortable by ping; the same list as the classic view"]),
    T(["الاختصارات", "أوروبا = F1 جاهز؛ و + ينشئ اختصارك: اسم، مفتاح اختياري، ثم السيرفرات"],
      ["Presets", "EU = F1 out of the box; + makes your own: a name, an optional hotkey, then the servers"]),
    T(["أفضل مسار", "أقل بينق مسموح يأخذ قفلًا ذهبيًا؛ ومفتاح دائم / أثناء التشغيل"],
      ["Best route", "the lowest-ping allowed region gets a gold lock; permanent / while-open toggle"]),
    T(["الشريط الجانبي", "الخريطة، الألعاب، الأخبار، السجل، المساعدة، الخيارات — بقيّة تبويبات الواجهة الكلاسيكية"],
      ["Side rail", "map, games, news, log, help, options — the other tabs of the classic view"]),
    T(["شرائح الحالة", "الفلتر شغّال أو لا، كم سيرفر محجوب، وهل اللعبة مفتوحة"],
      ["Status chips", "filter on or off, how many blocked, is the game open"]),
    T(["المفاتيح", "Esc · L · R · F1 — وآخر سطر من السجل على الطرف الآخر"],
      ["Keys", "Esc · L · R · F1 — and the latest log line on the other side"]),
]

MODULES = [
    ("shield-check", T(["الجدار الناري", "فلاتر WFP لكل منطقة · دائم أو مؤقّت"], ["Firewall", "WFP filters per region · permanent or session"])),
    ("activity", T(["البينق", "IcmpSendEcho · كل 15 ث · بديل داخل النطاق"], ["Ping", "IcmpSendEcho · every 15 s · in-block fallback"])),
    ("gamepad-2", T(["اللعبة", "sysinfo · كل 0.9 ث · هل Overwatch.exe شغّال؟"], ["Game", "sysinfo · every 0.9 s · is Overwatch.exe running?"])),
    ("refresh-cw", T(["المحدّث", "إصدارات GitHub · كل 2.5 س · يبدّل الـ exe"], ["Updater", "GitHub releases · 2.5 h · swaps the exe"])),
    ("list", T(["السيرفرات", "ips.json · كل 15 د · الرموز تصمد للترقيم"], ["Servers", "ips.json · every 15 min · tokens survive renumbering"])),
    ("settings-2", T(["الإعدادات", "app.ron · المحجوب، الاختصارات، اللغة، الواجهة"], ["Config", "app.ron · blocked, presets, language, ui"])),
    ("languages", T(["اللغة", "lang/en.json · ar.json · الناقص يرجع للإنجليزي"], ["Language", "lang/en.json · ar.json · missing keys fall back"])),
    ("keyboard", T(["الاختصارات", "اسم ← مفتاح ← سيرفرات · بنقرة أو بمفتاح"], ["Presets", "name → key → servers · applied by click or hotkey"])),
    ("terminal", T(["السجل", "آخر سطر في شريط الحالة · كامل في تبويبه"], ["Log", "tail in the status bar · full view in its tab"])),
    ("zap", T(["الأوامر", "الواجهة ← أوامر ← مهام ← أحداث ← الواجهة"], ["Commands", "UI → commands → tasks → events → UI"])),
]

UNDER = [
    ("hard-drive", T(["الحالة المحفوظة", "app.ron، يُحفظ كل 30 ث"], ["Persisted state", "app.ron, saved every 30 s"])),
    ("clock", T(["المجدوِل", "مؤقّتات tokio تقود كل حلقة"], ["Scheduler", "tokio timers drive every loop"])),
    ("lock", T(["صلاحيات مرّة واحدة", "المانيفست يطلبها؛ WFP يحتاجها"], ["Admin once", "the manifest asks; WFP needs it"])),
    ("type", T(["نصّ ثنائي الاتجاه", "vendor/epaint + unicode-bidi حتى يوفّره egui"], ["Bidi text", "vendor/epaint + unicode-bidi, until egui ships it"])),
]

LIFE = [
    T(["التشغيل", "dropship.exe", "نقرة مزدوجة؛ المانيفست يطلب صلاحيات المسؤول"], ["launch", "dropship.exe", "double-click; the manifest asks for admin"]),
    T(["الصلاحيات", "UAC", "WFP يحتاجها — بلا صلاحيات لا فلاتر"], ["elevate", "UAC", "WFP needs it — no elevation, no filters"]),
    T(["التحميل", "app.ron", "المحجوب، الاختصارات، اللغة، الواجهة"], ["load", "app.ron", "blocked set, presets, language, interface"]),
    T(["التطبيق", "فلاتر WFP", "دائم: تبقى بعد الخروج · مؤقّت: تزول عند الخروج"], ["apply", "WFP filters", "permanent: they stay after exit · session: gone on exit"]),
    T(["الجلب", "ips.json", "المناطق ونطاقاتها، ثم كل 15 د"], ["fetch", "ips.json", "regions and their IP blocks, then every 15 min"]),
    T(["المراقبة", "اللعبة · 0.9 ث", "هل Overwatch.exe شغّال؟ تحذير قبل أي تغيير"], ["watch", "game · 0.9 s", "is Overwatch.exe running? warn before changes"]),
    T(["القياس", "البينق · 15 ث", "ردّ واحد من ثلاثة يكفي؛ العناوين الصامتة لها بديل"], ["measure", "ping · 15 s", "one reply of three is enough; silent IPs get a fallback"]),
    T(["الفحص", "التحديث · 2.5 س", "إصدار أحدث؟ تنزيل، تبديل، إعادة تشغيل"], ["check", "update · 2.5 h", "newer release? download, swap, restart"]),
    T(["الخروج", "الإغلاق", "فلاتر الجلسة تُزال؛ الدائمة تبقى"], ["exit", "close", "session filters are removed; permanent ones stay"]),
]

TXT = {
    "title": {"upstream": T("dropship", "dropship"), "site": T("dropship — النسخة العربية", "dropship — Arabic edition")},
    "title2": {"upstream": T("", "— architecture map"), "site": T("· المخطط الهندسي", "· engineering map")},
    "subtitle": {
        "upstream": T("", "How the app works, from the game to the server: the firewall, the loops, the interfaces, the update path — as of the localization / live-ping / presets / launcher pull request."),
        "site": T("كيف يعمل البرنامج من اللعبة إلى السيرفر: جدار الحماية، الحلقات، الواجهات، ومسار التحديث — تطوير ريان الأثلاوي، مبني على dropship من stormy",
                  "How the app works, from the game to the server: the firewall, the loops, the interfaces, the update path — developed by Ryan Athlawi, built on dropship by stormy"),
    },
    "legend": T("الأسهم: تدفّق البيانات · المتقطّع: يتكرّر بمؤقّت · الأرقام الذهبية على اللقطة مشروحة جنبها",
                "arrows: data flow  ·  dashed: repeats on a timer  ·  gold numbers on the screenshot are explained beside it"),
    "chips": {"upstream": T([], ["v3.0.6 + PR", "GPL-3.0", "Rust · eframe/egui 0.36 · tokio", "Windows 10 / 11", "one exe, no installer"]),
              "site": T(["v3.1.4", "GPL-3.0", "Rust · eframe/egui 0.36 · tokio", "Windows 10 / 11", "exe واحد بلا تثبيت"],
                        ["v3.1.4", "GPL-3.0", "Rust · eframe/egui 0.36 · tokio", "Windows 10 / 11", "one exe, no installer"])},
    "z_pc": T("01 · جهاز اللاعب", "01 · PLAYER'S PC"),
    "z_net": T("02 · Blizzard والإنترنت", "02 · BLIZZARD & THE INTERNET"),
    "z_gh": T("03 · GitHub", "03 · GITHUB"),
    "z_life": T("04 · حياة الجلسة", "04 · THE LIFE OF A SESSION"),
    "ow": T(["Overwatch 2", "Overwatch.exe عبر Battle.net أو Steam — البرنامج لا يلمس اللعبة نفسها"],
            ["Overwatch 2", "Overwatch.exe via Battle.net or Steam — dropship never touches the game itself"]),
    "wfp": T(["جدار حماية ويندوز (WFP)", "فلاتر dropship ترمي حركة Overwatch.exe إلى نطاقات IP لكل منطقة محظورة — ولا تمسّ شيئًا غيرها"],
             ["Windows Filtering Platform (WFP)", "dropship's filters drop Overwatch.exe traffic to the IP blocks of every blocked region — nothing else is touched"]),
    "what": T(["ما هو dropship", "مجموعة قواعد جدار حماية لمناطق اللعبة — لا VPN ولا بروكسي ولا حقن"],
              ["What dropship is", "a firewall rule set for the game's regions — no VPN, no proxy, no injection"]),
    "app": T("dropship", "dropship"),
    "app_sub": T("Rust · eframe/egui · tokio — عملية واحدة، نافذة واحدة، بلا خدمة", "Rust · eframe/egui · tokio  —  one process, one window, no service"),
    "app_note": T("قائمة كلاسيكية أو نقطة على الخريطة — نقرة تحجب، ونفس المحرّك تحتهما", "classic list or map dot — one click blocks, the same engine underneath"),
    "shot1": {"upstream": T("", "the launcher — options → interface → launcher; off by default, a real screenshot"),
              "site": T("اللانشر — الخيارات ← الواجهة ← اللانشر؛ لقطة حقيقية من النسخة العربية", "the launcher — options → interface → launcher; a real screenshot of the Arabic edition")},
    "shot2": T("الواجهة الكلاسيكية تعمل كما هي، مع صفّ الاختصارات فقط", "the classic view keeps working exactly as today, plus the presets row"),
    "numbers": T("ما تشير إليه الأرقام", "WHAT THE NUMBERS POINT AT"),
    "three": T("نفس الحالة بثلاث طرق", "THE SAME STATE, THREE WAYS"),
    "th_cen": T("كلاسيكي · إنجليزي — كما هو تمامًا", "classic · English — pixel-identical to today"),
    "th_car": T("كلاسيكي · عربي — معكوس من اليمين لليسار", "classic · Arabic — mirrored, right-to-left"),
    "th_l": {"upstream": T("", "launcher · Arabic"), "site": T("اللانشر · إنجليزي", "launcher · English")},
    "th_light": T("اللانشر · الثيم الفاتح", "launcher · light theme"),
    "th_note": T(["اللغة تتبع الجهاز أو الخيارات ← اللغة؛", "والثيم كما كان: داكن أو فاتح"], ["language follows the PC, or options →", "language; the theme is yours as before"]),
    "engine": T("المحرّك — كل صندوق مهمّة أو وحدة تكلّمها الواجهة", "THE ENGINE — each box is a task or a module the UI talks to"),
    "under": T("تحت الغطاء", "UNDER THE HOOD"),
    "regions": {"upstream": T("", "game server regions — eleven, IP blocks from ips.json; routes drawn from a player in the Netherlands"),
                "site": T("مناطق سيرفرات اللعبة — 11 منطقة، نطاقات IP من ips.json؛ المسارات مرسومة من لاعب في الرياض",
                          "game server regions — eleven, IP blocks from ips.json; routes drawn from a player in Riyadh")},
    "mm": T(["تسجيل الدخول والماتش ميكر", "يختار أقرب منطقة يصل إليها الكلاينت؛ المنطقة المحجوبة لا تردّ أبدًا فلا تُختار"],
            ["Login & matchmaker", "picks the nearest region the client can reach; a blocked region never answers, so it is never picked"]),
    "ips": T(["ips.json", "رمز المنطقة، نطاقات IP، عنوان البينق — يُصان في الأصل، وتجلبه كل نسخة كل 15 د"],
             ["ips.json", "region code, IP blocks, ping address — maintained upstream, fetched by every copy every 15 min"]),
    "repo": {"upstream": T([], ["stowmyy/dropship", "source, issues, the server list, and the releases the updater reads"]),
             "site": T(["Ryanathlawi/dropship-ar", "الكود والإصدارات والموقع"], ["Ryanathlawi/dropship-ar", "source, releases, and the website"])},
    "actions": {"upstream": T([], ["Actions", "cargo build --release → dropship.exe (+ the animated build)"]),
                "site": T(["Actions", "cargo xwin → dropship-ar.exe (+ النسخة المتحركة)"], ["Actions", "cargo xwin → dropship-ar.exe (+ the animated build)"])},
    "rel": T(["Releases", "exe لكل إصدار؛ كل نسخة تقارن الإصدارات كل 2.5 س"], ["Releases", "one exe per tag; every copy compares tags every 2.5 h"]),
    "players": T(["اللاعبون", "تحديث تلقائي: تنزيل، إعادة تسمية القديم إلى .deleteme، إعادة تشغيل"],
                 ["Players", "auto-update: download, rename the old exe to .deleteme, restart"]),
    "gh_note": {"upstream": T(["", ""], ["Adding a language", "copy lang/en.json to lang/xx.json, translate the values, add one enum entry — missing keys fall back to English, and cargo test lang checks that the files stay in sync."]),
                "site": T(["الأصل — stowmyy/dropship", "مبني عليه بترخيص GPL-3.0؛ وكل ميزة هنا أُرسلت إليه في الطلب #38. إضافة لغة: ملف JSON واحد في lang/ وسطر enum — والناقص يرجع للإنجليزي."],
                          ["Upstream — stowmyy/dropship", "built on it under GPL-3.0; every feature here was sent back in PR #38. Adding a language: one JSON file in lang/ and one enum entry — missing keys fall back to English."])},
    "life_note": T("الوضع الدائم: فلاتر الخطوة 4 تبقى عبر التشغيلات · الوضع المؤقّت: تزول في الخطوة 9",
                   "permanent mode: the filters from step 4 stay across launches · session mode: they go at step 9"),
    "e_traffic": T("حركة اللعبة (UDP)", "game traffic (UDP)"),
    "e_allowed": T("المناطق المسموحة فقط", "allowed regions only"),
    "e_filters": T("يضيف / يزيل الفلاتر", "adds / removes filters"),
    "e_running": T("شغّالة؟ كل 0.9 ث", "running? every 0.9 s"),
    "e_ping": T("بينق · كل 15 ث", "ping · every 15 s"),
    "e_list": T("القائمة · كل 15 د", "the list · every 15 min"),
    "e_update": T("تحديث؟ كل 2.5 س", "update? every 2.5 h"),
    "credit": {"upstream": T("", "dropship by stormy · GPL-3.0 · this map accompanies the localization / live-ping / presets / launcher pull request · drawn by Ryan Athlawi, 2026"),
               "site": T("dropship — النسخة العربية · تصميم وتطوير ريان الأثلاوي · الأصل stormy (GPL-3.0) · 2026",
                         "dropship — Arabic edition · designed and developed by Ryan Athlawi · original by stormy (GPL-3.0) · 2026")},
    "gen": T("مولَّد من الكود — scripts/diagram_map.py", "generated from the code — scripts/diagram_map.py"),
    "n_allowed": T("◀ من جدار الحماية: المناطق المسموحة فقط تمرّ", "◀ from the firewall: only allowed regions get through"),
    "n_ping": T("◀ من البرنامج: بينق كل 15 ث", "◀ from the app: ping every 15 s"),
    "n_list": T("▶ إلى البرنامج: قائمة السيرفرات كل 15 د", "▶ to the app: the server list every 15 min"),
    "n_update": T("▶ إلى البرنامج: تحديث؟ كل 2.5 س", "▶ to the app: update? every 2.5 h"),
}


def tx(key, lang, variant):
    v = TXT[key]
    if isinstance(v, dict) and variant in v:
        v = v[variant]
    return v[lang]


def wrap(s, n):
    out, line = [], ""
    for w in s.split():
        if line and len(line) + 1 + len(w) > n:
            out.append(line)
            line = w
        else:
            line = f"{line} {w}" if line else w
    if line:
        out.append(line)
    return out


# ------------------------------------------------------------------ التخطيط
class Layout:
    """عناصر بإحداثيات LTR؛ X() يعكسها للعربية"""

    def __init__(self, rtl, w=W, h=H, mobile=False):
        self.rtl, self.W, self.H, self.mobile = rtl, w, h, mobile
        self.items = []

    def X(self, x, w=0):
        return self.W - x - w if self.rtl else x

    def add(self, kind, **it):
        self.items.append((kind, it))

    def zone(self, key, x, y, w, h, title):
        self.add("zone", key=key, x=self.X(x, w), y=y, w=w, h=h, title=title)

    def panel(self, key, x, y, w, h, title, sub, note):
        self.add("panel", key=key, x=self.X(x, w), y=y, w=w, h=h, title=title, sub=sub, note=note)

    def card(self, key, x, y, w, h, icon, title, lines, tone="pc", big=False):
        self.add("card", key=key, x=self.X(x, w), y=y, w=w, h=h, icon=icon, title=title, lines=lines, tone=tone, big=big)

    def module(self, key, x, y, w, h, icon, title, lines, box=True):
        self.add("module", key=key, x=self.X(x, w), y=y, w=w, h=h, icon=icon, title=title, lines=lines, box=box)

    def image(self, key, x, y, w, h, src, b64_, caption=None, cap2=None):
        self.add("image", key=key, x=self.X(x, w), y=y, w=w, h=h, src=src, b64=b64_, caption=caption, cap2=cap2)

    def text(self, key, x, y, w, size, s, color="text", bold=False, mono=False, anchor="start", ls=None, s2=None):
        self.add("text", key=key, x=self.X(x, w), y=y, w=w, size=size, s=s, color=color, bold=bold, mono=mono, anchor=anchor, ls=ls, s2=s2)

    def chip(self, key, x, y, w, h, s):
        self.add("chip", key=key, x=self.X(x, w), y=y, w=w, h=h, s=s)

    def edge(self, key, pts, label=None, lpos=None, dashed=False, accent=False):
        p = [((self.W - x) if self.rtl else x, y) for x, y in pts]
        lp = ((self.W - lpos[0]) if self.rtl else lpos[0], lpos[1]) if lpos else None
        self.add("edge", key=key, pts=p, label=label, lpos=lp, dashed=dashed, accent=accent)

    def line(self, key, pts, tone="life"):
        self.add("line", key=key, pts=[((self.W - x) if self.rtl else x, y) for x, y in pts], tone=tone)

    def callout(self, key, x, y, n, mirror=True):
        self.add("callout", key=key, x=(self.W - x) if (self.rtl and mirror) else x, y=y, n=n)

    def node(self, key, x, y, n, step, title, lines, place):
        """place: up / down (تحت أو فوق خط أفقي) أو side (يمين الخط العمودي)"""
        self.add("node", key=key, x=(self.W - x) if self.rtl else x, y=y, n=n, step=step, title=title, lines=lines, place=place)


def build(lang, variant, A):
    L = Layout(lang == "ar")
    t = lambda k: tx(k, lang, variant)
    rtl = L.rtl
    cw_ = 6.4 if lang == "en" else 6.9  # عرض تقريبي للحرف عند 11.5px

    # ── الترويسة
    L.add("logo", x=L.X(46, 60), y=36)
    L.text("h_title", 126, 33, 1200, 30, t("title"), bold=True, mono=True, s2=t("title2") or None)
    L.text("h_sub", 126, 76, 1200, 14, t("subtitle"), color="muted")
    L.text("h_legend", 126, 100, 1200, 12.5, t("legend"), color="faint", mono=True)
    off = 0
    for i, c in enumerate(t("chips")[::-1]):
        cw = len(c) * 7.4 + 26
        L.chip(f"chip{i}", W - 60 - off - cw, 44, cw, 30, c)
        off += cw + 10
    L.line("h_rule", [(40, 134), (W - 40, 134)], tone="rule")

    # ── المناطق
    L.zone("pc", 40, 190, 1180, 860, t("z_pc"))
    L.zone("net", 1262, 190, 618, 470, t("z_net"))
    L.zone("gh", 1262, 700, 618, 350, t("z_gh"))
    L.zone("life", 40, 1090, 1840, 270, t("z_life"))

    # 01 — الصفّ العلوي
    ow, wfp, what = t("ow"), t("wfp"), t("what")
    L.card("ow", 70, 228, 300, 82, "gamepad-2", ow[0], wrap(ow[1], 40), "pc")
    L.card("wfp", 450, 228, 500, 82, "shield-check", wfp[0], wrap(wfp[1], 72), "pc")
    L.card("what", 990, 228, 200, 82, "info", what[0], wrap(what[1], 30), "accent")

    # لوح البرنامج
    L.panel("app", 70, 350, 1120, 670, t("app"), t("app_sub"), t("app_note"))
    sx, sy, sw, sh = 92, 414, 520, 363
    L.image("shot", sx, sy, sw, sh, *A["launcher"], caption=t("shot1"), cap2=t("shot2"))
    isx = L.X(sx, sw)  # اللقطة نفسها لا تُعكس
    for i, (px, py) in enumerate(CALLOUTS[variant]):
        L.callout(f"c{i}", isx + px * sw / 1001, sy + py * sh / 698, i + 1, mirror=False)
    lx, ly = 640, 418
    L.text("numbers", lx, ly - 11, 540, 11.5, t("numbers"), color="faint", mono=True, ls="0.12em")
    for i, ct in enumerate(CALLOUT_TXT):
        yy = ly + 20 + i * 46
        L.callout(f"cl{i}", lx + 12, yy + 6, i + 1)
        L.text(f"ct{i}", lx + 32, yy - 9, 500, 13, ct[lang][0], bold=True)
        for j, ln in enumerate(wrap(ct[lang][1], 76)):
            L.text(f"cb{i}_{j}", lx + 32, yy + 9 + j * 13.5, 500, 11, ln, color="muted")

    # الواجهات الثلاث
    ix, iy = 92, 838
    L.text("three", ix, iy - 11, 520, 11.5, t("three"), color="faint", mono=True, ls="0.12em")
    L.image("th_cen", 92, 850, 250, 57, *A["classic_en"], caption=t("th_cen"))
    L.image("th_car", 92, 938, 250, 57, *A["classic_ar"], caption=t("th_car"))
    L.image("th_l", 360, 850, 120, 84, *A["launcher_alt"], caption=t("th_l"))
    L.image("th_light", 492, 850, 120, 84, *A["launcher_light"], caption=t("th_light"))
    for j, ln in enumerate(t("th_note")):
        L.text(f"th_note{j}", 360, 963 + j * 15, 260, 10.5, ln, color="faint", mono=True)

    # المحرّك
    mx, my = 640, 772
    L.text("engine", mx, my - 11, 540, 11.5, t("engine"), color="faint", mono=True, ls="0.12em")
    for i, (icon, label) in enumerate(MODULES):
        cx = mx + (i % 5) * 108
        cy = my + 12 + (i // 5) * 74
        L.module(f"m{i}", cx, cy, 100, 66, icon, label[lang][0], wrap(label[lang][1], 19)[:3])
    ux, uy = 640, 950
    L.text("under", ux, uy - 11, 540, 11.5, t("under"), color="faint", mono=True, ls="0.12em")
    for i, (icon, label) in enumerate(UNDER):
        L.module(f"u{i}", ux + i * 134, uy + 6, 128, 56, icon, label[lang][0], wrap(label[lang][1], 25)[:2], box=False)

    # 02 — الإنترنت
    L.image("regions", 1292, 232, 560, 236, *A["regions"], caption=t("regions"))
    mm, ips = t("mm"), t("ips")
    L.card("mm", 1292, 512, 272, 118, "log-in", mm[0], wrap(mm[1], 36), "net")
    L.card("ips", 1580, 512, 272, 118, "file-json", ips[0], wrap(ips[1], 36), "net")

    # 03 — GitHub
    repo, act, rel, pl, gn = t("repo"), t("actions"), t("rel"), t("players"), t("gh_note")
    L.card("repo", 1292, 740, 272, 84, "git-branch", repo[0], wrap(repo[1], 36), "gh")
    L.card("actions", 1580, 740, 272, 84, "workflow", act[0], wrap(act[1], 36), "gh")
    L.card("players", 1292, 842, 272, 84, "users", pl[0], wrap(pl[1], 36), "gh")
    L.card("rel", 1580, 842, 272, 84, "package", rel[0], wrap(rel[1], 36), "gh")
    L.card("gh_note", 1292, 944, 560, 84, "languages" if variant == "upstream" else "git-fork", gn[0], wrap(gn[1], 80), "gh", big=True)

    # ── الأسهم
    L.edge("e1", [(370, 269), (450, 269)], t("e_traffic"), (410, 250))
    L.edge("e2", [(950, 269), (970, 269), (970, 212), (1226, 212), (1226, 269), (1262, 269)], t("e_allowed"), (1100, 212))
    L.edge("e3", [(700, 350), (700, 310)], t("e_filters"), (810, 330), accent=True)
    L.edge("e4", [(220, 350), (220, 310)], t("e_running"), (330, 330), dashed=True)
    L.edge("e5", [(1190, 560), (1226, 560), (1226, 400), (1292, 400)], t("e_ping"), (1226, 480), dashed=True, accent=True)
    L.edge("e6", [(1716, 630), (1716, 680), (1226, 680), (1226, 760), (1190, 760)], t("e_list"), (1470, 680), dashed=True)
    L.edge("e7", [(1292, 884), (1226, 884), (1226, 830), (1190, 830)], t("e_update"), (1226, 857), dashed=True)
    L.edge("e8", [(1564, 782), (1580, 782)])
    L.edge("e9", [(1716, 824), (1716, 842)])
    L.edge("e10", [(1580, 884), (1564, 884)])

    # 04 — حياة الجلسة
    lx0, lx1, ly0 = 150, 1770, 1210
    L.line("life_axis", [(lx0, ly0), (lx1, ly0)])
    n = len(LIFE)
    for i, st in enumerate(LIFE):
        x = lx0 + i * (lx1 - lx0) / (n - 1)
        L.node(f"n{i}", x, ly0, i + 1, st[lang][0], st[lang][1], wrap(st[lang][2], 30)[:3], "up" if i % 2 == 0 else "down")
    L.text("life_note", 40, 1324, 1820, 10.5, t("life_note"), color="faint", mono=True, anchor="end")

    # ── الذيل
    L.line("f_rule", [(40, 1392), (W - 40, 1392)], tone="rule")
    L.text("credit", 40, 1408, 1300, 11.5, t("credit"), color="faint", mono=True)
    L.text("gen", W - 40 - 520, 1408, 520, 11.5, t("gen"), color="faint", mono=True, anchor="end")
    return L


def build_mobile(lang, variant, A):
    """عمود واحد بعرض 440: كل منطقة تحت التي قبلها"""
    L = Layout(lang == "ar", w=MW, h=0, mobile=True)
    t = lambda k: tx(k, lang, variant)
    M = 16
    IW = MW - 2 * M
    CX, CW = M + 12, IW - 24
    y = 20

    # الترويسة
    L.add("logo", x=L.X(M, 44), y=y, small=True)
    L.text("h_title", M + 56, y - 2, 340, 17, t("title"), bold=True, mono=True)
    if t("title2"):
        L.text("h_title2", M + 56, y + 20, 340, 11, t("title2"), color="muted")
    y += 54
    for j, ln in enumerate(wrap(t("subtitle"), 60 if lang == "en" else 52)[:4]):
        L.text(f"h_sub{j}", M, y + j * 15, IW, 10.5, ln, color="muted")
    y += 4 * 15 + 4
    off = 0
    row = 0
    for i, c in enumerate(t("chips")):
        cw = len(c) * 6.4 + 18
        if off + cw > IW:
            off, row = 0, row + 1
        L.chip(f"chip{i}", M + off, y + row * 28, cw, 22, c)
        off += cw + 6
    y += (row + 1) * 28 + 6
    L.line("h_rule", [(M, y), (MW - M, y)], tone="rule")
    y += 30

    # 01 — جهاز اللاعب
    z0 = y
    ow, wfp, what = t("ow"), t("wfp"), t("what")
    L.card("ow", CX, y + 38, CW, 64, "gamepad-2", ow[0], wrap(ow[1], 44)[:2], "pc")
    L.edge("e1", [(CX + 40, y + 102), (CX + 40, y + 122)], t("e_traffic"), (CX + 40 + 90, y + 112))
    L.card("wfp", CX, y + 122, CW, 78, "shield-check", wfp[0], wrap(wfp[1], 44)[:3], "pc")
    L.card("what", CX, y + 212, CW, 64, "info", what[0], wrap(what[1], 44)[:2], "accent")
    y += 212 + 64 + 40
    zapp = y
    sx, sw = CX + 10, CW - 20
    sy = y + 44
    sh = int(sw * 698 / 1001)
    L.image("shot", sx, sy, sw, sh, *A["launcher"])
    isx = L.X(sx, sw)
    for i, (px, py) in enumerate(CALLOUTS[variant]):
        L.callout(f"c{i}", isx + px * sw / 1001, sy + py * sh / 698, i + 1, mirror=False)
    y = sy + sh + 12
    for j, ln in enumerate([t("shot1"), t("shot2")]):
        L.text(f"shot_cap{j}", sx, y + j * 13, sw, 9.5, ln, color="faint", mono=True)
    y += 34
    for i, ct in enumerate(CALLOUT_TXT):
        lines = wrap(ct[lang][1], 46 if lang == "en" else 42)[:3]
        L.callout(f"cl{i}", sx + 11, y + 8, i + 1)
        L.text(f"ct{i}", sx + 30, y - 6, sw - 34, 12, ct[lang][0], bold=True)
        for j, ln in enumerate(lines):
            L.text(f"cb{i}_{j}", sx + 30, y + 10 + j * 12.5, sw - 34, 10, ln, color="muted")
        y += 24 + len(lines) * 12.5 + 8
    y += 6
    L.text("three", sx, y - 11, sw, 11, t("three"), color="faint", mono=True, ls="0.1em")
    y += 8
    tw2 = (sw - 10) / 2
    L.image("th_cen", sx, y, sw, int(sw * 57 / 250), *A["classic_en"], caption=t("th_cen"))
    y += int(sw * 57 / 250) + 30
    L.image("th_car", sx, y, sw, int(sw * 57 / 250), *A["classic_ar"], caption=t("th_car"))
    y += int(sw * 57 / 250) + 30
    L.image("th_l", sx, y, tw2, int(tw2 * 84 / 120), *A["launcher_alt"], caption=t("th_l"))
    L.image("th_light", sx + tw2 + 10, y, tw2, int(tw2 * 84 / 120), *A["launcher_light"], caption=t("th_light"))
    y += int(tw2 * 84 / 120) + 36
    L.text("engine", sx, y - 11, sw, 11, t("engine")[:40], color="faint", mono=True, ls="0.1em")
    y += 10
    for i, (icon, label) in enumerate(MODULES):
        col, r = i % 2, i // 2
        L.module(f"m{i}", sx + col * (tw2 + 10), y + r * 74, tw2, 66, icon, label[lang][0], wrap(label[lang][1], 26)[:3])
    y += 5 * 74 + 8
    L.text("under", sx, y - 11, sw, 11, t("under"), color="faint", mono=True, ls="0.1em")
    y += 8
    for i, (icon, label) in enumerate(UNDER):
        L.module(f"u{i}", sx, y + i * 44, sw, 40, icon, label[lang][0], wrap(label[lang][1], 44)[:1], box=False)
    y += 4 * 44 + 8
    L.panel("app", CX, zapp, CW, y - zapp, t("app"), "", "")
    L.edge("e3", [(CX + CW - 60, zapp), (CX + CW - 60, z0 + 276)], t("e_filters"), (CX + CW - 60, zapp - 18), accent=True)
    L.edge("e4", [(CX + 40, zapp), (CX + 40, z0 + 200)], t("e_running"), (CX + 40 + 8, zapp - 18), dashed=True)
    y += 24
    L.zone("pc", M, z0, IW, y - z0, t("z_pc"))
    y += 44

    # 02 — الإنترنت
    z0 = y
    L.text("n_allowed", CX, y + 26, CW, 10.5, t("n_allowed"), color="muted", mono=True)
    L.text("n_ping", CX, y + 42, CW, 10.5, t("n_ping"), color="muted", mono=True)
    mh = int(CW * 236 / 560)
    L.image("regions", CX, y + 70, CW, mh, *A["regions"], caption=wrap(t("regions"), 60)[0])
    y += 70 + mh + 34
    mm, ips = t("mm"), t("ips")
    L.card("mm", CX, y, CW, 84, "log-in", mm[0], wrap(mm[1], 46)[:3], "net")
    L.card("ips", CX, y + 96, CW, 84, "file-json", ips[0], wrap(ips[1], 46)[:3], "net")
    y += 96 + 84 + 24
    L.zone("net", M, z0, IW, y - z0, t("z_net"))
    y += 44

    # 03 — GitHub
    z0 = y
    L.text("n_list", CX, y + 26, CW, 10.5, t("n_list"), color="muted", mono=True)
    L.text("n_update", CX, y + 42, CW, 10.5, t("n_update"), color="muted", mono=True)
    y += 66
    repo, act, rel, pl, gn = t("repo"), t("actions"), t("rel"), t("players"), t("gh_note")
    for i, (k, icon, lab) in enumerate([("repo", "git-branch", repo), ("actions", "workflow", act), ("rel", "package", rel), ("players", "users", pl)]):
        L.card(k, CX, y + i * 80, CW, 70, icon, lab[0], wrap(lab[1], 44)[:2], "gh")
    y += 4 * 80
    L.card("gh_note", CX, y, CW, 96, "languages" if variant == "upstream" else "git-fork", gn[0], wrap(gn[1], 44)[:4], "gh", big=True)
    y += 96 + 24
    L.zone("gh", M, z0, IW, y - z0, t("z_gh"))
    y += 44

    # 04 — حياة الجلسة (عمودي)
    z0 = y
    ax = CX + 18
    y += 44
    top = y
    for i, st in enumerate(LIFE):
        L.node(f"n{i}", ax, y + 10, i + 1, st[lang][0], st[lang][1], wrap(st[lang][2], 40 if lang == "en" else 38)[:2], "side")
        y += 64
    L.line("life_axis", [(ax, top), (ax, y - 44)])
    for j, ln in enumerate(wrap(t("life_note"), 52)[:2]):
        L.text(f"life_note{j}", CX, y + j * 13, CW, 9.5, ln, color="faint", mono=True)
    y += 40
    L.zone("life", M, z0, IW, y - z0, t("z_life"))
    y += 40
    for j, ln in enumerate(wrap(t("credit"), 58)[:2]):
        L.text(f"credit{j}", M, y + j * 14, IW, 9.5, ln, color="faint", mono=True)
    L.H = int(y + 46)
    return L


# ------------------------------------------------------------------ SVG
def render_svg(L, lang, pal, dark):
    rtl = L.rtl
    esc = html.escape
    font = "'IBM Plex Sans Arabic','Thmanyah Sans',system-ui,sans-serif" if rtl else "Inter,'Segoe UI',system-ui,sans-serif"
    mono = "'DM Mono','JetBrains Mono',Consolas,monospace"
    Wd, Hd = L.W, L.H
    o = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {Wd} {Hd}" width="{Wd}" height="{Hd}" role="img" lang="{lang}" direction="{"rtl" if rtl else "ltr"}">',
         f'<style>text{{font-family:{font};direction:{"rtl" if rtl else "ltr"};unicode-bidi:plaintext}}.m{{font-family:{mono}}}</style>',
         f'<defs><pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="{pal["grid"]}" stroke-width="1"/></pattern>'
         f'<marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="{pal["edge"]}"/></marker>'
         f'<marker id="arra" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="{pal["accent"]}"/></marker>'
         f'<filter id="sh" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#000" flood-opacity="{0.5 if dark else 0.14}"/></filter>'
         f'<linearGradient id="hd" x1="{1 if rtl else 0}" y1="0" x2="{0 if rtl else 1}" y2="0"><stop offset="0" stop-color="{pal["accent"]}" stop-opacity="0.35"/><stop offset="1" stop-color="{pal["accent"]}" stop-opacity="0"/></linearGradient></defs>',
         f'<rect width="{Wd}" height="{Hd}" fill="{pal["bg"]}"/><rect width="{Wd}" height="{Hd}" fill="url(#g)"/>']
    if not L.mobile:
        o.append(f'<rect x="{Wd - 1140 if rtl else 40}" y="0" width="1100" height="150" fill="url(#hd)" opacity="0.5"/>')

    def txt(x, y, size, s, color, bold=False, m=False, anchor="start", ls=None, s2=None):
        # الخط أحادي المسافة للاتيني فقط: بدائله لا تحمل العربية فتخرج ممطوطة
        arabic = bool(re.search(r"[؀-ۿ]", s))
        m = m and not arabic
        if arabic and s and not s[0].isspace():
            s = "‏" + s  # علامة RTL: مع plaintext يقرّر أول حرف قوي اتجاه الفقرة، فلا يقلبها "dropship" في أولها
        extra = f' letter-spacing="{ls}"' if (ls and m) else ""
        tail = f'<tspan fill="{pal["muted"]}" font-weight="400"> {esc(s2)}</tspan>' if s2 else ""
        return (f'<text{" class=" + chr(34) + "m" + chr(34) if m else ""} x="{x:.0f}" y="{y:.0f}" font-size="{size}" '
                f'font-weight="{700 if bold else 400}" fill="{color}" text-anchor="{anchor}"{extra}>{esc(s)}{tail}</text>')

    def rect(x, y, w, h, fill, stroke, rx=14, sw=1.5, dash="", extra=""):
        return f'<rect x="{x:.0f}" y="{y:.0f}" width="{w:.0f}" height="{h:.0f}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"{dash}{extra}/>'

    def start(x, w):  # بداية السطر: يمين في العربية
        return x + w if rtl else x

    ink_on_accent = pal["bg"] if dark else "#ffffff"

    for kind, it in L.items:
        if kind == "zone":
            fill, line, acc = pal["zone"][it["key"]]
            o.append(rect(it["x"], it["y"], it["w"], it["h"], fill, line, rx=20, sw=2, dash=' stroke-dasharray="10 7"'))
            tw = len(it["title"]) * (8.2 if lang == "en" else 8.6) + 34
            tx_ = it["x"] + it["w"] - 18 - tw if rtl else it["x"] + 18
            o.append(f'<rect x="{tx_:.0f}" y="{it["y"] - 15}" width="{tw:.0f}" height="30" rx="10" fill="{acc}"/>')
            o.append(txt(tx_ + tw / 2, it["y"] + 5, 13, it["title"], ink_on_accent, bold=True, m=(lang == "en"), anchor="middle", ls="0.06em" if lang == "en" else None))
        elif kind == "logo":
            r = 22 if it.get("small") else 30
            cx = it["x"] + r
            o.append(f'<circle cx="{cx:.0f}" cy="{it["y"] + r}" r="{r}" fill="{pal["accent"]}"/>')
            o.append(icon_svg_inner("zap", ink_on_accent, cx - r * 0.53, it["y"] + r * 0.47, r * 1.06))
    for kind, it in L.items:
        if kind == "panel":
            x, y, w, h = it["x"], it["y"], it["w"], it["h"]
            o.append(rect(x, y, w, h, pal["card"], pal["card_line"], rx=18, extra=' opacity="0.55"'))
            o.append(rect(x, y, w, 44, pal["card"], pal["card_line"], rx=18))
            o.append(f'<rect x="{x}" y="{y + 22}" width="{w}" height="22" fill="{pal["card"]}"/>')
            o.append(f'<line x1="{x}" y1="{y + 44}" x2="{x + w}" y2="{y + 44}" stroke="{pal["card_line"]}"/>')
            ix = x + w - 20 - 22 if rtl else x + 20
            o.append(icon_svg_inner("zap", pal["accent"], ix, y + 11, 22))
            o.append(txt(start(x + 52, w - 104), y + 28, 14, it["title"], pal["text"], bold=True, m=True))
            if it["sub"]:
                o.append(txt(start(x + 52 + len(it["title"]) * 9.5, 0) if not rtl else x + w - 52 - len(it["title"]) * 9.5, y + 28, 12.5, it["sub"], pal["muted"], m=True))
            if it["note"]:
                o.append(txt(x + 18 if rtl else x + w - 18, y + 28, 11.5, it["note"], pal["faint"], m=True, anchor="end"))
    for kind, it in L.items:
        if kind == "card":
            x, y, w, h = it["x"], it["y"], it["w"], it["h"]
            accent = it["tone"] == "accent"
            acc = pal["accent"] if accent else pal["zone"][it["tone"]][2]
            o.append(rect(x, y, w, h, pal["accent_soft"] if accent else pal["card"], pal["accent"] if accent else pal["card_line"], rx=12,
                          extra='' if accent else ' filter="url(#sh)"'))
            ix = x + w - 36 if rtl else x + 16
            if not accent:
                o.append(f'<circle cx="{ix + 10:.0f}" cy="{y + 26}" r="16" fill="{acc}" opacity="0.16"/>')
            o.append(icon_svg_inner(it["icon"], acc, ix, y + 16, 20))
            tx_ = x + w - 52 if rtl else x + 52
            o.append(txt(tx_, y + 24, 14.5 if it["big"] else 13.5, it["title"], pal["text"], bold=True))
            for i, ln in enumerate(it["lines"]):
                o.append(txt(tx_, y + 43 + i * 15, 11.5, ln, pal["muted"]))
        elif kind == "module":
            x, y, w, h = it["x"], it["y"], it["w"], it["h"]
            if it["box"]:
                o.append(rect(x, y, w, h, pal["card"], pal["card_line"], rx=10))
            ix = x + w - 9 - 16 if rtl else x + 9
            o.append(icon_svg_inner(it["icon"], pal["accent"] if it["box"] else pal["zone"]["pc"][2], ix, y + 9, 16))
            tx_ = x + w - 30 if rtl else x + 30
            o.append(txt(tx_, y + 21, 11, it["title"], pal["text"], bold=True))
            for j, ln in enumerate(it["lines"]):
                o.append(txt(x + w - 9 if rtl else x + 9, y + 37 + j * 11, 9.5, ln, pal["muted"]))
        elif kind == "image":
            x, y, w, h = it["x"], it["y"], it["w"], it["h"]
            o.append(f'<rect x="{x - 1:.0f}" y="{y - 1}" width="{w + 2:.0f}" height="{h + 2}" rx="8" fill="{pal["shot_line"]}"/>')
            mime = "image/png" if it["src"].endswith(".png") else "image/webp"
            o.append(f'<image x="{x:.0f}" y="{y}" width="{w:.0f}" height="{h}" href="data:{mime};base64,{it["b64"]}" preserveAspectRatio="none"/>')
            if it["caption"]:
                o.append(txt(start(x, w), y + h + 17, 10.5, it["caption"], pal["faint"], m=True))
            if it.get("cap2"):
                o.append(txt(start(x, w), y + h + 31, 10.5, it["cap2"], pal["faint"], m=True))
        elif kind == "text":
            # في نصّ rtl يكون start هو الحافّة اليمنى — فالمرساة لا تتبدّل، والموضع فقط
            a = it["anchor"]
            if a == "middle":
                x = it["x"] + it["w"] / 2
            elif (a == "start") != rtl:
                x = it["x"]
            else:
                x = it["x"] + it["w"]
            o.append(txt(x, it["y"] + it["size"], it["size"], it["s"], pal[it["color"]], bold=it["bold"], m=it["mono"], anchor=a, ls=it["ls"], s2=it.get("s2")))
        elif kind == "chip":
            o.append(rect(it["x"], it["y"], it["w"], it["h"], pal["card"], pal["card_line"], rx=it["h"] / 2))
            o.append(txt(it["x"] + it["w"] / 2, it["y"] + it["h"] / 2 + 4, 12 if it["h"] > 24 else 10.5, it["s"], pal["text"], m=True, anchor="middle"))
        elif kind == "callout":
            o.append(f'<circle cx="{it["x"]:.0f}" cy="{it["y"]:.0f}" r="12" fill="{pal["gold"]}" stroke="{pal["bg"]}" stroke-width="2"/>')
            o.append(txt(it["x"], it["y"] + 4, 11.5, str(it["n"]), ink_on_accent, bold=True, m=True, anchor="middle"))
        elif kind == "line":
            col = pal["card_line"] if it["tone"] == "rule" else pal["zone"]["life"][2]
            d = " ".join(f"{'M' if i == 0 else 'L'}{px:.0f} {py:.0f}" for i, (px, py) in enumerate(it["pts"]))
            o.append(f'<path d="{d}" fill="none" stroke="{col}" stroke-width="{1 if it["tone"] == "rule" else 2}" opacity="{1 if it["tone"] == "rule" else 0.7}"/>')
        elif kind == "node":
            acc = pal["zone"]["life"][2]
            x, y = it["x"], it["y"]
            o.append(f'<circle cx="{x:.0f}" cy="{y}" r="9" fill="{pal["bg"]}" stroke="{acc}" stroke-width="2.5"/>')
            o.append(txt(x, y + 4, 9, str(it["n"]), acc, bold=True, m=True, anchor="middle"))
            if it["place"] == "side":
                # عمودي (الجوال): الخطوة والعنوان في سطر واحد بجانب العقدة، والشرح تحتهما
                tx_ = x - 22 if rtl else x + 22
                anc = "start"  # في rtl تعني الحافّة اليمنى، وهذا المطلوب
                step = it["step"].upper() if lang == "en" else it["step"]
                sw_ = len(step) * (7.4 if lang == "en" else 6.6) + 10
                o.append(txt(tx_, y - 4, 9.5, step, acc, m=True, anchor=anc, ls="0.12em" if lang == "en" else None))
                o.append(txt(tx_ - sw_ if rtl else tx_ + sw_, y - 4, 12, it["title"], pal["text"], bold=True, anchor=anc))
                for j, ln in enumerate(it["lines"]):
                    o.append(txt(tx_, y + 12 + j * 12, 9.8, ln, pal["muted"], anchor=anc))
            else:
                up = it["place"] == "up"
                ty_ = y - 60 if up else y + 36
                o.append(f'<line x1="{x:.0f}" y1="{y - 12 if up else y + 12}" x2="{x:.0f}" y2="{y - 24 if up else y + 24}" stroke="{acc}" opacity="0.6"/>')
                o.append(txt(x, ty_, 10.5, it["step"].upper() if lang == "en" else it["step"], acc, m=True, anchor="middle", ls="0.14em" if lang == "en" else None))
                o.append(txt(x, ty_ + 18, 13.5, it["title"], pal["text"], bold=True, anchor="middle"))
                for j, ln in enumerate(it["lines"]):
                    o.append(txt(x, ty_ + 36 + j * 13, 10.5, ln, pal["muted"], anchor="middle"))
    for kind, it in L.items:
        if kind != "edge":
            continue
        d = " ".join(f"{'M' if i == 0 else 'L'}{px:.0f} {py:.0f}" for i, (px, py) in enumerate(it["pts"]))
        col = pal["accent"] if it["accent"] else pal["edge"]
        dash = ' stroke-dasharray="7 6"' if it["dashed"] else ""
        o.append(f'<path d="{d}" fill="none" stroke="{col}" stroke-width="1.6"{dash} marker-end="url(#{"arra" if it["accent"] else "arr"})" opacity="0.9"/>')
        if it["label"]:
            lx, ly = it["lpos"]
            tw = len(it["label"]) * (6.6 if lang == "en" else 7) + 16
            o.append(f'<rect x="{lx - tw / 2:.0f}" y="{ly - 10}" width="{tw:.0f}" height="20" rx="6" fill="{pal["label_bg"]}" stroke="{pal["card_line"]}"/>')
            o.append(txt(lx, ly + 4, 10.5, it["label"], pal["text"], m=True, anchor="middle"))
    o.append("</svg>\n")
    return "\n".join(o)


# ------------------------------------------------------------------ draw.io (النسخة الفاتحة، الصور من الموقع)
def render_drawio(L, lang, pal, page_id, version):
    rtl = L.rtl
    esc = lambda s: html.escape(s, quote=True)
    tdir = "textDirection=rtl;" if rtl else ""
    align = "left"  # draw.io: align=left + whiteSpace=wrap يحاذي إلى بداية السطر في الاتجاهين
    cells = ['<mxCell id="0"/>', '<mxCell id="1" parent="0"/>']
    P = page_id
    img_v = "?v=" + version.lstrip("v")

    def add(c):
        cells.append(c)

    def vertex(cid, x, y, w, h, style, value=""):
        add(f'<mxCell id="{cid}_{P}" value="{esc(value)}" style="{style}" vertex="1" parent="1"><mxGeometry x="{x:.0f}" y="{y:.0f}" width="{w:.0f}" height="{h:.0f}" as="geometry"/></mxCell>')

    def text_style(size, color, bold=False, mono=False, anchor="start"):
        a = {"start": align, "end": "right" if not rtl else "left", "middle": "center"}[anchor]
        return (f"text;html=1;whiteSpace=wrap;overflow=hidden;align={a};verticalAlign=middle;fontSize={size};fontColor={color};"
                f"{'fontStyle=1;' if bold else ''}{'fontFamily=Consolas;' if mono else ''}{tdir}")

    for kind, it in L.items:
        if kind == "zone":
            fill, line, acc = pal["zone"][it["key"]]
            vertex(it["key"], it["x"], it["y"], it["w"], it["h"], f"rounded=1;arcSize=4;html=1;fillColor={fill};strokeColor={line};strokeWidth=2;dashed=1;fontSize=1;fontColor={fill};")
            tw = len(it["title"]) * 8.6 + 40
            tx_ = it["x"] + it["w"] - 18 - tw if rtl else it["x"] + 18
            vertex(it["key"] + "_t", tx_, it["y"] - 16, tw, 32, f"rounded=1;arcSize=40;html=1;fillColor={acc};strokeColor=none;fontColor=#ffffff;fontStyle=1;fontSize=13;{tdir}", it["title"])
        elif kind == "logo":
            r = 22 if it.get("small") else 30
            vertex("logo", it["x"], it["y"], 2 * r, 2 * r, f"ellipse;fillColor={pal['accent']};strokeColor=none;")
            vertex("logo_i", it["x"] + r * 0.47, it["y"] + r * 0.47, r * 1.06, r * 1.06, f"shape=image;image={write_icon_file('zap', 'ffffff')};")
    for kind, it in L.items:
        if kind == "panel":
            vertex(it["key"], it["x"], it["y"], it["w"], it["h"], f"rounded=1;arcSize=6;html=1;fillColor={pal['card']};strokeColor={pal['card_line']};opacity=70;fontSize=1;")
            ix = it["x"] + it["w"] - 42 if rtl else it["x"] + 20
            vertex(it["key"] + "_i", ix, it["y"] + 11, 22, 22, f"shape=image;image={write_icon_file('zap', pal['accent'])};")
            vertex(it["key"] + "_t", it["x"] + 52, it["y"] + 6, it["w"] - 104, 32, text_style(13, pal["text"], bold=True, mono=True),
                   f"{it['title']}" + (f'&nbsp;&nbsp;<font style="font-size:11px" color="{pal["muted"]}">{it["sub"]}</font>' if it["sub"] else ""))
    for kind, it in L.items:
        if kind == "card":
            accent = it["tone"] == "accent"
            acc = pal["accent"] if accent else pal["zone"][it["tone"]][2]
            vertex(it["key"], it["x"], it["y"], it["w"], it["h"],
                   f"rounded=1;arcSize=14;html=1;fillColor={pal['accent_soft'] if accent else pal['card']};strokeColor={pal['accent'] if accent else pal['card_line']};{'' if accent else 'shadow=1;'}fontSize=1;")
            ix = it["x"] + it["w"] - 36 if rtl else it["x"] + 16
            vertex(it["key"] + "_i", ix, it["y"] + 16, 20, 20, f"shape=image;image={write_icon_file(it['icon'], acc)};")
            tx_ = it["x"] + 12 if rtl else it["x"] + 52
            value = f"<b>{it['title']}</b>" + "".join(f'<br><font style="font-size:10px" color="{pal["muted"]}">{ln}</font>' for ln in it["lines"])
            vertex(it["key"] + "_l", tx_, it["y"] + 4, it["w"] - 64, it["h"] - 8, text_style(12, pal["text"]), value)
        elif kind == "module":
            if it["box"]:
                vertex(it["key"], it["x"], it["y"], it["w"], it["h"], f"rounded=1;arcSize=14;html=1;fillColor={pal['card']};strokeColor={pal['card_line']};fontSize=1;")
            ix = it["x"] + it["w"] - 25 if rtl else it["x"] + 9
            vertex(it["key"] + "_i", ix, it["y"] + 9, 16, 16, f"shape=image;image={write_icon_file(it['icon'], pal['accent'])};")
            vertex(it["key"] + "_t", it["x"] + 6 if rtl else it["x"] + 30, it["y"] + 6, it["w"] - 36, 20, text_style(10.5, pal["text"], bold=True), it["title"])
            vertex(it["key"] + "_l", it["x"] + 6, it["y"] + 28, it["w"] - 12, it["h"] - 30, text_style(9, pal["muted"]).replace("verticalAlign=middle", "verticalAlign=top"), "<br>".join(it["lines"]))
        elif kind == "image":
            vertex(it["key"], it["x"], it["y"], it["w"], it["h"], f"shape=image;imageAspect=0;image={SITE}diagram/{it['src']}{img_v};rounded=1;strokeColor={pal['shot_line']};shadow=1;")
            caps = [c for c in (it["caption"], it.get("cap2")) if c]
            if caps:
                vertex(it["key"] + "_c", it["x"], it["y"] + it["h"] + 4, it["w"], 14 * len(caps) + 6, text_style(9.5, pal["faint"], mono=True).replace("verticalAlign=middle", "verticalAlign=top"), "<br>".join(caps))
        elif kind == "text":
            val = it["s"] + (f' <font color="{pal["muted"]}">{it["s2"]}</font>' if it.get("s2") else "")
            vertex(it["key"], it["x"], it["y"], it["w"], it["size"] + 10, text_style(it["size"], pal[it["color"]], it["bold"], it["mono"], it["anchor"]), val)
        elif kind == "chip":
            vertex(it["key"], it["x"], it["y"], it["w"], it["h"], f"rounded=1;arcSize=50;html=1;fillColor={pal['card']};strokeColor={pal['card_line']};fontSize=11;fontFamily=Consolas;fontColor={pal['text']};", it["s"])
        elif kind == "callout":
            vertex(it["key"], it["x"] - 12, it["y"] - 12, 24, 24, f"ellipse;fillColor={pal['gold']};strokeColor=#ffffff;strokeWidth=2;fontColor=#ffffff;fontStyle=1;fontSize=11;fontFamily=Consolas;", str(it["n"]))
        elif kind == "line":
            col = pal["card_line"] if it["tone"] == "rule" else pal["zone"]["life"][2]
            p0, p1 = it["pts"][0], it["pts"][-1]
            add(f'<mxCell id="{it["key"]}_{P}" style="edgeStyle=none;strokeColor={col};strokeWidth={1 if it["tone"] == "rule" else 2};endArrow=none;" edge="1" parent="1">'
                f'<mxGeometry relative="1" as="geometry"><mxPoint x="{p0[0]:.0f}" y="{p0[1]:.0f}" as="sourcePoint"/><mxPoint x="{p1[0]:.0f}" y="{p1[1]:.0f}" as="targetPoint"/></mxGeometry></mxCell>')
        elif kind == "node":
            acc = pal["zone"]["life"][2]
            x, y = it["x"], it["y"]
            vertex(it["key"], x - 9, y - 9, 18, 18, f"ellipse;fillColor={pal['bg']};strokeColor={acc};strokeWidth=2;fontColor={acc};fontStyle=1;fontSize=8;fontFamily=Consolas;", str(it["n"]))
            body = f'<font style="font-size:9px" color="{acc}">{it["step"].upper() if lang == "en" else it["step"]}</font><br><b>{it["title"]}</b><br><font style="font-size:9px" color="{pal["muted"]}">{"<br>".join(it["lines"])}</font>'
            if it["place"] == "side":
                vertex(it["key"] + "_t", x - 22 - 300 if rtl else x + 22, y - 12, 300, 60, text_style(11, pal["text"]).replace("verticalAlign=middle", "verticalAlign=top"), body)
            else:
                up = it["place"] == "up"
                vertex(it["key"] + "_t", x - 100, y - 96 if up else y + 22, 200, 80, text_style(11, pal["text"], anchor="middle").replace("verticalAlign=middle", "verticalAlign=bottom" if up else "verticalAlign=top"), body)
    for kind, it in L.items:
        if kind != "edge":
            continue
        pts = it["pts"]
        col = pal["accent"] if it["accent"] else pal["edge"]
        style = (f"edgeStyle=none;html=1;rounded=1;strokeColor={col};strokeWidth=1.6;endArrow=blockThin;endFill=1;fontSize=10;"
                 f"fontColor={pal['text']};labelBackgroundColor={pal['bg']};fontFamily=Consolas;{'dashed=1;' if it['dashed'] else ''}{tdir}")
        inner = "".join(f'<mxPoint x="{px:.0f}" y="{py:.0f}"/>' for px, py in pts[1:-1])
        add(f'<mxCell id="{it["key"]}_{P}" value="{esc(it["label"] or "")}" style="{style}" edge="1" parent="1"><mxGeometry relative="1" as="geometry">'
            f'<mxPoint x="{pts[0][0]:.0f}" y="{pts[0][1]:.0f}" as="sourcePoint"/><mxPoint x="{pts[-1][0]:.0f}" y="{pts[-1][1]:.0f}" as="targetPoint"/>'
            + (f'<Array as="points">{inner}</Array>' if inner else "") + "</mxGeometry></mxCell>")
    name = "العربية" if rtl else "English"
    return (f'<diagram id="{P}" name="{name}"><mxGraphModel dx="1600" dy="1000" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" '
            f'page="1" pageScale="1" pageWidth="{L.W}" pageHeight="{L.H}" background="{pal["bg"]}" math="0" shadow="0"><root>{"".join(cells)}</root></mxGraphModel></diagram>')


# ------------------------------------------------------------------ main
def main():
    variant = sys.argv[1] if len(sys.argv) > 1 else "site"
    if variant == "upstream":
        src, out = sys.argv[2], sys.argv[3]
        tmp = os.path.join(out, "_tmp")
        os.makedirs(tmp, exist_ok=True)
        A = {
            "launcher": shot(os.path.join(src, "pr_launcher_en.png"), "launcher", 520, 363, tmp),
            "launcher_alt": shot(os.path.join(src, "pr_launcher_ar.png"), "launcher_ar", 120, 84, tmp),
            "launcher_light": shot(os.path.join(src, "pr_launcher_light.png"), "launcher_light", 120, 84, tmp),
            "classic_en": shot(os.path.join(src, "pr_en.png"), "classic_en", 250, 57, tmp),
            "classic_ar": shot(os.path.join(src, "pr_ar.png"), "classic_ar", 250, 57, tmp),
        }
        for theme, name in (("dark", "architecture.svg"), ("light", "architecture-light.svg")):
            pal = PALS["upstream"][theme]
            a = dict(A, regions=regions_map(pal, (52.1, 5.3), f"regions-{theme}", tmp))
            L = build("en", "upstream", a)
            with open(os.path.join(out, name), "w", encoding="utf-8", newline="\n") as f:
                f.write(render_svg(L, "en", pal, theme == "dark"))
            print("wrote", os.path.join(out, name))
        return

    # site: الصور من public/img و من لقطات طلب الدمج المنسوخة إلى public/img/pr
    img = lambda p: os.path.join(ROOT, "public", "img", p)
    A = {
        "launcher": shot(img("ar-main-dark.webp"), "launcher", 520, 363, THUMBS),
        "launcher_alt": shot(img("pr/pr_launcher_en.png"), "launcher_en", 120, 84, THUMBS),
        "launcher_light": shot(img("ar-main-light.webp"), "launcher_light", 120, 84, THUMBS),
        "classic_en": shot(img("pr/pr_en.png"), "classic_en", 250, 57, THUMBS),
        "classic_ar": shot(img("pr/pr_ar.png"), "classic_ar", 250, 57, THUMBS),
    }
    version = "v3.1.4"
    pages = []
    for lang in ("ar", "en"):
        for theme in ("light", "dark"):
            pal = PALS["site"][theme]
            a = dict(A, regions=regions_map(pal, (24.7, 46.7), f"regions-{theme}", THUMBS))
            L = build(lang, "site", a)
            with open(os.path.join(OUT, f"architecture-{lang}-{theme}.svg"), "w", encoding="utf-8", newline="\n") as f:
                f.write(render_svg(L, lang, pal, theme == "dark"))
            Lm = build_mobile(lang, "site", a)
            with open(os.path.join(OUT, f"architecture-{lang}-{theme}-mobile.svg"), "w", encoding="utf-8", newline="\n") as f:
                f.write(render_svg(Lm, lang, pal, theme == "dark"))
            if theme == "light":
                pages.append(render_drawio(L, lang, pal, lang, version))
    xml = ('<?xml version="1.0" encoding="UTF-8"?>\n<mxfile host="dropship-site" modified="2026-09-21T00:00:00.000Z" agent="scripts/diagram_map.py" version="24.0.0" type="device">'
           + "".join(pages) + "</mxfile>\n")
    with open(os.path.join(OUT, "dropship-ar.drawio"), "w", encoding="utf-8", newline="\n") as f:
        f.write(xml)
    print("wrote", OUT)


if __name__ == "__main__":
    main()
