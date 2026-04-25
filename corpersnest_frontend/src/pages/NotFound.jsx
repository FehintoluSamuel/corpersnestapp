import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="text-6xl font-semibold text-[var(--brand)] mb-3">404</div>
      <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Page not found</h1>
      <p className="text-sm text-[var(--text-muted)] mb-6">This room doesn't exist — maybe it's already been taken.</p>
      <Link to="/listings" className="btn-primary px-6 py-2.5 text-sm">
        Back to listings
      </Link>
    </div>
  )
}