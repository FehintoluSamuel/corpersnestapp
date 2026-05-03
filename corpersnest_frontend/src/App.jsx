import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

import { AuthProvider }  from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { ToastProvider } from '@/context/ToastContext'

import Navbar         from '@/components/layout/Navbar'
import BottomNav      from '@/components/layout/BottomNav'
import ProtectedRoute from '@/components/layout/ProtectedRoute'

import LandingPage    from '@/pages/Landing'
import LoginPage      from '@/pages/auth/Login'
import RegisterPage   from '@/pages/auth/Register'
import OnboardingPage from '@/pages/auth/Onboarding'

import { ForgotPasswordPage } from '@/pages/auth/ForgotPassword'
import { ResetPasswordPage }  from '@/pages/auth/ResetPassword'

import HomePage from '@/pages/Home'

import ListingsPage    from '@/pages/listings/ListingsPage'
import ListingDetail   from '@/pages/listings/ListingDetail'
import NewListingPage  from '@/pages/listings/NewListing'
import EditListingPage from '@/pages/listings/EditListing'

import FeedPage   from '@/pages/feed/FeedPage'
import PostDetail from '@/pages/feed/PostDetail'

import ProfilePage       from '@/pages/profile/ProfilePage'
import PublicProfilePage from '@/pages/PublicProfilePage'

import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminLandlords from '@/pages/admin/AdminLandlords'
import AdminUsers     from '@/pages/admin/AdminUsers'
import AdminReports   from '@/pages/admin/AdminReports'

import ConnectionsPage  from '@/pages/connections/ConnectionsPage'
import MessagesPage     from '@/pages/messages/MessagesPage'
import ConversationPage from '@/pages/messages/ConversationPage'

import SearchPage    from '@/pages/SearchPage'
import BookmarksPage from '@/pages/BookmarksPage'
import NotFoundPage  from '@/pages/NotFound'


function RootRedirect() {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Navigate to="/home" replace /> : <LandingPage />
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user)                 return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/home" replace />
  return children
}


export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            {/* Root div has NO overflow-x-hidden — that would break sticky Navbar */}
            <div className="min-h-screen flex flex-col">
              <Navbar />
              {/* overflow-x-hidden only on the content area, not the root */}
              <div className="flex-1 w-full overflow-x-hidden">
                <Routes>

                  {/* Public */}
                  <Route path="/"         element={<RootRedirect />} />
                  <Route path="/login"    element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* Password reset */}
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password"  element={<ResetPasswordPage />} />

                  {/* Onboarding */}
                  <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />

                  {/* Home */}
                  <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />

                  {/* Listings */}
                  <Route path="/listings"          element={<ListingsPage />} />
                  <Route path="/listings/new"      element={<ProtectedRoute><NewListingPage /></ProtectedRoute>} />
                  <Route path="/listings/:id/edit" element={<ProtectedRoute><EditListingPage /></ProtectedRoute>} />
                  <Route path="/listings/:id"      element={<ListingDetail />} />

                  {/* Feed */}
                  <Route path="/feed"         element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
                  <Route path="/feed/:postId" element={<ProtectedRoute><PostDetail /></ProtectedRoute>} />

                  {/* Profile */}
                  <Route path="/profile"       element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                  <Route path="/users/:userId" element={<PublicProfilePage />} />

                  {/* Admin */}
                  <Route path="/admin"           element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                  <Route path="/admin/landlords" element={<AdminRoute><AdminLandlords /></AdminRoute>} />
                  <Route path="/admin/users"     element={<AdminRoute><AdminUsers /></AdminRoute>} />
                  <Route path="/admin/reports"   element={<AdminRoute><AdminReports /></AdminRoute>} />

                  {/* Connections & Messages */}
                  <Route path="/connections"      element={<ProtectedRoute><ConnectionsPage /></ProtectedRoute>} />
                  <Route path="/messages"         element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
                  <Route path="/messages/:userId" element={<ProtectedRoute><ConversationPage /></ProtectedRoute>} />

                  {/* Search & Bookmarks */}
                  <Route path="/search"    element={<SearchPage />} />
                  <Route path="/bookmarks" element={<ProtectedRoute><BookmarksPage /></ProtectedRoute>} />

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