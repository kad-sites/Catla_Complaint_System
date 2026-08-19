'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Inbox, TrendingUp, Clock, AlertTriangle, CheckCircle2,
  Users, ArrowUpRight, ArrowDownRight, Eye, MoreHorizontal, Filter, ArrowRight
} from 'lucide-react'
import { getComplaints } from '@/actions/complaintStore'
import { getUsers } from '@/actions/userStore'

const TICKETS: any[] = []


function PriorityDot({ priority }: { priority: string }) {
  const cls = priority === 'CRITICAL' ? 'critical' : priority === 'HIGH' ? 'high' : priority === 'MEDIUM' ? 'medium' : 'low'
  return <span className={`priority-dot ${cls}`} />
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string, label: string }> = {
    OPEN: { cls: 'open', label: 'Open' },
    ASSIGNED: { cls: 'assigned', label: 'Assigned' },
    IN_PROGRESS: { cls: 'in-progress', label: 'In Progress' },
    RESOLVED: { cls: 'resolved', label: 'Resolved' },
    BREACHED: { cls: 'breached', label: 'SLA Breached' },
  }
  const s = map[status] || map.OPEN
  return <span className={`status-badge ${s.cls}`}>{s.label}</span>
}

function CategoryBadge({ category }: { category: string }) {
  const map: Record<string, string> = {
    RESIDENTIAL: 'residential',
    COMMERCIAL: 'commercial',
    ENTERPRISE: 'enterprise',
    GOVERNMENT: 'government',
  }
  return <span className={`category-badge ${map[category] || 'residential'}`}>{category}</span>
}

