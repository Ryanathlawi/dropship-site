# -*- coding: utf-8 -*-
"""مخطط المشروع الكامل: يولّد ملف draw.io (صفحتان: عربي وإنجليزي) وصور SVG للموقع والـ README
من نموذج واحد، حتى يبقى الرسم قابلًا للتعديل في draw.io ومطابقًا لما يظهر في الموقع.

    python scripts/diagram.py

المخرجات: public/diagram/dropship-ar.drawio و public/diagram/architecture-{ar,en}-{light,dark}.svg
"""
import html
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "public", "diagram")
os.makedirs(OUT, exist_ok=True)

W, H = 1720, 1150

# ------------------------------------------------------------------ الألوان (فاتح / داكن)
PAL = {
    "light": {
        "bg": "#f6f8fa", "text": "#0b1220", "muted": "#4b5563", "line": "#94a3b8", "edge": "#334155",
        "ui": ("#dbeafe", "#60a5fa"), "core": ("#ede9fe", "#a78bfa"), "mod": ("#dcfce7", "#4ade80"),
        "win": ("#e2e8f0", "#94a3b8"), "bliz": ("#ffedd5", "#fb923c"), "up": ("#fef3c7", "#f59e0b"),
        "ar": ("#ccfbf1", "#14b8a6"), "app": ("#ffffff", "#0f766e"), "pc": ("#f1f5f9", "#64748b"),
        "cont_bliz": ("#fff7ed", "#fdba74"), "cont_up": ("#fffbeb", "#fcd34d"), "cont_ar": ("#f0fdfa", "#5eead4"),
        "legend": ("#ffffff", "#cbd5e1"),
    },
    "dark": {
        "bg": "#0a0f14", "text": "#eef4f6", "muted": "#9fb3bd", "line": "#334155", "edge": "#cbd5e1",
        "ui": ("#172554", "#3b82f6"), "core": ("#2e1065", "#8b5cf6"), "mod": ("#052e16", "#22c55e"),
        "win": ("#1e293b", "#64748b"), "bliz": ("#431407", "#f97316"), "up": ("#451a03", "#f59e0b"),
        "ar": ("#042f2e", "#14b8a6"), "app": ("#0f1720", "#2dd4bf"), "pc": ("#0f172a", "#475569"),
        "cont_bliz": ("#1c1008", "#9a3412"), "cont_up": ("#1c1508", "#92400e"), "cont_ar": ("#071a19", "#0f766e"),
        "legend": ("#0f1720", "#334155"),
    },
}

# ------------------------------------------------------------------ النموذج
# كل عنصر: (المعرّف، النوع، x, y, w, h، اللون، {ar: [أسطر], en: [أسطر]})
# النوع: cont = حاوية (العنوان سطر واحد)، box = صندوق (السطر الأول عنوان)

def T(ar, en):
    return {"ar": ar, "en": en}

