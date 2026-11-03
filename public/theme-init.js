// Applies a saved theme before first paint. A separate file because the CSP forbids inline scripts.
try {
  var theme = localStorage.getItem('heliora-theme');
  if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme;
} catch (e) {
  // Storage is blocked: fall back to prefers-color-scheme.
}
