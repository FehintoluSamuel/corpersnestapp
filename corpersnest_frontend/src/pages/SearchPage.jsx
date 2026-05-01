/**
 * pages/SearchPage.jsx — search users and posts
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authApi, feedApi, listingsApi } from '@/lib/api'
import PageWrapper from '@/components/layout/PageWrapper'
import Avatar from '@/components/ui/Avatar'
import RoleBadge from '@/components/ui/RoleBadge'
import ListingCard from '@/components/listings/ListingCard'
import Spinner from '@/components/ui/Spinner'
import { formatDate } from '@/lib/utils'

const TAG_LABELS = { question:'Question', tip:'Tip', room_available:'Room available', roommate_needed:'Roommate needed', scam_warning:'Scam warning', general:'General' }

export default function SearchPage() {
  const [query,    setQuery]    = useState('')
  const [tab,      setTab]      = useState('users')
  const [results,  setResults]  = useState({ users:[], posts:[], listings:[] })
  const [loading,  setLoading]  = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (q = query) => {
    if (!q.trim()) return
    setLoading(true); setSearched(true)
    try {
      const [allPosts, allListings] = await Promise.all([feedApi.getAll(), listingsApi.getAll()])
      const kw = q.toLowerCase()
      const posts    = allPosts.filter(p => p.content?.toLowerCase().includes(kw) || p.tag?.toLowerCase().includes(kw) || p.user?.full_name?.toLowerCase().includes(kw))
      const listings = allListings.filter(l => l.title?.toLowerCase().includes(kw) || l.address?.toLowerCase().includes(kw) || l.lga?.toLowerCase().includes(kw))
      // Search users via public endpoint — fetch a few by trying common IDs
      // Since there's no user search endpoint yet, search by name in posts/listings owners
      const seenIds = new Set()
      const users = []
      ;[...posts.map(p => p.user), ...listings.map(l => l.owner)].forEach(u => {
        if (u && !seenIds.has(u.id) && u.full_name?.toLowerCase().includes(kw)) {
          seenIds.add(u.id); users.push(u)
        }
      })
      setResults({ users, posts, listings })
    } catch { setResults({ users:[], posts:[], listings:[] }) }
    finally { setLoading(false) }
  }

  const counts = { users: results.users.length, posts: results.posts.length, listings: results.listings.length }

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Search</h1>

        {/* Search bar */}
        <div className="flex gap-2 mb-5">
          <div className="flex-1 relative">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
              className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search users, posts, listings…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="input-base w-full pl-9 text-sm"
            />
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={!query.trim() || loading}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-opacity disabled:opacity-50"
            style={{ background: 'var(--brand)' }}>
            Search
          </button>
        </div>

        {loading && <div className="flex justify-center py-12"><Spinner size="md" /></div>}

        {!loading && searched && (
          <>
            {/* Tabs */}
            <div className="flex border-b mb-4" style={{ borderColor: 'var(--border)' }}>
              {['users','posts','listings'].map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px capitalize
                    ${tab === t ? 'text-[var(--brand)] border-[var(--brand)]' : 'text-[var(--text-muted)] border-transparent'}`}>
                  {t} ({counts[t]})
                </button>
              ))}
            </div>

            {/* Users */}
            {tab === 'users' && (
              <div className="flex flex-col gap-3">
                {results.users.length === 0 && <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>No users found</p>}
                {results.users.map(u => (
                  <Link key={u.id} to={`/users/${u.id}`}
                    className="card p-4 flex items-center gap-3 hover:shadow-[var(--shadow-card-hover)] transition-all">
                    <Avatar name={u.full_name} src={u.profile_picture_url} size="sm" />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{u.full_name}</p>
                      <RoleBadge role={u.role} />
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Posts */}
            {tab === 'posts' && (
              <div className="flex flex-col gap-3">
                {results.posts.length === 0 && <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>No posts found</p>}
                {results.posts.map(p => (
                  <Link key={p.id} to={`/feed/${p.id}`}
                    className="card p-4 hover:shadow-[var(--shadow-card-hover)] transition-all block">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar name={p.user?.full_name} src={p.user?.profile_picture_url} size="xs" />
                      <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{p.user?.full_name}</span>
                      <span className={`tag tag-${p.tag} ml-auto`} style={{ fontSize:'10px', padding:'2px 8px' }}>{TAG_LABELS[p.tag]||p.tag}</span>
                    </div>
                    <p className="text-sm leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{p.content}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{formatDate(p.created_at)}</p>
                  </Link>
                ))}
              </div>
            )}

            {/* Listings */}
            {tab === 'listings' && (
              <div className="flex flex-col gap-3">
                {results.listings.length === 0 && <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>No listings found</p>}
                {results.listings.map(l => <ListingCard key={l.id} listing={l} />)}
              </div>
            )}
          </>
        )}

        {!searched && !loading && (
          <p className="text-sm text-center py-12" style={{ color: 'var(--text-muted)' }}>
            Search for corpers, posts, or available rooms
          </p>
        )}
      </div>
    </PageWrapper>
  )
}