/**
 * components/ui/RoleBadge.jsx
 *
 * Displays a colored badge with an icon for each NYSC role.
 * Used on profile cards, post headers, and listing cards.
 */

const ROLE_CONFIG = {
  pcm: {
    label:  'PCM',
    color:  '#6B7280',  // gray
    bg:     '#F3F4F6',
    darkBg: '#1F2937',
    icon: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
  incoming_corper: {
    label:  'Incoming',
    color:  '#2563EB',  // blue
    bg:     '#EFF6FF',
    darkBg: '#1E3A5F',
    icon: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>
    ),
  },
  outgoing_corper: {
    label:  'Outgoing',
    color:  '#008751',  // NYSC green
    bg:     '#ECFDF5',
    darkBg: '#064E3B',
    icon: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
  alumni: {
    label:  'Alumni',
    color:  '#7C3AED',  // purple
    bg:     '#F5F3FF',
    darkBg: '#2E1065',
    icon: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
    ),
  },
  landlord: {
    label:  'Landlord',
    color:  '#D97706',  // amber
    bg:     '#FFFBEB',
    darkBg: '#451A03',
    icon: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M3 9L12 2L21 9V21H15V14H9V21H3V9Z"/>
      </svg>
    ),
  },
  admin: {
    label:  'Admin',
    color:  '#DC2626',  // red
    bg:     '#FEF2F2',
    darkBg: '#450A0A',
    icon: (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <polyline points="9 12 11 14 15 10"/>
      </svg>
    ),
  },
}

/**
 * @param {string}  role   — one of the Role enum values
 * @param {string}  size   — 'sm' | 'md' (default 'sm')
 * @param {boolean} dark   — force dark background variant
 */
export default function RoleBadge({ role, size = 'sm', dark = false }) {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.pcm
  const isSmall = size === 'sm'

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full font-medium"
      style={{
        color:      config.color,
        background: dark ? config.darkBg : config.bg,
        fontSize:   isSmall ? '10px' : '12px',
        padding:    isSmall ? '2px 8px' : '3px 10px',
        border:     `1px solid ${config.color}22`,
      }}
    >
      {config.icon}
      {config.label}
    </span>
  )
}

/**
 * Returns the human-readable label for a role.
 * Exported so utils.js can use it too.
 */
export function roleBadgeLabel(role) {
  return ROLE_CONFIG[role]?.label ?? role ?? '—'
}