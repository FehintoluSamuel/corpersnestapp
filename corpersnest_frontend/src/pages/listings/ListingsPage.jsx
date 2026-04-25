import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { listingsApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import ListingCard from '@/components/listings/ListingCard'
import ListingFilter from '@/components/listings/ListingFilter'
import PageWrapper from '@/components/layout/PageWrapper'
import EmptyState from '@/components/ui/EmptyState'
import Button from '@/components/ui/Button'
import SkeletonListingGrid from '@/components/ui/SkeletonListingGrid'

export default function ListingsPage() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  const canPost = user && (user.role === 'outgoing_corper' || user.role === 'landlord')

  const fetchListings = async (filters = {}) => {
    setLoading(true)
    setError(null)
    try {
      const data = await listingsApi.getAll(filters)
      setListings(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchListings() }, [])

  return (
    <PageWrapper>
      {/* Header row */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Available Rooms</h1>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {loading ? 'Loading…' : `${listings.length} listing${listings.length !== 1 ? 's' : ''} found`}
          </p>
        </div>
        {canPost && (
          <Link to="/listings/new">
            <Button size="sm">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 1v12M1 7h12" strokeLinecap="round"/>
              </svg>
              Post room
            </Button>
          </Link>
        )}
      </div>

      <ListingFilter onFilter={fetchListings} />

      {loading && <SkeletonListingGrid count={6} />}

      {!loading && error && (
        <div className="card p-5 text-center">
          <p className="text-sm text-red-500 mb-3">{error}</p>
          <Button variant="ghost" size="sm" onClick={() => fetchListings()}>Try again</Button>
        </div>
      )}

      {!loading && !error && listings.length === 0 && (
        <EmptyState
          icon={
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M3 9L12 2L21 9V21H15V14H9V21H3V9Z"/>
            </svg>
          }
          title="No listings yet"
          description="Be the first to post a room, or try adjusting your filters."
          action={canPost ? () => window.location.assign('/listings/new') : undefined}
          actionLabel={canPost ? 'Post the first room' : undefined}
        />
      )}

      {!loading && !error && listings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
          {listings.map(l => <ListingCard key={l.id} listing={l} />)}
        </div>
      )}
    </PageWrapper>
  )
}