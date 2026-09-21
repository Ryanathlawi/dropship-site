import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Ban, ChevronsLeft, ChevronsRight, Heart, Minus, Plus, Settings2, Sparkles, Star, Terminal } from "lucide-react";
import { useEffect, useState } from "react";
import { asset } from "./components";
import { Typewriter } from "./fx";
import type { Lang } from "./i18n";
import "./replica.css";

/* a working replica of the dropship window: same layout and strings as the app, running in the page */

type RepTheme = "dark" | "light";
type Tab = "welcome" | "log" | "help" | "options";

export const SERVERS = [
  { name: "netherlands", code: "ams1", ms: 24, flag: "nl" },
  { name: "brazil 2", code: "gru2", ms: 140, flag: "br" },
  { name: "finland 2", code: "hel2", ms: 38, flag: "fi" },
  { name: "saudi arabia", code: "ruh1", ms: 31, flag: "sa" },
  { name: "singapore 2", code: "sin2", ms: 88, flag: "sg" },
  { name: "japan 2", code: "nrt2", ms: 95, flag: "jp" },
  { name: "usa - east 2", code: "ord1", ms: 102, flag: "us" },
  { name: "usa - southwest", code: "lax1", ms: 128, flag: "us" },
  { name: "usa - central", code: "gue4", ms: 115, flag: "us" },
  { name: "australia 3", code: "syd3", ms: 160, flag: "au" },
  { name: "taiwan", code: "tpe1", ms: 92, flag: "tw" },
];

/** the browser cannot ping game servers, so the demo numbers drift a little every couple of
 *  seconds — the way the real list moves — while staying near each server's typical value */
export function useLivePings(reduced: boolean | null) {
  const [servers, setServers] = useState(SERVERS);
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(
      () =>
        setServers((prev) =>
          prev.map((sv, i) => {
            if (Math.random() < 0.45) return sv;
            const base = SERVERS[i].ms;
            const next = Math.round(sv.ms + (Math.random() * 4 - 2));
            return { ...sv, ms: Math.max(base - 4, Math.min(base + 4, next)) };
          }),
        ),
      2200,
    );
    return () => clearInterval(id);
  }, [reduced]);
  return servers;
}

