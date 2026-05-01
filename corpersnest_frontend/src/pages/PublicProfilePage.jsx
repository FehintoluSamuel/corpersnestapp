/**
 * pages/PublicProfilePage.jsx
 */

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { authApi, listingsApi, connectionsApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { formatDate } from '@/lib/utils'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import PageWrapper from '@/components/layout/PageWrapper'
import Avatar from '@/components/ui/Avatar'
import Spinner from '@/components/ui/Spinner'
import RoleBadge from '@/components/ui/RoleBadge'
import ConnectButton from '@/components/ui/ConnectButton'
import ListingCard from '@/components/listings/ListingCard'

export default function PublicProfilePage() {
  const { userId }            = useParams()
  const { user: currentUser } = useAuth()

  const [profile,         setProfile]         = useState(null)
  const [listings,        setListings]         = useState([])
  const [connectionCount, setConnectionCount]  = useState(0)
  const [loading,         setLoading]          = useState(true)
  const [error,           setError]            = useState(false)

  const isOwnProfile = currentUser && Number(userId) === currentUser.id

  useEffect(() => {
    Promise.all([
      authApi.getPublicUser(userId),
      listingsApi.getAll(),
      connectionsApi.getCount(userId),
    ])
      .then(([u, all, countData]) => {
        setProfile(u)
        setListings(all.filter(l => l.owner_id === u.id && l.status === 'active'))
        setConnectionCount(countData.count)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>
  if (error || !profile) return (
    <PageWrapper><div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>User not found.</div></PageWrapper>
  )

  const isLandlord = profile.role === 'landlord'
  const canContact = currentUser && profile.phone_no
  const waUrl      = canContact
    ? buildWhatsAppUrl(profile.phone_no, `Hi ${profile.full_name}, I found your profile on CorpersNest.`)
    : null

  return (
    <PageWrapper>
      <div className="max-w-xl mx-auto">

        {isOwnProfile && (
          <div className="mb-4 p-3 rounded-xl text-sm flex items-center justify-between"
            style={{ background: 'var(--brand-light)', color: 'var(--brand-dark)' }}>
            This is your public profile.
            <Link to="/profile" className="font-medium underline underline-offset-2">Go to settings</Link>
          </div>
        )}

        <div className="card p-5 mb-4">
          <div className="flex items-start gap-4 mb-4">
            <Avatar name={profile.full_name} src={profile.profile_picture_url} size="lg" />
            <div className="flex-1">
              <h1 className="font-semibold text-lg leading-tight mb-1" style={{ color: 'var(--text-primary)' }}>
                {profile.full_name}
              </h1>
              <RoleBadge role={profile.role} size="md" />
              {profile.state && (
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{profile.state}</p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 p-3 rounded-xl mb-4"
            style={{ background: 'var(--bg-subtle)' }}>
            <div className="text-center">
              <div className="text-xs font-semibold capitalize" style={{ color: 'var(--text-primary)' }}>
                {profile.status}
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Status</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                {connectionCount}
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Connections</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                {formatDate(profile.created_at)}
              </div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Joined</div>
            </div>
          </div>

          {/* Contact */}
          {!isOwnProfile && currentUser && (
            <div className="flex flex-col gap-2">
              {isLandlord && canContact ? (
                <>
                  <a href={`tel:${profile.phone_no}`}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-80"
                    style={{ background: 'var(--bg-subtle)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                    <PhoneIcon /> {profile.phone_no}
                  </a>
                  <a href={waUrl} target="_blank" rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
                    style={{ background: '#25D366' }}>
                    <WaIcon /> WhatsApp {profile.full_name.split(' ')[0]}
                  </a>
                </>
              ) : (
                <ConnectButton userId={parseInt(userId)} userName={profile.full_name} />
              )}
            </div>
          )}

          {!currentUser && (
            <p className="text-xs text-center mt-2" style={{ color: 'var(--text-muted)' }}>
              <Link to="/login" className="text-[var(--brand)] hover:underline">Log in</Link> to connect
            </p>
          )}
        </div>

        {listings.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              Active listings
            </h2>
            <div className="flex flex-col gap-3">
              {listings.map(l => <ListingCard key={l.id} listing={l} />)}
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  )
}

function PhoneIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
    </svg>
  )
}

function WaIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}