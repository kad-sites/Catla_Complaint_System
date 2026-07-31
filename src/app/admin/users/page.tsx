'use client'

import React, { useState } from 'react'
import AppShell from '@/components/AppShell'
import {
  Search, Filter, Plus, MoreHorizontal, UserCheck, UserX, User,
  Mail, Phone, MapPin, Edit, Trash2, CheckCircle2, X, ChevronDown, ChevronUp
} from 'lucide-react'
import { getComplaints } from '@/actions/complaintStore'

type StaffRole = 'Manager' | 'Operator' | 'Technician'
type StaffStatus = 'Active' | 'Inactive' | 'On Leave'

type StaffMember = {
  id: string
  name: string
  role: StaffRole
  email: string
  phone: string
  status: StaffStatus
  zone: string
  lastActive: string
  avatar: string
}

const MOCK_STAFF: StaffMember[] = [
  { id: 'STF-001', name: 'Zoheb Aziz', role: 'Manager', email: 'zoheb@catlabroadband.com', phone: '+91 98765 43210', status: 'Active', zone: 'Head Office', lastActive: 'Just now', avatar: 'ZA' },
  { id: 'STF-002', name: 'Amit Singh', role: 'Technician', email: 'amit@catlabroadband.com', phone: '+91 91234 56789', status: 'Active', zone: 'Guwahati South', lastActive: '2m ago', avatar: 'AS' },
  { id: 'STF-003', name: 'Priya Sharma', role: 'Operator', email: 'priya@catlabroadband.com', phone: '+91 99887 76655', status: 'Active', zone: 'NOC Desk 1', lastActive: '5m ago', avatar: 'PS' },
  { id: 'STF-004', name: 'Suresh Pal', role: 'Technician', email: 'suresh@catlabroadband.com', phone: '+91 98711 22334', status: 'On Leave', zone: 'Guwahati East', lastActive: 'Yesterday', avatar: 'SP' },
  { id: 'STF-005', name: 'Vikram Jha', role: 'Technician', email: 'vikram@catlabroadband.com', phone: '+91 99988 77766', status: 'Active', zone: 'Guwahati North', lastActive: '12m ago', avatar: 'VJ' },
  { id: 'STF-006', name: 'Ravi Kumar', role: 'Technician', email: 'ravi@catlabroadband.com', phone: '+91 91111 22222', status: 'Inactive', zone: 'Guwahati West', lastActive: '1w ago', avatar: 'RK' },
]

