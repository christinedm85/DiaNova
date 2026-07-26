import { useState, useRef, useEffect } from 'react'
import { api } from '../api.js'

export default function AskBloom({ show, onClose, initialQuestion, onNavigate }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  // Focus input on open
  useEffect(() => {
    if (show && inputRef.current) {
      // Small delay for slide animation
      setTimeout(() => inputRef.current?.focus(), 300)
    }
    if (!show) {
      // Clear state when closed
      setMessages([])
      setInput('')
      setLoading(false)
      setError(null)
    }
  }, [show])

  // Handle initial question from chips
  useEffect(() => {
    if (show && initialQuestion) {
      const q = initialQuestion
      // Only send if not already sent (messages empty)
      if (messages.length === 0 && !loading) {
        handleSend(q)
      }
    }
  }, [show, initialQuestion])

  const handleSend = async (overrideInput) => {
    const text = (overrideInput || input).trim()
    if (!text || loading) return

    const userMsg = { role: 'user', content: text }

    // Build conversation history for context (exclude current message)
    const conversationHistory = [...messages, userMsg].map(m => ({
      role: m.role,
      content: m.content,
    }))

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    setError(null)

    try {
      const result = await api.ai.askBloom({
        question: text,
        conversationHistory: conversationHistory.slice(0, -1), // Don't include the just-added message
      })

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: result.response,
          actions: result.actions,
        },
      ])
    } catch (e) {
      setError(e.message)
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Hmm, something went wrong. Let me try again — what were we talking about? 🌸',
          isError: true,
        },
      ])
    }
    setLoading(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!show) return null

  const bloomLogo = (
    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500/20 to-emerald-500/20 flex items-center justify-center shrink-0 border border-violet-500/20">
      <span className="text-xs">🌸</span>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-[460px] h-full bg-surface-900/95 backdrop-blur-xl border-l border-surface-700/50 flex flex-col animate-[slide-left_0.3s_ease-out]">
        {/* Header */}
        <div className="shrink-0 bg-surface-900/95 backdrop-blur-xl border-b border-surface-700/30 px-5 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/20 to-emerald-500/20 flex items-center justify-center shrink-0 border border-violet-500/30">
            <span className="text-lg">🌸</span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-base text-surface-50">Ask Bloom</h2>
            <p className="text-[10px] text-surface-500">Your AI copilot — I know your business</p>
          </div>
          <button
            onClick={onClose}
            className="text-surface-400 hover:text-surface-200 text-xl leading-none p-1 rounded-lg hover:bg-surface-800/50 transition-colors"
          >
            &times;
          </button>
        </div>

        {/* Messages area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-5 py-4 space-y-4"
        >
          {/* Welcome message */}
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/15 to-emerald-500/15 flex items-center justify-center mb-4 border border-violet-500/20">
                <span className="text-3xl">🌸</span>
              </div>
              <h3 className="font-display text-lg font-semibold text-surface-100 mb-2">Hey there! 👋</h3>
              <p className="text-sm text-surface-400 max-w-xs leading-relaxed">
                I'm Bloom, your AI copilot. I know your sponsorships, revenue, and pipeline — ask me anything!
              </p>
              <div className="flex flex-wrap gap-2 mt-5 justify-center">
                {[
                  'Which deal should I accept?',
                  'How much should I charge?',
                  'Why is revenue down?',
                  'What should I do today?',
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="px-3 py-1.5 rounded-lg bg-surface-800/60 border border-surface-700/30 text-xs text-surface-400 hover:text-violet-400 hover:border-violet-500/30 hover:bg-violet-500/10 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat messages */}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              style={{
                animation: `fadeIn 0.3s ease-out ${i * 50}ms both`,
              }}
            >
              {/* Bloom avatar for assistant */}
              {msg.role === 'assistant' && bloomLogo}

              {/* Message bubble */}
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-violet-500/20 border border-violet-500/30 text-surface-100 rounded-br-md'
                    : msg.isError
                    ? 'glass border border-rose-500/20 text-surface-200 rounded-bl-md'
                    : 'glass border border-surface-700/30 text-surface-200 rounded-bl-md'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>

                {/* Action buttons */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-surface-700/30">
                    {msg.actions.map((action, j) => (
                      <button
                        key={j}
                        onClick={() => onNavigate && onNavigate(action.route)}
                        className="px-3 py-1.5 rounded-lg bg-violet-500/15 text-violet-400 text-xs font-medium hover:bg-violet-500/25 transition-all border border-violet-500/20"
                      >
                        {action.label} →
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* User avatar */}
              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-violet-500/25 flex items-center justify-center shrink-0 border border-violet-500/30">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex gap-2.5 justify-start" style={{ animation: 'fadeIn 0.2s ease-out both' }}>
              {bloomLogo}
              <div className="glass border border-surface-700/30 px-4 py-3 rounded-2xl rounded-bl-md">
                <div className="flex items-center gap-1.5">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
              <p className="text-xs text-rose-400">{error}</p>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="shrink-0 border-t border-surface-700/30 px-5 py-4">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about your creator business..."
                rows={1}
                className="w-full rounded-xl border border-surface-700/50 bg-surface-800/80 px-4 py-3 pr-10 text-sm text-surface-100 outline-none focus:border-violet-500/50 resize-none placeholder:text-surface-500"
                style={{ minHeight: '44px', maxHeight: '120px' }}
                onInput={(e) => {
                  // Auto-resize
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                }}
              />
            </div>
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center shrink-0 hover:bg-violet-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed border border-violet-500/20"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
          <p className="text-[10px] text-surface-600 mt-2 text-center">
            Press Enter to send · Bloom knows your business data
          </p>
        </div>
      </div>
    </div>
  )
}
