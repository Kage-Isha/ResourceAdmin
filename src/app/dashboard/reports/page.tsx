'use client'

import { useState, useEffect } from 'react'
import { Flag, Search, Filter, Eye, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'

interface Report {
  id: number
  reporter: {
    id: number
    username: string
    email: string
    profile_picture: string | null
  }
  reported_user: {
    id: number
    username: string
    email: string
    profile_picture: string | null
    report_count: number
  }
  report_type: string
  report_type_display: string
  reason: string
  reason_display: string
  description: string
  screenshot: string
  status: string
  status_display: string
  created_at: string
  reviewed_by_username: string | null
  reviewed_at: string | null
  admin_notes: string
  action_taken: string
}

interface ReportStats {
  summary: {
    total_reports: number
    pending_reports: number
    under_review_reports: number
    verified_reports: number
    rejected_reports: number
    resolved_reports: number
  }
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [stats, setStats] = useState<ReportStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [showModal, setShowModal] = useState(false)
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 20

  useEffect(() => {
    fetchStats()
    fetchReports()
  }, [statusFilter, typeFilter, searchQuery, currentPage])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch('http://localhost:8000/api/admin/reports/dashboard/', {
        headers: {
          'Authorization': `Token ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        console.error('Failed to fetch stats:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const fetchReports = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('adminToken')
      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: pageSize.toString(),
      })
      
      if (statusFilter) params.append('status', statusFilter)
      if (typeFilter) params.append('type', typeFilter)
      if (searchQuery) params.append('search', searchQuery)
      
      const response = await fetch(`http://localhost:8000/api/admin/reports/?${params}`, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setReports(data.results)
        setTotalCount(data.count)
      } else {
        console.error('Failed to fetch reports:', response.status, response.statusText)
        const errorText = await response.text()
        console.error('Error details:', errorText)
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (reportId: number, action: 'verify' | 'reject' | 'mark_under_review') => {
    const actionTaken = prompt('Action taken (required for verify):')
    const adminNotes = prompt('Admin notes (optional):')
    
    if (action === 'verify' && !actionTaken) {
      alert('Action taken is required for verification')
      return
    }
    
    try {
      const token = localStorage.getItem('adminToken')
      const response = await fetch(`http://localhost:8000/api/admin/reports/${reportId}/${action}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action_taken: actionTaken || '',
          admin_notes: adminNotes || '',
        }),
      })
      
      if (response.ok) {
        const data = await response.json()
        alert(data.message)
        fetchReports()
        fetchStats()
        setShowModal(false)
      } else {
        const error = await response.json()
        alert(error.message || 'Action failed')
      }
    } catch (error) {
      console.error('Error performing action:', error)
      alert('Failed to perform action')
    }
  }

  const viewReport = async (report: Report) => {
    setSelectedReport(report)
    setShowModal(true)
    
    // Auto-mark as under review if status is pending
    if (report.status === 'pending') {
      try {
        const token = localStorage.getItem('adminToken')
        await fetch(`http://localhost:8000/api/admin/reports/${report.id}/mark_under_review/`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
        })
        // Refresh reports list to show updated status
        fetchReports()
      } catch (error) {
        console.error('Error marking as under review:', error)
      }
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: { [key: string]: { bg: string; text: string; icon: any } } = {
      pending: { bg: 'bg-yellow-100 text-yellow-800', text: 'Pending', icon: Clock },
      under_review: { bg: 'bg-blue-100 text-blue-800', text: 'Under Review', icon: Eye },
      verified: { bg: 'bg-red-100 text-red-800', text: 'Verified', icon: CheckCircle },
      rejected: { bg: 'bg-gray-100 text-gray-800', text: 'Rejected', icon: XCircle },
      resolved: { bg: 'bg-green-100 text-green-800', text: 'Resolved', icon: CheckCircle },
    }
    
    const badge = badges[status] || badges.pending
    const Icon = badge.icon
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg}`}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.text}
      </span>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Reports Management</h1>
        <p className="text-gray-600">Review and manage user reports</p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.summary.total_reports}</p>
              </div>
              <Flag className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.summary.pending_reports}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Under Review</p>
                <p className="text-2xl font-bold text-blue-600">{stats.summary.under_review_reports}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-red-600">{stats.summary.verified_reports}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-red-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-600">{stats.summary.rejected_reports}</p>
              </div>
              <XCircle className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{stats.summary.resolved_reports}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="post">Post</option>
              <option value="message">Message</option>
              <option value="profile">Profile</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="w-4 h-4 inline mr-1" />
              Search
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username or description..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reporter</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reported User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">Loading...</td>
              </tr>
            ) : reports.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">No reports found</td>
              </tr>
            ) : (
              reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{report.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{report.reporter.username}</div>
                    <div className="text-sm text-gray-500">{report.reporter.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{report.reported_user.username}</div>
                        <div className="text-sm text-gray-500">
                          Reports: <span className="text-red-600 font-semibold">{report.reported_user.report_count}</span>
                        </div>
                      </div>
                      {report.reported_user.report_count >= 3 && (
                        <AlertTriangle className="w-4 h-4 text-red-500 ml-2" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.report_type_display}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.reason_display}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(report.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(report.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => viewReport(report)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Eye className="w-4 h-4 inline" /> View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalCount > pageSize && (
        <div className="mt-4 flex justify-center">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
              Page {currentPage} of {Math.ceil(totalCount / pageSize)}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(Math.ceil(totalCount / pageSize), currentPage + 1))}
              disabled={currentPage >= Math.ceil(totalCount / pageSize)}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </nav>
        </div>
      )}

      {/* Report Detail Modal */}
      {showModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">Report #{selectedReport.id}</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-700">Reporter</h3>
                    <p className="text-gray-900">{selectedReport.reporter.username}</p>
                    <p className="text-sm text-gray-500">{selectedReport.reporter.email}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Reported User</h3>
                    <p className="text-gray-900">{selectedReport.reported_user.username}</p>
                    <p className="text-sm text-gray-500">Report Count: {selectedReport.reported_user.report_count}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700">Type & Reason</h3>
                  <p className="text-gray-900">{selectedReport.report_type_display} - {selectedReport.reason_display}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700">Description</h3>
                  <p className="text-gray-900">{selectedReport.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Screenshot Evidence</h3>
                  {selectedReport.screenshot ? (
                    <img 
                      src={selectedReport.screenshot.startsWith('http') ? selectedReport.screenshot : `http://localhost:8000${selectedReport.screenshot}`}
                      alt="Report screenshot" 
                      className="w-full rounded-lg border"
                      onError={(e) => {
                        console.error('Image load error:', selectedReport.screenshot)
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%23999"%3EScreenshot not available%3C/text%3E%3C/svg%3E'
                      }}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 rounded-lg border flex items-center justify-center text-gray-500">
                      No screenshot available
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700">Status</h3>
                  {getStatusBadge(selectedReport.status)}
                </div>

                {(selectedReport.status === 'pending' || selectedReport.status === 'under_review') && (
                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={() => handleAction(selectedReport.id, 'verify')}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                      <CheckCircle className="w-4 h-4 inline mr-2" />
                      Verify Report
                    </button>
                    <button
                      onClick={() => handleAction(selectedReport.id, 'reject')}
                      className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                    >
                      <XCircle className="w-4 h-4 inline mr-2" />
                      Reject Report
                    </button>
                    <button
                      onClick={() => handleAction(selectedReport.id, 'mark_under_review')}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      <Eye className="w-4 h-4 inline mr-2" />
                      Mark Under Review
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
