'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Wifi, Lock, Mail, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Simple demo routing
    setTimeout(() => {
      setLoading(false)
      if (email.includes('director')) router.push('/director')
      else if (email.includes('tech')) router.push('/technician')
      else router.push('/operator')
    }, 800)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0d14',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background Effects */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        left: '-10%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-20%',
        right: '-10%',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Grid pattern overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(14,165,233,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(14,165,233,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '420px' }}>
        {/* Logo + Brand */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 8px 32px rgba(14, 165, 233, 0.3)',
          }}>
            <Wifi size={28} color="white" />
          </div>
          <h1 style={{
            fontSize: '26px',
            fontWeight: 800,
            color: '#f1f5f9',
            letterSpacing: '-0.5px',
            marginBottom: '6px',
          }}>
            CATLA BROADBAND
          </h1>
          <p style={{
            fontSize: '12px',
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '3px',
            fontWeight: 600,
          }}>
            Complaint Management System
          </p>
        </div>

        {/* Login Card */}
        <div style={{
          background: '#111827',
          border: '1px solid #1e293b',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 700,
            color: '#f1f5f9',
            marginBottom: '6px',
          }}>Welcome back</h2>
          <p style={{
            fontSize: '13px',
            color: '#64748b',
            marginBottom: '28px',
          }}>Sign in to access your dashboard</p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '18px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: '#94a3b8',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '12px', color: '#64748b' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="operator@catla.local"
                  className="form-input"
                  style={{ paddingLeft: '40px', height: '44px' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: '#94a3b8',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '12px', color: '#64748b' }} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-input"
                  style={{ paddingLeft: '40px', height: '44px' }}
                />
              </div>
            </div>

            {error && (
              <div style={{
                marginBottom: '18px',
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#f87171',
                fontSize: '13px',
                fontWeight: 500,
              }}>
                ⚠ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%',
                height: '46px',
                fontSize: '14px',
                fontWeight: 700,
              }}
            >
              {loading ? 'Authenticating...' : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div style={{
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid #1e293b',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: '11px', color: '#475569', lineHeight: 1.6 }}>
              Authorized personnel only. All access is logged and monitored.<br />
              Demo: use <span style={{ color: '#0ea5e9', fontFamily: 'monospace' }}>director@</span> or <span style={{ color: '#0ea5e9', fontFamily: 'monospace' }}>tech@</span> or <span style={{ color: '#0ea5e9', fontFamily: 'monospace' }}>operator@</span>
            </p>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '11px', color: '#334155' }}>
          © {new Date().getFullYear()} Catla Broadband Service. All rights reserved.
        </p>
      </div>
    </div>
  )
}
