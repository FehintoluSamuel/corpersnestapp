/**
 * pages/admin/AdminUsers.jsx
 *
 * Lists all users with role/status filters.
 * Admin can suspend, reinstate, or promote to admin.
 */

import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '@/lib/api'
import { useToast } from '@/context/ToastContext'
import { formatDate } from '@/lib/utils'
import PageWrapper from '@/components/layout/PageWrapper'
import Spinner from '@/components/ui/Spinner'
import RoleBadge from '@/components/ui/RoleBadge'
import Avatar from '@/components/ui/Avatar'

const ROLE_OPTIONS   = ['', 'pcm', 'incoming_corper', 'outgoing_corper', 'alumni', 'landlord', 'admin']
const STATUS_OPTIONS = ['', 'active', 'suspended', 'pending_verification']

export default function AdminUsers() {
  const toast = useToast()
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [acting,  setActing]  = useState({})
  const [roleFilter,   setRoleFilter]   = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    adminApi.getUsers({ role: roleFilter, status: statusFilter })
      .then(setUsers)
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false))
  }, [roleFilter, statusFilter])

  useEffect(() => { load() }, [load])

  const act = async (userId, action) => {
    setActing(p => ({ ...p, [userId]: action }))
    try {
      let updated
      if (action === 'suspend')    updated = await adminApi.suspendUser(userId)
      if (action === 'reinstate')  updated = await adminApi.reinstateUser(userId)
      if (action === 'make-admin') updated = await adminApi.makeAdmin(userId)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updated } : u))
      toast.success(`User ${action === 'suspend' ? 'suspended' : action === 'reinstate' ? 'reinstated' : 'promoted to admin'}`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setActing(p => { const n = { ...p }; delete n[userId]; return n })
    }
  }

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <Link to="/admin" className="text-sm transition-colors hover:text-[var(--text-primary)]"
            style={{ color: 'var(--text-muted)' }}>
            ← Dashboard
          </Link>
          <span style={{ color: 'var(--border)' }}>·</span>
          <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            User Management
          </h1>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-5">
          {[
            { value: roleFilter,   onChange: setRoleFilter,   options: ROLE_OPTIONS,   placeholder: 'All roles' },
            { value: statusFilter, onChange: setStatusFilter, options: STATUS_OPTIONS, placeholder: 'All statuses' },
          ].map((f, i) => (
            <select key={i} value={f.value} onChange={e => f.onChange(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl text-sm border"
              style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
              <option value="">{f.placeholder}</option>
              {f.options.filter(Boolean).map(o => (
                <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>
              ))}
            </select>
          ))}
        </div>

        {loading && <div className="flex justify-center py-16"><Spinner size="lg" /></div>}

        {!loading && users.length === 0 && (
          <div className="card p-10 text-center">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No users found.</p>
          </div>
        )}

        {!loading && users.length > 0 && (
          <div className="flex flex-col gap-3">
            {users.map(u => (
              <div key={u.id} className="card p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar name={u.full_name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                        {u.full_name}
                      </p>
                      <RoleBadge role={u.role} />
                      {u.status !== 'active' && (
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            background: u.status === 'suspended' ? '#FEF2F2' : '#FFFBEB',
                            color:      u.status === 'suspended' ? '#DC2626'  : '#D97706',
                          }}>
                          {u.status.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                      {u.email} {u.state ? `· ${u.state}` : ''} · Joined {formatDate(u.created_at)}
                    </p>
                  </div>
                </div>

                {/* Actions — don't show for admins */}
                {u.role !== 'admin' && (
                  <div className="flex gap-2">
                    {u.status === 'active' ? (
                      <button
                        onClick={() => act(u.id, 'suspend')}
                        disabled={!!acting[u.id]}
                        className="text-xs px-3 py-1.5 rounded-xl border transition-colors hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                        {acting[u.id] === 'suspend' ? 'Suspending…' : 'Suspend'}
                      </button>
                    ) : (
                      <button
                        onClick={() => act(u.id, 'reinstate')}
                        disabled={!!acting[u.id]}
                        className="text-xs px-3 py-1.5 rounded-xl border transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)]"
                        style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                        {acting[u.id] === 'reinstate' ? 'Reinstating…' : 'Reinstate'}
                      </button>
                    )}
                    <button
                      onClick={() => { if (confirm(`Promote ${u.full_name} to admin?`)) act(u.id, 'make-admin') }}
                      disabled={!!acting[u.id]}
                      className="text-xs px-3 py-1.5 rounded-xl border transition-colors hover:border-red-400 hover:text-red-600"
                      style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                      Make admin
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}