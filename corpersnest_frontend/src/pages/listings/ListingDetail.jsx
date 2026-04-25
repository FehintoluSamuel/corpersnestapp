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

const STATUS_STYLES = { active: 'badge-active', taken: 'badge-taken', inactive: 'badge-inactive' }

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
      <div className="text-center py-20 text-[var(--text-muted)]">Listing not found.</div>
    </PageWrapper>
  )

  return (
    <PageWrapper>
      <Link
        to="/listings"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-5 transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 3L5 7l4 4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back to listings
      </Link>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="md:col-span-2 flex flex-col gap-4">
          {/* Image */}
          <div className="card overflow-hidden">
            {listing.image_url ? (
              <img src={listing.image_url} alt={listing.title} className="w-full h-64 object-cover"/>
            ) : (
              <div className="h-64 bg-[var(--bg-subtle)] flex items-center justify-center text-[var(--text-muted)]">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <path d="M21 15l-5-5L5 21"/>
                </svg>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="card p-5">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h1 className="text-lg font-semibold text-[var(--text-primary)] leading-snug">
                {listing.title}
              </h1>
              <span className={`tag shrink-0 capitalize ${STATUS_STYLES[listing.status] || ''}`}>
                {listing.status}
              </span>
            </div>

            <p className="text-sm text-[var(--text-muted)] flex items-center gap-1 mb-4">
              <svg width="13" height="13" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3">
                <path d="M6 1a4 4 0 100 8A4 4 0 006 1zM6 9v2"/>
              </svg>
              {listing.address}{listing.lga ? `, ${listing.lga}` : ''}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-4 p-4 rounded-xl" style={{ background: 'var(--bg-subtle)' }}>
              <div>
                <p className="text-xs text-[var(--text-muted)] mb-0.5">Monthly rent</p>
                <p className="text-lg font-semibold text-[var(--brand)]">
                  {listing.price_monthly ? formatPrice(listing.price_monthly) : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)] mb-0.5">Bedrooms</p>
                <p className="text-base font-semibold text-[var(--text-primary)]">
                  {listing.bedrooms ?? '—'}
                </p>
              </div>
              {listing.available_from && (
                <div>
                  <p className="text-xs text-[var(--text-muted)] mb-0.5">Available from</p>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {new Date(listing.available_from).toLocaleDateString('en-NG', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </p>
                </div>
              )}
              {listing.listing_type && (
                <div>
                  <p className="text-xs text-[var(--text-muted)] mb-0.5">Type</p>
                  <p className="text-sm font-medium text-[var(--text-primary)] capitalize">
                    {listing.listing_type?.replace(/_/g, ' ')}
                  </p>
                </div>
              )}
            </div>

            {listing.description && (
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {listing.description}
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Owner card */}
          {listing.owner && (
            <div className="card p-4">
              <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-3">
                Listed by
              </p>
              <div className="flex items-center gap-3 mb-4">
                <Avatar name={listing.owner.full_name} size="md" />
                <div>
                  <p className="font-semibold text-sm text-[var(--text-primary)]">
                    {listing.owner.full_name}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] capitalize">
                    {listing.owner.role?.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>
              {listing.owner.phone_no && (
                <a
                  href={`tel:${listing.owner.phone_no}`}
                  className="btn-primary w-full text-center text-sm"
                >
                  📞 {listing.owner.phone_no}
                </a>
              )}
            </div>
          )}

          {/* Owner actions */}
          {isOwner && (
            <div className="card p-4 flex flex-col gap-2">
              <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-1">
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

          <p className="text-xs text-[var(--text-muted)] text-center">
            Posted {listing.created_at ? formatDate(listing.created_at) : '—'}
          </p>
        </div>
      </div>
    </PageWrapper>
  )
}