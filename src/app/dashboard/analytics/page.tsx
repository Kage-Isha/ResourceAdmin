'use client'

import { useEffect, useState } from 'react'
import { usersAPI, newsAPI } from '@/lib/api'
import { UserStatistics } from '@/lib/types'
import { TrendingUp, Users, Newspaper, Activity } from 'lucide-react'

export default function AnalyticsPage() {
  const [userStats, setUserStats] = useState<UserStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  useEffect(() => {
    // Check if user is superadmin
    const userInfo = localStorage.getItem('userInfo')
    if (userInfo) {
      const user = JSON.parse(userInfo)
      setIsSuperAdmin(user.is_superuser)
    }
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await usersAPI.getStatistics()
      setUserStats(response.data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
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
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-2 text-gray-600">Platform statistics and insights</p>
      </div>

      {/* Overview Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${isSuperAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6 mb-8`}>
        <AnalyticsCard
          title="Total Users"
          value={userStats?.total_users || 0}
          icon={Users}
          color="blue"
          trend="+12%"
        />
        <AnalyticsCard
          title="Active Users"
          value={userStats?.active_users || 0}
          icon={Activity}
          color="green"
          trend="+8%"
        />
        <AnalyticsCard
          title="Verified Users"
          value={userStats?.verified_users || 0}
          icon={Users}
          color="purple"
          trend="+15%"
        />
        {isSuperAdmin && (
          <AnalyticsCard
            title="Staff Members"
            value={userStats?.staff_users || 0}
            icon={Users}
            color="indigo"
            trend="+2%"
          />
        )}
      </div>

      {/* User Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">User Status Breakdown</h2>
          <div className="space-y-4">
            <StatusBar
              label="Not Banned Users"
              value={userStats?.active_users || 0}
              total={userStats?.total_users || 1}
              color="green"
            />
            <StatusBar
              label="Banned Users"
              value={userStats?.inactive_users || 0}
              total={userStats?.total_users || 1}
              color="red"
            />
            <StatusBar
              label="Verified Users"
              value={userStats?.verified_users || 0}
              total={userStats?.total_users || 1}
              color="blue"
            />
            <StatusBar
              label="Unverified Users"
              value={userStats?.unverified_users || 0}
              total={userStats?.total_users || 1}
              color="yellow"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Stats</h2>
          <div className="space-y-4">
            <QuickStat
              label="Verification Rate"
              value={`${userStats ? Math.round((userStats.verified_users / userStats.total_users) * 100) : 0}%`}
              color="purple"
            />
            <QuickStat
              label="Active Rate"
              value={`${userStats ? Math.round((userStats.active_users / userStats.total_users) * 100) : 0}%`}
              color="green"
            />
            {isSuperAdmin && (
              <QuickStat
                label="Total Staff Admins"
                value={`${userStats?.staff_users || 0}`}
                color="indigo"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface AnalyticsCardProps {
  title: string
  value: number
  icon: any
  color: 'blue' | 'green' | 'purple' | 'indigo'
  trend: string
}

function AnalyticsCard({ title, value, icon: Icon, color, trend }: AnalyticsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    indigo: 'bg-indigo-500',
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`${colorClasses[color]} p-3 rounded-full`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <span className="flex items-center text-sm text-green-600 font-medium">
          <TrendingUp className="h-4 w-4 mr-1" />
          {trend}
        </span>
      </div>
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

interface StatusBarProps {
  label: string
  value: number
  total: number
  color: 'green' | 'red' | 'blue' | 'yellow'
}

function StatusBar({ label, value, total, color }: StatusBarProps) {
  const percentage = (value / total) * 100
  const colorClasses = {
    green: 'bg-green-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
  }

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-medium text-gray-700">{value} ({percentage.toFixed(1)}%)</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${colorClasses[color]} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

interface QuickStatProps {
  label: string
  value: string
  color: 'purple' | 'green' | 'indigo'
}

function QuickStat({ label, value, color }: QuickStatProps) {
  const colorClasses = {
    purple: 'text-purple-600 bg-purple-50',
    green: 'text-green-600 bg-green-50',
    indigo: 'text-indigo-600 bg-indigo-50',
  }

  return (
    <div className="flex justify-between items-center">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <span className={`${colorClasses[color]} px-3 py-1 rounded-full text-sm font-bold`}>
        {value}
      </span>
    </div>
  )
}
