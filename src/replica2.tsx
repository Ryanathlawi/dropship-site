import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowDownUp, Ban, ChevronsLeft, ChevronsRight, Globe, Heart, Map as MapIcon, Moon, Settings2, Sun, Terminal, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { asset } from "./components";
import { Typewriter } from "./fx";
import type { Lang } from "./i18n";
import { SERVERS, STR } from "./replica";
import { LAT_BOT, LAT_TOP, WORLD, WORLD_H, WORLD_W } from "./world";
import "./replica2.css";

/* the arabic edition's launcher interface (shipped in v3.1.0): a living world map fills the window,
   connections draw from you to every allowed server, the best one gets a lock, and glass panels float
   on top. same data and behaviour as the app. on phones the map becomes a strip you pan by finger */

type View = "map" | "log" | "help" | "settings";
type RepTheme = "dark" | "light";
type Pal = "teal" | "violet" | "ember" | "green";
const PALS: Pal[] = ["teal", "violet", "ember", "green"];
// dot colour of the world map per palette (rgb), dark and light
const DOTS: Record<Pal, { dark: string; light: string }> = {
  teal: { dark: "94, 234, 212", light: "15, 118, 110" },
  violet: { dark: "167, 139, 250", light: "109, 40, 217" },
  ember: { dark: "252, 157, 31", light: "201, 101, 10" },
  green: { dark: "67, 209, 127", light: "0, 108, 53" },
};

const GEO: Record<string, [number, number]> = {
  ams1: [52.37, 4.9],
  gru2: [-23.55, -46.63],
  hel2: [60.17, 24.94],
  ruh1: [24.71, 46.68],
  sin2: [1.35, 103.82],
  nrt2: [35.68, 139.69],
  ord1: [41.88, -87.63],
  lax1: [34.05, -118.24],
  gue4: [32.78, -96.8],
  syd3: [-33.87, 151.21],
  tpe1: [25.03, 121.57],
};
const YOU: [number, number] = [21.49, 39.19]; // jeddah

const VB_W = WORLD_W * 10;
const VB_H = WORLD_H * 10;
const project = ([lat, lon]: [number, number]) => ({
  x: ((lon + 180) / 360) * VB_W,
  y: ((LAT_TOP - lat) / (LAT_TOP - LAT_BOT)) * VB_H,
});

const L = {
  en: {
    edition: "arabic edition",
    filter: "filter",
    on: "active",
    off: "standby",
    game: "game",
    running: "detected",
    closed: "not running",
    servers: "servers",
    sort: "by ping",
    unblockAll: "unblock all",
    you: "you",
    best: "best route",
    via: "via",
    mode: { always: "persistent", open: "session" },
    views: { map: "map", log: "log", help: "help", settings: "settings" } as Record<View, string>,
    lang: "language",
    theme: "theme",
    mini: "mini",
    palette: "colors",
    pals: { teal: "teal", violet: "violet", ember: "ember", green: "green" } as Record<Pal, string>,
    foot: "original app by stormy · arabic edition by Ryan Athlawi",
    keys: { close: "close", toggle: "toggle", invert: "invert others" },
    blockedN: (n: number) => `${n} blocked`,
  },
  ar: {
    edition: "النسخة العربية",
    filter: "الفلتر",
    on: "شغّال",
    off: "متوقف",
    game: "اللعبة",
    running: "مكتشفة",
    closed: "مغلقة",
    servers: "السيرفرات",
    sort: "حسب البنق",
    unblockAll: "ارفع كل الحظر",
    you: "أنت",
    best: "أفضل مسار",
    via: "عبر",
    mode: { always: "دائم", open: "أثناء التشغيل" },
    views: { map: "الخريطة", log: "السجل", help: "المساعدة", settings: "الإعدادات" } as Record<View, string>,
    lang: "اللغة",
    theme: "المظهر",
    mini: "مصغّر",
    palette: "الألوان",
    pals: { teal: "تيل", violet: "بنفسجي", ember: "برتقالي", green: "أخضر" } as Record<Pal, string>,
    foot: "البرنامج الأصلي من stormy · النسخة العربية من Ryan Athlawi",
    keys: { close: "إغلاق", toggle: "تبديل", invert: "عكس الباقي" },
    blockedN: (n: number) => (n === 0 ? "بدون حظر" : n === 1 ? "سيرفر محظور" : n === 2 ? "سيرفران محظوران" : `${n} محظورة`),
  },
};

