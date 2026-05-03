/**
 * pages/profile/ProfilePage.jsx
 */

import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { listingsApi, authApi } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import PageWrapper from '@/components/layout/PageWrapper'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Spinner from '@/components/ui/Spinner'
import ListingCard from '@/components/listings/ListingCard'
import SkeletonCard from '@/components/ui/SkeletonCard'
import EmptyState from '@/components/ui/EmptyState'
import RoleBadge from '@/components/ui/RoleBadge'

const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

const ABIA_LGAS = [
  'Aba North', 'Aba South', 'Arochukwu', 'Bende', 'Ikwuano',
  'Isiala Ngwa North', 'Isiala Ngwa South', 'Isuikwuato', 'Obi Ngwa',
  'Ohafia', 'Osisioma', 'Ugwunagbo', 'Ukwa East', 'Ukwa West',
  'Umuahia North', 'Umuahia South', 'Umu Nneochi',
]

const Icon = {
  email: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  phone: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>,
  logout: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
  edit: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  camera: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  plus: <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 1v12M1 7h12" strokeLinecap="round"/></svg>,
  warn: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between text-sm py-3 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
      <span className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>{icon}{label}</span>
      <span className="font-medium text-right ml-4 truncate max-w-[180px]" style={{ color: 'var(--text-primary)' }}>{value}</span>
    </div>
  )
}

