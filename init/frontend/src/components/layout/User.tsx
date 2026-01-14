import React, { useState, useEffect, useRef } from 'react'
import { getStoredAuthUser, clearStoredAuth } from '@/utils/authStorage'
import { IconButton } from '../common/IconButton'
import { User as UserIcon, LogOut, UserRoundCog, MessageSquare, BarChart3, FileText } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { User as UserType } from '@/types/auth'

const User: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<UserType | null>(null)
  const ref = useRef<HTMLDivElement | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    setUser(getStoredAuthUser())
  }, [])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  const logout = () => {
    clearStoredAuth()
    // reload app and navigate to login
    navigate('/login')
  }

  if (!user) {
    return <Link to="/login">Login</Link>
  }

  return (
    <div className="relative" ref={ref}>
      <IconButton
        className="ml-2"
        icon={UserIcon}
        onClick={() => setOpen((v) => !v)}
        aria-label="User menu"
      />
      {/* Dropdown menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-md shadow-lg z-50">
          <div>
            <div className="px-4 py-3 border-b space-y-1 dark:border-gray-800">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{(user?.profile?.first_name +' ' + user?.profile?.last_name) || 'Guest'}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email || 'No email'}</p>
              {user?.roles && (<div className="text-sm text-gray-500 dark:text-gray-400">
                Roles: {user.roles.map(role => role.name).join(', ')}
              </div>
              )}
            </div>
          </div>
          <div className="py-2">
            <button className="w-full flex items-center text-left space-x-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-white/5" onClick={() => navigate('/chat')}> <MessageSquare className='w-4 h-4' /> <span>Chat AI</span></button>
            <button className="w-full flex items-center text-left space-x-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-white/5" onClick={() => navigate('/quiz-management')}> <BarChart3 className='w-4 h-4' /> <span>Quản lý Quiz</span></button>
            <button className="w-full flex items-center text-left space-x-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-white/5" onClick={() => navigate('/worksheet-management')}> <FileText className='w-4 h-4' /> <span>Phiếu học tập</span></button>
            <button className="w-full flex items-center text-left text-red-500 space-x-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-white/5" onClick={logout}> <LogOut className='w-4 h-4' /> <span>Đăng xuất</span></button>
          </div>
        </div>
      )}
    </div>
  )
}

export default User
