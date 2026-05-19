import type { MockAnalysis } from '../types'

export const MOCK_ANALYSIS: MockAnalysis = {
  score: 52,
  maxScore: 100,
  categories: [
    {
      id: 'future-ready',
      label: 'Future-ready',
      status: 'warning',
      detail:
        'Requirements should consider how the workforce will evolve — e.g. flag skills with high automation potential and prefer adaptable language over rigid years-only bars.',
      highlightPhrase: '5+ years',
    },
    {
      id: 'team-optimized',
      label: 'Team optimized',
      status: 'ok',
      detail:
        'Reflects your team today: current skills, gaps, and where you need more capacity — aligned with platform team structure and Project Atlas.',
      highlightPhrase: 'platform team',
    },
    {
      id: 'requirements',
      label: 'Requirements',
      status: 'ok',
      detail:
        'Clarity about requirements matters. Poor example: “familiarity with vibecoding.” Requirements should match real job needs and be verifiable.',
      highlightPhrase: 'Requirements',
    },
    {
      id: 'equal-opportunity',
      label: 'Equal Opportunity',
      status: 'ok',
      detail:
        'Full postings should include Acme Data Labs’ standard equal opportunity employer language from company policy. Be specific about experience, list verifiable skills, and avoid biased or age-coded terms.',
      highlightPhrase: 'equivalent experience',
    },
  ],
}
