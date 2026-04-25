import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { listingsApi } from '@/lib/api'
import { roleBadgeLabel, formatDate } from '@/lib/utils'
import PageWrapper from '@/components/layout/PageWrapper'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import ListingCard from '@/components/listings/ListingCard'
import SkeletonCard from '@/components/ui/SkeletonCard'
import EmptyState from '@/components/ui/EmptyState'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [myListings, setMyListings] = useState([])
  const [listingsLoading, setListingsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('info')

  const canPost = user?.role === 'outgoing_corper' || user?.role === 'landlord'

  useEffect(() => {
    if (activeTab === 'listings' && canPost) {
      setListingsLoading(true)
      listingsApi.getAll()
        .then(all => setMyListings(all.filter(l => l.owner_id === user.id)))
        .catch(() => {})
        .finally(() => setListingsLoading(false))
    }
  }, [activeTab])

  const handleLogout = () => { logout(); navigate('/') }

  if (!user) return null

  return (
    <PageWrapper>
      <div className="max-w-xl mx-auto">

        <div className="card p-5 mb-4">
          <div className="flex items-center gap-4 mb-4">
            <Avatar name={user.full_name} size="lg" />
            <div className="flex-1">
              <h1 className="font-semibold text-lg text-[var(--text-primary)] leading-tight">{user.full_name}</h1>
              <span className="tag tag-tip text-xs mt-1 inline-block">{roleBadgeLabel(user.role)}</span>
            </div>
          </div>

          {user.status === 'suspended' && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 mb-3">
              ⚠️ Your account is currently suspended. Contact support for assistance.
            </div>
          )}
          {user.role === 'landlord' && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-400 mb-3">
              🔍 Landlord accounts are manually verified before listings go public.
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-subtle)' }}>
            {[
              { label: 'Member since', value: formatDate(user.created_at || new Date().toISOString()) },
              { label: 'Role', value: roleBadgeLabel(user.role) },
              { label: 'Status', value: user.status || 'active' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-xs font-semibold text-[var(--text-primary)] capitalize truncate">{s.value}</div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex border-b mb-4" style={{ borderColor: 'var(--border)' }}>
          {[
            { key: 'info', label: 'Account info' },
            ...(canPost ? [{ key: 'listings', label: 'My listings' }] : []),
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px
                ${activeTab === tab.key
                  ? 'text-[var(--brand)] border-[var(--brand)]'
                  : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text-primary)]'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'info' && (
          <div className="card p-5 flex flex-col gap-4 animate-fade-in">
            <div className="flex flex-col gap-0">
              {[
                { label: 'Email', value: user.email, icon: '✉️' },
                user.phone_no && { label: 'Phone', value: user.phone_no, icon: '📞' },
                user.nysc_state_code && { label: 'NYSC Code', value: user.nysc_state_code, icon: '🪪' },
                user.batch_stream && { label: 'Batch / Stream', value: user.batch_stream, icon: '📋' },
              ].filter(Boolean).map(row => (
                <div
                  key={row.label}
                  className="flex items-center justify-between text-sm py-3 border-b last:border-0"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <span className="text-[var(--text-muted)] flex items-center gap-2">
                    <span>{row.icon}</span>{row.label}
                  </span>
                  <span className="font-medium text-[var(--text-primary)] text-right ml-4 truncate max-w-[180px]">{row.value}</span>
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              fullWidth
              onClick={handleLogout}
              className="text-red-500 hover:text-red-600 border-red-200 hover:border-red-300 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950 mt-2"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
              Log out
            </Button>
          </div>
        )}

        {activeTab === 'listings' && canPost && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-[var(--text-muted)]">
                {listingsLoading ? 'Loading…' : `${myListings.length} listing${myListings.length !== 1 ? 's' : ''}`}
              </p>
              <Link to="/listings/new">
                <Button size="sm">
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M7 1v12M1 7h12" strokeLinecap="round"/>
                  </svg>
                  New listing
                </Button>
              </Link>
            </div>

            {listingsLoading && (
              <div className="flex flex-col gap-3">
                {[1,2].map(i => <SkeletonCard key={i} showImage lines={2} />)}
              </div>
            )}

            {!listingsLoading && myListings.length === 0 && (
              <EmptyState
                icon={
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                    <path d="M3 9L12 2L21 9V21H15V14H9V21H3V9Z"/>
                  </svg>
                }
                title="No listings yet"
                description="Post your room so incoming corpers can find you."
                action={() => navigate('/listings/new')}
                actionLabel="Post a room"
              />
            )}

            {!listingsLoading && myListings.length > 0 && (
              <div className="flex flex-col gap-3">
                {myListings.map(l => <ListingCard key={l.id} listing={l} />)}
              </div>
            )}
          </div>
        )}

      </div>
    </PageWrapper>
  )
}