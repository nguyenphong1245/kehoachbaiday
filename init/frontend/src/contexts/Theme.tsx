import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getStoredAuthUser } from '@/utils/authStorage'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextValue {
  theme: Theme
  setTheme: (t: Theme) => void
  syncThemeFromUser: () => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'system',
  setTheme: () => {},
  syncThemeFromUser: () => {},
})

export const ThemeProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'system'
    
    // Ưu tiên: Lấy theme từ user đã lưu trong localStorage (auth_user)
    const storedUser = getStoredAuthUser()
    if (storedUser?.settings?.theme) {
      const userTheme = storedUser.settings.theme as Theme
      // Đồng bộ với localStorage theme
      localStorage.setItem('theme', userTheme)
      return userTheme
    }
    
    // Fallback: Lấy từ localStorage theme
    return (localStorage.getItem('theme') as Theme) || 'system'
  })

  // Hàm sync theme từ user settings (gọi sau khi login hoặc load user)
  const syncThemeFromUser = useCallback(() => {
    const storedUser = getStoredAuthUser()
    if (storedUser?.settings?.theme) {
      const userTheme = storedUser.settings.theme as Theme
      setThemeState(userTheme)
      localStorage.setItem('theme', userTheme)
    }
  }, [])

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('theme', newTheme)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    const resolved = theme === 'system' 
      ? (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') 
      : theme
    
    if (resolved === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  // Lắng nghe thay đổi system theme nếu đang dùng 'system'
  useEffect(() => {
    if (theme !== 'system') return
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      const root = document.documentElement
      if (mediaQuery.matches) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, syncThemeFromUser }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)

export default ThemeProvider
