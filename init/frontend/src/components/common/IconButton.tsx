import React from 'react'

export type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: 'sm' | 'md' | 'lg'
  'aria-label': string
  icon?: React.ElementType
}

const sizes: Record<string, string> = {
  sm: 'p-1',
  md: 'p-2',
  lg: 'p-3',
}

export const IconButton: React.FC<IconButtonProps> = ({ size = 'md', className = '', children, icon: Icon, ...rest }) => {
  const cls = ['inline-flex items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-brand dark:text-gray-300 dark:hover:bg-white/5 dark:focus:ring-brand', sizes[size], className].join(' ')
  return (
    <button className={cls} {...rest}>
      {Icon ? <Icon className="h-5 w-5" /> : children}
    </button>
  )
}

export default IconButton
