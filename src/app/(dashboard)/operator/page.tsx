'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Search, Phone, MapPin, Wifi, User, Clock,
  CheckCircle2, AlertTriangle, Zap, Send, ChevronRight
} from 'lucide-react'
import { sendTicketSMS } from '@/actions/sendTicketSMS'
import { saveComplaint } from '@/actions/complaintStore'
import { sendTelegramAlert } from '@/actions/sendTelegramAlert'

const CATEGORIES = [
  { id: '1', name: 'No Internet', priority: 'CRITICAL', icon: '🔴' },
  { id: '2', name: 'Slow Speed', priority: 'MEDIUM', icon: '🟡' },
  { id: '3', name: 'WiFi / Router Issue', priority: 'MEDIUM', icon: '📶' },
  { id: '4', name: 'ONT / Hardware Fault', priority: 'HIGH', icon: '🔧' },
  { id: '5', name: 'Fiber / Cable Damage', priority: 'CRITICAL', icon: '⚡' },
  { id: '6', name: 'Billing & Payment', priority: 'LOW', icon: '💳' },
]

const SUBTYPES: Record<string, string[]> = {
  'No Internet': ['Complete Outage', 'Intermittent Drops', 'Authentication Failure', 'DNS Not Resolving'],
  'Slow Speed': ['Speed Below Plan', 'High Latency / Ping', 'Packet Loss', 'Bandwidth Throttling'],
  'WiFi / Router Issue': ['WiFi Not Working', 'Weak Signal Coverage', 'Password Reset Required', 'Device Not Connecting'],
  'ONT / Hardware Fault': ['ONT Red Light (LOS)', 'ONT Not Powering On', 'Port Damage', 'Firmware Issue'],
  'Fiber / Cable Damage': ['Fiber Cut – Weather/Animal', 'Fiber Cut – Road Work', 'Loose Connector', 'Patch Cord Faulty'],
  'Billing & Payment': ['Payment Not Reflected', 'Plan Change Request', 'Refund Request', 'Invoice Error'],
}

const SNIPPETS = [
  "Customer reports no signal since morning",
  "Red light blinking on ONT device",
  "Speed drops significantly after 8 PM",
  "Wire found broken near street pole",
  "Router not connecting after power cut",
  "Payment made via UPI but plan not renewed",
]

const MOCK_CUSTOMERS = [
  { id: 'c1', smartguardId: 'CID-1042', name: 'Rajesh Kumar', phone: '+91-9876543210', address: 'B-42, Sector 15, Noida', category: 'RESIDENTIAL', plan: '100 Mbps Fiber', status: 'ACTIVE', openTickets: 0 },
  { id: 'c2', smartguardId: 'CID-2081', name: 'TechCorp Pvt Ltd', phone: '+91-9123456789', address: '3rd Floor, Tech Park, Sector 62', category: 'COMMERCIAL', plan: '500 Mbps Leased', status: 'ACTIVE', openTickets: 0 },
  { id: 'c3', smartguardId: 'CID-3010', name: 'Priya Sharma', phone: '+91-9988776655', address: 'D-15, Green Valley, Sector 12', category: 'RESIDENTIAL', plan: '50 Mbps Fiber', status: 'ACTIVE', openTickets: 0 },
  { id: 'c4', smartguardId: 'CID-4055', name: 'Govt Office Sec-5', phone: '+91-1120304050', address: 'Block A, Govt Complex, Sector 5', category: 'GOVERNMENT', plan: '200 Mbps Dedicated', status: 'ACTIVE', openTickets: 0 },
  { id: 'c5', smartguardId: 'CID-5023', name: 'DataStream Ltd', phone: '+91-9090909090', address: 'Unit 7, Industrial Area', category: 'ENTERPRISE', plan: '1 Gbps Leased Line', status: 'ACTIVE', openTickets: 0 },
  { id: 'c6', smartguardId: 'CID-6011', name: 'Deep Das', phone: '+91-9854051521', address: 'H-12, Laketown, Kolkata', category: 'RESIDENTIAL', plan: '100 Mbps Fiber', status: 'ACTIVE', openTickets: 0 },
  { id: 'c7', smartguardId: 'CID-6022', name: 'Anupam Das', phone: '+91-9854051519', address: 'Flat 4B, Salt Lake, Sector V, Kolkata', category: 'RESIDENTIAL', plan: '200 Mbps Fiber', status: 'ACTIVE', openTickets: 0 },
  { id: 'c8', smartguardId: 'CID-6033', name: 'Deep Singh', phone: '+91-9854051525', address: 'A-22, Rajouri Garden, New Delhi', category: 'RESIDENTIAL', plan: '50 Mbps Fiber', status: 'ACTIVE', openTickets: 0 },
  { id: 'c9', smartguardId: 'CID-6044', name: 'Utpal Das', phone: '+91-9854051520', address: 'C-7, Dum Dum Park, Kolkata', category: 'RESIDENTIAL', plan: '100 Mbps Fiber', status: 'ACTIVE', openTickets: 0 },
  { id: 'c10', smartguardId: 'CID-6055', name: 'Zoheb Aziz', phone: '+91-9854051522', address: 'Rajarhat, New Town, Kolkata', category: 'RESIDENTIAL', plan: '300 Mbps Fiber', status: 'ACTIVE', openTickets: 0 },
]

