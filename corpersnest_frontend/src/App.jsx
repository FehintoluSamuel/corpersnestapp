import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

import { AuthProvider }  from '@/context/AuthContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { ToastProvider } from '@/context/ToastContext'

import Navbar      from '@/components/layout/Navbar'
import BottomNav   from '@/components/layout/BottomNav'
import ProtectedRoute from '@/components/layout/ProtectedRoute'

// Auth
import LandingPage    from '@/pages/Landing'
import LoginPage      from '@/pages/auth/Login'
import RegisterPage   from '@/pages/auth/Register'
import OnboardingPage from '@/pages/auth/Onboarding'

// Main
import HomePage from '@/pages/Home'

// Listings
import ListingsPage    from '@/pages/listings/ListingsPage'
import ListingDetail   from '@/pages/listings/ListingDetail'
import NewListingPage  from '@/pages/listings/NewListing'
import EditListingPage from '@/pages/listings/EditListing'

// Feed
import FeedPage    from '@/pages/feed/FeedPage'
import PostDetail  from '@/pages/feed/PostDetail'

// Profile
import ProfilePage       from '@/pages/profile/ProfilePage'
import PublicProfilePage from '@/pages/PublicProfilePage'

// Admin
import AdminDashboard        from '@/pages/admin/AdminDashboard'
import AdminLandlords        from '@/pages/admin/AdminLandlords'
import AdminUsers            from '@/pages/admin/AdminUsers'
import AdminReports          from '@/pages/admin/AdminReports'

// Misc
import NotFoundPage from '@/pages/NotFound'


// Connections and Messages
import ConnectionsPage    from '@/pages/connections/ConnectionsPage'
import MessagesPage       from '@/pages/messages/MessagesPage'
import ConversationPage   from '@/pages/messages/ConversationPage'

function RootRedirect() {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Navigate to="/home" replace /> : <LandingPage />
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user)             return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/home" replace />
  return children
}


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

                  {/* ── Public ── */}
                  <Route path="/"         element={<RootRedirect />} />
                  <Route path="/login"    element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* ── Onboarding — protected but no role restriction ── */}
                  <Route path="/onboarding" element={
                    <ProtectedRoute><OnboardingPage /></ProtectedRoute>
                  } />

                  {/* ── Home ── */}
                  <Route path="/home" element={
                    <ProtectedRoute><HomePage /></ProtectedRoute>
                  } />

                  {/* ── Listings ── */}
                  <Route path="/listings"         element={<ListingsPage />} />
                  <Route path="/listings/:id"     element={<ListingDetail />} />
                  <Route path="/listings/new"     element={
                    <ProtectedRoute><NewListingPage /></ProtectedRoute>
                  } />
                  <Route path="/listings/:id/edit" element={
                    <ProtectedRoute><EditListingPage /></ProtectedRoute>
                  } />

                  {/* ── Feed ── */}
                  <Route path="/feed"          element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
                  <Route path="/feed/:postId"  element={<ProtectedRoute><PostDetail /></ProtectedRoute>} />

                  {/* ── Profile ── */}
                  <Route path="/profile"          element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                  <Route path="/users/:userId"    element={<PublicProfilePage />} />

                  {/* ── Admin ── */}
                  <Route path="/admin"           element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                  <Route path="/admin/landlords" element={<AdminRoute><AdminLandlords /></AdminRoute>} />
                  <Route path="/admin/users"     element={<AdminRoute><AdminUsers /></AdminRoute>} />
                  <Route path="/admin/reports"   element={<AdminRoute><AdminReports /></AdminRoute>} />

                  {/* ── Fallback ── */}
                  <Route path="*" element={<NotFoundPage />} />

                  {/* ── Connections and Messages ── */}
                  <Route path="/connections" element={<ProtectedRoute><ConnectionsPage /></ProtectedRoute>} />
                  <Route path="/messages"    element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
                  <Route path="/messages/:userId" element={<ProtectedRoute><ConversationPage /></ProtectedRoute>} />
 


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