export default function ClientPage({ initialComplaints, initialTechnicians }: { initialComplaints: any[], initialTechnicians: any[] }) {
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [complaints, setComplaints] = useState<any[]>(initialComplaints || [])
  const [technicians, setTechnicians] = useState<any[]>(initialTechnicians || [])
  const router = useRouter()

  const renderIssue = (ticket: any) => {
    const issueStr = ticket.issue || '';
    const cleanIssue = issueStr.replace(/\[REASSIGNED:.*?\]/g, '').trim();
    // Matches [REASSIGNED: reason] or [REASSIGNED: reason | oldTech]
    const reassignMatches = [...issueStr.matchAll(/\[REASSIGNED:\s*(.*?)(?:\s*\|\s*(.*?))?\]/g)];

    if (reassignMatches.length === 0) return cleanIssue;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div>{cleanIssue}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {reassignMatches.slice(0, 1).map((match, i) => {
            const reason = match[1];
            const oldTech = match[2] || 'Unknown Tech';
            const nextTech = ticket.tech;

            return (
              <div key={i} style={{ fontSize: '10px', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '2px solid #ef4444', padding: '4px 6px', borderRadius: '0 4px 4px 0' }}>
                <div style={{ color: '#ef4444', fontWeight: 600, marginBottom: '2px' }}>[Reassigned: {reason}]</div>
                <div style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {oldTech} <ArrowRight size={10} /> {nextTech}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Fetch live complaints & users
  useEffect(() => {
    let isMounted = true
    const fetchData = async () => {
      const data = await getComplaints()
      const users = await getUsers()
      if (isMounted) {
        setComplaints(prev => {
          return JSON.stringify(prev) === JSON.stringify(data) ? prev : data;
        })
        setTechnicians(prev => {
          const next = users.filter((u: any) => u.role === 'TECHNICIAN' && u.active !== false)
          return JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
        })
      }
    }
    fetchData()
    const interval = setInterval(fetchData, 4000)
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  // Press Enter anywhere (outside inputs) to open New Complaint
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.key === 'Enter') {
        e.preventDefault()
        router.push('/operator')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [router])

  const filteredTickets = complaints.filter(t => {
    if (statusFilter === 'ALL') return t.status !== 'RESOLVED' && t.status !== 'CLOSED';
    if (statusFilter === 'OPEN') return t.status === 'OPEN' || t.status === 'REJECTED';
    if (statusFilter === 'IN_PROGRESS') return t.status === 'IN_PROGRESS' || t.status === 'ASSIGNED' || t.status === 'WORKING' || t.status === 'PREMIUM';
    return t.status === statusFilter;
  });

  return (
    <>
      <div className="animate-fade-in">
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '16px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
              Dashboard
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
              Real-time complaint monitoring &amp; network operations
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary btn-sm">
              <Filter size={14} /> Filter
            </button>
            <style>{`
              @keyframes blink-border {
                0% { 
                  box-shadow: 0 0 5px #0ea5e9;
                  border-color: #0ea5e9;
                }
                50% { 
                  box-shadow: 0 0 15px #38bdf8, inset 0 0 5px #38bdf8;
                  border-color: #38bdf8;
                  background-color: rgba(2, 132, 199, 0.9);
                }
                100% { 
                  box-shadow: 0 0 5px #0ea5e9;
                  border-color: #0ea5e9;
                }
              }
              .blink-button {
                animation: blink-border 1.6s infinite ease-in-out;
                border: 2px solid #0ea5e9 !important;
                font-weight: 600 !important;
                transition: none; /* override btn transition to let animation play smoothly */
              }
            `}</style>
            <button 
              className="btn btn-primary btn-sm blink-button"
              onClick={() => router.push('/operator')}
            >
              + New Complaint
            </button>
          </div>
        </div>

        {/* KPI Row */}
        <div className="kpi-grid" style={{ marginBottom: '16px' }}>
          <div className="kpi-card blue">
            <div className="kpi-card-icon"><Inbox size={20} /></div>
            <div className="kpi-card-label">Today&apos;s Received</div>
            <div className="kpi-card-value">{complaints.length}</div>
          </div>
          <div className="kpi-card yellow">
            <div className="kpi-card-icon"><Clock size={20} /></div>
            <div className="kpi-card-label">In Progress</div>
            <div className="kpi-card-value">{complaints.filter(c => c.status === 'IN_PROGRESS' || c.status === 'ASSIGNED').length}</div>
          </div>
          <div className="kpi-card purple">
            <div className="kpi-card-icon"><Users size={20} /></div>
            <div className="kpi-card-label">Pending Assignment</div>
            <div className="kpi-card-value">{complaints.filter(c => c.status === 'OPEN').length}</div>
          </div>
          <div className="kpi-card green">
            <div className="kpi-card-icon"><CheckCircle2 size={20} /></div>
            <div className="kpi-card-label">Resolved Today</div>
            <div className="kpi-card-value">{complaints.filter(c => c.status === 'RESOLVED').length}</div>
          </div>
          <div className="kpi-card red">
            <div className="kpi-card-icon"><AlertTriangle size={20} /></div>
            <div className="kpi-card-label">SLA Breached</div>
            <div className="kpi-card-value">{complaints.filter(c => c.status === 'BREACHED').length}</div>
            <span className="kpi-card-change up" style={{ color: 'var(--color-danger)' }}>
              <AlertTriangle size={14} /> Needs attention
            </span>
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>

          {/* Ticket Table */}
          <div className="data-card" style={{ gridColumn: 'span 4' }}>
            <div className="data-card-header">
              <div className="data-card-title">
                <Inbox size={16} /> Active Complaints
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['ALL', 'OPEN', 'IN_PROGRESS', 'BREACHED'].map(f => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className="btn btn-sm"
                    style={{
                      padding: '4px 10px',
                      fontSize: '11px',
                      background: statusFilter === f ? 'rgba(14, 165, 233, 0.15)' : 'transparent',
                      color: statusFilter === f ? 'var(--color-accent)' : 'var(--color-text-muted)',
                      border: statusFilter === f ? '1px solid rgba(14, 165, 233, 0.3)' : '1px solid transparent',
                      borderRadius: '6px',
                    }}
                  >
                    {f === 'ALL' ? 'All' : f === 'IN_PROGRESS' ? 'Working' : f === 'BREACHED' ? 'Breached' : 'Open'}
                  </button>
                ))}
              </div>
            </div>
            <div className="data-card-body">
              <table className="ticket-table">
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>Customer</th>
                    <th>Issue</th>
                    <th>Priority</th>
                    <th>SLA Left</th>
                    <th>Technician</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map(t => (
                    <tr key={t.id}>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--color-accent)' }}>{t.id}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '13px' }}>{t.customer}</span>
                          <CategoryBadge category={t.category} />
                        </div>
                      </td>
                      <td style={{ maxWidth: '180px' }}>
                        <span style={{ fontSize: '12px' }}>{renderIssue(t)}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <PriorityDot priority={t.priority} />
                          <span style={{ fontSize: '12px', fontWeight: 600 }}>{t.priority}</span>
                        </div>
                      </td>
                      <td>
                        {t.status !== 'RESOLVED' ? (
                          <div>
                            <span style={{
                              fontSize: '13px',
                              fontWeight: 700,
                              color: t.slaPercent > 80 ? 'var(--color-danger)' : t.slaPercent > 50 ? 'var(--color-warning)' : 'var(--color-text-primary)'
                            }}>{t.sla}</span>
                            <div className="progress-bar" style={{ marginTop: '4px', width: '80px' }}>
                              <div
                                className={`progress-bar-fill ${t.slaPercent > 80 ? 'red' : t.slaPercent > 50 ? 'yellow' : 'green'}`}
                                style={{ width: `${t.slaPercent}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--color-success)', fontSize: '12px', fontWeight: 600 }}>✓ Done</span>
                        )}
                      </td>
                      <td style={{ fontSize: '12px' }}>{t.tech}</td>
                      <td><StatusBadge status={t.status} /></td>
                      <td>
                        <button style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--color-text-muted)',
                          padding: '4px'
                        }}>
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', gridColumn: 'span 1' }}>

            {/* Status Breakdown */}
            <div className="data-card">
              <div className="data-card-header">
                <div className="data-card-title">Status Breakdown</div>
              </div>
              <div className="data-card-body" style={{ padding: '20px' }}>
                {(() => {
                  const open = complaints.filter(c => c.status === 'OPEN').length
                  const prog = complaints.filter(c => c.status === 'IN_PROGRESS' || c.status === 'ASSIGNED').length
                  const res = complaints.filter(c => c.status === 'RESOLVED').length
                  const brc = complaints.filter(c => c.status === 'BREACHED').length
                  const total = complaints.length || 1

                  const stats = [
                    { label: 'Open', count: open, color: '#3b82f6', pct: Math.round((open/total)*100) },
                    { label: 'In Progress', count: prog, color: '#f59e0b', pct: Math.round((prog/total)*100) },
                    { label: 'Resolved', count: res, color: '#10b981', pct: Math.round((res/total)*100) },
                    { label: 'Breached', count: brc, color: '#ef4444', pct: Math.round((brc/total)*100) },
                  ]

                  return (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                        <div className="donut-chart" style={{
                          background: complaints.length === 0 ? '#1e293b' : `conic-gradient(
                            #3b82f6 0deg ${stats[0].pct * 3.6}deg,
                            #f59e0b ${stats[0].pct * 3.6}deg ${(stats[0].pct + stats[1].pct) * 3.6}deg,
                            #10b981 ${(stats[0].pct + stats[1].pct) * 3.6}deg ${(stats[0].pct + stats[1].pct + stats[2].pct) * 3.6}deg,
                            #ef4444 ${(stats[0].pct + stats[1].pct + stats[2].pct) * 3.6}deg 360deg
                          )`
                        }}>
                          <div className="donut-center">
                            <div className="donut-center-value">{complaints.length}</div>
                            <div className="donut-center-label">Total</div>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {stats.map(s => (
                          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
                            <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: s.color, flexShrink: 0 }} />
                            <span style={{ flex: 1, color: 'var(--color-text-secondary)' }}>{s.label}</span>
                            <span style={{ fontWeight: 700, color: 'var(--color-text-primary)', minWidth: '24px' }}>{s.count}</span>
                            <span style={{ color: 'var(--color-text-muted)', fontSize: '11px', minWidth: '30px' }}>{s.pct}%</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )
                })()}
              </div>
            </div>

            {/* Technician Scoreboard */}
            <div className="data-card">
              <div className="data-card-header">
                <div className="data-card-title">
                  <Users size={16} /> Technician Scoreboard
                </div>
              </div>
              <div className="data-card-body" style={{ padding: '12px 0' }}>
                {technicians.map(tech => ({
                  ...tech,
                  resolved: complaints.filter(c => c.tech === tech.name && c.status === 'RESOLVED').length,
                  active: complaints.filter(c => c.tech === tech.name && c.status !== 'RESOLVED' && c.status !== 'OPEN').length,
                  avgTime: '0.0h',
                  status: 'online' // or compute from recent activity
                })).map((tech, i) => (
                  <div key={tech.name} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 16px',
                    borderBottom: i < technicians.length - 1 ? '1px solid rgba(30, 41, 59, 0.4)' : 'none',
                    transition: 'background 0.15s ease',
                  }}>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: tech.status === 'online' ? '#10b981' : tech.status === 'busy' ? '#f59e0b' : '#64748b',
                      boxShadow: tech.status === 'online' ? '0 0 6px rgba(16, 185, 129, 0.4)' : 'none',
                      flexShrink: 0
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{tech.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{tech.active} active jobs</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-success)' }}>✓ {tech.resolved}</div>
                      <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>avg {tech.avgTime}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 30-Day Trends */}
            <div className="data-card">
              <div className="data-card-header">
                <div className="data-card-title">
                  <TrendingUp size={16} /> 30-Day Trends
                </div>
              </div>
              <div className="data-card-body" style={{ padding: '16px 20px' }}>
                {[
                  { label: 'Avg Resolution Time', value: '—', color: 'var(--color-text-primary)' },
                  { label: 'First-Fix Rate', value: '—', color: 'var(--color-text-muted)' },
                  { label: 'SLA Compliance', value: '100%', color: 'var(--color-success)' },
                  { label: 'Top Issue', value: '—', color: 'var(--color-text-muted)' },
                  { label: 'Peak Hour', value: '—', color: 'var(--color-text-muted)' },
                ].map((item, i) => (
                  <div key={item.label} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: i < 4 ? '1px solid rgba(30, 41, 59, 0.3)' : 'none',
                    fontSize: '12px',
                  }}>
                    <span style={{ color: 'var(--color-text-muted)' }}>{item.label}</span>
                    <span style={{ fontWeight: 700, color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
