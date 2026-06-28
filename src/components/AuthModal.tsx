import { useState } from 'react'
import { X } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'

interface Props {
  onClose: () => void
}

export function AuthModal({ onClose }: Props) {
  const { signIn, signUp } = useAuth()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [confirmSent, setConfirmSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setPending(true)
    try {
      if (tab === 'login') {
        await signIn(email, password)
        onClose()
      } else {
        const needsConfirm = await signUp(email, password)
        if (needsConfirm) {
          setConfirmSent(true)
        } else {
          onClose()
        }
      }
    } catch (err: any) {
      setError(err?.message || '操作失败')
    } finally {
      setPending(false)
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
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-md"
          style={{ color: '#999' }}
        >
          <X size={16} />
        </button>

        <div style={{ padding: '28px 28px 24px' }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111114', marginBottom: 4 }}>
            {confirmSent ? '验证邮件已发送' : tab === 'login' ? '登录 SkillScope' : '注册 SkillScope'}
          </h2>
          <p style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>
            {confirmSent
              ? '请查看你的邮箱并点击确认链接完成注册。'
              : '登录后收藏将跨设备同步。'}
          </p>

          {confirmSent ? (
            <button
              onClick={onClose}
              style={{
                width: '100%', height: 40, borderRadius: 9,
                background: '#111114', color: '#fff',
                fontSize: 14, fontWeight: 650, cursor: 'pointer',
              }}
            >
              好的
            </button>
          ) : (
            <>
              <div className="flex mb-5" style={{ background: '#F3F3F5', borderRadius: 8, padding: 3 }}>
                {(['login', 'register'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => { setTab(t); setError('') }}
                    style={{
                      flex: 1, height: 32, borderRadius: 6, fontSize: 13, fontWeight: 600,
                      background: tab === t ? '#fff' : 'transparent',
                      color: tab === t ? '#111114' : '#888',
                      boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {t === 'login' ? '登录' : '注册'}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6 }}>
                  邮箱
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full mb-3 px-3 outline-none"
                  style={{
                    height: 40, borderRadius: 9, border: '1px solid #D8D9DD',
                    fontSize: 14, color: '#111114', background: '#fff',
                  }}
                />
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6 }}>
                  密码
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={tab === 'register' ? '至少 6 个字符' : '••••••'}
                  className="w-full mb-4 px-3 outline-none"
                  style={{
                    height: 40, borderRadius: 9, border: '1px solid #D8D9DD',
                    fontSize: 14, color: '#111114', background: '#fff',
                  }}
                />

                {error && (
                  <p style={{ fontSize: 13, color: '#EF4444', marginBottom: 12 }}>{error}</p>
                )}

                <button
                  type="submit"
                  disabled={pending}
                  style={{
                    width: '100%', height: 40, borderRadius: 9,
                    background: pending ? '#666' : '#111114', color: '#fff',
                    fontSize: 14, fontWeight: 650, cursor: pending ? 'not-allowed' : 'pointer',
                  }}
                >
                  {pending ? '处理中...' : tab === 'login' ? '登录' : '注册'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
