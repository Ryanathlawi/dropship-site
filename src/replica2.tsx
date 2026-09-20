import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowDownUp, Ban, ChevronsLeft, ChevronsRight, Crosshair, Globe, Heart, Moon, Settings2, Sparkles, Sun, Terminal } from "lucide-react";
import { useEffect, useState } from "react";
import { asset } from "./components";
import { Radar, Typewriter } from "./fx";
import type { Lang } from "./i18n";
import { SERVERS, STR } from "./replica";
import "./replica2.css";

/* proposed new interface for the arabic edition: a competitive-game hud. one window, angular panels,
   a server map as the centrepiece, a target readout, and a console at the bottom */

type Tab = "welcome" | "log" | "help" | "options";
type RepTheme = "dark" | "light";

const HUD = {
  en: {
    edition: "arabic edition · concept",
    filter: "filter",
    online: "online",
    standby: "standby",
    blocked: (n: number) => `${n} blocked`,
    game: "game",
    detected: "detected",
    idle: "not running",
    target: "target lock",
    servers: "servers",
    sort: "sort by ping",
    unblockAll: "unblock all",
    mode: { always: "persistent", open: "session" },
    map: "server map",
    mapHint: "click a blip or a row to block",
    you: "you",
    console: "console",
    keys: { close: "close", toggle: "toggle", invert: "invert others" },
    foot: "original app by stormy · arabic edition by Ryan Athlawi",
  },
  ar: {
    edition: "النسخة العربية · تصميم مقترح",
    filter: "الفلتر",
    online: "شغّال",
    standby: "متوقف",
    blocked: (n: number) => (n === 0 ? "بدون حظر" : n === 1 ? "سيرفر محظور" : n === 2 ? "سيرفران محظوران" : `${n} محظورة`),
    game: "اللعبة",
    detected: "مكتشفة",
    idle: "مغلقة",
    target: "الهدف",
    servers: "السيرفرات",
    sort: "رتّب حسب البنق",
    unblockAll: "ارفع كل الحظر",
    mode: { always: "دائم", open: "أثناء التشغيل" },
    map: "خريطة السيرفرات",
    mapHint: "اضغط نقطة أو صفًا للحظر",
    you: "أنت",
    console: "الكونسول",
    keys: { close: "إغلاق", toggle: "تبديل", invert: "عكس الباقي" },
    foot: "البرنامج الأصلي من stormy · النسخة العربية من Ryan Athlawi",
  },
};

const TAB_ICONS: Record<Tab, typeof Heart> = { welcome: Sparkles, log: Terminal, help: Heart, options: Settings2 };
const grade = (ms: number) => (ms < 50 ? "good" : ms < 100 ? "fair" : "poor");

