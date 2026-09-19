import { useEffect, useState } from "react";
import { useStats } from "./github";
import { dicts, LangContext, type Lang } from "./i18n";
import { DownloadSection, Faq, Features, Footer, Gallery, Hero, How, Nav, StatsBar, Team, type Theme } from "./sections";

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
      <Nav theme={theme} setTheme={setTheme} stars={stats.stars} />
      <main>
        <Hero stats={stats} theme={theme} />
        <StatsBar stats={stats} live={live} />
        <Features />
        <How />
        <Gallery />
        <Faq />
        <Team stats={stats} />
        <DownloadSection stats={stats} />
      </main>
      <Footer />
    </LangContext.Provider>
  );
}
