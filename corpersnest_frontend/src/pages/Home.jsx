import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { listingsApi } from '@/lib/api'
import { feedApi } from '@/lib/api'
import PageWrapper from '@/components/layout/PageWrapper'
import ListingCard from '@/components/listings/ListingCard'
import SkeletonListingGrid from '@/components/ui/SkeletonListingGrid'
import SkeletonCard from '@/components/ui/SkeletonCard'
import Button from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import Avatar from '@/components/ui/Avatar'

const TAG_LABELS = {
  question: 'Question', tip: 'Tip', room_available: 'Room available',
  roommate_needed: 'Roommate needed', scam_warning: 'Scam warning', general: 'General',
}

export default function HomePage() {
  const { user } = useAuth()
  const [listings, setListings] = useState([])
  const [posts, setPosts] = useState([])
  const [listingsLoading, setListingsLoading] = useState(true)
  const [postsLoading, setPostsLoading] = useState(true)

  const canPost = user?.role === 'outgoing_corper' || user?.role === 'landlord'

  useEffect(() => {
    listingsApi.getAll()
      .then(data => setListings(data.slice(0, 3)))
      .catch(() => {})
      .finally(() => setListingsLoading(false))

    feedApi.getAll()
      .then(data => setPosts(data.slice(0, 3)))
      .catch(() => {})
      .finally(() => setPostsLoading(false))
  }, [])

  return (
    <PageWrapper>
      {/* Welcome banner */}
      <div
        className="rounded-2xl p-5 mb-6 flex items-center justify-between gap-4"
        style={{ background: 'var(--brand-light)', border: '1px solid var(--brand)' }}
      >
        <div>
          <h1 className="text-lg font-semibold mb-0.5" style={{ color: 'var(--brand-dark)' }}>
            Welcome back, {user?.full_name?.split(' ')[0]}
          </h1>
          <p className="text-sm" style={{ color: 'var(--brand)' }}>
            {canPost
              ? 'Ready to help the next set of corpers find a home?'
              : 'Find your perfect room in Abia State.'}
          </p>
        </div>
        <Avatar name={user?.full_name} size="md" />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          {
            to: '/listings',
            label: 'Browse rooms',
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
            ),
          },
          {
            to: '/feed',
            label: 'Community feed',
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
            ),
          },
          ...(canPost ? [{
            to: '/listings/new',
            label: 'Post a room',
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M3 9L12 2L21 9V21H15V14H9V21H3V9Z"/>
                <line x1="12" y1="11" x2="12" y2="17"/>
                <line x1="9" y1="14" x2="15" y2="14"/>
              </svg>
            ),
          }] : []),
          {
            to: '/profile',
            label: 'My profile',
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20C4 17 7.6 14 12 14C16.4 14 20 17 20 20"/>
              </svg>
            ),
          },
        ].map(({ to, label, icon }) => (
          <Link
            key={to}
            to={to}
            className="card p-4 flex flex-col items-center gap-2 text-center hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 transition-all duration-200 group"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors group-hover:bg-[var(--brand-light)]"
              style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}
            >
              <span className="group-hover:text-[var(--brand)] transition-colors">
                {icon}
              </span>
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              {label}
            </span>
          </Link>
        ))}
      </div>

      {/* Recent listings */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            Recent listings
          </h2>
          <Link to="/listings">
            <Button variant="ghost" size="sm">See all</Button>
          </Link>
        </div>

        {listingsLoading && <SkeletonListingGrid count={3} />}

        {!listingsLoading && listings.length === 0 && (
          <div className="card p-8 text-center">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No listings yet — be the first to post.
            </p>
            {canPost && (
              <Link to="/listings/new" className="mt-3 inline-block">
                <Button size="sm">Post a room</Button>
              </Link>
            )}
          </div>
        )}

        {!listingsLoading && listings.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map(l => <ListingCard key={l.id} listing={l} />)}
          </div>
        )}
      </div>

      {/* Recent feed posts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
            From the community
          </h2>
          <Link to="/feed">
            <Button variant="ghost" size="sm">See all</Button>
          </Link>
        </div>

        {postsLoading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => <SkeletonCard key={i} lines={2} />)}
          </div>
        )}

        {!postsLoading && posts.length === 0 && (
          <div className="card p-8 text-center">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No posts yet — start the conversation.
            </p>
            <Link to="/feed" className="mt-3 inline-block">
              <Button size="sm">Go to feed</Button>
            </Link>
          </div>
        )}

        {!postsLoading && posts.length > 0 && (
          <div className="flex flex-col gap-3">
            {posts.map(post => (
              <Link
                key={post.id}
                to={`/feed/${post.id}`}
                className="card p-4 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 transition-all duration-200 block"
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <Avatar name={post.user?.full_name} size="xs" />
                  <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                    {post.user?.full_name}
                  </span>
                  <span
                    className={`tag tag-${post.tag} ml-auto`}
                    style={{ fontSize: '10px', padding: '2px 8px' }}
                  >
                    {TAG_LABELS[post.tag] || post.tag}
                  </span>
                </div>
                <p className="text-sm leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                  {post.content}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {formatDate(post.created_at)}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {post.likes_count ?? 0} likes · {post.comments_count ?? 0} comments
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}