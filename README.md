# dropship website

Marketing site for [dropship](https://github.com/stowmyy/dropship), the Overwatch 2 server selector by [stormy](https://github.com/stowmyy). English and Arabic, dark and light.

Live: https://ryanathlawi.github.io/dropship-site/

- `?lang=ar` / `?lang=en` and `?theme=light` / `?theme=dark` pick the language and theme (otherwise the visitor's system settings).
- Download counts, stars, releases and contributors are read live from the GitHub API in the browser (cached for 15 minutes), with a snapshot as fallback.

## develop

```bash
npm install
npm run dev
```

`npm run build` writes `dist/`. Deployed to GitHub Pages by `.github/workflows/pages.yml` on every push to `main`. Set `BASE_PATH=/` when building for a custom domain.

## credits

dropship itself is stormy's work. The Arabic localization and this site are by [Ryan Athlawi](https://github.com/Ryanathlawi). Not affiliated with Blizzard Entertainment.