const VIEW_ICONS: Record<View, typeof Heart> = { map: MapIcon, log: Terminal, help: Heart, settings: Settings2 };
const grade = (ms: number) => (ms < 50 ? "good" : ms < 100 ? "fair" : "poor");

/** the dotted world, drawn once on a canvas (thousands of dots, zero dom) */
function DotWorld({ light, rgb }: { light: boolean; rgb: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const dpr = Math.min(1.5, devicePixelRatio || 1); // plenty for dots, keeps the bitmap small
    const w = VB_W;
    const h = VB_H;
    cv.width = w * dpr;
    cv.height = h * dpr;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
    const you = project(YOU);
    for (let j = 0; j < WORLD_H; j++) {
      const row = WORLD[j];
      for (let i = 0; i < WORLD_W; i++) {
        if (row[i] !== "1") continue;
        const x = (i + 0.5) * 10;
        const y = (j + 0.5) * 10;
        const d = Math.hypot(x - you.x, y - you.y);
        const near = Math.max(0, 1 - d / 700);
        const a = (light ? 0.28 : 0.32) + near * 0.5;
        ctx.fillStyle = `rgba(${rgb}, ${a})`;
        ctx.beginPath();
        ctx.arc(x, y, 2.6 + near * 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [light, rgb]);
  return <canvas ref={ref} className="lch-world" style={{ aspectRatio: `${VB_W} / ${VB_H}` }} aria-hidden="true" />;
}

export function AppReplica2({ siteLang, siteTheme }: { siteLang: Lang; siteTheme: RepTheme }) {
  const reduced = useReducedMotion();
  const [lang, setLang] = useState<Lang>(siteLang);
  const [themePref, setThemePref] = useState<"pc" | RepTheme>("pc");
  const [mini, setMini] = useState(false);
  const [view, setView] = useState<View>("map");
  const [blocked, setBlocked] = useState<Set<string>>(() => new Set(["ord1", "gue4"]));
  const [sorted, setSorted] = useState(false);
  const [mode, setMode] = useState<"always" | "open">("always");
  const [gameOpen, setGameOpen] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const [pal, setPal] = useState<Pal>("teal");

  useEffect(() => setLang(siteLang), [siteLang]);
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setGameOpen((g) => !g), 9000);
    return () => clearInterval(id);
  }, [reduced]);
  // phones: the map is a horizontal strip; start it centred on the middle east / europe
  const mapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = mapRef.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;
    el.scrollLeft = el.scrollWidth * 0.6 - el.clientWidth / 2;
  }, [mini]);

  const theme: RepTheme = themePref === "pc" ? siteTheme : themePref;
  const s = STR[lang];
  const t = L[lang];
  const ar = lang === "ar";

  const toggle = (code: string) =>
    setBlocked((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  const invert = (code: string) =>
    setBlocked((prev) => {
      const next = new Set<string>();
      for (const sv of SERVERS) if (sv.code !== code && !prev.has(sv.code)) next.add(sv.code);
      if (prev.has(code)) next.add(code);
      return next;
    });

  const list = sorted ? [...SERVERS].sort((a, b) => a.ms - b.ms) : SERVERS;
  const best = SERVERS.filter((sv) => !blocked.has(sv.code)).sort((a, b) => a.ms - b.ms)[0];
  const maxMs = Math.max(...SERVERS.map((sv) => sv.ms));
  const you = project(YOU);

  const arc = (code: string) => {
    const p = project(GEO[code]);
    const mx = (you.x + p.x) / 2;
    const my = (you.y + p.y) / 2 - Math.hypot(p.x - you.x, p.y - you.y) * 0.22;
    return `M ${you.x} ${you.y} Q ${mx} ${my} ${p.x} ${p.y}`;
  };

  return (
    <div className={`lch lch-${theme} ${mini ? "mini" : ""}`} data-pal={pal} dir={ar ? "rtl" : "ltr"} lang={lang}>
      {/* backdrop: mesh + dotted world + connections */}
      <div className="lch-mesh" aria-hidden="true" />
      <div className="lch-map" aria-hidden={mini} ref={mapRef}>
        <DotWorld light={theme === "light"} rgb={DOTS[pal][theme]} />
        <svg className="lch-net" viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="xMidYMid meet">
          {SERVERS.filter((sv) => !blocked.has(sv.code)).map((sv) => (
            <path key={sv.code} d={arc(sv.code)} className={`lch-arc ${best?.code === sv.code ? "best" : ""} ${hover === sv.code ? "hot" : ""}`} />
          ))}
          <g className="lch-you" transform={`translate(${you.x} ${you.y})`}>
            <circle r="26" className="lch-you-ring" />
            <circle r="14" className="lch-halo" />
            <circle r="7" className="lch-you-dot" />
            <text y="44" textAnchor="middle" className="lch-you-label">
              {t.you}
            </text>
          </g>
          {SERVERS.map((sv) => {
            const p = project(GEO[sv.code]);
            const off = blocked.has(sv.code);
            const isBest = best?.code === sv.code;
            return (
              <g
                key={sv.code}
                transform={`translate(${p.x} ${p.y})`}
                className={`lch-node ${off ? "off" : ""} ${isBest ? "best" : ""} ${hover === sv.code ? "hot" : ""} ${grade(sv.ms)}`}
                onClick={() => toggle(sv.code)}
                onMouseEnter={() => setHover(sv.code)}
                onMouseLeave={() => setHover(null)}
                role="button"
                tabIndex={0}
                aria-pressed={off}
                aria-label={`${sv.name} ${sv.ms} ms`}
              >
                {isBest && <circle r="22" className="lch-lock" />}
                <circle r="16" className="lch-hit" />
                <circle r="12" className="lch-halo" />
                <circle r="6" className="lch-dot" />
                <image href={asset(`img/flags/${sv.flag}.svg`)} x={p.x > VB_W * 0.8 ? -40 : 12} y="-26" width="28" height="21" className="lch-node-flag" />
                <text x={p.x > VB_W * 0.8 ? -14 : 14} y="12" textAnchor={p.x > VB_W * 0.8 ? "end" : "start"} className="lch-node-label">
                  {sv.name}
                  <tspan className="lch-node-ms"> {sv.ms}</tspan>
                </text>
              </g>
            );
          })}
        </svg>
        <div className="lch-scan" aria-hidden="true" />
      </div>

      {/* chrome */}
      <header className="lch-top">
        <div className="lch-brand">
          <span className="lch-logo">
            <img src={asset("img/white-bolts.png")} alt="" width={16} height={16} />
          </span>
          <b>dropship</b>
          <span className="lch-ver">v3.1.0 · {t.edition}</span>
        </div>
        <div className="lch-chips">
          <span className={`lch-chip ${blocked.size ? "on" : ""}`}>
            <i />
            {t.filter} · {blocked.size ? t.on : t.off} · {t.blockedN(blocked.size)}
          </span>
          <span className={`lch-chip ${gameOpen ? "gold" : ""}`}>
            <i />
            {t.game} · {gameOpen ? t.running : t.closed}
          </span>
        </div>
        <div className="lch-pals" role="radiogroup" aria-label={t.palette}>
          {PALS.map((k) => (
            <button key={k} className={`lch-pal ${k} ${pal === k ? "active" : ""}`} onClick={() => setPal(k)} role="radio" aria-checked={pal === k} title={t.pals[k]} aria-label={t.pals[k]} />
          ))}
        </div>
        <span className="lch-win" aria-hidden="true">
          <i>–</i>
          <i>☐</i>
          <i>✕</i>
        </span>
      </header>

      <nav className="lch-rail" aria-label="views">
        {(Object.keys(t.views) as View[]).map((k) => {
          const Icon = VIEW_ICONS[k];
          return (
            <button key={k} className={view === k ? "active" : ""} onClick={() => setView(k)} title={t.views[k]} aria-label={t.views[k]} aria-pressed={view === k}>
              <Icon size={18} />
              {view === k && <motion.i layoutId="lch-rail-pill" className="lch-rail-pill" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
            </button>
          );
        })}
        <span className="lch-rail-gap" />
        <button onClick={() => setLang(ar ? "en" : "ar")} title={t.lang} aria-label={t.lang}>
          <Globe size={18} />
        </button>
        <button onClick={() => setThemePref(theme === "dark" ? "light" : "dark")} title={t.theme} aria-label={t.theme}>
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button onClick={() => setMini((m) => !m)} title={t.mini} aria-label={t.mini} aria-pressed={mini}>
          {mini === ar ? <ChevronsLeft size={18} /> : <ChevronsRight size={18} />}
        </button>
      </nav>

      <aside className="lch-panel">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={view} className="lch-panel-in" initial={reduced ? false : { opacity: 0, x: ar ? -16 : 16 }} animate={{ opacity: 1, x: 0 }} exit={reduced ? undefined : { opacity: 0, x: ar ? 16 : -16 }} transition={{ duration: 0.22 }}>
            {view === "map" && (
              <>
                <div className="lch-panel-head">
                  <h4>
                    {t.servers} <span className="lch-count tabular">{SERVERS.length - blocked.size}/{SERVERS.length}</span>
                  </h4>
                  <button className={`lch-sort ${sorted ? "on" : ""}`} onClick={() => setSorted((x) => !x)} aria-pressed={sorted}>
                    <ArrowDownUp size={13} />
                    {t.sort}
                  </button>
                </div>
                <ul className="lch-list">
                  {list.map((sv) => {
                    const off = blocked.has(sv.code);
                    const isBest = best?.code === sv.code;
                    return (
                      <motion.li key={sv.code} layout transition={{ type: "spring", stiffness: 500, damping: 40 }}>
                        <button
                          className={`lch-row ${off ? "off" : ""} ${isBest ? "best" : ""} ${grade(sv.ms)}`}
                          onClick={() => toggle(sv.code)}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            invert(sv.code);
                          }}
                          onMouseEnter={() => setHover(sv.code)}
                          onMouseLeave={() => setHover(null)}
                          aria-pressed={off}
                        >
                          <img className="lch-flag" src={asset(`img/flags/${sv.flag}.svg`)} alt="" width={28} height={21} loading="lazy" />
                          <span className="lch-name-wrap">
                            <span className="lch-name" dir="ltr">
                              {sv.name} <small className="lch-code tabular">{sv.code}</small>
                            </span>
                            <span className="lch-bar">
                              <i style={{ width: `${(sv.ms / maxMs) * 100}%` }} />
                            </span>
                          </span>
                          <span className="lch-ms tabular">
                            {sv.ms}
                            <small>ms</small>
                          </span>
                          <span className={`lch-switch ${off ? "" : "on"}`} aria-hidden="true">
                            <i />
                          </span>
                        </button>
                      </motion.li>
                    );
                  })}
                </ul>
                <button className="lch-ghost" onClick={() => setBlocked(new Set())}>
                  <Ban size={14} />
                  {t.unblockAll}
                </button>
              </>
            )}
            {view === "log" && (
              <>
                <div className="lch-panel-head">
                  <h4>{s.tabs.log}</h4>
                </div>
                <div className="lch-console">
                  <Typewriter lines={s.log} speed={18} loopPause={6000} />
                </div>
              </>
            )}
            {view === "help" && (
              <>
                <div className="lch-panel-head">
                  <h4>{s.tabs.help}</h4>
                </div>
                <div className="lch-help">
                  {s.help.map(([text, href]) => (
                    <a key={text} href={href} target="_blank" rel="noreferrer">
                      <span>{text}</span>
                      <small dir="ltr">{href}</small>
                    </a>
                  ))}
                </div>
                <div className="lch-news">
                  <div className="lch-news-head">
                    <b>{s.welcome.title}</b>
                    <span className="tabular">{s.welcome.date}</span>
                  </div>
                  <ul>
                    {s.welcome.bullets.map((b) => (
                      <li key={b}>
                        <Zap size={12} />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
            {view === "settings" && (
              <>
                <div className="lch-panel-head">
                  <h4>{s.tabs.options}</h4>
                </div>
                <div className="lch-settings">
                  <label className="lch-setting">
                    <span>{t.palette}</span>
                    <span className="lch-seg">
                      {PALS.map((k) => (
                        <button key={k} className={pal === k ? "active" : ""} onClick={() => setPal(k)}>
                          {t.pals[k]}
                        </button>
                      ))}
                    </span>
                  </label>
                  <label className="lch-setting">
                    <span>{s.options.block}</span>
                    <span className="lch-seg">
                      {(["always", "open"] as const).map((m) => (
                        <button key={m} className={mode === m ? "active" : ""} onClick={() => setMode(m)}>
                          {t.mode[m]}
                        </button>
                      ))}
                    </span>
                  </label>
                  {[s.options.openLog, s.options.noBg].map((o, i) => (
                    <label key={o} className="lch-setting">
                      <span>{o}</span>
                      <span className={`lch-switch ${i === 0 ? "on" : ""}`} aria-hidden="true">
                        <i />
                      </span>
                    </label>
                  ))}
                  <div className="lch-setting-btns">
                    <button className="lch-ghost small">{s.options.export}</button>
                    <button className="lch-ghost small">{s.options.wipe}</button>
                    <button className="lch-ghost small">{s.options.flush}</button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </aside>

      {!mini && (
        <div className="lch-route">
          <span className="lch-route-k">{t.best}</span>
          <div className="lch-route-line">
            <span className="lch-route-you">{t.you}</span>
            <span className="lch-route-arrow" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <AnimatePresence mode="wait" initial={false}>
              <motion.b key={best?.code ?? "-"} dir="ltr" className="lch-route-best" initial={reduced ? false : { y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={reduced ? undefined : { y: -8, opacity: 0 }} transition={{ duration: 0.2 }}>
                {best && <img className="lch-flag" src={asset(`img/flags/${best.flag}.svg`)} alt="" width={28} height={21} />}
                {best?.name ?? "—"}
              </motion.b>
            </AnimatePresence>
          </div>
          <div className="lch-route-ms">
            <span className="tabular">{best?.ms ?? "--"}</span>
            <small>ms · {best?.code ?? ""}</small>
          </div>
          <div className="lch-seg">
            {(["always", "open"] as const).map((m) => (
              <button key={m} className={mode === m ? "active" : ""} onClick={() => setMode(m)}>
                {t.mode[m]}
              </button>
            ))}
          </div>
        </div>
      )}

      <footer className="lch-foot">
        <span>{t.foot}</span>
        <span className="lch-keys">
          <kbd>esc</kbd> {t.keys.close}
          <kbd>LMB</kbd> {t.keys.toggle}
          <kbd>RMB</kbd> {t.keys.invert}
        </span>
      </footer>
    </div>
  );
}
