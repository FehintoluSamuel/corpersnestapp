import { useState, useEffect } from 'react'
import { feedApi } from '@/lib/api'
import { useToast } from '@/context/ToastContext'
import PostCard from '@/components/feed/PostCard'
import PostForm from '@/components/feed/PostForm'
import PageWrapper from '@/components/layout/PageWrapper'
import EmptyState from '@/components/ui/EmptyState'
import SkeletonCard from '@/components/ui/SkeletonCard'

const TAGS = ['all', 'question', 'tip', 'room_available', 'roommate_needed', 'scam_warning', 'general']

const TAG_LABELS = {
  all: 'All',
  question: 'Questions',
  tip: 'Tips',
  room_available: 'Rooms',
  roommate_needed: 'Roommates',
  scam_warning: 'Scam alerts',
  general: 'General',
}

export default function FeedPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTag, setActiveTag] = useState('all')
  const toast = useToast()

  useEffect(() => {
    feedApi.getAll()
      .then(setPosts)
      .catch(() => toast.error('Could not load feed'))
      .finally(() => setLoading(false))
  }, [])

  const handleCreated = (post) => setPosts(prev => [post, ...prev])
  const handleDelete = (id) => setPosts(prev => prev.filter(p => p.id !== id))
  const handleLikeToggle = async (id) => {
  try {
    const updatedPost = await feedApi.toggleLike(id)
    setPosts(prev => prev.map(p =>
      p.id === id ? { ...p, likes_count: updatedPost.likes_count } : p
    ))
  } catch {
    toast.error('Could not like post')
  }
}

  const filtered = activeTag === 'all' ? posts : posts.filter(p => p.tag === activeTag)

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Community Feed</h1>
          <span className="text-sm text-[var(--text-muted)]">{posts.length} post{posts.length !== 1 ? 's' : ''}</span>
        </div>

        <PostForm onCreated={handleCreated} />

        {/* Tag filter pills */}
        <div className="flex gap-2 flex-wrap mb-4 overflow-x-auto pb-1">
          {TAGS.map(t => (
            <button
              key={t}
              onClick={() => setActiveTag(t)}
              className={`tag cursor-pointer transition-all whitespace-nowrap
                ${t === 'all'
                  ? activeTag === 'all'
                    ? 'bg-[var(--brand)] text-white'
                    : 'bg-[var(--bg-subtle)] text-[var(--text-muted)]'
                  : `tag-${t} ${activeTag === t ? 'ring-2 ring-[var(--brand)] ring-offset-1' : 'opacity-60 hover:opacity-100'}`
                }`}
            >
              {TAG_LABELS[t]}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex flex-col gap-3">
            {[1,2,3].map(i => <SkeletonCard key={i} lines={3} />)}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <EmptyState
            icon={
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
            }
            title={activeTag === 'all' ? 'No posts yet' : `No ${TAG_LABELS[activeTag]} posts yet`}
            description="Be the first to share something with the community."
          />
        )}

        {!loading && filtered.length > 0 && (
          <div className="flex flex-col gap-3">
            {filtered.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={handleDelete}
                onLikeToggle={handleLikeToggle}
              />
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}