import { createContext, useContext } from "react";

export type Lang = "en" | "ar";

export const en = {
  meta: {
    title: "dropship — server selector for Overwatch 2",
    description:
      "dropship is a free, portable server selector for Overwatch 2. Block the regions you don't want and play where your ping is best. Nothing in the game is touched.",
  },
  nav: {
    features: "Features",
    how: "How it works",
    gallery: "Screenshots",
    faq: "FAQ",
    team: "Team",
    download: "Download",
    github: "GitHub",
    theme: "Toggle theme",
    language: "العربية",
    menu: "Menu",
  },
  hero: {
    badge: "Free · open source · Windows",
    title1: "Play Overwatch 2",
    title2: "on the servers you choose.",
    subtitle:
      "dropship is a portable server selector. Block the regions you don't want, and the matchmaker keeps you where your ping is best. Nothing in the game is touched.",
    cta: "Download for Windows",
    ctaAr: "Arabic version",
    ctaGit: "View source",
    hint: "Windows 10 / 11 · a single .exe, no installer",
    chipAllowed: "allowed",
    chipBlocked: "blocked",
    chipLikely: "most likely to play on",
    windowTitle: "dropship",
  },
  stats: {
    downloads: "Downloads",
    stars: "GitHub stars",
    releases: "Releases",
    contributors: "Contributors",
    live: "live from GitHub",
    cached: "GitHub numbers",
  },
  features: {
    kicker: "Features",
    title: "Everything you need. Nothing you don't.",
    subtitle:
      "One small window, a list of servers, and a star next to each one. That's the whole app, and it does exactly what it says.",
    items: [
      {
        title: "Block by region",
        text: "One click per server. Blocks persist until you lift them, even after closing the app.",
      },
      {
        title: "Live ping",
        text: "Every server is pinged as the list loads, so you see what you'd actually get before you queue.",
      },
      {
        title: "Most likely to play on",
        text: "dropship tells you where the matchmaker will drop you, based on your blocks and your ping.",
      },
      {
        title: "Persistent or session-only",
        text: "Keep blocks after closing, or only while dropship is open. Your call, one dropdown.",
      },
      {
        title: "Never touches the game",
        text: "It adds IP filters with the Windows Filtering Platform, the same way an ad blocker works. No game files, no injection.",
      },
      {
        title: "Portable and tiny",
        text: "A single 9 MB .exe. Settings live in %appdata%\\dropship and updates arrive inside the app.",
      },
      {
        title: "English and Arabic",
        text: "A full right-to-left layout with Arabic fonts. Available in the Arabic build today and on its way to the main app.",
      },
      {
        title: "Guided tour",
        text: "An onboarding walkthrough explains every panel the first time you open it, and can be replayed any time.",
      },
    ],
  },
  how: {
    kicker: "How it works",
    title: "Three steps. Then just play.",
    steps: [
      {
        title: "Download and open",
        text: "Run dropship with the game closed. Accept the administrator prompt; it's needed to manage the IP filter.",
      },
      {
        title: "Block what you don't want",
        text: "Click the servers you'd rather avoid. A star means allowed, a ban icon means blocked.",
      },
      {
        title: "Play",
        text: "Close the app if you like. Your blocks stay until you unblock them.",
      },
    ],
  },
  gallery: {
    kicker: "Screenshots",
    title: "A closer look.",
    items: [
      { key: "en-expanded", label: "Expanded", caption: "The main window: your game, the server list and the tabs." },
      { key: "en-collapsed", label: "Collapsed", caption: "Collapsed mode keeps only the server list on screen." },
      { key: "ar-main-dark", label: "Arabic · dark", caption: "The Arabic build with a mirrored right-to-left layout." },
      { key: "ar-main-light", label: "Arabic · light", caption: "Light theme, same layout." },
      { key: "ar-tour", label: "Guided tour", caption: "The onboarding tour dims the window and explains each panel." },
      { key: "ar-tabs", label: "Options", caption: "Zoom, theme, language and firewall tools in the options tab." },
    ],
  },
  faq: {
    kicker: "FAQ",
    title: "Questions, answered.",
    items: [
      {
        q: "Does it modify the game?",
        a: "No. dropship never touches game files or memory. It only adds an IP filter to Windows, exactly like an ad blocker would.",
      },
      {
        q: "Do I need to keep it open?",
        a: "No. Blocks are permanent until you unblock them, unless you choose the option to block only while dropship is open.",
      },
      {
        q: "What does it install?",
        a: "Nothing. It creates a config file in %appdata%\\dropship and an IP filter in Windows. The filter is removed as soon as all servers are unblocked. To uninstall, click “disable dropship” and delete the .exe.",
      },
      {
        q: "Why does Windows SmartScreen warn me?",
        a: "The .exe is new and unsigned, so SmartScreen hasn't built a reputation for it yet. Click “More info”, then “Run anyway”. The source code is public if you'd like to read it or build it yourself.",
      },
      {
        q: "Queuing with friends?",
        a: "The matchmaker may still put you on servers you've avoided unless everyone in the party blocks them too.",
      },
      {
        q: "Can I test it in the practice range?",
        a: "The practice range skips the matchmaker. Use a custom game instead.",
      },
      {
        q: "I'm failing to connect to a server",
        a: "Click the reconnect button quickly to avoid a competitive penalty, then report it in the Discord so it can be investigated.",
      },
      {
        q: "Something's not working",
        a: "Ask in the Discord or open an issue on GitHub. Real people answer.",
      },
    ],
  },
  team: {
    kicker: "Team",
    title: "The people behind dropship.",
    stormyRole: "Creator and maintainer",
    stormyText: "Wrote dropship from scratch and keeps it running for the whole community.",
    ryanRole: "Arabic localization",
    ryanText: "The Arabic version, the right-to-left layout, the guided tour and this website.",
    contributors: "Contributors on GitHub",
    website: "Website",
  },
  download: {
    kicker: "Download",
    title: "Get dropship.",
    subtitle: "Free, open source, no account needed.",
    official: "Official",
    officialName: "dropship",
    officialText: "The original app by stormy. English interface.",
    arabic: "Arabic",
    arabicName: "dropship — Arabic version",
    arabicText: "Arabic interface with the Thmanyah font and a guided tour. Choose the plain build or the one with animations.",
    exe: "Download .exe",
    plain: "Plain build",
    animated: "Animated build",
    versions: "All versions",
    size: "size",
    downloads: "downloads",
    version: "version",
    smartscreen: "Windows SmartScreen may warn on first run. Click “More info”, then “Run anyway”.",
  },
  footer: {
    disclaimer:
      "Not affiliated with Blizzard Entertainment. Overwatch is a trademark of Blizzard Entertainment, Inc.",
    made: "Built by the community, for the community.",
    source: "Site source",
    discord: "Discord",
    issues: "Report an issue",
  },
};