NODES = [
    # الحاويات
    ("pc", "cont", 40, 100, 1060, 890, "pc",
     T(["جهاز اللاعب — Windows 10 / 11"], ["Player's PC — Windows 10 / 11"])),
    ("app", "cont", 80, 300, 980, 650, "app",
     T(["dropship — النسخة العربية v3.1.2 · Rust · eframe/egui 0.36 · tokio"],
       ["dropship — Arabic edition v3.1.2 · Rust · eframe/egui 0.36 · tokio"])),
    ("bliz", "cont", 1140, 100, 540, 330, "cont_bliz",
     T(["Blizzard — الإنترنت"], ["Blizzard — the internet"])),
    ("up", "cont", 1140, 460, 540, 190, "cont_up",
     T(["الأصل — stormy (GPL-3.0)"], ["Upstream — stormy (GPL-3.0)"])),
    ("aredit", "cont", 1140, 680, 540, 440, "cont_ar",
     T(["النسخة العربية — تطوير ريان العذلاوي"], ["Arabic edition — developed by Ryan Athlawi"])),

    # الصف العلوي داخل الجهاز
    ("ow", "box", 80, 150, 240, 90, "win",
     T(["Overwatch 2", "Overwatch.exe", "Battle.net أو Steam"], ["Overwatch 2", "Overwatch.exe", "Battle.net or Steam"])),
    ("wfp", "box", 480, 150, 300, 90, "win",
     T(["Windows Filtering Platform", "فلاتر dropship: Overwatch.exe ← نطاقات", "المناطق المحظورة تُرمى هنا ✗"],
       ["Windows Filtering Platform", "dropship filters: Overwatch.exe → blocked", "regions' IP blocks are dropped here ✗"])),

    # واجهة المستخدم
    ("ui1", "box", 100, 350, 148, 110, "ui",
     T(["اللانشر", "خريطة عالم منقّطة", "مسارات منك لكل سيرفر", "نقرة = حظر / سماح"],
       ["Launcher", "dotted world map", "routes from you to servers", "click = block / allow"])),
    ("ui2", "box", 260, 350, 148, 110, "ui",
     T(["لوحة السيرفرات", "علم · اسم · بنق · مفتاح", "ترتيب حسب البنق", "اختصارات الحظر (F1…)"],
       ["Servers panel", "flag · name · ping · switch", "sort by ping", "blocking presets (F1…)"])),
    ("ui3", "box", 420, 350, 148, 110, "ui",
     T(["أفضل مسار", "أقل بنق مسموح", "دائم / أثناء التشغيل"],
       ["Best route", "lowest allowed ping", "permanent / while open"])),
    ("ui4", "box", 580, 350, 148, 110, "ui",
     T(["العروض", "الألعاب · الأخبار · السجل", "المساعدة · الخيارات", "M و 1–4 للتنقل"],
       ["Views", "games · news · log", "help · options", "M and 1–4 to switch"])),
    ("ui5", "box", 740, 350, 148, 110, "ui",
     T(["الترحيب والجولة", "3 صفحات ترحيب", "جولة من 14 خطوة", "تشرح كل عنصر"],
       ["Welcome & tour", "3 welcome pages", "14-step guided tour", "explains every element"])),
    ("ui6", "box", 900, 350, 148, 110, "ui",
     T(["الأصول", "خط ثمانية", "أعلام · أيقونات lucide", "قناع العالم 180×76"],
       ["Assets", "Thmanyah font", "flags · lucide icons", "world mask 180×76"])),

    # النواة
    ("core1", "box", 100, 490, 310, 90, "core",
     T(["موزّع الأوامر (Commands)", "كل طلب من الواجهة يصير أمرًا", "يُنفَّذ في مهمة tokio"],
       ["Commands dispatcher", "every UI request becomes a command", "run on a tokio task"])),
    ("core2", "box", 420, 490, 310, 90, "core",
     T(["موزّع الأحداث (Events)", "نتائج المهام تعود أحداثًا", "تُطبَّق على الحالة قبل كل إطار"],
       ["Events dispatcher", "task results return as events", "applied to state before each frame"])),
    ("core3", "box", 740, 490, 308, 90, "core",
     T(["المجدوِل", "اللعبة كل 0.9 ث · البنق كل 15 ث", "القائمة كل 15 د · التحديث كل 2.5 س"],
       ["Scheduler", "game check 0.9 s · ping 15 s", "server list 15 min · update 2.5 h"])),

    # الوحدات
    ("m1", "box", 100, 610, 126, 130, "mod",
     T(["الجدار الناري", "فلاتر WFP لكل", "ملف لعبة", "دائمة أو مؤقتة"],
       ["Firewall", "WFP filters per", "game executable", "permanent or session"])),
    ("m2", "box", 237, 610, 126, 130, "mod",
     T(["البنق", "IcmpSendEcho ×3", "بديل داخل نطاقات", "السيرفر لو صمت"],
       ["Ping", "IcmpSendEcho ×3", "falls back to the", "server's own blocks"])),
    ("m3", "box", 374, 610, 126, 130, "mod",
     T(["اللعبة", "sysinfo: هل تعمل؟", "مسار الـ exe", "التغيير ينتظر", "إغلاقها"],
       ["Game process", "sysinfo: running?", "exe path", "changes wait", "until it closes"])),
    ("m4", "box", 511, 610, 126, 130, "mod",
     T(["المحدّث", "آخر إصدار من GitHub", "تنزيل الـ exe", "وتبديله ثم إعادة تشغيل"],
       ["Updater", "latest GitHub release", "downloads the exe", "swaps it and restarts"])),
    ("m5", "box", 648, 610, 126, 130, "mod",
     T(["قائمة السيرفرات", "ips.json من stormy", "الاسم والرمز والنطاقات", "وعنوان الـ ping"],
       ["Server list", "ips.json from stormy", "name, code, IP blocks", "and ping address"])),
    ("m6", "box", 785, 610, 126, 130, "mod",
     T(["الإعدادات", "app.ron", "المحظور · الاختصارات", "المظهر · الوضع المصغّر"],
       ["Config", "app.ron", "blocked · presets", "theme · mini mode"])),
    ("m7", "box", 922, 610, 126, 130, "mod",
     T(["السجل", "كل ما يجري بالعربي", "شريط الحالة 9 ثوانٍ", "تصدير الآيبيات"],
       ["Log", "everything, in Arabic", "9-second status bar", "export blocked IPs"])),

    # الصف السفلي داخل التطبيق
    ("b1", "box", 100, 770, 300, 150, "win",
     T(["الحالة المحفوظة", "%APPDATA%\\dropship\\data\\app.ron", "تُحفظ تلقائيًا كل 30 ث وعند الإغلاق", "الحظر يبقى بعد إغلاق النافذة"],
       ["Persisted state", "%APPDATA%\\dropship\\data\\app.ron", "auto-saved every 30 s and on exit", "blocking survives closing the window"])),
    ("b2", "box", 420, 770, 300, 150, "win",
     T(["موقعك على الخريطة", "GetUserDefaultGeoName (منطقة ويندوز)", "→ إحداثيات تقريبية للعاصمة", "بدونها: قرب أفضل سيرفر"],
       ["Your spot on the map", "GetUserDefaultGeoName (Windows region)", "→ approximate capital coordinates", "otherwise: near the best server"])),
    ("b3", "box", 740, 770, 308, 150, "win",
     T(["الأنميشن (نسخة اختيارية)", "المسارات تتدفق والنقاط تنبض", "25 إطارًا والنافذة مركّزة فقط", "≈2% من نواة واحدة في الخلفية"],
       ["Animation (optional build)", "routes flow, nodes pulse", "25 fps only while focused", "≈2% of one core in the background"])),

    # Blizzard
    ("mm", "box", 1170, 150, 480, 70, "bliz",
     T(["تسجيل الدخول والماتش ميكر", "يختار أقرب منطقة يستطيع الوصول إليها — المحظورة تُتخطّى"],
       ["Login & matchmaker", "picks the nearest region it can reach — blocked ones are skipped"])),
    ("regions", "box", 1170, 240, 480, 170, "bliz",
     T(["مناطق سيرفرات اللعبة (نطاقات IP من ips.json)",
        "ams1 هولندا · gen1 فنلندا · gmec2 السعودية (الدمام)",
        "gsg1 سنغافورة · gtk1 اليابان · tpe1 تايوان · syd2 أستراليا",
        "gue4 أمريكا الشرقية · ord1 الوسطى · las1 لاس فيغاس · gbr1 البرازيل",
        "كل منطقة: عدة نطاقات Google Cloud / Blizzard"],
       ["Game server regions (IP blocks from ips.json)",
        "ams1 Netherlands · gen1 Finland · gmec2 Saudi Arabia (Dammam)",
        "gsg1 Singapore · gtk1 Japan · tpe1 Taiwan · syd2 Australia",
        "gue4 US East · ord1 US Central · las1 Las Vegas · gbr1 Brazil",
        "each region: several Google Cloud / Blizzard IP blocks"])),

    # stormy
    ("ips", "box", 1170, 505, 225, 120, "up",
     T(["ips.json", "قائمة السيرفرات: الاسم، الرمز،", "نطاقات IP، عنوان ping", "يصونها stormy على GitHub Pages"],
       ["ips.json", "server list: name, code,", "IP blocks, ping address", "maintained by stormy on GitHub Pages"])),
    ("uprepo", "box", 1420, 505, 230, 120, "up",
     T(["stowmyy/dropship", "البرنامج الأصلي: الحظر عبر WFP،", "اكتشاف اللعبة، المحدّث", "ديسكورد الأصل (بالإنجليزي)"],
       ["stowmyy/dropship", "the original: WFP blocking,", "game detection, updater", "original Discord (English)"])),

    # النسخة العربية
    ("actions", "box", 1170, 725, 225, 95, "ar",
     T(["GitHub Actions", "cargo xwin: بناء ويندوز من لينكس", "عند تغيّر رقم الإصدار في main"],
       ["GitHub Actions", "cargo xwin: Windows build on Linux", "whenever the version changes on main"])),
    ("arrepo", "box", 1420, 725, 230, 95, "ar",
     T(["Ryanathlawi/dropship-ar", "اللانشر · الاختصارات · الجولة · التعريب", "epaint معدّل لتشكيل العربية"],
       ["Ryanathlawi/dropship-ar", "launcher · presets · tour · Arabic UI", "epaint patched for Arabic shaping"])),
    ("rel", "box", 1170, 840, 225, 90, "ar",
     T(["الإصدارات (Latest)", "dropship-ar.exe", "dropship-ar-animated.exe", "version.txt"],
       ["Releases (Latest)", "dropship-ar.exe", "dropship-ar-animated.exe", "version.txt"])),
    ("site", "box", 1420, 840, 230, 90, "ar",
     T(["dropship-site", "React 19 · Vite · motion", "GitHub Pages · عربي وإنجليزي"],
       ["dropship-site", "React 19 · Vite · motion", "GitHub Pages · Arabic & English"])),
    ("comm", "box", 1170, 950, 225, 70, "ar",
     T(["المجتمع", "ديسكورد النسخة العربية · دعم PayPal"],
       ["Community", "Arabic Discord · PayPal support"])),
    ("gh", "box", 1420, 950, 230, 70, "ar",
     T(["GitHub API", "التحميلات · النجوم · الإصدارات · المساهمون"],
       ["GitHub API", "downloads · stars · releases · contributors"])),

    # الشرح
    ("legend", "box", 40, 1010, 1060, 110, "legend",
     T(["كيف تقرأ المخطط",
        "الأسهم = تدفق البيانات · المتقطّع = يتكرر دوريًا · أزرق: الواجهة · بنفسجي: النواة · أخضر: الوحدات · رمادي: ويندوز",
        "برتقالي: Blizzard · كهرماني: الأصل (stormy) · تيل: النسخة العربية (ريان العذلاوي) · الترخيص GPL-3.0 للكل"],
       ["How to read this",
        "arrows = data flow · dashed = periodic · blue: UI · violet: core · green: modules · grey: Windows",
        "orange: Blizzard · amber: upstream (stormy) · teal: Arabic edition (Ryan Athlawi) · everything GPL-3.0"])),
]

