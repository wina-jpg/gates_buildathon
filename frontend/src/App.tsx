import { useState, useCallback } from 'react'
import { sendChat } from './api'
import { Chatbox } from './components/Chatbox'
import { IntroScreen } from './screens/IntroScreen'
import { ConversationScreen } from './screens/ConversationScreen'
import { SummaryScreen } from './screens/SummaryScreen'
import { GeneratingScreen } from './screens/GeneratingScreen'
import { ResultsScreen } from './screens/ResultsScreen'
import { buildConversationSummary } from './utils/summary'
import {
  buildFirstTurnReply,
  buildSummaryTurnReply,
} from './constants/demoScript'
import { FALLBACK_JOB_DRAFT } from './data/fallbackDraft'
import type { AppPhase, ChatMessage, ConversationSummary } from './types'
import './App.css'

function buildGeneratePrompt(summary: ConversationSummary | null): string {
  if (!summary) {
    return 'Generate the complete job description based on our conversation. Use the knowledge base. Output ```job and ```evidence blocks.'
  }
  return `Generate the complete job description now.

Role / needs: ${summary.yourNeeds}
Focus: ${summary.problemSolving}
Target title: ${summary.possibleTitle}

Use the knowledge base. You MUST output a \`\`\`job markdown block with the full posting and a \`\`\`evidence block with 3-4 bullets.`
}

function resolveJobDraft(
  jobDraft: string | null,
  reply: string,
  forGeneration: boolean,
): { draft: string | null; warning: string } {
  if (jobDraft?.trim()) return { draft: jobDraft.trim(), warning: '' }
  if (reply.trim().length > 150) return { draft: reply.trim(), warning: '' }
  if (forGeneration) {
    return {
      draft: FALLBACK_JOB_DRAFT,
      warning:
        'Could not parse a job block from the API — showing a sample draft. Check HF_API_KEY and try again.',
    }
  }
  return { draft: null, warning: '' }
}

/** Demo: user answers Q1–Q3 (2nd user message) → summary. */
const DEMO_ANSWERS_USER_COUNT = 2

/** Minimum time on generating screen so lightning visuals are visible. */
const GENERATING_MIN_MS = 4500

function countUserMessages(msgs: ChatMessage[]): number {
  return msgs.filter((m) => m.role === 'user').length
}

