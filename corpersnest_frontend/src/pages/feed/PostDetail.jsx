import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { feedApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { formatDate } from '@/lib/utils'
import PageWrapper from '@/components/layout/PageWrapper'
import Avatar from '@/components/ui/Avatar'
import CommentList from '@/components/feed/CommentList'
import Spinner from '@/components/ui/Spinner'
import Button from '@/components/ui/Button'

const TAG_LABELS = {
  question: 'Question', tip: 'Tip', room_available: 'Room available',
  scam_warning: 'Scam warning', general: 'General',
}

export default function PostDetail() {
  const { postId } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [liking, setLiking] = useState(false)
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    feedApi.getOne(postId)
      .then(setPost)
      .catch(() => toast.error('Post not found'))
      .finally(() => setLoading(false))
  }, [postId])

  const handleLike = async () => {
    if (!user) { toast.info('Log in to like posts'); return }
    if (liking) return
    setLiking(true)
    try {
      await feedApi.toggleLike(postId)
      setPost(prev => ({
        ...prev,
        likes_count: (prev.likes_count ?? 0) + (prev.liked_by_me ? -1 : 1),
        liked_by_me: !prev.liked_by_me,
      }))
    } catch { toast.error('Could not like post') }
    finally { setLiking(false) }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return
    try {
      await feedApi.delete(postId)
      toast.success('Post deleted')
      navigate('/feed')
    } catch (err) { toast.error(err.message) }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>
  )
  if (!post) return (
    <PageWrapper><div className="text-center py-20 text-[var(--text-muted)]">Post not found.</div></PageWrapper>
  )

  const isOwner = user && post.user?.id === user.id

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto">
        <Link
          to="/feed"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-5 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 3L5 7l4 4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to feed
        </Link>

        {/* Post body */}
        <div className="card p-5 mb-4">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <Avatar name={post.user?.full_name} size="md" />
              <div>
                <p className="font-semibold text-sm text-[var(--text-primary)]">{post.user?.full_name}</p>
                <p className="text-xs text-[var(--text-muted)] capitalize">
                  {post.user?.role?.replace(/_/g, ' ')} · {formatDate(post.created_at)}
                </p>
              </div>
            </div>
            <span className={`tag tag-${post.tag} shrink-0`}>
              {TAG_LABELS[post.tag] || post.tag}
            </span>
          </div>

          <p className="text-[var(--text-secondary)] leading-relaxed mb-4">{post.content}</p>

          {post.image_url && (
            <img
              src={post.image_url}
              alt="Post"
              className="w-full rounded-xl object-cover max-h-80 mb-4"
              onError={e => e.target.style.display = 'none'}
            />
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <button
              onClick={handleLike}
              disabled={liking}
              className={`flex items-center gap-1.5 text-sm transition-colors group
                ${post.liked_by_me ? 'text-red-500' : 'text-[var(--text-muted)] hover:text-red-500'}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24"
                fill={post.liked_by_me ? 'currentColor' : 'none'}
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                className="group-hover:scale-110 transition-transform">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
              </svg>
              {post.likes_count ?? 0} like{post.likes_count !== 1 ? 's' : ''}
            </button>

            {isOwner && (
              <button
                onClick={handleDelete}
                className="ml-auto text-sm text-[var(--text-muted)] hover:text-red-500 transition-colors flex items-center gap-1.5"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"/>
                </svg>
                Delete post
              </button>
            )}
          </div>
        </div>

        {/* Comments */}
        <div className="card p-5">
          <CommentList
            postId={post.id}
            comments={post.comments || []}
            onCommentAdded={() =>
              setPost(prev => ({ ...prev, comments_count: (prev.comments_count ?? 0) + 1 }))
            }
          />
        </div>
      </div>
    </PageWrapper>
  )
}