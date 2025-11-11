'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from './AuthProvider'
import { supabase } from '../lib/supabaseClient'
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  Play,
  Pause,
  Volume2,
  VolumeX
} from 'lucide-react'

export default function VideoCard({ post, onUpdate, autoPlay = false }) {
  const { user } = useAuth()
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [isMuted, setIsMuted] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [comments, setComments] = useState([])
  const [loadingComments, setLoadingComments] = useState(false)
  const [loadingLike, setLoadingLike] = useState(false)

  // Check if user has liked this post
  useEffect(() => {
    if (user && post.likes) {
      const userLike = post.likes.find(like => like.user_id === user.id)
      setIsLiked(!!userLike)
    }
  }, [user, post.likes])

  // Video play/pause logic
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => setIsPlaying(false)

    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)

    return () => {
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
    }
  }, [])

  // Auto-play when in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            videoRef.current?.play().catch(console.error)
          } else {
            videoRef.current?.pause()
          }
        })
      },
      { threshold: 0.5 }
    )

    if (videoRef.current) {
      observer.observe(videoRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play().catch(console.error)
      }
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleLike = async () => {
    if (!user) return

    setLoadingLike(true)
    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', post.id)

        if (error) throw error
        
        onUpdate(post.id, {
          likes_count: Math.max(0, post.likes_count - 1)
        })
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert({
            user_id: user.id,
            post_id: post.id
          })

        if (error) throw error
        
        onUpdate(post.id, {
          likes_count: post.likes_count + 1
        })
      }
      
      setIsLiked(!isLiked)
    } catch (error) {
      console.error('Error toggling like:', error)
    } finally {
      setLoadingLike(false)
    }
  }

  const fetchComments = async () => {
    if (comments.length > 0) return // Already loaded

    setLoadingComments(true)
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .eq('post_id', post.id)
        .order('created_at', { ascending: true })

      if (error) throw error
      setComments(data || [])
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoadingComments(false)
    }
  }

  const handleAddComment = async () => {
    if (!user || !commentText.trim()) return

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          user_id: user.id,
          post_id: post.id,
          content: commentText.trim()
        })
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .single()

      if (error) throw error

      setComments(prev => [...prev, data])
      setCommentText('')
      
      onUpdate(post.id, {
        comments_count: post.comments_count + 1
      })
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  const toggleComments = () => {
    if (!showComments) {
      fetchComments()
    }
    setShowComments(!showComments)
  }

  const getPlatformIcon = () => {
    switch (post.platform) {
      case 'tiktok': return '🎵'
      case 'instagram': return '📷'
      case 'youtube': return '▶️'
      case 'facebook': return '👥'
      default: return '📱'
    }
  }

  return (
    <div className="relative bg-black min-h-screen flex flex-col">
      {/* Video Container */}
      <div className="relative flex-1 flex items-center justify-center">
        <video
          ref={videoRef}
          src={post.video_url}
          className="w-full h-full object-contain max-h-screen"
          loop
          muted={isMuted}
          playsInline
          poster={post.thumbnail_url}
        />
        
        {/* Video Overlay Controls */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            className={`p-4 rounded-full bg-black/50 text-white transition-opacity ${
              isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'
            }`}
          >
            {isPlaying ? <Pause size={48} /> : <Play size={48} />}
          </button>
        </div>

        {/* Top Gradient Overlay */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/50 to-transparent" />
        
        {/* Bottom Gradient Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      {/* Content Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        {/* Post Info */}
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm bg-white/20 px-2 py-1 rounded-full">
              {getPlatformIcon()} {post.platform}
            </span>
          </div>
          <h3 className="text-lg font-semibold mb-2 line-clamp-2">
            {post.title}
          </h3>
          <p className="text-gray-300 text-sm line-clamp-2">
            {post.description}
          </p>
        </div>

        {/* Creator Info */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold">
            {post.profiles?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <p className="font-semibold">@{post.profiles?.username}</p>
            <p className="text-gray-300 text-sm">{post.profiles?.full_name}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Like Button */}
            <button
              onClick={handleLike}
              disabled={loadingLike || !user}
              className="flex flex-col items-center space-y-1 disabled:opacity-50"
            >
              <div className={`p-2 rounded-full transition-colors ${
                isLiked ? 'bg-primary/20' : 'bg-white/10'
              }`}>
                <Heart 
                  size={24} 
                  className={isLiked ? 'fill-primary text-primary' : ''}
                />
              </div>
              <span className="text-xs">{post.likes_count}</span>
            </button>

            {/* Comment Button */}
            <button
              onClick={toggleComments}
              disabled={!user}
              className="flex flex-col items-center space-y-1 disabled:opacity-50"
            >
              <div className="p-2 rounded-full bg-white/10">
                <MessageCircle size={24} />
              </div>
              <span className="text-xs">{post.comments_count}</span>
            </button>

            {/* Share Button */}
            <button className="flex flex-col items-center space-y-1">
              <div className="p-2 rounded-full bg-white/10">
                <Share2 size={24} />
              </div>
              <span className="text-xs">Share</span>
            </button>
          </div>

          {/* Volume Control */}
          <button
            onClick={toggleMute}
            className="p-2 rounded-full bg-white/10"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </div>

      {/* Comments Panel */}
      {showComments && (
        <div className="absolute inset-0 bg-dark z-50 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <h3 className="font-semibold">Comments ({post.comments_count})</h3>
            <button
              onClick={() => setShowComments(false)}
              className="p-2"
            >
              <MoreHorizontal size={20} />
            </button>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loadingComments ? (
              <div className="text-center text-gray-400">Loading comments...</div>
            ) : comments.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                No comments yet. Be the first to comment!
              </div>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className="flex space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {comment.profiles?.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-sm">
                        @{comment.profiles?.username}
                      </span>
                      <span className="text-gray-400 text-xs">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Comment */}
          {user && (
            <div className="p-4 border-t border-gray-800">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-primary"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddComment()
                    }
                  }}
                />
                <button
                  onClick={handleAddComment}
                  disabled={!commentText.trim()}
                  className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 rounded-full text-sm font-medium transition-colors"
                >
                  Post
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}