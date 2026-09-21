import { useEffect, useState } from "react";
import { useStats } from "./github";
import { dicts, LangContext, type Lang } from "./i18n";
import { motion } from "motion/react";
import { CursorGlow } from "./fx";
import { Announce, CtaBanner, Diagram, DownloadSection, Faq, Features, Footer, Gallery, Hero, How, MarqueeBand, Nav, Playground, StatsBar, Team, Welcome, type Theme } from "./sections";

const write = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
};

// index.html already applied these before first paint; read them back so react agrees
const initialLang = (): Lang => (document.documentElement.dataset.lang === "ar" ? "ar" : "en");
const initialTheme = (): Theme => (document.documentElement.dataset.theme === "light" ? "light" : "dark");

export default function App() {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const [theme, setThemeState] = useState<Theme>(initialTheme);
  const { stats, live } = useStats();
  const t = dicts[lang];

  useEffect(() => {
    const d = document.documentElement;
    d.lang = lang;
    d.dir = lang === "ar" ? "rtl" : "ltr";
    d.dataset.lang = lang;
    document.title = t.meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", t.meta.description);
  }, [lang, t]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const setLang = (l: Lang) => {
    setLangState(l);
    write("ds-lang", l);
  };
  const setTheme = (th: Theme) => {
    setThemeState(th);
    write("ds-theme", th);
  };

  return (
    <LangContext.Provider value={{ lang, t, setLang }}>
      <CursorGlow />
      <Welcome />
      <Announce />
      <Nav theme={theme} setTheme={setTheme} stars={stats.stars} />
      {/* remount on language change so the whole page crossfades and replays its reveals */}
      <motion.div key={lang} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <main>
          <Hero stats={stats} theme={theme} />
          <MarqueeBand />
          <Playground theme={theme} />
          <StatsBar stats={stats} live={live} />
          <Features />
          <How />
          <Gallery />
          <Diagram theme={theme} />
          <Faq />
          <Team stats={stats} />
          <CtaBanner stats={stats} />
          <DownloadSection stats={stats} />
        </main>
        <Footer />
      </motion.div>
    </LangContext.Provider>
  );
}
