import React from 'react'
import { useTheme } from '../../contexts/Theme'
import { IconButton } from './IconButton'
import { Sun, Moon, Monitor } from 'lucide-react'

const THEME_LABELS: Record<string, string> = {
  light: 'Sáng',
  dark: 'Tối',
  system: 'Hệ thống',
}

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme()
  const next = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark'
  const label = `Chế độ: ${THEME_LABELS[theme] || theme}`

  return (
    <IconButton
      aria-label={label}
      title={label}
      onClick={() => setTheme(next)}
      icon={theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor}
    />
  )
}

export default ThemeToggle