function App() {
  const [phase, setPhase] = useState<AppPhase>('intro')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [summary, setSummary] = useState<ConversationSummary | null>(null)
  const [jobDraft, setJobDraft] = useState<string | null>(null)
  const [evidenceSummary, setEvidenceSummary] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const runChat = useCallback(
    async (
      nextMessages: ChatMessage[],
      options?: {
        forGeneration?: boolean
        generatingStartedAt?: number
        showEvidenceInChat?: boolean
      },
    ) => {
      setLoading(true)
      setError('')
      try {
        const data = await sendChat(nextMessages, jobDraft)
        const showEvidence = options?.showEvidenceInChat ?? options?.forGeneration
        const assistantContent = [
          showEvidence && data.evidence_summary
            ? `Evidence: ${data.evidence_summary}`
            : '',
          data.reply,
        ]
          .filter(Boolean)
          .join('\n\n')

        setMessages([
          ...nextMessages,
          { role: 'assistant', content: assistantContent },
        ])
        const { draft, warning } = resolveJobDraft(
          data.job_draft,
          data.reply,
          Boolean(options?.forGeneration),
        )
        if (draft) setJobDraft(draft)
        if (warning) setError(warning)
        if (data.evidence_summary) setEvidenceSummary(data.evidence_summary)

        if (options?.forGeneration) {
          const started = options.generatingStartedAt ?? Date.now()
          const remaining = Math.max(0, GENERATING_MIN_MS - (Date.now() - started))
          if (remaining > 0) {
            await new Promise((resolve) => setTimeout(resolve, remaining))
          }
          setPhase('results')
        }
        return data
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.')
        if (options?.forGeneration) {
          setPhase('summary')
        }
        return null
      } finally {
        setLoading(false)
      }
    },
    [jobDraft],
  )

  const handleSend = useCallback(async () => {
    const trimmed = chatInput.trim()
    if (!trimmed || loading) return

    const userMessage: ChatMessage = { role: 'user', content: trimmed }
    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setChatInput('')

    if (phase === 'intro') {
      setPhase('conversation')
      setMessages([
        ...nextMessages,
        { role: 'assistant', content: buildFirstTurnReply() },
      ])
      return
    }

    if (phase === 'conversation') {
      const userCount = countUserMessages(nextMessages)
      if (userCount === DEMO_ANSWERS_USER_COUNT) {
        setSummary(buildConversationSummary(nextMessages))
        setMessages([
          ...nextMessages,
          { role: 'assistant', content: buildSummaryTurnReply() },
        ])
        setPhase('summary')
        return
      }
      if (userCount > DEMO_ANSWERS_USER_COUNT) {
        await runChat(nextMessages)
      }
      return
    }

    if (phase === 'summary') {
      setPhase('conversation')
      await runChat(nextMessages)
      return
    }

    if (phase === 'results') {
      await runChat(nextMessages, { showEvidenceInChat: false })
      return
    }
  }, [chatInput, loading, messages, phase, runChat])

  const handleConfirm = useCallback(async () => {
    const generatingStartedAt = Date.now()
    setPhase('generating')
    setError('')
    const generateMessage: ChatMessage = {
      role: 'user',
      content: buildGeneratePrompt(summary),
    }
    const nextMessages = [...messages, generateMessage]
    setMessages(nextMessages)
    await runChat(nextMessages, {
      forGeneration: true,
      generatingStartedAt,
      showEvidenceInChat: false,
    })
  }, [messages, runChat, summary])

  const copyDraft = async () => {
    if (!jobDraft) return
    await navigator.clipboard.writeText(jobDraft)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shellClass = [
    'app-shell',
    phase === 'results' && 'app-shell-wide',
    phase === 'generating' && 'app-shell-shock',
  ]
    .filter(Boolean)
    .join(' ')

  const chatPlaceholder =
    phase === 'intro'
      ? 'e.g. I need to come up with a JD for a Senior Platform Engineer…'
      : phase === 'conversation' &&
          countUserMessages(messages) === 1
        ? 'Answer Q1, Q2, and Q3…'
        : phase === 'results'
          ? 'Ask for edits to the job description…'
          : 'Type your message…'

  const showChatbox = phase !== 'generating'

  return (
    <div className={shellClass}>
      <main className="phase-main">
        {phase === 'intro' && <IntroScreen />}
        {phase === 'conversation' && (
          <ConversationScreen
            messages={messages}
            loading={loading}
            error={error}
          />
        )}
        {phase === 'summary' && summary && (
          <SummaryScreen
            summary={summary}
            onConfirm={handleConfirm}
            confirming={loading}
          />
        )}
        {phase === 'generating' && <GeneratingScreen />}
        {phase === 'results' && (
          <ResultsScreen
            jobDraft={jobDraft}
            evidenceSummary={evidenceSummary}
            onCopy={copyDraft}
            copied={copied}
          />
        )}
        {phase === 'summary' && error && (
          <p className="error-banner error-banner-center">{error}</p>
        )}
        {phase === 'results' && error && (
          <p className="error-banner error-banner-center">{error}</p>
        )}
      </main>

      {showChatbox && (
        <footer className="chatbox-footer">
          <div className="chatbox-wrap">
            <Chatbox
              value={chatInput}
              onChange={setChatInput}
              onSend={handleSend}
              disabled={loading}
              placeholder={chatPlaceholder}
            />
          </div>
        </footer>
      )}
    </div>
  )
}

export default App
