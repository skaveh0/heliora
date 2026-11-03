import { oppositeTheme, parseTheme, readStoredTheme, writeStoredTheme, type Theme } from '../lib/theme';
import { byId } from './dom';

const THEME_COLORS: Readonly<Record<Theme, string>> = { light: '#f6f3ec', dark: '#12110e' };

const getStorage = (): Storage => window.localStorage;

export function initThemeToggle(): void {
  const root = document.documentElement;
  const toggle = byId('theme-toggle', HTMLButtonElement);
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

  const override = (): Theme | null => parseTheme(root.dataset.theme);
  const activeTheme = (): Theme => override() ?? (systemDark.matches ? 'dark' : 'light');

  const render = (): void => {
    const active = activeTheme();
    toggle.dataset.active = active;
    toggle.setAttribute('aria-label', `Switch to ${oppositeTheme(active)} theme`);
    if (override() === null) return;
    // An override beats the media queries on these tags, so both have to carry the chosen colour.
    for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
      meta.content = THEME_COLORS[active];
    }
  };

  const stored = readStoredTheme(getStorage);
  if (stored) root.dataset.theme = stored;
  else delete root.dataset.theme;

  toggle.addEventListener('click', () => {
    const next = oppositeTheme(activeTheme());
    root.dataset.theme = next;
    writeStoredTheme(getStorage, next);
    render();
  });
  systemDark.addEventListener('change', render);
  render();
}
