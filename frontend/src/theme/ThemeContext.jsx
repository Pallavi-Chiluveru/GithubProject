import { createContext, useContext, useEffect, useMemo, useState } from "react";

export const defaultAppearance = {
  theme: "light",
  fontSize: "medium",
};

const ThemeContext = createContext(null);

function readStoredAppearance() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return {
      theme: user.appearance?.theme || defaultAppearance.theme,
      fontSize: user.appearance?.fontSize || defaultAppearance.fontSize,
    };
  } catch {
    return defaultAppearance;
  }
}

function applyDocumentAppearance(appearance) {
  const root = document.documentElement;

  if (appearance.theme === "dark") {
    root.classList.add("dark-theme");
    root.classList.add("dark");
  } else {
    root.classList.remove("dark-theme");
    root.classList.remove("dark");
  }

  const sizeMap = { small: "14px", medium: "16px", large: "18px" };
  root.style.fontSize = sizeMap[appearance.fontSize] || "16px";
}

function persistAppearance(appearance) {
  try {
    const rawUser = localStorage.getItem("user");
    if (!rawUser) return;

    const user = JSON.parse(rawUser || "{}");
    if (!user || Object.keys(user).length === 0) return;

    const updatedUser = {
      ...user,
      appearance,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));
  } catch {
    // Ignore persistence failures and keep the in-memory theme state.
  }
}

export function ThemeProvider({ children }) {
  const [appearance, setAppearanceState] = useState(() => readStoredAppearance());

  useEffect(() => {
    applyDocumentAppearance(appearance);
    persistAppearance(appearance);
  }, [appearance]);

  useEffect(() => {
    const onStorage = () => setAppearanceState(readStoredAppearance());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo(() => ({
    appearance,
    theme: appearance.theme,
    fontSize: appearance.fontSize,
    setAppearance: setAppearanceState,
    setTheme: (theme) => setAppearanceState((current) => ({ ...current, theme })),
    setFontSize: (fontSize) => setAppearanceState((current) => ({ ...current, fontSize })),
  }), [appearance]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}