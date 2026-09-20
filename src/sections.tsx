import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import {
  Activity,
  ArrowUpRight,
  Ban,
  ChevronDown,
  Compass,
  Crosshair,
  Download,
  ExternalLink,
  Gamepad2,
  Globe,
  Languages,
  Menu,
  Moon,
  MousePointerClick,
  Package,
  ShieldCheck,
  Star,
  Sun,
  ToggleLeft,
  X,
} from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
import { asset, Counter, DiscordIcon, GithubIcon, Kicker, Reveal, Spotlight, Tilt, XIcon } from "./components";
import { Bars, Marquee, Radar, RotatingWord, SplitWords, Typewriter, Wordmark } from "./fx";
const AppReplica = lazy(() => import("./replica").then((m) => ({ default: m.AppReplica })));
const AppReplica2 = lazy(() => import("./replica2").then((m) => ({ default: m.AppReplica2 })));
import type { Lang } from "./i18n";
import { LINKS, asset as findAsset, mb, num, type Stats } from "./github";
import { useT } from "./i18n";

export type Theme = "dark" | "light";
const EASE = [0.22, 1, 0.36, 1] as const;

/* ----------------------------------------------------------- announce */

export function Announce() {
  const { t } = useT();
  const reduced = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setI((n) => (n + 1) % t.announce.length), 4200);
    return () => clearInterval(id);
  }, [t.announce.length, reduced]);
  const item = t.announce[i];
  const external = item.href.startsWith("http");
  return (
    <div className="announce" role="status">
      <div className="container announce-inner">
        <span className="announce-dot" aria-hidden="true" />
        <AnimatePresence mode="wait" initial={false}>
          <motion.a
            key={item.text}
            href={item.href}
            target={external ? "_blank" : undefined}
            rel={external ? "noreferrer" : undefined}
            initial={reduced ? false : { y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduced ? undefined : { y: -12, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            {item.text}
            <ArrowUpRight size={14} aria-hidden="true" />
          </motion.a>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ welcome */

const WELCOME_KEY = "ds-welcomed";

export function Welcome() {
  const { t } = useT();
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(WELCOME_KEY)) return;
    } catch {
      /* ignore */
    }
    const id = setTimeout(() => setOpen(true), 1500);
    return () => clearTimeout(id);
  }, []);

  const close = () => {
    setOpen(false);
    try {
      localStorage.setItem(WELCOME_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const h = new Date().getHours();
  const greeting = h < 12 ? t.welcome.morning : h < 18 ? t.welcome.afternoon : t.welcome.evening;
  const title = t.welcome.title.replace("{greeting}", greeting);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="welcome"
          role="dialog"
          aria-label={title}
          initial={reduced ? false : { y: 40, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={reduced ? undefined : { y: 30, opacity: 0, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
        >
          <motion.img
            src={asset("img/white-bolts.png")}
            alt=""
            width={36}
            height={36}
            animate={reduced ? undefined : { rotate: [0, -10, 10, 0] }}
            transition={{ delay: 0.6, duration: 0.8 }}
          />
          <div className="welcome-body">
            <b>{title}</b>
            <p>{t.welcome.text}</p>
            <div className="welcome-actions">
              <a className="btn btn-primary btn-sm" href="#try" onClick={close}>
                {t.welcome.try}
              </a>
              <a className="btn btn-ghost btn-sm" href="#download" onClick={close}>
                <Download size={14} aria-hidden="true" />
                {t.welcome.get}
              </a>
            </div>
          </div>
          <button className="icon-btn welcome-close" onClick={close} aria-label={t.welcome.close}>
            <X size={16} aria-hidden="true" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------------------------------------------------------------- nav */

const SECTIONS = ["try", "features", "how", "gallery", "faq", "team", "download"];

export function Nav({ theme, setTheme, stars }: { theme: Theme; setTheme: (t: Theme) => void; stars: number }) {
  const { t, lang, setLang } = useT();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });

  useEffect(() => {
    const onScroll = () => setScrolled(scrollY > 24);
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const els = SECTIONS.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [lang]);

  const links: [string, string][] = [
    ["try", t.nav.try],
    ["features", t.nav.features],
    ["how", t.nav.how],
    ["gallery", t.nav.gallery],
    ["faq", t.nav.faq],
    ["team", t.nav.team],
  ];

  return (
    <header className={`nav ${scrolled ? "scrolled" : ""}`}>
      <motion.div className="nav-progress" style={{ scaleX: progress }} aria-hidden="true" />
      <div className="container nav-inner">
        <a href="#top" className="brand" aria-label="dropship">
          <motion.img
            src={asset("img/white-bolts.png")}
            alt=""
            width={28}
            height={28}
            whileHover={{ rotate: [0, -12, 12, 0], transition: { duration: 0.5 } }}
          />
          <span>dropship</span>
        </a>

        <nav className="nav-links" aria-label="Primary">
          {links.map(([id, label]) => (
            <a key={id} href={`#${id}`} className={active === id ? "active" : ""}>
              {label}
              {active === id && <motion.span layoutId="nav-active" className="nav-active" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
            </a>
          ))}
        </nav>

        <div className="nav-actions">
          <button className="icon-btn lang-btn" onClick={() => setLang(lang === "en" ? "ar" : "en")} aria-label={t.nav.language}>
            <Globe size={16} aria-hidden="true" />
            <span>{t.nav.language}</span>
          </button>
          <button className="icon-btn" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label={t.nav.theme}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                className="icon-swap"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {theme === "dark" ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
              </motion.span>
            </AnimatePresence>
          </button>
          <a className="btn btn-ghost btn-sm nav-stars" href={LINKS.upstream} target="_blank" rel="noreferrer">
            <GithubIcon size={16} />
            <Star size={14} aria-hidden="true" />
            <span className="tabular">{num(stars)}</span>
          </a>
          <a className="btn btn-primary btn-sm nav-cta shimmer" href="#download">
            <Download size={16} aria-hidden="true" />
            {t.nav.download}
          </a>
          <button className="icon-btn menu-btn" aria-label={t.nav.menu} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            className="nav-mobile"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            aria-label="Primary"
          >
            {links.map(([id, label]) => (
              <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>
                {label}
              </a>
            ))}
            <a href="#download" className="btn btn-primary" onClick={() => setOpen(false)}>
              <Download size={16} aria-hidden="true" />
              {t.nav.download}
            </a>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

/* --------------------------------------------------------------- hero */

export function Hero({ stats, theme }: { stats: Stats; theme: Theme }) {
  const { t, lang } = useT();
  const reduced = useReducedMotion();
  const ar = lang === "ar";
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 900], [0, reduced ? 0 : 140]);
  const visualY = useTransform(scrollY, [0, 900], [0, reduced ? 0 : -50]);

  const official = findAsset(stats.latest, "dropship.exe");
  const arabic = findAsset(stats.latestAr, "dropship-ar.exe");
  const primary = ar ? arabic : official;
  const primaryVersion = ar ? stats.latestAr.version : stats.latest.version;
  const secondaryHref = ar ? LINKS.upstreamReleases : LINKS.arReleases;

  const shot = ar ? (theme === "dark" ? "img/ar-main-dark.webp" : "img/ar-main-light.webp") : "img/en-expanded.webp";
  // the app's own welcome-screen backdrop, orange for english and green for arabic
  const tex = `img/tex-hero-bg${ar ? "-green" : ""}${theme === "dark" ? "_dark" : ""}.webp`;

  const enter = (delay: number) => ({
    initial: reduced ? false : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: EASE },
  });
  const float = (delay: number) =>
    reduced ? {} : { animate: { y: [0, -10, 0] }, transition: { repeat: Infinity, duration: 5.5, ease: "easeInOut" as const, delay } };

  return (
    <section className="hero" id="top">
      <motion.div className="hero-bg" aria-hidden="true" style={{ backgroundImage: `url(${asset(tex)})`, y: bgY }} />
      <div className="hero-glow" aria-hidden="true" />
      <div className="hero-glow hero-glow-2" aria-hidden="true" />

      <div className="container hero-grid">
        <div className="hero-copy">
          <motion.span className="badge" {...enter(0)}>
            <span className="badge-dot" />
            {t.hero.badge}
          </motion.span>

          <h1>
            <SplitWords text={t.hero.title1} mode="mount" delay={0.1} />
            <span className="grad">
              <RotatingWord words={t.hero.words} />
            </span>
          </h1>

          <motion.p className="lead" {...enter(0.3)}>
            {t.hero.subtitle}
          </motion.p>

          <motion.div className="hero-ctas" {...enter(0.4)}>
            <a className="btn btn-primary btn-lg shimmer" href={primary?.url ?? LINKS.upstreamReleases}>
              <Download size={20} aria-hidden="true" />
              <span>
                {t.hero.cta}
                <small>
                  {primaryVersion}
                  {primary ? ` · ${mb(primary.size)}` : ""}
                </small>
              </span>
            </a>
            <a className="btn btn-ghost btn-lg" href={secondaryHref} target="_blank" rel="noreferrer">
              <Languages size={18} aria-hidden="true" />
              {t.hero.ctaAr}
            </a>
            <a className="btn btn-link" href={LINKS.upstream} target="_blank" rel="noreferrer">
              <GithubIcon size={18} />
              {t.hero.ctaGit}
            </a>
          </motion.div>

          <motion.p className="hint" {...enter(0.5)}>
            {t.hero.hint}
            <br />
            {t.hero.credits}
          </motion.p>
        </div>

        <motion.div className="hero-visual" {...enter(0.25)}>
          <motion.div style={{ y: visualY }}>
            <Tilt className="window">
              <img className="window-shot" src={asset(shot)} alt={t.gallery.items[0].caption} width={1511} height={1044} />
            </Tilt>
            <motion.div className="chip chip-a" {...float(0)}>
              <Star size={14} aria-hidden="true" className="chip-star" />
              <span dir="ltr">netherlands</span>
              <b dir="ltr">24 ms</b>
            </motion.div>
            <motion.div className="chip chip-b" {...float(1.2)}>
              <Ban size={14} aria-hidden="true" className="chip-ban" />
              <span dir="ltr">usa - east 2</span>
              <b>{t.hero.chipBlocked}</b>
            </motion.div>
            <motion.div className="chip chip-c" {...float(2.4)}>
              <Crosshair size={14} aria-hidden="true" className="chip-hit" />
              <span>{t.hero.chipLikely}</span>
              <b dir="ltr">saudi arabia</b>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- playground */

export function Playground({ theme }: { theme: Theme }) {
  const { t, lang } = useT();
  const reduced = useReducedMotion();
  const [view, setView] = useState<"before" | "after">("after");
  return (
    <section className="section playground" id="try">
      <div className="container">
        <Reveal className="section-head">
          <Kicker>{t.playground.kicker}</Kicker>
          <h2>
            <SplitWords text={t.playground.title} />
          </h2>
          <p className="lead">{t.playground.subtitle}</p>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="compare-head">
            <div className="tabs" role="tablist">
              {(["before", "after"] as const).map((k) => (
                <button key={k} role="tab" aria-selected={view === k} className={`tab ${view === k ? "active" : ""}`} onClick={() => setView(k)}>
                  {t.playground[k]}
                  {view === k && <motion.span layoutId="compare-pill" className="tab-pill" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                </button>
              ))}
            </div>
            <p className="compare-note">{view === "before" ? t.playground.beforeNote : t.playground.afterNote}</p>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={view}
              initial={reduced ? false : { opacity: 0, y: 16, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? undefined : { opacity: 0, y: -12, scale: 0.99 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <Suspense fallback={<div className="replica-skeleton" aria-hidden="true" />}>
                {view === "before" ? <AppReplica siteLang={lang as Lang} siteTheme={theme} /> : <AppReplica2 siteLang={lang as Lang} siteTheme={theme} />}
              </Suspense>
            </motion.div>
          </AnimatePresence>
          <p className="caption">{t.playground.tip}</p>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ marquee */

const SERVERS = ["netherlands", "brazil 2", "finland 2", "saudi arabia", "singapore 2", "japan 2", "usa - east 2", "usa - southwest", "usa - central", "australia 3", "taiwan"];

export function MarqueeBand() {
  const { t } = useT();
  return (
    <section className="band" aria-hidden="true">
      <Marquee duration={46}>
        {t.marquee.map((m) => (
          <span className="band-item" key={m}>
            <span className="band-bolt">⚡</span>
            {m}
          </span>
        ))}
      </Marquee>
      <Marquee reverse duration={38}>
        {SERVERS.map((s) => (
          <span className="band-item band-server" key={s} dir="ltr">
            <Star size={12} aria-hidden="true" />
            {s}
          </span>
        ))}
      </Marquee>
    </section>
  );
}

/* -------------------------------------------------------------- stats */

export function StatsBar({ stats, live }: { stats: Stats; live: boolean }) {
  const { t } = useT();
  const items = [
    { n: stats.downloads, l: t.stats.downloads, s: "+" },
    { n: stats.stars, l: t.stats.stars, s: "" },
    { n: stats.releases, l: t.stats.releases, s: "" },
    { n: stats.contributors.length, l: t.stats.contributors, s: "" },
  ];
  return (
    <section className="stats" aria-label={t.stats.cached}>
      <div className="container">
        <div className="stats-grid">
          {items.map((it, i) => (
            <Reveal key={it.l} delay={i * 0.08} className="stat">
              <div className="stat-n">
                <Counter value={it.n} suffix={it.s} />
              </div>
              <div className="stat-l">{it.l}</div>
            </Reveal>
          ))}
        </div>
        <Reveal className="stats-chart" delay={0.2}>
          <div className="stats-chart-head">
            <span>{t.stats.chart}</span>
            <span className="stats-note">
              <span className={`dot ${live ? "pulse" : ""}`} aria-hidden="true" />
              {live ? t.stats.live : t.stats.cached}
            </span>
          </div>
          <Bars data={stats.perRelease} label={t.stats.chart} />
          <div className="bars-axis" aria-hidden="true">
            <span className="tabular">{stats.perRelease[0]?.v}</span>
            <span className="tabular">{stats.perRelease[stats.perRelease.length - 1]?.v}</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- features */

const FEATURE_ICONS = [Ban, Activity, Crosshair, ToggleLeft, ShieldCheck, Package, Languages, Compass];
const BLIPS = [
  { label: "netherlands", ms: 24 },
  { label: "saudi arabia", ms: 31 },
  { label: "finland 2", ms: 38 },
  { label: "taiwan", ms: 92 },
  { label: "japan 2", ms: 95 },
  { label: "usa - east 2", ms: 102 },
  { label: "brazil 2", ms: 140 },
];

export function Features() {
  const { t } = useT();
  return (
    <section className="section" id="features">
      <div className="container">
        <Reveal className="section-head">
          <Kicker>{t.features.kicker}</Kicker>
          <h2>
            <SplitWords text={t.features.title} />
          </h2>
          <p className="lead">{t.features.subtitle}</p>
        </Reveal>

        <ul className="bento">
          {t.features.items.map((f, i) => {
            const Icon = FEATURE_ICONS[i];
            return (
              <Reveal key={f.title} as="li" delay={(i % 4) * 0.07} className="bento-cell">
                <Spotlight className={`feat ${i === 1 ? "feat-radar" : ""}`}>
                  <span className="feat-icon">
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                  {i === 1 && (
                    <div className="feat-radar-wrap">
                      <Radar blips={BLIPS} labels={t.radar} />
                      <span className="feat-radar-hint">{t.radar.hint}</span>
                    </div>
                  )}
                </Spotlight>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- how */

const STEP_ICONS = [Download, MousePointerClick, Gamepad2];

export function How() {
  const { t } = useT();
  const reduced = useReducedMotion();
  return (
    <section className="section section-alt" id="how">
      <div className="container">
        <Reveal className="section-head">
          <Kicker>{t.how.kicker}</Kicker>
          <h2>
            <SplitWords text={t.how.title} />
          </h2>
        </Reveal>

        <div className="how-grid">
          <div className="steps">
            <motion.div
              className="steps-line"
              aria-hidden="true"
              initial={reduced ? false : { scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, margin: "-120px" }}
              transition={{ duration: 1.4, ease: "easeInOut" }}
            />
            {t.how.steps.map((s, i) => {
              const Icon = STEP_ICONS[i];
              return (
                <Reveal key={s.title} delay={i * 0.15} className="step">
                  <div className="step-num">
                    <span className="tabular">0{i + 1}</span>
                    <Icon size={20} aria-hidden="true" />
                  </div>
                  <div>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <Reveal className="terminal" delay={0.2}>
            <div className="terminal-bar">
              <span className="terminal-dots" aria-hidden="true" />
              <span>{t.how.logTitle}</span>
            </div>
            <Typewriter lines={t.how.log} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ gallery */

const SLIDE_MS = 5000;

export function Gallery() {
  const { t } = useT();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const item = t.gallery.items[i];

  useEffect(() => {
    if (paused || reduced) return;
    const id = setTimeout(() => setI((n) => (n + 1) % t.gallery.items.length), SLIDE_MS);
    return () => clearTimeout(id);
  }, [i, paused, reduced, t.gallery.items.length]);

  return (
    <section className="section" id="gallery">
      <div className="container">
        <Reveal className="section-head">
          <Kicker>{t.gallery.kicker}</Kicker>
          <h2>
            <SplitWords text={t.gallery.title} />
          </h2>
        </Reveal>

        <Reveal>
          <div className="tabs" role="tablist" aria-label={t.gallery.kicker}>
            {t.gallery.items.map((g, k) => (
              <button key={g.key} role="tab" aria-selected={k === i} className={`tab ${k === i ? "active" : ""}`} onClick={() => setI(k)}>
                {g.label}
                {k === i && <motion.span layoutId="tab-pill" className="tab-pill" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
              </button>
            ))}
          </div>

          <div className="frame" role="tabpanel" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
            <div className="frame-body">
              <AnimatePresence mode="wait" initial={false}>
                <motion.img
                  key={item.key}
                  src={asset(`img/${item.key}.webp`)}
                  alt={item.caption}
                  initial={reduced ? false : { opacity: 0, scale: 0.97, filter: "blur(8px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={reduced ? undefined : { opacity: 0, scale: 1.02, filter: "blur(8px)" }}
                  transition={{ duration: 0.4, ease: EASE }}
                  loading="lazy"
                />
              </AnimatePresence>
            </div>
            {!reduced && (
              <div className="frame-progress" aria-hidden="true">
                <motion.div
                  key={`${i}-${paused}`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: paused ? 0 : 1 }}
                  transition={{ duration: paused ? 0 : SLIDE_MS / 1000, ease: "linear" }}
                />
              </div>
            )}
          </div>
          <p className="caption">
            <span>{item.caption}</span>
            <span className="caption-auto">{t.gallery.autoplay}</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- faq */

export function Faq() {
  const { t } = useT();
  return (
    <section className="section section-alt" id="faq">
      <div className="container container-narrow">
        <Reveal className="section-head">
          <Kicker>{t.faq.kicker}</Kicker>
          <h2>
            <SplitWords text={t.faq.title} />
          </h2>
        </Reveal>

        <div className="faq">
          {t.faq.items.map((f, i) => (
            <Reveal key={f.q} delay={i * 0.04}>
              <details className="faq-item" name="faq">
                <summary>
                  <span>{f.q}</span>
                  <ChevronDown size={18} aria-hidden="true" />
                </summary>
                <p>{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- team */

export function Team({ stats }: { stats: Stats }) {
  const { t } = useT();
  const people = [
    {
      name: "stormy",
      login: "stowmyy",
      role: t.team.stormyRole,
      text: t.team.stormyText,
      links: [
        { href: LINKS.stormy, label: "GitHub", icon: <GithubIcon size={16} /> },
        { href: LINKS.stormyX, label: "X", icon: <XIcon size={15} /> },
        { href: LINKS.discord, label: "Discord", icon: <DiscordIcon size={16} /> },
        { href: LINKS.stormySite, label: t.team.website, icon: <ExternalLink size={16} aria-hidden="true" /> },
      ],
    },
    {
      name: "Ryan Athlawi",
      login: "Ryanathlawi",
      role: t.team.ryanRole,
      text: t.team.ryanText,
      links: [
        { href: LINKS.ryan, label: "GitHub", icon: <GithubIcon size={16} /> },
        { href: LINKS.ryanSite, label: t.team.website, icon: <ExternalLink size={16} aria-hidden="true" /> },
      ],
    },
  ];

  return (
    <section className="section" id="team">
      <div className="container">
        <Reveal className="section-head">
          <Kicker>{t.team.kicker}</Kicker>
          <h2>
            <SplitWords text={t.team.title} />
          </h2>
        </Reveal>

        <div className="people">
          {people.map((p, i) => (
            <Reveal key={p.login} delay={i * 0.1}>
              <Spotlight className="person">
                <motion.img
                  src={`https://github.com/${p.login}.png?size=160`}
                  alt=""
                  width={80}
                  height={80}
                  loading="lazy"
                  whileHover={{ rotate: -4, scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                />
                <div>
                  <h3>{p.name}</h3>
                  <p className="person-role">{p.role}</p>
                  <p>{p.text}</p>
                  <div className="person-links">
                    {p.links.map((l) => (
                      <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                        {l.icon}
                        {l.label}
                      </a>
                    ))}
                  </div>
                </div>
              </Spotlight>
            </Reveal>
          ))}
        </div>

        <Reveal className="contributors">
          <p className="kicker">{t.team.contributors}</p>
          <ul>
            {stats.contributors.map((c, i) => (
              <motion.li
                key={c.login}
                initial={{ opacity: 0, scale: 0.6 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 20 }}
              >
                <a href={c.url} target="_blank" rel="noreferrer" title={c.login} aria-label={c.login}>
                  <img src={c.avatar} alt="" width={48} height={48} loading="lazy" />
                </a>
              </motion.li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- cta */

export function CtaBanner({ stats }: { stats: Stats }) {
  const { t, lang } = useT();
  const reduced = useReducedMotion();
  const primary = findAsset(lang === "ar" ? stats.latestAr : stats.latest, lang === "ar" ? "dropship-ar.exe" : "dropship.exe");
  return (
    <section className="cta-wrap">
      <div className="container">
        <Reveal className="cta">
          <div className="cta-bg" aria-hidden="true" />
          <motion.img
            className="cta-bolt"
            src={asset("img/white-bolts.png")}
            alt=""
            width={160}
            height={160}
            aria-hidden="true"
            animate={reduced ? undefined : { y: [0, -14, 0], rotate: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          />
          <div className="cta-copy">
            <h2>
              <SplitWords text={t.cta.title} />
            </h2>
            <p>{t.cta.text}</p>
          </div>
          <a className="btn btn-primary btn-lg shimmer cta-btn" href={primary?.url ?? "#download"}>
            <Download size={20} aria-hidden="true" />
            {t.cta.button}
          </a>
        </Reveal>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- download */

export function DownloadSection({ stats }: { stats: Stats }) {
  const { t } = useT();
  const official = findAsset(stats.latest, "dropship.exe");
  const plain = findAsset(stats.latestAr, "dropship-ar.exe");
  const animated = findAsset(stats.latestAr, "dropship-ar-animated.exe");

  const meta = (version: string, size?: number, downloads?: number) => (
    <dl className="dl-meta">
      <div>
        <dt>{t.download.version}</dt>
        <dd className="tabular">{version}</dd>
      </div>
      {size !== undefined && (
        <div>
          <dt>{t.download.size}</dt>
          <dd className="tabular">{mb(size)}</dd>
        </div>
      )}
      {downloads !== undefined && (
        <div>
          <dt>{t.download.downloads}</dt>
          <dd className="tabular">{num(downloads)}</dd>
        </div>
      )}
    </dl>
  );

  return (
    <section className="section section-alt" id="download">
      <div className="container">
        <Reveal className="section-head">
          <Kicker>{t.download.kicker}</Kicker>
          <h2>
            <SplitWords text={t.download.title} />
          </h2>
          <p className="lead">{t.download.subtitle}</p>
        </Reveal>

        <div className="dl-grid">
          <Reveal>
            <Spotlight className="dl-card">
              <span className="tag">{t.download.official}</span>
              <h3>{t.download.officialName}</h3>
              <p>{t.download.officialText}</p>
              {meta(stats.latest.version, official?.size, official?.downloads)}
              <div className="dl-actions">
                <a className="btn btn-primary shimmer" href={official?.url ?? LINKS.upstreamReleases}>
                  <Download size={18} aria-hidden="true" />
                  {t.download.exe}
                </a>
                <a className="btn btn-ghost" href={LINKS.upstreamReleases} target="_blank" rel="noreferrer">
                  {t.download.versions}
                </a>
              </div>
            </Spotlight>
          </Reveal>

          <Reveal delay={0.1}>
            <Spotlight className="dl-card">
              <span className="tag tag-ar">{t.download.arabic}</span>
              <h3>{t.download.arabicName}</h3>
              <p>{t.download.arabicText}</p>
              {meta(stats.latestAr.version, plain?.size, (plain?.downloads ?? 0) + (animated?.downloads ?? 0))}
              <div className="dl-actions">
                <a className="btn btn-primary shimmer" href={plain?.url ?? LINKS.arReleases}>
                  <Download size={18} aria-hidden="true" />
                  {t.download.plain}
                </a>
                <a className="btn btn-ghost" href={animated?.url ?? LINKS.arReleases}>
                  <Download size={18} aria-hidden="true" />
                  {t.download.animated}
                </a>
                <a className="btn btn-link" href={LINKS.arReleases} target="_blank" rel="noreferrer">
                  {t.download.versions}
                </a>
              </div>
            </Spotlight>
          </Reveal>
        </div>

        <Reveal className="smartscreen">
          <ShieldCheck size={18} aria-hidden="true" />
          <span>{t.download.smartscreen}</span>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- footer */

export function Footer() {
  const { t } = useT();
  return (
    <footer className="footer">
      <div className="container">
        <Wordmark text="dropship" />
        <div className="footer-inner">
          <div className="footer-brand">
            <img src={asset("img/white-bolts.png")} alt="" width={22} height={22} />
            <span>dropship</span>
            <span className="footer-made">{t.footer.made}</span>
          </div>
          <nav className="footer-links" aria-label="Footer">
            <a href={LINKS.upstream} target="_blank" rel="noreferrer">
              <GithubIcon size={16} /> GitHub
            </a>
            <a href={LINKS.discord} target="_blank" rel="noreferrer">
              <DiscordIcon size={16} /> {t.footer.discord}
            </a>
            <a href={LINKS.upstreamIssues} target="_blank" rel="noreferrer">
              {t.footer.issues}
            </a>
            <a href={LINKS.site} target="_blank" rel="noreferrer">
              {t.footer.source}
            </a>
          </nav>
          <p className="footer-disclaimer">{t.footer.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
