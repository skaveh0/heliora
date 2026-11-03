import { describe, expect, it } from 'vitest';
import html from '../index.html?raw';
import { LOCATIONS } from './data/locations';
import { SPEC_ROWS } from './data/spec-rows';
import { DEFAULT_VARIANT_ID, VARIANTS } from './data/variants';
import { buildChartModel } from './lib/chart';
import { formatInteger } from './lib/numbers';
import { calculateYield } from './lib/yield';

const sources = import.meta.glob<string>('./**/*.ts', {
  query: '?raw',
  import: 'default',
  eager: true,
});

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

describe('security rules of the markup', () => {
  it('delivers the required Content Security Policy before any script or stylesheet', () => {
    const policy =
      "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; " +
      "form-action 'none'; base-uri 'none'";
    expect(html).toContain(`content="${policy}"`);
    const policyAt = html.indexOf('Content-Security-Policy');
    expect(policyAt).toBeGreaterThan(-1);
    expect(policyAt).toBeLessThan(html.indexOf('<script'));
    expect(policyAt).toBeLessThan(html.indexOf('<link'));
  });

  it('leaves frame-ancestors out of the meta tag, where browsers ignore it and log an error', () => {
    expect(html).not.toContain('frame-ancestors');
  });

  it('has no inline scripts, style attributes, style blocks or event handlers', () => {
    expect(html).not.toMatch(/<script(?![^>]*\ssrc=)[^>]*>/);
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
