import React, { useState, useEffect, useRef } from 'react'
import { getStoredAuthUser } from '@/utils/authStorage'
import { logoutUser } from '@/services/authService'
import { LogOut, BookOpen, Settings } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { User as UserType } from '@/types/auth'

const ROLE_PRIORITY: Record<string, { order: number; label: string }> = {
  admin: { order: 0, label: "Admin" },
  teacher: { order: 1, label: "Giáo viên" },
  user: { order: 1, label: "Giáo viên" },
  student: { order: 2, label: "Học sinh" },
};

const getHighestRole = (roles: { name: string }[]): string => {
  if (!roles.length) return "";
  const sorted = [...roles].sort(
    (a, b) => (ROLE_PRIORITY[a.name]?.order ?? 99) - (ROLE_PRIORITY[b.name]?.order ?? 99)
  );
  return ROLE_PRIORITY[sorted[0].name]?.label ?? sorted[0].name;
};

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

  // Lock body scroll khi sidebar mở
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const logout = async () => {
    await logoutUser()
    navigate('/login')
  }

  if (!user) {
    return <Link to="/login" className="text-sm font-medium text-stone-700 dark:text-stone-300 hover:text-brand">Đăng nhập</Link>
  }

  const displayEmail = user.email || 'Chưa có email'

  // Lấy 2 chữ cái đầu từ email để làm avatar
  const getInitials = (email: string) => {
    const name = email.split('@')[0]
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <div ref={ref}>
      {/* Avatar Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center w-9 h-9 rounded-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 font-medium text-sm hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
        aria-label="Menu người dùng"
      >
        {getInitials(displayEmail)}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40 transition-opacity duration-300"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar Panel - Slide in from right */}
      <div
        className={`fixed top-0 right-0 h-screen w-72 bg-white dark:bg-stone-900 border-l border-stone-200 dark:border-stone-700 shadow-lg z-50 transform transition-all duration-300 ease-out flex flex-col overflow-hidden ${
          open ? 'translate-x-0 opacity-100 visible' : 'translate-x-full opacity-0 invisible'
        }`}
      >
        {/* Header với avatar và info */}
        <div className="flex-shrink-0 px-5 py-5 border-b border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 font-semibold text-base">
              {getInitials(displayEmail)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-800 dark:text-stone-200 truncate">{displayEmail}</p>
              {user.roles && user.roles.length > 0 && (
                <p className="text-xs text-stone-500 dark:text-stone-400">{getHighestRole(user.roles)}</p>
              )}
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-2">
          <button
            className="w-full flex items-center gap-3 px-5 py-3 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            onClick={() => { setOpen(false); navigate('/lesson-builder'); }}
          >
            <BookOpen className="w-4 h-4 text-stone-500 dark:text-stone-400" />
            <span>Soạn KHBD</span>
          </button>

          <button
            className="w-full flex items-center gap-3 px-5 py-3 text-sm text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            onClick={() => { setOpen(false); navigate('/account'); }}
          >
            <Settings className="w-4 h-4 text-stone-500 dark:text-stone-400" />
            <span>Cài đặt tài khoản</span>
          </button>

          <div className="my-2 mx-5 border-t border-stone-100 dark:border-stone-800"></div>

          <button
            className="w-full flex items-center gap-3 px-5 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            onClick={logout}
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default User
