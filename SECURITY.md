# Security review

Heliora is a static demo page: no backend, no database, no authentication, no cookies, no network
requests after load. That keeps the threat surface narrow. What is left is untrusted input from the
URL, `localStorage` and form fields, plus the build's supply chain. This file records what was
checked, how, and what a real deployment would still need.

Reviewed against the production build served by `vite preview`, in Chrome.

## Summary

| # | Area | Result |
|---|---|---|
| 1 | DOM XSS | Pass |
| 2 | URL parameter handling | Pass |
| 3 | Content Security Policy | Pass, with one deliberate deviation (see Finding 1) |
| 4 | Blob download | Pass |
| 5 | `localStorage` | Pass |
| 6 | External links | Pass |
| 7 | Supply chain | Pass |
| 8 | HTTP headers | Custom headers not possible on GitHub Pages (see Residual risks) |
| 9 | Repo hygiene | Pass |

## What was checked

### 1. DOM XSS

- Listed every DOM write in `src/`. All text goes through `textContent`. Attribute writes use constants
  or computed numbers: `aria-invalid`, chart geometry and the `aria-label` built from an allowlisted
  theme.
- No `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `document.write`, `eval`, `new Function` or
  string-argument `setTimeout` anywhere. A test scans all non-test source for these
  (`src/page.test.ts`), so reintroducing one fails CI.
- The only user-entered text ever displayed is the quantity and company in the quote confirmation, set
  with `textContent`. Submitting `<img src=x onerror=alert(1)>` as the company showed it as literal text,
  with no element created.
- Validation messages are fixed strings and never echo input (tested).

### 2. URL parameter handling

- `model` and `finish` are checked by array membership against allowlists in `src/lib/selection.ts`.
  Membership rather than `key in VARIANTS`, which would accept `constructor` or `__proto__`.
- Anything else falls back silently to the default, and the rejected value is overwritten in the address
  bar. No raw parameter is written to the DOM.
- Module count and quantity go through `parseBoundedInteger`, which accepts plain digits only and then
  checks the range. This rejects `NaN`, `Infinity`, negatives, decimals, hex, exponent forms and oversized
  values.
- Tested with: `?model=<script>alert(1)</script>` (raw and percent-encoded), `?finish=javascript:alert(1)`,
  prototype keys, wrong case, padding, partial ids, duplicated parameters, and quantities `-1`, `1e308`
  and `abc`. The script and prototype-key cases were also run against the live page.

### 3. Content Security Policy

Delivered with `<meta http-equiv>` as the first element after the charset:

```
default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self' 'sha256-ySThJkFwTCSFjQGrmNtSl0ofmPwJktK5gaFegge4UXI='; form-action 'none'; base-uri 'none'
```

- The page has no executable inline scripts, style attributes, style blocks or inline event handlers
  (tested). Runtime styling is done with data attributes and classes.
- The only inline `<script>` is the JSON-LD metadata block. Browsers do not execute it, and in testing it
  caused no violation even without an allowance. Its hash is in `script-src` anyway, as an explicit
  record of the one inline block that is expected. A test fails if the two drift apart. Editing the block
  means updating the hash.
- The script that applies a saved theme before first paint is an external file
  (`public/theme-init.js`) because inline scripts are not allowed.
- A `securitypolicyviolation` listener recorded zero violations on the production build while using the
  variant, finish, compare, theme, calculator, download and quote form controls. The dev server also
  loads and connects with zero violations.
- `form-action 'none'` is safe because both forms handle `submit` in script and call `preventDefault`.
  The URL did not change on submit.

### 4. Blob download

- The datasheet is built only from the data module and an allowlisted finish
  (`src/lib/datasheet.ts`). No user input reaches it, so there is nothing to escape.
- The filename comes from the allowlisted variant id.
- The object URL is revoked after use (confirmed by instrumenting `URL.revokeObjectURL`).

### 5. `localStorage`

- Used for one key, the theme choice. All access is inside `try/catch`, including reading
  `window.localStorage` itself, which can throw when storage is blocked.
- The value read back must be exactly `light` or `dark`, in both `src/lib/theme.ts` and
  `public/theme-init.js`. A planted `<img src=x onerror=alert(1)>` was ignored on the live page.
- A blocked store falls back to `prefers-color-scheme` (tested).

### 6. External links

The two `target="_blank"` links, both in the footer credit, have `rel="noopener noreferrer"`. A test enforces
this for any link added later. A test also checks that no script, stylesheet, image or iframe
loads from another origin.

### 7. Supply chain

- `npm audit`: 0 vulnerabilities.
- Production dependencies: none. Dev dependencies: `vite`, `typescript`, `vitest` only.
- `package-lock.json` is committed.
- `.github/dependabot.yml` covers npm and GitHub Actions.
- GitHub Actions are pinned to commit SHAs, and the workflow's token defaults to read-only. Only the deploy
  job can write to Pages.
- No CDN scripts. If that ever changes, Subresource Integrity is mandatory.

### 8. Headers

GitHub Pages cannot set custom HTTP headers, which is why the CSP is delivered by meta tag. Checked on the
live site: GitHub Pages sends `Strict-Transport-Security`, but not `Content-Security-Policy`,
`X-Content-Type-Options`, `Referrer-Policy` or `X-Frame-Options`. See "What a production deployment would
add".

### 9. Repo hygiene

- Searched tracked files for API keys, passwords, tokens and private key markers. The only hit was the
  filename `tokens.css`, which holds design tokens.
- No `.env` files exist. `.gitignore` covers `node_modules`, `dist` and `.env*` (confirmed with
  `git check-ignore`).

## Findings

### Finding 1: `frame-ancestors` removed from the meta CSP

The original brief for this project listed `frame-ancestors 'none'` in the meta tag. Browsers ignore this
directive in a meta tag, as the CSP specification requires, so it gave no protection. Chrome also logged
a console error about it, which dropped Lighthouse Best Practices from 100 to 96.

It was removed from the meta tag and moved to the production header list below. A test keeps it out.

**Effect:** none on actual protection, since the directive never worked here. See the framing risk below.

## Residual risks

| Risk | Severity here | Why it is accepted |
|---|---|---|
| The page can be framed by another site. GitHub Pages can set neither `frame-ancestors` nor `X-Frame-Options`. | Low | There is no login, session or sensitive action to hijack. |
| No `X-Content-Type-Options` or `Referrer-Policy`. | Low | GitHub Pages controls these. It serves HTTPS and sends HSTS, and the page sends no personal data. |
| Validation is client-side only. | None in this demo | Nothing is submitted, so there is no server to protect. It would be serious with a real backend. |
| Dev tooling could be compromised at build time. | Low | Lockfile, `npm ci` in CI and Dependabot reduce this but cannot remove it. |
| Unrelated query parameters stay in the address bar. | Very low | Only `model` and `finish` are ever read. Others are never parsed or rendered. |
| The CSP allows same-origin scripts, so a compromised origin could serve hostile code. | Low | Any site that trusts its own origin shares this. |

## What a production deployment would add

**HTTP headers**

```
Content-Security-Policy: default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self' 'sha256-ySThJkFwTCSFjQGrmNtSl0ofmPwJktK5gaFegge4UXI='; form-action 'self'; base-uri 'none'; frame-ancestors 'none'
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

`form-action` would need to allow the real endpoint once the form submits somewhere.

**For a real quote form**

- Repeat all validation on the server. Client checks are a convenience, not a control.
- Add CSRF protection, rate limiting and spam filtering.
- Treat form contents as untrusted wherever they end up, such as email templates or a CRM.
- Publish a privacy notice covering the personal data collected, and set a retention period.

**Further hardening**

- Add `require-trusted-types-for 'script'` to the CSP.
- Use CSP reporting to catch violations in the field.
