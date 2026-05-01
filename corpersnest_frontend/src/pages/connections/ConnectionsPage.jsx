/**
 * pages/connections/ConnectionsPage.jsx
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

  const [pending,   setPending]   = useState([])
  const [accepted,  setAccepted]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [acting,    setActing]    = useState({})

  useEffect(() => {
    Promise.all([connectionsApi.getPending(), connectionsApi.getAll()])
      .then(([p, a]) => { setPending(p); setAccepted(a) })
      .catch(() => toast.error('Could not load connections'))
      .finally(() => setLoading(false))
  }, [])

  const act = async (connId, fn, label) => {
    setActing(p => ({ ...p, [connId]: label }))
    try {
      await fn()
      if (label === 'accept') {
        const conn = pending.find(c => c.id === connId)
        setPending(p => p.filter(c => c.id !== connId))
        if (conn) setAccepted(p => [...p, { ...conn, status: 'accepted' }])
      } else {
        setPending(p => p.filter(c => c.id !== connId))
        setAccepted(p => p.filter(c => c.id !== connId))
      }
    } catch (err) {
      toast.error(err.message)
    } finally {
      setActing(p => { const n = { ...p }; delete n[connId]; return n })
    }
  }

  const getOther = (conn) =>
    conn.requester_id === user?.id ? conn.receiver : conn.requester

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>
  )

  return (
    <PageWrapper>
      <div className="max-w-xl mx-auto">
        <h1 className="text-lg font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>
          Connections
        </h1>

        {/* Pending requests */}
        {pending.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>
              Pending requests ({pending.length})
            </h2>
            <div className="flex flex-col gap-3">
              {pending.map(conn => {
                const other = getOther(conn)
                return (
                  <div key={conn.id} className="card p-4 flex items-center gap-3">
                    <Link to={`/users/${other?.id}`}>
                      <Avatar name={other?.full_name} src={other?.profile_picture_url} size="sm" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/users/${other?.id}`}
                        className="text-sm font-semibold hover:underline"
                        style={{ color: 'var(--text-primary)' }}>
                        {other?.full_name}
                      </Link>
                      <div className="mt-0.5"><RoleBadge role={other?.role} /></div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" loading={acting[conn.id] === 'accept'}
                        onClick={() => act(conn.id, () => connectionsApi.accept(conn.id), 'accept')}>
                        Accept
                      </Button>
                      <Button size="sm" variant="ghost" loading={acting[conn.id] === 'reject'}
                        onClick={() => act(conn.id, () => connectionsApi.reject(conn.id), 'reject')}>
                        Decline
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Accepted connections */}
        <div>
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>
            Your connections ({accepted.length})
          </h2>

          {accepted.length === 0 && (
            <div className="card p-8 text-center">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                No connections yet. Visit someone's profile to connect.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {accepted.map(conn => {
              const other = getOther(conn)
              return (
                <div key={conn.id} className="card p-4 flex items-center gap-3">
                  <Link to={`/users/${other?.id}`}>
                    <Avatar name={other?.full_name} src={other?.profile_picture_url} size="sm" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/users/${other?.id}`}
                      className="text-sm font-semibold hover:underline"
                      style={{ color: 'var(--text-primary)' }}>
                      {other?.full_name}
                    </Link>
                    <div className="mt-0.5"><RoleBadge role={other?.role} /></div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" onClick={() => navigate(`/messages/${other?.id}`)}>
                      Message
                    </Button>
                    <Button size="sm" variant="ghost"
                      loading={acting[conn.id] === 'remove'}
                      onClick={() => act(conn.id, () => connectionsApi.remove(conn.id), 'remove')}>
                      Remove
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}