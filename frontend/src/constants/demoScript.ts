/** Scripted JobShock replies for the hackathon demo flow. */

export const DEMO_STEPS = [
  'Understand your hiring needs',
  'Summarize what we heard for your approval',
  'Generate a compliant job description draft',
] as const

export const DEMO_QUESTIONS = [
  'Q1: What role or title are you hiring for?',
  'Q2: What team or project should this role support?',
  'Q3: What are the must-have skills or experience?',
] as const

export function buildFirstTurnReply(): string {
  const steps = DEMO_STEPS.map((s, i) => `${i + 1}. ${s}`).join('\n')
  const questions = DEMO_QUESTIONS.join('\n')
  return `I can help with that! We'll go through these steps to create a mock-up for your review:\n\n${steps}\n\nTo get started:\n${questions}`
}

export function buildSummaryTurnReply(): string {
  return "Here's what I'm hearing from our conversation so far. Does this look right? If not, let me know what changes to make."
}

export const SUMMARY_SCREEN_PROMPT =
  "Here's what I'm hearing from our conversation so far. Does this look right? If not, let me know what changes to make."
