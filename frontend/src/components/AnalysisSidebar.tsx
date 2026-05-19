import { useEffect, useState } from 'react'
import type { MockAnalysis } from '../types'

interface AnalysisSidebarProps {
  analysis: MockAnalysis
  activeCategoryId: string | null
  onCategorySelect: (categoryId: string | null) => void
}

export function AnalysisSidebar({
  analysis,
  activeCategoryId,
  onCategorySelect,
}: AnalysisSidebarProps) {
  const [openId, setOpenId] = useState<string | null>(null)
  const pct = Math.round((analysis.score / analysis.maxScore) * 100)

  useEffect(() => {
    if (activeCategoryId) {
      setOpenId(activeCategoryId)
    }
  }, [activeCategoryId])

  const handleRowClick = (catId: string) => {
    const willOpen = openId !== catId
    setOpenId(willOpen ? catId : null)
    onCategorySelect(willOpen ? catId : null)
  }

  return (
    <aside className="analysis-sidebar">
      <p className="sidebar-section-label">Summary</p>
      <p className="sidebar-score">
        {analysis.score}/{analysis.maxScore}
      </p>
      <div
        className="score-bar"
        role="progressbar"
        aria-valuenow={analysis.score}
        aria-valuemin={0}
        aria-valuemax={analysis.maxScore}
      >
        <div className="score-bar-fill" style={{ width: `${pct}%` }} />
      </div>

      <ul className="category-list">
        {analysis.categories.map((cat) => {
          const isOpen = openId === cat.id
          const isActive = activeCategoryId === cat.id
          return (
            <li
              key={cat.id}
              className={`category-item ${isActive ? 'category-item-active' : ''}`}
            >
              <button
                type="button"
                className={`category-row ${cat.status === 'warning' ? 'warning' : ''} ${isActive ? 'category-row-active' : ''}`}
                onClick={() => handleRowClick(cat.id)}
                aria-expanded={isOpen}
              >
                <span className="category-label">
                  {cat.status === 'warning' && (
                    <span className="warning-icon" aria-hidden>
                      !
                    </span>
                  )}
                  {cat.label}
                </span>
                <span className="category-chevron">{isOpen ? '▲' : '▼'}</span>
              </button>
              {isOpen && <p className="category-detail">{cat.detail}</p>}
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
