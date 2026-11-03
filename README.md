# Heliora

A single-page product site for Heliora, a fictional solar panel manufacturer, built with vanilla TypeScript and no production dependencies.

**Live demo:** <https://skaveh0.github.io/heliora/>

**Screenshot:** _add after the first deploy_

> **This is a demo project.** Heliora is a fictional brand and all specifications are fictional. Nothing is copied from a real manufacturer. The quote form validates your entries and shows a confirmation, but it sends nothing anywhere.

## Why these choices

**No framework.** The page has one screen and a small amount of state: a selected module and a frame finish. A framework would add more code than the problem needs. Without one, the production JavaScript is about 5 KB gzipped, and all content is in the HTML before any script runs.

**How state flows.** There is one store holding `{ model, finish }`.

1. A radio button, the URL or back/forward navigation calls `store.set`.
2. Each UI module subscribes and updates its own part of the page.
3. The URL module writes the query string with `history.replaceState`.

The module and finish also become attributes on `<html>`. The stylesheet uses them to pick the visible render and frame colour, so those transitions are CSS only. Inputs that nothing else depends on, such as the calculator's location or the compare switch, stay in their own form controls.

**Why logic is separate from the DOM.** The code is split into three layers:

| Folder | Holds | Touches the DOM? |
|---|---|---|
| `src/data/` | Variants, locations, constants | No |
| `src/lib/` | Yield maths, URL parsing, validation, chart geometry, datasheet text | No |
| `src/ui/` | Reading inputs and writing to the page | Yes |

Everything in `lib/` can be tested directly without a browser or a DOM library. Untrusted input also has a single place to pass through: `lib/` validates it, and `ui/` only ever receives clean values.

**Product renders.** The panels are hand-written inline SVG with geometry in real millimetres, so all three modules appear at true relative scale. Cell counts match the specification: 144 half-cut cells as 6 strings of 24, and 132 as 6 strings of 22.

## Features

- Three module variants with live-updating render, headline specs, spec table, calculator and quote form
- Silver or black frame finish, shown on every render
- Shareable URL state (`?model=HL-650B&finish=black`), with back/forward support
- Full specification table with a side-by-side comparison of all three modules
- Yield calculator with annual kWh, CO₂ estimate and a hand-written SVG monthly chart
- Plain-text datasheet generated in the browser
- Quote form with inline validation
- Dark and light themes that follow the system setting, with a saved override
- Responsive from 360 px to 1920 px
- Keyboard accessible, with support for screen readers, reduced motion and forced colours

### Calculator assumptions

The peak sun hours, the 0.80 system derate and the ×1.08 bifacial factor are part of the project's fictional data. Two further values are illustrative assumptions, labelled as such on the page, and can be changed in [`src/data/locations.ts`](src/data/locations.ts):

- Tilt adjustment: ×1.05
- Grid CO₂ displaced: 0.5 kg per kWh

## Local development

Requires Node.js 22.12 or later (see `engines` in `package.json`).

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run build
```

```bash
npm run preview
```

## Testing and security checks

Run the checks that CI runs:

```bash
npm run typecheck
```

```bash
npm test
```

Check dependencies for known vulnerabilities:

```bash
npm audit
```

The test suite covers yield maths, URL parsing, form validation and variant lookup. It includes malicious input such as `?model=<script>alert(1)</script>`, `?finish=javascript:alert(1)` and quantities of `-1`, `1e308` and `abc`. It also checks these security rules, so breaking one fails CI:

- The Content Security Policy is present and comes before any script or stylesheet.
- The page has no inline scripts, styles or event handlers, and loads nothing from another origin.
- Links that open a new tab set `rel="noopener noreferrer"`.
- The source uses no HTML-parsing DOM sinks and no dynamic code execution.

To check the CSP by hand, run `npm run build && npm run preview`, open the page and confirm the browser console is empty while you use it.

[SECURITY.md](SECURITY.md) has the full review: what was checked, the residual risks and what a production deployment would add.

### Lighthouse

Measured with Lighthouse 13.6 on the production build served locally:

| | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| Mobile | 100 | 100 | 100 | 100 |
| Desktop | 100 | 100 | 100 | 100 |

## Deployment

Every push to `main` runs the typecheck, tests and build, then deploys to GitHub Pages.

1. Create a GitHub repository.
2. In the repository, go to **Settings > Pages** and set **Source** to **GitHub Actions**. Do this before the first push, or the first run fails and has to be re-run.
3. If the repository is not named `heliora`, or you use a custom domain, update the canonical and `og:url` tags in `index.html` and the matching URL in `src/page.test.ts`.
4. Push this code to `main`.

**Base path.** The workflow builds for `/<repo-name>/` automatically. For a root domain, set the repository variable `BASE_PATH` to `/`.

To build for a project page locally:

```bash
BASE_PATH=/heliora/ npm run build
```

In Git Bash on Windows, put `MSYS_NO_PATHCONV=1` before that command, or Git Bash rewrites the path.

### Security headers

GitHub Pages cannot set custom HTTP headers, which is why the Content Security Policy is delivered through a `<meta>` tag. A production host should send these as headers:

- `Strict-Transport-Security` (HSTS), which GitHub Pages already sends but another host may not
- `X-Content-Type-Options`
- `Referrer-Policy`
- `Content-Security-Policy` with `frame-ancestors`, which browsers ignore in a `<meta>` tag

## Possible extensions

These were deliberately not built, to keep the project to one finished page:

- A real PDF datasheet (the current download is honestly labelled `.txt`)
- A working quote form with a backend, spam protection and server-side validation
- An `og:image` for link previews
- Comparing only two chosen modules, or highlighting the rows that differ
- More locations, or a calculator based on real irradiance data
- Saving the compare switch and calculator inputs in the URL
- Multiple languages, including right-to-left layouts
