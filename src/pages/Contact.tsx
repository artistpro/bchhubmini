import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react'
import { isValidEmail } from '@/lib/utils'

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    // Validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError('Please fill in all required fields')
      return
    }
    
    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address')
      return
    }
    
    if (formData.message.trim().length < 10) {
      setError('Message must be at least 10 characters long')
      return
    }

    try {
      setLoading(true)
      
      const { error } = await supabase.functions.invoke('contact-form-handler', {
        body: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim() || null,
          message: formData.message.trim()
        }
      })

      if (error) throw error
      
      setSubmitted(true)
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (error) {
      console.error('Error submitting contact form:', error)
      setError('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Message Sent Successfully!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Thank you for reaching out. We'll get back to you as soon as possible.
          </p>
          <Button 
            onClick={() => setSubmitted(false)}
            className="bg-[#16a085] hover:bg-[#0e7a6b]"
          >
            Send Another Message
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Get In Touch
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Have questions about Bitcoin Cash? Want to suggest content or report an issue? 
          We'd love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Information */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Contact Information
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="bg-[#16a085] p-3 rounded-lg">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Email</h3>
                <p className="text-gray-600">contact@bchcontenthub.com</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-[#f39c12] p-3 rounded-lg">
                <Phone className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Support</h3>
                <p className="text-gray-600">Available 24/7 via email</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 p-3 rounded-lg">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Community</h3>
                <p className="text-gray-600">Global Bitcoin Cash Community</p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">About BCH Content Hub</h3>
            <p className="text-gray-600 text-sm mb-4">
              We're a community-driven platform dedicated to curating and sharing 
              high-quality Bitcoin Cash content. Our mission is to educate, inform, 
              and connect the Bitcoin Cash community worldwide.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="inline-block bg-[#16a085]/10 text-[#16a085] text-xs px-2 py-1 rounded">
                Educational Content
              </span>
              <span className="inline-block bg-[#f39c12]/10 text-[#f39c12] text-xs px-2 py-1 rounded">
                Market Analysis
              </span>
              <span className="inline-block bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded">
                Community News
              </span>
              <span className="inline-block bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded">
                Technical Updates
              </span>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Send Us a Message
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#16a085] focus:border-[#16a085]"
                  placeholder="Your full name"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#16a085] focus:border-[#16a085]"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#16a085] focus:border-[#16a085]"
                placeholder="What is this about?"
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-[#16a085] focus:border-[#16a085]"
                placeholder="Tell us how we can help you..."
                required
              />
            </div>
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#16a085] hover:bg-[#0e7a6b] text-white"
            >
              {loading ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {loading ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}