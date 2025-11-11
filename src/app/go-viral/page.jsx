'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../../components/AuthProvider'
import { supabase } from '../../lib/supabaseClient'
import VideoCard from '../../components/VideoCard'
import { useInView } from 'react-intersection-observer'
import Link from 'next/link'
import { Home, User, Plus, Loader } from 'lucide-react'

export default function GoViralPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const page = useRef(1)
  const postsPerPage = 10

  const { ref, inView } = useInView({
    threshold: 0,
  })

  const fetchPosts = useCallback(async (pageNum = 1, refresh = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      const from = (pageNum - 1) * postsPerPage
      const to = from + postsPerPage - 1

      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            username,
            full_name,
            avatar_url
          ),
          likes!left (
            id,
            user_id
          )
        `)
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) throw error

      if (refresh) {
        setPosts(data || [])
      } else {
        setPosts(prev => [...prev, ...(data || [])])
      }

      // Check if there are more posts to load
      if (!data || data.length < postsPerPage) {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [postsPerPage])

  // Load more posts when scrolled to bottom
  useEffect(() => {
    if (inView && hasMore && !loadingMore) {
      page.current += 1
      fetchPosts(page.current)
    }
  }, [inView, hasMore, loadingMore, fetchPosts])

  // Initial load
  useEffect(() => {
    page.current = 1
    fetchPosts(1, true)
  }, [fetchPosts])

  // Handle post updates (likes, comments)
  const handlePostUpdate = (postId, updates) => {
    setPosts(prev => prev.map(post => 
      post.id === postId ? { ...post, ...updates } : post
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader className="animate-spin text-primary mb-4" size={32} />
          <p className="text-gray-400">Loading viral content...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-dark/80 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Go Viral
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {user && (
                <Link 
                  href="/create"
                  className="bg-primary hover:bg-primary/90 text-white p-2 rounded-full transition-colors"
                >
                  <Plus size={20} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Video Feed */}
      <main className="pb-20">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl">📱</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">No viral content yet</h2>
            <p className="text-gray-400 mb-6 max-w-md">
              Be the first to share amazing content from TikTok, Instagram, YouTube and more!
            </p>
            {user ? (
              <Link 
                href="/create"
                className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-full font-medium transition-colors"
              >
                Share Your First Video
              </Link>
            ) : (
              <Link 
                href="/auth"
                className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-full font-medium transition-colors"
              >
                Sign In to Share
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {posts.map((post, index) => (
              <VideoCard
                key={post.id}
                post={post}
                onUpdate={handlePostUpdate}
                autoPlay={index === 0} // Auto-play first video
              />
            ))}
            
            {/* Loading indicator */}
            {loadingMore && (
              <div className="flex justify-center py-8">
                <Loader className="animate-spin text-primary" size={24} />
              </div>
            )}
            
            {/* Infinite scroll trigger */}
            {hasMore && !loadingMore && (
              <div ref={ref} className="h-10" />
            )}
            
            {/* End of feed message */}
            {!hasMore && posts.length > 0 && (
              <div className="text-center py-8 text-gray-400">
                You've reached the end of viral content for now
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-dark/80 backdrop-blur-md border-t border-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-around items-center">
            <Link href="/" className="flex flex-col items-center text-gray-400 hover:text-white">
              <Home size={24} />
              <span className="text-xs mt-1">Home</span>
            </Link>
            <Link href="/go-viral" className="flex flex-col items-center text-primary">
              <span className="w-2 h-2 bg-primary rounded-full mb-1"></span>
              <span className="text-xs">Go Viral</span>
            </Link>
            {user ? (
              <Link href="/profile" className="flex flex-col items-center text-gray-400 hover:text-white">
                <User size={24} />
                <span className="text-xs mt-1">Profile</span>
              </Link>
            ) : (
              <Link href="/auth" className="flex flex-col items-center text-gray-400 hover:text-white">
                <span className="text-xs mt-1">Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </nav>
    </div>
  )
}