import { useCallback, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

function systemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    const attr = document.documentElement.dataset.theme
    // reading the DOM after hydration; initial render must match the prerendered HTML
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(attr === 'light' || attr === 'dark' ? attr : systemTheme())
  }, [])

  const toggle = useCallback(() => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    setTheme(next)
    try {
      localStorage.setItem('theme', next)
    } catch {
      // storage unavailable; the choice just won't persist
    }
  }, [theme])

  return [theme, toggle]
}
