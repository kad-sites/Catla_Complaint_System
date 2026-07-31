'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Headphones, Wrench, BarChart3,
  Users, Settings, LogOut, Bell, Search, ChevronDown, MapPin, ListTodo, Activity
} from 'lucide-react'

const NAV_ITEMS = [
  { label: 'DASHBOARD', items: [
    { href: '/director', icon: LayoutDashboard, label: 'Manager Dashboard', badge: '' },
  ]},
  { label: 'COMPLAINTS', items: [
    { href: '/director/complaints', icon: ListTodo, label: 'All Complaints', badge: '12' },
    { href: '/tracking', icon: Activity, label: 'Live Tracking', badge: 'New' },
  ]},
  { label: 'FIELD', items: [
    { href: '/admin/field', icon: Wrench, label: 'Technician View', badge: '' },
  ]},
  { label: 'ADMINISTRATION', items: [
    { href: '/admin/users', icon: Users, label: 'Staff Management', badge: '' },
    { href: '/admin/settings', icon: Settings, label: 'Settings', badge: '' },
  ]},
]

export default function AppShell({ children, role = 'DIRECTOR' }: { children: React.ReactNode, role?: string }) {
  const pathname = usePathname()

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-logo">CB</div>
          <div>
            <h1>CATLA BROADBAND</h1>
            <span>Complaint NOC</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((section) => (
            <React.Fragment key={section.label}>
              <div className="sidebar-section-title">{section.label}</div>
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`sidebar-link ${isActive ? 'active' : ''}`}
                    style={{ position: 'relative' }}
                  >
                    <Icon />
                    <span>{item.label}</span>
                    {item.badge && <span className="sidebar-badge">{item.badge}</span>}
                  </Link>
                )
              })}
            </React.Fragment>
          ))}
        </nav>

        {/* User at bottom */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '13px',
            color: 'white'
          }}>ZA</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {role === 'DIRECTOR' ? 'Manager' : role === 'OPERATOR' ? 'Desk Operator' : 'Admin'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Online</div>
          </div>
          <button style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            padding: '4px'
          }}>
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="app-main">
        {/* Top Bar */}
        <header className="app-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                placeholder="Search tickets, customers..."
                className="form-input"
                style={{
                  paddingLeft: '36px',
                  width: '320px',
                  height: '38px',
                  fontSize: '13px',
                  background: 'var(--color-bg-surface)',
                  borderColor: 'var(--color-border)'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '6px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              fontSize: '12px',
              fontWeight: 600,
              color: '#34d399'
            }}>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)'
              }}></span>
              System Online
            </div>

            <button style={{
              position: 'relative',
              background: 'var(--color-bg-input)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              padding: '8px',
              cursor: 'pointer',
              color: 'var(--color-text-secondary)'
            }}>
              <Bell size={18} />
              <span style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#ef4444',
                border: '2px solid var(--color-bg-app)'
              }}></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="app-content">
          {children}
        </main>
      </div>
    </div>
  )
}
