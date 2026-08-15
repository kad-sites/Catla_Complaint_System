'use client'

import React, { useState } from 'react'
import {
  Building2, Palette, Clock, Bell, Shield, Webhook,
  Save, Upload, Monitor, Smartphone, Layout
} from 'lucide-react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('appearance')
  const [accentColor, setAccentColor] = useState('sky')
  const [density, setDensity] = useState('comfortable')
  const [companyName, setCompanyName] = useState('RESONOVA BROADBAND')

  React.useEffect(() => {
    const savedId = localStorage.getItem('themeAccentId')
    if (savedId) setAccentColor(savedId)
  }, [])

  const handleColorChange = (color: any) => {
    setAccentColor(color.id)
    document.documentElement.style.setProperty('--color-accent', color.hex)
    localStorage.setItem('themeAccentId', color.id)
    localStorage.setItem('themeAccentHex', color.hex)
  }

  const accentColors = [
    { id: 'sky', bg: 'bg-sky-500', name: 'Sky Blue', hex: '#0ea5e9' },
    { id: 'indigo', bg: 'bg-indigo-500', name: 'Indigo', hex: '#6366f1' },
    { id: 'emerald', bg: 'bg-emerald-500', name: 'Emerald', hex: '#10b981' },
    { id: 'rose', bg: 'bg-rose-500', name: 'Rose', hex: '#f43f5e' },
    { id: 'amber', bg: 'bg-amber-500', name: 'Amber', hex: '#f59e0b' },
  ]

  const tabs = [
    { id: 'appearance', label: 'Theme & Brand', icon: Palette },
    { id: 'general', label: 'Company Info', icon: Building2 },
    { id: 'sla', label: 'SLA & Timers', icon: Clock },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'security', label: 'Access Control', icon: Shield },
    { id: 'integrations', label: 'API & Webhooks', icon: Webhook },
  ]

  return (
    <>
      <div className="animate-fade-in" style={{ padding: '0', display: 'flex', gap: '32px' }}>
        
        {/* Sidebar Nav */}
        <div style={{ width: '240px', flexShrink: 0 }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '24px' }}>Settings</h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tabs.map(tab => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                    borderRadius: '12px', fontSize: '14px', fontWeight: 600,
                    background: isActive ? 'var(--color-accent)' : 'transparent',
                    color: isActive ? '#fff' : 'var(--color-text-muted)',
                    border: 'none', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Settings Content */}
        <div style={{ flex: 1 }}>
          <div className="data-card" style={{ padding: '32px', minHeight: '600px' }}>
            
            {activeTab === 'appearance' && (
              <div className="animate-fade-in">
                <div style={{ marginBottom: '32px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>White-Label Branding</h2>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Customize the look and feel of the platform for your clients. These settings will apply globally across all dashboards.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  {/* Brand Accent Color */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '16px' }}>Primary Brand Color</label>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      {accentColors.map(color => (
                        <button
                          key={color.id}
                          onClick={() => handleColorChange(color)}
                          style={{
                            width: '48px', height: '48px', borderRadius: '50%',
                            background: color.id === 'sky' ? '#0ea5e9' : color.id === 'indigo' ? '#6366f1' : color.id === 'emerald' ? '#10b981' : color.id === 'rose' ? '#f43f5e' : '#f59e0b',
                            border: accentColor === color.id ? '4px solid var(--color-bg-card)' : 'none',
                            outline: accentColor === color.id ? '2px solid var(--color-text-secondary)' : 'none',
                            cursor: 'pointer', transition: 'all 0.2s', opacity: accentColor === color.id ? 1 : 0.7
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)' }} />

                  {/* UI Density */}
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
                      <Layout size={16} /> Global View Density
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div 
                        onClick={() => setDensity('comfortable')}
                        style={{
                          padding: '16px', borderRadius: '12px', cursor: 'pointer', border: '1px solid',
                          borderColor: density === 'comfortable' ? 'var(--color-accent)' : 'var(--color-border)',
                          background: density === 'comfortable' ? 'rgba(14, 165, 233, 0.1)' : 'transparent',
                          color: density === 'comfortable' ? 'var(--color-accent)' : 'var(--color-text-secondary)'
                        }}
                      >
                        <div style={{ fontWeight: 600, marginBottom: '4px' }}>Comfortable (Default)</div>
                        <div style={{ fontSize: '12px', opacity: 0.8 }}>Larger padding, highly readable, best for touch screens.</div>
                      </div>
                      <div 
                        onClick={() => setDensity('compact')}
                        style={{
                          padding: '16px', borderRadius: '12px', cursor: 'pointer', border: '1px solid',
                          borderColor: density === 'compact' ? 'var(--color-accent)' : 'var(--color-border)',
                          background: density === 'compact' ? 'rgba(14, 165, 233, 0.1)' : 'transparent',
                          color: density === 'compact' ? 'var(--color-accent)' : 'var(--color-text-secondary)'
                        }}
                      >
                        <div style={{ fontWeight: 600, marginBottom: '4px' }}>Compact Data View</div>
                        <div style={{ fontSize: '12px', opacity: 0.8 }}>Tight padding, fits more rows, best for desktop.</div>
                      </div>
                    </div>
                  </div>

                  <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)' }} />

                  {/* Logo Upload */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '16px' }}>Company Logo</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                      <div style={{
                        width: '80px', height: '80px', background: 'var(--color-bg-app)',
                        border: '2px dashed var(--color-border)', borderRadius: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--color-accent)', fontWeight: 700, fontSize: '20px'
                      }}>
                        {companyName.substring(0, 2)}
                      </div>
                      <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Upload size={16} /> Upload New Logo
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'general' && (
              <div className="animate-fade-in">
                <div style={{ marginBottom: '32px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>Company Information</h2>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Configure the base identity of the platform.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '400px' }}>
                  <div className="form-group">
                    <label className="form-label">Company Name</label>
                    <input 
                      type="text" 
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                      className="form-input" 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Support Email</label>
                    <input type="email" defaultValue="noc@resonova.com" className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Timezone</label>
                    <select className="form-select">
                      <option>Asia/Kolkata (IST)</option>
                      <option>UTC</option>
                      <option>America/New_York (EST)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'sla' && (
              <div className="animate-fade-in">
                <div style={{ marginBottom: '32px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>SLA & Auto-Escalation</h2>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Configure resolution time limits for different priority tiers.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '500px' }}>
                  {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((priority, i) => (
                    <div key={priority} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--color-bg-app)', border: '1px solid var(--color-border)', padding: '16px', borderRadius: '12px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: i === 0 ? '#ef4444' : i === 1 ? '#f59e0b' : i === 2 ? '#0ea5e9' : '#64748b' }} />
                        {priority}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input type="number" defaultValue={i === 0 ? 4 : i === 1 ? 8 : i === 2 ? 24 : 48} className="form-input" style={{ width: '80px', textAlign: 'center' }} />
                        <span style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Hours</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {['notifications', 'security', 'integrations'].includes(activeTab) && (
              <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--color-bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
                  <Monitor size={24} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px' }}>Module locked in Demo Mode</h3>
                <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', maxWidth: '300px' }}>This section contains sensitive configurations and is disabled in the current preview environment.</p>
              </div>
            )}

          </div>
          
          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '14px' }}>
              <Save size={18} />
              Save Configuration
            </button>
          </div>
        </div>

      </div>
    </>
  )
}
