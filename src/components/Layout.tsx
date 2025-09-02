import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Menu, X, User, LogOut, Settings, Bitcoin, Copy, ExternalLink, Coffee } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [copiedAddress, setCopiedAddress] = useState(false)
  const { user, profile, signOut, isAdmin } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'BCH Videos', href: '/videos' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
  ]

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const copyBitcoinAddress = async () => {
    const address = 'bitcoincash:qrmyh2x674uka3jls0rwv7rnpwgty2kr3ckagu7ltu'
    try {
      await navigator.clipboard.writeText(address)
      setCopiedAddress(true)
      setTimeout(() => setCopiedAddress(false), 2000)
    } catch (error) {
      console.error('Failed to copy address:', error)
    }
  }

  return (
    <>
      <Helmet>
        <title>BCH Content Hub - Bitcoin Cash Content Curation</title>
        <meta name="description" content="Your centralized platform for Bitcoin Cash content from across the web. Discover, curate, and stay updated with the latest BCH news, analysis, and education." />
        <meta name="keywords" content="Bitcoin Cash, BCH, cryptocurrency, blockchain, digital currency, peer-to-peer cash" />
        <meta property="og:title" content="BCH Content Hub - Bitcoin Cash Content Curation" />
        <meta property="og:description" content="Your centralized platform for Bitcoin Cash content from across the web. Discover, curate, and stay updated with the latest BCH news, analysis, and education." />
        <meta property="og:image" content={`${window.location.origin}/images/bch-hub-preview.jpg`} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="BCH Content Hub" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="BCH Content Hub - Bitcoin Cash Content Curation" />
        <meta name="twitter:description" content="Your centralized platform for Bitcoin Cash content from across the web. Discover, curate, and stay updated with the latest BCH news, analysis, and education." />
        <meta name="twitter:image" content={`${window.location.origin}/images/bch-hub-preview.jpg`} />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-[#16a085]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-[#16a085] to-[#f39c12] p-2 rounded-lg">
                <Bitcoin className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  BCH <span className="text-[#16a085]">Content Hub</span>
                </h1>
                <p className="text-sm text-gray-600">Bitcoin Cash Content Curation</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    location.pathname === item.href
                      ? 'text-[#16a085] bg-green-50'
                      : 'text-gray-700 hover:text-[#16a085] hover:bg-gray-50'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  {isAdmin && (
                    <Link to="/admin">
                      <Button variant="outline" size="sm" className="border-[#16a085] text-[#16a085] hover:bg-[#16a085] hover:text-white">
                        <Settings className="h-4 w-4 mr-2" />
                        Admin
                      </Button>
                    </Link>
                  )}
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-gray-600" />
                    <span className="text-sm text-gray-700">
                      {profile?.full_name || user.email}
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleSignOut}
                    className="text-gray-600 hover:text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Link to="/login">
                  <Button className="bg-[#16a085] hover:bg-[#0e7a6b] text-white">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4">
              <nav className="flex flex-col space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'px-3 py-2 rounded-md text-base font-medium transition-colors',
                      location.pathname === item.href
                        ? 'text-[#16a085] bg-green-50'
                        : 'text-gray-700 hover:text-[#16a085] hover:bg-gray-50'
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
                
                {user ? (
                  <div className="pt-4 border-t border-gray-200">
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#16a085]"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleSignOut()
                        setMobileMenuOpen(false)
                      }}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 text-base font-medium text-[#16a085] hover:bg-green-50"
                  >
                    Sign In
                  </Link>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Enhanced Footer with Support Information */}
      <footer className="bg-gray-900 text-white">
        {/* Support Section */}
        <div className="bg-gradient-to-r from-[#16a085] to-[#f39c12] py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-4">
                ¡Support Bitcoin Cash Adoption!
              </h3>
              <p className="text-lg text-white/90 mb-6 max-w-4xl mx-auto leading-relaxed">
                Support our work spreading Bitcoin Cash ideas, defending freedom, and promoting decentralized technologies! Your donation drives the creation of educational content and events for a freer future. Contribute today to::
              </p>
              
              {/* Donation Section */}
              <div className="bg-white/10 backdrop-blur rounded-lg p-6 max-w-2xl mx-auto">
                <div className="flex items-center justify-center mb-4">
                  <img 
                    src="/assets/coffee-bch-icon.png" 
                    alt="Bitcoin Cash Coffee" 
                    className="h-12 w-12 mr-3"
                  />
                  <span className="text-lg font-semibold text-white">
                    Support this platform by buying me a coffee with Bitcoin Cash:
                  </span>
                </div>
                
                <div className="bg-black/20 rounded-lg p-4 border border-white/20">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <code className="text-sm text-white font-mono break-all flex-1">
                      bitcoincash:qrmyh2x674uka3jls0rwv7rnpwgty2kr3ckagu7ltu
                    </code>
                    <Button
                      onClick={copyBitcoinAddress}
                      size="sm"
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30 ml-2"
                    >
                      {copiedAddress ? (
                        <span className="text-green-300">¡Copiado!</span>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Copiar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Platform Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-[#16a085] to-[#f39c12] p-2 rounded-lg">
                  <Bitcoin className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">BCH Content Hub</h3>
              </div>
              <p className="text-gray-400 mb-4">
                Your centralized platform for discovering, curating, and staying updated with the latest Bitcoin Cash content from across the web.
              </p>
              
              {/* Telegram Channel */}
              <div className="mb-4">
                <a 
                  href="https://t.me/+OvqF4keZcTYwMmNh" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="font-medium">Canal Telegram</span>
                </a>
              </div>
              
              <p className="text-sm text-gray-500">
                © 2025 BCH Content Hub. Built with passion for the Bitcoin Cash community.
              </p>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-[#16a085] transition-colors">Home</Link></li>
                <li><Link to="/videos" className="text-gray-400 hover:text-[#16a085] transition-colors">BCH Videos</Link></li>
                <li><Link to="/blog" className="text-gray-400 hover:text-[#16a085] transition-colors">Blog</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-[#16a085] transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            {/* Community Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Community</h4>
              <ul className="space-y-2">
                <li><a href="https://bitcoincash.org" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#16a085] transition-colors">Bitcoin Cash</a></li>
                <li><a href="https://github.com/bitcoincash" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#16a085] transition-colors">GitHub</a></li>
                <li><a href="https://www.reddit.com/r/btc" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#16a085] transition-colors">Reddit</a></li>
                <li><a href="https://twitter.com/bitcoincash" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#16a085] transition-colors">Twitter</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500">
              <p>Supporting Bitcoin Cash adoption worldwide</p>
              <p className="mt-2 sm:mt-0">Built for the community, by the community</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </>
  )
}
