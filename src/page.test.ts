import { describe, expect, it } from 'vitest';
import html from '../index.html?raw';
import { LOCATIONS } from './data/locations';
import { SPEC_ROWS } from './data/spec-rows';
import { DEFAULT_VARIANT_ID, VARIANTS } from './data/variants';
import { buildChartModel } from './lib/chart';
import { formatInteger } from './lib/numbers';
import { calculateYield } from './lib/yield';
import thisFile from './page.test.ts?raw';

const sources = import.meta.glob<string>('./**/*.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
});

function jsonLd(): string {
  const contents = /<script type="application\/ld\+json">([^<]*)<\/script>/.exec(html)?.[1];
  if (contents === undefined) throw new Error('No JSON-LD block in index.html');
  return contents;
}

describe('static page matches the data module', () => {
  const variant = VARIANTS[DEFAULT_VARIANT_ID];

  it('pre-renders the default variant in the specification table', () => {
    for (const row of SPEC_ROWS) {
      expect(html).toContain(`<tr><th scope="row">${row.label}</th><td>${row.value(variant)}</td></tr>`);
    }
  });

  it('pre-renders the default yield figures and chart', () => {
    const result = calculateYield({
      variant,
      location: LOCATIONS.tehran,
      moduleCount: 100,
      tiltAdjust: false,
    });
    expect(html).toContain(`<span id="yield-annual">${formatInteger(result.annualKwh)}</span>`);
    expect(html).toContain(`<span id="yield-co2">${result.co2Tonnes.toFixed(1)}</span>`);
    for (const bar of buildChartModel(result.monthlyKwh).bars) {
      expect(html).toContain(`d="${bar.path}"`);
    }
  });
});

describe('authorship', () => {
  it('states the real number of unit tests', () => {
    // import.meta.glob leaves out the file calling it, so this one is added by hand.
    const testFiles = Object.entries(sources)
      .filter(([path]) => path.endsWith('.test.ts'))
      .map(([, source]) => source);
    const tests = [...testFiles, thisFile].flatMap((source) => source.match(/^\s*it\(/gm) ?? []);
    expect(html).toContain(`<td>${tests.length} unit tests</td>`);
  });

  it('names the author as creator in the JSON-LD', () => {
    expect(JSON.parse(jsonLd())).toMatchObject({
      '@type': 'CreativeWork',
      creator: { '@type': 'Person', name: 'Soroush Kaveh', url: 'https://github.com/skaveh0' },
    });
  });

  it('keeps the credit apart from the fictional-brand disclaimer', () => {
    const disclaimer =
      '<p>Heliora is a fictional brand. All specifications are fictional and nothing is copied from a real manufacturer.</p>';
    expect(html).toContain(disclaimer);
    expect(html.indexOf('site-footer__credit')).toBeGreaterThan(html.indexOf(disclaimer));
    expect(disclaimer).not.toContain('Soroush');
  });
});

describe('security rules of the markup', () => {
  it('delivers the required Content Security Policy before any script or stylesheet', () => {
    const policy =
      /content="default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self' 'sha256-[^']+'; form-action 'none'; base-uri 'none'"/;
    expect(html).toMatch(policy);
    const policyAt = html.indexOf('Content-Security-Policy');
    expect(policyAt).toBeGreaterThan(-1);
    expect(policyAt).toBeLessThan(html.indexOf('<script'));
    expect(policyAt).toBeLessThan(html.indexOf('<link'));
  });

  it('leaves frame-ancestors out of the meta tag, where browsers ignore it and log an error', () => {
    expect(html).not.toContain('frame-ancestors');
  });

  it('allows the JSON-LD block by a hash that matches its exact contents', async () => {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(jsonLd()));
    const hash = btoa(String.fromCharCode(...new Uint8Array(digest)));
    expect(html).toContain(`script-src 'self' 'sha256-${hash}';`);
  });

  it('has no executable inline scripts, style attributes, style blocks or event handlers', () => {
    expect(html).not.toMatch(/<script(?![^>]*\ssrc=)(?![^>]*type="application\/ld\+json")[^>]*>/);
    expect(html).not.toMatch(/\sstyle=/);
    expect(html).not.toMatch(/<style[\s>]/);
    expect(html).not.toMatch(/\son[a-z]+=/);
  });

  it('loads nothing from another origin', () => {
    const external = [...html.matchAll(/<(?:script|img|link|iframe)\b[^>]*\s(?:src|href)="(https?:[^"]*)"/g)]
      .map((match) => match[1])
      .filter((url) => !url?.startsWith('https://skaveh0.github.io/heliora/'));
    expect(external).toEqual([]);
  });

  it('sets noopener noreferrer on every link that opens a new tab', () => {
    const links = [...html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)];
    expect(links.length).toBeGreaterThan(0);
    for (const [link] of links) expect(link).toContain('rel="noopener noreferrer"');
  });
});

describe('security rules of the source', () => {
  it('uses no HTML-parsing DOM sinks or dynamic code execution', () => {
    const forbidden =
      /\.innerHTML|\.outerHTML|insertAdjacentHTML|document\.write|\beval\(|new Function|setTimeout\(\s*['"`]/;
    const files = Object.entries(sources).filter(([path]) => !path.endsWith('.test.ts'));
    expect(files.length).toBeGreaterThan(10);
    for (const [path, source] of files) expect(source, path).not.toMatch(forbidden);
  });
});
