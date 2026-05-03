/**
 * pages/BookmarksPage.jsx
 */

import { useState, useEffect } from 'react'
import { bookmarksApi } from '@/lib/api'
import PageWrapper from '@/components/layout/PageWrapper'
import PostCard from '@/components/feed/PostCard'
import ListingCard from '@/components/listings/ListingCard'
import Spinner from '@/components/ui/Spinner'

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [tab,       setTab]       = useState('posts')

  useEffect(() => {
    bookmarksApi.getAll()
      .then(setBookmarks)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const posts    = bookmarks.filter(b => b.post)
  const listings = bookmarks.filter(b => b.listing)

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Bookmarks</h1>

        <div className="flex border-b mb-4" style={{ borderColor: 'var(--border)' }}>
          {[
            { key: 'posts',    label: `Posts (${posts.length})` },
            { key: 'listings', label: `Listings (${listings.length})` },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px
                ${tab === t.key ? 'text-[var(--brand)] border-[var(--brand)]' : 'text-[var(--text-muted)] border-transparent'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {loading && <div className="flex justify-center py-12"><Spinner size="md" /></div>}

        {!loading && tab === 'posts' && (
          <div className="flex flex-col gap-3">
            {posts.length === 0 && (
              <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>
                No bookmarked posts yet
              </p>
            )}
            {posts.map(b => (
              <PostCard key={b.id} post={{ ...b.post, bookmarked: true }} />
            ))}
          </div>
        )}

        {!loading && tab === 'listings' && (
          <div className="flex flex-col gap-3">
            {listings.length === 0 && (
              <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>
                No bookmarked listings yet
              </p>
            )}
            {listings.map(b => (
              <ListingCard key={b.id} listing={{ ...b.listing, bookmarked: true }} />
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}