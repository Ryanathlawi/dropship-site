import { useEffect, useState } from "react";

export const LINKS = {
  upstream: "https://github.com/stowmyy/dropship",
  upstreamReleases: "https://github.com/stowmyy/dropship/releases",
  upstreamIssues: "https://github.com/stowmyy/dropship/issues",
  ar: "https://github.com/Ryanathlawi/dropship-ar",
  arReleases: "https://github.com/Ryanathlawi/dropship-ar/releases",
  site: "https://github.com/Ryanathlawi/dropship-site",
  discord: "https://discord.gg/QYrF8CVhbC",
  stormy: "https://github.com/stowmyy",
  stormyX: "https://x.com/stormyy_ow",
  stormySite: "https://stormy.gg",
  ryan: "https://github.com/Ryanathlawi",
  ryanSite: "https://athlawi.vercel.app/",
};

export type Asset = { name: string; size: number; downloads: number; url: string };
export type Release = { version: string; publishedAt: string; assets: Asset[] };
export type Contributor = { login: string; avatar: string; url: string; contributions: number };

export type Stats = {
  downloads: number; // .exe downloads across every release of both repos
  stars: number;
  releases: number;
  contributors: Contributor[];
  latest: Release;
  latestAr: Release;
  perRelease: { v: string; n: number }[]; // .exe downloads of the last 24 upstream releases, oldest first
};

// snapshot from 2026-09-19, shown until the live numbers arrive (or if the api rate limit hits)
export const FALLBACK: Stats = {
  downloads: 139240,
  stars: 171,
  releases: 107,
  contributors: [
    { login: "stowmyy", avatar: "https://avatars.githubusercontent.com/u/120167078?v=4", url: LINKS.stormy, contributions: 353 },
    { login: "Ryanathlawi", avatar: "https://github.com/Ryanathlawi.png", url: LINKS.ryan, contributions: 8 },
  ],
  latest: {
    version: "v3.0.6",
    publishedAt: "2026-08-20T00:45:45Z",
    assets: [
      { name: "dropship.exe", size: 9656832, downloads: 22391, url: "https://github.com/stowmyy/dropship/releases/download/v3.0.6/dropship.exe" },
    ],
  },
  latestAr: {
    version: "v3.0.8",
    publishedAt: "2026-09-19T02:07:54Z",
    assets: [
      { name: "dropship-ar.exe", size: 9829376, downloads: 1, url: "https://github.com/Ryanathlawi/dropship-ar/releases/download/v3.0.8/dropship-ar.exe" },
      { name: "dropship-ar-animated.exe", size: 9835520, downloads: 4, url: "https://github.com/Ryanathlawi/dropship-ar/releases/download/v3.0.8/dropship-ar-animated.exe" },
    ],
  },
  perRelease: [
    { v: "v112", n: 7 }, { v: "v113", n: 260 }, { v: "v114", n: 32 }, { v: "v115", n: 355 }, { v: "v116", n: 393 }, { v: "v117", n: 34 },
    { v: "v118", n: 15 }, { v: "v119", n: 147 }, { v: "v120", n: 322 }, { v: "v121", n: 2515 }, { v: "v122", n: 5085 }, { v: "v123", n: 4410 },
    { v: "v124", n: 11972 }, { v: "v126", n: 9162 }, { v: "v128", n: 12772 }, { v: "v129", n: 23737 }, { v: "v2.0", n: 27672 }, { v: "v3.0.0", n: 1416 },
    { v: "v3.0.1", n: 86 }, { v: "v3.0.2", n: 413 }, { v: "v3.0.3", n: 422 }, { v: "v3.0.4", n: 335 }, { v: "v3.0.5", n: 13305 }, { v: "v3.0.6", n: 22391 },
  ],
};

const API = "https://api.github.com/repos/";
const CACHE_KEY = "ds-stats-v2";
const CACHE_TTL = 15 * 60 * 1000;

type GhRelease = { tag_name: string; published_at: string; draft: boolean; prerelease: boolean; assets: { name: string; size: number; download_count: number; browser_download_url: string }[] };
type GhContributor = { login: string; avatar_url: string; html_url: string; contributions: number; type: string };

async function get<T>(path: string): Promise<T> {
  const res = await fetch(API + path, { headers: { Accept: "application/vnd.github+json" } });
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.json();
}

async function releases(repo: string): Promise<GhRelease[]> {
  const pages = await Promise.all([1, 2].map((p) => get<GhRelease[]>(`${repo}/releases?per_page=100&page=${p}`)));
  return pages.flat().filter((r) => !r.draft && !r.prerelease);
}

const toRelease = (r: GhRelease): Release => ({
  version: r.tag_name,
  publishedAt: r.published_at,
  assets: r.assets.map((a) => ({ name: a.name, size: a.size, downloads: a.download_count, url: a.browser_download_url })),
});

const exeDownloads = (rs: GhRelease[]) =>
  rs.flatMap((r) => r.assets).filter((a) => a.name.endsWith(".exe")).reduce((n, a) => n + a.download_count, 0);

async function fetchStats(): Promise<Stats> {
  const [repo, up, ar, cUp, cAr] = await Promise.all([
    get<{ stargazers_count: number }>("stowmyy/dropship"),
    releases("stowmyy/dropship"),
    releases("Ryanathlawi/dropship-ar"),
    get<GhContributor[]>("stowmyy/dropship/contributors"),
    get<GhContributor[]>("Ryanathlawi/dropship-ar/contributors"),
  ]);

  const seen = new Map<string, Contributor>();
  for (const c of [...cUp, ...cAr]) {
    if (c.type !== "User") continue;
    const prev = seen.get(c.login);
    seen.set(c.login, {
      login: c.login,
      avatar: c.avatar_url,
      url: c.html_url,
      contributions: (prev?.contributions ?? 0) + c.contributions,
    });
  }

  return {
    downloads: exeDownloads(up) + exeDownloads(ar),
    stars: repo.stargazers_count,
    releases: up.length + ar.length,
    contributors: [...seen.values()].sort((a, b) => b.contributions - a.contributions),
    latest: toRelease(up[0]),
    latestAr: toRelease(ar[0]),
    perRelease: up
      .slice(0, 24)
      .reverse()
      .map((r) => ({ v: r.tag_name, n: exeDownloads([r]) })),
  };
}

export function useStats(): { stats: Stats; live: boolean } {
  const [state, setState] = useState<{ stats: Stats; live: boolean }>({ stats: FALLBACK, live: false });

  useEffect(() => {
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) ?? "null") as { at: number; stats: Stats } | null;
      if (cached && Date.now() - cached.at < CACHE_TTL) {
        setState({ stats: cached.stats, live: true });
        return;
      }
    } catch {
      /* ignore */
    }
    let cancelled = false;
    fetchStats()
      .then((stats) => {
        if (cancelled) return;
        setState({ stats, live: true });
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), stats }));
        } catch {
          /* ignore */
        }
      })
      .catch(() => {
        /* keep the snapshot */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

export const asset = (r: Release, name: string) => r.assets.find((a) => a.name === name);
export const mb = (bytes: number) => `${(bytes / 1_048_576).toFixed(1)} MB`;
export const num = (n: number) => new Intl.NumberFormat("en-US").format(n);
