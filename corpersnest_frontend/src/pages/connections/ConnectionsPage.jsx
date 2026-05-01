/**
 * pages/connections/ConnectionsPage.jsx — sent, received, accepted tabs
 */
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { connectionsApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import PageWrapper from '@/components/layout/PageWrapper'
import Avatar from '@/components/ui/Avatar'
import RoleBadge from '@/components/ui/RoleBadge'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'

export default function ConnectionsPage() {
  const { user }  = useAuth()
  const toast     = useToast()
  const navigate  = useNavigate()

  const [all,     setAll]     = useState([])   // all connections for this user
  const [loading, setLoading] = useState(true)
  const [acting,  setActing]  = useState({})
  const [tab,     setTab]     = useState('received')

  useEffect(() => {
    // Fetch accepted + pending in parallel
    Promise.all([connectionsApi.getAll(), connectionsApi.getPending()])
      .then(([accepted, pending]) => setAll([...accepted, ...pending]))
      .catch(() => toast.error('Could not load connections'))
      .finally(() => setLoading(false))
  }, [])

  const received = all.filter(c => c.status === 'pending' && c.receiver_id === user?.id)
  const sent     = all.filter(c => c.status === 'pending' && c.requester_id === user?.id)
  const accepted = all.filter(c => c.status === 'accepted')

  const getOther = (conn) => conn.requester_id === user?.id ? conn.receiver : conn.requester

  const act = async (connId, fn, label) => {
    setActing(p => ({ ...p, [connId]: label }))
    try {
      await fn()
      if (label === 'accept') {
        setAll(prev => prev.map(c => c.id === connId ? { ...c, status: 'accepted' } : c))
        toast.success('Connection accepted')
      } else {
        setAll(prev => prev.filter(c => c.id !== connId))
        toast.success(label === 'reject' ? 'Request declined' : 'Connection removed')
      }
    } catch (err) { toast.error(err.message) }
    finally { setActing(p => { const n={...p}; delete n[connId]; return n }) }
  }

  const TABS = [
    { key: 'received', label: 'Received',   count: received.length },
    { key: 'sent',     label: 'Sent',       count: sent.length },
    { key: 'accepted', label: 'Connected',  count: accepted.length },
  ]

  const renderUser = (conn, actions) => {
    const other = getOther(conn)
    if (!other) return null
    return (
      <div key={conn.id} className="card p-4 flex items-center gap-3">
        <Link to={`/users/${other.id}`}>
          <Avatar name={other.full_name} src={other.profile_picture_url} size="sm" />
        </Link>
        <div className="flex-1 min-w-0">
          <Link to={`/users/${other.id}`} className="text-sm font-semibold hover:underline"
            style={{ color: 'var(--text-primary)' }}>
            {other.full_name}
          </Link>
          <div className="mt-0.5"><RoleBadge role={other.role} /></div>
        </div>
        <div className="flex gap-2 shrink-0">{actions(conn)}</div>
      </div>
    )
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>

  return (
    <PageWrapper>
      <div className="max-w-xl mx-auto">
        <h1 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Connections</h1>

        {/* Tabs */}
        <div className="flex border-b mb-4" style={{ borderColor: 'var(--border)' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px
                ${tab === t.key ? 'text-[var(--brand)] border-[var(--brand)]' : 'text-[var(--text-muted)] border-transparent'}`}>
              {t.label} {t.count > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs" style={{ background:'var(--brand-light)', color:'var(--brand)' }}>{t.count}</span>}
            </button>
          ))}
        </div>

        {/* Received */}
        {tab === 'received' && (
          <div className="flex flex-col gap-3">
            {received.length === 0 && <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>No pending requests</p>}
            {received.map(conn => renderUser(conn, c => (
              <>
                <Button size="sm" loading={acting[c.id]==='accept'}
                  onClick={() => act(c.id, () => connectionsApi.accept(c.id), 'accept')}>Accept</Button>
                <Button size="sm" variant="ghost" loading={acting[c.id]==='reject'}
                  onClick={() => act(c.id, () => connectionsApi.reject(c.id), 'reject')}>Decline</Button>
              </>
            )))}
          </div>
        )}

        {/* Sent */}
        {tab === 'sent' && (
          <div className="flex flex-col gap-3">
            {sent.length === 0 && <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>No sent requests</p>}
            {sent.map(conn => renderUser(conn, c => (
              <Button size="sm" variant="ghost" loading={acting[c.id]==='cancel'}
                onClick={() => act(c.id, () => connectionsApi.remove(c.id), 'cancel')}>Cancel</Button>
            )))}
          </div>
        )}

        {/* Accepted */}
        {tab === 'accepted' && (
          <div className="flex flex-col gap-3">
            {accepted.length === 0 && <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>No connections yet</p>}
            {accepted.map(conn => renderUser(conn, c => {
              const other = getOther(c)
              return (
                <>
                  <Button size="sm" onClick={() => navigate(`/messages/${other?.id}`)}>Message</Button>
                  <Button size="sm" variant="ghost" loading={acting[c.id]==='remove'}
                    onClick={() => act(c.id, () => connectionsApi.remove(c.id), 'remove')}>Remove</Button>
                </>
              )
            }))}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}