export const STR = {
  en: {
    title: "dropship",
    version: "v3.0.6",
    thisGame: "this game",
    addOne: "{{ add one }}",
    willOnly: "will only play on those servers ->",
    blockedN: (n: number) => `(${n} blocked)`,
    desc: "this configuration will be applied to the selected applications above. you do not need to keep this window open.",
    likely: (name: string, code: string) => `you are most likely to play on "${name}" (${code})`,
    tabs: { welcome: "welcome", log: "log", help: "help", options: "options" } as Record<Tab, string>,
    blocking: "dropship is blocking",
    want: "i want to play on..",
    disable: "disable dropship",
    source: "> source code <",
    by: "written by stormy.",
    close: "close",
    toggle: "toggle",
    toggleOthers: "toggle others",
    welcome: {
      title: "dropship v3",
      date: "08/02/2026",
      intro: "welcome to the new version of dropship :3c",
      bullets: [
        "app rewrite is complete. if you experience any new issues or missing features, please let me know in the discord",
        "server info is now dynamically fetched when you launch the app.",
        "app can now block servers for multiple games at once (previously could only affect a single installation)",
      ],
    },
    help: [
      ["if something's not working, you can ask for help in the discord :3", "https://discord.gg/QYrF8CVhbC"],
      ["you could also post an issue on github", "https://github.com/stowmyy/dropship"],
      ["desire a missing feature? please ask for it in the discord", "https://discord.gg/QYrF8CVhbC"],
    ],
    options: {
      size: "window size",
      theme: "theme",
      themes: { pc: "same as pc", dark: "dark", light: "light" },
      language: "language",
      languages: { en: "english", ar: "العربية" },
      block: "block servers",
      blocks: { always: "always", open: "only while open" },
      openLog: "open log when app starts",
      noBg: "disable background image",
      export: "export blocked ips",
      wipe: "wipe cache",
      reset: "click to reset windows firewall to factory defaults",
      flush: "click to flush windows dns",
    },
    log: [
      "dropship v3.0.6 started",
      "loaded config from %appdata%\\dropship\\data\\app.ron",
      "fetched server list: 11 servers",
      "pinging servers.. done (best: netherlands, 24 ms)",
      "blocking [\"ord1\", \"gue4\"]",
      "wfp filter applied. persists until you unblock",
      "watching for overwatch.exe..",
    ],
  },
  ar: {
    title: "dropship — النسخة العربية",
    version: "v3.0.6 — النسخة العربية",
    thisGame: "هذه اللعبة",
    addOne: "{{ أضف لعبة }}",
    willOnly: "بتلعب فقط على هذي السيرفرات <<",
    blockedN: (n: number) => `(${n} محظور)`,
    desc: "هذا الإعداد يُطبّق على الألعاب المحددة أعلاه. ما تحتاج تبقي النافذة مفتوحة.",
    likely: (name: string, code: string) => `على الأغلب بتلعب على "${name}" (${code})`,
    tabs: { welcome: "الأخبار", log: "السجل", help: "المساعدة", options: "الخيارات" } as Record<Tab, string>,
    blocking: "dropship يحظر",
    want: "أي ألعب على..",
    disable: "تعطيل dropship",
    source: "> الكود المصدري <",
    by: "البرنامج الأصلي من stormy · تعريب: Ryanathlawi",
    close: "إغلاق",
    toggle: "تبديل",
    toggleOthers: "عكس الباقي",
    welcome: {
      title: "dropship v3",
      date: "08/02/2026",
      intro: "welcome to the new version of dropship :3c",
      bullets: [
        "app rewrite is complete. if you experience any new issues or missing features, please let me know in the discord",
        "server info is now dynamically fetched when you launch the app.",
        "app can now block servers for multiple games at once (previously could only affect a single installation)",
      ],
    },
    help: [
      ["لو شي ما يشتغل، تقدر تطلب المساعدة في الديسكورد", "https://discord.gg/QYrF8CVhbC"],
      ["تقدر كذلك تفتح issue على GitHub", "https://github.com/stowmyy/dropship"],
      ["تبي ميزة ناقصة؟ اطلبها في الديسكورد", "https://discord.gg/QYrF8CVhbC"],
    ],
    options: {
      size: "حجم النافذة",
      theme: "المظهر",
      themes: { pc: "مثل الجهاز", dark: "داكن", light: "فاتح" },
      language: "اللغة",
      languages: { en: "English", ar: "العربية" },
      block: "حظر السيرفرات",
      blocks: { always: "دائمًا", open: "فقط أثناء التشغيل" },
      openLog: "افتح السجل عند التشغيل",
      noBg: "تعطيل صورة الخلفية",
      export: "تصدير الآيبيات المحظورة",
      wipe: "مسح الكاش",
      reset: "اضغط لإعادة جدار حماية ويندوز لإعدادات المصنع",
      flush: "اضغط لمسح DNS ويندوز",
    },
    log: [
      "بدأ dropship v3.0.6",
      "تم تحميل الإعدادات من %appdata%\\dropship\\data\\app.ron",
      "تم جلب قائمة السيرفرات: 11 سيرفر",
      "جارٍ قياس السيرفرات.. تم (الأفضل: netherlands، 24 ms)",
      "يحظر [\"ord1\", \"gue4\"]",
      "تم تطبيق فلتر WFP. يبقى لين ترفع الحظر",
      "بانتظار overwatch.exe..",
    ],
  },
};

const TAB_ICONS: Record<Tab, typeof Heart> = { welcome: Sparkles, log: Terminal, help: Heart, options: Settings2 };

function Signal({ ms }: { ms: number }) {
  const bars = ms < 50 ? 4 : ms < 90 ? 3 : ms < 130 ? 2 : 1;
  return (
    <span className="rep-signal" aria-label={`${ms} ms`} title={`${ms} ms`}>
      {[1, 2, 3, 4].map((b) => (
        <i key={b} className={b <= bars ? "on" : ""} style={{ height: `${3 + b * 2.2}px` }} />
      ))}
    </span>
  );
}