function isExpired(listing) {
  if (listing.status !== 'inactive') return false
  return (Date.now() - new Date(listing.created_at).getTime()) / 86400000 > 90
}

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth()
  const toast    = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const initialTab = searchParams.get('tab') === 'nysc' ? 'nysc' : 'info'
  const [activeTab,       setActiveTab]       = useState(initialTab)
  const [myListings,      setMyListings]       = useState([])
  const [listingsLoading, setListingsLoading]  = useState(false)
  const [avatarLoading,   setAvatarLoading]    = useState(false)
  const [reposting,       setReposting]        = useState({})
  const [editingInfo,     setEditingInfo]      = useState(false)
  const [editingNysc,     setEditingNysc]      = useState(false)
  const [savingInfo,      setSavingInfo]       = useState(false)
  const [savingNysc,      setSavingNysc]       = useState(false)
  const [nyscErrors,      setNyscErrors]       = useState({})

  const [infoForm, setInfoForm] = useState({ full_name: user?.full_name || '', phone_no: user?.phone_no || '' })
  const [nyscForm, setNyscForm] = useState({
    callup_number: user?.callup_number || '', nysc_state_code: user?.nysc_state_code || '',
    stream: user?.stream?.toString() || '', camp_start_date: user?.camp_start_date || '',
  })
  const [lga, setLga] = useState(user?.landlord_profile?.lga || '')

  const canPost    = ['outgoing_corper', 'landlord'].includes(user?.role)
  const isLandlord = user?.role === 'landlord'
  const isPcm      = user?.role === 'pcm'
  const isAdmin    = user?.role === 'admin'

  useEffect(() => {
    if (activeTab === 'listings') {
      setListingsLoading(true)
      listingsApi.getAll()
        .then(all => setMyListings(all.filter(l => l.owner_id === user.id)))
        .catch(() => {})
        .finally(() => setListingsLoading(false))
    }
  }, [activeTab])

  const handleAvatarChange = async (file) => {
    if (!file || !file.type.startsWith('image/')) { toast.error('Select an image file'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return }
    setAvatarLoading(true)
    try {
      const fd = new FormData()
      fd.append('file', file); fd.append('upload_preset', UPLOAD_PRESET); fd.append('folder', 'corpersnest/avatars')
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: fd })
      if (!res.ok) throw new Error()
      const data    = await res.json()
      const updated = await authApi.updateAvatar(data.secure_url)
      updateUser({ profile_picture_url: updated.profile_picture_url })
      toast.success('Profile picture updated')
    } catch { toast.error('Could not update profile picture') }
    finally  { setAvatarLoading(false) }
  }

  const handleSaveInfo = async () => {
    setSavingInfo(true)
    try {
      const payload = {}
      if (infoForm.full_name.trim() !== user.full_name) payload.full_name = infoForm.full_name.trim()
      if (infoForm.phone_no.trim()  !== (user.phone_no || '')) payload.phone_no = infoForm.phone_no.trim() || null
      if (Object.keys(payload).length > 0) { const updated = await authApi.updateProfile(payload); updateUser(updated) }
      setEditingInfo(false); toast.success('Profile updated')
    } catch (err) { toast.error(err.message) }
    finally { setSavingInfo(false) }
  }

  const handleSaveNysc = async () => {
    const errs = {}
    if (nyscForm.callup_number && !/^NYSC\/[A-Z]{2,5}\/\d{4}\/\d+$/i.test(nyscForm.callup_number.trim())) errs.callup_number = 'Format: NYSC/XXX/YYYY/NNNNNN'
    if (nyscForm.nysc_state_code && !/^[A-Z]{2}\/\d{2}[ABC]\/\d+$/i.test(nyscForm.nysc_state_code.trim())) errs.nysc_state_code = 'Format: AB/25A/2008'
    if (nyscForm.stream && !['1','2'].includes(nyscForm.stream)) errs.stream = 'Must be 1 or 2'
    setNyscErrors(errs)
    if (Object.keys(errs).length > 0) return
    setSavingNysc(true)
    try {
      const payload = {}
      if (nyscForm.callup_number.trim())   payload.callup_number   = nyscForm.callup_number.trim().toUpperCase()
      if (nyscForm.nysc_state_code.trim()) payload.nysc_state_code = nyscForm.nysc_state_code.trim().toUpperCase()
      if (nyscForm.stream)                 payload.stream          = parseInt(nyscForm.stream)
      if (nyscForm.camp_start_date)        payload.camp_start_date = nyscForm.camp_start_date
      if (Object.keys(payload).length > 0) { const updated = await authApi.updateProfile(payload); updateUser(updated) }
      if (isLandlord && lga !== (user?.landlord_profile?.lga || '')) { const updated = await authApi.updateLandlordProfile({ lga }); updateUser(updated) }
      setEditingNysc(false); toast.success('NYSC profile updated')
    } catch (err) { toast.error(err.message) }
    finally { setSavingNysc(false) }
  }

  const handleRepost = async (listing) => {
    setReposting(p => ({ ...p, [listing.id]: true }))
    try {
      await listingsApi.update(listing.id, { status: 'active' })
      setMyListings(prev => prev.map(l => l.id === listing.id ? { ...l, status: 'active' } : l))
      toast.success('Listing reactivated!')
    } catch (err) { toast.error(err.message) }
    finally { setReposting(p => { const n = { ...p }; delete n[listing.id]; return n }) }
  }

  if (!user) return null

  const tabs = [
    { key: 'info',     label: 'Account' },
    { key: 'nysc',     label: isLandlord ? 'Property info' : 'NYSC profile' },
    { key: 'listings', label: 'Listings' },
  ]

  return (
    <PageWrapper>
      <div className="max-w-xl mx-auto">

        {/* Profile header */}
        <div className="card p-5 mb-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative shrink-0">
              <Avatar name={user.full_name} src={user.profile_picture_url} size="lg" />
              <label
                className="absolute inset-0 rounded-full flex items-center justify-center cursor-pointer transition-all"
                style={{ background: avatarLoading ? 'rgba(0,0,0,0.5)' : 'transparent' }}
                onMouseEnter={e => { if (!avatarLoading) e.currentTarget.style.background = 'rgba(0,0,0,0.45)' }}
                onMouseLeave={e => { if (!avatarLoading) e.currentTarget.style.background = 'transparent' }}
                title="Change profile photo"
              >
                {avatarLoading
                  ? <Spinner size="sm" />
                  : <span className="opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center w-full h-full rounded-full" style={{ background: 'rgba(0,0,0,0.45)' }}>{Icon.camera}</span>
                }
                <input type="file" accept="image/*" className="hidden" disabled={avatarLoading} onChange={e => handleAvatarChange(e.target.files[0])} />
              </label>
            </div>
            <div className="flex-1">
              <h1 className="font-semibold text-lg leading-tight mb-1" style={{ color: 'var(--text-primary)' }}>{user.full_name}</h1>
              <RoleBadge role={user.role} />
              {user.state && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{user.state}</p>}
            </div>
            {isAdmin && <Link to="/admin"><Button size="sm" variant="ghost">Admin panel</Button></Link>}
          </div>

          {user.status === 'suspended' && (
            <div className="p-3 rounded-xl border mb-3 text-xs" style={{ background: '#2A0A0A', borderColor: '#7F1D1D', color: '#FCA5A5' }}>
              <p className="font-medium mb-0.5">Account suspended</p>Contact support for assistance.
            </div>
          )}
          {isLandlord && user.status === 'pending_verification' && (
            <div className="p-3 rounded-xl border mb-3 text-xs" style={{ background: '#FFFBEB', borderColor: '#D97706', color: '#92400E' }}>
              <p className="font-medium mb-0.5">Pending verification</p>Our team is reviewing your account.
            </div>
          )}
          {isPcm && !user.nysc_state_code && (
            <div className="p-3 rounded-xl border mb-3 text-xs" style={{ background: 'var(--brand-light)', borderColor: 'var(--brand)', color: 'var(--brand-dark)' }}>
              <p className="font-medium mb-0.5">Complete your NYSC profile</p>
              Add your state code to unlock full access.{' '}
              <button onClick={() => setActiveTab('nysc')} className="underline font-semibold">Do it now →</button>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-subtle)' }}>
            {[
              { label: 'Joined', value: formatDate(user.created_at || new Date().toISOString()) },
              { label: 'State',  value: user.state || '—' },
              { label: 'Status', value: user.status || 'active' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-xs font-semibold capitalize truncate" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-4" style={{ borderColor: 'var(--border)' }}>
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px
                ${activeTab === tab.key ? 'text-[var(--brand)] border-[var(--brand)]' : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text-primary)]'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Account info tab */}
        {activeTab === 'info' && (
          <div className="card p-5 flex flex-col gap-4 animate-fade-in">
            {!editingInfo ? (
              <>
                <div className="flex flex-col">
                  <InfoRow icon={Icon.email} label="Email" value={user.email} />
                  {user.phone_no && <InfoRow icon={Icon.phone} label="Phone" value={user.phone_no} />}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" fullWidth size="sm"
                    onClick={() => { setInfoForm({ full_name: user.full_name, phone_no: user.phone_no || '' }); setEditingInfo(true) }}>
                    {Icon.edit} Edit profile
                  </Button>
                  <Button variant="ghost" fullWidth size="sm"
                    className="text-red-500 hover:text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => { logout(); navigate('/') }}>
                    {Icon.logout} Log out
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-4 animate-fade-in">
                <Input label="Full name" value={infoForm.full_name} onChange={e => setInfoForm(p => ({ ...p, full_name: e.target.value }))} />
                <Input label="Phone number" type="tel" placeholder="08012345678" value={infoForm.phone_no} onChange={e => setInfoForm(p => ({ ...p, phone_no: e.target.value }))} />
                <div className="flex gap-2">
                  <Button fullWidth size="sm" loading={savingInfo} onClick={handleSaveInfo}>Save changes</Button>
                  <Button fullWidth size="sm" variant="ghost" onClick={() => setEditingInfo(false)}>Cancel</Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* NYSC tab */}
        {activeTab === 'nysc' && (
          <div className="card p-5 animate-fade-in">
            {!editingNysc ? (
              <div className="flex flex-col gap-1">
                {!isLandlord && (
                  <>
                    <InfoRow icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>} label="Callup number" value={user.callup_number || '—'} />
                    <InfoRow icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>} label="State code" value={user.nysc_state_code || '—'} />
                    <InfoRow icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>} label="Stream" value={user.stream ? `Stream ${user.stream}` : '—'} />
                    <InfoRow icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>} label="Camp start" value={user.camp_start_date || '—'} />
                  </>
                )}
                {isLandlord && (
                  <InfoRow icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>} label="LGA" value={user.landlord_profile?.lga || '—'} />
                )}
                <Button variant="ghost" fullWidth size="sm" className="mt-3"
                  onClick={() => {
                    setNyscForm({ callup_number: user.callup_number || '', nysc_state_code: user.nysc_state_code || '', stream: user.stream?.toString() || '', camp_start_date: user.camp_start_date || '' })
                    setLga(user.landlord_profile?.lga || '')
                    setEditingNysc(true)
                  }}>
                  {Icon.edit} Edit NYSC info
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4 animate-fade-in">
                {!isLandlord && (
                  <>
                    <Input label="Callup number" placeholder="NYSC/FUA/2025/107449" value={nyscForm.callup_number} onChange={e => setNyscForm(p => ({ ...p, callup_number: e.target.value }))} error={nyscErrors.callup_number} />
                    <Input label="State code" placeholder="AB/25A/2008" value={nyscForm.nysc_state_code} onChange={e => setNyscForm(p => ({ ...p, nysc_state_code: e.target.value }))} error={nyscErrors.nysc_state_code} />
                    <div>
                      <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--text-primary)' }}>Stream</label>
                      <div className="flex gap-2">
                        {['1','2'].map(s => (
                          <button key={s} type="button"
                            onClick={() => setNyscForm(p => ({ ...p, stream: p.stream === s ? '' : s }))}
                            className="flex-1 py-2 rounded-xl text-sm font-medium border transition-all"
                            style={{ background: nyscForm.stream===s ? 'var(--brand)' : 'var(--bg-subtle)', color: nyscForm.stream===s ? 'white' : 'var(--text-secondary)', borderColor: nyscForm.stream===s ? 'var(--brand)' : 'var(--border)' }}>
                            Stream {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Input label="Camp start date" type="date" value={nyscForm.camp_start_date} onChange={e => setNyscForm(p => ({ ...p, camp_start_date: e.target.value }))} />
                  </>
                )}
                {isLandlord && (
                  <div>
                    <label className="text-sm font-medium block mb-1.5" style={{ color: 'var(--text-primary)' }}>LGA</label>
                    <select value={lga} onChange={e => setLga(e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm border" style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                      <option value="">Select LGA</option>
                      {ABIA_LGAS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button fullWidth size="sm" loading={savingNysc} onClick={handleSaveNysc}>Save</Button>
                  <Button fullWidth size="sm" variant="ghost" onClick={() => setEditingNysc(false)}>Cancel</Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Listings tab */}
        {activeTab === 'listings' && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {listingsLoading ? 'Loading…' : `${myListings.length} listing${myListings.length !== 1 ? 's' : ''}`}
              </p>
              {canPost && (
                <Link to="/listings/new">
                  <Button size="sm">{Icon.plus} New listing</Button>
                </Link>
              )}
            </div>

            {listingsLoading && (
              <div className="flex flex-col gap-3">
                {[1,2].map(i => <SkeletonCard key={i} showImage lines={2} />)}
              </div>
            )}

            {!listingsLoading && myListings.length === 0 && (
              <EmptyState
                icon={<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M3 9L12 2L21 9V21H15V14H9V21H3V9Z"/></svg>}
                title="No listings yet"
                description={canPost ? 'Post your room so corpers can find you.' : 'Complete your NYSC profile to post listings.'}
                action={canPost ? () => navigate('/listings/new') : () => setActiveTab('nysc')}
                actionLabel={canPost ? 'Post a room' : 'Complete profile'}
              />
            )}

            {!listingsLoading && myListings.length > 0 && (
              <div className="flex flex-col gap-3">
                {myListings.map(listing => (
                  <div key={listing.id}>
                    <ListingCard listing={listing} />

                    {/* Expired warning + repost button */}
                    {isExpired(listing) && (
                      <div className="mt-1 mx-1 px-3 py-2 rounded-xl flex items-center justify-between gap-3"
                        style={{ background: '#FFFBEB', border: '1px solid #D97706' }}>
                        <div className="flex items-center gap-2">
                          {Icon.warn}
                          <p className="text-xs font-medium" style={{ color: '#92400E' }}>
                            Expired — repost to make active again
                          </p>
                        </div>
                        <button
                          disabled={reposting[listing.id]}
                          onClick={() => handleRepost(listing)}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity disabled:opacity-50 shrink-0 text-white"
                          style={{ background: '#D97706' }}>
                          {reposting[listing.id] ? 'Reposting…' : 'Repost'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </PageWrapper>
  )
}