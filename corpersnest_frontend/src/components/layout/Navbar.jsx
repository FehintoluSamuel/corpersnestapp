import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { connectionsApi, messagesApi, notificationsApi } from '@/lib/api'
import { socket } from '@/lib/socket'
import { formatDate } from '@/lib/utils'
import Avatar from '@/components/ui/Avatar'

function Badge({ count }) {
  if (!count) return null
  return (
    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 rounded-full text-white flex items-center justify-center font-bold"
      style={{ background: '#EF4444', fontSize: '9px' }}>
      {count > 9 ? '9+' : count}
    </span>
  )
}

function NavIcon({ to, label, icon, badge, onClick, className = '' }) {
  const { pathname } = useLocation()
  const active = pathname.startsWith(to)
  const style = {
    color: active ? 'var(--brand)' : 'var(--text-muted)',
    background: active ? 'var(--brand-light)' : 'transparent',
  }
  const base = `relative w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0 ${className}`
  if (onClick) return (
    <button onClick={onClick} aria-label={label} className={base} style={style}>
      {icon}<Badge count={badge} />
    </button>
  )
  return (
    <Link to={to} aria-label={label} className={base} style={style}>
      {icon}<Badge count={badge} />
    </Link>
  )
}

function NotificationDropdown({ notifications, onMarkAllRead, onClose }) {
  const navigate = useNavigate()
  const handleClick = (n) => {
    notificationsApi.markRead(n.id).catch(() => {})
    onClose()
    if (n.post_id)         navigate(`/feed/${n.post_id}`)
    else if (n.listing_id) navigate(`/listings/${n.listing_id}`)
    else if (n.actor?.id)  navigate(`/users/${n.actor.id}`)
  }
  return (
    <div className="absolute right-0 top-11 w-72 rounded-2xl shadow-xl border z-50 overflow-hidden"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Notifications</p>
        <button onClick={onMarkAllRead} className="text-xs hover:underline" style={{ color: 'var(--brand)' }}>
          Mark all read
        </button>
      </div>
      <div className="overflow-y-auto" style={{ maxHeight: '320px' }}>
        {notifications.length === 0 && (
          <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>No notifications yet</p>
        )}
        {notifications.map(n => (
          <button key={n.id} onClick={() => handleClick(n)}
            className="w-full flex items-start gap-3 px-4 py-3 text-left border-b transition-colors hover:bg-[var(--bg-subtle)] last:border-0"
            style={{ borderColor: 'var(--border)', background: n.is_read ? 'transparent' : 'var(--brand-light)' }}>
            <Avatar name={n.actor?.full_name} src={n.actor?.profile_picture_url} size="xs" />
            <div className="flex-1 min-w-0">
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>{n.message}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {n.created_at ? formatDate(n.created_at) : ''}
              </p>
            </div>
            {!n.is_read && <div className="w-2 h-2 rounded-full shrink-0 mt-1" style={{ background: 'var(--brand)' }} />}
          </button>
        ))}
      </div>
      <div className="px-4 py-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <Link to="/bookmarks" onClick={onClose} className="text-xs hover:underline" style={{ color: 'var(--text-muted)' }}>
          View bookmarks →
        </Link>
      </div>
    </div>
  )
}

