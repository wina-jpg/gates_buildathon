import { SUMMARY_SCREEN_PROMPT } from '../constants/demoScript'
import type { ConversationSummary } from '../types'

interface SummaryScreenProps {
  summary: ConversationSummary
  onConfirm: () => void
  confirming: boolean
}

export function SummaryScreen({
  summary,
  onConfirm,
  confirming,
}: SummaryScreenProps) {
  return (
    <div className="screen summary-screen">
      <h2 className="summary-heading">Summary</h2>
      <div className="summary-card">
        <div className="summary-field">
          <span className="summary-label">Your needs</span>
          <p>{summary.yourNeeds}</p>
        </div>
        <div className="summary-field">
          <span className="summary-label">Problem we&apos;re solving</span>
          <p>{summary.problemSolving}</p>
        </div>
        <div className="summary-field">
          <span className="summary-label">Possible title</span>
          <p>{summary.possibleTitle}</p>
        </div>
      </div>
      <p className="summary-prompt">{SUMMARY_SCREEN_PROMPT}</p>
      <button
        type="button"
        className="btn-confirm"
        onClick={onConfirm}
        disabled={confirming}
      >
        Confirm
      </button>
    </div>
  )
}
