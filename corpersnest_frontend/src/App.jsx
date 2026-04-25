import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { ToastProvider } from '@/context/ToastContext'

import Navbar from '@/components/layout/Navbar'
import BottomNav from '@/components/layout/BottomNav'
import ProtectedRoute from '@/components/layout/ProtectedRoute'

import LandingPage from '@/pages/Landing'
import LoginPage from '@/pages/auth/Login'
import RegisterPage from '@/pages/auth/Register'
import ListingsPage from '@/pages/listings/ListingsPage'
import ListingDetail from '@/pages/listings/ListingDetail'
import NewListingPage from '@/pages/listings/NewListing'
import EditListingPage from '@/pages/listings/EditListing'
import FeedPage from '@/pages/feed/FeedPage'
import PostDetail from '@/pages/feed/PostDetail'
import ProfilePage from '@/pages/profile/ProfilePage'
import NotFoundPage from '@/pages/NotFound'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <div className="flex-1">
                <Routes>
                  {/* Public */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* Listings */}
                  <Route path="/listings" element={<ListingsPage />} />
                  <Route path="/listings/new" element={<ProtectedRoute><NewListingPage /></ProtectedRoute>} />
                  <Route path="/listings/:id/edit" element={<ProtectedRoute><EditListingPage /></ProtectedRoute>} />
                  <Route path="/listings/:id" element={<ListingDetail />} />

                  {/* Feed */}
                  <Route path="/feed" element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
                  <Route path="/feed/:postId" element={<ProtectedRoute><PostDetail /></ProtectedRoute>} />

                  {/* Profile */}
                  <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

                  {/* Fallback */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </div>
              <BottomNav />
            </div>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}