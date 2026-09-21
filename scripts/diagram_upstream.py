# -*- coding: utf-8 -*-
"""Architecture map of dropship for the upstream repository (stowmyy/dropship) — English only.

Describes the app as it is with PR #38 (localization, live ping, presets, launcher),
in stormy's own palette (graphite + amber, DM Mono). Nothing about the Arabic edition.

    python scripts/diagram_upstream.py <screenshot dir> <out dir>

Writes  <out>/architecture.svg  (dark, self-contained)
        <out>/architecture-light.svg
"""
import base64
import html
import os
import re
import sys

from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from diagram import icon_svg_inner, ROOT  # noqa: E402  (lucide icons + world mask live next to the site)

W, H = 1920, 1460
VERSION = "v3.0.6"

PAL = {
    "dark": {
        "bg": "#0b0d10", "grid": "#13171c", "text": "#eef0f3", "muted": "#a3adb8", "faint": "#606a75",
        "card": "#12161b", "card_line": "#252c35", "edge": "#c9d1d9", "label_bg": "#0b0d10",
        "amber": "#f5a524", "amber_soft": "#3a2a10", "gold": "#fbbf24", "red": "#ef4444", "green": "#34d399",
        "zone": {"pc": ("#0e1216", "#2b3540", "#8fa3b8"), "net": ("#14100a", "#4a3617", "#f5a524"),
                 "gh": ("#100f16", "#3a3650", "#a99bd6"), "life": ("#0d1412", "#234139", "#34d399")},
        "shot_line": "#2b3540",
    },
    "light": {
        "bg": "#f6f7f9", "grid": "#e8ebef", "text": "#0f1319", "muted": "#4d5966", "faint": "#8b95a1",
        "card": "#ffffff", "card_line": "#d8dee6", "edge": "#2f3a46", "label_bg": "#f6f7f9",
        "amber": "#c77700", "amber_soft": "#fff1d6", "gold": "#b45309", "red": "#dc2626", "green": "#047857",
        "zone": {"pc": ("#eef1f5", "#b8c4d1", "#3b4d61"), "net": ("#fff6e8", "#efc98f", "#b16400"),
                 "gh": ("#f1eefb", "#c7bde8", "#5b48a8"), "life": ("#e9f8f2", "#95d8bf", "#0f766e")},
        "shot_line": "#c9d3dd",
    },
}

REGIONS = [  # (code, lat, lon) — the eleven regions in ips.json
    ("ams1", 52.37, 4.9), ("gen1", 60.57, 27.2), ("gmec2", 26.43, 50.1), ("gsg1", 1.35, 103.82), ("gtk1", 35.68, 139.69),
    ("tpe1", 25.03, 121.57), ("syd2", -33.87, 151.21), ("gue4", 38.95, -77.45), ("ord1", 41.88, -87.63),
    ("las1", 36.17, -115.14), ("gbr1", -23.55, -46.63),
]
YOU = (52.1, 5.3)  # a European player, as in the English screenshot


def hexrgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def b64(path):
    return base64.b64encode(open(path, "rb").read()).decode()


