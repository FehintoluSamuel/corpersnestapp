import { NavLink } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const navItems = [
  {
    to: '/home',
    label: 'Home',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={active ? 2 : 1.6}
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9L12 2L21 9V21H15V14H9V21H3V9Z"
          fill={active ? 'currentColor' : 'none'} fillOpacity="0.15"/>
      </svg>
    ),
  },
  {
    to: '/feed',
    label: 'Feed',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={active ? 2 : 1.6}
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
          fill={active ? 'currentColor' : 'none'} fillOpacity="0.15"/>
      </svg>
    ),
  },
  {
    to: '/profile',
    label: 'Profile',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={active ? 2 : 1.6}
        strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"
          fill={active ? 'currentColor' : 'none'} fillOpacity="0.15"/>
        <path d="M4 20C4 17 7.6 14 12 14C16.4 14 20 17 20 20"/>
      </svg>
    ),
  },
]

export default function BottomNav() {
  const { user } = useAuth()
  if (!user) return null

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t md:hidden"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-6 py-2 rounded-xl transition-all duration-150
              ${isActive
                ? 'text-[var(--brand)]'
                : 'text-[var(--text-muted)]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {icon(isActive)}
                <span className="text-[10px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}