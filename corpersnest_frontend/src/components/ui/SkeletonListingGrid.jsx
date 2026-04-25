export default function SkeletonListingGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card overflow-hidden animate-pulse">
          <div className="h-40 bg-[var(--bg-subtle)]" />
          <div className="p-4 flex flex-col gap-3">
            <div className="h-3.5 rounded-full bg-[var(--bg-subtle)] w-3/4" />
            <div className="h-3 rounded-full bg-[var(--bg-subtle)] w-1/2" />
            <div className="flex justify-between items-center mt-1">
              <div className="h-5 rounded-full bg-[var(--bg-subtle)] w-24" />
              <div className="h-3 rounded-full bg-[var(--bg-subtle)] w-16" />
            </div>
            <div className="flex items-center gap-2 pt-2 mt-1 border-t" style={{ borderColor: 'var(--border)' }}>
              <div className="w-7 h-7 rounded-full bg-[var(--bg-subtle)]" />
              <div className="h-2.5 rounded-full bg-[var(--bg-subtle)] w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}