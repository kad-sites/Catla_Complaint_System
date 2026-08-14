'use client'

import React, { useState, useEffect } from 'react'
import AppShell from '@/components/AppShell'
import {
  Search, Filter, Clock, AlertTriangle, CheckCircle2,
  ChevronDown, Eye, MoreHorizontal, MapPin, Phone, ArrowUpDown, X
} from 'lucide-react'
import { sendAssignmentSMS } from '@/actions/sendAssignmentSMS'
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

export default function AllComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>(STATIC_COMPLAINTS)
  const [technicians, setTechnicians] = useState<any[]>([])
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [reassigningId, setReassigningId] = useState<string | null>(null)
  const [now, setNow] = useState(Date.now())
  const [userRole, setUserRole] = useState<string | null>(null)

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
      try {
        const [stored, users] = await Promise.all([
          getComplaints(),
          getUsers()
        ])
        if (isMounted) {
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

  const handleAssign = async (ticketId: string, techName: string) => {
    const ticket = complaints.find(t => t.id === ticketId)
    if (!ticket) return

    const nowTime = Date.now()
    
    const isReassignment = ticket.tech && ticket.tech !== 'Unassigned' && ticket.tech !== techName;
    const newPrevious = ticket.previousAssignments ? [...ticket.previousAssignments] : [];
    
    if (isReassignment && ticket.techAccepted) {
      newPrevious.push({ tech: ticket.tech, reassignedAt: nowTime })
    }
    
    // Optimistic update
    const newStatus = (ticket.status === 'OPEN' || ticket.status === 'REJECTED') ? 'ASSIGNED' : ticket.status;
    const updatedComplaints = complaints.map(t => 
      t.id === ticketId ? { 
        ...t, 
        tech: techName, 
        status: newStatus, 
        assignedAt: nowTime, 
        techAccepted: false,
        previousAssignments: newPrevious
      } : t
    )
    setComplaints(updatedComplaints)
    setReassigningId(null)

    // Ensure we only send fields that exist in the Supabase UIComplaint table
    const res = await updateComplaint(ticketId, {
      tech: techName,
      status: newStatus
    })

    if (res.success) {
      // Send Telegram alert in background
      const telegramMessage = `👨‍🔧 <b>Task Assigned</b>\n\n<b>Ticket:</b> ${ticket.id}\n<b>Customer:</b> ${ticket.customer}\n<b>Address:</b> ${ticket.address}\n<b>Assigned To:</b> ${techName}\n<b>Status:</b> ${newStatus}`;
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

  const counts = {
    ALL: complaints.length,
    OPEN: complaints.filter(t => t.status === 'OPEN' || t.status === 'REJECTED').length,
    IN_PROGRESS: complaints.filter(t => t.status === 'IN_PROGRESS' || t.status === 'ASSIGNED' || t.status === 'WORKING').length,
    RESOLVED: complaints.filter(t => t.status === 'RESOLVED').length,
    BREACHED: complaints.filter(t => t.status === 'BREACHED').length,
  }

  return (
    <AppShell role="DIRECTOR">
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
            {(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'BREACHED'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '11px', position: 'relative' }}
              >
                {s === 'ALL' ? 'All' : s === 'IN_PROGRESS' ? 'Working' : s.charAt(0) + s.slice(1).toLowerCase()}
                <span style={{
                  marginLeft: '6px', padding: '1px 6px', borderRadius: '10px',
                  background: statusFilter === s ? 'rgba(255,255,255,0.2)' : 'rgba(100,116,139,0.2)',
                  fontSize: '10px',
                }}>{counts[s] ?? 0}</span>
              </button>
            ))}
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
                    <td style={{ padding: '12px 16px', color: 'var(--color-text-secondary)', maxWidth: '200px' }}>{ticket.issue}</td>
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
                      {(ticket.tech === 'Unassigned' || reassigningId === ticket.id) ? (
                        <select
                          onClick={e => e.stopPropagation()}
                          onChange={e => handleAssign(ticket.id, e.target.value)}
                          onBlur={() => setReassigningId(null)}
                          className="form-input"
                          style={{ padding: '4px 8px', fontSize: '11px', height: 'auto', minWidth: '110px' }}
                          value={ticket.tech !== 'Unassigned' ? ticket.tech : ""}
                          autoFocus={reassigningId === ticket.id}
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
                          onClick={e => { e.stopPropagation(); setReassigningId(ticket.id) }}
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
    </AppShell>
  )
}
