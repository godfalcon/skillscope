import { useState } from 'react'
import type { FormEvent } from 'react'
import { Eye, EyeOff, Mail, ShieldCheck, Bookmark } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'

function friendlyError(msg: string) {
  if (/invalid login credentials/i.test(msg)) return '邮箱或密码不正确。'
  if (/email not confirmed/i.test(msg)) return '请先打开验证邮件完成邮箱确认。'
  if (/user already registered/i.test(msg)) return '这个邮箱已经注册，请直接登录。'
  if (/password should be at least/i.test(msg)) return '密码至少需要 6 位。'
  if (/rate limit/i.test(msg)) return '操作过于频繁，请稍后再试。'
  return msg
}

interface Props {
  onContinue: () => void
  onSuccess: () => void
}

export function AuthPage({ onContinue, onSuccess }: Props) {
  const { configured, signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    if (!configured) {
      setError('登录服务等待部署配置，访客浏览不受影响。')
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('请输入有效的邮箱地址。')
      return
    }
    if (password.length < 6) {
      setError('密码至少需要 6 位。')
      return
    }
    setBusy(true)
    try {
      if (mode === 'login') {
        await signIn(email, password)
        onSuccess()
      } else {
        const needsConfirm = await signUp(email, password)
        if (needsConfirm) setMessage('验证邮件已发送，请完成邮箱验证后登录。')
        else onSuccess()
      }
    } catch (err) {
      setError(friendlyError(err instanceof Error ? err.message : '暂时无法完成操作。'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 48, padding: '60px 52px', minHeight: 'calc(100vh - 72px)' }}>
      <form
        onSubmit={submit}
        style={{ width: '100%', maxWidth: 380 }}
      >
        {/* Tabs */}
        <div style={{ display: 'flex', background: '#F3F3F5', borderRadius: 8, padding: 3, marginBottom: 24 }}>
          {(['login', 'register'] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => { setMode(t); setError(''); setMessage('') }}
              style={{
                flex: 1, height: 34, borderRadius: 6, fontSize: 13, fontWeight: 600, border: 'none',
                background: mode === t ? '#fff' : 'transparent',
                color: mode === t ? '#111114' : '#888',
                boxShadow: mode === t ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                cursor: 'pointer',
              }}
            >
              {t === 'login' ? '登录' : '注册'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#666', marginBottom: 8 }}>
          <ShieldCheck size={16} />
          <span>收藏会安全地绑定到你的账号</span>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111114', margin: '0 0 4px' }}>
          {mode === 'login' ? '欢迎回来' : '创建 SkillScope 账号'}
        </h1>
        <p style={{ fontSize: 13, color: '#888', margin: '0 0 24px' }}>
          {mode === 'login' ? '继续整理你的 Agent Skills 收藏。' : '验证邮箱后，即可在不同设备同步收藏。'}
        </p>

        {/* Email */}
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6 }}>邮箱</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 42, borderRadius: 9, border: '1px solid #D8D9DD', padding: '0 12px', marginBottom: 14, background: '#fff' }}>
          <Mail size={16} style={{ color: '#999', flexShrink: 0 }} />
          <input
            type="email" autoComplete="email" placeholder="name@example.com"
            value={email} onChange={e => setEmail(e.target.value)}
            className="flex-1 bg-transparent outline-none"
            style={{ fontSize: 14, color: '#111114', border: 'none' }}
          />
        </div>

        {/* Password */}
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6 }}>密码</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 42, borderRadius: 9, border: '1px solid #D8D9DD', padding: '0 12px', marginBottom: 20, background: '#fff' }}>
          <ShieldCheck size={16} style={{ color: '#999', flexShrink: 0 }} />
          <input
            type={showPw ? 'text' : 'password'}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            placeholder="至少 6 位"
            value={password} onChange={e => setPassword(e.target.value)}
            className="flex-1 bg-transparent outline-none"
            style={{ fontSize: 14, color: '#111114', border: 'none' }}
          />
          <button type="button" onClick={() => setShowPw(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: 0 }}>
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {error && <p style={{ fontSize: 13, color: '#EF4444', marginBottom: 12 }}>{error}</p>}
        {message && <p style={{ fontSize: 13, color: '#22C55E', marginBottom: 12 }}>{message}</p>}

        <button
          type="submit" disabled={busy}
          style={{
            width: '100%', height: 42, borderRadius: 9, border: 'none',
            background: busy ? '#666' : '#111114', color: '#fff',
            fontSize: 14, fontWeight: 650, cursor: busy ? 'not-allowed' : 'pointer', marginBottom: 10,
          }}
        >
          {busy ? '正在处理...' : mode === 'login' ? '登录' : '注册并验证邮箱'}
        </button>

        <button
          type="button" onClick={onContinue}
          style={{
            width: '100%', height: 42, borderRadius: 9,
            background: '#F3F3F5', color: '#666', border: 'none',
            fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 16,
          }}
        >
          继续浏览
        </button>

        <small style={{ fontSize: 11, color: '#999' }}>
          注册即表示你同意仅将账号用于同步 SkillScope 收藏。
        </small>
      </form>

      {/* Right illustration area */}
      <div className="hidden lg:flex" style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', maxWidth: 320, gap: 16 }}>
        <div style={{ width: 80, height: 80, borderRadius: 20, background: '#F3F3F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Bookmark size={36} style={{ color: '#111114' }} />
        </div>
        <strong style={{ fontSize: 16, fontWeight: 700, color: '#111114' }}>发现 · 收藏 · 随时回来</strong>
        <p style={{ fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 1.6 }}>
          你的资料页保持简单：邮箱账号、验证状态与收藏，不开放上传和自定义文字。
        </p>
      </div>
    </div>
  )
}