export function AppReplica({ siteLang, siteTheme }: { siteLang: Lang; siteTheme: RepTheme }) {
  const reduced = useReducedMotion();
  const servers = useLivePings(reduced);
  const [lang, setLang] = useState<Lang>(siteLang);
  const [themePref, setThemePref] = useState<"pc" | RepTheme>("pc");
  const [mini, setMini] = useState(false);
  const [tab, setTab] = useState<Tab>("help");
  const [blocked, setBlocked] = useState<Set<string>>(() => new Set(["ord1", "gue4"]));
  const [zoom, setZoom] = useState(1);
  const [block, setBlock] = useState<"always" | "open">("always");
  const [openLog, setOpenLog] = useState(false);
  const [noBg, setNoBg] = useState(false);

  useEffect(() => setLang(siteLang), [siteLang]);

  const theme: RepTheme = themePref === "pc" ? siteTheme : themePref;
  const s = STR[lang];
  const ar = lang === "ar";

  const toggle = (code: string) =>
    setBlocked((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  const toggleOthers = (code: string) =>
    setBlocked((prev) => {
      const next = new Set<string>();
      for (const sv of servers) if (sv.code !== code && !prev.has(sv.code)) next.add(sv.code);
      if (prev.has(code)) next.add(code);
      return next;
    });

  const allowed = servers.filter((sv) => !blocked.has(sv.code));
  const best = [...allowed].sort((a, b) => a.ms - b.ms)[0];
  const codes = servers.filter((sv) => blocked.has(sv.code)).map((sv) => `"${sv.code}"`);

  return (
    <div className={`rep rep-${theme} ${mini ? "mini" : ""} ${noBg ? "nobg" : ""}`} dir={ar ? "rtl" : "ltr"} lang={lang} style={{ fontSize: `${zoom * 13}px` }}>
      <div className="rep-title">
        <img src={asset("img/white-bolts.png")} alt="" width={14} height={14} />
        <span>{s.title}</span>
        <span className="rep-winbtns" aria-hidden="true">
          <i>–</i>
          <i>☐</i>
          <i>✕</i>
        </span>
      </div>

      <div className="rep-body">
        <AnimatePresence initial={false}>
          {!mini && (
            <motion.div
              className="rep-left"
              key="left"
              initial={reduced ? false : { opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={reduced ? undefined : { opacity: 0, width: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="rep-left-inner">
                <div className="rep-version">{s.version}</div>
                <h4>{s.thisGame}</h4>
                <div className="rep-exe" dir="ltr">
                  <img src={asset("img/ow.png")} alt="" width={16} height={16} />
                  S:\overwatch\_retail_\overwatch.exe
                </div>
                <div className="rep-add">{s.addOne}</div>

                <h4>{s.willOnly}</h4>
                <div className="rep-stars">
                  {servers.map((sv) => (
                    <button key={sv.code} className={`rep-star ${blocked.has(sv.code) ? "off" : sv.ms < 50 ? "near" : ""}`} onClick={() => toggle(sv.code)} title={sv.name} aria-label={sv.name} aria-pressed={blocked.has(sv.code)}>
                      <Star size={14} fill="currentColor" />
                    </button>
                  ))}
                  <span className="rep-count">{s.blockedN(blocked.size)}</span>
                </div>
                <p className="rep-desc">{s.desc}</p>
                <p className="rep-desc">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span key={best?.code ?? "-"} initial={reduced ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={reduced ? undefined : { opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
                      {best ? s.likely(best.name, best.code) : "—"}
                    </motion.span>
                  </AnimatePresence>
                </p>

                <div className="rep-tabs" role="tablist">
                  {(Object.keys(s.tabs) as Tab[]).map((k) => {
                    const Icon = TAB_ICONS[k];
                    return (
                      <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? "active" : ""} onClick={() => setTab(k)}>
                        <Icon size={12} aria-hidden="true" />
                        {s.tabs[k]}
                      </button>
                    );
                  })}
                </div>
                <div className="rep-panel" role="tabpanel">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div key={tab} initial={reduced ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={reduced ? undefined : { opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
                      {tab === "welcome" && (
                        <div className="rep-news">
                          <div className="rep-news-head">
                            <b>{s.welcome.title}</b>
                            <span>{s.welcome.date}</span>
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
                        <div className="rep-help">
                          {s.help.map(([text, href]) => (
                            <div key={text}>
                              <p>{text}</p>
                              <a href={href} target="_blank" rel="noreferrer" dir="ltr">
                                • {href}
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                      {tab === "options" && (
                        <div className="rep-options">
                          <div className="rep-opt-col">
                            <label className="rep-opt">
                              <span className="rep-stepper">
                                <button onClick={() => setZoom((z) => Math.max(0.8, +(z - 0.1).toFixed(2)))} aria-label="-">
                                  <Minus size={11} />
                                </button>
                                <span className="tabular">{zoom.toFixed(2)}</span>
                                <button onClick={() => setZoom((z) => Math.min(1.3, +(z + 0.1).toFixed(2)))} aria-label="+">
                                  <Plus size={11} />
                                </button>
                              </span>
                              {s.options.size}
                            </label>
                            <label className="rep-opt">
                              <select value={themePref} onChange={(e) => setThemePref(e.target.value as "pc" | RepTheme)}>
                                {(Object.keys(s.options.themes) as ("pc" | RepTheme)[]).map((k) => (
                                  <option key={k} value={k}>
                                    {s.options.themes[k]}
                                  </option>
                                ))}
                              </select>
                              {s.options.theme}
                            </label>
                            <label className="rep-opt">
                              <select value={lang} onChange={(e) => setLang(e.target.value as Lang)}>
                                {(Object.keys(s.options.languages) as Lang[]).map((k) => (
                                  <option key={k} value={k}>
                                    {s.options.languages[k]}
                                  </option>
                                ))}
                              </select>
                              {s.options.language}
                            </label>
                            <label className="rep-opt">
                              <select value={block} onChange={(e) => setBlock(e.target.value as "always" | "open")}>
                                {(Object.keys(s.options.blocks) as ("always" | "open")[]).map((k) => (
                                  <option key={k} value={k}>
                                    {s.options.blocks[k]}
                                  </option>
                                ))}
                              </select>
                              {s.options.block}
                            </label>
                            <label className="rep-check">
                              <input type="checkbox" checked={openLog} onChange={(e) => setOpenLog(e.target.checked)} />
                              {s.options.openLog}
                            </label>
                            <label className="rep-check">
                              <input type="checkbox" checked={noBg} onChange={(e) => setNoBg(e.target.checked)} />
                              {s.options.noBg}
                            </label>
                          </div>
                          <div className="rep-opt-col">
                            <button className="rep-btn">{s.options.export}</button>
                            <button className="rep-btn">{s.options.wipe}</button>
                            <button className="rep-link">{s.options.reset}</button>
                            <button className="rep-link">{s.options.flush}</button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="rep-right">
          <div className="rep-blocking" dir={ar ? "rtl" : "ltr"}>
            {s.blocking} <span dir="ltr">[{codes.join(", ")}]</span>
          </div>
          <div className="rep-want">
            <button className="rep-chev" onClick={() => setMini((m) => !m)} aria-label={mini ? "expand" : "collapse"} aria-expanded={!mini}>
              {mini === ar ? <ChevronsLeft size={14} /> : <ChevronsRight size={14} />}
            </button>
            <span>{s.want}</span>
          </div>
          <ul className="rep-list">
            {servers.map((sv) => {
              const off = blocked.has(sv.code);
              return (
                <li key={sv.code}>
                  <motion.button
                    className={`rep-row ${off ? "off" : ""}`}
                    onClick={() => toggle(sv.code)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      toggleOthers(sv.code);
                    }}
                    aria-pressed={off}
                    whileTap={reduced ? undefined : { scale: 0.98 }}
                  >
                    <Signal ms={sv.ms} />
                    <span className="rep-name" dir="ltr">
                      {sv.name}
                    </span>
                    <span className={`rep-icon ${sv.ms < 50 ? "near" : ""}`} aria-hidden="true">
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.span key={off ? "ban" : "star"} initial={reduced ? false : { scale: 0.4, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={reduced ? undefined : { scale: 0.4, rotate: 90 }} transition={{ type: "spring", stiffness: 500, damping: 26 }}>
                          {off ? <Ban size={14} /> : <Star size={14} fill="currentColor" />}
                        </motion.span>
                      </AnimatePresence>
                    </span>
                  </motion.button>
                </li>
              );
            })}
          </ul>
          <button className="rep-disable" onClick={() => setBlocked(new Set())}>
            {s.disable}
          </button>
        </div>
      </div>

      <div className="rep-foot">
        {!mini && (
          <div className="rep-credits">
            <a href="https://github.com/stowmyy/dropship" target="_blank" rel="noreferrer">
              {s.source}
            </a>
            <div>{s.by}</div>
          </div>
        )}
        <div className="rep-keys">
          <kbd>esc</kbd> {s.close}
          <kbd title="left click">🖱</kbd> {s.toggle}
          <kbd title="right click">🖱</kbd> {s.toggleOthers}
        </div>
      </div>
    </div>
  );
}
