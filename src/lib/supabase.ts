import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ecrncalnzyyhnejlazbj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjcm5jYWxuenl5aG5lamxhemJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMjA2NDUsImV4cCI6MjA3MDU5NjY0NX0.l3_c09h3HLitZNnA53MZFbN9vYRnj-_E3uVEPeniiQ8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database entities
export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role: 'admin' | 'user'
  created_at: string
  updated_at: string
}

export interface YouTubeChannel {
  id: string
  channel_id: string
  channel_name: string
  channel_description?: string
  channel_thumbnail?: string
  subscriber_count: number
  video_count: number
  is_active: boolean
  added_by?: string
  created_at: string
  updated_at: string
}

export interface Video {
  id: string
  video_id: string
  title: string
  description?: string
  thumbnail_url?: string
  channel_id: string
  publish_date?: string
  duration?: string
  view_count: number
  like_count: number
  comment_count: number
  is_featured: boolean
  is_approved: boolean
  keyword_matched: boolean
  matched_keywords: string[]
  created_at: string
  updated_at: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  featured_image_url?: string
  author_id: string
  status: 'draft' | 'published' | 'archived'
  view_count: number
  is_featured: boolean
  tags: string[]
  seo_title?: string
  seo_description?: string
  published_at?: string
  created_at: string
  updated_at: string
}

export interface ContactSubmission {
  id: string
  name: string
  email: string
  subject?: string
  message: string
  status: 'unread' | 'read' | 'responded' | 'archived'
  created_at: string
}

export interface ContentCategory {
  id: string
  name: string
  slug: string
  description?: string
  color: string
  icon?: string
  is_active: boolean
  created_at: string
}