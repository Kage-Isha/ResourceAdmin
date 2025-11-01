'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Mail, User, Calendar, CheckCircle, XCircle, Eye, EyeOff, Reply, Search, Filter, Star } from 'lucide-react'

interface ContactMessage {
  id: number
  name: string
  email: string
  subject: string
  message: string
  user: number | null
  user_username: string | null
  user_email: string | null
  user_type: string
  is_read: boolean
  is_replied: boolean
  admin_notes: string
  created_at: string
  updated_at: string
}

interface Statistics {
  total_messages: number
  unread_messages: number
  unreplied_messages: number
  registered_users: number
  guest_users: number
  by_subject: {
    feedback: number
    request: number
    support: number
    other: number
  }
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<ContactMessage[]>([])
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedContact, setSelectedContact] = useState<ContactMessage | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSubject, setFilterSubject] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterUserType, setFilterUserType] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchContacts()
    fetchStatistics()
  }, [searchTerm, filterSubject, filterStatus, filterUserType, currentPage])

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const params = new URLSearchParams()
      
      if (searchTerm) params.append('search', searchTerm)
      if (filterSubject !== 'all') params.append('subject', filterSubject)
      if (filterStatus === 'read') params.append('is_read', 'true')
      if (filterStatus === 'unread') params.append('is_read', 'false')
      if (filterStatus === 'replied') params.append('is_replied', 'true')
      if (filterStatus === 'unreplied') params.append('is_replied', 'false')
      if (filterUserType !== 'all') params.append('user_type', filterUserType)
      params.append('page', currentPage.toString())

      const response = await fetch(`http://localhost:8000/api/admin/contacts/?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setContacts(data.results)
        setTotalPages(Math.ceil(data.count / 20))
      }
    } catch (error) {
      console.error('Error fetching contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('http://localhost:8000/api/admin/contacts/statistics/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStatistics(data)
      }
    } catch (error) {
      console.error('Error fetching statistics:', error)
    }
  }

  const toggleRead = async (id: number) => {
    // Optimistic update - update UI immediately
    const updatedContacts = contacts.map(c => 
      c.id === id ? { ...c, is_read: !c.is_read } : c
    )
    setContacts(updatedContacts)
    
    if (selectedContact?.id === id) {
      setSelectedContact({ ...selectedContact, is_read: !selectedContact.is_read })
    }
    
    // Update statistics optimistically
    if (statistics) {
      const isCurrentlyRead = contacts.find(c => c.id === id)?.is_read
      setStatistics({
        ...statistics,
        unread_messages: isCurrentlyRead 
          ? statistics.unread_messages + 1 
          : statistics.unread_messages - 1
      })
    }

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`http://localhost:8000/api/admin/contacts/${id}/toggle_read/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        // Revert on error
        fetchContacts()
        fetchStatistics()
      }
    } catch (error) {
      console.error('Error toggling read status:', error)
      // Revert on error
      fetchContacts()
      fetchStatistics()
    }
  }

  const toggleReplied = async (id: number) => {
    // Optimistic update - update UI immediately
    const updatedContacts = contacts.map(c => 
      c.id === id ? { ...c, is_replied: !c.is_replied } : c
    )
    setContacts(updatedContacts)
    
    if (selectedContact?.id === id) {
      setSelectedContact({ ...selectedContact, is_replied: !selectedContact.is_replied })
    }
    
    // Update statistics optimistically
    if (statistics) {
      const isCurrentlyReplied = contacts.find(c => c.id === id)?.is_replied
      setStatistics({
        ...statistics,
        unreplied_messages: isCurrentlyReplied 
          ? statistics.unreplied_messages + 1 
          : statistics.unreplied_messages - 1
      })
    }

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`http://localhost:8000/api/admin/contacts/${id}/toggle_replied/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        // Revert on error
        fetchContacts()
        fetchStatistics()
      }
    } catch (error) {
      console.error('Error toggling replied status:', error)
      // Revert on error
      fetchContacts()
      fetchStatistics()
    }
  }

  const updateAdminNotes = async (id: number, notes: string) => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`http://localhost:8000/api/admin/contacts/${id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ admin_notes: notes }),
      })

      if (response.ok) {
        fetchContacts()
        const data = await response.json()
        setSelectedContact(data)
      }
    } catch (error) {
      console.error('Error updating admin notes:', error)
    }
  }

  const postAsTestimonial = async (id: number, event: React.MouseEvent<HTMLButtonElement>) => {
    // Show immediate feedback on the specific button that was clicked
    const button = event.currentTarget as HTMLButtonElement
    const originalText = button.textContent
    button.disabled = true
    button.textContent = 'Creating...'

    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`http://localhost:8000/api/admin/contacts/${id}/create_testimonial/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        alert(data.message || 'Testimonial created successfully! Please review and approve it in the Testimonials section.')
        button.textContent = 'Created ✓'
        button.classList.remove('bg-purple-100', 'text-purple-700', 'hover:bg-purple-200')
        button.classList.add('bg-green-100', 'text-green-700')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create testimonial')
        button.disabled = false
        button.textContent = originalText || 'Post as Testimonial'
      }
    } catch (error) {
      console.error('Error creating testimonial:', error)
      alert('Error creating testimonial')
      button.disabled = false
      button.textContent = originalText || 'Post as Testimonial'
    }
  }

  const getSubjectBadgeColor = (subject: string) => {
    switch (subject) {
      case 'feedback': return 'bg-blue-100 text-blue-800'
      case 'request': return 'bg-purple-100 text-purple-800'
      case 'support': return 'bg-red-100 text-red-800'
      case 'other': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSubjectLabel = (subject: string) => {
    switch (subject) {
      case 'feedback': return 'Feedback'
      case 'request': return 'Request'
      case 'support': return 'Technical Support'
      case 'other': return 'Other'
      default: return subject
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
        <p className="text-gray-600 mt-1">Manage messages from registered users and guests</p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Messages</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.total_messages}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-orange-600">{statistics.unread_messages}</p>
              </div>
              <Mail className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unreplied</p>
                <p className="text-2xl font-bold text-red-600">{statistics.unreplied_messages}</p>
              </div>
              <Reply className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Registered</p>
                <p className="text-2xl font-bold text-green-600">{statistics.registered_users}</p>
              </div>
              <User className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Guests</p>
                <p className="text-2xl font-bold text-gray-600">{statistics.guest_users}</p>
              </div>
              <User className="h-8 w-8 text-gray-600" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Subjects</option>
              <option value="feedback">Feedback</option>
              <option value="request">Request</option>
              <option value="support">Technical Support</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="unreplied">Unreplied</option>
              <option value="replied">Replied</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User Type</label>
            <select
              value={filterUserType}
              onChange={(e) => setFilterUserType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Users</option>
              <option value="registered">Registered</option>
              <option value="guest">Guest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Messages List and Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Messages List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Messages ({contacts.length})</h2>
          </div>
          <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedContact?.id === contact.id ? 'bg-blue-50' : ''
                } ${!contact.is_read ? 'bg-blue-50/30' : ''}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                      {!contact.is_read && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{contact.email}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSubjectBadgeColor(contact.subject)}`}>
                    {getSubjectLabel(contact.subject)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 line-clamp-2 mb-2">{contact.message}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {contact.user_type}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(contact.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {contact.is_replied && (
                    <span className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-3 w-3" />
                      Replied
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-200 flex justify-between items-center">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Message Detail */}
        <div className="bg-white rounded-lg shadow">
          {selectedContact ? (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{selectedContact.name}</h2>
                    <p className="text-sm text-gray-600">{selectedContact.email}</p>
                    {selectedContact.user_username && (
                      <p className="text-sm text-blue-600">@{selectedContact.user_username}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getSubjectBadgeColor(selectedContact.subject)}`}>
                    {getSubjectLabel(selectedContact.subject)}
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => toggleRead(selectedContact.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md ${
                      selectedContact.is_read
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    {selectedContact.is_read ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {selectedContact.is_read ? 'Mark Unread' : 'Mark Read'}
                  </button>
                  <button
                    onClick={() => toggleReplied(selectedContact.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md ${
                      selectedContact.is_replied
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                    }`}
                  >
                    <Reply className="h-4 w-4" />
                    {selectedContact.is_replied ? 'Replied' : 'Mark Replied'}
                  </button>
                  {selectedContact.subject === 'feedback' && (
                    <button
                      onClick={(e) => postAsTestimonial(selectedContact.id, e)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md bg-purple-100 text-purple-700 hover:bg-purple-200"
                    >
                      <Star className="h-4 w-4" />
                      Post as Testimonial
                    </button>
                  )}
                </div>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Message</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedContact.message}</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">User Type:</span>
                      <span className="font-medium text-gray-900">{selectedContact.user_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Submitted:</span>
                      <span className="font-medium text-gray-900">
                        {new Date(selectedContact.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <div className="flex gap-2">
                        {selectedContact.is_read && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            Read
                          </span>
                        )}
                        {selectedContact.is_replied && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            Replied
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Admin Notes</h3>
                  <textarea
                    value={selectedContact.admin_notes}
                    onChange={(e) => {
                      setSelectedContact({ ...selectedContact, admin_notes: e.target.value })
                    }}
                    onBlur={(e) => updateAdminNotes(selectedContact.id, e.target.value)}
                    placeholder="Add internal notes about this message..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Select a message to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
