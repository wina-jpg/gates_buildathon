import type { ChatMessage, ChatResponse } from './types'

export async function sendChat(
  messages: ChatMessage[],
  currentDraft: string | null,
): Promise<ChatResponse> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      current_draft: currentDraft,
    }),
  })

  if (!response.ok) {
    let detail = 'Chat request failed. Try again.'
    try {
      const body = await response.json()
      if (typeof body.detail === 'string') {
        detail = body.detail
      } else if (Array.isArray(body.detail)) {
        detail = body.detail.map((d: { msg?: string }) => d.msg).join(', ')
      }
    } catch {
      /* use default */
    }
    throw new Error(detail)
  }

  return response.json() as Promise<ChatResponse>
}
