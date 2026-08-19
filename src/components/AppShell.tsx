'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Headphones, Wrench, BarChart3,
  Users, Settings, LogOut, Bell, Search, ChevronDown, MapPin, ListTodo, Activity, UserPlus
} from 'lucide-react'

import { getComplaints } from '@/actions/complaintStore'

const NAV_ITEMS_TEMPLATE = [
  { label: 'DASHBOARD', items: [
    { href: '/director', icon: LayoutDashboard, label: 'Dashboard', badge: '' },
  ]},
  { label: 'COMPLAINTS', items: [
    { href: '/director/complaints', icon: ListTodo, label: 'All Complaints', badge: '' },
    { href: '/tracking', icon: Activity, label: 'Tracking', badge: '' },
  ]},
  { label: 'FIELD', items: [
    { href: '/admin/field', icon: Wrench, label: 'Technician View', badge: '' },
    { href: '/admin/pulsedesk', icon: Activity, label: 'PulseDesk Live', badge: '' },
  ]},
  { label: 'ADMINISTRATION', items: [
    { href: '/admin/users', icon: Users, label: 'Staff Management', badge: '' },
    { href: '/admin/settings', icon: Settings, label: 'Settings', badge: '' },
    { href: '/admin/customers', icon: UserPlus, label: 'Add Customer', badge: '' },
  ]},
]

export default function AppShell({ children, role = 'DIRECTOR' }: { children: React.ReactNode, role?: string }) {
  const pathname = usePathname()
  const [complaintCount, setComplaintCount] = React.useState<number>(0)
  const [userRole, setUserRole] = React.useState<string | null>(null)
  const [isHovered, setIsHovered] = React.useState(false)

  React.useEffect(() => {
    setUserRole(localStorage.getItem('userRole'))
    
    // Apply saved theme color
    const savedThemeHex = localStorage.getItem('themeAccentHex')
    if (savedThemeHex) {
      document.documentElement.style.setProperty('--color-accent', savedThemeHex)
    }
    
    let isMounted = true
    const fetchCount = async () => {
      try {
        const data = await getComplaints()
        if (isMounted && Array.isArray(data)) {
          setComplaintCount(data.length)
        }
      } catch (err) {
        console.error("Failed to load complaints count", err)
      }
    }

    fetchCount()
    const timer = setInterval(fetchCount, 3000)

    return () => {
      isMounted = false
      clearInterval(timer)
    }
  }, [])

  const NAV_ITEMS = NAV_ITEMS_TEMPLATE.map(section => {
    let newItems = section.items;
    
    // Filter out Add Customer if not admin
    if (section.label === 'ADMINISTRATION') {
      newItems = newItems.filter(item => !(item.label === 'Add Customer' && userRole !== 'admin'));
    }

    if (section.label === 'COMPLAINTS') {
      newItems = newItems.map(item => {
        if (item.label === 'All Complaints') {
          return { ...item, badge: complaintCount > 0 ? complaintCount.toString() : '' }
        }
        return item
      });
    }
    
    return { ...section, items: newItems };
  })

  const isPulseDesk = pathname === '/admin/pulsedesk';
  const isCollapsed = isPulseDesk && !isHovered;

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside 
        className="app-sidebar" 
        style={{ 
          width: isCollapsed ? '80px' : '208px', 
          background: isCollapsed ? 'transparent' : 'var(--color-bg-sidebar)',
          boxShadow: isCollapsed ? 'none' : '4px 0 24px rgba(0, 0, 0, 0.35)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
          zIndex: 50,
          overflowX: 'hidden',
          whiteSpace: 'nowrap'
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="sidebar-brand" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img 
            src="/dashboard-logo.png" 
            alt="Support"
            style={{ width: '40px', height: '40px', objectFit: 'contain', cursor: isPulseDesk ? 'pointer' : 'default', flexShrink: 0 }}
            onClick={() => { if(isPulseDesk) window.location.href='/admin' }}
          />
          <img 
            src="/resonova_logo_horizontal.png" 
            alt="Resonova Complaint Management System" 
            style={{ maxWidth: '120px', height: 'auto', objectFit: 'contain', transition: 'opacity 0.2s ease', opacity: isCollapsed ? 0 : 1 }} 
          />
        </div>

        <nav className="sidebar-nav" style={{ padding: '16px 12px', transition: 'opacity 0.2s ease', opacity: isCollapsed ? 0 : 1, pointerEvents: isCollapsed ? 'none' : 'auto' }}>
          {NAV_ITEMS.map((section) => (
            <React.Fragment key={section.label}>
              <div className="sidebar-section-title">
                {section.label}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || (item.href !== '/director' && pathname?.startsWith(item.href + '/'))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`sidebar-link ${isActive ? 'active' : ''}`}
                    style={{ position: 'relative', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}
                  >
                    <Icon style={{ flexShrink: 0 }} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.badge && (
                      <span className="sidebar-badge">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </React.Fragment>
          ))}
        </nav>

        {/* User at bottom */}
        <div style={{
          padding: '16px 20px',
          borderTop: isCollapsed ? 'none' : '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '12px',
          transition: 'opacity 0.2s ease, border 0.3s ease',
          opacity: isCollapsed ? 0 : 1,
          pointerEvents: isCollapsed ? 'none' : 'auto'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'var(--color-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '13px',
            color: 'white',
            textTransform: 'uppercase',
            flexShrink: 0
          }}>
            {userRole ? userRole.substring(0, 2) : 'ZA'}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', textTransform: 'capitalize' }}>
              {userRole === 'admin' ? 'Administrator' : userRole || 'Manager'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Online</div>
          </div>
          <button 
            onClick={() => {
              localStorage.removeItem('userRole');
              window.location.href = '/';
            }}
            title="Logout"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              padding: '4px',
              flexShrink: 0
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="app-main" style={{ marginLeft: isPulseDesk ? '0px' : '208px', transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
        {/* Top Bar */}
        {pathname !== '/admin/pulsedesk' && (
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
        )}

        {/* Page Content */}
        <main className="app-content">
          {children}
        </main>
      </div>
    </div>
  )
}
