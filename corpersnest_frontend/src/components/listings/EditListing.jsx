import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { listingsApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import ListingForm from '@/components/listings/ListingForm'
import PageWrapper from '@/components/layout/PageWrapper'
import Spinner from '@/components/ui/Spinner'

export default function EditListingPage() {
  const { id } = useParams()
  const [listing, setListing] = useState(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    listingsApi.getOne(id)
      .then((data) => {
        if (user && data.owner_id !== user.id) {
          toast.error("You can't edit someone else's listing")
          navigate(`/listings/${id}`)
          return
        }
        setListing(data)
      })
      .catch(() => toast.error('Listing not found'))
      .finally(() => setPageLoading(false))
  }, [id])

  const handleSubmit = async (data) => {
    setSaving(true)
    try {
      await listingsApi.update(id, data)
      toast.success('Listing updated!')
      navigate(`/listings/${id}`)
    } catch (err) {
      toast.error(err.message || 'Failed to update listing')
    } finally {
      setSaving(false)
    }
  }

  if (pageLoading) return (
    <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>
  )

  if (!listing) return null

  return (
    <PageWrapper>
      <Link
        to={`/listings/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-5 transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 3L5 7l4 4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back to listing
      </Link>

      <div className="max-w-2xl">
        <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-1">Edit listing</h1>
        <p className="text-sm text-[var(--text-muted)] mb-6">Changes go live immediately after saving.</p>

        <div className="card p-6">
          <ListingForm
            initial={listing}
            onSubmit={handleSubmit}
            loading={saving}
            submitLabel="Save changes"
          />
        </div>
      </div>
    </PageWrapper>
  )
}