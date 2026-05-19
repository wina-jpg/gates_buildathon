export type AppPhase =
  | 'intro'
  | 'conversation'
  | 'summary'
  | 'generating'
  | 'results'
  | 'outlook'

export interface CompetitorJd {
  id: string
  company: string
  title: string
  text: string
  /** Demo synthetic resumes shown under "See potential candidates". */
  potentialCandidates: string[]
}

export interface HiringOutlookData {
  competitorsSubtitle: string
  candidatePool: {
    count: string
    label: string
    benchmark: string
    summary: string
  }
  stars: {
    subtitle: string
    summary: string
  }
  timeToHire: {
    range: string
    label: string
    benchmark: string
    summary: string
  }
  competitors: CompetitorJd[]
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ConversationSummary {
  yourNeeds: string
  problemSolving: string
  possibleTitle: string
}

export interface ChatResponse {
  reply: string
  job_draft: string | null
  model: string
  sources_used: string[]
  evidence_summary: string | null
}

export interface AnalysisCategory {
  id: string
  label: string
  status: 'warning' | 'ok'
  detail: string
  /** Phrase to highlight in the JD (demo); first match wins. */
  highlightPhrase?: string
}

export interface MockAnalysis {
  score: number
  maxScore: number
  categories: AnalysisCategory[]
}
