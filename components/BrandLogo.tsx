import Link from 'next/link'
import Image from 'next/image'

const SIZES = {
  sm: { icon: 28, text: 'text-xl' },
  md: { icon: 32, text: 'text-2xl sm:text-3xl' },
  lg: { icon: 56, text: 'text-4xl' },
} as const

type BrandLogoProps = {
  href?: string
  size?: keyof typeof SIZES
  className?: string
}

export default function BrandLogo({ href, size = 'md', className = '' }: BrandLogoProps) {
  const { icon, text } = SIZES[size]
  const mark = (
    <span className={`inline-flex items-center gap-2 min-w-0 ${className}`}>
      <Image
        src="/brand/prospecta-fb-1-p.png"
        alt="Prospecta"
        width={icon}
        height={icon}
        className="rounded-lg shrink-0"
        priority
      />
      <span className={`${text} font-bold text-black truncate`}>Prospecta</span>
    </span>
  )

  if (!href) return mark

  return (
    <Link href={href} className="inline-flex items-center min-w-0">
      {mark}
    </Link>
  )
}
