import { useState } from 'react'
import type { CompetitorJd } from '../types'

interface CompetitorCardProps {
  competitor: CompetitorJd
}

export function CompetitorCard({ competitor }: CompetitorCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [candidatesOpen, setCandidatesOpen] = useState(false)

  return (
    <div className="competitor-column">
      <article className={`competitor-card ${expanded ? 'competitor-card-expanded' : ''}`}>
        <p className="competitor-card-title">{competitor.title}</p>
        <p className="competitor-card-company">{competitor.company}</p>
        <p className="competitor-card-text">
          {expanded ? competitor.text : `${competitor.text.slice(0, 72)}…`}
        </p>
        <button
          type="button"
          className="competitor-expand-btn"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          {expanded ? 'Click to collapse' : 'Click to expand'}
        </button>
      </article>

      <button
        type="button"
        className="candidates-toggle"
        onClick={() => setCandidatesOpen((v) => !v)}
        aria-expanded={candidatesOpen}
      >
        <span>See potential candidates</span>
        <span className="candidates-chevron" aria-hidden>
          {candidatesOpen ? '▲' : '▼'}
        </span>
      </button>

      {candidatesOpen && (
        <div className="candidates-panel">
          <p className="candidates-panel-label">
            Synthetic resumes generated based on the JDs
          </p>
          <ul className="candidates-list">
            {competitor.potentialCandidates.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
