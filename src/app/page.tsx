'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Wifi, Lock, Mail, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [role, setRole] = useState('admin')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (password !== '123') {
      setError('Invalid password. Please use 123')
      return
    }

    setLoading(true)

    // Store role for access control
    localStorage.setItem('userRole', role)

    // Simple demo routing
    setTimeout(() => {
      setLoading(false)
      if (role === 'admin' || role === 'manager') {
        router.push('/director')
      } else {
        router.push('/operator')
      }
    }, 800)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#060d21',
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
        {/* Login Card */}
        <div style={{
          background: 'linear-gradient(180deg, rgba(24, 45, 96, 0.25) 0%, rgba(12, 23, 52, 0.35) 100%)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '24px',
          padding: '36px 32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px' }}>
            <div>
              <h2 style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#f8fafc',
                marginBottom: '4px',
                letterSpacing: '0.3px',
              }}>Welcome back</h2>
              <p style={{
                fontSize: '12px',
                color: '#94a3b8',
              }}>Please sign in to your account</p>
            </div>
            
            <div style={{ height: '54px', overflow: 'hidden', display: 'flex', alignItems: 'flex-start' }}>
              <img 
                src="/resonova_logo.png" 
                alt="Resonova Complaint Management System" 
                style={{ 
                  height: '66px', 
                  objectFit: 'contain',
                  mixBlendMode: 'lighten' // This will merge the image's dark background with the card's background
                }} 
              />
            </div>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#f87171',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{ width: '4px', height: '14px', background: '#ef4444', borderRadius: '2px' }} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* User Dropdown */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Select Role
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#f1f5f9',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    appearance: 'none',
                    boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'rgba(14, 165, 233, 0.5)'; e.target.style.background = 'rgba(255,255,255,0.08)' }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'; e.target.style.background = 'rgba(255,255,255,0.05)' }}
                >
                  <option value="admin">Administrator</option>
                  <option value="manager">Manager</option>
                  <option value="operator">Operator</option>
                </select>
                <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#f1f5f9',
                    padding: '14px 16px 14px 42px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'rgba(14, 165, 233, 0.5)'; e.target.style.background = 'rgba(255,255,255,0.08)' }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'; e.target.style.background = 'rgba(255,255,255,0.05)' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: '48px',
                fontSize: '14px',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 14px 0 rgba(14, 165, 233, 0.39)',
                opacity: loading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => { if(!loading) e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(14, 165, 233, 0.4)' }}
              onMouseLeave={(e) => { if(!loading) e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(14, 165, 233, 0.39)' }}
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
