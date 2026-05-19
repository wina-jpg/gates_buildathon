interface LightningBoltProps {
  className?: string
}

export function LightningBolt({ className = '' }: LightningBoltProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M38 4L14 52h18l-8 40 32-56H38l6-32z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  )
}
