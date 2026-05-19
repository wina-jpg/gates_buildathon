import type { ChatMessage } from '../types'

interface ConversationScreenProps {
  messages: ChatMessage[]
  loading: boolean
  error: string
}

export function ConversationScreen({
  messages,
  loading,
  error,
}: ConversationScreenProps) {
  return (
    <div className="screen conversation-screen">
      <div className="thread">
        {messages.length === 0 && !loading && (
          <p className="thread-empty">Start by describing the role you need.</p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`bubble ${msg.role === 'user' ? 'bubble-user' : 'bubble-assistant'}`}
          >
            <span className="bubble-role">
              {msg.role === 'user' ? 'You' : 'JobShock'}
            </span>
            <p className="bubble-body">{msg.content}</p>
          </div>
        ))}
        {loading && <p className="thread-loading">JobShock is thinking…</p>}
      </div>
      {error && <p className="error-banner">{error}</p>}
    </div>
  )
}