# الأسهم: (المعرّف، من، إلى، نقاط المسار [(x,y)...] من البداية إلى النهاية، متقطّع؟، {ar, en}، موضع النص (x,y) اختياري)
EDGES = [
    ("e1", "ow", "wfp", [(320, 195), (480, 195)], False, T(["حركة اللعبة (UDP)"], ["game traffic (UDP)"]), (400, 178)),
    ("e2", "wfp", "regions", [(780, 195), (1110, 195), (1110, 325), (1170, 325)], False,
     T(["المناطق المسموحة فقط تمرّ"], ["only allowed regions get through"]), (945, 178)),
    ("e3", "regions", "mm", [(1410, 240), (1410, 220)], True,
     T(["ما لا يمكن الوصول إليه لا يُختار"], ["unreachable = never picked"]), (1410, 232)),
    ("e4", "app", "wfp", [(630, 300), (630, 240)], False,
     T(["يضيف / يزيل الفلاتر"], ["adds / removes filters"]), (700, 270)),
    ("e5", "app", "ow", [(200, 300), (200, 240)], True,
     T(["هل اللعبة شغّالة؟ كل 0.9 ث"], ["game running? every 0.9 s"]), (285, 270)),
    ("e6", "app", "regions", [(1060, 395), (1120, 395), (1120, 380), (1170, 380)], True,
     T(["ping كل 15 ث"], ["ping every 15 s"]), (1110, 415)),
    ("e7", "app", "ips", [(1060, 565), (1170, 565)], True,
     T(["القائمة كل 15 د"], ["list every 15 min"]), (1115, 548)),
    ("e8", "app", "rel", [(1060, 885), (1170, 885)], True,
     T(["تحديث؟ كل 2.5 س"], ["update? every 2.5 h"]), (1115, 868)),
    ("e9", "uprepo", "arrepo", [(1535, 625), (1535, 725)], False,
     T(["fork · GPL-3.0"], ["fork · GPL-3.0"]), (1585, 675)),
    ("e10", "arrepo", "actions", [(1420, 772), (1395, 772)], False,
     T(["push"], ["push"]), (1407, 758)),
    ("e11", "actions", "rel", [(1282, 820), (1282, 840)], False,
     T(["ينشر Latest"], ["publishes Latest"]), (1345, 830)),
    ("e12", "site", "rel", [(1420, 885), (1395, 885)], False,
     T(["روابط التحميل"], ["download links"]), (1407, 900)),
    ("e13", "site", "gh", [(1535, 930), (1535, 950)], True,
     T(["الإحصائيات"], ["live stats"]), (1590, 940)),
    ("e14", "ui2", "core1", [(255, 460), (255, 490)], False, T(["أوامر"], ["commands"]), (290, 475)),
    ("e15", "core2", "ui4", [(575, 490), (575, 460)], False, T(["أحداث"], ["events"]), (610, 475)),
    ("e16", "core1", "m2", [(255, 580), (255, 610)], False, T(["مهام"], ["tasks"]), (285, 595)),
    ("e17", "m4", "core2", [(575, 610), (575, 580)], False, T(["نتائج"], ["results"]), (610, 595)),
    ("e18", "m6", "b1", [(848, 740), (848, 755), (250, 755), (250, 770)], False,
     T(["حفظ / تحميل"], ["save / load"]), (560, 748)),
]

