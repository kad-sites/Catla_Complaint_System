'use client'

import React, { useState, useEffect } from 'react'
import {
  Search, Filter, Plus, MoreHorizontal, UserCheck, UserX, User, Users,
  Mail, Phone, MapPin, Edit, Trash2, CheckCircle2, X, ChevronDown, ChevronUp
} from 'lucide-react'
import { getComplaints } from '@/actions/complaintStore'
import { getUsers, createUser, deleteUser, updateUser } from '@/actions/userStore'

type StaffRole = 'Manager' | 'Sales Manager' | 'Operator' | 'Technician' | 'Administrator' | 'Fiber Technician' | 'Support Staff' | 'Telecaller' | 'Bill Collector' | 'Accountant' | string
type StaffStatus = 'Active' | 'Inactive' | 'On Leave'

type StaffMember = {
  id: string
  name: string
  role: StaffRole
  email: string
  phone: string
  status: StaffStatus
  zone?: string
  lastActive?: string
  avatar?: string
  active?: boolean
}

function RoleBadge({ role }: { role: StaffRole }) {
  const displayRole = (role || '').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  const styles: Record<string, string> = {
    Manager: 'text-indigo-400',
    'Sales Manager': 'text-violet-400',
    Operator: 'text-emerald-400',
    Technician: 'text-sky-400',
    Administrator: 'text-purple-400',
    'Fiber Technician': 'text-cyan-400',
    'Support Staff': 'text-pink-400',
    Telecaller: 'text-orange-400',
    'Bill Collector': 'text-rose-400',
    'Accountant': 'text-teal-400',
  }
  return (
    <span className={`text-xs font-medium ${styles[displayRole] || 'text-slate-400'}`}>
      {displayRole}
    </span>
  )
}

function StatusBadge({ status }: { status: StaffStatus }) {
  const styles: Record<StaffStatus, string> = {
    Active: 'text-emerald-400',
    Inactive: 'text-slate-400',
    'On Leave': 'text-amber-400',
  }
  const icons = {
    Active: <UserCheck size={12} className="mr-1" />,
    Inactive: <UserX size={12} className="mr-1" />,
    'On Leave': <User size={12} className="mr-1" />,
  }
  return (
    <span className={`flex items-center w-fit text-xs font-medium ${styles[status]}`}>
      {icons[status]} {status}
    </span>
  )
}

const formatName = (val: string) => {
  let result = '';
  let inBracket = false;
  let capitalizeNext = true;

  for (let i = 0; i < val.length; i++) {
    const char = val[i];
    
    if (char === '(' || char === '[' || char === '{') {
      inBracket = true;
      result += char;
      capitalizeNext = true;
    } else if (char === ')' || char === ']' || char === '}') {
      inBracket = false;
      result += char;
      capitalizeNext = true;
    } else if (inBracket) {
      result += char.toUpperCase();
    } else {
      if (char === ' ' || char === '-' || char === '.') {
        capitalizeNext = true;
        result += char;
      } else {
        if (capitalizeNext) {
          result += char.toUpperCase();
          capitalizeNext = false;
        } else {
          result += char.toLowerCase();
        }
      }
    }
  }
  return result;
}

