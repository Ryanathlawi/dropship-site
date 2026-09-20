import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowDownUp, Ban, ChevronsLeft, ChevronsRight, Gamepad2, Globe, Heart, Moon, Plus, Radio, Settings2, ShieldCheck, Sparkles, Star, Sun, Terminal, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { asset } from "./components";
import { Typewriter } from "./fx";
import type { Lang } from "./i18n";
import { SERVERS, STR } from "./replica";
import "./replica2.css";

/* the proposed new interface for the arabic edition: same data and behaviour as the current app,
   new layout and visual language (the site's saudi palette, cards, thmanyah) */

type Tab = "welcome" | "log" | "help" | "options";
type RepTheme = "dark" | "light";

const V2 = {
  en: {
    edition: "arabic edition · concept",
    servers: "servers",
    sort: "sort by ping",
    filter: "filter",
    on: "active",
    off: "idle",
    blocking: (n: number) => `blocking ${n} server${n === 1 ? "" : "s"}`,
    mode: { always: "persistent", open: "while open" },
    best: "best for you",
    game: "game",
    closed: "closed",
    running: "running",
    add: "add a game",
    disableAll: "unblock all",
    ms: "ms",
    quick: { lang: "language", theme: "theme", mini: "mini mode" },
    foot: "original app by stormy · arabic edition by Ryan Athlawi",
  },
  ar: {
    edition: "النسخة العربية · تصميم مقترح",
    servers: "السيرفرات",
    sort: "رتّب حسب البنق",
    filter: "الفلتر",
    on: "شغّال",
    off: "متوقف",
    blocking: (n: number) => (n === 0 ? "ما فيه حظر" : n === 1 ? "يحظر سيرفر واحد" : n === 2 ? "يحظر سيرفرين" : `يحظر ${n} سيرفرات`),
    mode: { always: "دائم", open: "أثناء التشغيل" },
    best: "الأفضل لك",
    game: "اللعبة",
    closed: "مغلقة",
    running: "شغّالة",
    add: "أضف لعبة",
    disableAll: "ارفع كل الحظر",
    ms: "ms",
    quick: { lang: "اللغة", theme: "المظهر", mini: "الوضع المصغّر" },
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
  const [tab, setTab] = useState<Tab>("welcome");
  const [blocked, setBlocked] = useState<Set<string>>(() => new Set(["ord1", "gue4"]));
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
  const v = V2[lang];
  const ar = lang === "ar";

  const toggle = (code: string) =>
    setBlocked((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });

  const list = sorted ? [...SERVERS].sort((a, b) => a.ms - b.ms) : SERVERS;
  const best = SERVERS.filter((sv) => !blocked.has(sv.code)).sort((a, b) => a.ms - b.ms)[0];
  const maxMs = Math.max(...SERVERS.map((sv) => sv.ms));

  return (
    <div className={`v2 v2-${theme} ${mini ? "mini" : ""}`} dir={ar ? "rtl" : "ltr"} lang={lang}>
      <header className="v2-top">
        <div className="v2-brand">
          <span className="v2-logo">
            <img src={asset("img/white-bolts.png")} alt="" width={16} height={16} />
          </span>
          <b>dropship</b>
          <span className="v2-ver">v4.0 · {v.edition}</span>
        </div>
        <div className="v2-quick">
          <button onClick={() => setLang(ar ? "en" : "ar")} title={v.quick.lang} aria-label={v.quick.lang}>
            <Globe size={14} />
            <span>{ar ? "EN" : "ع"}</span>
          </button>
          <button onClick={() => setThemePref(theme === "dark" ? "light" : "dark")} title={v.quick.theme} aria-label={v.quick.theme}>
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <button onClick={() => setMini((m) => !m)} title={v.quick.mini} aria-label={v.quick.mini} aria-pressed={mini}>
            {mini === ar ? <ChevronsLeft size={14} /> : <ChevronsRight size={14} />}
          </button>
        </div>
        <span className="v2-win" aria-hidden="true">
          <i>–</i>
          <i>☐</i>
          <i>✕</i>
        </span>
      </header>

      <div className="v2-body">
        <aside className="v2-card v2-servers">
          <div className="v2-card-head">
            <h4>
              <Radio size={15} />
              {v.servers}
              <span className="v2-count">{SERVERS.length - blocked.size}/{SERVERS.length}</span>
            </h4>
            <button className={`v2-icon ${sorted ? "on" : ""}`} onClick={() => setSorted((x) => !x)} title={v.sort} aria-label={v.sort} aria-pressed={sorted}>
              <ArrowDownUp size={14} />
            </button>
          </div>
          <ul className="v2-list">
            {list.map((sv) => {
              const off = blocked.has(sv.code);
              const isBest = best?.code === sv.code;
              return (
                <motion.li key={sv.code} layout transition={{ type: "spring", stiffness: 500, damping: 40 }}>
                  <button className={`v2-row ${off ? "off" : ""} ${isBest ? "best" : ""}`} onClick={() => toggle(sv.code)} aria-pressed={off}>
                    <span className="v2-code">{sv.code}</span>
                    <span className="v2-name-wrap">
                      <span className="v2-name" dir="ltr">
                        {sv.name}
                      </span>
                      <span className={`v2-bar ${grade(sv.ms)}`}>
                        <i style={{ width: `${(sv.ms / maxMs) * 100}%` }} />
                      </span>
                    </span>
                    <span className="v2-ms tabular">
                      {sv.ms}
                      <small>{v.ms}</small>
                    </span>
                    <span className={`v2-switch ${off ? "" : "on"}`} aria-hidden="true">
                      <i />
                    </span>
                  </button>
                </motion.li>
              );
            })}
          </ul>
          <button className="v2-ghost" onClick={() => setBlocked(new Set())}>
            <Ban size={14} />
            {v.disableAll}
          </button>
        </aside>

        {!mini && (
          <main className="v2-main">
            <section className="v2-status">
              <div className={`v2-card v2-stat ${blocked.size ? "active" : ""}`}>
                <span className="v2-stat-label">
                  <ShieldCheck size={14} />
                  {v.filter}
                </span>
                <b>
                  <i className="v2-dot" />
                  {blocked.size ? v.on : v.off}
                </b>
                <span className="v2-stat-sub">{v.blocking(blocked.size)}</span>
                <div className="v2-seg small">
                  {(["always", "open"] as const).map((m) => (
                    <button key={m} className={mode === m ? "active" : ""} onClick={() => setMode(m)}>
                      {v.mode[m]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="v2-card v2-stat gold">
                <span className="v2-stat-label">
                  <Star size={14} />
                  {v.best}
                </span>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.b key={best?.code ?? "-"} dir="ltr" initial={reduced ? false : { y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={reduced ? undefined : { y: -8, opacity: 0 }} transition={{ duration: 0.2 }}>
                    {best ? best.name : "—"}
                  </motion.b>
                </AnimatePresence>
                <span className="v2-stat-sub tabular">{best ? `${best.code} · ${best.ms} ms` : ""}</span>
              </div>

              <div className="v2-card v2-stat">
                <span className="v2-stat-label">
                  <Gamepad2 size={14} />
                  {v.game}
                </span>
                <b>
                  <span className={`v2-chip ${gameOpen ? "live" : ""}`}>{gameOpen ? v.running : v.closed}</span>
                </b>
                <span className="v2-stat-sub v2-exe" dir="ltr">
                  overwatch.exe
                </span>
                <button className="v2-ghost small">
                  <Plus size={13} />
                  {v.add}
                </button>
              </div>
            </section>

            <section className="v2-card v2-panel">
              <div className="v2-seg" role="tablist">
                {(Object.keys(s.tabs) as Tab[]).map((k) => {
                  const Icon = TAB_ICONS[k];
                  return (
                    <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? "active" : ""} onClick={() => setTab(k)}>
                      <Icon size={13} />
                      {s.tabs[k]}
                      {tab === k && <motion.i layoutId="v2-seg-pill" className="v2-seg-pill" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                    </button>
                  );
                })}
              </div>
              <div className="v2-panel-body" role="tabpanel">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div key={tab} initial={reduced ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={reduced ? undefined : { opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
                    {tab === "welcome" && (
                      <div className="v2-news">
                        <div className="v2-news-head">
                          <b>{s.welcome.title}</b>
                          <span className="tabular">{s.welcome.date}</span>
                        </div>
                        <p>{s.welcome.intro}</p>
                        <ul>
                          {s.welcome.bullets.map((b) => (
                            <li key={b}>
                              <Zap size={12} />
                              {b}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {tab === "log" && <Typewriter lines={s.log} speed={18} loopPause={6000} />}
                    {tab === "help" && (
                      <div className="v2-help">
                        {s.help.map(([text, href]) => (
                          <a key={text} href={href} target="_blank" rel="noreferrer">
                            <span>{text}</span>
                            <small dir="ltr">{href}</small>
                          </a>
                        ))}
                      </div>
                    )}
                    {tab === "options" && (
                      <div className="v2-options">
                        {[s.options.openLog, s.options.noBg].map((o) => (
                          <label key={o} className="v2-opt">
                            <span className="v2-switch on" aria-hidden="true">
                              <i />
                            </span>
                            {o}
                          </label>
                        ))}
                        <div className="v2-opt-btns">
                          <button className="v2-ghost small">{s.options.export}</button>
                          <button className="v2-ghost small">{s.options.wipe}</button>
                          <button className="v2-ghost small">{s.options.flush}</button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </section>
          </main>
        )}
      </div>

      <footer className="v2-foot">
        <span>{v.foot}</span>
        <span className="v2-keys">
          <kbd>esc</kbd> {s.close} <kbd>🖱</kbd> {s.toggle}
        </span>
      </footer>
    </div>
  );
}
