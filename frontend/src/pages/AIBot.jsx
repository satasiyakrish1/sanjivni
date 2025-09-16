import React, { useEffect, useRef, useState } from 'react'
import AIResponse from '../components/AIResponse'
import { getBackendUrl, apiFallback, testBackendConnection } from '../utils/connectionHelper'

const examplePrompts = [
  'What are the benefits of ginger?',
  'I have bloating and mild stomach pain for 3 days. Any herbs?',
  'How can I soothe a sore throat naturally?',
  'Suggestions for better sleep with anxiety?'
]

const MessageBubble = ({ role, text, isPending = false }) => (
  <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'} my-2`}>
    <div className={`${role === 'user' ? 'bg-primary text-white' : 'bg-white text-gray-900'} max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-2 shadow-sm border ${role === 'user' ? 'border-transparent' : 'border-gray-200'}`}>
      {isPending ? (
        <div className="flex items-center gap-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.2s]"></span>
          <span className="inline-flex h-2 w-2 rounded-full bg-gray-400 animate-bounce"></span>
          <span className="inline-flex h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]"></span>
        </div>
      ) : (
        <span className="whitespace-pre-wrap">{text}</span>
      )}
    </div>
  </div>
)

const AIBot = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! I am your Herbal AI. Describe your symptoms or ask about an herb, and I’ll suggest concise, safe, and practical natural remedies.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [diagnostics, setDiagnostics] = useState(null)
  const [showDiag, setShowDiag] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  const sendMessage = async (prompt) => {
    const text = (prompt ?? input).trim()
    if (!text || loading) return
    setError('')
    setInput('')

    setMessages((prev) => [...prev, { role: 'user', text }, { role: 'assistant', text: '...', pending: true }])
    setLoading(true)

    try {
      const q = text.toLowerCase()
      const isHerbQuery = /\b(benefit|benefits|uses|use cases|what is)\b.*\b(ginger|turmeric|tulsi|neem|ashwagandha|peppermint|fennel|cinnamon|chamomile|lavender|lemon balm)\b/.test(q)
      const endpoint = isHerbQuery ? '/api/herb-info' : '/api/herbal-remedy'
      const payload = isHerbQuery ? { query: text } : { symptoms: text }
      const data = await apiFallback(endpoint, { method: 'POST', data: payload })
      const markdown = (isHerbQuery ? data?.data?.info : data?.data?.remedy) || 'No answer available.'

      setMessages((prev) => {
        const updated = [...prev]
        const idx = updated.findIndex((m) => m.pending)
        if (idx !== -1) {
          updated[idx] = { role: 'assistant', text: markdown }
        } else {
          updated.push({ role: 'assistant', text: markdown })
        }
        return updated
      })
    } catch (e) {
      setError(e.message || 'Network error: Unable to reach the AI service. Please verify the backend is running and accessible.')
      try {
        const diag = await testBackendConnection()
        setDiagnostics(diag)
        setShowDiag(true)
      } catch (_) {}
      setMessages((prev) => prev.filter((m) => !m.pending))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-50">
      <div className="max-w-5xl mx-auto">
        <div className="sticky top-0 z-10 backdrop-blur bg-white/70 border-b border-gray-200">
          <div className="px-4 md:px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">AI BOT</h1>
              <p className="text-sm text-gray-600">Ask about herbs or describe symptoms. Example: "What are the benefits of ginger?"</p>
            </div>
          </div>
        </div>

        <div className="px-4 md:px-6">
          {error && (
            <div className="my-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <div className="flex items-start justify-between gap-2">
                <span>{error}</span>
                <button onClick={() => setShowDiag((v) => !v)} className="text-xs text-red-800 underline">{showDiag ? 'Hide details' : 'Show details'}</button>
              </div>
              {showDiag && (
                <div className="mt-2 text-xs text-red-800/90 bg-white rounded-md border border-red-100 p-2">
                  <div>Backend URL: {getBackendUrl()}</div>
                  <div className="mt-1">Health probe: {diagnostics?.endpoints?.health?.success ? 'OK' : 'Failed'}</div>
                  {!diagnostics?.endpoints?.health?.success && diagnostics?.endpoints?.health?.error && (
                    <div className="mt-1">Error: {diagnostics.endpoints.health.error}</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Suggestions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
            {examplePrompts.map((p) => (
              <button key={p} onClick={() => sendMessage(p)} className="text-left rounded-xl border border-gray-200 bg-white hover:shadow-sm px-4 py-3">
                <span className="text-gray-800">{p}</span>
              </button>
            ))}
          </div>

          {/* Chat area */}
          <div ref={scrollRef} className="h-[52vh] md:h-[60vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-3 md:p-4 shadow-sm">
            {messages.map((m, i) => (
              m.pending ? (
                <MessageBubble key={i} role="assistant" isPending text="" />
              ) : m.role === 'assistant' && m.text.startsWith('#') ? (
                <div key={i} className="my-2">
                  <AIResponse content={m.text} title="Herbal AI" />
                </div>
              ) : (
                <MessageBubble key={i} role={m.role} text={m.text} />
              )
            ))}
          </div>

          {/* Input */}
          <div className="sticky bottom-4 mt-4">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-2 flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') sendMessage() }}
                placeholder="Describe symptoms or ask about an herb..."
                className="flex-1 outline-none px-3 py-2 text-gray-900 placeholder:text-gray-400"
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className={`px-4 py-2 rounded-xl text-white ${loading || !input.trim() ? 'bg-primary/60' : 'bg-primary hover:bg-primary/90'}`}
                title="Send"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIBot


