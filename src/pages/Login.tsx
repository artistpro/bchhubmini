import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Mail, Lock, User, Eye, EyeOff, Bitcoin } from 'lucide-react'
import { isValidEmail } from '@/lib/utils'

export function Login() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { user, signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/'
      navigate(from, { replace: true })
    }
  }, [user, navigate, location])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    // Validation
    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Please fill in all required fields')
      return
    }
    
    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address')
      return
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }
    
    if (isSignUp && !formData.fullName.trim()) {
      setError('Please enter your full name')
      return
    }

    try {
      setLoading(true)
      
      if (isSignUp) {
        const { data, error } = await signUp(
          formData.email.trim(),
          formData.password,
          formData.fullName.trim()
        )
        
        if (error) throw error
        
        // Show success message for sign up
        setError(null)
        alert('Account created successfully! Please check your email to verify your account.')
        setIsSignUp(false)
        setFormData({ email: formData.email, password: '', fullName: '' })
      } else {
        const { data, error } = await signIn(
          formData.email.trim(),
          formData.password
        )
        
        if (error) throw error
        
        // Redirect will happen via useEffect when user state updates
      }
    } catch (error: any) {
      console.error('Authentication error:', error)
      setError(error.message || 'Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="bg-gradient-to-r from-[#16a085] to-[#f39c12] p-2 rounded-lg">
              <Bitcoin className="h-8 w-8 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              BCH <span className="text-[#16a085]">Content Hub</span>
            </span>
          </Link>
          
          <h2 className="text-3xl font-bold text-gray-900">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isSignUp ? (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false)
                    setError(null)
                    setFormData({ email: '', password: '', fullName: '' })
                  }}
                  className="font-medium text-[#16a085] hover:text-[#0e7a6b]"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true)
                    setError(null)
                    setFormData({ email: '', password: '', fullName: '' })
                  }}
                  className="font-medium text-[#16a085] hover:text-[#0e7a6b]"
                >
                  Sign up
                </button>
              </>
            )}
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          
          <div className="space-y-4">
            {isSignUp && (
              <div>
                <label htmlFor="fullName" className="sr-only">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md placeholder-gray-500 focus:ring-[#16a085] focus:border-[#16a085]"
                    placeholder="Full name"
                    required={isSignUp}
                  />
                </div>
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md placeholder-gray-500 focus:ring-[#16a085] focus:border-[#16a085]"
                  placeholder="Email address"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md placeholder-gray-500 focus:ring-[#16a085] focus:border-[#16a085]"
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#16a085] hover:bg-[#0e7a6b] text-white py-3"
            >
              {loading ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : null}
              {loading 
                ? (isSignUp ? 'Creating account...' : 'Signing in...') 
                : (isSignUp ? 'Create account' : 'Sign in')
              }
            </Button>
          </div>

          {!isSignUp && (
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Forgot your password? Contact support at{' '}
                <Link to="/contact" className="font-medium text-[#16a085] hover:text-[#0e7a6b]">
                  contact@bchcontenthub.com
                </Link>
              </p>
            </div>
          )}
        </form>

        {/* Back to Home */}
        <div className="text-center">
          <Link 
            to="/" 
            className="text-sm text-gray-600 hover:text-[#16a085] transition-colors"
          >
            ← Back to BCH Content Hub
          </Link>
        </div>
      </div>
    </div>
  )
}