export default function StaffManagement({ initialStaffRaw, initialComplaints }: { initialStaffRaw: any[], initialComplaints: any[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('All')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [staff, setStaff] = useState<StaffMember[]>(initialStaffRaw.map((u: any) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone || '',
    role: (u.role || '').split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' '),
    status: u.active ? 'Active' : 'Inactive',
    zone: u.zone || '',
    avatar: u.name.substring(0, 2).toUpperCase()
  })))
  const [complaints, setComplaints] = useState<any[]>(initialComplaints)

  // Form state
  const [newStaff, setNewStaff] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'Technician',
    zone: ''
  })

  const loadData = async () => {
    try {
      const [storedComplaints, storedUsers] = await Promise.all([
        getComplaints(),
        getUsers()
      ])
      setComplaints(storedComplaints)
      setStaff(storedUsers.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone || '',
        role: (u.role || '').split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' '),
        status: u.active ? 'Active' : 'Inactive',
        zone: u.zone || '',
        avatar: u.name.substring(0, 2).toUpperCase()
      })))
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    let isMounted = true
    const timer = setInterval(loadData, 5000)
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsAddModalOpen(false)
        setEditingStaffId(null)
        setExpandedId(null)
      }
    }

    const handleClickOutside = () => {
      setExpandedId(null)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('click', handleClickOutside)

    return () => {
      isMounted = false
      clearInterval(timer)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('click', handleClickOutside)
    }
  }, [])

  const handleSaveStaff = async () => {
    if (editingStaffId) {
      const originalUser = staff.find(s => s.id === editingStaffId);
      const res = await updateUser(editingStaffId, {
        name: `${newStaff.firstName} ${newStaff.lastName}`.trim(),
        email: newStaff.email,
        phone: newStaff.phone,
        role: newStaff.role.toUpperCase(),
        zone: newStaff.zone,
      }, false, originalUser?.phone);
      if (res.success) {
        setIsAddModalOpen(false);
        setEditingStaffId(null);
        setNewStaff({ firstName: '', lastName: '', email: '', phone: '', role: 'Technician', zone: '' });
        loadData();
      } else {
        alert("Error updating staff: " + res.error);
      }
    } else {
      const res = await createUser({
        id: `STF-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        name: `${newStaff.firstName} ${newStaff.lastName}`.trim(),
        email: newStaff.email,
        phone: newStaff.phone,
        role: newStaff.role.toUpperCase(),
        zone: newStaff.zone,
        active: true
      });
      if (res.success) {
        setIsAddModalOpen(false);
        setNewStaff({ firstName: '', lastName: '', email: '', phone: '', role: 'Technician', zone: '' });
        loadData();
      } else {
        alert("Error adding staff: " + res.error);
      }
    }
  }

  const handleEditClick = (staff: StaffMember) => {
    const [first, ...rest] = staff.name.split(' ')
    setNewStaff({
      firstName: first || '',
      lastName: rest.join(' ') || '',
      email: staff.email || '',
      phone: staff.phone || '',
      role: staff.role || 'Technician',
      zone: staff.zone || ''
    })
    setEditingStaffId(staff.id)
    setIsAddModalOpen(true)
  }

  const handleDeleteStaff = async (id: string, phone: string) => {
    if (confirm("Are you sure you want to delete this staff member?")) {
      try {
        const res = await fetch('/api/staff/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, phone })
        });
        const data = await res.json();
        if (!data.success) {
          alert("Error deleting staff: " + data.error);
        }
      } catch (e) {
        console.error('Delete failed:', e);
      }
      loadData();
    }
  }

  const filteredStaff = staff.filter(s => {
    if (roleFilter !== 'All' && s.role.toUpperCase() !== roleFilter.toUpperCase()) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.phone.includes(q)
    }
    return true
  })

  return (
    <>
      <div className="animate-fade-in" style={{ padding: '0' }}>
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              Staff Management
              <span style={{
                background: 'rgba(14, 165, 233, 0.15)', color: 'var(--color-accent)',
                fontSize: '13px', padding: '4px 12px', borderRadius: '20px', border: '1px solid rgba(14, 165, 233, 0.3)'
              }}>
                {staff.length} Total
              </span>
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Manage User Roles, Access Levels, And Team Assignments.</p>
          </div>
          
          <button 
            onClick={() => {
              setEditingStaffId(null)
              setNewStaff({ firstName: '', lastName: '', email: '', phone: '', role: 'Technician', zone: '' })
              setIsAddModalOpen(true)
            }}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, borderRadius: '99px', boxShadow: '0 4px 14px 0 rgba(14,165,233,0.39)', transition: 'all 0.2s ease-in-out' }}
          >
            <Plus size={16} />
            Add New Staff
          </button>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {[
            { label: 'Technicians', value: staff.filter(s => s.role?.toUpperCase() === 'TECHNICIAN').length, color: 'sky' },
            { label: 'Fiber', value: staff.filter(s => s.role?.toUpperCase() === 'FIBER TECHNICIAN').length, color: 'cyan' },
            { label: 'Operators', value: staff.filter(s => s.role?.toUpperCase() === 'OPERATOR').length, color: 'emerald' },
            { label: 'Telecallers', value: staff.filter(s => s.role?.toUpperCase() === 'TELECALLER').length, color: 'orange' },
            { label: 'Collectors', value: staff.filter(s => s.role?.toUpperCase() === 'BILL COLLECTOR').length, color: 'rose' },
            { label: 'On Leave', value: staff.filter(s => s.status === 'On Leave').length, color: 'amber' },
          ].map((stat, i) => (
            <div key={i} className="data-card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 120px' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: `var(--color-${stat.color}-500, ${stat.color})` }}>{stat.value}</div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Data Table */}
        <div className="data-card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
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
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', flex: 1 }}>
              {['All', 'Manager', 'Sales Manager', 'Technician', 'Fiber Technician', 'Operator', 'Telecaller', 'Bill Collector', 'Accountant'].map(role => (
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
          
          <div className="data-card-body">
            <table className="ticket-table">
            <thead>
              <tr>
                <th style={{ width: '30%' }}>Staff Member</th>
                <th style={{ width: '25%' }}>Contact & Zone</th>
                <th style={{ width: '20%' }}>Role</th>
                <th style={{ width: '15%' }}>Status</th>
                <th style={{ width: '10%', textAlign: 'right' }}>Actions</th>
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
                    onClick={(e) => {
                      if (staff.role === 'Technician') {
                        e.stopPropagation()
                        setExpandedId(isExpanded ? null : staff.id)
                      }
                    }}
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
                    </div>
                  </td>
                  <td>
                    <RoleBadge role={staff.role} />
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <StatusBadge status={staff.status} />
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleEditClick(staff); }}
                        style={{ padding: '8px', background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', borderRadius: '8px' }} title="Edit Staff">
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteStaff(staff.id, staff.phone); }}
                        style={{ padding: '8px', background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', borderRadius: '8px' }} title="Remove Staff"
                      >
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
                  <tr style={{ background: 'rgba(14, 165, 233, 0.03)' }} onClick={(e) => e.stopPropagation()}>
                    <td colSpan={5} style={{ padding: '20px' }}>
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
                                  <span style={{ padding: '4px 8px', border: '1px solid var(--color-accent)', color: 'var(--color-accent)', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
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
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{editingStaffId ? 'Edit Staff Member' : 'Add New Staff Member'}</h2>
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
                  <input type="text" className="form-input" placeholder="John" value={newStaff.firstName} onChange={e => setNewStaff({...newStaff, firstName: formatName(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input type="text" className="form-input" placeholder="Doe" value={newStaff.lastName} onChange={e => setNewStaff({...newStaff, lastName: formatName(e.target.value)})} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input" placeholder="john.doe@catlabroadband.com" value={newStaff.email} onChange={e => setNewStaff({...newStaff, email: e.target.value})} />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input type="text" className="form-input" placeholder="+91 99999 99999" value={newStaff.phone} onChange={e => setNewStaff({...newStaff, phone: e.target.value})} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select className="form-select" value={newStaff.role} onChange={e => setNewStaff({...newStaff, role: e.target.value})}>
                    <option value="Administrator">Administrator</option>
                    <option value="Manager">Manager</option>
                    <option value="Sales Manager">Sales Manager</option>
                    <option value="Technician">Technician</option>
                    <option value="Fiber Technician">Fiber Technician</option>
                    <option value="Support Staff">Support Staff</option>
                    <option value="Telecaller">Telecaller</option>
                    <option value="Bill Collector">Bill Collector</option>
                    <option value="Accountant">Accountant</option>
                  </select>
                </div>
                <div className="form-group" style={{ opacity: 0.5 }}>
                  <label className="form-label">Assigned Zone</label>
                  <select className="form-select" disabled>
                    <option></option>
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
                onClick={handleSaveStaff}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <CheckCircle2 size={18} />
                {editingStaffId ? 'Save Changes' : 'Create Staff Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