const SLA_HOURS: Record<string, Record<string, number>> = {
  CRITICAL: { RESIDENTIAL: 4, COMMERCIAL: 2, ENTERPRISE: 1, GOVERNMENT: 2 },
  HIGH:     { RESIDENTIAL: 8, COMMERCIAL: 4, ENTERPRISE: 2, GOVERNMENT: 4 },
  MEDIUM:   { RESIDENTIAL: 24, COMMERCIAL: 12, ENTERPRISE: 8, GOVERNMENT: 12 },
  LOW:      { RESIDENTIAL: 48, COMMERCIAL: 24, ENTERPRISE: 12, GOVERNMENT: 24 },
}

export default function OperatorConsole() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<typeof MOCK_CUSTOMERS>([])
  const [searching, setSearching] = useState(false)
  const [customer, setCustomer] = useState<(typeof MOCK_CUSTOMERS)[0] | null>(null)
  
  // Keyboard navigation
  const [selectedIndex, setSelectedIndex] = useState(0)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const categorySelectRef = useRef<HTMLSelectElement>(null)
  const subTypeSelectRef = useRef<HTMLSelectElement>(null)
  const descRef = useRef<HTMLTextAreaElement>(null)
  const testSlaSelectRef = useRef<HTMLSelectElement>(null)
  const snippetsWrapperRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const submitBtnRef = useRef<HTMLButtonElement>(null)
  
  const [selectedSnippetIdx, setSelectedSnippetIdx] = useState(0)

  // Focus search input on mount if no customer selected
  useEffect(() => {
    if (!customer) {
      searchInputRef.current?.focus()
    }
  }, [customer])

  // Form
  const [category, setCategory] = useState('')
  const [subType, setSubType] = useState('')
  const [priority, setPriority] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [testSla, setTestSla] = useState('')

  // Reset snippet index when subtype changes
  useEffect(() => {
    setSelectedSnippetIdx(0)
  }, [subType])

  const searchTimeout = useRef<NodeJS.Timeout | null>(null)

  // Debounced search
  useEffect(() => {
    setSelectedIndex(0) // Reset selection when query changes
    if (searchQuery.length < 2) { setSearchResults([]); return }
    setSearching(true)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => {
      const q = searchQuery.toLowerCase()
      const results = MOCK_CUSTOMERS.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.smartguardId.toLowerCase().includes(q)
      )
      setSearchResults(results)
      setSearching(false)
    }, 400)
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current) }
  }, [searchQuery])

  const selectCustomer = (c: typeof MOCK_CUSTOMERS[0]) => {
    setCustomer(c)
    setSearchQuery('')
    setSearchResults([])
    // Focus category select after choosing customer
    setTimeout(() => {
      categorySelectRef.current?.focus()
    }, 50)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (searchResults.length > 0) {
        selectCustomer(searchResults[selectedIndex])
      }
    }
  }

  const handleCategoryChange = (val: string) => {
    setCategory(val)
    setSubType('')
    const cat = CATEGORIES.find(c => c.name === val)
    if (cat) setPriority(cat.priority)
    // Auto-advance to sub-type
    if (val) {
      setTimeout(() => subTypeSelectRef.current?.focus(), 50)
    }
  }

  const baseSlaHours = priority && customer
    ? SLA_HOURS[priority]?.[customer.category] || 24
    : 0

  const slaHours = testSla ? parseInt(testSla) / 60 : baseSlaHours

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customer || !category || !subType || !description) return
    setSubmitting(true)
    
    // Simulate slight delay for registering
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const ticketNum = `CBS-${String(Math.floor(Math.random()*99999)).padStart(5,'0')}`

    // Persist to JSON file for cross-device sync
    const formattedSla = slaHours < 1 ? `${Math.round(slaHours * 60)} Mins` : `${Math.round(slaHours)} Hours`
    await saveComplaint({
      id: ticketNum,
      customer: customer.name,
      category: customer.category,
      issue: `${category} – ${subType}`,
      priority,
      sla: formattedSla,
      slaPercent: 0,
      tech: 'Unassigned',
      status: 'OPEN',
      time: 'Just now',
      phone: customer.phone,
      address: customer.address,
      createdAt: Date.now(),
      slaHours: slaHours,
    })

    // Send Twilio SMS in background
    sendTicketSMS(customer.phone, ticketNum, customer.name)

    // Send Telegram alert in background
    const telegramMessage = `🚨 <b>New Complaint Registered</b>\n\n<b>Ticket:</b> ${ticketNum}\n<b>Customer:</b> ${customer.name}\nPhone: ${customer.phone}\nCategory: ${category}\nIssue: ${subType}\nSLA: ${formattedSla}`;
    sendTelegramAlert(telegramMessage);

    setSuccess(ticketNum)
    setSubmitting(false)
    setCustomer(null)
    setCategory('')
    setSubType('')
    setPriority('')
    setDescription('')
    setTimeout(() => setSuccess(''), 8000)
  }

  return (
    <>
      <div className="animate-fade-in">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Zap size={22} style={{ color: 'var(--color-accent)' }} /> Complaint Registration
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
              Zero-error entry · Drop-down driven · Smart SLA
            </p>
          </div>
        </div>

        {/* Success Banner */}
        {success && (
          <div className="animate-slide-in" style={{
            marginBottom: '20px',
            padding: '16px 20px',
            borderRadius: '10px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#34d399',
            fontSize: '14px',
            fontWeight: 600,
          }}>
            <CheckCircle2 size={20} />
            Complaint <span style={{ fontFamily: 'monospace', background: 'rgba(16,185,129,0.15)', padding: '2px 8px', borderRadius: '4px' }}>{success}</span> registered successfully! WhatsApp notification sent.
          </div>
        )}

        {/* Two Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '24px', alignItems: 'start' }}>

          {/* LEFT: Customer Search + Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Search Box */}
            <div className="data-card">
              <div className="data-card-header">
                <div className="data-card-title"><Search size={15} /> Customer Lookup</div>
                <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>SmartGuard BMS</span>
              </div>
              <div className="data-card-body" style={{ padding: '16px' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--color-text-muted)' }} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Search by ID, Name, or Phone..."
                    className="form-input"
                    style={{ paddingLeft: '36px' }}
                  />
                </div>

                {/* Search Results Dropdown */}
                {searchResults.length > 0 && (
                  <div style={{
                    marginTop: '8px',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    background: 'var(--color-bg-card)',
                  }}>
                    {searchResults.map((c, i) => (
                      <button
                        key={c.id}
                        onClick={() => selectCustomer(c)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 14px',
                          background: i === selectedIndex ? 'var(--color-bg-hover)' : 'none',
                          border: 'none',
                          borderBottom: '1px solid var(--color-border)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          color: 'var(--color-text-primary)',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={() => setSelectedIndex(i)}
                      >
                        <div className={`customer-avatar ${c.category.toLowerCase()}`} style={{ width: '36px', height: '36px', fontSize: '13px', borderRadius: '8px' }}>
                          {c.name.charAt(0)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', fontWeight: 600 }}>{c.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{c.smartguardId} · {c.phone}</div>
                        </div>
                        <ChevronRight size={14} style={{ color: 'var(--color-text-muted)' }} />
                      </button>
                    ))}
                  </div>
                )}

                {searching && (
                  <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                    Searching SmartGuard BMS...
                  </div>
                )}
              </div>
            </div>

            {/* Customer Card */}
            {customer && (
              <div className="customer-card animate-fade-in" style={{ position: 'relative' }}>
                <button
                  onClick={() => setCustomer(null)}
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    background: 'transparent',
                    border: 'none',
                    width: '24px', height: '24px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#64748b', fontSize: '16px', fontWeight: 700,
                    transition: 'color 0.15s ease',
                    zIndex: 10,
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}
                  title="Remove customer"
                >✕</button>

                <div className="customer-card-header" style={{ paddingRight: '40px' }}>
                  <div className={`customer-avatar ${customer.category.toLowerCase()}`}>
                    {customer.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{customer.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{customer.smartguardId}</div>
                  </div>
                  <span className={`category-badge ${customer.category.toLowerCase()}`}>{customer.category}</span>
                </div>
                <div className="customer-card-body">
                  <div className="customer-detail-row">
                    <Phone size={15} />
                    <span className="label">Phone</span>
                    <a href={`tel:${customer.phone}`} style={{ fontWeight: 500, color: '#0ea5e9', textDecoration: 'none' }}>{customer.phone}</a>
                  </div>
                  <div className="customer-detail-row">
                    <MapPin size={15} />
                    <span className="label">Address</span>
                    <span>{customer.address}</span>
                  </div>
                  <div className="customer-detail-row">
                    <Wifi size={15} />
                    <span className="label">Plan</span>
                    <span style={{ fontWeight: 500 }}>{customer.plan}</span>
                  </div>
                  <div className="customer-detail-row">
                    <User size={15} />
                    <span className="label">Status</span>
                    <span style={{ color: customer.status === 'ACTIVE' ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 600 }}>
                      {customer.status === 'ACTIVE' ? '● Active' : '● Inactive'}
                    </span>
                  </div>
                </div>

                {customer.openTickets > 0 && (
                  <div style={{
                    margin: '0 16px 16px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12px',
                    color: '#fbbf24',
                    fontWeight: 500,
                  }}>
                    <AlertTriangle size={14} />
                    Customer has {customer.openTickets} existing open ticket(s)
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: Complaint Form */}
          <div className="data-card">
            <div className="data-card-header">
              <div className="data-card-title">Complaint Details</div>
              {priority && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                }}>
                  <span className={`priority-dot ${priority.toLowerCase()}`} />
                  {priority}
                  {slaHours > 0 && (
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      background: 'rgba(14, 165, 233, 0.1)',
                      color: 'var(--color-accent)',
                      fontSize: '11px',
                      fontWeight: 700,
                    }}>
                      <Clock size={11} style={{ display: 'inline', verticalAlign: '-1px', marginRight: '3px' }} />
                      SLA: {slaHours}h
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="data-card-body" style={{ padding: '24px' }}>
              <form ref={formRef} onSubmit={handleSubmit}>
                {/* Category + Sub-type */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select
                      ref={categorySelectRef}
                      className="form-select"
                      value={category}
                      onChange={e => handleCategoryChange(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && category) {
                          e.preventDefault()
                          subTypeSelectRef.current?.focus()
                        }
                      }}
                      disabled={!customer}
                      required
                    >
                      <option value="">Select category...</option>
                      {CATEGORIES.map(c => (
                        <option key={c.id} value={c.name}>{c.icon} {c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Sub-Type *</label>
                    <select
                      ref={subTypeSelectRef}
                      className="form-select"
                      value={subType}
                      onChange={e => {
                        setSubType(e.target.value)
                        if (e.target.value) {
                          setTimeout(() => snippetsWrapperRef.current?.focus(), 50)
                        }
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && subType) {
                          e.preventDefault()
                          snippetsWrapperRef.current?.focus()
                        }
                      }}
                      disabled={!category}
                      required
                    >
                      <option value="">Select issue type...</option>
                      {(SUBTYPES[category] || []).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Priority + SLA Info Bar */}
                {subType && customer && (
                  <div className="animate-fade-in" style={{
                    marginBottom: '20px',
                    padding: '14px 18px',
                    borderRadius: '10px',
                    background: 'var(--color-bg-surface)',
                    border: '1px solid var(--color-border)',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr 1fr',
                    gap: '16px',
                  }}>
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Priority</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className={`priority-dot ${priority.toLowerCase()}`} />
                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{priority}</span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>SLA Deadline</div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-accent)' }}>
                        {testSla ? `${testSla} Mins (Test)` : `${slaHours} Hours`}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Test Override</div>
                      <select 
                        ref={testSlaSelectRef}
                        value={testSla} 
                        onChange={e => setTestSla(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            snippetsWrapperRef.current?.focus()
                          }
                        }}
                        className="form-input" 
                        style={{ padding: '2px 8px', fontSize: '12px', height: 'auto', background: 'transparent' }}
                      >
                        <option value="">Default SLA</option>
                        <option value="1">1 Min SLA</option>
                        <option value="2">2 Min SLA</option>
                        <option value="5">5 Min SLA</option>
                        <option value="10">10 Min SLA</option>
                      </select>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Customer Type</div>
                      <span className={`category-badge ${customer.category.toLowerCase()}`}>{customer.category}</span>
                    </div>
                  </div>
                )}

                {/* Quick Snippets */}
                {subType && (
                  <div className="form-group animate-fade-in" style={{ marginBottom: '20px' }}>
                    <label className="form-label">Quick Insert Snippets</label>
                    <div 
                      ref={snippetsWrapperRef}
                      tabIndex={0}
                      onKeyDown={e => {
                        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                          e.preventDefault()
                          setSelectedSnippetIdx(p => p < SNIPPETS.length - 1 ? p + 1 : p)
                        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                          e.preventDefault()
                          setSelectedSnippetIdx(p => p > 0 ? p - 1 : 0)
                        } else if (e.key === 'Enter') {
                          e.preventDefault()
                          const snippet = SNIPPETS[selectedSnippetIdx]
                          setDescription(prev => prev ? `${prev}\n${snippet}` : snippet)
                          descRef.current?.focus()
                        }
                      }}
                      style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', outline: 'none' }}
                    >
                      {SNIPPETS.map((snippet, i) => (
                        <button
                          key={i}
                          type="button"
                          className="snippet-pill"
                          style={{
                            background: selectedSnippetIdx === i ? 'rgba(14, 165, 233, 0.2)' : undefined,
                            border: selectedSnippetIdx === i ? '1px solid rgba(14, 165, 233, 0.6)' : undefined,
                          }}
                          onClick={() => {
                            setDescription(prev => prev ? `${prev}\n${snippet}` : snippet)
                            descRef.current?.focus()
                          }}
                          onMouseEnter={() => setSelectedSnippetIdx(i)}
                        >
                          + {snippet}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label className="form-label">Description / Operator Notes *</label>
                  <textarea
                    ref={descRef}
                    className="form-textarea"
                    rows={5}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'ArrowUp') {
                        e.preventDefault()
                        snippetsWrapperRef.current?.focus()
                      } else if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        submitBtnRef.current?.focus()
                      }
                    }}
                    placeholder="Type details from customer call..."
                    required
                    disabled={!customer}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => { setCategory(''); setSubType(''); setDescription(''); setPriority('') }}>
                    Clear Form
                  </button>
                  <button
                    ref={submitBtnRef}
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={!customer || !category || !subType || !description || submitting}
                  >
                    {submitting ? (
                      <>Registering...</>
                    ) : (
                      <><Send size={16} /> Register Complaint</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
