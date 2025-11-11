import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '../components/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Today Viral - Trending Videos',
  description: 'Discover and share viral videos from TikTok, Instagram, YouTube and more',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-dark text-white">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}