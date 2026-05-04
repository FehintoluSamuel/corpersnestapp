/**
 * components/feed/PostCard.jsx
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { feedApi, bookmarksApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { formatDate } from '@/lib/utils'
import Avatar from '@/components/ui/Avatar'
import RoleBadge from '@/components/ui/RoleBadge'

const TAG_LABELS = {
  question: 'Question', tip: 'Tip', room_available: 'Room available',
  roommate_needed: 'Roommate needed', scam_warning: 'Scam warning', general: 'General',
}

export default function PostCard({ post, onDelete, onLikeToggle }) {
  const { user } = useAuth()
  const toast    = useToast()

  const [liking,      setLiking]      = useState(false)
  const [deleting,    setDeleting]    = useState(false)
  const [bookmarked,  setBookmarked]  = useState(post.bookmarked_by_me ?? false)
  const [bookmarking, setBookmarking] = useState(false)

  const isOwner = user && post.user?.id === user.id

  const handleLike = async (e) => {
    e.preventDefault()
    if (!user) { toast.info('Log in to like posts'); return }
    if (liking) return
    setLiking(true)
    try { await onLikeToggle?.(post.id) }
    finally { setLiking(false) }
  }

  const handleBookmark = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { toast.info('Log in to bookmark posts'); return }
    if (bookmarking) return
    setBookmarking(true)
    const prev = bookmarked
    setBookmarked(!prev) // optimistic
    try {
      const res = await bookmarksApi.toggle({ post_id: post.id })
      setBookmarked(res.bookmarked)
    } catch (err) {
      setBookmarked(prev) // revert on error
      toast.error(err.message)
    } finally {
      setBookmarking(false)
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
        <Link to={`/users/${post.user?.id}`}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          onClick={e => e.stopPropagation()}>
          <Avatar name={post.user?.full_name} src={post.user?.profile_picture_url} size="sm" />
          <div>
            <p className="text-sm font-semibold leading-none mb-1" style={{ color: 'var(--text-primary)' }}>
              {post.user?.full_name}
            </p>
            <div className="flex items-center gap-1.5">
              <RoleBadge role={post.user?.role} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>· {formatDate(post.created_at)}</span>
            </div>
          </div>
        </Link>
        <span className={`tag tag-${post.tag} shrink-0`}>{TAG_LABELS[post.tag] || post.tag}</span>
      </div>

      {/* Body */}
      <Link to={`/feed/${post.id}`}>
        <p className="text-sm leading-relaxed mb-3 hover:text-[var(--text-primary)] transition-colors"
          style={{ color: 'var(--text-secondary)' }}>
          {post.content}
        </p>
        {post.image_url && (
          <img src={post.image_url} alt="Post attachment"
            className="w-full rounded-xl object-cover max-h-64 mb-3"
            onError={e => e.target.style.display = 'none'} />
        )}
      </Link>

      {/* Footer */}
      <div className="flex items-center gap-3 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>

        {/* Like */}
        <button onClick={handleLike} disabled={liking}
          className="flex items-center gap-1.5 text-xs transition-colors group"
          style={{ color: post.liked_by_me ? '#EF4444' : 'var(--text-muted)' }}
          aria-label={post.liked_by_me ? 'Unlike' : 'Like'}>
          <svg width="15" height="15" viewBox="0 0 24 24"
            fill={post.liked_by_me ? 'currentColor' : 'none'}
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
            className="group-hover:scale-110 transition-transform">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
          {post.likes_count ?? 0}
        </button>

        {/* Comments */}
        <Link to={`/feed/${post.id}`}
          className="flex items-center gap-1.5 text-xs transition-colors hover:text-[var(--brand)]"
          style={{ color: 'var(--text-muted)' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          {post.comments_count ?? 0} comment{post.comments_count !== 1 ? 's' : ''}
        </Link>

        {/* Bookmark */}
        {user && (
          <button onClick={handleBookmark} disabled={bookmarking}
            className="flex items-center gap-1.5 text-xs transition-colors group"
            style={{ color: bookmarked ? 'var(--brand)' : 'var(--text-muted)' }}
            aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark post'}>
            <svg width="14" height="14" viewBox="0 0 24 24"
              fill={bookmarked ? 'currentColor' : 'none'}
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
              className="group-hover:scale-110 transition-transform">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
            </svg>
          </button>
        )}

        {/* Delete — owner only */}
        {isOwner && (
          <button onClick={handleDelete} disabled={deleting}
            className="ml-auto text-xs flex items-center gap-1 transition-colors hover:text-red-500"
            style={{ color: 'var(--text-muted)' }} aria-label="Delete post">
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