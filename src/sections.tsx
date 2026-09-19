import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import {
  Activity,
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
import { useState } from "react";
import { asset, Counter, DiscordIcon, GithubIcon, Kicker, Reveal, Spotlight, Tilt, XIcon } from "./components";
import { LINKS, asset as findAsset, mb, num, type Stats } from "./github";
import { useT } from "./i18n";

export type Theme = "dark" | "light";

/* ---------------------------------------------------------------- nav */

export function Nav({ theme, setTheme, stars }: { theme: Theme; setTheme: (t: Theme) => void; stars: number }) {
  const { t, lang, setLang } = useT();
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });

  const links: [string, string][] = [
    ["#features", t.nav.features],
    ["#how", t.nav.how],
    ["#gallery", t.nav.gallery],
    ["#faq", t.nav.faq],
    ["#team", t.nav.team],
  ];

  return (
    <header className="nav">
      <motion.div className="nav-progress" style={{ scaleX: progress }} aria-hidden="true" />
      <div className="container nav-inner">
        <a href="#top" className="brand" aria-label="dropship">
          <img src={asset("img/white-bolts.png")} alt="" width={28} height={28} />
          <span>dropship</span>
        </a>

        <nav className="nav-links" aria-label="Primary">
          {links.map(([href, label]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>

        <div className="nav-actions">
          <button className="icon-btn lang-btn" onClick={() => setLang(lang === "en" ? "ar" : "en")} aria-label={t.nav.language}>
            <Globe size={16} aria-hidden="true" />
            <span>{t.nav.language}</span>
          </button>
          <button className="icon-btn" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label={t.nav.theme}>
            {theme === "dark" ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
          </button>
          <a className="btn btn-ghost btn-sm nav-stars" href={LINKS.upstream} target="_blank" rel="noreferrer">
            <GithubIcon size={16} />
            <Star size={14} aria-hidden="true" />
            <span className="tabular">{num(stars)}</span>
          </a>
          <a className="btn btn-primary btn-sm nav-cta" href="#download">
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
            {links.map(([href, label]) => (
              <a key={href} href={href} onClick={() => setOpen(false)}>
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

  const official = findAsset(stats.latest, "dropship.exe");
  const arabic = findAsset(stats.latestAr, "dropship-ar.exe");
  const primary = ar ? arabic : official;
  const primaryVersion = ar ? stats.latestAr.version : stats.latest.version;
  const secondaryHref = ar ? LINKS.upstreamReleases : LINKS.arReleases;

  const shot = ar ? (theme === "dark" ? "img/ar-main-dark.webp" : "img/ar-main-light.webp") : "img/en-expanded.webp";
  // the app's own welcome-screen backdrop, orange for english and green for arabic
  const tex = `img/tex-hero-bg${ar ? "-green" : ""}${theme === "dark" ? "_dark" : ""}.webp`;

  const float = (delay: number) =>
    reduced ? {} : { animate: { y: [0, -10, 0] }, transition: { repeat: Infinity, duration: 5.5, ease: "easeInOut" as const, delay } };

  const enter = (delay: number) => ({
    initial: reduced ? false : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
  });

  return (
    <section className="hero" id="top">
      <div className="hero-bg" aria-hidden="true" style={{ backgroundImage: `url(${asset(tex)})` }} />
      <div className="hero-glow" aria-hidden="true" />

      <div className="container hero-grid">
        <div className="hero-copy">
          <motion.span className="badge" {...enter(0)}>
            <span className="badge-dot" />
            {t.hero.badge}
          </motion.span>

          <motion.h1 {...enter(0.08)}>
            {t.hero.title1}
            <br />
            <span className="grad">{t.hero.title2}</span>
          </motion.h1>

          <motion.p className="lead" {...enter(0.16)}>
            {t.hero.subtitle}
          </motion.p>

          <motion.div className="hero-ctas" {...enter(0.24)}>
            <a className="btn btn-primary btn-lg" href={primary?.url ?? LINKS.upstreamReleases}>
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

          <motion.p className="hint" {...enter(0.32)}>
            {t.hero.hint}
          </motion.p>
        </div>

        <motion.div className="hero-visual" {...enter(0.2)}>
          <Tilt className="window">
            <img className="window-shot" src={asset(shot)} alt={t.gallery.items[0].caption} width={1511} height={1050} />
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
      </div>
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
        <p className="stats-note">
          <span className={`dot ${live ? "pulse" : ""}`} aria-hidden="true" />
          {live ? t.stats.live : t.stats.cached}
        </p>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- features */

const FEATURE_ICONS = [Ban, Activity, Crosshair, ToggleLeft, ShieldCheck, Package, Languages, Compass];

export function Features() {
  const { t } = useT();
  return (
    <section className="section" id="features">
      <div className="container">
        <Reveal className="section-head">
          <Kicker>{t.features.kicker}</Kicker>
          <h2>{t.features.title}</h2>
          <p className="lead">{t.features.subtitle}</p>
        </Reveal>

        <ul className="bento">
          {t.features.items.map((f, i) => {
            const Icon = FEATURE_ICONS[i];
            return (
              <Reveal key={f.title} as="li" delay={(i % 4) * 0.07} className="bento-cell">
                <Spotlight className="feat">
                  <span className="feat-icon">
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
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
          <h2>{t.how.title}</h2>
        </Reveal>

        <div className="steps">
          <motion.div
            className="steps-line"
            aria-hidden="true"
            initial={reduced ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-120px" }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
          />
          {t.how.steps.map((s, i) => {
            const Icon = STEP_ICONS[i];
            return (
              <Reveal key={s.title} delay={i * 0.15} className="step">
                <div className="step-num">
                  <span className="tabular">0{i + 1}</span>
                  <Icon size={22} aria-hidden="true" />
                </div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ gallery */

export function Gallery() {
  const { t } = useT();
  const [i, setI] = useState(0);
  const reduced = useReducedMotion();
  const item = t.gallery.items[i];

  return (
    <section className="section" id="gallery">
      <div className="container">
        <Reveal className="section-head">
          <Kicker>{t.gallery.kicker}</Kicker>
          <h2>{t.gallery.title}</h2>
        </Reveal>

        <Reveal>
          <div className="tabs" role="tablist" aria-label={t.gallery.kicker}>
            {t.gallery.items.map((g, k) => (
              <button
                key={g.key}
                role="tab"
                aria-selected={k === i}
                className={`tab ${k === i ? "active" : ""}`}
                onClick={() => setI(k)}
              >
                {g.label}
                {k === i && <motion.span layoutId="tab-pill" className="tab-pill" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
              </button>
            ))}
          </div>

          <div className="frame" role="tabpanel">
            <div className="frame-body">
              <AnimatePresence mode="wait" initial={false}>
                <motion.img
                  key={item.key}
                  src={asset(`img/${item.key}.webp`)}
                  alt={item.caption}
                  initial={reduced ? false : { opacity: 0, scale: 0.985 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduced ? undefined : { opacity: 0, scale: 0.985 }}
                  transition={{ duration: 0.28 }}
                  loading="lazy"
                />
              </AnimatePresence>
            </div>
          </div>
          <p className="caption">{item.caption}</p>
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
          <h2>{t.faq.title}</h2>
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
          <h2>{t.team.title}</h2>
        </Reveal>

        <div className="people">
          {people.map((p, i) => (
            <Reveal key={p.login} delay={i * 0.1}>
              <Spotlight className="person">
                <img src={`https://github.com/${p.login}.png?size=160`} alt="" width={80} height={80} loading="lazy" />
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
          <h2>{t.download.title}</h2>
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
                <a className="btn btn-primary" href={official?.url ?? LINKS.upstreamReleases}>
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
                <a className="btn btn-primary" href={plain?.url ?? LINKS.arReleases}>
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
      <div className="container footer-inner">
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
    </footer>
  );
}
