import { useState } from 'react'
import { Link } from 'react-router-dom'
import { feedApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { formatDate } from '@/lib/utils'
import Avatar from '@/components/ui/Avatar'

const TAG_LABELS = {
  question: 'Question',
  tip: 'Tip',
  room_available: 'Room available',
  scam_warning: 'Scam warning',
  general: 'General',
}

export default function PostCard({ post, onDelete, onLikeToggle }) {
  const { user } = useAuth()
  const toast = useToast()
  const [liking, setLiking] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const isOwner = user && post.user?.id === user.id

  const handleLike = async (e) => {
    e.preventDefault()
    if (!user) { toast.info('Log in to like posts'); return }
    if (liking) return
    setLiking(true)
    try {
      await feedApi.toggleLike(post.id)
      onLikeToggle?.(post.id)
    } catch {
      toast.error('Could not like post')
    } finally {
      setLiking(false)
    }
  }

  const handleDelete = async (e) => {
    e.preventDefault()
    if (!confirm('Delete this post?')) return
    setDeleting(true)
    try {
      await feedApi.delete(post.id)
      onDelete?.(post.id)
      toast.success('Post deleted')
    } catch (err) {
      toast.error(err.message)
      setDeleting(false)
    }
  }

  return (
    <article className="card p-4 hover:shadow-[var(--shadow-card-hover)] transition-all duration-200 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <Avatar name={post.user?.full_name} size="sm" />
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)] leading-none mb-0.5">
              {post.user?.full_name}
            </p>
            <p className="text-xs text-[var(--text-muted)] capitalize">
              {post.user?.role?.replace(/_/g, ' ')} · {formatDate(post.created_at)}
            </p>
          </div>
        </div>
        <span className={`tag tag-${post.tag} shrink-0`}>
          {TAG_LABELS[post.tag] || post.tag}
        </span>
      </div>

      {/* Body */}
      <Link to={`/feed/${post.id}`}>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3 hover:text-[var(--text-primary)] transition-colors">
          {post.content}
        </p>
        {post.image_url && (
          <img
            src={post.image_url}
            alt="Post image"
            className="w-full rounded-xl object-cover max-h-64 mb-3"
            onError={e => e.target.style.display = 'none'}
          />
        )}
      </Link>

      {/* Footer actions */}
      <div className="flex items-center gap-4 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={handleLike}
          disabled={liking}
          className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-red-500 transition-colors group"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
            className="group-hover:scale-110 transition-transform">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
          {post.likes_count ?? 0}
        </button>

        <Link
          to={`/feed/${post.id}`}
          className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--brand)] transition-colors"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          {post.comments_count ?? 0} comment{post.comments_count !== 1 ? 's' : ''}
        </Link>

        {isOwner && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="ml-auto text-xs text-[var(--text-muted)] hover:text-red-500 transition-colors flex items-center gap-1"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/>
            </svg>
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        )}
      </div>
    </article>
  )
}