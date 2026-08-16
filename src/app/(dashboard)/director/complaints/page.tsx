'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, Filter, Clock, AlertTriangle, CheckCircle2,
  ChevronDown, Eye, MoreHorizontal, MapPin, Phone, ArrowUpDown, X, ArrowRight
} from 'lucide-react'
import { getComplaints, updateComplaint, deleteComplaint } from '@/actions/complaintStore'
import { getUsers } from '@/actions/userStore'
import { sendTelegramAlert } from '@/actions/sendTelegramAlert'

type Complaint = {
  id: string
  customer: string
  category: string
  issue: string
  priority: string
  sla: string
  slaPercent: number
  tech: string
  status: string
  time: string
  phone: string
  address: string
  createdAt?: number
  slaHours?: number
  assignedAt?: number
  techAccepted?: boolean
  previousAssignments?: { tech: string, reassignedAt: number }[]
}

const STATIC_COMPLAINTS: Complaint[] = []

function PriorityDot({ priority }: { priority: string }) {
  const cls = priority === 'CRITICAL' ? 'critical' : priority === 'HIGH' ? 'high' : priority === 'MEDIUM' ? 'medium' : 'low'
  return <span className={`priority-dot ${cls}`} />
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string, label: string }> = {
    OPEN: { cls: 'open', label: 'Open' },
    ASSIGNED: { cls: 'assigned', label: 'Assigned' },
    IN_PROGRESS: { cls: 'in-progress', label: 'In Progress' },
    WORKING: { cls: 'accepted', label: 'Accepted' },
    RESOLVED: { cls: 'resolved', label: 'Resolved' },
    BREACHED: { cls: 'breached', label: 'SLA Breached' },
    REJECTED: { cls: 'breached', label: 'Rejected' },
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

export default function ComplaintsDirectory() {
  const router = useRouter()
  const [complaints, setComplaints] = useState<Complaint[]>(STATIC_COMPLAINTS)
  const [technicians, setTechnicians] = useState<any[]>([])
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [reassigningId, setReassigningId] = useState<string | null>(null)
  const [reassignState, setReassignState] = useState<{ id: string, tech: string, reason: string } | null>(null)
  const [now, setNow] = useState(Date.now())
  const [userRole, setUserRole] = useState<string | null>(null)
  const lastMutationTime = React.useRef<number>(0)

  // Press Enter anywhere (outside inputs) to open New Complaint
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setReassignState(null)
        setExpandedId(null)
        return
      }

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

  // Timer for dynamic timelapse and role check
  useEffect(() => {
    setUserRole(localStorage.getItem('userRole'))
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Poll server store for complaints and technicians
  useEffect(() => {
    let isMounted = true
    const loadFromStore = async () => {
      const fetchStartTime = Date.now()
      try {
        const [stored, users] = await Promise.all([
          getComplaints(),
          getUsers()
        ])
        if (isMounted && fetchStartTime >= lastMutationTime.current) {
          setComplaints([...stored, ...STATIC_COMPLAINTS])
          setTechnicians(users.filter((u: any) => u.role === 'TECHNICIAN' && u.active))
        }
      } catch {}
    }
    
    loadFromStore()
    const timer = setInterval(loadFromStore, 3000)
    return () => {
      isMounted = false
      clearInterval(timer)
    }
  }, [])

  const handleAssign = async (ticketId: string, techName: string, reason?: string) => {
    const ticket = complaints.find(t => t.id === ticketId)
    if (!ticket) return

    // Lock out incoming polls from overwriting our optimistic state
    lastMutationTime.current = Date.now() + 60000 
    const nowTime = Date.now()
    const isReassignment = ticket.tech && ticket.tech !== 'Unassigned' && ticket.tech !== techName;
    
    let newIssue = ticket.issue;
    if (isReassignment) {
      newIssue = `[REASSIGNED: ${reason || 'Unknown'} | ${ticket.tech}] ` + newIssue;
    }

    // Optimistic update
    const newStatus = (ticket.status === 'OPEN' || ticket.status === 'REJECTED' || isReassignment) ? 'ASSIGNED' : ticket.status;
    const updatedComplaints = complaints.map(t => 
      t.id === ticketId ? { 
        ...t, 
        tech: techName, 
        status: newStatus, 
        issue: newIssue,
        assignedAt: nowTime, 
        techAccepted: false
      } : t
    )
    setComplaints(updatedComplaints)
    setReassigningId(null)

    // Ensure we only send fields that exist in the Supabase UIComplaint table
    const res = await updateComplaint(ticketId, {
      tech: techName,
      status: newStatus,
      issue: newIssue
    })

    // Release the lock by setting it to the exact time the mutation finished.
    // Any poll that started BEFORE this exact moment will be ignored.
    lastMutationTime.current = Date.now()

    if (res.success) {
      // Send Telegram alert in background
      const isPremium = ['COMMERCIAL', 'ENTERPRISE', 'GOVERNMENT'].includes(ticket.category?.toUpperCase() || '');
      const premiumBadge = isPremium ? `\n👑 <b>[ VIP / PREMIUM CUSTOMER ]</b>` : '';
      const telegramMessage = `👨‍🔧 <b>Task Assigned</b>${premiumBadge}\n\nTicket: ${ticket.id}\nCustomer: ${ticket.customer} (${ticket.category})\nAddress: ${ticket.address}\nAssigned To: <code>${techName}</code>\nStatus: ${newStatus}`;
      sendTelegramAlert(telegramMessage);

      // Send Firebase Push Notification
      const pushMessage = `Ticket ${ticket.id} assigned to ${techName} at ${ticket.address}`;
      import('@/actions/sendPushNotification').then(m => m.sendPushNotification(ticket.id, pushMessage));
    } else {
      console.error('Failed to assign in DB:', res.error);
    }
  }

  const handleDelete = async (ticketId: string) => {
    if (window.confirm('Are you sure you want to delete this complaint? This action cannot be undone.')) {
      const res = await deleteComplaint(ticketId);
      if (res.success) {
        setComplaints(complaints.filter(c => c.id !== ticketId));
      } else {
        console.error('Failed to delete complaint:', res.error);
        alert('Failed to delete complaint.');
      }
    }
  }

  const filtered = complaints
    .filter(t => {
      if (statusFilter === 'ALL') return true;
      if (statusFilter === 'OPEN') return t.status === 'OPEN' || t.status === 'REJECTED';
      if (statusFilter === 'IN_PROGRESS') return t.status === 'IN_PROGRESS' || t.status === 'ASSIGNED' || t.status === 'WORKING';
      if (statusFilter === 'PREMIUM') return t.status !== 'RESOLVED' && ['COMMERCIAL', 'ENTERPRISE', 'GOVERNMENT'].includes(t.category?.toUpperCase() || '');
      return t.status === statusFilter;
    })
    .filter(t => {
      if (!searchQuery) return true
      const q = searchQuery.toLowerCase()
      return t.id.toLowerCase().includes(q) ||
        t.customer.toLowerCase().includes(q) ||
        t.issue.toLowerCase().includes(q) ||
        t.phone.includes(q)
    })

  const counts: Record<string, number> = {
    ALL: complaints.length,
    OPEN: complaints.filter(t => t.status === 'OPEN' || t.status === 'REJECTED').length,
    IN_PROGRESS: complaints.filter(t => t.status === 'IN_PROGRESS' || t.status === 'ASSIGNED' || t.status === 'WORKING').length,
    RESOLVED: complaints.filter(t => t.status === 'RESOLVED').length,
    BREACHED: complaints.filter(t => t.status === 'BREACHED').length,
    PREMIUM: complaints.filter(t => t.status !== 'RESOLVED' && ['COMMERCIAL', 'ENTERPRISE', 'GOVERNMENT'].includes(t.category?.toUpperCase() || '')).length,
  }

  const renderIssue = (ticket: Complaint) => {
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

  return (
    <>
      <div className="animate-fade-in">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
              All Complaints
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
              {complaints.length} total · {counts.OPEN} open · {counts.BREACHED} breached
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <style>{`
              @keyframes blink-border {
                0% { box-shadow: 0 0 5px #0ea5e9; border-color: #0ea5e9; }
                50% { box-shadow: 0 0 15px #38bdf8, inset 0 0 5px #38bdf8; border-color: #38bdf8; background-color: rgba(2, 132, 199, 0.9); }
                100% { box-shadow: 0 0 5px #0ea5e9; border-color: #0ea5e9; }
              }
              .blink-button {
                animation: blink-border 1.6s infinite ease-in-out;
                border: 2px solid #0ea5e9 !important;
                font-weight: 600 !important;
                transition: none;
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

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by ID, name, issue, phone..."
              className="form-input"
              style={{ paddingLeft: '36px', height: '40px', fontSize: '13px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'BREACHED', 'PREMIUM'] as const).map(s => {
              const isPremium = s === 'PREMIUM';
              const pCount = counts['PREMIUM'] ?? 0;
              const premiumStyle = isPremium ? {
                background: statusFilter === s ? 'rgba(239, 68, 68, 0.9)' : 'rgba(239, 68, 68, 0.15)',
                color: statusFilter === s ? '#fff' : '#ef4444',
                borderColor: 'rgba(239, 68, 68, 0.5)',
                animation: pCount > 0 ? 'premium-glow 2s infinite ease-in-out' : 'none'
              } : {};

              return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`btn btn-sm ${statusFilter === s && !isPremium ? 'btn-primary' : !isPremium ? 'btn-secondary' : ''}`}
                style={{ fontSize: '11px', position: 'relative', ...premiumStyle }}
              >
                {s === 'ALL' ? 'All' : s === 'IN_PROGRESS' ? 'Working' : s === 'PREMIUM' ? 'Premium' : s.charAt(0) + s.slice(1).toLowerCase()}
                <span style={{
                  marginLeft: '6px', padding: '1px 6px', borderRadius: '10px',
                  background: statusFilter === s ? 'rgba(255,255,255,0.2)' : 'rgba(100,116,139,0.2)',
                  fontSize: '10px',
                }}>{counts[s] ?? 0}</span>
              </button>
            )})}
          </div>
        </div>

        {/* Table */}
        <div className="data-card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {['TICKET', 'CUSTOMER', 'ISSUE', 'PRIORITY', 'ELAPSED / SLA', 'TECHNICIAN', 'STATUS', ''].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: 'left',
                    fontSize: '10px', fontWeight: 600,
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase', letterSpacing: '1px',
                    background: 'var(--color-bg-surface)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(ticket => (
                <React.Fragment key={ticket.id}>
                  <tr
                    onClick={() => setExpandedId(expandedId === ticket.id ? null : ticket.id)}
                    style={{
                      borderBottom: '1px solid var(--color-border)',
                      cursor: 'pointer',
                      background: expandedId === ticket.id ? 'rgba(14, 165, 233, 0.05)' : 'transparent',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { if (expandedId !== ticket.id) e.currentTarget.style.background = 'var(--color-bg-hover)' }}
                    onMouseLeave={e => { if (expandedId !== ticket.id) e.currentTarget.style.background = 'transparent' }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#0ea5e9' }}>{ticket.id}</span>
                      <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{ticket.time}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600 }}>{ticket.customer}</div>
                      <CategoryBadge category={ticket.category} />
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', maxWidth: '200px' }}>{renderIssue(ticket)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <PriorityDot priority={ticket.priority} />
                        {ticket.priority}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {(() => {
                        if (ticket.createdAt && ticket.slaHours) {
                          const elapsedMs = now - ticket.createdAt;
                          const slaMs = ticket.slaHours * 3600000;
                          const isBreached = elapsedMs > slaMs;
                          const secs = Math.floor(elapsedMs / 1000);
                          const h = Math.floor(secs / 3600);
                          const m = Math.floor((secs % 3600) / 60);
                          const s = secs % 60;
                          const elapsedStr = (h > 0 ? `${h}h ` : '') + (m > 0 ? `${m}m ` : '') + `${s}s`;
                          
                          return (
                            <div className={isBreached ? 'animate-pulse' : ''} style={{
                              fontWeight: 700,
                              color: isBreached ? 'var(--color-danger)' : 'var(--color-text-primary)'
                            }}>
                              <div style={{ fontSize: '13px' }}>{elapsedStr}</div>
                              <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 400 }}>SLA: {ticket.slaHours}h</div>
                            </div>
                          )
                        } else {
                          // Fallback for static mock data
                          return (
                            <span style={{
                              fontWeight: 700,
                              color: ticket.slaPercent > 80 ? 'var(--color-danger)' : ticket.slaPercent > 50 ? 'var(--color-warning)' : 'var(--color-text-primary)',
                            }}>{ticket.sla}</span>
                          )
                        }
                      })()}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {ticket.tech === 'Unassigned' ? (
                        <select
                          onClick={e => e.stopPropagation()}
                          onChange={e => handleAssign(ticket.id, e.target.value)}
                          className="form-input"
                          style={{ padding: '4px 8px', fontSize: '11px', height: 'auto', minWidth: '110px' }}
                          value=""
                        >
                          <option value="" disabled>Assign Tech...</option>
                          {technicians.length === 0 && <option disabled>Loading...</option>}
                          {technicians.map(tech => (
                            <option key={tech.id} value={tech.name}>{tech.name}</option>
                          ))}
                        </select>
                      ) : (
                        <div 
                          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '4px', borderRadius: '4px', margin: '-4px' }}
                          onClick={e => { e.stopPropagation(); setReassignState({ id: ticket.id, tech: '', reason: '' }) }}
                          title="Click to reassign"
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          {(() => {
                            if (ticket.techAccepted) {
                              return <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>{ticket.tech} ✓</span>
                            }
                            if (ticket.assignedAt) {
                              const waitMs = now - ticket.assignedAt
                              // > 15 mins = red, > 5 mins = yellow, else blue
                              const waitColor = waitMs > 15 * 60000 ? 'var(--color-danger)' : waitMs > 5 * 60000 ? 'var(--color-warning)' : '#3b82f6'
                              return (
                                <span style={{ color: waitColor, fontWeight: 600 }}>{ticket.tech}</span>
                              )
                            }
                            return <span style={{ color: 'var(--color-text-primary)' }}>{ticket.tech}</span>
                          })()}
                          
                          {(!ticket.techAccepted && ticket.assignedAt) && (
                            <a 
                              href={`https://wa.me/?text=Please%20accept%20job%20${ticket.id}%20by%20opening%20CATLA%20APP.`} 
                              target="_blank" rel="noreferrer"
                              title="Message Technician"
                              onClick={e => e.stopPropagation()}
                              style={{ display: 'flex', alignItems: 'center', color: '#22c55e' }}
                            >
                              <Phone size={14} />
                            </a>
                          )}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px' }}><StatusBadge status={ticket.status} /></td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Eye size={14} style={{ color: 'var(--color-text-muted)' }} />
                        {userRole === 'admin' && (
                          <div 
                            onClick={(e) => { e.stopPropagation(); handleDelete(ticket.id); }}
                            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Delete Complaint (Admin Only)"
                          >
                            <X size={14} style={{ color: 'var(--color-danger)' }} />
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Detail Row */}
                  {expandedId === ticket.id && (
                    <tr style={{ background: 'rgba(14, 165, 233, 0.03)' }}>
                      <td colSpan={8} style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', gap: '24px', fontSize: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-muted)' }}>
                            <Phone size={13} />
                            <a href={`tel:${ticket.phone}`} style={{ color: '#0ea5e9', textDecoration: 'none' }}>{ticket.phone}</a>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-muted)' }}>
                            <MapPin size={13} />
                            {ticket.address}
                          </div>
                          {ticket.slaPercent > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>SLA:</span>
                              <div className="progress-bar" style={{ width: '100px', height: '6px' }}>
                                <div
                                  className={`progress-bar-fill ${ticket.slaPercent > 80 ? 'red' : ticket.slaPercent > 50 ? 'yellow' : 'green'}`}
                                  style={{ width: `${ticket.slaPercent}%` }}
                                />
                              </div>
                              <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{ticket.slaPercent}%</span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '14px' }}>
              No complaints match your filters.
            </div>
          )}
        </div>
      </div>

      {/* Reassign Modal */}
      {reassignState && (
        <div 
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999
          }}
          onClick={() => setReassignState(null)}
        >
          <div 
            style={{
              background: '#0f172a', padding: '24px', borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)', width: '400px', maxWidth: '90%',
              display: 'flex', flexDirection: 'column', gap: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
              Reassign Technician
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: '-8px 0 0 0' }}>
              Select a new technician and provide a reason.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>New Technician</label>
              <select 
                className="form-input" 
                value={reassignState.tech}
                onChange={e => setReassignState({ ...reassignState, tech: e.target.value })}
              >
                <option value="" disabled>Select New Tech...</option>
                {technicians.filter(t => t.name !== complaints.find(c => c.id === reassignState.id)?.tech).map(tech => (
                  <option key={tech.id} value={tech.name}>{tech.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Reason for Change</label>
              <select 
                className="form-input" 
                value={reassignState.reason}
                onChange={e => setReassignState({ ...reassignState, reason: e.target.value })}
              >
                <option value="" disabled>Select Reason...</option>
                <option value="Technician Unavailable">Technician Unavailable</option>
                <option value="Customer Request">Customer Request</option>
                <option value="Skill Mismatch">Skill Mismatch</option>
                <option value="Delay in Arrival">Delay in Arrival</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button 
                className="btn btn-secondary" 
                style={{ flex: 1 }} 
                onClick={() => setReassignState(null)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1 }} 
                onClick={() => {
                  if (reassignState.tech && reassignState.reason) {
                    handleAssign(reassignState.id, reassignState.tech, reassignState.reason);
                    setReassignState(null);
                  }
                }}
                disabled={!reassignState.tech || !reassignState.reason}
              >
                Confirm Reassignment
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
