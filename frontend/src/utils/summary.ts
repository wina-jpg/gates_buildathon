import type { ChatMessage, ConversationSummary } from '../types'

const TITLE_PATTERNS = [
  /senior\s+(\w+\s+)?engineer/i,
  /(\w+\s+)?manager/i,
  /(\w+\s+)?designer/i,
  /platform\s+engineer/i,
  /software\s+engineer/i,
]

export function buildConversationSummary(
  messages: ChatMessage[],
): ConversationSummary {
  const userMessages = messages
    .filter((m) => m.role === 'user')
    .map((m) => m.content.trim())
    .filter(Boolean)

  const yourNeeds =
    userMessages.slice(-2).join(' ') ||
    'Describe the role you need to fill.'

  let possibleTitle = 'Role TBD'
  const combined = userMessages.join(' ')
  for (const pattern of TITLE_PATTERNS) {
    const match = combined.match(pattern)
    if (match) {
      possibleTitle = match[0].replace(/\b\w/g, (c) => c.toUpperCase())
      break
    }
  }

  return {
    yourNeeds: yourNeeds.slice(0, 500),
    problemSolving:
      'Hire for platform capacity aligned to internal projects and competitor benchmarks.',
    possibleTitle,
  }
}
