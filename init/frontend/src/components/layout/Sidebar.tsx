import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, PanelLeftOpen, PanelLeftClose, X, School } from 'lucide-react'

const items = [
  { key: 'dashboard', label: 'Tổng quan', href: '/admin', icon: LayoutDashboard },
  { key: 'users', label: 'Tài khoản', href: '/admin/users', icon: Users },
  { key: 'teachers', label: 'Lớp học', href: '/admin/teachers', icon: School },
]
type SidebarContentProps = {
  expanded: boolean
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>
}

const SidebarContent: React.FC<SidebarContentProps> = ({ expanded, setExpanded }) => {
  const location = useLocation()
  const isActive = (href: string) => {
    if (href === '/admin') return location.pathname === '/admin'
    return location.pathname.startsWith(href)
  }

  return (
    <>
      <div className="h-16 flex items-center justify-center">
        <img src="/favicon.ico" alt="Logo" className="h-10 w-10" />
        {expanded && (
          <span className="ml-2 text-lg font-semibold text-gray-800 dark:text-gray-200">Admin</span>
        )}
      </div>
      <nav className="flex-1 px-2 py-4">
        <ul className="space-y-1.5 flex flex-col items-center xl:items-stretch">
          {items.map((it) => {
            const Icon = it.icon as any
            const active = isActive(it.href)
            return (
              <li key={it.key} className="w-full">
                <a
                  href={it.href}
                  className={`group flex items-center gap-3 px-3 py-3 rounded-md transition-colors ${expanded ? 'justify-start' : 'justify-center'} ${active ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
                >
                  <Icon className={`h-5 w-5 ${active ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                  {expanded && <span className={`ml-1 ${active ? 'font-medium' : ''}`}>{it.label}</span>}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>
      <div className="py-2 px-2 border-t dark:border-gray-800">
        <button onClick={() => setExpanded((v) => !v)} aria-label="Toggle sidebar" className={`group w-full flex items-center gap-3 px-3 py-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 ${expanded ? 'justify-start' : 'justify-center'}`}>
          {expanded ? (<PanelLeftClose className="h-5 w-5 text-gray-600 dark:text-gray-300" />) : (<PanelLeftOpen className="h-5 w-5 text-gray-600 dark:text-gray-300" />)}
          {expanded && <span className="ml-1 text-gray-800 dark:text-gray-200">Thu gọn</span>}
        </button>
      </div>
    </>
  )
}

const Sidebar: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState(true)

  return (
    <aside>
      {/* Mobile: toggle button - always visible */}
      <button 
        className="fixed z-40 left-2 top-2 lg:hidden p-2 rounded-lg bg-white dark:bg-gray-900 shadow-md border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800" 
        onClick={() => setOpen(!open)} 
        aria-label="Toggle sidebar"
      >
        {open ? (
          <X className="h-5 w-5 text-gray-800 dark:text-gray-200" />
        ) : (
          <PanelLeftOpen className="h-5 w-5 text-gray-800 dark:text-gray-200" />
        )}
      </button>

      {/* Mobile: overlay backdrop */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden" 
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile: sidebar drawer */}
      <div className={`fixed flex flex-col lg:hidden inset-y-0 left-0 z-30 w-64 transform bg-white dark:bg-gray-900 border-r dark:border-gray-800 transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : '-translate-x-full'} h-screen shadow-xl`}>
        <SidebarContent expanded={true} setExpanded={setExpanded} />
      </div>

      {/* Desktop sidebar */}
      <div className={`hidden lg:flex lg:flex-col bg-white dark:bg-gray-900 border-r dark:border-gray-800 ${expanded ? 'w-48' : 'w-16'} h-screen transition-all duration-200`}>
        <SidebarContent expanded={expanded} setExpanded={setExpanded} />
      </div>
    </aside>
  )
}

export default Sidebar

