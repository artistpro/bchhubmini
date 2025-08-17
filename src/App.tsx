import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from '@/contexts/AuthContext'
import { VideoModalProvider } from '@/contexts/VideoModalContext'
import { Layout } from '@/components/Layout'
import { VideoModal } from '@/components/VideoModal'
import { Home } from '@/pages/Home'
import { Videos } from '@/pages/Videos'
import { VideoPage } from '@/pages/VideoPage'
import { Blog } from '@/pages/Blog'
import { BlogPost } from '@/pages/BlogPost'
import { Contact } from '@/pages/Contact'
import { Login } from '@/pages/Login'
import { AdminDashboard, AdminChannels, AdminVideos, AdminBlog, AdminAnalytics, AdminContact } from '@/pages/admin'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Toaster } from '@/components/ui/toaster'
import './App.css'

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <VideoModalProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Layout>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/videos" element={<Videos />} />
                  <Route path="/video/:videoId" element={<VideoPage />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/login" element={<Login />} />
                  
                  {/* Admin Routes */}
                  <Route path="/admin" element={
                    <ProtectedRoute adminOnly>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/channels" element={
                    <ProtectedRoute adminOnly>
                      <AdminChannels />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/videos" element={
                    <ProtectedRoute adminOnly>
                      <AdminVideos />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/blog" element={
                    <ProtectedRoute adminOnly>
                      <AdminBlog />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/analytics" element={
                    <ProtectedRoute adminOnly>
                      <AdminAnalytics />
                    </ProtectedRoute>
                  } />
                  <Route path="/admin/contact" element={
                    <ProtectedRoute adminOnly>
                      <AdminContact />
                    </ProtectedRoute>
                  } />
                  
                  {/* Catch all route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
              <Toaster />
              <VideoModal />
            </div>
          </Router>
        </VideoModalProvider>
      </AuthProvider>
    </HelmetProvider>
  )
}

export default App