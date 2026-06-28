import { useState } from 'react'
import { X, MessageSquare } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../auth/AuthContext'

interface Props {
  onClose: () => void
}

export function FeedbackDialog({ onClose }: Props) {
  const { user } = useAuth()
  const [message, setMessage] = useState('')
  const [contact, setContact] = useState('')
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!supabase || !message.trim()) return
    setSending(true)
    setError('')
    const { error: err } = await supabase.from('feedback').insert({
      message: message.trim(),
      contact: contact.trim() || null,
      user_id: user?.id ?? null,
      page: location.hash || '#discover',
      user_agent: navigator.userAgent.slice(0, 500),
    })
    setSending(false)
    if (err) {
      setError('发送失败，请稍后重试')
    } else {
      setDone(true)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="relative w-full max-w-sm mx-4"
        style={{ background: '#fff', borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
      >
        <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-md" style={{ color: '#999' }}>
          <X size={16} />
        </button>

        <div style={{ padding: '28px 28px 24px' }}>
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare size={18} style={{ color: '#111114' }} />
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111114' }}>
              {done ? '感谢反馈' : '意见反馈'}
            </h2>
          </div>
          <p style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>
            {done ? '你的反馈已收到，我们会认真阅读。' : '告诉我们你的想法或建议。'}
          </p>

          {done ? (
            <button
              onClick={onClose}
              style={{
                width: '100%', height: 40, borderRadius: 9,
                background: '#111114', color: '#fff',
                fontSize: 14, fontWeight: 650, cursor: 'pointer',
              }}
            >
              关闭
            </button>
          ) : (
            <form onSubmit={handleSubmit}>
              <textarea
                required
                maxLength={2000}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="分享你的想法..."
                className="w-full mb-3 p-3 outline-none resize-none"
                style={{
                  height: 120, borderRadius: 9, border: '1px solid #D8D9DD',
                  fontSize: 14, color: '#111114', background: '#fff',
                }}
              />
              {!user && (
                <>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6 }}>
                    联系方式（可选）
                  </label>
                  <input
                    type="text"
                    maxLength={200}
                    value={contact}
                    onChange={e => setContact(e.target.value)}
                    placeholder="邮箱或其他方式"
                    className="w-full mb-4 px-3 outline-none"
                    style={{
                      height: 40, borderRadius: 9, border: '1px solid #D8D9DD',
                      fontSize: 14, color: '#111114', background: '#fff',
                    }}
                  />
                </>
              )}
              {error && <p style={{ fontSize: 13, color: '#EF4444', marginBottom: 12 }}>{error}</p>}
              <button
                type="submit"
                disabled={sending}
                style={{
                  width: '100%', height: 40, borderRadius: 9,
                  background: sending ? '#666' : '#111114', color: '#fff',
                  fontSize: 14, fontWeight: 650, cursor: sending ? 'not-allowed' : 'pointer',
                }}
              >
                {sending ? '发送中...' : '提交反馈'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
