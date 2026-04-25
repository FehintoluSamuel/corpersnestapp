import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listingsApi } from '@/lib/api'
import { useToast } from '@/context/ToastContext'
import ListingForm from '@/components/listings/ListingForm'
import PageWrapper from '@/components/layout/PageWrapper'
import { useAuth } from '@/context/AuthContext'

export default function NewListingPage() {
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (data) => {
    setLoading(true)
    try {
      const listing = await listingsApi.create(data)
      toast.success('Listing posted successfully!')
      navigate(`/listings/${listing.id}`)
    } catch (err) {
      toast.error(err.message || 'Failed to post listing')
    } finally {
      setLoading(false)
    }
  }

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

      <div className="max-w-2xl">
        <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-1">Post a room</h1>
        <p className="text-sm text-[var(--text-muted)] mb-6">Fill in the details below and your listing will go live immediately.</p>

        <div className="card p-6">
          <ListingForm onSubmit={handleSubmit} loading={loading} submitLabel="Post listing" />
        </div>
      </div>
    </PageWrapper>
  )
}