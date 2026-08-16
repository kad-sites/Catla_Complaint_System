'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  MapPin, Navigation, Clock, Camera, CheckCircle2,
  ChevronLeft, Phone, Wrench, CloudOff, Signal, ArrowRight
} from 'lucide-react'
import { sendAssignmentSMS, sendResolutionSMS, sendReassignmentSMS } from '@/actions/sendTicketSMS'
import { getComplaints, updateComplaint } from '@/actions/complaintStore'
import { getUsers, verifyTechnicianPassword } from '@/actions/userStore'

type Assignment = {
  id: string
  customer: string
  category: string
  issue: string
  priority: string
  sla: string
  slaPercent: number
  address: string
  phone: string
  notes: string
  status: string
  previousAssignments?: { tech: string, reassignedAt: number }[]
}

type DoneJob = Assignment & {
  resolvedAt: string
  resolution: string
  resolutionNotes: string
  photos: string[]
}

const RESOLUTION_TYPES = [
  'Fiber re-spliced at joint',
  'ONT replaced (new unit)',
  'Patch cord replaced',
  'Connector cleaned & re-seated',
  'Router reset / reconfigured',
  'Port changed on OLT',
  'External cable repaired',
  'Issue at exchange — escalated',
]

export default function TechnicianApp() {
  const [loggedInTech, setLoggedInTech] = useState<string | null>(null)
  const [availableTechs, setAvailableTechs] = useState<string[]>([])
  const [isLoadingApp, setIsLoadingApp] = useState(true)
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [doneJobs, setDoneJobs] = useState<DoneJob[]>([])
  const [activeTab, setActiveTab] = useState<'jobs' | 'done' | 'status'>('jobs')
  const [selectedTask, setSelectedTask] = useState<Assignment | null>(null)
  const [stage, setStage] = useState<'list' | 'pending' | 'enroute' | 'arrived' | 'working' | 'resolved'>('list')
  const [resolutionType, setResolutionType] = useState('')
  const [photos, setPhotos] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [resolutionNotes, setResolutionNotes] = useState('')
  const lastMutationTime = useRef<number>(0)

  useEffect(() => {
    const saved = localStorage.getItem('loggedInTech')
    if (saved && !loggedInTech) {
      setLoggedInTech(saved)
      setIsLoadingApp(false)
      return
    }

    if (loggedInTech) {
      setIsLoadingApp(false)
      return
    }

    let isMounted = true
    const loadTechs = async () => {
      try {
        const users = await getUsers()
        if (isMounted && users) {
          const techs = users.filter((u: any) => u.role === 'TECHNICIAN' && u.active !== false).map((u: any) => u.name)
          if (techs.length > 0) {
            setAvailableTechs(techs)
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        if (isMounted) setIsLoadingApp(false)
      }
    }
    loadTechs()
  }, [loggedInTech])

  useEffect(() => {
    if (!loggedInTech) return
    let isMounted = true
    const loadFromStore = async () => {
      if (Date.now() - lastMutationTime.current < 2000) return
      try {
        const stored = await getComplaints()
        if (isMounted) {
          const assignedToMe = stored.filter((t: any) => t.tech === loggedInTech && t.status !== 'RESOLVED' && t.status !== 'BREACHED')
          
          const mapped: Assignment[] = assignedToMe.map((t: any) => ({
            id: t.id,
            customer: t.customer || t.name,
            category: t.category,
            issue: t.issue,
            priority: t.priority,
            sla: t.sla,
            slaPercent: t.slaPercent,
            address: t.address,
            phone: t.phone,
            notes: 'Customer reported issue via NOC.',
            status: t.status
          }))
          
          setAssignments(prev => {
            const newMap = new Map(prev.map(a => [a.id, a]))
            mapped.forEach(m => newMap.set(m.id, m))
            return Array.from(newMap.values()).filter(a => mapped.some(m => m.id === a.id))
          })

          const reassignments = stored.filter((t: any) => 
            t.previousAssignments && t.previousAssignments.some((p: any) => p.tech === loggedInTech)
          )

          if (reassignments.length > 0) {
            setDoneJobs(prev => {
              const existingIds = new Set(prev.map(j => j.id))
              const newDones = reassignments
                .filter((r: any) => !existingIds.has(r.id))
                .map((r: any) => {
                  const pAssign = r.previousAssignments.find((p: any) => p.tech === loggedInTech)
                  const timeStr = new Date(pAssign.reassignedAt || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                  return {
                    id: r.id,
                    customer: r.customer || r.name,
                    category: r.category,
                    issue: r.issue,
                    priority: r.priority,
                    sla: r.sla,
                    slaPercent: r.slaPercent,
                    address: r.address,
                    phone: r.phone,
                    notes: 'Customer reported issue via NOC.',
                    resolvedAt: timeStr,
                    resolution: 'Job Reassigned by Manager to another technician',
                    resolutionNotes: 'Unforeseen reason (Manager Reassignment)',
                    photos: []
                  }
                })
              return newDones.length > 0 ? [...newDones, ...prev] : prev
            })
          }
        }
      } catch {}
    }

    loadFromStore()
    const timer = setInterval(loadFromStore, 3000)
    return () => {
      isMounted = false
      clearInterval(timer)
    }
  }, [loggedInTech])

  if (isLoadingApp) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-app)' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid var(--color-border)', borderTop: '4px solid var(--color-accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!loggedInTech) {
    const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!selectedProfile) return
      setIsVerifying(true)
      setLoginError('')
      
      const isValid = await verifyTechnicianPassword(selectedProfile, password)
      if (isValid) {
        localStorage.setItem('loggedInTech', selectedProfile)
        setLoggedInTech(selectedProfile)
      } else {
        setLoginError('Invalid password. Please try again.')
      }
      setIsVerifying(false)
    }

    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-app)', color: 'var(--color-text-primary)', padding: '20px' }}>
        <div style={{ 
          padding: '24px 24px', 
          background: 'rgba(0, 0, 0, 0.15)', 
          backdropFilter: 'blur(24px)', 
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.04)',
          borderRadius: '24px',
          boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
          width: '100%', 
          maxWidth: '320px', 
          textAlign: 'center' 
        }}>
          <div style={{ width: '80px', height: '80px', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <img src="/support-logo.png" alt="On Site Support" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <h1 style={{ fontSize: '18px', fontWeight: 300, marginBottom: '4px', letterSpacing: '0.5px' }}>On Site</h1>
          
          {!selectedProfile ? (
            <>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px', fontSize: '12px', fontWeight: 300 }}>Select your profile to continue</p>
              {availableTechs.length === 0 ? (
                <div style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '12px' }}>
                  No active technicians found.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {availableTechs.map(tech => (
                    <button key={tech} onClick={() => setSelectedProfile(tech)} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'all 0.2s' }}>
                      <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'color-mix(in srgb, var(--color-accent) 20%, transparent)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'normal' }}>{tech.split(' ').map(n => n[0]).join('')}</div>
                      <span style={{ fontWeight: 300, fontSize: '12px', opacity: 0.9 }}>{tech}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left', marginTop: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'color-mix(in srgb, var(--color-accent) 20%, transparent)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'normal' }}>
                  {selectedProfile.split(' ').map(n => n[0]).join('')}
                </div>
                <div style={{ flex: 1, fontWeight: 300, fontSize: '12px', opacity: 0.9 }}>{selectedProfile}</div>
                <button type="button" onClick={() => { setSelectedProfile(null); setPassword(''); setLoginError(''); }} style={{ background: 'none', border: 'none', color: '#0ea5e9', fontSize: '12px', cursor: 'pointer', fontWeight: 300 }}>Change</button>
              </div>

              <div>
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password" 
                  autoFocus
                  style={{ width: '100%', padding: '10px 14px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: 'var(--color-text-primary)', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor = 'var(--color-accent)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              {loginError && <div style={{ color: '#ef4444', fontSize: '12px', textAlign: 'center' }}>{loginError}</div>}

              <button type="submit" disabled={isVerifying || !password} style={{ width: '100%', padding: '10px', fontSize: '14px', fontWeight: 500, marginTop: '4px', opacity: (isVerifying || !password) ? 0.7 : 1, background: 'var(--color-accent)', color: 'white', borderRadius: '10px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)' }}>
                {isVerifying ? 'Verifying...' : 'Login'}
              </button>
            </form>
          )}
        </div>
      </div>
    )
  }

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setPhotos(prev => [...prev, reader.result as string])
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const openJob = (task: Assignment) => {
    setSelectedTask(task)
    setStage(task.status === 'WORKING' ? 'enroute' : 'pending')
    setPhotos([])
    setResolutionType('')
    setResolutionNotes('')
  }

  const closeJob = () => {
    setSelectedTask(null)
    setStage('list')
  }

  const resolveJob = async () => {
    if (!selectedTask) return
    setStage('resolved')
    
    await updateComplaint(selectedTask.id, {
      status: 'RESOLVED',
      resolutionNotes,
      resolvedAt: Date.now()
    })

    // Notify customer
    sendResolutionSMS(selectedTask.phone || '+919999999999', selectedTask.id, selectedTask.customer);

    setAssignments(prev => prev.filter(a => a.id !== selectedTask.id))
    setDoneJobs(prev => [{
      ...selectedTask,
      resolvedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      resolution: resolutionType,
      resolutionNotes: resolutionNotes,
      photos: [], // Clear photos to prevent Base64 memory leak crashes on mobile WebView
    }, ...prev].slice(0, 10))
    
    setTimeout(() => {
      closeJob()
    }, 1000)
  }

  if (selectedTask) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--color-bg-app)', color: 'var(--color-text-primary)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: 'var(--color-bg-card)', padding: '16px 20px', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 10 }}>
          <button onClick={closeJob} style={{ background: 'none', border: 'none', color: '#0ea5e9', fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ChevronLeft size={16} /> Back to List
          </button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#64748b' }}>{selectedTask.id}</div>
              <div style={{ fontSize: '18px', fontWeight: 700 }}>{selectedTask.customer}</div>
            </div>
            <span className={`status-badge ${selectedTask.priority === 'CRITICAL' ? 'breached' : 'open'}`}>
              {selectedTask.priority === 'CRITICAL' ? '🔴 CRITICAL' : '🟡 MEDIUM'}
            </span>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: '100px' }}>
          <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '10px', marginBottom: '12px' }}>
              <MapPin size={16} style={{ color: '#64748b', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{selectedTask.address}</div>
                <a href={`tel:${selectedTask.phone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#0ea5e9', textDecoration: 'none', marginTop: '4px' }}>
                  <Phone size={12} /> {selectedTask.phone}
                </a>
              </div>
            </div>
            <div style={{ padding: '10px 14px', background: '#0d1117', borderRadius: '8px', fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              <span style={{ display: 'block', fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Operator Notes</span>
              {selectedTask.notes}
            </div>
          </div>

          <div style={{ background: 'var(--color-bg-card)', border: `1px solid ${selectedTask.slaPercent > 70 ? 'rgba(239,68,68,0.3)' : 'var(--color-border)'}`, borderRadius: '12px', padding: '16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>SLA Remaining</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: selectedTask.slaPercent > 70 ? '#ef4444' : 'var(--color-text-primary)' }}>{selectedTask.sla}</div>
            </div>
            <div style={{ width: '80px' }}>
              <div className="progress-bar" style={{ height: '8px' }}>
                <div className={`progress-bar-fill ${selectedTask.slaPercent > 80 ? 'red' : selectedTask.slaPercent > 50 ? 'yellow' : 'green'}`} style={{ width: `${selectedTask.slaPercent}%` }} />
              </div>
              <div style={{ fontSize: '10px', color: '#64748b', textAlign: 'center', marginTop: '4px' }}>{selectedTask.slaPercent}% used</div>
            </div>
          </div>

          {stage === 'pending' ? (
            <div style={{ marginBottom: '16px' }}>
              <button onClick={async () => { setStage('enroute'); await sendAssignmentSMS(selectedTask.phone || '+919999999999', selectedTask.id, selectedTask.customer, loggedInTech!); await updateComplaint(selectedTask.id, { status: 'WORKING' }); lastMutationTime.current = Date.now(); }} className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '15px', fontWeight: 700 }}>
                Accept Job
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              {['enroute', 'working'].map((s, i) => (
                <button key={s} onClick={() => { const stages: ('enroute' | 'working')[] = ['enroute', 'working']; const idx = stages.indexOf(stage as any); if (i <= idx + 1) setStage(stages[i]) }} className={`btn ${stage === s || (['enroute','working'].indexOf(stage) >= i) ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1, fontSize: '11px', padding: '10px 8px' }}>
                  {s === 'enroute' ? '🚗 En Route' : '🔧 Working'}
                </button>
              ))}
            </div>
          )}

          {(stage === 'working' || stage === 'resolved') && (
            <div className="animate-fade-in" style={{ background: 'var(--color-bg-card)', border: '1px solid rgba(14, 165, 233, 0.2)', borderRadius: '12px', padding: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0ea5e9', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}><Wrench size={16} /> Resolution Details</h3>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Fault Type Found</label>
                <select className="form-select" value={resolutionType} onChange={e => { setResolutionType(e.target.value); setStage('working') }}>
                  <option value="">Select fault type...</option>
                  {RESOLUTION_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '14px' }}>
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Site Photos (Min 1 required)</span>
                  <span style={{ color: '#f59e0b', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}><CloudOff size={10} /> Queued: {photos.length}</span>
                </label>
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                  <label style={{ width: '72px', height: '72px', flexShrink: 0, background: '#1a2236', border: '2px dashed #2d3a4f', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#64748b', cursor: 'pointer', fontSize: '10px' }}>
                    <input type="file" accept="image/*" onChange={handleCapture} style={{ display: 'none' }} />
                    <Camera size={20} /> Capture
                  </label>
                  {photos.map((dataUrl, i) => (
                    <div key={i} style={{ width: '72px', height: '72px', flexShrink: 0, borderRadius: '10px', position: 'relative', border: '1px solid #2d3a4f', overflow: 'hidden' }}>
                      <img src={dataUrl} alt={`Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Resolution Notes</label>
                <textarea className="form-textarea" rows={3} value={resolutionNotes} onChange={e => setResolutionNotes(e.target.value)} placeholder="Describe the fix applied..." style={{ resize: 'none' }} />
              </div>
              {stage === 'resolved' ? (
                <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', fontSize: '14px', fontWeight: 700, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <CheckCircle2 size={20} /> Job Closed Successfully
                </div>
              ) : (
                <button className="btn btn-primary" style={{ width: '100%', height: '48px', fontSize: '15px', fontWeight: 700 }} disabled={photos.length === 0} onClick={resolveJob}>
                  Close & Resolve Job <ArrowRight size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-app)', color: 'var(--color-text-primary)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: 'var(--color-bg-card)', padding: '20px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '18px', fontWeight: 800 }}>TechConsole</h1>
          <p style={{ fontSize: '12px', color: '#64748b' }}>{loggedInTech} · Field Technician</p>
        </div>
        <button
          onClick={() => { 
            setIsLoadingApp(true);
            localStorage.removeItem('loggedInTech'); 
            setLoggedInTech(null); 
            setSelectedProfile(null);
            setAssignments([]);
            setDoneJobs([]);
            setStage('list');
            setSelectedTask(null);
          }}
          title="Switch User"
          style={{
            width: '42px', height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '14px', color: 'white',
            boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)',
            border: 'none', cursor: 'pointer'
          }}>{loggedInTech?.split(' ').map(n => n[0]).join('')}</button>
      </div>
      <div style={{
        display: 'flex',
        background: '#0d1117',
        borderBottom: '1px solid var(--color-border)',
      }}>
        {[
          { label: 'Active', value: String(assignments.length), color: 'var(--color-text-primary)' },
          { label: 'Done Today', value: String(doneJobs.length), color: '#10b981' },
          { label: 'SLA Hit', value: '92%', color: '#0ea5e9' },
        ].map((stat, i) => (
          <div key={stat.label} style={{
            flex: 1,
            textAlign: 'center',
            padding: '14px',
            borderRight: i < 2 ? '1px solid var(--color-border)' : 'none',
          }}>
            <div style={{ fontSize: '20px', fontWeight: 800, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ──────── JOBS TAB ──────── */}
      {activeTab === 'jobs' && (
        <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '80px' }}>
          <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600, marginBottom: '4px' }}>
            Assigned Jobs
          </div>

          {assignments.length === 0 && (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '60px 20px', textAlign: 'center', gap: '12px',
            }}>
              <CheckCircle2 size={48} style={{ color: '#10b981', opacity: 0.5 }} />
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-muted)' }}>All caught up!</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>No active jobs. Check the Done tab for completed work.</div>
            </div>
          )}

          {assignments.map(task => {
            const isPremiumCritical = task.priority === 'CRITICAL' && ['COMMERCIAL', 'ENTERPRISE', 'GOVERNMENT'].includes(task.category?.toUpperCase() || '');
            return (
            <div key={task.id} className={isPremiumCritical ? 'premium-critical-card' : ''} style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              padding: '16px',
              transition: 'border-color 0.2s',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#0ea5e9' }}>{task.id}</span>
                <span className={`status-badge ${task.priority === 'CRITICAL' ? 'breached' : 'open'}`} style={{ fontSize: '10px' }}>
                  {task.priority === 'CRITICAL' ? `🚨 SLA: ${task.sla} left` : `⏳ SLA: ${task.sla} left`}
                </span>
              </div>

              <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center' }}>
                {task.customer}
                {isPremiumCritical && <span className="premium-badge">★ VIP CRITICAL</span>}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>{task.issue}</div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b', marginBottom: '6px' }}>
                <Phone size={12} /> {task.phone || 'N/A'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b', marginBottom: '14px' }}>
                <MapPin size={12} /> {task.address}
              </div>

              {task.status === 'WORKING' ? (
                <button className="btn btn-primary" style={{ width: '100%', fontSize: '14px', background: '#0ea5e9', color: '#fff', border: 'none', padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }} onClick={() => openJob(task)}>
                  Proceed <ArrowRight size={16} />
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '0px' }}>
                  <button className="btn btn-secondary" style={{ flex: 1, fontSize: '12px', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }} onClick={async () => {
                    lastMutationTime.current = Date.now() + 60000;
                    setAssignments(prev => prev.filter(t => t.id !== task.id))
                    await updateComplaint(task.id, { status: 'REJECTED', tech: 'Unassigned' })
                    lastMutationTime.current = Date.now()
                  }}>
                    ❌ Reject
                  </button>
                  <button className="btn btn-primary" style={{ flex: 1, fontSize: '12px', background: '#10b981', color: '#fff', border: 'none' }} onClick={async () => {
                    lastMutationTime.current = Date.now() + 60000;
                    setAssignments(prev => prev.map(t => t.id === task.id ? { ...t, status: 'WORKING' } : t))
                    if (task.issue?.includes('[REASSIGNED:')) {
                      await sendReassignmentSMS(task.phone || '+919999999999', task.id, task.customer, loggedInTech!)
                    } else {
                      await sendAssignmentSMS(task.phone || '+919999999999', task.id, task.customer, loggedInTech!)
                    }
                    await updateComplaint(task.id, { status: 'WORKING' })
                    lastMutationTime.current = Date.now()
                  }}>
                    ✅ Accept
                  </button>
                </div>
              )}
            </div>
          )})}
        </div>
      )}

      {/* ──────── DONE TAB ──────── */}
      {activeTab === 'done' && (
        <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '80px' }}>
          <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600, marginBottom: '4px' }}>
            Completed Today
          </div>

          {doneJobs.length === 0 && (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '60px 20px', textAlign: 'center', gap: '12px',
            }}>
              <Clock size={48} style={{ color: '#64748b', opacity: 0.4 }} />
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-muted)' }}>No completed jobs yet</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Resolved jobs will appear here.</div>
            </div>
          )}

          {doneJobs.map(job => (
            <div key={job.id} style={{
              background: 'var(--color-bg-card)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '12px',
              padding: '16px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Green accent stripe */}
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px',
                background: 'linear-gradient(to bottom, #10b981, #059669)',
              }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#64748b' }}>{job.id}</span>
                <span style={{
                  fontSize: '10px', padding: '3px 10px', borderRadius: '20px',
                  background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: '4px',
                }}>
                  <CheckCircle2 size={10} /> Resolved
                </span>
              </div>

              <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>{job.customer}</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '10px' }}>{job.issue}</div>

              <div style={{
                padding: '10px 14px',
                background: '#0d1117',
                borderRadius: '8px',
                fontSize: '12px',
                color: 'var(--color-text-muted)',
                lineHeight: 1.6,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Resolution</span>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>Closed at {job.resolvedAt}</span>
                </div>
                <div style={{ color: '#e2e8f0', fontWeight: 600, marginBottom: '4px' }}>{job.resolution}</div>
                {job.resolutionNotes && (
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>{job.resolutionNotes}</div>
                )}
              </div>

              {/* Uploaded Photos */}
              {job.photos.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Uploaded Photos ({job.photos.length})</div>
                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {job.photos.map((dataUrl, i) => (
                      <img
                        key={i}
                        src={dataUrl}
                        alt={`Photo ${i + 1}`}
                        onClick={() => window.open(dataUrl, '_blank')}
                        style={{
                          width: '64px', height: '64px', flexShrink: 0,
                          borderRadius: '8px', objectFit: 'cover',
                          border: '1px solid #2d3a4f', cursor: 'pointer',
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ──────── STATUS TAB ──────── */}
      {activeTab === 'status' && (
        <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingBottom: '80px', gap: '12px' }}>
          <Signal size={48} style={{ color: '#0ea5e9', opacity: 0.4 }} />
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-muted)' }}>Network Status</div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>Coming soon</div>
        </div>
      )}

      {/* Bottom Nav — interactive tabs */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--color-bg-card)',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '10px 0',
        paddingBottom: 'max(10px, env(safe-area-inset-bottom))',
      }}>
        {([
          { icon: Clock, label: 'Jobs', tab: 'jobs' as const, badge: assignments.length },
          { icon: CheckCircle2, label: 'Done', tab: 'done' as const, badge: doneJobs.length },
          { icon: Signal, label: 'Status', tab: 'status' as const, badge: 0 },
        ]).map(item => {
          const Icon = item.icon
          const isActive = activeTab === item.tab
          return (
            <button key={item.label} onClick={() => setActiveTab(item.tab)} style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              color: isActive ? '#0ea5e9' : '#64748b',
              fontSize: '10px',
              fontWeight: isActive ? 700 : 400,
              position: 'relative',
            }}>
              <div style={{ position: 'relative' }}>
                <Icon size={22} />
                {item.badge > 0 && (
                  <span style={{
                    position: 'absolute', top: '-4px', right: '-8px',
                    background: item.tab === 'jobs' ? '#ef4444' : '#10b981',
                    color: 'white',
                    fontSize: '8px', fontWeight: 800,
                    width: '16px', height: '16px',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {item.badge}
                  </span>
                )}
              </div>
              {item.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
