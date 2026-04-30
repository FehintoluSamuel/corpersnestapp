/**
 * pages/admin/AdminDashboard.jsx
 *
 * Overview of pending actions — landlord queue, open reports, total users.
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '@/lib/api'
import PageWrapper from '@/components/layout/PageWrapper'
import Spinner from '@/components/ui/Spinner'

function StatCard({ label, value, to, color = 'var(--brand)', icon }) {
  const content = (
    <div className="card p-5 flex items-center gap-4 hover:shadow-[var(--shadow-card-hover)] transition-all">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${color}18`, color }}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</p>
      </div>
    </div>
  )
  return to ? <Link to={to}>{content}</Link> : content
}

export default function AdminDashboard() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.getDashboard()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
          Admin Dashboard
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          CorpersNest platform overview
        </p>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard
              label="Pending landlord verifications"
              value={data?.pending_landlord_verifications ?? 0}
              to="/admin/landlords"
              color="#D97706"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M3 9L12 2L21 9V21H15V14H9V21H3V9Z"/>
                </svg>
              }
            />
            <StatCard
              label="Open reports"
              value={data?.open_reports ?? 0}
              to="/admin/reports"
              color="#DC2626"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              }
            />
            <StatCard
              label="Total users"
              value={data?.total_users ?? 0}
              to="/admin/users"
              color="var(--brand)"
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                </svg>
              }
            />
          </div>
        )}

        {/* Quick nav */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { to: '/admin/landlords', label: 'Landlord verification queue', desc: 'Approve or reject new landlords' },
            { to: '/admin/users',     label: 'User management',             desc: 'View, suspend, or promote users' },
            { to: '/admin/reports',   label: 'Reports queue',               desc: 'Review flagged listings and users' },
          ].map(item => (
            <Link key={item.to} to={item.to}
              className="card p-4 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 transition-all">
              <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>
                {item.label}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </PageWrapper>
  )
}