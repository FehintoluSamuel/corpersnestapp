import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function LandingPage() {
  const { user } = useAuth()

  if (user) {
    // Redirect logged in users — but we handle this in the router
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-page)' }}>
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        {/* Logo mark */}
        <div className="w-16 h-16 rounded-2xl bg-[var(--brand)] flex items-center justify-center mb-6 shadow-lg">
          <svg width="30" height="30" viewBox="0 0 18 18" fill="none">
            <path d="M9 2L15 6.5V16H3V6.5L9 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="none"/>
            <rect x="6.5" y="10" width="5" height="6" rx="1" fill="white"/>
            <circle cx="9" cy="7.5" r="1.2" fill="white"/>
          </svg>
        </div>

        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-3">
          <span style={{ color: 'var(--brand)' }}>Corper</span>
          <span style={{ color: 'var(--text-primary)' }}>Nest</span>
        </h1>
        <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-md mb-2">
          Find your home away from home.
        </p>
        <p className="text-sm text-[var(--text-muted)] max-w-sm mb-10">
          Housing for NYSC corps members in Abia State — rooms from outgoing corpers, verified landlords, and a community that has your back.
        </p>

        <div className="flex gap-3 flex-wrap justify-center">
          <Link
            to="/register"
            className="btn-primary px-8 py-3 text-base"
          >
            Get started →
          </Link>
          <Link
            to="/listings"
            className="btn-ghost px-8 py-3 text-base"
          >
            Browse rooms
          </Link>
        </div>

        {/* Stats row */}
        <div className="flex gap-8 mt-14 flex-wrap justify-center">
          {[
            { label: 'Corps members helped', value: '500+' },
            { label: 'Rooms listed', value: '120+' },
            { label: 'LGAs covered', value: '17' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-semibold text-[var(--brand)]">{s.value}</div>
              <div className="text-xs text-[var(--text-muted)] mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature strips */}
      <div className="border-t pb-12 pt-10 px-4" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
          {[
            {
              icon: '🏠',
              title: 'Room handovers',
              desc: 'Outgoing corpers pass their rooms directly to incoming ones.',
            },
            {
              icon: '✅',
              title: 'Verified landlords',
              desc: 'Landlords are manually verified by admins before listing.',
            },
            {
              icon: '💬',
              title: 'Community feed',
              desc: 'Tips, warnings, and questions from corpers who\'ve been there.',
            },
          ].map(f => (
            <div key={f.title} className="card p-5 flex gap-4 items-start">
              <span className="text-2xl">{f.icon}</span>
              <div>
                <h3 className="font-semibold text-sm text-[var(--text-primary)] mb-1">{f.title}</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className="text-center py-6 text-xs text-[var(--text-muted)] border-t" style={{ borderColor: 'var(--border)' }}>
        CorperNest · Built for Abia State corps members · {new Date().getFullYear()}
      </footer>
    </div>
  )
}