import { useState, useEffect } from 'react'
import { api } from '../api.js'

export default function Inbox() {
  const [tab, setTab] = useState('inbox')
  const [sent, setSent] = useState([])
  const [inbox, setInbox] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = () => {
    setLoading(true)
    Promise.all([
      fetch('/api/email/sent').then(r => r.json()),
      fetch('/api/email/inbox').then(r => r.json()),
    ]).then(([s, i]) => {
      setSent(s)
      setInbox(i)
      setLoading(false)
    })
  }

  useEffect(() => { fetch() }, [])

  const handleSend = async (e) => {
    e.preventDefault()
    const form = new FormData(e.target)
    const data = {
      to_email: form.get('to'),
      to_name: form.get('name'),
      subject: form.get('subject'),
      body: form.get('body'),
      type: 'manual',
    }
    const res = await fetch('/api/email/sent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) {
      e.target.reset()
      fetch()
    }
  }

  const emails = tab === 'inbox' ? inbox : sent
  const emptyMsg = tab === 'inbox' ? 'No messages yet. When someone replies, they\'ll appear here.' : 'No sent emails yet. Send your first message below.'

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-accent-400 border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div className="page-enter space-y-8">
      <div>
        <h2 className="font-display text-3xl font-bold text-surface-50">Inbox</h2>
        <p className="text-surface-400 mt-1">Manage your creator business emails.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-900 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab('inbox')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab === 'inbox' ? 'bg-accent-600 text-white' : 'text-surface-400 hover:text-surface-200'}`}
        >
          Inbox {inbox.length > 0 && `(${inbox.length})`}
        </button>
        <button
          onClick={() => setTab('sent')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab === 'sent' ? 'bg-accent-600 text-white' : 'text-surface-400 hover:text-surface-200'}`}
        >
          Sent ({sent.length})
        </button>
        <button
          onClick={() => setTab('compose')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab === 'compose' ? 'bg-accent-600 text-white' : 'text-surface-400 hover:text-surface-200'}`}
        >
          Compose
        </button>
      </div>

      {/* Compose Form */}
      {tab === 'compose' && (
        <form onSubmit={handleSend} className="glass p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-surface-500 mb-1">To (email)</p>
              <input name="to" type="email" required className="w-full px-3 py-2 rounded-lg bg-surface-800 border border-surface-700/50 text-surface-200 text-sm focus:outline-none focus:border-accent-500" placeholder="brand@example.com" />
            </div>
            <div>
              <p className="text-xs text-surface-500 mb-1">Name</p>
              <input name="name" className="w-full px-3 py-2 rounded-lg bg-surface-800 border border-surface-700/50 text-surface-200 text-sm focus:outline-none focus:border-accent-500" placeholder="Brand contact" />
            </div>
          </div>
          <div>
            <p className="text-xs text-surface-500 mb-1">Subject</p>
            <input name="subject" required className="w-full px-3 py-2 rounded-lg bg-surface-800 border border-surface-700/50 text-surface-200 text-sm focus:outline-none focus:border-accent-500" placeholder="Sponsorship inquiry..." />
          </div>
          <div>
            <p className="text-xs text-surface-500 mb-1">Message</p>
            <textarea name="body" required rows={6} className="w-full px-3 py-2 rounded-lg bg-surface-800 border border-surface-700/50 text-surface-200 text-sm focus:outline-none focus:border-accent-500 resize-none" placeholder="Write your message..." />
          </div>
          <button type="submit" className="px-5 py-2.5 bg-accent-600 hover:bg-accent-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-accent-600/25">
            Send Email
          </button>
        </form>
      )}

      {/* Email List */}
      {tab !== 'compose' && (
        <div className="space-y-2">
          {emails.length === 0 ? (
            <div className="glass p-12 text-center">
              <p className="text-surface-400">{emptyMsg}</p>
            </div>
          ) : (
            emails.map(email => (
              <EmailRow
                key={email.id}
                email={email}
                isInbox={tab === 'inbox'}
                onRead={() => fetch()}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

function EmailRow({ email, isInbox, onRead }) {
  const [expanded, setExpanded] = useState(false)

  const handleClick = async () => {
    setExpanded(!expanded)
    if (isInbox && !email.read) {
      await fetch(`/api/email/inbox/${email.id}/read`, { method: 'PUT' })
      onRead()
    }
  }

  const sender = isInbox
    ? `${email.from_name || email.from_email}`
    : `To: ${email.to_name || email.to_email}`

  const time = email.sent_at || email.received_at

  return (
    <div
      onClick={handleClick}
      className={`glass p-4 cursor-pointer transition-all duration-200 hover:border-surface-600/60 ${!isInbox || email.read ? 'opacity-75' : 'border-accent-500/30'}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {isInbox && !email.read && <div className="w-2 h-2 rounded-full bg-accent-400 shrink-0" />}
          <p className="font-semibold text-surface-200 text-sm truncate">{sender}</p>
        </div>
        <span className="text-xs text-surface-500 shrink-0 ml-3">{time?.replace('2026-07-19 ', '')}</span>
      </div>
      <p className={`text-sm mt-1 ${expanded ? 'text-surface-200' : 'text-surface-300 truncate'}`}>
        {email.subject}
      </p>
      {expanded && (
        <div className="mt-3 pt-3 border-t border-surface-700/30">
          <p className="text-sm text-surface-300 whitespace-pre-wrap">{email.body}</p>
        </div>
      )}
    </div>
  )
}
