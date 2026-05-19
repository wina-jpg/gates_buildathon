/** Fractal branching lightning web — electric blue / white on dark (reference style). */
export function LightningField() {
  const branches: { d: string; delay: number; width: number; opacity: number }[] = [
    {
      d: 'M520 20 L505 95 L530 140 L498 210 L525 290 L490 380 L515 460 L480 540',
      delay: 0,
      width: 2.5,
      opacity: 1,
    },
    {
      d: 'M505 95 L470 130 L455 180 L420 220',
      delay: 0.15,
      width: 1.5,
      opacity: 0.85,
    },
    {
      d: 'M530 140 L565 175 L590 230 L620 280',
      delay: 0.3,
      width: 1.5,
      opacity: 0.8,
    },
    {
      d: 'M498 210 L460 250 L430 310 L400 370',
      delay: 0.45,
      width: 1.2,
      opacity: 0.75,
    },
    {
      d: 'M525 290 L560 320 L585 380 L610 440',
      delay: 0.2,
      width: 1.2,
      opacity: 0.7,
    },
    {
      d: 'M280 40 L310 110 L295 175 L330 240 L300 320 L340 400',
      delay: 0.5,
      width: 2,
      opacity: 0.9,
    },
    {
      d: 'M310 110 L270 150 L250 200',
      delay: 0.6,
      width: 1.2,
      opacity: 0.65,
    },
    {
      d: 'M330 240 L370 270 L395 330',
      delay: 0.35,
      width: 1.2,
      opacity: 0.7,
    },
    {
      d: 'M720 60 L690 130 L710 195 L675 260 L700 340 L665 420',
      delay: 0.25,
      width: 2,
      opacity: 0.95,
    },
    {
      d: 'M690 130 L730 165 L755 220',
      delay: 0.4,
      width: 1.3,
      opacity: 0.75,
    },
    {
      d: 'M675 260 L640 300 L615 360 L590 410',
      delay: 0.55,
      width: 1.2,
      opacity: 0.7,
    },
    {
      d: 'M150 180 L180 240 L165 310 L200 380 L175 450',
      delay: 0.7,
      width: 1.8,
      opacity: 0.85,
    },
    {
      d: 'M180 240 L140 280 L120 340',
      delay: 0.8,
      width: 1,
      opacity: 0.6,
    },
    {
      d: 'M850 200 L820 270 L845 340 L810 410 L835 490',
      delay: 0.1,
      width: 2.2,
      opacity: 0.9,
    },
    {
      d: 'M820 270 L860 310 L880 370',
      delay: 0.35,
      width: 1.2,
      opacity: 0.7,
    },
    {
      d: 'M400 100 L430 160 L415 220 L450 280 L420 350',
      delay: 0.65,
      width: 1.6,
      opacity: 0.8,
    },
    {
      d: 'M430 160 L390 190 L365 240',
      delay: 0.75,
      width: 1,
      opacity: 0.55,
    },
    {
      d: 'M600 80 L630 150 L615 210 L650 270',
      delay: 0.2,
      width: 1.5,
      opacity: 0.75,
    },
    {
      d: 'M250 420 L290 480 L270 550 L310 620',
      delay: 0.9,
      width: 1.8,
      opacity: 0.8,
    },
    {
      d: 'M750 480 L720 540 L745 600 L710 680',
      delay: 0.5,
      width: 1.6,
      opacity: 0.75,
    },
    {
      d: 'M500 500 L480 560 L510 620 L490 700',
      delay: 0.4,
      width: 2,
      opacity: 0.85,
    },
    {
      d: 'M480 560 L440 590 L420 640',
      delay: 0.55,
      width: 1.1,
      opacity: 0.6,
    },
    {
      d: 'M510 620 L550 650 L575 710',
      delay: 0.65,
      width: 1.1,
      opacity: 0.6,
    },
    {
      d: 'M100 350 L130 410 L115 470 L150 530',
      delay: 0.85,
      width: 1.4,
      opacity: 0.7,
    },
    {
      d: 'M900 350 L870 410 L890 480 L855 550',
      delay: 0.15,
      width: 1.5,
      opacity: 0.8,
    },
  ]

  return (
    <svg
      className="lightning-field"
      viewBox="0 0 1000 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <filter id="lightning-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="bolt-core" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="50%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
      <g filter="url(#lightning-glow)" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {branches.map((b, i) => (
          <g key={i}>
            <path
              className="lightning-branch lightning-branch-glow"
              d={b.d}
              stroke="url(#bolt-core)"
              strokeWidth={b.width + 4}
              strokeOpacity={0.25}
              style={{ animationDelay: `${b.delay}s` }}
            />
            <path
              className="lightning-branch"
              d={b.d}
              stroke="url(#bolt-core)"
              strokeWidth={b.width}
              strokeOpacity={b.opacity}
              style={{ animationDelay: `${b.delay}s` }}
            />
            <path
              className="lightning-branch lightning-branch-core"
              d={b.d}
              stroke="#f0f9ff"
              strokeWidth={b.width * 0.35}
              strokeOpacity={0.9}
              style={{ animationDelay: `${b.delay}s` }}
            />
          </g>
        ))}
      </g>
    </svg>
  )
}
