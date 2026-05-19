import { useState } from 'react'
import { AnalysisSidebar } from '../components/AnalysisSidebar'
import { CompetitorCard } from '../components/CompetitorCard'
import { MOCK_ANALYSIS } from '../data/mockAnalysis'
import { MOCK_OUTLOOK } from '../data/mockOutlook'

interface HiringOutlookScreenProps {
  onBack: () => void
}

export function HiringOutlookScreen({ onBack }: HiringOutlookScreenProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)
  const { candidatePool, stars, timeToHire, competitorsSubtitle, competitors } =
    MOCK_OUTLOOK

  return (
    <div className="screen outlook-screen">
      <div className="outlook-main">
        <div className="outlook-header-row">
          <div className="outlook-header-text">
            <h1 className="outlook-title">Your hiring outlook</h1>
            <p className="outlook-subtitle">
              Using real-time labor data, this dashboard estimates your hiring outlook
              based on this Job Description
            </p>
          </div>
          <button type="button" className="btn-flip-jd" onClick={onBack}>
            Flip to Job Description
          </button>
        </div>

        <div className="outlook-metrics">
          <article className="metric-card">
            <p className="metric-headline">
              <span className="metric-count metric-count-green">
                {candidatePool.count}
              </span>{' '}
              {candidatePool.label}
            </p>
            <p className="metric-benchmark">
              A healthy candidate pool has at least {candidatePool.benchmark}
            </p>
            <div className="metric-summary-box">{candidatePool.summary}</div>
          </article>

          <article className="metric-card">
            <p className="metric-headline metric-headline-stars">
              <span className="stars-accent">STARs</span>-relevant
            </p>
            <p className="metric-benchmark">{stars.subtitle}</p>
            <div className="metric-summary-box">{stars.summary}</div>
          </article>

          <article className="metric-card">
            <p className="metric-headline">
              <span className="metric-count metric-count-time">
                {timeToHire.range}
              </span>
            </p>
            <p className="metric-label-secondary">{timeToHire.label}</p>
            <p className="metric-benchmark">{timeToHire.benchmark}</p>
            <div className="metric-summary-box">{timeToHire.summary}</div>
          </article>
        </div>

        <section className="competitors-section">
          <h2 className="competitors-heading">Your Competitors&apos; JDs</h2>
          <p className="competitors-subtitle">{competitorsSubtitle}</p>
          <div className="competitor-grid">
            {competitors.map((c) => (
              <CompetitorCard key={c.id} competitor={c} />
            ))}
          </div>
        </section>
      </div>

      <AnalysisSidebar
        analysis={MOCK_ANALYSIS}
        activeCategoryId={activeCategoryId}
        onCategorySelect={setActiveCategoryId}
      />
    </div>
  )
}
