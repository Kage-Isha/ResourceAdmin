'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { newsAPI } from '@/lib/api'
import { News } from '@/lib/types'
import { ArrowLeft, Calendar, Eye, User, Trash2, Edit } from 'lucide-react'
import { format } from 'date-fns'

export default function NewsDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [news, setNews] = useState<News | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchNews()
    }
  }, [params.id])

  const fetchNews = async () => {
    try {
      const response = await newsAPI.getNewsItem(Number(params.id))
      setNews(response.data)
    } catch (error) {
      console.error('Error fetching news:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!news) return
    if (!confirm('Are you sure you want to delete this news article?')) return
    
    try {
      await newsAPI.deleteNews(news.id)
      router.push('/dashboard/news')
    } catch (error) {
      console.error('Error deleting news:', error)
      alert('Failed to delete news article')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!news) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">News not found</h2>
          <button
            onClick={() => router.push('/dashboard/news')}
            className="mt-4 text-primary-600 hover:text-primary-700"
          >
            Back to News
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-8 py-6">
          <button
            onClick={() => router.push('/dashboard/news')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to News
          </button>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                  news.status === 'published' ? 'bg-green-100 text-green-700' :
                  news.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {news.status.toUpperCase()}
                </span>
                {news.is_featured && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-700">
                    ⭐ FEATURED
                  </span>
                )}
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{news.title}</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push(`/dashboard/news/${news.id}/edit`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-8 py-8">
        {/* Meta Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Author</p>
                <p className="font-semibold text-gray-900">{news.author.username}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-semibold text-gray-900">{format(new Date(news.created_at), 'MMM dd, yyyy')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-50 rounded-lg">
                <Eye className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Views</p>
                <p className="font-semibold text-gray-900">{news.views_count}</p>
              </div>
            </div>
          </div>
          
          {/* Validity Period */}
          {news.valid_from && news.valid_until && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-900 mb-1">📅 Validity Period</p>
                <p className="text-sm text-blue-700">
                  Valid from <span className="font-semibold">{format(new Date(news.valid_from), 'MMMM dd, yyyy')}</span> to <span className="font-semibold">{format(new Date(news.valid_until), 'MMMM dd, yyyy')}</span>
                </p>
              </div>
            </div>
          )}
          
          {news.published_at && (
            <div className="mt-4">
              <p className="text-sm text-gray-500">
                Published on <span className="font-semibold text-gray-900">{format(new Date(news.published_at), 'MMMM dd, yyyy HH:mm')}</span>
              </p>
            </div>
          )}
        </div>

        {/* Featured Image */}
        {news.featured_image_url && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <img 
              src={news.featured_image_url} 
              alt={news.title}
              className="w-full h-auto max-h-96 object-cover"
            />
          </div>
        )}

        {/* Article Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="prose prose-lg max-w-none">
            <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {news.content}
            </div>
          </div>
        </div>

        {/* Category & Tags */}
        {(news.category || (news.tags_list && news.tags_list.length > 0)) && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
            {news.category && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Category</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  {news.category.name}
                </span>
              </div>
            )}
            
            {news.tags_list && news.tags_list.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {news.tags_list.map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
