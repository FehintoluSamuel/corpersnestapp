import { Link } from 'react-router-dom'
import { formatPrice, formatDate } from '@/lib/utils'
import Avatar from '@/components/ui/Avatar'

const TYPE_LABELS = {
  corper_room: 'Corper Room',
  landlord_property: 'Landlord Property',
}

const STATUS_STYLES = {
  active: 'badge-active',
  taken: 'badge-taken',
  inactive: 'badge-inactive',
}

export default function ListingCard({ listing }) {
  const { id, title, address, lga, price_monthly, bedrooms, listing_type, status, owner, created_at, available_from } = listing

  return (
    <Link
      to={`/listings/${id}`}
      className="card block hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group"
    >
      {/* Image placeholder — swap for real Cloudinary img once backend ships the endpoint */}
      <div
        className="h-40 w-full bg-[var(--bg-subtle)] flex items-center justify-center text-[var(--text-muted)] relative overflow-hidden"
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.3">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>
        </svg>
        {/* Status badge overlaid on image */}
        <span className={`tag absolute top-3 left-3 capitalize ${STATUS_STYLES[status] || ''}`}>
          {status}
        </span>
        {/* Type badge */}
        <span className={`tag absolute top-3 right-3 ${listing_type === 'corper_room' ? 'badge-corper' : 'badge-landlord'}`}>
          {TYPE_LABELS[listing_type]}
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-[var(--text-primary)] text-sm leading-snug mb-1 group-hover:text-[var(--brand)] transition-colors line-clamp-2">
          {title}
        </h3>
        <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mb-3">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3">
            <path d="M6 1a4 4 0 100 8A4 4 0 006 1zM6 11v.5"/>
            <path d="M6 9v.5" strokeLinecap="round"/>
          </svg>
          {address}, {lga}
        </p>

        <div className="flex items-end justify-between">
          <div>
            <span className="text-base font-semibold text-[var(--brand)]">{formatPrice(price_monthly)}</span>
            <span className="text-xs text-[var(--text-muted)]">/month</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3">
              <rect x="1" y="4" width="10" height="7" rx="1"/>
              <path d="M1 7h10M4 4V3a2 2 0 014 0v1"/>
            </svg>
            {bedrooms} bed{bedrooms !== 1 ? 's' : ''}
          </div>
        </div>

        {owner && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <Avatar name={owner.full_name} size="xs" />
            <span className="text-xs text-[var(--text-muted)] truncate">{owner.full_name}</span>
            <span className="text-xs text-[var(--text-muted)] ml-auto shrink-0">{formatDate(created_at)}</span>
          </div>
        )}
      </div>
    </Link>
  )
}