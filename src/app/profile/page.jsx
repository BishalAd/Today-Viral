'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../components/AuthProvider'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Home, 
  TrendingUp, 
  User, 
  Settings, 
  Edit3,
  Video,
  Heart,
  MessageCircle,
  LogOut,
  Camera,
  Save,
  X
} from 'lucide-react'

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [userPosts, setUserPosts] = useState([])
  const [likedPosts, setLikedPosts] = useState([])
  const [activeTab, setActiveTab] = useState('posts')
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    username: '',
    full_name: '',
    bio: '',
    website: ''
  })

  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }
    fetchProfile()
    fetchUserPosts()
    fetchLikedPosts()
  }, [user, router])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setProfile(data)
      setEditForm({
        username: data.username || '',
        full_name: data.full_name || '',
        bio: data.bio || '',
        website: data.website || ''
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const fetchUserPosts = async () => {
    try {
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
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setUserPosts(data || [])
    } catch (error) {
      console.error('Error fetching user posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLikedPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('likes')
        .select(`
          posts (
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
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setLikedPosts(data?.map(item => item.posts) || [])
    } catch (error) {
      console.error('Error fetching liked posts:', error)
    }
  }

  const handleUpdateProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(editForm)
        .eq('id', user.id)

      if (error) throw error

      setProfile(prev => ({ ...prev, ...editForm }))
      setEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'tiktok': return '🎵'
      case 'instagram': return '📷'
      case 'youtube': return '▶️'
      case 'facebook': return '👥'
      default: return '📱'
    }
  }

  const stats = [
    { label: 'Posts', value: userPosts.length },
    { label: 'Likes', value: userPosts.reduce((sum, post) => sum + (post.likes_count || 0), 0) },
    { label: 'Comments', value: userPosts.reduce((sum, post) => sum + (post.comments_count || 0), 0) }
  ]

  if (!user) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <p>Redirecting to login...</p>
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
              <h1 className="text-xl font-bold">Profile</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link 
                href="/create"
                className="bg-primary hover:bg-primary/90 text-white p-2 rounded-full transition-colors"
              >
                <Video size={20} />
              </Link>
              <button
                onClick={handleSignOut}
                className="text-gray-400 hover:text-white transition-colors p-2"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="pb-20">
        {/* Profile Header */}
        <div className="relative">
          {/* Cover Photo */}
          <div className="h-32 bg-gradient-to-r from-primary to-secondary"></div>
          
          {/* Profile Info */}
          <div className="px-4 -mt-16 relative z-10">
            <div className="bg-card rounded-2xl p-6 border border-gray-800">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  {/* Avatar */}
                  <div className="w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-dark">
                    {profile?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  
                  {/* User Info */}
                  <div className="flex-1">
                    {editing ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editForm.username}
                          onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                          placeholder="Username"
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                        />
                        <input
                          type="text"
                          value={editForm.full_name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                          placeholder="Full Name"
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                        />
                        <textarea
                          value={editForm.bio}
                          onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                          placeholder="Bio"
                          rows={2}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary resize-none"
                        />
                        <input
                          type="url"
                          value={editForm.website}
                          onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                          placeholder="Website"
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                        />
                      </div>
                    ) : (
                      <div>
                        <h2 className="text-xl font-bold">@{profile?.username}</h2>
                        <p className="text-gray-300">{profile?.full_name}</p>
                        <p className="text-gray-400 text-sm mt-2">{profile?.bio}</p>
                        {profile?.website && (
                          <a 
                            href={profile.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary text-sm hover:underline"
                          >
                            {profile.website}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Edit Button */}
                <div className="flex space-x-2">
                  {editing ? (
                    <>
                      <button
                        onClick={handleUpdateProfile}
                        className="bg-primary hover:bg-primary/90 text-white p-2 rounded-full transition-colors"
                      >
                        <Save size={16} />
                      </button>
                      <button
                        onClick={() => setEditing(false)}
                        className="bg-gray-600 hover:bg-gray-500 text-white p-2 rounded-full transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setEditing(true)}
                      className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-full transition-colors"
                    >
                      <Edit3 size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-800">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-lg font-bold">{stat.value}</div>
                    <div className="text-gray-400 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-800 mt-6">
          <div className="container mx-auto px-4">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('posts')}
                className={`pb-4 px-2 border-b-2 transition-colors ${
                  activeTab === 'posts'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Video size={18} />
                  <span>My Posts</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('likes')}
                className={`pb-4 px-2 border-b-2 transition-colors ${
                  activeTab === 'likes'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Heart size={18} />
                  <span>Liked</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-6">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[9/16] bg-gray-800 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : activeTab === 'posts' ? (
            <div>
              {userPosts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Video className="text-gray-400" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                  <p className="text-gray-400 mb-6">Share your first viral video!</p>
                  <Link
                    href="/create"
                    className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-full font-medium transition-colors"
                  >
                    Create Post
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {userPosts.map(post => (
                    <Link
                      key={post.id}
                      href={`/go-viral`}
                      className="group relative aspect-[9/16] bg-black rounded-xl overflow-hidden"
                    >
                      <video
                        src={post.video_url}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="text-white text-center">
                          <div className="text-lg mb-1">{getPlatformIcon(post.platform)}</div>
                          <div className="flex items-center justify-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <Heart size={14} />
                              <span>{post.likes_count}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageCircle size={14} />
                              <span>{post.comments_count}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              {likedPosts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="text-gray-400" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No liked posts</h3>
                  <p className="text-gray-400">Posts you like will appear here</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {likedPosts.map(post => (
                    <Link
                      key={post.id}
                      href={`/go-viral`}
                      className="group relative aspect-[9/16] bg-black rounded-xl overflow-hidden"
                    >
                      <video
                        src={post.video_url}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="text-white text-center">
                          <div className="text-lg mb-1">{getPlatformIcon(post.platform)}</div>
                          <div className="text-sm">@{post.profiles?.username}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-dark/80 backdrop-blur-md border-t border-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-around items-center">
            <Link href="/" className="flex flex-col items-center text-gray-400 hover:text-white">
              <Home size={24} />
              <span className="text-xs mt-1">Home</span>
            </Link>
            <Link href="/go-viral" className="flex flex-col items-center text-gray-400 hover:text-white">
              <TrendingUp size={24} />
              <span className="text-xs mt-1">Go Viral</span>
            </Link>
            <Link href="/profile" className="flex flex-col items-center text-primary">
              <span className="w-2 h-2 bg-primary rounded-full mb-1"></span>
              <span className="text-xs">Profile</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  )
}