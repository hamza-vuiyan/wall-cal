import { useState, useEffect, useCallback } from 'react'

export type ThemePreference = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'wallcal-theme'
const LIGHT_META = '#f5f0ea' // warm parchment bg colour
const DARK_META = '#23242b' // charcoal bg colour

function resolveTheme(pref: ThemePreference): 'light' | 'dark' {
  if (pref === 'system')
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  return pref
}

function applyTheme(resolved: 'light' | 'dark') {
  document.documentElement.setAttribute('data-theme', resolved)
  const meta = document.getElementById('theme-color-meta') as HTMLMetaElement | null
  if (meta) meta.content = resolved === 'light' ? LIGHT_META : DARK_META
}

export function useTheme() {
  const [preference, setPreference] = useState<ThemePreference>(
    () => (localStorage.getItem(STORAGE_KEY) as ThemePreference) || 'system',
  )

  const setTheme = useCallback((pref: ThemePreference) => {
    setPreference(pref)
    localStorage.setItem(STORAGE_KEY, pref)
    applyTheme(resolveTheme(pref))
  }, [])

  // Listen for OS-level changes when in System mode
  useEffect(() => {
    if (preference !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const handler = () => applyTheme(resolveTheme('system'))
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [preference])

  return { preference, setTheme }
}
