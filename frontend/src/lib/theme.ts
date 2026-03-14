export type ThemeMode = "light" | "dark";

const STORAGE_KEY = "borderbridge.theme";

export function getStoredTheme(): ThemeMode {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  return saved === "dark" ? "dark" : "light";
}

export function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  root.classList.toggle("dark", mode === "dark");
  document.body.classList.toggle("dark", mode === "dark");
  if (mode === "dark") {
    document.body.style.backgroundColor = "#030712";
  } else {
    document.body.style.backgroundColor = "#f8fafc";
  }
  window.localStorage.setItem(STORAGE_KEY, mode);
}
