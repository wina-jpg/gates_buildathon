import { useMemo } from 'react'
import type { AnalysisCategory } from '../types'

interface JobDraftViewerProps {
  jobDraft: string
  categories: AnalysisCategory[]
  activeCategoryId: string | null
  onHighlightSelect: (categoryId: string) => void
}

interface Segment {
  text: string
  categoryId?: string
}

function buildSegments(
  text: string,
  categories: AnalysisCategory[],
): Segment[] {
  const rules = categories
    .filter((c) => c.highlightPhrase)
    .map((c) => ({
      categoryId: c.id,
      phrase: c.highlightPhrase!,
      index: text.toLowerCase().indexOf(c.highlightPhrase!.toLowerCase()),
    }))
    .filter((r) => r.index >= 0)
    .sort((a, b) => a.index - b.index)

  if (rules.length === 0) {
    return [{ text }]
  }

  const segments: Segment[] = []
  let cursor = 0

  for (const rule of rules) {
    if (rule.index < cursor) continue
    if (rule.index > cursor) {
      segments.push({ text: text.slice(cursor, rule.index) })
    }
    const matched = text.slice(rule.index, rule.index + rule.phrase.length)
    segments.push({ text: matched, categoryId: rule.categoryId })
    cursor = rule.index + rule.phrase.length
  }

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor) })
  }

  return segments.length > 0 ? segments : [{ text }]
}

export function JobDraftViewer({
  jobDraft,
  categories,
  activeCategoryId,
  onHighlightSelect,
}: JobDraftViewerProps) {
  const segments = useMemo(
    () => buildSegments(jobDraft, categories),
    [jobDraft, categories],
  )

  return (
    <div className="job-draft job-draft-interactive">
      {segments.map((seg, i) =>
        seg.categoryId ? (
          <button
            key={`${seg.categoryId}-${i}`}
            type="button"
            className={`jd-highlight ${activeCategoryId === seg.categoryId ? 'jd-highlight-active' : ''}`}
            onClick={() => onHighlightSelect(seg.categoryId!)}
            aria-pressed={activeCategoryId === seg.categoryId}
            title="View related criteria"
          >
            {seg.text}
          </button>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </div>
  )
}
