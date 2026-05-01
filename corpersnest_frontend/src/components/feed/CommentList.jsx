/**
 * components/feed/CommentList.jsx
 *
 * Displays top-level comments with nested replies (one level deep).
 * Author names are clickable — link to public profile.
 * Role badge shown next to each author.
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { feedApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { formatDate } from '@/lib/utils'
import Avatar from '@/components/ui/Avatar'
import RoleBadge from '@/components/ui/RoleBadge'
import Button from '@/components/ui/Button'

// ─── Single comment (used for both top-level and replies) ─────────────────────
function CommentItem({ comment, postId, onReplyAdded, isReply = false }) {
  const { user } = useAuth()
  const toast    = useToast()

  const [showReplyBox, setShowReplyBox] = useState(false)
  const [replyText,    setReplyText]    = useState('')
  const [submitting,   setSubmitting]   = useState(false)

  const authorId   = comment?.user?.id
  const authorName = comment?.user?.full_name || 'Corper'
  const authorRole = comment?.user?.role
  const authorPic  = comment?.user?.profile_picture_url

  const handleReply = async () => {
    if (!replyText.trim()) return
    setSubmitting(true)
    try {
      const reply = await feedApi.addReply(postId, comment.id, { content: replyText.trim() })
      onReplyAdded?.(comment.id, reply)
      setReplyText('')
      setShowReplyBox(false)
      toast.success('Reply added')
    } catch (err) {
      toast.error(err.message || 'Could not add reply')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={`flex gap-3 animate-fade-in ${isReply ? 'ml-9 mt-2' : ''}`}>
      <Avatar name={authorName} src={authorPic} size="xs" />

      <div className="flex-1 min-w-0">
        {/* Bubble */}
        <div className="rounded-xl px-3 py-2.5" style={{ background: 'var(--bg-subtle)' }}>
          {/* Author row */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Link
              to={`/users/${authorId}`}
              className="text-xs font-semibold hover:underline"
              style={{ color: 'var(--text-primary)' }}
              onClick={e => e.stopPropagation()}
            >
              {authorName}
            </Link>
            <RoleBadge role={authorRole} />
          </div>

          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {comment.content}
          </p>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 mt-1 ml-1">
          {comment.created_at && (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {formatDate(comment.created_at)}
            </span>
          )}

          {/* Reply button — only on top-level comments, only when logged in */}
          {user && !isReply && (
            <button
              onClick={() => setShowReplyBox(p => !p)}
              className="text-xs font-medium transition-colors hover:text-[var(--brand)]"
              style={{ color: 'var(--text-muted)' }}
            >
              {showReplyBox ? 'Cancel' : 'Reply'}
            </button>
          )}
        </div>

        {/* Reply input */}
        {showReplyBox && (
          <div className="flex gap-2 mt-2">
            <Avatar name={user.full_name} src={user.profile_picture_url} size="xs" />
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                placeholder={`Reply to ${authorName}…`}
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleReply()}
                className="input-base flex-1 text-sm"
                autoFocus
              />
              <Button size="sm" loading={submitting} onClick={handleReply}
                disabled={!replyText.trim()}>
                Post
              </Button>
            </div>
          </div>
        )}

        {/* Nested replies */}
        {!isReply && comment.replies?.length > 0 && (
          <div className="flex flex-col mt-1">
            {comment.replies.map((reply, i) => (
              <CommentItem
                key={reply.id ?? i}
                comment={reply}
                postId={postId}
                isReply
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


// ─── Main CommentList ─────────────────────────────────────────────────────────
export default function CommentList({ postId, comments: initial = [], onCommentAdded }) {
  const { user } = useAuth()
  const toast    = useToast()

  const [comments, setComments] = useState(initial)
  const [text,     setText]     = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async () => {
    if (!text.trim()) return
    setLoading(true)
    try {
      const comment = await feedApi.addComment(postId, { content: text.trim() })
      // New top-level comment starts with empty replies array
      setComments(prev => [...prev, { ...comment, replies: [] }])
      setText('')
      onCommentAdded?.()
      toast.success('Comment added')
    } catch (err) {
      toast.error(err.message || 'Could not add comment')
    } finally {
      setLoading(false)
    }
  }

  // Called by CommentItem when a reply is successfully posted
  const handleReplyAdded = (parentId, reply) => {
    setComments(prev =>
      prev.map(c =>
        c.id === parentId
          ? { ...c, replies: [...(c.replies || []), reply] }
          : c
      )
    )
  }

  const total = comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
        {total} Comment{total !== 1 ? 's' : ''}
      </h3>

      {comments.length === 0 && (
        <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>
          No comments yet — be the first!
        </p>
      )}

      <div className="flex flex-col gap-4">
        {comments.map((c, i) => (
          <CommentItem
            key={c.id ?? i}
            comment={c}
            postId={postId}
            onReplyAdded={handleReplyAdded}
          />
        ))}
      </div>

      {/* New comment input */}
      {user ? (
        <div className="flex gap-3 items-start pt-2 border-t"
          style={{ borderColor: 'var(--border)' }}>
          <Avatar name={user.full_name} src={user.profile_picture_url} size="xs" />
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              placeholder="Add a comment…"
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
              className="input-base flex-1 text-sm"
            />
            <Button size="sm" loading={loading} onClick={handleSubmit} disabled={!text.trim()}>
              Post
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-xs text-center pt-2" style={{ color: 'var(--text-muted)' }}>
          <Link to="/login" className="text-[var(--brand)] hover:underline">Log in</Link>
          {' '}to comment
        </p>
      )}
    </div>
  )
}