import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { connectionsApi, messagesApi } from '@/lib/api'
import { socket } from '@/lib/socket'
import Avatar from '@/components/ui/Avatar'

function Badge({ count }) {
  if (!count) return null
  return (
    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 rounded-full text-white flex items-center justify-center font-bold"
      style={{ background: 'var(--brand)', fontSize: '9px' }}>
      {count > 9 ? '9+' : count}
    </span>
  )
}

function NavIcon({ to, label, icon, badge }) {
  const { pathname } = useLocation()
  const active = pathname.startsWith(to)
  return (
    <Link to={to} aria-label={label}
      className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all"
      style={{ color: active ? 'var(--brand)' : 'var(--text-muted)', background: active ? 'var(--brand-light)' : 'transparent' }}>
      {icon}
      <Badge count={badge} />
    </Link>
  )
}

export default function Navbar() {
  const { user, logout }   = useAuth()
  const { isDark, toggle } = useTheme()
  const navigate           = useNavigate()
  const location           = useLocation()

  const [unreadMsgs,    setUnreadMsgs]    = useState(0)
  const [pendingConns,  setPendingConns]  = useState(0)

  const isActive = (path) => location.pathname.startsWith(path)

  useEffect(() => {
    if (!user) return
    // Initial counts
    messagesApi.getUnreadCount().then(d => setUnreadMsgs(d.count)).catch(() => {})
    connectionsApi.getPending().then(d => setPendingConns(d.length)).catch(() => {})

    // Live update unread count on new message
    const handler = ({ message }) => {
      if (message.sender_id !== user.id) setUnreadMsgs(p => p + 1)
    }
    socket.on('message', handler)
    return () => socket.off('message', handler)
  }, [user])

  // Reset unread when visiting messages
  useEffect(() => {
    if (location.pathname.startsWith('/messages')) setUnreadMsgs(0)
    if (location.pathname.startsWith('/connections')) setPendingConns(0)
  }, [location.pathname])

  return (
    <header className="sticky top-0 z-40 border-b"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to={user ? '/home' : '/'} className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--brand)' }}>
            <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
              <path d="M9 2L15 6.5V16H3V6.5L9 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
              <rect x="6.5" y="10" width="5" height="6" rx="1" fill="white"/>
              <circle cx="9" cy="7.5" r="1.2" fill="white"/>
            </svg>
          </div>
          <span className="font-semibold text-base">
            <span style={{ color: 'var(--brand)' }}>Corpers</span>
            <span style={{ color: 'var(--text-primary)' }}>Nest</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        {user && (
          <nav className="hidden md:flex items-center gap-1 flex-1 ml-4">
            {[
              { to: '/home',     label: 'Home',     icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 9L12 2L21 9V21H15V14H9V21H3V9Z"/></svg> },
              { to: '/listings', label: 'Listings', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
              { to: '/feed',     label: 'Feed',     icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> },
              { to: '/profile',  label: 'Profile',  icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20C4 17 7.6 14 12 14C16.4 14 20 17 20 20"/></svg> },
            ].map(({ to, label, icon }) => (
              <Link key={to} to={to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                  ${isActive(to) ? 'text-[var(--brand)] bg-[var(--brand-light)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'}`}>
                {icon}{label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-1 ml-auto">

          {/* Action icons — logged in only */}
          {user && (
            <>
              <NavIcon to="/search" label="Search"
                icon={
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                }
              />
              {/* Connections */}
              <NavIcon to="/connections" label="Connections" badge={pendingConns}
                icon={
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M19 8v6M22 11h-6"/>
                  </svg>
                }
              />

              {/* Messages */}
              <NavIcon to="/messages" label="Messages" badge={unreadMsgs}
                icon={
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                  </svg>
                }
              />
            </>
          )}

          {/* Theme toggle */}
          <button onClick={toggle}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{ color: 'var(--text-muted)' }} aria-label="Toggle theme">
            {isDark ? (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>

          {/* Avatar / auth */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/profile">
                <Avatar name={user.full_name} src={user.profile_picture_url} size="sm" />
              </Link>
              <button onClick={() => { logout(); navigate('/') }}
                className="hidden md:block text-xs px-2 py-1 rounded-lg transition-colors"
                style={{ color: 'var(--text-muted)' }}>
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-sm font-medium px-3 py-2 transition-colors"
                style={{ color: 'var(--text-secondary)' }}>Login</Link>
              <Link to="/register" className="text-sm font-medium text-white px-4 py-2 rounded-xl transition-colors"
                style={{ background: 'var(--brand)' }}>Join</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}