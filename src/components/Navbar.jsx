'use client'

import { useAuth } from './AuthProvider'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  TrendingUp, 
  User, 
  Plus,
  LogIn
} from 'lucide-react'

export default function Navbar() {
  const { user } = useAuth()
  const pathname = usePathname()

  const isActive = (path) => pathname === path

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-dark/80 backdrop-blur-md border-t border-gray-800 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-around items-center">
          {/* Home */}
          <Link 
            href="/" 
            className={`flex flex-col items-center transition-colors ${
              isActive('/') ? 'text-primary' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Home size={24} />
            <span className="text-xs mt-1">Home</span>
          </Link>

          {/* Go Viral */}
          <Link 
            href="/go-viral" 
            className={`flex flex-col items-center transition-colors ${
              isActive('/go-viral') ? 'text-primary' : 'text-gray-400 hover:text-white'
            }`}
          >
            <TrendingUp size={24} />
            <span className="text-xs mt-1">Go Viral</span>
          </Link>

          {/* Create Post (Floating) */}
          {user && (
            <Link 
              href="/create" 
              className="flex flex-col items-center -mt-8"
            >
              <div className="bg-gradient-to-r from-primary to-secondary p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow">
                <Plus size={24} className="text-white" />
              </div>
            </Link>
          )}

          {/* Profile / Auth */}
          {user ? (
            <Link 
              href="/profile" 
              className={`flex flex-col items-center transition-colors ${
                isActive('/profile') ? 'text-primary' : 'text-gray-400 hover:text-white'
              }`}
            >
              <User size={24} />
              <span className="text-xs mt-1">Profile</span>
            </Link>
          ) : (
            <Link 
              href="/auth" 
              className={`flex flex-col items-center transition-colors ${
                isActive('/auth') ? 'text-primary' : 'text-gray-400 hover:text-white'
              }`}
            >
              <LogIn size={24} />
              <span className="text-xs mt-1">Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}