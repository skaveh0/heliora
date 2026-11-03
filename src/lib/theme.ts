export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'heliora-theme';

export const parseTheme = (value: unknown): Theme | null =>
  value === 'light' || value === 'dark' ? value : null;

export const oppositeTheme = (theme: Theme): Theme => (theme === 'dark' ? 'light' : 'dark');

// Storage is passed as a getter because merely reading window.localStorage can throw when blocked.
export function readStoredTheme(getStorage: () => Pick<Storage, 'getItem'>): Theme | null {
  try {
    return parseTheme(getStorage().getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

export function writeStoredTheme(getStorage: () => Pick<Storage, 'setItem'>, theme: Theme): void {
  try {
    getStorage().setItem(STORAGE_KEY, theme);
  } catch {
    // The choice still applies for this page view.
  }
}
