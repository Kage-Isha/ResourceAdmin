'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { newsAPI } from '@/lib/api'
import { News } from '@/lib/types'
import { Search, Plus, Eye, Trash2, Newspaper } from 'lucide-react'
import { format } from 'date-fns'

export default function NewsPage() {
  const router = useRouter()
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    currentPage: 1
  })

  useEffect(() => {
    fetchNews()
  }, [search, statusFilter])

  const fetchNews = async (page = 1) => {
    setLoading(true)
    try {
      const params: any = { page }
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter

      const response = await newsAPI.getNews(params)
      setNews(response.data.results)
      setPagination({
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
        currentPage: page
      })
    } catch (error) {
      console.error('Error fetching news:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async (id: number) => {
    try {
      await newsAPI.publishNews(id)
      fetchNews(pagination.currentPage)
    } catch (error) {
      console.error('Error publishing news:', error)
    }
  }

  const handleUnpublish = async (id: number) => {
    try {
      await newsAPI.unpublishNews(id)
      fetchNews(pagination.currentPage)
    } catch (error) {
      console.error('Error unpublishing news:', error)
    }
  }

  const handleArchive = async (id: number) => {
    try {
      await newsAPI.archiveNews(id)
      fetchNews(pagination.currentPage)
    } catch (error) {
      console.error('Error archiving news:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this news article?')) return
    
    try {
      await newsAPI.deleteNews(id)
      fetchNews(pagination.currentPage)
    } catch (error) {
      console.error('Error deleting news:', error)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">News Management</h1>
          <p className="mt-2 text-gray-600">Create, edit, and publish news articles</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/news/create')}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create News
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search news..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* News List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No news articles found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {news.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                  {/* Featured Image */}
                  {item.featured_image_url ? (
                    <div className="h-48 overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100">
                      <img 
                        src={item.featured_image_url} 
                        alt={item.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <Newspaper className="h-16 w-16 text-white opacity-50" />
                    </div>
                  )}
                  
                  {/* Content */}
                  <div className="p-5">
                    {/* Status Badge */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        item.status === 'published' ? 'bg-green-100 text-green-700' :
                        item.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {item.status.toUpperCase()}
                      </span>
                      {item.is_featured && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                          ⭐ FEATURED
                        </span>
                      )}
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
                      {item.title}
                    </h3>
                    
                    {/* Summary */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{item.summary}</p>
                    
                    {/* Meta Info */}
                    <div className="flex items-center text-xs text-gray-500 mb-4 space-x-2">
                      <span className="flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        {item.views_count}
                      </span>
                      <span>•</span>
                      <span>{format(new Date(item.created_at), 'MMM dd, yyyy')}</span>
                    </div>
                    
                    {/* Validity Period */}
                    {item.valid_from && item.valid_until && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-4">
                        <p className="text-xs text-blue-700 font-medium">
                          📅 Valid: {format(new Date(item.valid_from), 'MMM dd')} - {format(new Date(item.valid_until), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => router.push(`/dashboard/news/${item.id}`)}
                        className="flex-1 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => fetchNews(pagination.currentPage - 1)}
                  disabled={!pagination.previous}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => fetchNews(pagination.currentPage + 1)}
                  disabled={!pagination.next}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{pagination.currentPage}</span> of{' '}
                    <span className="font-medium">{Math.ceil(pagination.count / 10)}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => fetchNews(pagination.currentPage - 1)}
                      disabled={!pagination.previous}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => fetchNews(pagination.currentPage + 1)}
                      disabled={!pagination.next}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
