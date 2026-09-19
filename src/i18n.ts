import { createContext, useContext } from "react";

export type Lang = "en" | "ar";

export const en = {
  meta: {
    title: "dropship — server selector for Overwatch 2",
    description:
      "dropship is a free, portable server selector for Overwatch 2. Block the regions you don't want and play where your ping is best. Nothing in the game is touched.",
  },
  announce: [
    { text: "v3.0.6 is out: 9 MB, no installer, in-app updates", href: "#download" },
    { text: "The Arabic version is here, with a full right-to-left layout", href: "#download" },
    { text: "Something not working? Real people answer in the Discord", href: "https://discord.gg/QYrF8CVhbC" },
  ],
  nav: {
    features: "Features",
    how: "How it works",
    gallery: "Screenshots",
    faq: "FAQ",
    team: "Team",
    try: "Try it",
    download: "Download",
    github: "GitHub",
    theme: "Toggle theme",
    language: "العربية",
    menu: "Menu",
  },
  hero: {
    badge: "Free · open source · Windows",
    title1: "Play Overwatch 2",
    words: ["where you choose.", "on saudi arabia.", "on netherlands.", "on japan.", "on your terms."],
    subtitle:
      "dropship is a portable server selector. Block the regions you don't want, and the matchmaker keeps you where your ping is best. Nothing in the game is touched.",
    cta: "Download for Windows",
    ctaAr: "Arabic version",
    ctaGit: "View source",
    hint: "Windows 10 / 11 · a single .exe, no installer",
    credits: "Original app by stormy · Arabic edition, guided tour and this site by Ryan Athlawi",
    chipAllowed: "allowed",
    chipBlocked: "blocked",
    chipLikely: "most likely to play on",
    windowTitle: "dropship",
    demoTitle: "i want to play on..",
    demoLikely: "you are most likely to play on",
    demoHint: "interactive demo: click a server to block or allow it",
  },
  marquee: [
    "free forever",
    "open source",
    "a single 9 MB .exe",
    "no installer",
    "no game files touched",
    "ping for every server",
    "blocks persist after closing",
    "english and arabic",
    "in-app updates",
    "windows 10 / 11",
  ],
  welcome: {
    morning: "Good morning",
    afternoon: "Good afternoon",
    evening: "Good evening",
    title: "{greeting}, welcome to dropship",
    text: "Play Overwatch 2 on the servers you choose. Try the demo right here, or grab the app. It's free.",
    try: "Try the demo",
    get: "Download",
    close: "Close",
  },
  radar: { you: "you", scanning: "scanning", best: "best", servers: "servers", blocked: "blocked", hint: "click a server to block it" },
  playground: {
    kicker: "Try it",
    title: "The app, running in your browser.",
    subtitle:
      "A working replica of the dropship window. Block servers, switch tabs, change the theme and language, collapse it. Nothing is installed and nothing is sent anywhere.",
    tip: "Left click blocks or allows a server. Right click keeps that server and flips all the others, exactly like the app.",
  },
  stats: {
    downloads: "Downloads",
    stars: "GitHub stars",
    releases: "Releases",
    contributors: "Contributors",
    live: "live from GitHub",
    cached: "GitHub numbers",
    chart: "Downloads per release, oldest to newest",
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
    logTitle: "log",
    log: [
      "dropship v3.0.6 · windows 11",
      "game: S:\\overwatch\\_retail_\\overwatch.exe",
      "pinging 13 servers.. done (best: netherlands, 24 ms)",
      "blocked: usa - east 2, usa - central",
      "wfp filter applied. persists until you unblock ✓",
      "you are most likely to play on \"netherlands\" (ams1)",
      "game closed → pending changes applied",
    ],
  },
  gallery: {
    kicker: "Screenshots",
    title: "A closer look.",
    autoplay: "auto-playing · hover to pause",
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
    stormyRole: "Creator of dropship",
    stormyText: "Wrote the original app from scratch and maintains it for the whole community.",
    ryanRole: "Co-creator · Arabic edition, website & community",
    ryanText:
      "Created the Arabic edition from the ground up (right-to-left layout, Thmanyah typography, the guided tour), designed and built this website, tracked down and fixed bugs, and brought dropship to the Arabic community.",
    contributors: "Contributors on GitHub",
    website: "Website",
  },
  cta: {
    title: "Ready to choose your servers?",
    text: "Free, 9 MB, no installer. Your blocks are one click away.",
    button: "Download dropship",
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
    made: "Original app by stormy · Arabic edition, guided tour and this website by Ryan Athlawi.",
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
  announce: [
    { text: "الإصدار 3.0.6 متوفر: 9 م.ب، بدون تثبيت، وتحديثات داخل البرنامج", href: "#download" },
    { text: "النسخة العربية وصلت، بتخطيط كامل من اليمين لليسار", href: "#download" },
    { text: "شي ما يشتغل؟ ناس حقيقيين يردون عليك في الديسكورد", href: "https://discord.gg/QYrF8CVhbC" },
  ],
  nav: {
    features: "المميزات",
    how: "طريقة العمل",
    gallery: "لقطات",
    faq: "الأسئلة",
    team: "الفريق",
    try: "جرّبه",
    download: "تحميل",
    github: "GitHub",
    theme: "تبديل المظهر",
    language: "English",
    menu: "القائمة",
  },
  hero: {
    badge: "مجاني · مفتوح المصدر · ويندوز",
    title1: "العب أوفرواتش 2",
    words: ["حيث تختار أنت.", "على سيرفر السعودية.", "على سيرفر هولندا.", "على سيرفر اليابان.", "على شروطك أنت."],
    subtitle:
      "dropship برنامج محمول لاختيار السيرفرات. احظر المناطق اللي ما تبيها، ويبقيك الماتش ميكر حيث البنق أفضل. ما يلمس اللعبة أبدًا.",
    cta: "تحميل النسخة العربية",
    ctaAr: "النسخة الإنجليزية",
    ctaGit: "الكود المصدري",
    hint: "ويندوز 10 / 11 · ملف .exe واحد بدون تثبيت",
    credits: "البرنامج الأصلي من stormy · النسخة العربية والجولة التعريفية وهذا الموقع من Ryan Athlawi",
    chipAllowed: "مسموح",
    chipBlocked: "محظور",
    chipLikely: "على الأغلب بتلعب على",
    windowTitle: "dropship — النسخة العربية",
    demoTitle: "أبي ألعب على..",
    demoLikely: "على الأغلب بتلعب على",
    demoHint: "تجربة تفاعلية: اضغط على سيرفر لحظره أو السماح به",
  },
  marquee: [
    "مجاني للأبد",
    "مفتوح المصدر",
    "ملف .exe واحد بحجم 9 م.ب",
    "بدون تثبيت",
    "ما يلمس ملفات اللعبة",
    "بنق لكل سيرفر",
    "الحظر يبقى بعد الإغلاق",
    "عربي وإنجليزي",
    "تحديثات داخل البرنامج",
    "ويندوز 10 / 11",
  ],
  welcome: {
    morning: "صباح الخير",
    afternoon: "مساء الخير",
    evening: "مساء الخير",
    title: "{greeting}، حياك الله في dropship",
    text: "العب أوفرواتش 2 على السيرفرات اللي تختارها. جرّب النسخة التجريبية هنا، أو حمّل البرنامج. مجاني.",
    try: "جرّب النسخة التجريبية",
    get: "تحميل",
    close: "إغلاق",
  },
  radar: { you: "أنت", scanning: "جارٍ المسح", best: "الأفضل", servers: "سيرفرات", blocked: "محظور", hint: "اضغط على سيرفر لحظره" },
  playground: {
    kicker: "جرّبه",
    title: "البرنامج، شغّال في متصفحك.",
    subtitle:
      "نسخة طبق الأصل من نافذة dropship تشتغل هنا. احظر سيرفرات، بدّل التبويبات، غيّر المظهر واللغة، صغّرها. ما فيه شي يتثبّت ولا شي يُرسل لأي مكان.",
    tip: "الضغطة اليسرى تحظر السيرفر أو تسمح به. الضغطة اليمنى تبقي هذا السيرفر وتعكس كل الباقي، بالضبط مثل البرنامج.",
  },
  stats: {
    downloads: "تحميل",
    stars: "نجمة على GitHub",
    releases: "إصدار",
    contributors: "مساهم",
    live: "مباشر من GitHub",
    cached: "أرقام GitHub",
    chart: "التحميلات لكل إصدار، من الأقدم إلى الأحدث",
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
    logTitle: "السجل",
    log: [
      "dropship v3.0.6 · ويندوز 11",
      "اللعبة: S:\\overwatch\\_retail_\\overwatch.exe",
      "جارٍ قياس 13 سيرفر.. تم (الأفضل: netherlands، 24 ms)",
      "محظور: usa - east 2، usa - central",
      "تم تطبيق فلتر WFP. يبقى لين ترفع الحظر ✓",
      "على الأغلب بتلعب على \"netherlands\" (ams1)",
      "اللعبة أُغلقت ← تم تطبيق التغييرات المعلّقة",
    ],
  },
  gallery: {
    kicker: "لقطات",
    title: "نظرة أقرب.",
    autoplay: "تشغيل تلقائي · مرّر الماوس للإيقاف",
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
    stormyRole: "مؤسس dropship",
    stormyText: "كتب البرنامج الأصلي من الصفر ويحافظ على تشغيله للمجتمع كله.",
    ryanRole: "شريك مؤسس · النسخة العربية والموقع والمجتمع",
    ryanText:
      "أسّس النسخة العربية من الصفر (التخطيط من اليمين لليسار، خط ثمانية، الجولة التعريفية)، صمّم وبنى هذا الموقع كاملًا، اكتشف أخطاء وصلّحها، وأوصل dropship للمجتمع العربي.",
    contributors: "المساهمون على GitHub",
    website: "الموقع",
  },
  cta: {
    title: "جاهز تختار سيرفراتك؟",
    text: "مجاني، 9 م.ب، بدون تثبيت. حظرك على بُعد ضغطة واحدة.",
    button: "حمّل dropship",
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
    made: "البرنامج الأصلي من stormy · النسخة العربية والجولة التعريفية وهذا الموقع من Ryan Athlawi.",
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
