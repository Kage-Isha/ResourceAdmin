'use client'

import { useEffect, useState } from 'react'
import { usersAPI, newsAPI } from '@/lib/api'
import { UserStatistics } from '@/lib/types'
import { Users, Newspaper, CheckCircle, XCircle } from 'lucide-react'

export default function DashboardPage() {
  const [userStats, setUserStats] = useState<UserStatistics | null>(null)
  const [newsCount, setNewsCount] = useState({ total: 0, published: 0, draft: 0 })
  const [loading, setLoading] = useState(true)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  useEffect(() => {
    // Check if user is superadmin
    const userInfo = localStorage.getItem('userInfo')
    if (userInfo) {
      const user = JSON.parse(userInfo)
      setIsSuperAdmin(user.is_superuser)
    }
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    try {
      const [userStatsRes, newsRes] = await Promise.all([
        usersAPI.getStatistics(),
        newsAPI.getNews({ page_size: 1 })
      ])
      
      setUserStats(userStatsRes.data)
      
      // Fetch news counts
      const [publishedRes, draftRes] = await Promise.all([
        newsAPI.getNews({ status: 'published', page_size: 1 }),
        newsAPI.getNews({ status: 'draft', page_size: 1 })
      ])
      
      setNewsCount({
        total: newsRes.data.count || 0,
        published: publishedRes.data.count || 0,
        draft: draftRes.data.count || 0
      })
    } catch (error) {
      console.error('Error fetching statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome to BIM Resource Share Admin Panel</p>
      </div>

      {/* User Statistics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">User Statistics</h2>
        <div className={`grid grid-cols-1 md:grid-cols-2 ${isSuperAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6`}>
          <StatCard
            title="Total Users"
            value={userStats?.total_users || 0}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Active Users"
            value={userStats?.active_users || 0}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            title="Verified Users"
            value={userStats?.verified_users || 0}
            icon={CheckCircle}
            color="purple"
          />
          {isSuperAdmin && (
            <StatCard
              title="Staff Users"
              value={userStats?.staff_users || 0}
              icon={Users}
              color="indigo"
            />
          )}
        </div>
      </div>

      {/* News Statistics */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">News Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total News"
            value={newsCount.total}
            icon={Newspaper}
            color="blue"
          />
          <StatCard
            title="Published"
            value={newsCount.published}
            icon={CheckCircle}
            color="green"
          />
          <StatCard
            title="Drafts"
            value={newsCount.draft}
            icon={XCircle}
            color="yellow"
          />
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: number
  icon: any
  color: 'blue' | 'green' | 'purple' | 'indigo' | 'yellow'
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    indigo: 'bg-indigo-500',
    yellow: 'bg-yellow-500',
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${colorClasses[color]} p-3 rounded-full`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  )
}
