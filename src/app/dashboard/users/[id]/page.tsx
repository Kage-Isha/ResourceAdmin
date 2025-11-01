'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { usersAPI } from '@/lib/api'
import { UserDetail } from '@/lib/types'
import { ArrowLeft, Calendar, Eye, User, Trash2, Ban, CheckCircle, Mail, Phone, MapPin } from 'lucide-react'
import { format } from 'date-fns'

export default function UserDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [user, setUser] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchUser()
    }
  }, [params.id])

  const fetchUser = async () => {
    try {
      const response = await usersAPI.getUser(Number(params.id))
      setUser(response.data)
    } catch (error) {
      console.error('Error fetching user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleVerification = async () => {
    if (!user) return
    try {
      await usersAPI.toggleVerification(user.id)
      fetchUser()
    } catch (error) {
      console.error('Error toggling verification:', error)
    }
  }

  const handleToggleBan = async () => {
    if (!user) return
    const action = user.is_active ? 'ban' : 'unban'
    if (!confirm(`Are you sure you want to ${action} this user?`)) return
    
    try {
      await usersAPI.toggleBan(user.id)
      fetchUser()
    } catch (error) {
      console.error('Error toggling ban status:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">User not found</h2>
          <button
            onClick={() => router.push('/dashboard/users')}
            className="mt-4 text-primary-600 hover:text-primary-700"
          >
            Back to Users
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <button
        onClick={() => router.push('/dashboard/users')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Users
      </button>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-12">
          <div className="flex items-center">
            {user.profile_picture ? (
              <img
                src={user.profile_picture}
                alt={user.username}
                className="h-24 w-24 rounded-full border-4 border-white"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center border-4 border-white">
                <span className="text-3xl font-bold text-primary-600">
                  {user.username.substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            <div className="ml-6">
              <h1 className="text-3xl font-bold text-white">{user.full_name || user.username}</h1>
              <p className="text-primary-100 mt-1">@{user.username}</p>
              <div className="flex items-center mt-3 space-x-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  user.is_verified ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
                }`}>
                  {user.is_verified ? 'Verified' : 'Unverified'}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  user.is_active ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
                {user.is_staff && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-500 text-white">
                    Staff
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-8 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex space-x-4">
            <button
              onClick={handleToggleVerification}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Toggle Verification
            </button>
            <button
              onClick={handleToggleBan}
              className={`flex items-center px-4 py-2 text-white rounded-lg transition-colors ${
                user.is_active ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              <Ban className="h-5 w-5 mr-2" />
              {user.is_active ? 'Ban User' : 'Unban User'}
            </button>
          </div>
        </div>

        {/* Details */}
        <div className="px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <Mail className="h-5 w-5 mr-3 text-gray-400" />
                  <span>{user.email}</span>
                </div>
                {user.phone_number && (
                  <div className="flex items-center text-gray-700">
                    <Phone className="h-5 w-5 mr-3 text-gray-400" />
                    <span>{user.phone_number}</span>
                  </div>
                )}
                {user.address && (
                  <div className="flex items-start text-gray-700">
                    <MapPin className="h-5 w-5 mr-3 text-gray-400 mt-0.5" />
                    <div>
                      <div>{user.address}</div>
                      <div>{user.city}, {user.country}</div>
                      {user.postal_code && <div>{user.postal_code}</div>}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Personal Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
              <div className="space-y-3">
                {user.date_of_birth && (
                  <div className="flex items-center text-gray-700">
                    <Calendar className="h-5 w-5 mr-3 text-gray-400" />
                    <span>Born: {format(new Date(user.date_of_birth), 'MMMM dd, yyyy')}</span>
                  </div>
                )}
                {user.current_semester && (
                  <div className="text-gray-700">
                    <span className="font-medium">Current Semester:</span> {user.current_semester}
                  </div>
                )}
                <div className="text-gray-700">
                  <span className="font-medium">Joined:</span> {format(new Date(user.date_joined), 'MMMM dd, yyyy')}
                </div>
                {user.last_login && (
                  <div className="text-gray-700">
                    <span className="font-medium">Last Login:</span> {format(new Date(user.last_login), 'MMMM dd, yyyy HH:mm')}
                  </div>
                )}
              </div>
            </div>

            {/* Bio */}
            {user.bio && (
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Bio</h2>
                <p className="text-gray-700">{user.bio}</p>
              </div>
            )}

            {/* Activity Statistics */}
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Activity Statistics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">{user.posts_count}</div>
                  <div className="text-sm text-gray-600">Posts</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">{user.materials_count}</div>
                  <div className="text-sm text-gray-600">Materials</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-600">{user.successful_donations_count}</div>
                  <div className="text-sm text-gray-600">Donations</div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            {(user.facebook_url || user.twitter_url || user.linkedin_url) && (
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Social Media</h2>
                <div className="flex space-x-4">
                  {user.facebook_url && (
                    <a
                      href={user.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Facebook
                    </a>
                  )}
                  {user.twitter_url && (
                    <a
                      href={user.twitter_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-500"
                    >
                      Twitter
                    </a>
                  )}
                  {user.linkedin_url && (
                    <a
                      href={user.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 hover:text-blue-800"
                    >
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
