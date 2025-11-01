'use client'

import { useState, useEffect } from 'react'
import { Star, Check, X, Eye, Edit, Trash2 } from 'lucide-react'

interface Testimonial {
  id: number
  name: string
  title: string
  message: string
  is_approved: boolean
  is_featured: boolean
  display_order: number
  created_at: string
  contact_message: number | null
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [allTestimonials, setAllTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all')

  useEffect(() => {
    fetchTestimonials()
  }, [filter])

  const fetchTestimonials = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      
      // Fetch all testimonials for statistics
      const allResponse = await fetch(`http://localhost:8000/api/admin/testimonials/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (allResponse.ok) {
        const allData = await allResponse.json()
        setAllTestimonials(allData.results || allData)
      }
      
      // Fetch filtered testimonials for display
      const params = new URLSearchParams()
      if (filter === 'approved') params.append('is_approved', 'true')
      if (filter === 'pending') params.append('is_approved', 'false')

      const response = await fetch(`http://localhost:8000/api/admin/testimonials/?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTestimonials(data.results || data)
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleApproval = async (id: number) => {
    // Optimistic update - update UI immediately
    const updatedTestimonials = testimonials.map(t => 
      t.id === id ? { ...t, is_approved: !t.is_approved } : t
    )
    const updatedAll = allTestimonials.map(t => 
      t.id === id ? { ...t, is_approved: !t.is_approved } : t
    )
    setTestimonials(updatedTestimonials)
    setAllTestimonials(updatedAll)

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`http://localhost:8000/api/admin/testimonials/${id}/toggle_approval/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        // Revert on error
        setTestimonials(testimonials)
        setAllTestimonials(allTestimonials)
      }
    } catch (error) {
      console.error('Error toggling approval:', error)
      // Revert on error
      setTestimonials(testimonials)
      setAllTestimonials(allTestimonials)
    }
  }

  const toggleFeatured = async (id: number) => {
    // Optimistic update - update UI immediately
    const updatedTestimonials = testimonials.map(t => 
      t.id === id ? { ...t, is_featured: !t.is_featured } : t
    )
    const updatedAll = allTestimonials.map(t => 
      t.id === id ? { ...t, is_featured: !t.is_featured } : t
    )
    setTestimonials(updatedTestimonials)
    setAllTestimonials(updatedAll)

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`http://localhost:8000/api/admin/testimonials/${id}/toggle_featured/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        // Revert on error
        setTestimonials(testimonials)
        setAllTestimonials(allTestimonials)
      }
    } catch (error) {
      console.error('Error toggling featured:', error)
      // Revert on error
      setTestimonials(testimonials)
      setAllTestimonials(allTestimonials)
    }
  }

  const deleteTestimonial = async (id: number) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return

    // Optimistic update - remove from UI immediately
    const updatedTestimonials = testimonials.filter(t => t.id !== id)
    const updatedAll = allTestimonials.filter(t => t.id !== id)
    setTestimonials(updatedTestimonials)
    setAllTestimonials(updatedAll)

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`http://localhost:8000/api/admin/testimonials/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        // Revert on error
        fetchTestimonials()
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error)
      // Revert on error
      fetchTestimonials()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const approvedCount = allTestimonials.filter(t => t.is_approved).length
  const pendingCount = allTestimonials.filter(t => !t.is_approved).length

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Testimonials</h1>
        <p className="text-gray-600 mt-1">Manage testimonials displayed on About Us page</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{testimonials.length}</p>
            </div>
            <Star className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
            </div>
            <Check className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-orange-600">{pendingCount}</p>
            </div>
            <Eye className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md font-medium ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({allTestimonials.length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-md font-medium ${
              filter === 'approved'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Approved ({approvedCount})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-md font-medium ${
              filter === 'pending'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending ({pendingCount})
          </button>
        </div>
      </div>

      {/* Testimonials List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            className={`bg-white rounded-lg shadow p-6 ${
              testimonial.is_featured ? 'ring-2 ring-purple-500' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{testimonial.name}</h3>
                {testimonial.title && (
                  <p className="text-sm text-gray-600">{testimonial.title}</p>
                )}
              </div>
              <div className="flex gap-2">
                {testimonial.is_approved && (
                  <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    Approved
                  </span>
                )}
                {testimonial.is_featured && (
                  <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full flex items-center gap-1">
                    <Star className="h-3 w-3" /> Featured
                  </span>
                )}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-gray-700 italic">"{testimonial.message}"</p>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
              <span>Order: {testimonial.display_order}</span>
              <span>{new Date(testimonial.created_at).toLocaleDateString()}</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => toggleApproval(testimonial.id)}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md ${
                  testimonial.is_approved
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {testimonial.is_approved ? (
                  <>
                    <X className="h-4 w-4" /> Unapprove
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" /> Approve
                  </>
                )}
              </button>
              <button
                onClick={() => toggleFeatured(testimonial.id)}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md ${
                  testimonial.is_featured
                    ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Star className="h-4 w-4" />
                {testimonial.is_featured ? 'Unfeature' : 'Feature'}
              </button>
              <button
                onClick={() => deleteTestimonial(testimonial.id)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md bg-red-100 text-red-700 hover:bg-red-200"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {testimonials.length === 0 && (
        <div className="text-center py-12">
          <Star className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No testimonials found</p>
        </div>
      )}
    </div>
  )
}