TITLE = T(["dropship — النسخة العربية · مخطط المشروع الكامل"], ["dropship — Arabic edition · full project map"])
SUBTITLE = T(["الإصدار 3.1.2 · سبتمبر 2026 · تطوير ريان العذلاوي · مبني على dropship من stormy"],
             ["v3.1.2 · September 2026 · developed by Ryan Athlawi · built on dropship by stormy"])


# ------------------------------------------------------------------ draw.io
def drawio_page(lang, page_id):
    pal = PAL["light"]
    rtl = lang == "ar"
    cells = ['<mxCell id="0"/>', '<mxCell id="1" parent="0"/>']
    esc = lambda s: html.escape(s, quote=True)
    n = 2

    def add(cell):
        nonlocal n
        n += 1
        cells.append(cell)

    tdir = "textDirection=rtl;" if rtl else ""
    # العنوان
    add(f'<mxCell id="title_{page_id}" value="{esc("<b>" + TITLE[lang][0] + "</b><br>" + SUBTITLE[lang][0])}" '
        f'style="text;html=1;align={"right" if rtl else "left"};verticalAlign=middle;fontSize=18;fontColor={pal["text"]};{tdir}" vertex="1" parent="1">'
        f'<mxGeometry x="{40 if not rtl else W - 40 - 900}" y="20" width="900" height="60" as="geometry"/></mxCell>')
    for nid, kind, x, y, w, h, color, label in NODES:
        fill, stroke = pal[color]
        lines = label[lang]
        if kind == "cont":
            style = (f"swimlane;html=1;startSize=32;rounded=1;arcSize=6;fillColor={fill};strokeColor={stroke};strokeWidth=2;"
                     f"fontColor={pal['text']};fontSize=15;fontStyle=1;swimlaneFillColor={fill};dashed=1;{tdir}")
            value = esc(lines[0])
        else:
            body = "<br>".join(lines[1:])
            value = esc(f"<b>{lines[0]}</b>" + (f"<br><font style=\"font-size:11px\" color=\"{pal['muted']}\">{body}</font>" if body else ""))
            style = (f"rounded=1;arcSize=10;whiteSpace=wrap;html=1;fillColor={fill};strokeColor={stroke};strokeWidth=1.5;"
                     f"fontColor={pal['text']};fontSize=13;align=center;verticalAlign=middle;spacing=4;{tdir}")
        add(f'<mxCell id="{nid}_{page_id}" value="{value}" style="{style}" vertex="1" parent="1">'
            f'<mxGeometry x="{x}" y="{y}" width="{w}" height="{h}" as="geometry"/></mxCell>')
    for eid, src, dst, pts, dashed, label, lpos in EDGES:
        style = (f"edgeStyle=none;html=1;rounded=1;strokeColor={pal['edge']};strokeWidth=2;endArrow=blockThin;endFill=1;"
                 f"fontColor={pal['muted']};fontSize=11;labelBackgroundColor={pal['bg']};{'dashed=1;' if dashed else ''}{tdir}")
        inner = "".join(f'<mxPoint x="{px}" y="{py}"/>' for px, py in pts[1:-1])
        geo = (f'<mxGeometry relative="1" as="geometry"><mxPoint x="{pts[0][0]}" y="{pts[0][1]}" as="sourcePoint"/>'
               f'<mxPoint x="{pts[-1][0]}" y="{pts[-1][1]}" as="targetPoint"/>'
               + (f'<Array as="points">{inner}</Array>' if inner else "") + "</mxGeometry>")
        add(f'<mxCell id="{eid}_{page_id}" value="{esc(label[lang][0])}" style="{style}" edge="1" parent="1" '
            f'source="{src}_{page_id}" target="{dst}_{page_id}">{geo}</mxCell>')
    name = "العربية" if rtl else "English"
    return (f'<diagram id="{page_id}" name="{name}"><mxGraphModel dx="1400" dy="900" grid="1" gridSize="10" guides="1" tooltips="1" '
            f'connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="{W}" pageHeight="{H}" background="{pal["bg"]}" math="0" shadow="0">'
            f'<root>{"".join(cells)}</root></mxGraphModel></diagram>')


