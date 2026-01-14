import React from 'react'
import ThemeToggle from '../common/ThemeToggle'
import User from './User'

type TopbarProps = {
  className?: string
}

const Topbar: React.FC<TopbarProps> = ({ className = '' }) => {
  return (
    <header className="w-full border-b bg-white dark:bg-gray-900 dark:border-gray-800 shrink-0">
      <div className={`${className} mx-auto px-3 sm:px-4 py-2 flex items-center justify-end gap-2`}>
        <ThemeToggle />
        <User />
      </div>
    </header>
  )
}

export default Topbar
