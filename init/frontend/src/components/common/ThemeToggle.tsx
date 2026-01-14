import React from 'react'
import { useTheme } from '../../contexts/Theme'
import { IconButton } from './IconButton'
import { Sun, Moon, Monitor } from 'lucide-react'

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme()
  const next = theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark'
  const label = `Toggle theme (current: ${theme})`

  return (
    <IconButton
      aria-label={label}
      onClick={() => setTheme(next)}
      icon={theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor}
    />
  )
}

export default ThemeToggle
