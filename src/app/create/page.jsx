'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../components/AuthProvider'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Video, 
  Link2, 
  Loader,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

const PLATFORMS = {
  tiktok: { name: 'TikTok', icon: '🎵', domains: ['tiktok.com', 'vm.tiktok.com'] },
  instagram: { name: 'Instagram', icon: '📷', domains: ['instagram.com'] },
  youtube: { name: 'YouTube', icon: '▶️', domains: ['youtube.com', 'youtu.be'] },
  facebook: { name: 'Facebook', icon: '👥', domains: ['facebook.com', 'fb.watch'] }
}

export default function CreatePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [videoUrl, setVideoUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [detectedPlatform, setDetectedPlatform] = useState(null)
  const [previewData, setPreviewData] = useState(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/auth')
    }
  }, [user, router])

  // Detect platform from URL
  useEffect(() => {
    if (!videoUrl) {
      setDetectedPlatform(null)
      setPreviewData(null)
      return
    }

    try {
      const url = new URL(videoUrl)
      const platform = Object.entries(PLATFORMS).find(([_, data]) =>
        data.domains.some(domain => url.hostname.includes(domain))
      )

      if (platform) {
        setDetectedPlatform(platform[0])
        setError('')
      } else {
        setDetectedPlatform(null)
        setError('Unsupported platform. Please use TikTok, Instagram, YouTube, or Facebook.')
      }
    } catch {
      setDetectedPlatform(null)
      setError('Please enter a valid URL')
    }
  }, [videoUrl])

  const extractVideoId = (url, platform) => {
    try {
      const urlObj = new URL(url)
      
      switch (platform) {
        case 'youtube':
          if (urlObj.hostname === 'youtu.be') {
            return urlObj.pathname.slice(1)
          }
          return urlObj.searchParams.get('v')
        case 'tiktok':
          // TikTok URL pattern: https://www.tiktok.com/@username/video/123456789
          const match = url.match(/\/video\/(\d+)/)
          return match ? match[1] : null
        case 'instagram':
          // Instagram URL pattern: https://www.instagram.com/reel/ABC123/
          const reelMatch = url.match(/\/reel\/([^/?]+)/)
          return reelMatch ? reelMatch[1] : null
        default:
          return null
      }
    } catch {
      return null
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user || !detectedPlatform || !videoUrl) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // For now, we'll use the direct URL
      // In production, you'd want to process the video through your backend
      const videoId = extractVideoId(videoUrl, detectedPlatform)
      
      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          title: title || `Video from ${PLATFORMS[detectedPlatform].name}`,
          description: description || `Shared from ${PLATFORMS[detectedPlatform].name}`,
          video_url: videoUrl,
          platform: detectedPlatform,
          thumbnail_url: `https://img.youtube.com/vi/${videoId || 'default'}/hqdefault.jpg` // Fallback thumbnail
        })
        .select()
        .single()

      if (error) throw error

      setSuccess('Video posted successfully!')
      setVideoUrl('')
      setTitle('')
      setDescription('')
      
      // Redirect to the post after a delay
      setTimeout(() => {
        router.push('/go-viral')
      }, 2000)
    } catch (error) {
      console.error('Error creating post:', error)
      setError(error.message || 'Failed to create post')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin text-primary mx-auto mb-4" size={32} />
          <p>Loading...</p>
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
            <div className="flex items-center space-x-3">
              <Link 
                href="/go-viral"
                className="p-2 hover:bg-gray-800 rounded-full transition-colors"
              >
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-xl font-bold">Share Video</h1>
                <p className="text-gray-400 text-sm">Post content from any platform</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* URL Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Video URL
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Link2 size={20} />
              </div>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Paste TikTok, Instagram, YouTube, or Facebook video URL"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>
            
            {/* Platform Detection */}
            {detectedPlatform && (
              <div className="flex items-center space-x-2 mt-3 text-green-400">
                <CheckCircle size={16} />
                <span className="text-sm">
                  {PLATFORMS[detectedPlatform].icon} {PLATFORMS[detectedPlatform].name} video detected
                </span>
              </div>
            )}
            
            {error && !detectedPlatform && (
              <div className="flex items-center space-x-2 mt-3 text-red-400">
                <AlertCircle size={16} />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add a catchy title..."
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
              maxLength={200}
            />
            <div className="text-right text-xs text-gray-400 mt-1">
              {title.length}/200
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your video..."
              rows={4}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors resize-none"
            />
          </div>

          {/* Supported Platforms */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-3">Supported Platforms</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(PLATFORMS).map(([key, platform]) => (
                <div
                  key={key}
                  className={`p-3 rounded-xl border-2 text-center transition-colors ${
                    detectedPlatform === key
                      ? 'border-primary bg-primary/10'
                      : 'border-gray-700 bg-gray-800'
                  }`}
                >
                  <div className="text-2xl mb-1">{platform.icon}</div>
                  <div className="text-xs font-medium">{platform.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-500 p-4 rounded-xl">
              {success}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !detectedPlatform || !videoUrl}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-4 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader className="animate-spin" size={20} />
                <span>Posting...</span>
              </>
            ) : (
              <>
                <Video size={20} />
                <span>Share Video</span>
              </>
            )}
          </button>
        </form>

        {/* Tips */}
        <div className="mt-8 p-4 bg-gray-800/50 rounded-xl">
          <h3 className="font-semibold mb-2">💡 Tips for sharing</h3>
          <ul className="text-sm text-gray-400 space-y-1">
            <li>• Copy the share link directly from the app</li>
            <li>• Make sure the video is public</li>
            <li>• Add an engaging title to get more views</li>
            <li>• Use relevant descriptions to help others discover your content</li>
          </ul>
        </div>
      </main>
    </div>
  )
}