SITE = "https://ryanathlawi.github.io/dropship-site/"

# مراحل التطوير: (التاريخ، الصورة، {ar: [عنوان، وصف…], en: […]})
STAGES = [
    ("2026-08", "img/en-expanded.webp",
     T(["الأصل: dropship v3 من stormy", "إعادة كتابة كاملة بواجهة إنجليزية،", "حظر عبر WFP وقائمة سيرفرات حيّة"],
       ["Origin: dropship v3 by stormy", "full rewrite, English UI,", "WFP blocking and a live server list"])),
    ("2026-09-19", "img/stage-ar-v30.webp",
     T(["النسخة العربية v3.0.6 – 3.0.8", "تعريب كامل من اليمين لليسار، خط ثمانية،", "ترحيب وجولة تعريفية، إصلاحان أُرسلا للأصل"],
       ["Arabic edition v3.0.6 – 3.0.8", "full right-to-left UI, Thmanyah font,", "welcome + guided tour, two fixes sent upstream"])),
    ("2026-09-19", "img/stage-site.webp",
     T(["الموقع", "React 19 + Vite، عربي وإنجليزي،", "إحصائيات حيّة من GitHub، نسخة تجريبية في المتصفح"],
       ["The website", "React 19 + Vite, Arabic & English,", "live GitHub stats, a playable replica in the browser"])),
    ("2026-09-20", "img/ar-presets.webp",
     T(["تصميم الواجهة الجديدة", "لوحة تحكم ✗ → واجهة ألعاب ✗ → لانشر ✓", "أربع لوحات ألوان، اختير التيل على الغرافيت"],
       ["Designing the new UI", "dashboard ✗ → gaming HUD ✗ → launcher ✓", "four palettes, teal on graphite chosen"])),
    ("2026-09-21", "img/ar-main-dark.webp",
     T(["v3.1.0 — اللانشر", "خريطة عالم حيّة، أعلام، أفضل مسار،", "اختصارات حظر بمفاتيح، جولة من 14 خطوة"],
       ["v3.1.0 — the launcher", "live world map, flags, best route,", "blocking presets with hotkeys, 14-step tour"])),
    ("2026-09-21", "img/stage-credits.webp",
     T(["v3.1.1 — الحقوق والتواصل", "المساعدة: ديسكورد النسخة العربية ودعم PayPal،", "معلومات الإصدار في الـ exe من Cargo.toml"],
       ["v3.1.1 — credits & contact", "help view: Arabic Discord and PayPal support,", "exe version info generated from Cargo.toml"])),
    ("2026-09-21", "img/stage-ping.webp",
     T(["v3.1.2 — بنق حيّ", "قياس كل 15 ثانية لكل السيرفرات،", "حتى اللي تتجاهل الـ ping تُقاس من داخل شبكتها"],
       ["v3.1.2 — live ping", "every server re-measured every 15 s,", "silent ones measured inside their own network"])),
    ("2026-09-21", "img/stage-mobile.webp",
     T(["الموقع على الجوال", "اللانشر يتحول لتطبيق جوال: خريطة تُسحب،", "بطاقات، وشريط تبويبات سفلي"],
       ["The site on phones", "the launcher becomes a mobile app: pannable map,", "cards and a bottom tab bar"])),
]


