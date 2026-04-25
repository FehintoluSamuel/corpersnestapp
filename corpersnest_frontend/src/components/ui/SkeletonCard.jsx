export default function SkeletonCard({ lines = 2, showAvatar = true, showImage = false }) {
  return (
    <div className="card p-4 animate-pulse">
      {showImage && (
        <div className="h-40 rounded-xl bg-[var(--bg-subtle)] mb-4" />
      )}
      {showAvatar && (
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-[var(--bg-subtle)] shrink-0" />
          <div className="flex-1 flex flex-col gap-1.5">
            <div className="h-3 rounded-full bg-[var(--bg-subtle)] w-32" />
            <div className="h-2.5 rounded-full bg-[var(--bg-subtle)] w-20" />
          </div>
          <div className="h-5 w-20 rounded-full bg-[var(--bg-subtle)]" />
        </div>
      )}
      <div className="flex flex-col gap-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-3 rounded-full bg-[var(--bg-subtle)]"
            style={{ width: i === lines - 1 ? '60%' : '100%' }}
          />
        ))}
      </div>
    </div>
  )
}