export function AppReplica2({ siteLang, siteTheme }: { siteLang: Lang; siteTheme: RepTheme }) {
  const reduced = useReducedMotion();
  const [lang, setLang] = useState<Lang>(siteLang);
  const [themePref, setThemePref] = useState<"pc" | RepTheme>("pc");
  const [mini, setMini] = useState(false);
  const [tab, setTab] = useState<Tab>("log");
  const [blocked, setBlocked] = useState<Set<string>>(() => new Set(["usa - east 2", "usa - central"]));
  const [sorted, setSorted] = useState(false);
  const [mode, setMode] = useState<"always" | "open">("always");
  const [gameOpen, setGameOpen] = useState(false);

  useEffect(() => setLang(siteLang), [siteLang]);
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setGameOpen((g) => !g), 9000); // pretend the game launches and quits
    return () => clearInterval(id);
  }, [reduced]);

  const theme: RepTheme = themePref === "pc" ? siteTheme : themePref;
  const s = STR[lang];
  const h = HUD[lang];
  const ar = lang === "ar";

  const toggle = (name: string) =>
    setBlocked((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  const invert = (name: string) =>
    setBlocked((prev) => {
      const next = new Set<string>();
      for (const sv of SERVERS) if (sv.name !== name && !prev.has(sv.name)) next.add(sv.name);
      if (prev.has(name)) next.add(name);
      return next;
    });

  const list = sorted ? [...SERVERS].sort((a, b) => a.ms - b.ms) : SERVERS;
  const best = SERVERS.filter((sv) => !blocked.has(sv.name)).sort((a, b) => a.ms - b.ms)[0];
  const maxMs = Math.max(...SERVERS.map((sv) => sv.ms));

  return (
    <div className={`hud hud-${theme} ${mini ? "mini" : ""}`} dir={ar ? "rtl" : "ltr"} lang={lang}>
      <div className="hud-grid" aria-hidden="true" />
      <header className="hud-top">
        <div className="hud-brand">
          <span className="hud-mark">
            <img src={asset("img/white-bolts.png")} alt="" width={14} height={14} />
          </span>
          <b>DROPSHIP</b>
          <span className="hud-tag">v4.0 · {h.edition}</span>
        </div>
        <div className="hud-status" role="status">
          <span className={`hud-led ${blocked.size ? "on" : ""}`} />
          <span className="hud-k">{h.filter}</span>
          <b>{blocked.size ? h.online : h.standby}</b>
          <span className="hud-sep" />
          <span className="hud-k">{h.blocked(blocked.size)}</span>
          <span className="hud-sep" />
          <span className="hud-k">{h.game}</span>
          <b className={gameOpen ? "hot" : ""}>{gameOpen ? h.detected : h.idle}</b>
        </div>
        <div className="hud-quick">
          <button onClick={() => setLang(ar ? "en" : "ar")} aria-label="language">
            <Globe size={13} />
            <span>{ar ? "EN" : "ع"}</span>
          </button>
          <button onClick={() => setThemePref(theme === "dark" ? "light" : "dark")} aria-label="theme">
            {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
          </button>
          <button onClick={() => setMini((m) => !m)} aria-label="mini" aria-pressed={mini}>
            {mini === ar ? <ChevronsLeft size={13} /> : <ChevronsRight size={13} />}
          </button>
        </div>
      </header>

      <div className="hud-body">
        {!mini && (
          <section className="hud-map">
            <div className="hud-corners" aria-hidden="true" />
            <div className="hud-map-head">
              <span className="hud-k">{h.map}</span>
              <span className="hud-k faint">{h.mapHint}</span>
            </div>
            <div className="hud-map-body">
              <Radar
                blips={SERVERS.map((sv) => ({ label: sv.name, ms: sv.ms, code: sv.code }))}
                labels={{ you: h.you, scanning: h.filter, best: h.target, servers: h.servers, blocked: h.blocked(1), hint: h.mapHint }}
                blocked={blocked}
                onToggle={toggle}
                compact
                size={330}
              />
            </div>
            <div className="hud-target">
              <span className="hud-k">
                <Crosshair size={13} />
                {h.target}
              </span>
              <AnimatePresence mode="wait" initial={false}>
                <motion.b key={best?.code ?? "-"} dir="ltr" initial={reduced ? false : { y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={reduced ? undefined : { y: -10, opacity: 0 }} transition={{ duration: 0.2 }}>
                  {best ? best.name : "—"}
                </motion.b>
              </AnimatePresence>
              <span className="hud-target-ms tabular">
                {best ? best.ms : "--"}
                <small>ms</small>
              </span>
              <span className="hud-target-code tabular">{best?.code ?? ""}</span>
              <div className="hud-seg">
                {(["always", "open"] as const).map((m) => (
                  <button key={m} className={mode === m ? "active" : ""} onClick={() => setMode(m)}>
                    {h.mode[m]}
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        <aside className="hud-list">
          <div className="hud-corners" aria-hidden="true" />
          <div className="hud-list-head">
            <span className="hud-k">
              {h.servers} <b className="tabular">{SERVERS.length - blocked.size}/{SERVERS.length}</b>
            </span>
            <button className={`hud-btn ${sorted ? "on" : ""}`} onClick={() => setSorted((x) => !x)} aria-pressed={sorted} title={h.sort}>
              <ArrowDownUp size={12} />
              <span>{h.sort}</span>
            </button>
          </div>
          <ul>
            {list.map((sv) => {
              const off = blocked.has(sv.name);
              const isBest = best?.name === sv.name;
              return (
                <motion.li key={sv.code} layout transition={{ type: "spring", stiffness: 500, damping: 40 }}>
                  <button
                    className={`hud-row ${off ? "off" : ""} ${isBest ? "best" : ""} ${grade(sv.ms)}`}
                    onClick={() => toggle(sv.name)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      invert(sv.name);
                    }}
                    aria-pressed={off}
                  >
                    <i className="hud-row-edge" />
                    <span className="hud-code tabular">{sv.code}</span>
                    <span className="hud-name" dir="ltr">
                      {sv.name}
                    </span>
                    <span className="hud-bar" aria-hidden="true">
                      <i style={{ width: `${(sv.ms / maxMs) * 100}%` }} />
                    </span>
                    <span className="hud-ms tabular">
                      {sv.ms}
                      <small>ms</small>
                    </span>
                    <span className="hud-state" aria-hidden="true">
                      {off ? <Ban size={13} /> : <i className="hud-tick" />}
                    </span>
                  </button>
                </motion.li>
              );
            })}
          </ul>
          <button className="hud-btn wide" onClick={() => setBlocked(new Set())}>
            <Ban size={12} />
            <span>{h.unblockAll}</span>
          </button>
        </aside>
      </div>

      {!mini && (
        <section className="hud-console">
          <div className="hud-tabs" role="tablist">
            <span className="hud-k">{h.console}</span>
            {(Object.keys(s.tabs) as Tab[]).map((k) => {
              const Icon = TAB_ICONS[k];
              return (
                <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? "active" : ""} onClick={() => setTab(k)}>
                  <Icon size={12} />
                  {s.tabs[k]}
                </button>
              );
            })}
          </div>
          <div className="hud-console-body" role="tabpanel">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={tab} initial={reduced ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={reduced ? undefined : { opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
                {tab === "welcome" && (
                  <div className="hud-news">
                    <div className="hud-news-head">
                      <b>{s.welcome.title}</b>
                      <span className="tabular">{s.welcome.date}</span>
                    </div>
                    <p>{s.welcome.intro}</p>
                    <ul>
                      {s.welcome.bullets.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {tab === "log" && <Typewriter lines={s.log} speed={18} loopPause={6000} />}
                {tab === "help" && (
                  <div className="hud-help">
                    {s.help.map(([text, href]) => (
                      <a key={text} href={href} target="_blank" rel="noreferrer">
                        <span>{text}</span>
                        <small dir="ltr">{href}</small>
                      </a>
                    ))}
                  </div>
                )}
                {tab === "options" && (
                  <div className="hud-options">
                    {[s.options.openLog, s.options.noBg].map((o) => (
                      <label key={o} className="hud-opt">
                        <input type="checkbox" defaultChecked={o === s.options.openLog} />
                        <span>{o}</span>
                      </label>
                    ))}
                    <div className="hud-opt-btns">
                      <button className="hud-btn">{s.options.export}</button>
                      <button className="hud-btn">{s.options.wipe}</button>
                      <button className="hud-btn">{s.options.flush}</button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>
      )}

      <footer className="hud-foot">
        <span className="hud-k faint">{h.foot}</span>
        <span className="hud-keys">
          <kbd>esc</kbd> {h.keys.close}
          <kbd>LMB</kbd> {h.keys.toggle}
          <kbd>RMB</kbd> {h.keys.invert}
        </span>
      </footer>
    </div>
  );
}
