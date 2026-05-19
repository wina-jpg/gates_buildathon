import { useState } from 'react'
import { AnalysisSidebar } from '../components/AnalysisSidebar'
import { JobDraftViewer } from '../components/JobDraftViewer'
import { MOCK_ANALYSIS } from '../data/mockAnalysis'

interface ResultsScreenProps {
  jobDraft: string | null
  evidenceSummary: string | null
  onCopy: () => void
  copied: boolean
}

export function ResultsScreen({
  jobDraft,
  evidenceSummary,
  onCopy,
  copied,
}: ResultsScreenProps) {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)

  return (
    <div className="screen results-screen">
      <div className="results-main">
        <div className="results-header">
          <h1 className="results-title">Job Description v0</h1>
          <button type="button" className="btn-copy" onClick={onCopy} disabled={!jobDraft}>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <p className="results-hint">
          Click highlighted text to see the related scoring criteria.
        </p>
        {evidenceSummary && (
          <div className="evidence-strip">
            <strong>Evidence</strong>
            <p>{evidenceSummary}</p>
          </div>
        )}
        {jobDraft ? (
          <JobDraftViewer
            jobDraft={jobDraft}
            categories={MOCK_ANALYSIS.categories}
            activeCategoryId={activeCategoryId}
            onHighlightSelect={setActiveCategoryId}
          />
        ) : (
          <pre className="job-draft">No draft yet.</pre>
        )}
      </div>
      <AnalysisSidebar
        analysis={MOCK_ANALYSIS}
        activeCategoryId={activeCategoryId}
        onCategorySelect={setActiveCategoryId}
      />
    </div>
  )
}
