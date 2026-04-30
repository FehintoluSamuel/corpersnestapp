/**
 * components/ui/NyscPromptBanner.jsx
 *
 * Shown to users who haven't completed their NYSC profile.
 * - PCMs with no state code → prompt to add state code
 * - Landlords pending verification → show waiting message
 * - Dismissed state is stored in sessionStorage (reappears next session)
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function NyscPromptBanner({ user }) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  // Landlord pending verification
  if (user?.role === 'landlord' && user?.status === 'pending_verification') {
    return (
      <Banner
        color="amber"
        icon={<ClockIcon />}
        title="Account pending verification"
        message="Our team is reviewing your landlord registration. You'll be able to post listings once approved."
        onDismiss={() => setDismissed(true)}
      />
    )
  }

  // PCM with no state code yet
  if (user?.role === 'pcm') {
    return (
      <Banner
        color="blue"
        icon={<IdIcon />}
        title="Complete your NYSC profile"
        message="Add your state code to unlock full access — listings, community feed, and more."
        action={<Link to="/profile?tab=nysc" className="text-xs font-semibold underline underline-offset-2">Add state code →</Link>}
        onDismiss={() => setDismissed(true)}
      />
    )
  }

  // Corper with state code but no camp date (role calc uses estimate)
  if (
    ['incoming_corper', 'outgoing_corper'].includes(user?.role) &&
    !user?.camp_start_date
  ) {
    return (
      <Banner
        color="green"
        icon={<CalendarIcon />}
        title="Add your camp start date"
        message="This keeps your role accurate as NYSC dates shift each batch."
        action={<Link to="/profile?tab=nysc" className="text-xs font-semibold underline underline-offset-2">Update profile →</Link>}
        onDismiss={() => setDismissed(true)}
      />
    )
  }

  return null
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const COLOR_MAP = {
  blue: {
    bg:     'var(--brand-light)',
    border: 'var(--brand)',
    text:   'var(--brand-dark)',
  },
  amber: {
    bg:     '#FFFBEB',
    border: '#D97706',
    text:   '#92400E',
  },
  green: {
    bg:     '#ECFDF5',
    border: '#008751',
    text:   '#064E3B',
  },
}

function Banner({ color, icon, title, message, action, onDismiss }) {
  const c = COLOR_MAP[color] || COLOR_MAP.blue

  return (
    <div
      className="rounded-2xl p-4 mb-5 flex items-start gap-3"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}
    >
      <div className="shrink-0 mt-0.5" style={{ color: c.border }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold mb-0.5" style={{ color: c.text }}>
          {title}
        </p>
        <p className="text-xs" style={{ color: c.text, opacity: 0.85 }}>
          {message}
        </p>
        {action && <div className="mt-2" style={{ color: c.border }}>{action}</div>}
      </div>
      <button
        onClick={onDismiss}
        className="shrink-0 opacity-50 hover:opacity-100 transition-opacity"
        style={{ color: c.text }}
        aria-label="Dismiss"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M1 1l12 12M13 1L1 13"/>
        </svg>
      </button>
    </div>
  )
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  )
}

function IdIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <line x1="2" y1="10" x2="22" y2="10"/>
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )
}