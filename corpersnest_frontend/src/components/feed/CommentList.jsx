import { useState } from 'react'
import { feedApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { formatDate } from '@/lib/utils'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'

export default function CommentList({ postId, comments: initial = [], onCommentAdded }) {
  const { user } = useAuth()
  const toast = useToast()
  const [comments, setComments] = useState(initial)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!text.trim()) return
    setLoading(true)
    try {
      const comment = await feedApi.addComment(postId, { content: text.trim() })
      setComments(prev => [...prev, comment])
      setText('')
      onCommentAdded?.()
      toast.success('Comment added')
    } catch (err) {
      toast.error(err.message || 'Could not add comment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold text-[var(--text-primary)]">
        {comments.length} Comment{comments.length !== 1 ? 's' : ''}
      </h3>

      {/* Comment list */}
      {comments.length === 0 && (
        <p className="text-sm text-[var(--text-muted)] text-center py-6">
          No comments yet — be the first!
        </p>
      )}
      <div className="flex flex-col gap-3">
        {comments.map(c => (
          <div key={c.id} className="flex gap-3 animate-fade-in">
            <Avatar name={c.user?.full_name} size="xs" />
            <div className="flex-1">
              <div className="rounded-xl px-3 py-2.5" style={{ background: 'var(--bg-subtle)' }}>
                <p className="text-xs font-semibold text-[var(--text-primary)] mb-0.5">{c.user?.full_name}</p>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{c.content}</p>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-1 ml-1">{formatDate(c.created_at)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Add comment */}
      {user && (
        <div className="flex gap-3 items-start pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
          <Avatar name={user.full_name} size="xs" />
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
      )}
      {!user && (
        <p className="text-xs text-[var(--text-muted)] text-center pt-2">
          <a href="/login" className="text-[var(--brand)] hover:underline">Log in</a> to comment
        </p>
      )}
    </div>
  )
}