'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

type ThemeContextType = {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const THEME_KEY = 'kwaisspress-theme'

/**
 * Script que se ejecuta ANTES de pintar (ver app/layout.tsx) para evitar el
 * parpadeo oscuro→claro. Está protegido con try/catch porque localStorage
 * puede estar bloqueado (modo privado, navegadores embebidos).
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${THEME_KEY}');var d=t==='light'?false:t==='system'?window.matchMedia('(prefers-color-scheme: dark)').matches:true;var c=document.documentElement.classList;c.remove('light','dark');c.add(d?'dark':'light')}catch(e){}})()`

function readStored(): Theme {
  try {
    const v = localStorage.getItem(THEME_KEY)
    if (v === 'light' || v === 'dark' || v === 'system') return v
  } catch {
    /* almacenamiento no disponible */
  }
  return 'dark'
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark')

  // Lee la preferencia guardada tras montar (evita desajustes de hidratación)
  useEffect(() => {
    setThemeState(readStored())
  }, [])

  useEffect(() => {
    const root = document.documentElement

    const apply = (t: 'light' | 'dark') => {
      root.classList.remove('light', 'dark')
      root.classList.add(t)
      setResolvedTheme(t)
    }

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      apply(mq.matches ? 'dark' : 'light')
      const handler = (e: MediaQueryListEvent) => apply(e.matches ? 'dark' : 'light')
      // addEventListener no existe en Safari < 14
      if (mq.addEventListener) {
        mq.addEventListener('change', handler)
        return () => mq.removeEventListener('change', handler)
      }
      mq.addListener(handler)
      return () => mq.removeListener(handler)
    }

    apply(theme)
  }, [theme])

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
    try {
      localStorage.setItem(THEME_KEY, t)
    } catch {
      /* ignorar */
    }
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider')
  }
  return context
}
