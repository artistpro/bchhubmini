import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { 
  Mail, 
  Search, 
  Filter,
  Calendar,
  User,
  MessageSquare,
  Eye,
  Archive,
  Trash2,
  ExternalLink
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface ContactSubmission {
  id: string
  name: string
  email: string
  subject?: string
  message: string
  status: 'unread' | 'read' | 'responded' | 'archived'
  user_agent?: string
  ip_address?: string
  created_at: string
  updated_at: string
}

export function AdminContact() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'read' | 'responded' | 'archived'>('all')
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const submissionsPerPage = 10

  useEffect(() => {
    fetchSubmissions()
  }, [searchTerm, filterStatus, currentPage])

  async function fetchSubmissions() {
    try {
      setLoading(true)
      
      let query = supabase
        .from('contact_submissions')
        .select('*', { count: 'exact' })

      // Apply filters
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,subject.ilike.%${searchTerm}%,message.ilike.%${searchTerm}%`)
      }
      
      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus)
      }

      // Apply sorting and pagination
      query = query.order('created_at', { ascending: false })
      const from = (currentPage - 1) * submissionsPerPage
      const to = from + submissionsPerPage - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) throw error
      
      setSubmissions(data || [])
      setTotalCount(count || 0)
    } catch (error) {
      console.error('Error fetching contact submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updateSubmissionStatus(id: string, status: ContactSubmission['status']) {
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) throw error
      
      // Update local state
      setSubmissions(prev => prev.map(sub => 
        sub.id === id ? { ...sub, status } : sub
      ))
      
      if (selectedSubmission?.id === id) {
        setSelectedSubmission(prev => prev ? { ...prev, status } : null)
      }
    } catch (error) {
      console.error('Error updating submission status:', error)
      alert('Failed to update status')
    }
  }

  async function deleteSubmission(id: string) {
    if (!confirm('Are you sure you want to delete this submission?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('contact_submissions')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setSubmissions(prev => prev.filter(sub => sub.id !== id))
      if (selectedSubmission?.id === id) {
        setSelectedSubmission(null)
      }
      setTotalCount(prev => prev - 1)
    } catch (error) {
      console.error('Error deleting submission:', error)
      alert('Failed to delete submission')
    }
  }

  function handleSubmissionClick(submission: ContactSubmission) {
    setSelectedSubmission(submission)
    
    // Mark as read if it's unread
    if (submission.status === 'unread') {
      updateSubmissionStatus(submission.id, 'read')
    }
  }

  const totalPages = Math.ceil(totalCount / submissionsPerPage)
  const unreadCount = submissions.filter(s => s.status === 'unread').length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread': return 'bg-red-100 text-red-800'
      case 'read': return 'bg-blue-100 text-blue-800'
      case 'responded': return 'bg-green-100 text-green-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Contact Management
        </h1>
        <p className="text-lg text-gray-600">
          Review and respond to user inquiries and feedback.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
          <div className="text-sm text-gray-600">Total Submissions</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-red-600">{unreadCount}</div>
          <div className="text-sm text-gray-600">Unread</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-blue-600">
            {submissions.filter(s => s.status === 'read').length}
          </div>
          <div className="text-sm text-gray-600">Read</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-600">
            {submissions.filter(s => s.status === 'responded').length}
          </div>
          <div className="text-sm text-gray-600">Responded</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Submissions List */}
        <div className="lg:col-span-2">
          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search submissions..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-red-600 focus:border-red-600"
                />
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value as any)
                  setCurrentPage(1)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-600 focus:border-red-600"
              >
                <option value="all">All Submissions</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
                <option value="responded">Responded</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Submissions */}
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No contact submissions found.</p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
                {submissions.map((submission) => (
                  <div
                    key={submission.id}
                    onClick={() => handleSubmissionClick(submission)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedSubmission?.id === submission.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900">
                            {submission.name}
                          </h3>
                          <span className={`inline-block text-xs px-2 py-1 rounded ${getStatusColor(submission.status)}`}>
                            {submission.status}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-1">
                          {submission.email}
                        </p>
                        
                        {submission.subject && (
                          <p className="text-sm font-medium text-gray-800 mb-2">
                            {submission.subject}
                          </p>
                        )}
                        
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {submission.message}
                        </p>
                        
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(submission.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        {submission.status === 'unread' && (
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center space-x-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = Math.max(1, Math.min(totalPages, currentPage - 2 + i))
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={currentPage === page ? 'bg-red-600 hover:bg-red-700' : ''}
                        >
                          {page}
                        </Button>
                      )
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Submission Detail */}
        <div className="lg:col-span-1">
          {selectedSubmission ? (
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Message Details</h2>
                <span className={`text-xs px-2 py-1 rounded ${getStatusColor(selectedSubmission.status)}`}>
                  {selectedSubmission.status}
                </span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <p className="text-sm text-gray-900">{selectedSubmission.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-gray-900">{selectedSubmission.email}</p>
                    <a 
                      href={`mailto:${selectedSubmission.email}`}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
                
                {selectedSubmission.subject && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <p className="text-sm text-gray-900">{selectedSubmission.subject}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <div className="bg-gray-50 rounded p-3 text-sm text-gray-900 whitespace-pre-wrap">
                    {selectedSubmission.message}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Received
                  </label>
                  <p className="text-sm text-gray-900">
                    {formatDate(selectedSubmission.created_at)}
                  </p>
                </div>
                
                {selectedSubmission.ip_address && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      IP Address
                    </label>
                    <p className="text-sm text-gray-900 font-mono">
                      {selectedSubmission.ip_address}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Actions */}
              <div className="mt-6 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {selectedSubmission.status !== 'responded' && (
                    <Button
                      size="sm"
                      onClick={() => updateSubmissionStatus(selectedSubmission.id, 'responded')}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Mark Responded
                    </Button>
                  )}
                  
                  {selectedSubmission.status !== 'archived' && (
                    <Button
                      size="sm"
                      onClick={() => updateSubmissionStatus(selectedSubmission.id, 'archived')}
                      className="bg-gray-600 hover:bg-gray-700 text-white"
                    >
                      <Archive className="h-3 w-3 mr-1" />
                      Archive
                    </Button>
                  )}
                </div>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteSubmission(selectedSubmission.id)}
                  className="w-full border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Select a submission to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}