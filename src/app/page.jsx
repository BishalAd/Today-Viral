'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../components/AuthProvider'
import { supabase } from '../lib/supabaseClient'
import Link from 'next/link'
import { 
  Home, 
  TrendingUp, 
  User, 
  Plus, 
  LogIn,
  Users,
  Video
} from 'lucide-react'

export default function HomePage() {
  const { user, signOut } = useAuth()
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfiles()
  }, [])

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProfiles(data || [])
    } catch (error) {
      console.error('Error fetching profiles:', error)
    } finally {
      setLoading(false)
    }
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
                Today Viral
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <Link 
                    href="/create"
                    className="bg-primary hover:bg-primary/90 text-white p-2 rounded-full transition-colors"
                  >
                    <Plus size={20} />
                  </Link>
                  <button
                    onClick={signOut}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <LogIn size={20} />
                  </button>
                </div>
              ) : (
                <Link 
                  href="/auth"
                  className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Discover <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Viral</span> Content
          </h1>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            Explore trending videos from TikTok, Instagram Reels, YouTube Shorts and more. 
            Share your favorite content and go viral!
          </p>
          
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/auth"
                className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full font-medium transition-colors"
              >
                Get Started
              </Link>
              <Link 
                href="/go-viral"
                className="border border-gray-600 hover:border-gray-400 text-white px-8 py-3 rounded-full font-medium transition-colors"
              >
                Explore Content
              </Link>
            </div>
          )}
        </section>

        {/* Features Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-card p-6 rounded-2xl border border-gray-800">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-4">
              <Video className="text-primary" size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Multiple Platforms</h3>
            <p className="text-gray-400">
              Share videos from TikTok, Instagram, YouTube, Facebook and more
            </p>
          </div>
          
          <div className="bg-card p-6 rounded-2xl border border-gray-800">
            <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="text-secondary" size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Go Viral</h3>
            <p className="text-gray-400">
              Discover trending content and get your videos seen by thousands
            </p>
          </div>
          
          <div className="bg-card p-6 rounded-2xl border border-gray-800">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
              <Users className="text-purple-500" size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Community</h3>
            <p className="text-gray-400">
              Connect with creators and engage with amazing content
            </p>
          </div>
        </section>

        {/* Profiles Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Featured Creators</h2>
            <span className="text-gray-400">{profiles.length} creators</span>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-card rounded-2xl p-4 animate-pulse">
                  <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-3"></div>
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-3/4 mx-auto"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {profiles.map((profile) => (
                <Link 
                  key={profile.id}
                  href={`/profile/${profile.id}`}
                  className="bg-card hover:bg-card/80 rounded-2xl p-4 text-center transition-colors border border-gray-800 hover:border-gray-600"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-lg">
                    {profile.username?.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="font-semibold mb-1">@{profile.username}</h3>
                  <p className="text-gray-400 text-sm truncate">{profile.bio}</p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-dark/80 backdrop-blur-md border-t border-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-around items-center">
            <Link href="/" className="flex flex-col items-center text-primary">
              <Home size={24} />
              <span className="text-xs mt-1">Home</span>
            </Link>
            <Link href="/go-viral" className="flex flex-col items-center text-gray-400 hover:text-white">
              <TrendingUp size={24} />
              <span className="text-xs mt-1">Go Viral</span>
            </Link>
            {user ? (
              <Link href="/profile" className="flex flex-col items-center text-gray-400 hover:text-white">
                <User size={24} />
                <span className="text-xs mt-1">Profile</span>
              </Link>
            ) : (
              <Link href="/auth" className="flex flex-col items-center text-gray-400 hover:text-white">
                <LogIn size={24} />
                <span className="text-xs mt-1">Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </nav>
    </div>
  )
}