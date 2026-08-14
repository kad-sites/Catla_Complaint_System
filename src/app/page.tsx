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
        {/* Login Card */}
        <div style={{
          background: '#111827',
          border: '1px solid #1e293b',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
            <div>
              <h2 style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#f1f5f9',
                marginBottom: '6px',
              }}>Welcome back</h2>
              <p style={{
                fontSize: '13px',
                color: '#64748b',
              }}>Please sign in to your account</p>
            </div>
            
            <img 
              src="/resonova_logo.png" 
              alt="Resonova Complaint Management System" 
              style={{ 
                height: '48px', 
                objectFit: 'contain',
                mixBlendMode: 'lighten' // This will merge the image's dark background with the card's background
              }} 
            />
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
                    background: '#0a0d14',
                    border: '1px solid #334155',
                    color: '#f1f5f9',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    appearance: 'none',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
                  onBlur={(e) => e.target.style.borderColor = '#334155'}
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
                    background: '#0a0d14',
                    border: '1px solid #334155',
                    color: '#f1f5f9',
                    padding: '12px 16px 12px 42px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
                  onBlur={(e) => e.target.style.borderColor = '#334155'}
                />
              </div>
            </div>

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
