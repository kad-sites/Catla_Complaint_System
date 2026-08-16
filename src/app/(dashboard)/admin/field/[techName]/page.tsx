'use client'

import React, { useState, useEffect } from 'react'
import { getComplaints } from '@/actions/complaintStore'
import { ArrowLeft, CheckCircle2, Clock, Star, Zap, Package, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function TechnicianPerformanceView() {
  const params = useParams()
  const techName = params?.techName ? decodeURIComponent(params.techName as string) : 'Loading...'
  const [complaints, setComplaints] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const loadFromStore = async () => {
      try {
        const storedComplaints = await getComplaints()
        if (isMounted) {
          setComplaints(storedComplaints)
          setIsLoading(false)
        }
      } catch {}
    }
    loadFromStore()
    const timer = setInterval(loadFromStore, 5000)
    return () => { isMounted = false; clearInterval(timer) }
  }, [])

  const resolvedJobs = complaints.filter(c => c.tech === techName && c.status === 'RESOLVED')
  
  // Calculate metrics
  let totalSLA = 0
  let totalBreached = 0
  let totalRevisits = 0
  let totalResponseTimeMs = 0
  let responseTimeCount = 0
  let materialsUsedCount = 0
  let totalRating = 0
  let ratedJobs = 0

  resolvedJobs.forEach(job => {
    const createdAtMs = job.createdAt ? new Date(job.createdAt).getTime() : Date.now() - (3600000 * 2)
    const resolvedAtMs = job.resolvedAt ? new Date(job.resolvedAt).getTime() : Date.now()
    const timeTakenHrs = Math.max(0, Math.round((resolvedAtMs - createdAtMs) / (1000 * 60 * 60)))
    
    if (timeTakenHrs <= (job.slaHours || 4)) {
      totalSLA++
    } else {
      totalBreached++
    }
    
    if (job.materialsUsed) materialsUsedCount++
    if (job.photoQualityScore) {
      totalRating += Number(job.photoQualityScore)
      ratedJobs++
    }
    if (job.isRevisit === true || job.isRevisit === 'true') {
      totalRevisits++
    }
    if (job.assignedAt && job.acceptedAt) {
      const assignedMs = Number(job.assignedAt)
      const acceptedMs = new Date(job.acceptedAt).getTime()
      const diffMs = acceptedMs - assignedMs
      if (diffMs > 0) {
        totalResponseTimeMs += diffMs
        responseTimeCount++
      }
    }
  })

  const slaPercent = resolvedJobs.length > 0 ? Math.round((totalSLA / resolvedJobs.length) * 100) : 0
  const ftfrPercent = resolvedJobs.length > 0 ? Math.round(((resolvedJobs.length - totalRevisits) / resolvedJobs.length) * 100) : 0
  
  let avgResponseTimeStr = 'N/A'
  if (responseTimeCount > 0) {
    const avgMs = totalResponseTimeMs / responseTimeCount
    const avgMins = Math.round(avgMs / 60000)
    avgResponseTimeStr = avgMins > 60 ? `${Math.round(avgMins / 60)}h ${avgMins % 60}m` : `${avgMins}m`
  }

  const avgRating = ratedJobs > 0 ? (totalRating / ratedJobs).toFixed(1) : 'N/A'

  return (
    <div style={{ padding: '0 0 40px' }}>
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/admin/field" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: '50%', color: 'var(--color-text-primary)', textDecoration: 'none' }}>
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0, lineHeight: 1.2 }}>{techName}</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '12px', margin: '2px 0 0 0' }}>Performance & History Dashboard</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: 'var(--color-bg-surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '12px', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={14}/> First-Time Fix Rate</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: ftfrPercent >= 90 ? '#10b981' : '#f59e0b' }}>{resolvedJobs.length > 0 ? `${ftfrPercent}%` : 'N/A'}</div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>{totalRevisits} revisits on {resolvedJobs.length} jobs</div>
        </div>
        
        <div style={{ background: 'var(--color-bg-surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '12px', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14}/> SLA Adherence</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: slaPercent >= 80 ? '#10b981' : '#f59e0b' }}>{slaPercent}%</div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>{totalSLA} within SLA, {totalBreached} breached</div>
        </div>

        <div style={{ background: 'var(--color-bg-surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '12px', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><Zap size={14}/> Response Time</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-text-primary)' }}>{avgResponseTimeStr}</div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Avg time to accept assignment</div>
        </div>

        <div style={{ background: 'var(--color-bg-surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '12px', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><Package size={14}/> Material Efficiency</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-text-primary)' }}>{materialsUsedCount}</div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Jobs with materials logged</div>
        </div>

        <div style={{ background: 'var(--color-bg-surface)', padding: '20px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '12px', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}><Star size={14}/> Quality Score</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--color-text-primary)' }}>{avgRating}</div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Based on {ratedJobs} photo ratings</div>
        </div>
      </div>

      <div style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Resolved Job History</h2>
          <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 600 }}>Total: {resolvedJobs.length}</div>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--color-bg-hover)', borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)' }}>TICKET ID</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)' }}>CUSTOMER</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)' }}>DATE & TIME</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)' }}>SLA ADHERENCE</th>
                <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)' }}>MATERIALS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading history...</td>
                </tr>
              ) : resolvedJobs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No resolved jobs found.</td>
                </tr>
              ) : (
                resolvedJobs.map(job => {
                  const createdAtMs = job.createdAt ? new Date(job.createdAt).getTime() : Date.now() - (3600000 * 2)
                  const resolvedAtMs = job.resolvedAt ? new Date(job.resolvedAt).getTime() : Date.now()
                  const timeTakenHrs = Math.max(0, Math.round((resolvedAtMs - createdAtMs) / (1000 * 60 * 60)))
                  const isWithinSLA = timeTakenHrs <= (job.slaHours || 4)

                  return (
                    <tr key={job.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '16px 20px', fontSize: '13px', fontFamily: 'monospace', color: 'var(--color-accent)', fontWeight: 600 }}>{job.id}</td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: 600 }}>
                        {job.customer}
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 400, marginTop: '2px' }}>{job.issue}</div>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                        {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A'}
                        <div style={{ fontSize: '11px', marginTop: '2px' }}>Took ~{timeTakenHrs}h</div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ fontSize: '11px', background: isWithinSLA ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: isWithinSLA ? '#10b981' : '#f59e0b', padding: '4px 8px', borderRadius: '4px', fontWeight: 600 }}>
                          {isWithinSLA ? 'Within SLA' : 'Breached'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                        {job.materialsUsed || <span style={{ opacity: 0.5 }}>None</span>}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