def shot(path, w, h, out):
    """crop to w:h, downscale to 2x, webp → base64"""
    im = Image.open(path).convert("RGB")
    ar_src, ar_dst = im.width / im.height, w / h
    if ar_src > ar_dst:
        nw = int(im.height * ar_dst)
        im = im.crop(((im.width - nw) // 2, 0, (im.width - nw) // 2 + nw, im.height))
    elif ar_src < ar_dst:
        nh = int(im.width / ar_dst)
        im = im.crop((0, 0, im.width, nh))
    im = im.resize((w * 2, h * 2), Image.LANCZOS)
    im.save(out, quality=80, method=6)
    return b64(out)


def regions_map(theme, out, w=560, h=236):
    """dotted world with the eleven regions and routes from a European player"""
    src = open(os.path.join(ROOT, "src", "world.ts"), encoding="utf-8").read()
    rows = re.findall(r'"([01]{180})"', src)
    lat_top, lat_bot = 84.0, -58.0
    pal = PAL[theme]
    S = 2
    bg = hexrgb(pal["zone"]["net"][0])
    im = Image.new("RGB", (w * S, h * S), bg)
    d = ImageDraw.Draw(im)
    dot = (78, 70, 52) if theme == "dark" else (222, 200, 160)
    cw, ch = w * S / 180, h * S / len(rows)
    for j, row in enumerate(rows):
        for i, c in enumerate(row):
            if c == "1":
                cx, cy = i * cw + cw / 2, j * ch + ch / 2
                d.ellipse((cx - 1.7, cy - 1.7, cx + 1.7, cy + 1.7), fill=dot)

    def proj(lat, lon):
        return ((lon + 180) / 360 * w * S, (lat_top - lat) / (lat_top - lat_bot) * h * S)

    font = ImageFont.truetype("C:/Windows/Fonts/consola.ttf", 11 * S)
    ac = hexrgb(pal["amber"])
    text = hexrgb(pal["text"])
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
        d.ellipse((x - 9, y - 9, x + 9, y + 9), outline=ac, width=2)
        d.ellipse((x - 4, y - 4, x + 4, y + 4), fill=ac)
        tw = d.textlength(code, font=font)
        tx = x + 12 if x < w * S - 90 else x - 12 - tw
        d.rectangle((tx - 4, y - 9, tx + tw + 4, y + 9), fill=bg)
        d.text((tx, y - 8), code, font=font, fill=text)
    d.ellipse((yx - 7, yy - 7, yx + 7, yy + 7), fill=text)
    d.ellipse((yx - 3, yy - 3, yx + 3, yy + 3), fill=bg)
    im.save(out, optimize=True)
    return b64(out)


# ------------------------------------------------------------------ content
CALLOUTS = [  # (x, y) inside the 1001×698 English launcher screenshot
    ((400, 300), "The map", "dotted world, a route from you to every allowed server; click a dot to block it, right-click to solo it"),
    ((820, 380), "Servers panel", "flag, name, live ping bar, on/off switch — sortable by ping; the same list as the classic view"),
    ((752, 157), "Presets", "EU = F1 out of the box; + makes your own: a name, an optional hotkey, then the servers"),
    ((220, 585), "Best route", "the lowest-ping allowed region gets a gold lock; permanent / while-open toggle"),
    ((29, 200), "Side rail", "map, games, news, log, help, options — the other tabs of the classic view"),
    ((350, 55), "Status chips", "filter on or off, how many blocked, is the game open"),
    ((800, 677), "Keys", "Esc · L · R · F1 — and the latest log line on the left"),
]

MODULES = [  # (icon, title, detail)
    ("shield-check", "Firewall", "WFP filters per region · permanent or session"),
    ("activity", "Ping", "IcmpSendEcho · every 15 s · in-block fallback"),
    ("gamepad-2", "Game", "sysinfo · every 0.9 s · is Overwatch.exe running?"),
    ("refresh-cw", "Updater", "GitHub releases · 2.5 h · swaps the exe"),
    ("list", "Servers", "ips.json · every 15 min · tokens survive renumbering"),
    ("settings-2", "Config", "app.ron · blocked, presets, language, ui"),
    ("languages", "Language", "lang/en.json · ar.json · missing keys fall back"),
    ("keyboard", "Presets", "name → key → servers · applied by click or hotkey"),
    ("terminal", "Log", "tail in the status bar · full view in its tab"),
    ("zap", "Commands", "UI → commands → tasks → events → UI"),
]

UNDER = [
    ("hard-drive", "Persisted state", "app.ron, saved every 30 s"),
    ("clock", "Scheduler", "tokio timers drive every loop"),
    ("lock", "Admin once", "the manifest asks; WFP needs it"),
    ("type", "Bidi text", "vendor/epaint + unicode-bidi, until egui ships it"),
]

LIFE = [  # the life of a session, left to right
    ("launch", "dropship.exe", "double-click; the manifest asks for admin"),
    ("elevate", "UAC", "WFP needs it — no elevation, no filters"),
    ("load", "app.ron", "blocked set, presets, language, interface"),
    ("apply", "WFP filters", "permanent: they stay after exit · session: gone on exit"),
    ("fetch", "ips.json", "regions and their IP blocks, then every 15 min"),
    ("watch", "game · 0.9 s", "is Overwatch.exe running? warn before changes"),
    ("measure", "ping · 15 s", "one reply of three is enough; silent IPs get a fallback"),
    ("check", "update · 2.5 h", "newer release? download, swap, restart"),
    ("exit", "close", "session filters are removed; permanent ones stay"),
]


def wrap(s, n):
    """wrap on words to ~n characters per line"""
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


# ------------------------------------------------------------------ rendering
def render(theme, A):
    pal = PAL[theme]
    esc = html.escape
    sans = "Inter,'Segoe UI',system-ui,sans-serif"
    mono = "'DM Mono','JetBrains Mono',Consolas,monospace"
    o = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-label="dropship — architecture map">',
         f'<style>text{{font-family:{sans}}}.m{{font-family:{mono}}}</style>',
         f'<defs><pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="{pal["grid"]}" stroke-width="1"/></pattern>'
         f'<marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="{pal["edge"]}"/></marker>'
         f'<marker id="arra" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="{pal["amber"]}"/></marker>'
         f'<filter id="sh" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#000" flood-opacity="{0.5 if theme == "dark" else 0.14}"/></filter>'
         f'<linearGradient id="hd" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="{pal["amber"]}" stop-opacity="0.35"/><stop offset="1" stop-color="{pal["amber"]}" stop-opacity="0"/></linearGradient></defs>',
         f'<rect width="{W}" height="{H}" fill="{pal["bg"]}"/><rect width="{W}" height="{H}" fill="url(#g)"/>']

    def txt(x, y, size, s, color, bold=False, m=False, anchor="start", ls=None, op=None):
        extra = f' letter-spacing="{ls}"' if ls else ""
        extra += f' opacity="{op}"' if op else ""
        return (f'<text{" class=" + chr(34) + "m" + chr(34) if m else ""} x="{x:.0f}" y="{y:.0f}" font-size="{size}" '
                f'font-weight="{700 if bold else 400}" fill="{color}" text-anchor="{anchor}"{extra}>{esc(s)}</text>')

    def rect(x, y, w, h, fill, stroke, rx=14, sw=1.5, dash="", extra=""):
        return f'<rect x="{x:.0f}" y="{y:.0f}" width="{w:.0f}" height="{h:.0f}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"{dash}{extra}/>'

    # ── header
    o.append(f'<rect x="40" y="0" width="1100" height="150" fill="url(#hd)" opacity="0.5"/>')
    o.append(f'<circle cx="76" cy="66" r="30" fill="{pal["amber"]}"/>')
    o.append(icon_svg_inner("zap", pal["bg"] if theme == "dark" else "#fff", 60, 50, 32))
    o.append(txt(126, 58, 30, "dropship", pal["text"], bold=True, m=True))
    o.append(txt(292, 58, 30, "— architecture map", pal["muted"], m=True))
    o.append(txt(126, 90, 14, "How the app works, from the game to the server: the firewall, the loops, the interfaces, the update path — "
                 "as of the localization / live-ping / presets / launcher pull request.", pal["muted"]))
    o.append(txt(126, 112, 12.5, "arrows: data flow  ·  dashed: repeats on a timer  ·  gold numbers on the screenshot are explained beside it", pal["faint"], m=True))
    chips = [f"{VERSION} + PR", "GPL-3.0", "Rust · eframe/egui 0.36 · tokio", "Windows 10 / 11", "one exe, no installer"]
    off = 0
    for c in chips[::-1]:
        cw = len(c) * 7.4 + 26
        xx = W - 60 - off - cw
        o.append(rect(xx, 44, cw, 30, pal["card"], pal["card_line"], rx=15))
        o.append(txt(xx + cw / 2, 63, 12, c, pal["text"], m=True, anchor="middle"))
        off += cw + 10
    o.append(f'<line x1="40" y1="134" x2="{W - 40}" y2="134" stroke="{pal["card_line"]}"/>')

    # ── zones
    def zone(key, x, y, w, h, title):
        fill, line, acc = pal["zone"][key]
        o.append(rect(x, y, w, h, fill, line, rx=20, sw=2, dash=' stroke-dasharray="10 7"'))
        tw = len(title) * 8.2 + 34
        o.append(f'<rect x="{x + 18}" y="{y - 15}" width="{tw:.0f}" height="30" rx="10" fill="{acc}"/>')
        o.append(txt(x + 18 + tw / 2, y + 5, 13, title, pal["bg"] if theme == "dark" else "#fff", bold=True, m=True, anchor="middle", ls="0.06em"))

    zone("pc", 40, 190, 1180, 860, "01 · PLAYER'S PC")
    zone("net", 1262, 190, 618, 470, "02 · BLIZZARD & THE INTERNET")
    zone("gh", 1262, 700, 618, 350, "03 · GITHUB")
    zone("life", 40, 1090, 1840, 270, "04 · THE LIFE OF A SESSION")

    # ── cards
    def card(x, y, w, h, icon, title, detail, acc, big=False, chars=None):
        o.append(rect(x, y, w, h, pal["card"], pal["card_line"], rx=12, extra=' filter="url(#sh)"'))
        o.append(f'<circle cx="{x + 26}" cy="{y + 26}" r="16" fill="{acc}" opacity="0.16"/>')
        o.append(icon_svg_inner(icon, acc, x + 16, y + 16, 20))
        o.append(txt(x + 52, y + 24, 14.5 if big else 13.5, title, pal["text"], bold=True))
        lines = wrap(detail, chars or int((w - 64) / 6.4))
        for i, ln in enumerate(lines):
            o.append(txt(x + 52, y + 43 + i * 15, 11.5, ln, pal["muted"]))

    acc_pc = pal["zone"]["pc"][2]
    acc_net = pal["zone"]["net"][2]
    acc_gh = pal["zone"]["gh"][2]
    acc_life = pal["zone"]["life"][2]

    # 01 — top row: game → WFP → (internet), and what dropship is
    card(70, 228, 300, 82, "gamepad-2", "Overwatch 2", "Overwatch.exe via Battle.net or Steam — dropship never touches the game itself", acc_pc)
    card(450, 228, 500, 82, "shield-check", "Windows Filtering Platform (WFP)", "dropship's filters drop Overwatch.exe traffic to the IP blocks of every blocked region — nothing else is touched", acc_pc, chars=70)
    o.append(rect(990, 228, 200, 82, pal["amber_soft"], pal["amber"], rx=12))
    o.append(icon_svg_inner("info", pal["amber"], 1004, 242, 18))
    o.append(txt(1028, 254, 12.5, "What dropship is", pal["text"], bold=True))
    for j, ln in enumerate(wrap("a firewall rule set for the game's regions — no VPN, no proxy, no injection", 30)):
        o.append(txt(1004, 272 + j * 12.5, 10.5, ln, pal["muted"]))

    # 01 — the app panel
    o.append(rect(70, 350, 1120, 670, pal["card"], pal["card_line"], rx=18, extra=' opacity="0.55"'))
    o.append(rect(70, 350, 1120, 44, pal["card"], pal["card_line"], rx=18))
    o.append(f'<rect x="70" y="372" width="1120" height="22" fill="{pal["card"]}"/>')
    o.append(f'<line x1="70" y1="394" x2="1190" y2="394" stroke="{pal["card_line"]}"/>')
    o.append(icon_svg_inner("zap", pal["amber"], 90, 361, 22))
    o.append(txt(122, 378, 14, "dropship", pal["text"], bold=True, m=True))
    o.append(txt(212, 378, 12.5, "Rust · eframe/egui · tokio  —  one process, one window, no service", pal["muted"], m=True))
    o.append(txt(1172, 378, 11.5, "classic list or map dot — one click blocks, the same engine underneath", pal["faint"], m=True, anchor="end"))

    # screenshot + callouts
    sx, sy, sw_, sh_ = 92, 414, 520, 363
    o.append(f'<rect x="{sx - 1}" y="{sy - 1}" width="{sw_ + 2}" height="{sh_ + 2}" rx="8" fill="{pal["shot_line"]}"/>')
    o.append(f'<image x="{sx}" y="{sy}" width="{sw_}" height="{sh_}" href="data:image/webp;base64,{A["launcher"]}" preserveAspectRatio="none"/>')
    k = sw_ / 1001
    for i, ((cx, cy), _, _) in enumerate(CALLOUTS, 1):
        px, py = sx + cx * k, sy + cy * k
        o.append(f'<circle cx="{px:.0f}" cy="{py:.0f}" r="13" fill="{pal["gold"]}" stroke="{pal["bg"]}" stroke-width="2"/>')
        o.append(txt(px, py + 4.5, 12, str(i), pal["bg"] if theme == "dark" else "#fff", bold=True, m=True, anchor="middle"))
    o.append(txt(sx, sy + sh_ + 19, 10.5, "the launcher — options → interface → launcher; off by default, a real screenshot", pal["faint"], m=True))
    o.append(txt(sx, sy + sh_ + 33, 10.5, "the classic view keeps working exactly as today, plus the presets row", pal["faint"], m=True))

    lx, ly = 640, 418
    o.append(txt(lx, ly, 11.5, "WHAT THE NUMBERS POINT AT", pal["faint"], m=True, ls="0.12em"))
    for i, (_, title, detail) in enumerate(CALLOUTS, 1):
        yy = ly + 20 + (i - 1) * 46
        o.append(f'<circle cx="{lx + 12}" cy="{yy + 6}" r="11" fill="{pal["gold"]}"/>')
        o.append(txt(lx + 12, yy + 10, 11, str(i), pal["bg"] if theme == "dark" else "#fff", bold=True, m=True, anchor="middle"))
        o.append(txt(lx + 32, yy + 4, 13, title, pal["text"], bold=True))
        for j, ln in enumerate(wrap(detail, 76)):
            o.append(txt(lx + 32, yy + 20 + j * 13.5, 11, ln, pal["muted"]))

    # the interfaces — three ways to see the same state
    ix, iy = 92, 838
    o.append(txt(ix, iy, 11.5, "THE SAME STATE, THREE WAYS", pal["faint"], m=True, ls="0.12em"))

    def thumb_at(key, x, y, w, h, cap):
        o.append(f'<rect x="{x - 1}" y="{y - 1}" width="{w + 2}" height="{h + 2}" rx="6" fill="{pal["shot_line"]}"/>')
        o.append(f'<image x="{x}" y="{y}" width="{w}" height="{h}" href="data:image/webp;base64,{A[key]}" preserveAspectRatio="none"/>')
        o.append(txt(x, y + h + 15, 10.5, cap, pal["muted"], m=True))

    thumb_at("classic_en", 92, 850, 250, 57, "classic · English — pixel-identical to today")
    thumb_at("classic_ar", 92, 938, 250, 57, "classic · Arabic — mirrored, right-to-left")
    thumb_at("launcher_ar", 360, 850, 120, 84, "launcher · Arabic")
    thumb_at("launcher_light", 492, 850, 120, 84, "launcher · light theme")
    o.append(txt(360, 974, 10.5, "language follows the PC, or options →", pal["faint"], m=True))
    o.append(txt(360, 989, 10.5, "language; the theme is yours as before", pal["faint"], m=True))

    # engine modules 5 × 2
    mx, my = 640, 772
    o.append(txt(mx, my, 11.5, "THE ENGINE — each box is a task or a module the UI talks to", pal["faint"], m=True, ls="0.12em"))
    cw, ch, gap = 100, 66, 8
    for i, (icon, title, detail) in enumerate(MODULES):
        cx = mx + (i % 5) * (cw + gap)
        cy = my + 12 + (i // 5) * (ch + gap)
        o.append(rect(cx, cy, cw, ch, pal["card"], pal["card_line"], rx=10))
        o.append(icon_svg_inner(icon, pal["amber"], cx + 9, cy + 9, 16))
        o.append(txt(cx + 30, cy + 21, 11, title, pal["text"], bold=True))
        for j, ln in enumerate(wrap(detail, 19)[:3]):
            o.append(txt(cx + 9, cy + 37 + j * 11, 9.5, ln, pal["muted"]))

    # under the hood strip
    ux, uy = 640, 950
    o.append(txt(ux, uy, 11.5, "UNDER THE HOOD", pal["faint"], m=True, ls="0.12em"))
    for i, (icon, title, detail) in enumerate(UNDER):
        cx = ux + i * 134
        o.append(icon_svg_inner(icon, acc_pc, cx, uy + 9, 15))
        o.append(txt(cx + 21, uy + 21, 11, title, pal["text"], bold=True))
        for j, ln in enumerate(wrap(detail, 25)[:2]):
            o.append(txt(cx, uy + 38 + j * 12, 9.6, ln, pal["muted"]))

    # 02 — internet
    rx_, ry = 1292, 232
    o.append(f'<rect x="{rx_ - 1}" y="{ry - 1}" width="562" height="238" rx="8" fill="{pal["shot_line"]}"/>')
    o.append(f'<image x="{rx_}" y="{ry}" width="560" height="236" href="data:image/png;base64,{A["regions"]}"/>')
    o.append(txt(rx_, ry + 254, 11, "game server regions — eleven, IP blocks from ips.json; routes drawn from a player in the Netherlands", pal["faint"], m=True))
    card(1292, 512, 272, 118, "log-in", "Login & matchmaker", "picks the nearest region the client can reach; a blocked region never answers, so it is never picked", acc_net, chars=36)
    card(1580, 512, 272, 118, "file-json", "ips.json", "region code, IP blocks, ping address — maintained upstream, fetched by every copy every 15 min", acc_net, chars=36)

    # 03 — github
    card(1292, 740, 272, 84, "git-branch", "stowmyy/dropship", "source, issues, the server list, and the releases the updater reads", acc_gh, chars=36)
    card(1580, 740, 272, 84, "workflow", "Actions", "cargo build --release → dropship.exe (+ the animated build)", acc_gh, chars=36)
    card(1580, 842, 272, 84, "package", "Releases", "one exe per tag; every copy compares tags every 2.5 h", acc_gh, chars=36)
    card(1292, 842, 272, 84, "users", "Players", "auto-update: download, rename the old exe to .deleteme, restart", acc_gh, chars=36)
    o.append(rect(1292, 944, 560, 84, pal["card"], pal["card_line"], rx=12))
    o.append(icon_svg_inner("languages", acc_gh, 1308, 960, 20))
    o.append(txt(1340, 968, 13.5, "Adding a language", pal["text"], bold=True))
    for j, ln in enumerate(wrap("copy lang/en.json to lang/xx.json, translate the values, add one enum entry — missing keys fall back to English, "
                                "and cargo test lang checks that the files stay in sync.", 78)):
        o.append(txt(1340, 986 + j * 14, 11.5, ln, pal["muted"]))

    # ── edges
    def edge(pts, label=None, lpos=None, dashed=False, amber=False):
        d = " ".join(f"{'M' if i == 0 else 'L'}{x:.0f} {y:.0f}" for i, (x, y) in enumerate(pts))
        col = pal["amber"] if amber else pal["edge"]
        dash = ' stroke-dasharray="7 6"' if dashed else ""
        o.append(f'<path d="{d}" fill="none" stroke="{col}" stroke-width="1.6"{dash} marker-end="url(#{"arra" if amber else "arr"})" opacity="0.9"/>')
        if label:
            tw = len(label) * 6.6 + 16
            o.append(f'<rect x="{lpos[0] - tw / 2:.0f}" y="{lpos[1] - 10}" width="{tw:.0f}" height="20" rx="6" fill="{pal["label_bg"]}" stroke="{pal["card_line"]}"/>')
            o.append(txt(lpos[0], lpos[1] + 4, 10.5, label, pal["text"], m=True, anchor="middle"))

    edge([(370, 269), (450, 269)], "game traffic (UDP)", (410, 250))
    edge([(950, 269), (970, 269), (970, 212), (1226, 212), (1226, 269), (1262, 269)], "allowed regions only", (1100, 212))
    edge([(700, 350), (700, 310)], "adds / removes filters", (810, 330), amber=True)
    edge([(220, 350), (220, 310)], "running? every 0.9 s", (330, 330), dashed=True)
    edge([(1190, 560), (1226, 560), (1226, 400), (1292, 400)], "ping · every 15 s", (1226, 480), dashed=True, amber=True)
    edge([(1716, 630), (1716, 680), (1226, 680), (1226, 760), (1190, 760)], "the list · every 15 min", (1470, 680), dashed=True)
    edge([(1292, 884), (1226, 884), (1226, 830), (1190, 830)], "update? every 2.5 h", (1226, 857), dashed=True)
    edge([(1564, 782), (1580, 782)])
    edge([(1716, 824), (1716, 842)])
    edge([(1580, 884), (1564, 884)])

    # 04 — life of a session
    lx0, lx1, ly0 = 150, 1770, 1210
    o.append(f'<line x1="{lx0}" y1="{ly0}" x2="{lx1}" y2="{ly0}" stroke="{acc_life}" stroke-width="2" opacity="0.7"/>')
    n = len(LIFE)
    for i, (step, title, detail) in enumerate(LIFE):
        x = lx0 + i * (lx1 - lx0) / (n - 1)
        up = i % 2 == 0
        o.append(f'<circle cx="{x:.0f}" cy="{ly0}" r="9" fill="{pal["bg"]}" stroke="{acc_life}" stroke-width="2.5"/>')
        o.append(txt(x, ly0 + 4, 9, str(i + 1), acc_life, bold=True, m=True, anchor="middle"))
        ty_ = ly0 - 60 if up else ly0 + 36
        o.append(f'<line x1="{x:.0f}" y1="{ly0 - 12 if up else ly0 + 12}" x2="{x:.0f}" y2="{ly0 - 24 if up else ly0 + 24}" stroke="{acc_life}" opacity="0.6"/>')
        o.append(txt(x, ty_, 10.5, step.upper(), acc_life, m=True, anchor="middle", ls="0.14em"))
        o.append(txt(x, ty_ + 18, 13.5, title, pal["text"], bold=True, anchor="middle"))
        for j, ln in enumerate(wrap(detail, 30)[:3]):
            o.append(txt(x, ty_ + 36 + j * 13, 10.5, ln, pal["muted"], anchor="middle"))
    o.append(txt(1860, 1335, 10.5, "permanent mode: the filters from step 4 stay across launches · session mode: they go at step 9", pal["faint"], m=True, anchor="end"))

    # ── footer
    o.append(f'<line x1="40" y1="1392" x2="{W - 40}" y2="1392" stroke="{pal["card_line"]}"/>')
    o.append(txt(40, 1420, 11.5, "dropship by stormy · GPL-3.0 · this map accompanies the localization / live-ping / presets / launcher pull request · drawn by Ryan Athlawi, 2026", pal["faint"], m=True))
    o.append(txt(W - 40, 1420, 11.5, "generated from the code — scripts/diagram_upstream.py", pal["faint"], m=True, anchor="end"))
    o.append("</svg>")
    return "\n".join(o)


def main():
    src, out = sys.argv[1], sys.argv[2]
    os.makedirs(out, exist_ok=True)
    tmp = os.path.join(out, "_tmp")
    os.makedirs(tmp, exist_ok=True)
    A = {
        "launcher": shot(os.path.join(src, "pr_launcher_en.png"), 520, 363, os.path.join(tmp, "launcher.webp")),
        "launcher_ar": shot(os.path.join(src, "pr_launcher_ar.png"), 150, 105, os.path.join(tmp, "launcher_ar.webp")),
        "launcher_light": shot(os.path.join(src, "pr_launcher_light.png"), 150, 105, os.path.join(tmp, "launcher_light.webp")),
        "classic_en": shot(os.path.join(src, "pr_en.png"), 250, 57, os.path.join(tmp, "classic_en.webp")),
        "classic_ar": shot(os.path.join(src, "pr_ar.png"), 250, 57, os.path.join(tmp, "classic_ar.webp")),
    }
    for theme, name in (("dark", "architecture.svg"), ("light", "architecture-light.svg")):
        a = dict(A)
        a["regions"] = regions_map(theme, os.path.join(tmp, f"regions-{theme}.png"))
        with open(os.path.join(out, name), "w", encoding="utf-8", newline="\n") as f:
            f.write(render(theme, a))
        print("wrote", os.path.join(out, name))


if __name__ == "__main__":
    main()
