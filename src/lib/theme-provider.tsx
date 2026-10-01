import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark"

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const STORAGE_KEY = "rsp-theme"

const ThemeContext = createContext<ThemeProviderState | undefined>(undefined)

/**
 * Light is what every visit opens in. Dark is a deliberate choice that lasts
 * for that browsing session only — kept in sessionStorage, not localStorage —
 * so coming back to the site always shows the light theme. The OS preference
 * is deliberately ignored for the same reason.
 */
function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light"
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : "light"
  } catch {
    return "light"
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
    try {
      window.sessionStorage.setItem(STORAGE_KEY, theme)
      // Clear the old persisted choice so returning visitors are not stuck in
      // dark mode from before this changed.
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* private mode — the theme still applies for this page */
    }
  }, [theme])

  const setTheme = (next: Theme) => setThemeState(next)
  const toggleTheme = () =>
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"))

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider")
  return ctx
}
