'use client'

import React, { useState, useEffect } from 'react'
import AppShell from '@/components/AppShell'
import { getComplaints } from '@/actions/complaintStore'
import { Wrench, Phone, MapPin, CheckCircle2, AlertCircle } from 'lucide-react'

const STAFF = ['Amit Singh', 'Suresh Pal', 'Vikram Jha', 'Ravi Kumar']

export default function TechnicianManagerView() {
  const [complaints, setComplaints] = useState<any[]>([])

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
    return () => { isMounted = false; clearInterval(timer) }
  }, [])

  return (
    <AppShell role="DIRECTOR">
      <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)' }}>Field Operations Overview</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Monitor all technicians and their live assigned work.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {STAFF.map(tech => {
            const techJobs = complaints.filter(c => c.tech === tech && c.status !== 'RESOLVED' && c.status !== 'BREACHED' && c.status !== 'OPEN')
            const resolvedJobs = complaints.filter(c => c.tech === tech && c.status === 'RESOLVED')
            
            return (
              <div key={tech} style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-hover)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {tech.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{tech}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{techJobs.length} Active • {resolvedJobs.length} Done</div>
                  </div>
                </div>
                
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '300px' }}>
                  {techJobs.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px', margin: 'auto 0' }}>
                      <CheckCircle2 size={32} style={{ margin: '0 auto 8px', opacity: 0.2 }} />
                      No active jobs.
                    </div>
                  ) : (
                    techJobs.map(job => (
                      <div key={job.id} style={{ padding: '12px', background: 'var(--color-bg-app)', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--color-accent)', fontWeight: 600 }}>{job.id}</span>
                          <span style={{ fontSize: '11px', padding: '2px 6px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '4px', fontWeight: 600 }}>
                            {job.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>{job.customer}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>{job.issue}</div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-text-muted)' }}>
                            <MapPin size={12} /> {job.address.split(',')[0]}
                          </div>
                          <div style={{ color: job.slaPercent > 80 ? 'var(--color-danger)' : 'var(--color-text-primary)', fontWeight: 700 }}>
                            {job.sla} left
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </AppShell>
  )
}
