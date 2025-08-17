import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Play, FileText, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { FeaturedContent } from '@/components/FeaturedContent'
import { LatestVideos } from '@/components/LatestVideos'
import { LatestBlogPosts } from '@/components/LatestBlogPosts'
import { StatsSection } from '@/components/StatsSection'

export function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#16a085] via-[#1abc9c] to-[#f39c12] text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up">
              Bitcoin Cash
              <span className="block text-yellow-300">Content Hub</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Discover, curate, and stay updated with the latest Bitcoin Cash content from across the web. Your centralized platform for BCH news, analysis, and education.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/videos">
                <Button size="lg" className="bg-white text-[#16a085] hover:bg-gray-100 font-semibold">
                  <Play className="mr-2 h-5 w-5" />
                  Explore Videos
                </Button>
              </Link>
              <Link to="/blog">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#16a085] font-semibold">
                  <FileText className="mr-2 h-5 w-5" />
                  Read Articles
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection />

      {/* Featured Content */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Content
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hand-picked content from our administrators to keep you informed about the most important Bitcoin Cash developments.
            </p>
          </div>
          <FeaturedContent />
        </div>
      </section>

      {/* Latest Videos */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Latest BCH Videos
              </h2>
              <p className="text-lg text-gray-600">
                Recently published videos from our curated YouTube channels.
              </p>
            </div>
            <Link to="/videos">
              <Button variant="outline" className="border-[#16a085] text-[#16a085] hover:bg-[#16a085] hover:text-white">
                View All Videos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <LatestVideos limit={6} />
        </div>
      </section>

      {/* Latest Blog Posts */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Latest Articles
              </h2>
              <p className="text-lg text-gray-600">
                In-depth analysis, news, and educational content about Bitcoin Cash.
              </p>
            </div>
            <Link to="/blog">
              <Button variant="outline" className="border-[#16a085] text-[#16a085] hover:bg-[#16a085] hover:text-white">
                View All Articles
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <LatestBlogPosts limit={3} />
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-[#16a085] to-[#f39c12]">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Stay Updated with Bitcoin Cash
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join our community and never miss important Bitcoin Cash updates, analysis, and educational content.
          </p>
          <Link to="/contact">
            <Button size="lg" className="bg-white text-[#16a085] hover:bg-gray-100 font-semibold">
              Get In Touch
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}