function RoleBadge({ role }: { role: StaffRole }) {
  const styles: Record<StaffRole, string> = {
    Manager: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    Operator: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Technician: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  }
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[role]}`}>
      {role}
    </span>
  )
}

function StatusBadge({ status }: { status: StaffStatus }) {
  const styles: Record<StaffStatus, string> = {
    Active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Inactive: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    'On Leave': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  }
  const icons = {
    Active: <UserCheck size={12} className="mr-1" />,
    Inactive: <UserX size={12} className="mr-1" />,
    'On Leave': <User size={12} className="mr-1" />,
  }
  return (
    <span className={`flex items-center w-fit px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status]}`}>
      {icons[status]} {status}
    </span>
  )
}

export default function StaffManagement() {
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('All')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [complaints, setComplaints] = useState<any[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const loadFromStore = async () => {
      try {
        const stored = await getComplaints()
        if (isMounted) setComplaints(stored)
      } catch {}
    }
    
    loadFromStore()
    const timer = setInterval(loadFromStore, 3000)
    return () => {
      isMounted = false
      clearInterval(timer)
    }
  }, [])

  const filteredStaff = MOCK_STAFF.filter(s => {
    if (roleFilter !== 'All' && s.role !== roleFilter) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.phone.includes(q)
    }
    return true
  })

  return (
    <AppShell>
      <div className="animate-fade-in" style={{ padding: '0', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              Staff Management
              <span style={{
                background: 'rgba(14, 165, 233, 0.15)', color: 'var(--color-accent)',
                fontSize: '13px', padding: '4px 12px', borderRadius: '20px', border: '1px solid rgba(14, 165, 233, 0.3)'
              }}>
                {MOCK_STAFF.length} Total
              </span>
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Manage user roles, access levels, and team assignments.</p>
          </div>
          
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '14px' }}
          >
            <Plus size={18} />
            Add New Staff
          </button>
        </div>

        {/* Stats Row */}
        <div className="kpi-grid" style={{ marginBottom: '24px' }}>
          {[
            { label: 'Total Active', value: MOCK_STAFF.filter(s => s.status === 'Active').length, color: 'green', icon: <UserCheck size={24} /> },
            { label: 'Technicians', value: MOCK_STAFF.filter(s => s.role === 'Technician').length, color: 'blue', icon: <Users size={24} /> },
            { label: 'Operators', value: MOCK_STAFF.filter(s => s.role === 'Operator').length, color: 'purple', icon: <Users size={24} /> },
            { label: 'On Leave', value: MOCK_STAFF.filter(s => s.status === 'On Leave').length, color: 'yellow', icon: <User size={24} /> },
          ].map((stat, i) => (
            <div key={i} className={`kpi-card ${stat.color}`}>
              <div className="kpi-card-icon">{stat.icon}</div>
              <div className="kpi-card-label">{stat.label}</div>
              <div className="kpi-card-value">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Data Table */}
        <div className="data-card">
          <div className="data-card-header">
            <div className="data-card-title">
              <Users size={16} /> Staff Directory
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '260px' }}>
                <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} size={16} />
                <input 
                  type="text"
                  placeholder="Search staff..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '36px', height: '32px', fontSize: '13px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['All', 'Manager', 'Operator', 'Technician'].map(role => (
                  <button
                    key={role}
                    onClick={() => setRoleFilter(role)}
                    className="btn btn-sm"
                    style={{
                      padding: '4px 10px', fontSize: '11px',
                      background: roleFilter === role ? 'rgba(14, 165, 233, 0.15)' : 'transparent',
                      color: roleFilter === role ? 'var(--color-accent)' : 'var(--color-text-muted)',
                      border: roleFilter === role ? '1px solid rgba(14, 165, 233, 0.3)' : '1px solid transparent',
                      borderRadius: '6px'
                    }}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="data-card-body">
            <table className="ticket-table">
            <thead>
              <tr>
                <th>Staff Member</th>
                <th>Contact & Zone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Workload</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    No staff members found matching your filters.
                  </td>
                </tr>
              ) : filteredStaff.map((staff) => {
                const activeJobs = complaints.filter(c => c.tech === staff.name && c.status !== 'RESOLVED' && c.status !== 'BREACHED' && c.status !== 'OPEN')
                const resolvedJobs = complaints.filter(c => c.tech === staff.name && c.status === 'RESOLVED')
                const isExpanded = expandedId === staff.id

                return (
                <React.Fragment key={staff.id}>
                  <tr 
                    style={{ background: isExpanded ? 'var(--color-bg-hover)' : 'transparent', cursor: staff.role === 'Technician' ? 'pointer' : 'default', transition: 'background 0.2s' }}
                    onClick={() => staff.role === 'Technician' && setExpandedId(isExpanded ? null : staff.id)}
                  >
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '10px',
                        background: 'linear-gradient(135deg, var(--color-bg-hover), var(--color-border))',
                        border: '1px solid var(--color-border-light)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--color-text-primary)', fontWeight: 700, fontSize: '14px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                      }}>
                        {staff.avatar}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{staff.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{staff.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
                      <div style={{ color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={12} style={{ color: 'var(--color-text-muted)' }} /> {staff.email}</div>
                      <div style={{ color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={12} style={{ color: 'var(--color-text-muted)' }} /> {staff.phone}</div>
                      <div style={{ color: 'var(--color-text-muted)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}><MapPin size={12} style={{ color: 'var(--color-accent)' }} /> {staff.zone}</div>
                    </div>
                  </td>
                  <td>
                    <RoleBadge role={staff.role} />
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <StatusBadge status={staff.status} />
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 500, marginLeft: '4px' }}>Last active: {staff.lastActive}</span>
                    </div>
                  </td>
                  <td>
                    {staff.role === 'Technician' ? (
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span style={{ fontSize: '16px', fontWeight: 700, color: activeJobs.length > 0 ? '#3b82f6' : 'var(--color-text-muted)' }}>{activeJobs.length}</span>
                          <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Active</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span style={{ fontSize: '16px', fontWeight: 700, color: resolvedJobs.length > 0 ? '#10b981' : 'var(--color-text-muted)' }}>{resolvedJobs.length}</span>
                          <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Done</span>
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>—</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                      <button style={{ padding: '8px', background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', borderRadius: '8px' }} title="Edit Staff">
                        <Edit size={16} />
                      </button>
                      <button style={{ padding: '8px', background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', borderRadius: '8px' }} title="Remove Staff">
                        <Trash2 size={16} />
                      </button>
                      {staff.role === 'Technician' && (
                        <div style={{ marginLeft: '8px', color: 'var(--color-text-muted)' }}>
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
                
                {isExpanded && staff.role === 'Technician' && (
                  <tr style={{ background: 'rgba(14, 165, 233, 0.03)' }}>
                    <td colSpan={6} style={{ padding: '20px' }}>
                      <div style={{ background: 'var(--color-bg-app)', borderRadius: '8px', border: '1px solid var(--color-border)', padding: '16px' }}>
                        <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '12px' }}>Active Assignments & Flow</h4>
                        {activeJobs.length === 0 ? (
                          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>No active jobs assigned.</div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {activeJobs.map(job => (
                              <div key={job.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'var(--color-bg-surface)', border: '1px solid var(--color-border-light)', borderRadius: '6px' }}>
                                <div>
                                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-accent)' }}>{job.id} - {job.customer}</div>
                                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{job.issue} • {job.address}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <div style={{ fontSize: '12px', color: job.slaPercent > 80 ? 'var(--color-danger)' : 'var(--color-text-primary)', fontWeight: 600 }}>
                                    {job.sla} left
                                  </div>
                                  <span style={{ padding: '4px 8px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                                    {job.status.replace('_', ' ')}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {resolvedJobs.length > 0 && (
                          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed var(--color-border)' }}>
                            <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px' }}>Recently Resolved</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {resolvedJobs.map(job => (
                                <span key={job.id} style={{ fontSize: '11px', padding: '4px 8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '4px' }}>
                                  {job.id} ✓
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
                </React.Fragment>
              )})}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)'
        }}>
          <div className="data-card animate-fade-in" style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-bg-app)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)' }}>Add New Staff Member</h2>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input type="text" className="form-input" placeholder="John" />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input type="text" className="form-input" placeholder="Doe" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input" placeholder="john.doe@catlabroadband.com" />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input type="text" className="form-input" placeholder="+91 99999 99999" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select className="form-select">
                    <option value="Technician">Technician</option>
                    <option value="Operator">Operator</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Assigned Zone</label>
                  <select className="form-select">
                    <option>Guwahati Central</option>
                    <option>Guwahati North</option>
                    <option>Guwahati South</option>
                    <option>Guwahati East</option>
                    <option>Guwahati West</option>
                    <option>NOC Desk</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ padding: '20px', borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-app)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <CheckCircle2 size={18} />
                Create Staff Account
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