def drawio_stages(lang, page_id):
    pal = PAL["light"]
    rtl = lang == "ar"
    esc = lambda s: html.escape(s, quote=True)
    tdir = "textDirection=rtl;" if rtl else ""
    cells = ['<mxCell id="0"/>', '<mxCell id="1" parent="0"/>']
    title = "مراحل تطوير النسخة العربية" if rtl else "Development stages of the Arabic edition"
    cells.append(f'<mxCell id="st_{page_id}" value="{esc("<b>" + title + "</b>")}" style="text;html=1;align=center;fontSize=20;fontColor={pal["text"]};{tdir}" vertex="1" parent="1">'
                 f'<mxGeometry x="40" y="20" width="1640" height="40" as="geometry"/></mxCell>')
    n = len(STAGES)
    cw, gap = 190, 16
    order = list(range(n))[::-1] if rtl else list(range(n))
    fill, stroke = pal["ar"]
    for col, i in enumerate(order):
        date, img, label = STAGES[i]
        x = 40 + col * (cw + gap)
        lines = label[lang]
        cells.append(f'<mxCell id="img{i}_{page_id}" value="" style="shape=image;imageAspect=1;image={SITE}{img};rounded=1;strokeColor={stroke};" vertex="1" parent="1">'
                     f'<mxGeometry x="{x}" y="90" width="{cw}" height="130" as="geometry"/></mxCell>')
        body = "<br>".join(lines[1:])
        value = esc(f'<font color="{pal["muted"]}" style="font-size:10px">{date}</font><br><b>{lines[0]}</b><br><font style="font-size:11px">{body}</font>')
        cells.append(f'<mxCell id="stg{i}_{page_id}" value="{value}" style="rounded=1;arcSize=10;whiteSpace=wrap;html=1;fillColor={fill};strokeColor={stroke};fontColor={pal["text"]};fontSize=13;align=center;verticalAlign=top;spacing=6;{tdir}" vertex="1" parent="1">'
                     f'<mxGeometry x="{x}" y="230" width="{cw}" height="130" as="geometry"/></mxCell>')
        if col < n - 1:
            x1 = x + cw if not rtl else x
            x2 = x + cw + gap if not rtl else x - gap
            cells.append(f'<mxCell id="sa{i}_{page_id}" style="edgeStyle=none;html=1;strokeColor={pal["edge"]};strokeWidth=2;endArrow=blockThin;endFill=1;" edge="1" parent="1">'
                         f'<mxGeometry relative="1" as="geometry"><mxPoint x="{x1}" y="295" as="sourcePoint"/><mxPoint x="{x2}" y="295" as="targetPoint"/></mxGeometry></mxCell>')
    name = "المراحل" if rtl else "Stages"
    return (f'<diagram id="{page_id}" name="{name}"><mxGraphModel dx="1400" dy="900" grid="1" gridSize="10" page="1" pageWidth="1720" pageHeight="420" background="{pal["bg"]}">'
            f'<root>{"".join(cells)}</root></mxGraphModel></diagram>')