export type Dict = typeof en;

export const ar: Dict = {
  meta: {
    title: "dropship — اختيار سيرفرات أوفرواتش 2",
    description:
      "dropship برنامج مجاني ومحمول لاختيار سيرفرات أوفرواتش 2. احظر المناطق اللي ما تبيها والعب حيث البنق أفضل. ما يلمس اللعبة أبدًا.",
  },
  nav: {
    features: "المميزات",
    how: "طريقة العمل",
    gallery: "لقطات",
    faq: "الأسئلة",
    team: "الفريق",
    download: "تحميل",
    github: "GitHub",
    theme: "تبديل المظهر",
    language: "English",
    menu: "القائمة",
  },
  hero: {
    badge: "مجاني · مفتوح المصدر · ويندوز",
    title1: "العب أوفرواتش 2",
    title2: "على السيرفرات اللي تختارها.",
    subtitle:
      "dropship برنامج محمول لاختيار السيرفرات. احظر المناطق اللي ما تبيها، ويبقيك الماتش ميكر حيث البنق أفضل. ما يلمس اللعبة أبدًا.",
    cta: "تحميل النسخة العربية",
    ctaAr: "النسخة الإنجليزية",
    ctaGit: "الكود المصدري",
    hint: "ويندوز 10 / 11 · ملف .exe واحد بدون تثبيت",
    chipAllowed: "مسموح",
    chipBlocked: "محظور",
    chipLikely: "على الأغلب بتلعب على",
    windowTitle: "dropship — النسخة العربية",
  },
  stats: {
    downloads: "تحميل",
    stars: "نجمة على GitHub",
    releases: "إصدار",
    contributors: "مساهم",
    live: "مباشر من GitHub",
    cached: "أرقام GitHub",
  },
  features: {
    kicker: "المميزات",
    title: "كل اللي تحتاجه. ولا شي زيادة.",
    subtitle:
      "نافذة صغيرة، قائمة سيرفرات، ونجمة جنب كل واحد. هذا البرنامج كله، ويسوي بالضبط اللي يقوله.",
    items: [
      {
        title: "حظر حسب المنطقة",
        text: "ضغطة واحدة لكل سيرفر. الحظر يبقى لين ترفعه، حتى بعد إغلاق البرنامج.",
      },
      {
        title: "بنق مباشر",
        text: "كل سيرفر يُقاس بنقه وقت تحميل القائمة، فتشوف اللي بتحصل عليه فعلًا قبل ما تدخل الطابور.",
      },
      {
        title: "على الأغلب بتلعب على",
        text: "dropship يقول لك وين بيحطك الماتش ميكر، بناءً على حظرك وبنقك.",
      },
      {
        title: "دائم أو أثناء التشغيل فقط",
        text: "خلّ الحظر بعد الإغلاق، أو فقط ما دام dropship مفتوح. القرار لك من قائمة واحدة.",
      },
      {
        title: "ما يلمس اللعبة أبدًا",
        text: "يضيف فلاتر IP عبر منصة تصفية ويندوز (WFP)، بنفس طريقة مانع الإعلانات. لا ملفات لعبة ولا حقن.",
      },
      {
        title: "محمول وصغير",
        text: "ملف .exe واحد بحجم 9 م.ب. الإعدادات في %appdata%\\dropship والتحديثات توصلك داخل البرنامج.",
      },
      {
        title: "عربي وإنجليزي",
        text: "تخطيط كامل من اليمين لليسار بخطوط عربية. متوفر اليوم في النسخة العربية وفي طريقه للبرنامج الأساسي.",
      },
      {
        title: "جولة تعريفية",
        text: "جولة إرشادية تشرح كل جزء أول ما تفتح البرنامج، وتقدر تعيدها في أي وقت.",
      },
    ],
  },
  how: {
    kicker: "طريقة العمل",
    title: "ثلاث خطوات. وبعدها العب.",
    steps: [
      {
        title: "حمّل وافتح",
        text: "شغّل dropship واللعبة مغلقة. اقبل طلب صلاحيات المسؤول؛ يحتاجه عشان يدير فلتر الـ IP.",
      },
      {
        title: "احظر اللي ما تبيه",
        text: "اضغط على السيرفرات اللي تفضّل تتجنبها. النجمة تعني مسموح، وعلامة المنع تعني محظور.",
      },
      {
        title: "العب",
        text: "سكّر البرنامج لو تبي. الحظر يبقى لين ترفعه بنفسك.",
      },
    ],
  },
  gallery: {
    kicker: "لقطات",
    title: "نظرة أقرب.",
    items: [
      { key: "en-expanded", label: "الوضع الكامل", caption: "النافذة الرئيسية: لعبتك، قائمة السيرفرات، والتبويبات." },
      { key: "en-collapsed", label: "الوضع المصغّر", caption: "الوضع المصغّر يبقي قائمة السيرفرات فقط على الشاشة." },
      { key: "ar-main-dark", label: "عربي · داكن", caption: "النسخة العربية بتخطيط معكوس من اليمين لليسار." },
      { key: "ar-main-light", label: "عربي · فاتح", caption: "المظهر الفاتح، نفس التخطيط." },
      { key: "ar-tour", label: "الجولة التعريفية", caption: "الجولة تعتّم النافذة وتشرح كل جزء على حدة." },
      { key: "ar-tabs", label: "الخيارات", caption: "التكبير والمظهر واللغة وأدوات الجدار الناري في تبويب الخيارات." },
    ],
  },
  faq: {
    kicker: "الأسئلة الشائعة",
    title: "أسئلة، وإجاباتها.",
    items: [
      {
        q: "هل يعدّل على اللعبة؟",
        a: "لا. dropship ما يلمس ملفات اللعبة ولا ذاكرتها أبدًا. فقط يضيف فلتر IP في ويندوز، بالضبط مثل مانع الإعلانات.",
      },
      {
        q: "هل لازم يبقى مفتوح؟",
        a: "لا. الحظر دائم لين ترفعه، إلا لو اخترت خيار الحظر فقط أثناء تشغيل dropship.",
      },
      {
        q: "وش يثبّت على جهازي؟",
        a: "لا شي. ينشئ ملف إعدادات في %appdata%\\dropship وفلتر IP في ويندوز. الفلتر يُحذف أول ما ترفع الحظر عن كل السيرفرات. لإزالته، اضغط «تعطيل dropship» واحذف ملف الـ .exe.",
      },
      {
        q: "ليه ويندوز SmartScreen يحذّرني؟",
        a: "ملف الـ .exe جديد وغير موقّع، فـ SmartScreen ما بنى له سمعة بعد. اضغط «More info» ثم «Run anyway». الكود المصدري علني لو تبي تقرأه أو تبنيه بنفسك.",
      },
      {
        q: "تلعب مع أصدقاء؟",
        a: "الماتش ميكر قد يحطك على سيرفرات حظرتها إلا إذا حظرها كل أعضاء المجموعة كذلك.",
      },
      {
        q: "أقدر أجربه في ساحة التدريب؟",
        a: "ساحة التدريب تتخطى الماتش ميكر. جرّب لعبة مخصصة بدلها.",
      },
      {
        q: "ما أقدر أتصل بالسيرفر",
        a: "اضغط زر إعادة الاتصال بسرعة عشان تتجنب عقوبة التنافسي، وبعدها بلّغ في الديسكورد عشان يتم فحصها.",
      },
      {
        q: "شي ما يشتغل",
        a: "اسأل في الديسكورد أو افتح issue على GitHub. فيه ناس حقيقيين يردون.",
      },
    ],
  },
  team: {
    kicker: "الفريق",
    title: "الناس اللي وراء dropship.",
    stormyRole: "المؤسس والمطوّر",
    stormyText: "كتب dropship من الصفر ويحافظ على تشغيله للمجتمع كله.",
    ryanRole: "التعريب",
    ryanText: "النسخة العربية، التخطيط من اليمين لليسار، الجولة التعريفية، وهذا الموقع.",
    contributors: "المساهمون على GitHub",
    website: "الموقع",
  },
  download: {
    kicker: "تحميل",
    title: "حمّل dropship.",
    subtitle: "مجاني، مفتوح المصدر، وبدون حساب.",
    official: "الرسمية",
    officialName: "dropship",
    officialText: "البرنامج الأصلي من stormy. واجهة إنجليزية.",
    arabic: "عربي",
    arabicName: "dropship — النسخة العربية",
    arabicText: "واجهة عربية بخط ثمانية وجولة تعريفية. اختر النسخة العادية أو النسخة بالأنميشن.",
    exe: "تحميل البرنامج",
    plain: "النسخة العادية",
    animated: "نسخة الأنميشن",
    versions: "كل الإصدارات",
    size: "الحجم",
    downloads: "تحميل",
    version: "الإصدار",
    smartscreen: "قد يحذّرك ويندوز SmartScreen أول تشغيل. اضغط «More info» ثم «Run anyway».",
  },
  footer: {
    disclaimer:
      "غير تابع لشركة Blizzard Entertainment. أوفرواتش علامة تجارية مسجلة لشركة Blizzard Entertainment, Inc.",
    made: "من المجتمع، للمجتمع.",
    source: "كود الموقع",
    discord: "ديسكورد",
    issues: "أبلغ عن مشكلة",
  },
};

export const dicts: Record<Lang, Dict> = { en, ar };

export const LangContext = createContext<{ lang: Lang; t: Dict; setLang: (l: Lang) => void }>({
  lang: "en",
  t: en,
  setLang: () => {},
});

export const useT = () => useContext(LangContext);
