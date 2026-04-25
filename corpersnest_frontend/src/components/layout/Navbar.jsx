import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import Avatar from '@/components/ui/Avatar'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { isDark, toggle } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link to={user ? '/listings' : '/'} className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-[var(--brand)] flex items-center justify-center">
            <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
              <path d="M9 2L15 6.5V16H3V6.5L9 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
              <rect x="6.5" y="10" width="5" height="6" rx="1" fill="white"/>
              <circle cx="9" cy="7.5" r="1.2" fill="white"/>
            </svg>
          </div>
          <span className="font-semibold text-base">
            <span style={{ color: 'var(--brand)' }}>Corper</span>
            <span style={{ color: 'var(--text-primary)' }}>Nest</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        {user && (
          <nav className="hidden md:flex items-center gap-1">
            {[
              { to: '/listings', label: 'Listings' },
              { to: '/feed', label: 'Feed' },
            ].map(({ to, label }) => (
                <Link
                key={to}
                to={to}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-all"
              >
                {label}
                </Link>
            
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2">

          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-all"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/profile">
                <Avatar name={user.full_name} size="sm" />
              </Link>
              <button
                onClick={handleLogout}
                className="hidden md:block text-xs text-[var(--text-muted)] hover:text-red-500 transition-colors px-2 py-1"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-3 py-2"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm font-medium text-white bg-[var(--brand)] hover:bg-[var(--brand-dark)] px-4 py-2 rounded-xl transition-colors"
              >
                Join
              </Link>
            </div>
          )}

        </div>
      </div>
    </header>
  )
}