'use client'

import { useState } from 'react'
import { useAuth } from '../../components/AuthProvider'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Eye, EyeOff, Loader } from 'lucide-react'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signUp, signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        const { error } = await signIn({ email, password })
        if (error) throw error
        // Profile will be automatically created by AuthProvider
        router.push('/profile')
      } else {
        const { error } = await signUp({ 
          email, 
          password,
          options: {
            data: {
              username: username || email.split('@')[0], // Fallback to email username
              full_name: fullName || email.split('@')[0] // Fallback to email username
            }
          }
        })
        if (error) throw error
        
        // Show success message and redirect
        // The AuthProvider will automatically create the profile
        setTimeout(() => {
          router.push('/profile')
        }, 1000)
      }
    } catch (error) {
      console.error('Auth error:', error)
      setError(error.message || 'An error occurred during authentication')
    } finally {
      setLoading(false)
    }
  }

  // Generate username from email when email changes for signup
  const handleEmailChange = (e) => {
    const newEmail = e.target.value
    setEmail(newEmail)
    
    // Auto-generate username from email for signup form
    if (!isLogin && newEmail.includes('@') && !username) {
      const generatedUsername = newEmail.split('@')[0]
      setUsername(generatedUsername)
    }
  }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link 
          href="/"
          className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Home
        </Link>

        {/* Auth Card */}
        <div className="bg-card rounded-2xl p-8 border border-gray-800">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-white font-bold text-lg">TV</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">
              {isLogin ? 'Welcome Back' : 'Join Today Viral'}
            </h1>
            <p className="text-gray-400">
              {isLogin ? 'Sign in to your account' : 'Create your account to start sharing'}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                    placeholder="Choose a username"
                    required
                    minLength={3}
                    maxLength={50}
                    pattern="[a-zA-Z0-9_]+"
                    title="Username can only contain letters, numbers, and underscores"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Letters, numbers, and underscores only
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                    placeholder="Your full name (optional)"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors pr-12"
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Minimum 6 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  <span>Please wait...</span>
                </>
              ) : (
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
                // Clear form when switching modes
                if (!isLogin) {
                  setUsername('')
                  setFullName('')
                }
              }}
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>

          {/* Additional info for signup */}
          {!isLogin && (
            <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-300 mb-2">🎉 What you get:</h4>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Share videos from any platform</li>
                <li>• Discover viral content</li>
                <li>• Build your creator profile</li>
                <li>• Connect with other creators</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}