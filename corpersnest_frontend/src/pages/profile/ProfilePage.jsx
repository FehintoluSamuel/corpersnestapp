import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { listingsApi, authApi } from '@/lib/api'
import { roleBadgeLabel, formatDate } from '@/lib/utils'
import PageWrapper from '@/components/layout/PageWrapper'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import ListingCard from '@/components/listings/ListingCard'
import SkeletonCard from '@/components/ui/SkeletonCard'
import EmptyState from '@/components/ui/EmptyState'
import { useToast } from '@/context/ToastContext'

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

const InfoRow = ({ icon, label, value }) => (
  <div
    className="flex items-center justify-between text-sm py-3 border-b last:border-0"
    style={{ borderColor: 'var(--border)' }}
  >
    <span className="text-[var(--text-muted)] flex items-center gap-2">
      {icon}
      {label}
    </span>
    <span className="font-medium text-[var(--text-primary)] text-right ml-4 truncate max-w-[180px]">
      {value}
    </span>
  </div>
)

const icons = {
  email: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  phone: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
    </svg>
  ),
  id: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <line x1="2" y1="10" x2="22" y2="10"/>
    </svg>
  ),
  batch: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  logout: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
    </svg>
  ),
  plus: (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 1v12M1 7h12" strokeLinecap="round"/>
    </svg>
  ),
  camera: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  ),
}

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [myListings, setMyListings] = useState([])
  const [listingsLoading, setListingsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('info')
  const [avatarLoading, setAvatarLoading] = useState(false)

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

  const handleAvatarChange = async (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB')
      return
    }

    setAvatarLoading(true)
    try {
      // Upload directly to Cloudinary
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', UPLOAD_PRESET)
      formData.append('folder', 'corpersnest/avatars')

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      )
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()
      const cloudUrl = data.secure_url

      // Save URL to backend
      const updated = await authApi.updateAvatar(cloudUrl)

      // Update global user state so navbar avatar updates immediately
      updateUser({ profile_picture_url: updated.profile_picture_url })
      toast.success('Profile picture updated')
    } catch (err) {
      toast.error('Could not update profile picture')
    } finally {
      setAvatarLoading(false)
    }
  }

  if (!user) return null

  const infoRows = [
    { icon: icons.email, label: 'Email', value: user.email },
    user.phone_no && { icon: icons.phone, label: 'Phone', value: user.phone_no },
    user.nysc_state_code && { icon: icons.id, label: 'NYSC Code', value: user.nysc_state_code },
    user.batch_stream && { icon: icons.batch, label: 'Batch / Stream', value: user.batch_stream },
  ].filter(Boolean)

  return (
    <PageWrapper>
      <div className="max-w-xl mx-auto">

        {/* Profile header */}
        <div className="card p-5 mb-4">
          <div className="flex items-center gap-4 mb-4">

            {/* Avatar with upload overlay */}
            <div className="relative shrink-0">
              <Avatar
                name={user.full_name}
                src={user.profile_picture_url}
                size="lg"
              />

              {/* Camera overlay — hover to reveal */}
              <label
                className="absolute inset-0 rounded-full flex items-center justify-center cursor-pointer transition-opacity"
                style={{
                  background: avatarLoading ? 'rgba(0,0,0,0.5)' : 'transparent',
                }}
                onMouseEnter={e => {
                  if (!avatarLoading) e.currentTarget.style.background = 'rgba(0,0,0,0.45)'
                }}
                onMouseLeave={e => {
                  if (!avatarLoading) e.currentTarget.style.background = 'transparent'
                }}
                title="Change profile photo"
              >
                {avatarLoading ? (
                  <Spinner size="sm" />
                ) : (
                  <span className="opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center w-full h-full rounded-full"
                    style={{ background: 'rgba(0,0,0,0.45)' }}>
                    {icons.camera}
                  </span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={avatarLoading}
                  onChange={(e) => handleAvatarChange(e.target.files[0])}
                />
              </label>
            </div>

            <div className="flex-1">
              <h1 className="font-semibold text-lg text-[var(--text-primary)] leading-tight">
                {user.full_name}
              </h1>
              <span className="tag tag-tip text-xs mt-1 inline-block">
                {roleBadgeLabel(user.role)}
              </span>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Tap photo to change
              </p>
            </div>
          </div>

          {/* Status banners */}
          {user.status === 'suspended' && (
            <div className="p-3 rounded-xl border mb-3 text-xs"
              style={{ background: '#2A0A0A', borderColor: '#7F1D1D', color: '#FCA5A5' }}>
              <div className="flex items-center gap-2 font-medium mb-0.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                Account suspended
              </div>
              Contact support for assistance.
            </div>
          )}

          {user.role === 'landlord' && (
            <div className="p-3 rounded-xl border mb-3 text-xs"
              style={{ background: '#2A1A00', borderColor: '#78350F', color: '#FCD34D' }}>
              <div className="flex items-center gap-2 font-medium mb-0.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                Pending verification
              </div>
              Landlord accounts are manually verified before listings go public.
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-subtle)' }}>
            {[
              { label: 'Member since', value: formatDate(user.created_at || new Date().toISOString()) },
              { label: 'Role', value: roleBadgeLabel(user.role) },
              { label: 'Status', value: user.status || 'active' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-xs font-semibold text-[var(--text-primary)] capitalize truncate">
                  {s.value}
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
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

        {/* Tab: Account info */}
        {activeTab === 'info' && (
          <div className="card p-5 flex flex-col gap-4 animate-fade-in">
            <div className="flex flex-col gap-0">
              {infoRows.map(row => (
                <InfoRow key={row.label} {...row} />
              ))}
            </div>
            <Button
              variant="ghost"
              fullWidth
              onClick={handleLogout}
              className="text-red-500 hover:text-red-600 border-red-200 hover:border-red-300 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950 mt-2"
            >
              {icons.logout}
              Log out
            </Button>
          </div>
        )}

        {/* Tab: My listings */}
        {activeTab === 'listings' && canPost && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-[var(--text-muted)]">
                {listingsLoading
                  ? 'Loading…'
                  : `${myListings.length} listing${myListings.length !== 1 ? 's' : ''}`}
              </p>
              <Link to="/listings/new">
                <Button size="sm">
                  {icons.plus}
                  New listing
                </Button>
              </Link>
            </div>

            {listingsLoading && (
              <div className="flex flex-col gap-3">
                {[1, 2].map(i => <SkeletonCard key={i} showImage lines={2} />)}
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