def write_drawio():
    xml = ('<?xml version="1.0" encoding="UTF-8"?>\n'
           f'<mxfile host="dropship-site" modified="2026-09-21T00:00:00.000Z" agent="scripts/diagram.py" version="24.0.0" type="device">'
           + drawio_page("ar", "ar") + drawio_page("en", "en") + drawio_stages("ar", "stages_ar") + drawio_stages("en", "stages_en") + "</mxfile>\n")
    with open(os.path.join(OUT, "dropship-ar.drawio"), "w", encoding="utf-8", newline="\n") as f:
        f.write(xml)


# ------------------------------------------------------------------ SVG
def svg(lang, theme):
    pal = PAL[theme]
    rtl = lang == "ar"
    esc = html.escape
    font = "'IBM Plex Sans Arabic','Thmanyah Sans',system-ui,sans-serif" if rtl else "Inter,system-ui,sans-serif"
    mono = "'DM Mono','JetBrains Mono',Consolas,monospace"
    o = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" '
         f'aria-label="{esc(TITLE[lang][0])}" lang="{lang}" direction="{"rtl" if rtl else "ltr"}">']
    o.append(f'<style>text{{font-family:{font};direction:{"rtl" if rtl else "ltr"};unicode-bidi:plaintext}}'
             f'.m{{font-family:{mono}}}</style>')
    o.append(f'<rect width="{W}" height="{H}" fill="{pal["bg"]}"/>')
    # في RTL نقطة «start» هي اليمين، فالنص المحاذي لحافة الحاوية يبدأ منها في الاتجاهين
    tx = W - 40 if rtl else 40
    anchor = "start"
    o.append(f'<text x="{tx}" y="44" font-size="22" font-weight="700" fill="{pal["text"]}" text-anchor="{anchor}">{esc(TITLE[lang][0])}</text>')
    o.append(f'<text x="{tx}" y="70" font-size="13" fill="{pal["muted"]}" text-anchor="{anchor}">{esc(SUBTITLE[lang][0])}</text>')

    for nid, kind, x, y, w, h, color, label in NODES:
        fill, stroke = pal[color]
        lines = label[lang]
        if kind == "cont":
            o.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="14" fill="{fill}" stroke="{stroke}" stroke-width="2" stroke-dasharray="8 6"/>')
            hx = x + w - 18 if rtl else x + 18
            o.append(f'<text x="{hx}" y="{y + 26}" font-size="15" font-weight="700" fill="{pal["text"]}" text-anchor="{anchor}">{esc(lines[0])}</text>')
        else:
            o.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="10" fill="{fill}" stroke="{stroke}" stroke-width="1.5"/>')
            cx = x + w / 2
            n = len(lines)
            lh = 15
            total = 18 + lh * (n - 1)
            ty = y + h / 2 - total / 2 + 14
            o.append(f'<text x="{cx}" y="{ty:.0f}" font-size="13" font-weight="700" fill="{pal["text"]}" text-anchor="middle">{esc(lines[0])}</text>')
            for i, ln in enumerate(lines[1:]):
                cls = ' class="m"' if ("\\" in ln or ln.endswith(".json") or ln.endswith(".exe") or ln.endswith(".ron")) else ""
                o.append(f'<text{cls} x="{cx}" y="{ty + 18 + i * lh:.0f}" font-size="11" fill="{pal["muted"]}" text-anchor="middle">{esc(ln)}</text>')

    o.append(f'<defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">'
             f'<path d="M0 0L10 5L0 10z" fill="{pal["edge"]}"/></marker></defs>')
    for eid, src, dst, pts, dashed, label, lpos in EDGES:
        d = " ".join(f"{'M' if i == 0 else 'L'}{px} {py}" for i, (px, py) in enumerate(pts))
        dash = ' stroke-dasharray="6 5"' if dashed else ""
        o.append(f'<path d="{d}" fill="none" stroke="{pal["edge"]}" stroke-width="2"{dash} marker-end="url(#arr)"/>')
        text = label[lang][0]
        lx, ly = lpos
        tw = len(text) * (6.4 if rtl else 6.2) + 14
        o.append(f'<rect x="{lx - tw / 2:.0f}" y="{ly - 9}" width="{tw:.0f}" height="18" rx="5" fill="{pal["bg"]}" stroke="{pal["line"]}" stroke-width="0.8"/>')
        o.append(f'<text x="{lx}" y="{ly + 4}" font-size="11" fill="{pal["muted"]}" text-anchor="middle">{esc(text)}</text>')
    o.append("</svg>\n")
    return "".join(o)


def main():
    write_drawio()
    import json
    with open(os.path.join(ROOT, "src", "stages.json"), "w", encoding="utf-8", newline="\n") as f:
        json.dump([{"date": d, "img": i, "ar": l["ar"], "en": l["en"]} for d, i, l in STAGES], f, ensure_ascii=False, indent=2)
    for lang in ("ar", "en"):
        for theme in ("light", "dark"):
            with open(os.path.join(OUT, f"architecture-{lang}-{theme}.svg"), "w", encoding="utf-8", newline="\n") as f:
                f.write(svg(lang, theme))
    print("wrote", OUT)


if __name__ == "__main__":
    sys.exit(main())