export default function Navbar() {
  const { user, logout }   = useAuth()
  const { isDark, toggle } = useTheme()
  const navigate           = useNavigate()
  const location           = useLocation()
  const dropdownRef        = useRef(null)

  const [unreadMsgs,    setUnreadMsgs]    = useState(0)
  const [pendingConns,  setPendingConns]  = useState(0)
  const [unreadNotifs,  setUnreadNotifs]  = useState(0)
  const [notifications, setNotifications] = useState([])
  const [showNotifs,    setShowNotifs]    = useState(false)

  const isActive = (path) => location.pathname.startsWith(path)

  useEffect(() => {
    if (!user) return
    messagesApi.getUnreadCount().then(d => setUnreadMsgs(d.count)).catch(() => {})
    connectionsApi.getPending().then(d => setPendingConns(d.length)).catch(() => {})
    notificationsApi.getUnreadCount().then(d => setUnreadNotifs(d.count)).catch(() => {})
    const handler = ({ message }) => { if (message.sender_id !== user.id) setUnreadMsgs(p => p + 1) }
    socket.on('message', handler)
    return () => socket.off('message', handler)
  }, [user])

  useEffect(() => {
    if (location.pathname.startsWith('/messages'))    setUnreadMsgs(0)
    if (location.pathname.startsWith('/connections')) setPendingConns(0)
  }, [location.pathname])

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowNotifs(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleBellClick = async () => {
    if (!showNotifs) {
      const data = await notificationsApi.getAll().catch(() => [])
      setNotifications(data)
    }
    setShowNotifs(p => !p)
  }

  const handleMarkAllRead = async () => {
    await notificationsApi.markAllRead().catch(() => {})
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnreadNotifs(0)
  }

  return (
    <header className="sticky top-0 z-40 border-b"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
      <div className="max-w-5xl mx-auto px-3 h-14 flex items-center gap-2">

        {/* Logo */}
        <Link to={user ? '/home' : '/'} className="flex items-center gap-1.5 shrink-0 mr-1">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--brand)' }}>
            <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
              <path d="M9 2L15 6.5V16H3V6.5L9 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
              <rect x="6.5" y="10" width="5" height="6" rx="1" fill="white"/>
              <circle cx="9" cy="7.5" r="1.2" fill="white"/>
            </svg>
          </div>
          {/* Hide text on very small screens to save space */}
          <span className="font-semibold text-base hidden xs:inline sm:inline">
            <span style={{ color: 'var(--brand)' }}>Corpers</span>
            <span style={{ color: 'var(--text-primary)' }}>Nest</span>
          </span>
        </Link>

        {/* Desktop nav links — hidden on mobile */}
        {user && (
          <nav className="hidden md:flex items-center gap-1 flex-1">
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

        {/* Spacer on mobile */}
        <div className="flex-1 md:hidden" />

        {/* Right-side icons */}
        <div className="flex items-center gap-0.5 shrink-0">
          {user && (
            <>
              {/* Search — visible on all sizes */}
              <NavIcon to="/search" label="Search"
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>}
              />

              {/* Connections — hidden on mobile (accessible via bottom nav or search) */}
              <NavIcon to="/connections" label="Connections" badge={pendingConns}
                className="hidden sm:flex"
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/></svg>}
              />

              {/* Messages */}
              <NavIcon to="/messages" label="Messages" badge={unreadMsgs}
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>}
              />

              {/* Bell — notifications */}
              <div className="relative shrink-0" ref={dropdownRef}>
                <NavIcon to="#" label="Notifications" badge={unreadNotifs}
                  onClick={handleBellClick}
                  icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>}
                />
                {showNotifs && (
                  <NotificationDropdown
                    notifications={notifications}
                    onMarkAllRead={handleMarkAllRead}
                    onClose={() => setShowNotifs(false)}
                  />
                )}
              </div>
            </>
          )}

          {/* Theme toggle */}
          <button onClick={toggle}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0"
            style={{ color: 'var(--text-muted)' }} aria-label="Toggle theme">
            {isDark ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>

          {/* Avatar / auth */}
          {user ? (
            <div className="flex items-center gap-1 ml-0.5">
              <Link to="/profile" className="shrink-0">
                <Avatar name={user.full_name} src={user.profile_picture_url} size="sm" />
              </Link>
              <button onClick={() => { logout(); navigate('/') }}
                className="hidden md:block text-xs px-2 py-1 rounded-lg transition-colors shrink-0"
                style={{ color: 'var(--text-muted)' }}>
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Link to="/login" className="text-sm font-medium px-2 py-1.5 transition-colors shrink-0"
                style={{ color: 'var(--text-secondary)' }}>Login</Link>
              <Link to="/register" className="text-sm font-medium text-white px-3 py-1.5 rounded-xl transition-colors shrink-0"
                style={{ background: 'var(--brand)' }}>Join</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}