import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { listingsApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { formatPrice, formatDate } from '@/lib/utils'
import PageWrapper from '@/components/layout/PageWrapper'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import { WhatsAppButton } from '@/components/ui/WhatsAppButton'
import ConnectButton from '@/components/ui/ConnectButton'



const STATUS_STYLES = {
  active: 'badge-active',
  taken: 'badge-taken',
  inactive: 'badge-inactive',
}

// ─── small icon set used only in this file ────────────────────────────────────
function PhoneIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
    </svg>
  )
}

function PinIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle cx="12" cy="9" r="2.5"/>
    </svg>
  )
}

function BackIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3L5 7l4 4"/>
    </svg>
  )
}

function NoImageIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1" opacity="0.3">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <path d="M21 15l-5-5L5 21"/>
    </svg>
  )
}
// ─────────────────────────────────────────────────────────────────────────────

export default function ListingDetail() {
  const { id } = useParams()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    if (!id || id === 'undefined') {
      toast.error('Invalid listing')
      navigate('/listings')
      return
    }
    listingsApi.getOne(id)
      .then(setListing)
      .catch(() => toast.error('Listing not found'))
      .finally(() => setLoading(false))
  }, [id])

  const isOwner = user && listing && user.id === listing.owner_id

  const handleDelete = async () => {
    if (!confirm('Delete this listing? This cannot be undone.')) return
    setDeleting(true)
    try {
      await listingsApi.delete(id)
      toast.success('Listing deleted')
      navigate('/listings')
    } catch (err) {
      toast.error(err.message)
      setDeleting(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  )

  if (!listing) return (
    <PageWrapper>
      <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
        Listing not found.
      </div>
    </PageWrapper>
  )

  const owner = listing.owner

  return (
    <PageWrapper>
      <Link
        to="/listings"
        className="inline-flex items-center gap-1.5 text-sm mb-5 transition-colors"
        style={{ color: 'var(--text-muted)' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        <BackIcon />
        Back to listings
      </Link>

      <div className="grid md:grid-cols-3 gap-6">
        {/* ── Main content ── */}
        <div className="md:col-span-2 flex flex-col gap-4">

          {/* Image */}
          <div className="card overflow-hidden">
            {listing.image_url ? (
              <img
                src={listing.image_url}
                alt={listing.title}
                className="w-full h-64 object-cover"
              />
            ) : (
              <div className="h-64 flex items-center justify-center"
                style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>
                <NoImageIcon />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="card p-5">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h1 className="text-lg font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>
                {listing.title}
              </h1>
              <span className={`tag shrink-0 capitalize ${STATUS_STYLES[listing.status] || ''}`}>
                {listing.status}
              </span>
            </div>

            <p className="text-sm flex items-center gap-1.5 mb-4" style={{ color: 'var(--text-muted)' }}>
              <PinIcon />
              {listing.address}{listing.lga ? `, ${listing.lga}` : ''}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-4 p-4 rounded-xl"
              style={{ background: 'var(--bg-subtle)' }}>
              <div>
                <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Monthly rent</p>
                <p className="text-lg font-semibold text-[var(--brand)]">
                  {listing.price_monthly ? formatPrice(listing.price_monthly) : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Bedrooms</p>
                <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {listing.bedrooms ?? '—'}
                </p>
              </div>
              {listing.available_from && (
                <div>
                  <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Available from</p>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {new Date(listing.available_from).toLocaleDateString('en-NG', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </p>
                </div>
              )}
              {listing.listing_type && (
                <div>
                  <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Type</p>
                  <p className="text-sm font-medium capitalize" style={{ color: 'var(--text-primary)' }}>
                    {listing.listing_type.replace(/_/g, ' ')}
                  </p>
                </div>
              )}
            </div>

            {listing.description && (
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {listing.description}
              </p>
            )}
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="flex flex-col gap-4">

          {/* Owner card */}
          {owner && (
            <div className="card p-4">
              <p className="text-xs font-medium uppercase tracking-wide mb-3"
                style={{ color: 'var(--text-muted)' }}>
                Listed by
              </p>

              <Link
                to={`/users/${owner.id}`}
                className="flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity"
              >
                <Avatar name={owner.full_name} src={owner.profile_picture_url} size="md" />
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                    {owner.full_name}
                  </p>
                  <p className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>
                    {owner.role?.replace(/_/g, ' ')}
                  </p>
                </div>
              </Link>

{/* Contact Section */}
{owner && user && (
  <div className="flex flex-col gap-2 mt-3">

    {owner.role === 'landlord' && owner.phone_no ? (
      <>
        <a
          href={`tel:${owner.phone_no}`}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-80"
          style={{
            background: 'var(--bg-subtle)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
          }}
        >
          <PhoneIcon />
          {owner.phone_no}
        </a>

        <WhatsAppButton
          phone={owner.phone_no}
          ownerName={owner.full_name}
          listingTitle={listing.title}
        />
      </>
    ) : (
      <ConnectButton
        userId={owner.id}
        userName={owner.full_name}
      />
    )}

  </div>
)}

{/* Not logged in */}
{!user && (
  <p className="text-xs text-center mt-2" style={{ color: 'var(--text-muted)' }}>
    <Link to="/login" className="text-[var(--brand)] hover:underline">Log in</Link> to contact
  </p>
)}
            </div>
          )}

          {/* Owner actions */}
          {isOwner && (
            <div className="card p-4 flex flex-col gap-2">
              <p className="text-xs font-medium uppercase tracking-wide mb-1"
                style={{ color: 'var(--text-muted)' }}>
                Manage
              </p>
              <Link to={`/listings/${id}/edit`}>
                <Button variant="ghost" fullWidth size="sm">Edit listing</Button>
              </Link>
              <Button variant="danger" fullWidth size="sm" loading={deleting} onClick={handleDelete}>
                Delete listing
              </Button>
            </div>
          )}

          <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
            Posted {listing.created_at ? formatDate(listing.created_at) : '—'}
          </p>
        </div>
      </div>
    </PageWrapper>
  )
}