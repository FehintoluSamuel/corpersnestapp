import { getInitials } from '@/lib/utils'

const sizeMap = {
  xs: 'w-7 h-7 text-xs',
  sm: 'w-9 h-9 text-sm',
  md: 'w-11 h-11 text-base',
  lg: 'w-14 h-14 text-lg',
}

export default function Avatar({ name = '', src, size = 'sm', className = '' }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`rounded-full object-cover shrink-0 ${sizeMap[size]} ${className}`}
      />
    )
  }

  return (
    <div
      className={`rounded-full shrink-0 flex items-center justify-center font-semibold
        bg-[var(--brand-light)] text-[var(--brand)] ${sizeMap[size]} ${className}`}
    >
      {getInitials(name)}
    </div>
  )
}