'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Users, Newspaper, LogOut, BarChart3, Shield, MessageSquare, Star, Flag } from 'lucide-react'
import { useState, useEffect } from 'react'

const allNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, requiresSuperAdmin: false },
  { name: 'Users', href: '/dashboard/users', icon: Users, requiresSuperAdmin: false },
  { name: 'Admins', href: '/dashboard/admins', icon: Shield, requiresSuperAdmin: true },
  { name: 'News', href: '/dashboard/news', icon: Newspaper, requiresSuperAdmin: false },
  { name: 'Reports', href: '/dashboard/reports', icon: Flag, requiresSuperAdmin: false },
  { name: 'Contacts', href: '/dashboard/contacts', icon: MessageSquare, requiresSuperAdmin: false },
  { name: 'Testimonials', href: '/dashboard/testimonials', icon: Star, requiresSuperAdmin: false },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, requiresSuperAdmin: false },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [navigation, setNavigation] = useState<typeof allNavigation>([])

  useEffect(() => {
    // Check if user is superadmin
    const userInfo = localStorage.getItem('userInfo')
    if (userInfo) {
      const user = JSON.parse(userInfo)
      setIsSuperAdmin(user.is_superuser)
      
      // Filter navigation based on user role
      if (user.is_superuser) {
        setNavigation(allNavigation)
      } else {
        setNavigation(allNavigation.filter(item => !item.requiresSuperAdmin))
      }
    } else {
      // Default to non-superadmin navigation
      setNavigation(allNavigation.filter(item => !item.requiresSuperAdmin))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('userInfo')
    router.push('/login')
  }

  return (
    <div className="flex flex-col w-64 bg-gray-900 min-h-screen">
      <div className="flex items-center justify-center h-16 bg-gray-800">
        <h1 className="text-white text-xl font-bold">BIM Admin</h1>
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                ${isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }
              `}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  )
}
