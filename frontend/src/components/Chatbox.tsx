interface ChatboxProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  disabled?: boolean
  placeholder?: string
}

export function Chatbox({
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder = 'Type your message…',
}: ChatboxProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!disabled && value.trim()) onSend()
  }

  return (
    <form className="chatbox" onSubmit={handleSubmit}>
      <input
        type="text"
        className="chatbox-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        aria-label="Chat message"
      />
      <button
        type="submit"
        className="chatbox-send"
        disabled={disabled || !value.trim()}
        aria-label="Send message"
      >
        ↑
      </button>
    </form>
  )
}
