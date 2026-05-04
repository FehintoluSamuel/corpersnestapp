/**
 * components/listings/ListingCard.jsx
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { bookmarksApi } from '@/lib/api'
import { formatPrice, formatDate } from '@/lib/utils'
import Avatar from '@/components/ui/Avatar'
import RoleBadge from '@/components/ui/RoleBadge'
import { WhatsAppIconButton } from '@/components/ui/WhatsAppButton'

const TYPE_LABELS = {
  corper_room:       'Corper Room',
  landlord_property: 'Landlord Property',
}

const STATUS_STYLES = {
  active:   'badge-active',
  taken:    'badge-taken',
  inactive: 'badge-inactive',
}

export default function ListingCard({ listing }) {
  const { user }  = useAuth()
  const toast     = useToast()
  const {
    id, title, address, lga, price_monthly, bedrooms,
    listing_type, status, owner, created_at, image_url,
  } = listing

  const [bookmarked,  setBookmarked]  = useState(listing.bookmarked_by_me ?? false)
  const [bookmarking, setBookmarking] = useState(false)

  const handleBookmark = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { toast.info('Log in to bookmark listings'); return }
    if (bookmarking) return
    setBookmarking(true)
    const prev = bookmarked
    setBookmarked(!prev)
    try {
      const res = await bookmarksApi.toggle({ listing_id: id })
      setBookmarked(res.bookmarked)
    } catch (err) {
      setBookmarked(prev)
      toast.error(err.message)
    } finally {
      setBookmarking(false)
    }
  }

  return (
    <Link
      to={`/listings/${id}`}
      className="card block hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group"
    >
      {/* Image / placeholder */}
      <div className="h-40 w-full relative overflow-hidden flex items-center justify-center"
        style={{ background: 'var(--bg-subtle)' }}>
        {image_url ? (
          <img src={image_url} alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <>
            <svg width="100%" height="100%" style={{ position: 'absolute', opacity: 0.4 }}>
              <defs>
                <pattern id={`grid-${id}`} width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--border)" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#grid-${id})`}/>
            </svg>
            <div className="relative flex flex-col items-center gap-1">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                stroke="var(--border-strong)" strokeWidth="1.2" strokeLinecap="round">
                <path d="M3 9L12 2L21 9V21H15V14H9V21H3V9Z"/>
              </svg>
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>No photo yet</span>
            </div>
          </>
        )}

        <span className={`tag absolute top-3 left-3 capitalize ${STATUS_STYLES[status] || ''}`}>{status}</span>
        <span className={`tag absolute top-3 right-3 ${listing_type === 'corper_room' ? 'badge-corper' : 'badge-landlord'}`}>
          {TYPE_LABELS[listing_type]}
        </span>

        {/* Bookmark button — top right corner on image */}
        {user && (
          <button
            onClick={handleBookmark}
            disabled={bookmarking}
            aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark listing'}
            className="absolute bottom-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center transition-all"
            style={{
              background: bookmarked ? 'var(--brand)' : 'rgba(0,0,0,0.45)',
              color: 'white',
            }}>
            <svg width="13" height="13" viewBox="0 0 24 24"
              fill={bookmarked ? 'white' : 'none'}
              stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
            </svg>
          </button>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-semibold text-sm leading-snug mb-1 line-clamp-2 group-hover:text-[var(--brand)] transition-colors"
          style={{ color: 'var(--text-primary)' }}>
          {title}
        </h3>

        <p className="text-xs flex items-center gap-1 mb-3" style={{ color: 'var(--text-muted)' }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="2.5"/>
          </svg>
          {address}, {lga}
        </p>

        <div className="flex items-end justify-between">
          <div>
            <span className="text-base font-semibold text-[var(--brand)]">{formatPrice(price_monthly)}</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>/month</span>
          </div>
          <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M3 22V8l9-6 9 6v14"/><path d="M9 22V12h6v10"/>
            </svg>
            {bedrooms} bed{bedrooms !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Owner row */}
        {owner && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <Link to={`/users/${owner.id}`} onClick={e => e.stopPropagation()}
              className="flex items-center gap-2 min-w-0 hover:opacity-80 transition-opacity">
              <Avatar name={owner.full_name} src={owner.profile_picture_url} size="xs" />
              <span className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                {owner.full_name}
              </span>
            </Link>
            <RoleBadge role={owner.role} />
            <span className="text-xs ml-auto shrink-0" style={{ color: 'var(--text-muted)' }}>
              {formatDate(created_at)}
            </span>
            {user && owner.role === 'landlord' && owner.phone_no && (
              <WhatsAppIconButton phone={owner.phone_no} ownerName={owner.full_name} listingTitle={title} />
            )}
          </div>
        )}
      </div>
    </Link>
  )
}