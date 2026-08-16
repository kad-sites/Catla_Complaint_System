'use client'

import React, { useState, useEffect } from 'react'
import { getComplaints } from '@/actions/complaintStore'
import { getUsers } from '@/actions/userStore'
import Link from 'next/link'
import { Wrench, Phone, MapPin, CheckCircle2, AlertCircle, History, Clock } from 'lucide-react'

export default function TechnicianManagerView() {
  const [complaints, setComplaints] = useState<any[]>([])
  const [technicians, setTechnicians] = useState<any[]>([])

  useEffect(() => {
    let isMounted = true
    const loadFromStore = async () => {
      try {
        const [storedComplaints, users] = await Promise.all([
          getComplaints(),
          getUsers()
        ])
        if (isMounted) {
          setComplaints(storedComplaints)
          setTechnicians(users.filter((u: any) => u.role === 'TECHNICIAN' && u.active))
        }
      } catch {}
    }
    loadFromStore()
    const timer = setInterval(loadFromStore, 3000)
    return () => { isMounted = false; clearInterval(timer) }
  }, [])

  return (
    <>
      <div style={{ padding: '0' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)' }}>Field Operations Overview</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Monitor all technicians and their live assigned work.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {technicians.map(techObj => {
            const tech = techObj.name
            const techJobs = complaints.filter(c => c.tech === tech && c.status !== 'RESOLVED' && c.status !== 'BREACHED' && c.status !== 'OPEN')
            const resolvedJobs = complaints.filter(c => c.tech === tech && c.status === 'RESOLVED')
            
            return (
              <div key={techObj.id} style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-hover)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                    {tech.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{tech}</div>
                      <Link href={`/admin/field/${encodeURIComponent(tech)}`} style={{ background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', textDecoration: 'none' }}>
                        <History size={12} /> History
                      </Link>
                    </div>
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
                          <span style={{ fontSize: '11px', padding: '2px 6px', border: '1px solid var(--color-accent)', color: 'var(--color-accent)', borderRadius: '4px', fontWeight: 600 }}>
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
    </>
  )
}
