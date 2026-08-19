'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getComplaints } from '@/actions/complaintStore'
import { CheckCircle2, CircleDashed, Users, MapPin, Phone, Clock, FileWarning, Zap } from 'lucide-react'

// Data models
type FeedItem = {
  id: string
  type: 'customer' | 'tech'
  ticketId: string
  timestamp: number
  customerName?: string
  phone?: string
  issue?: string
  slaHours?: number
  techName?: string
  location?: string
  status?: string
}

export default function PulseDesk() {
  const [complaints, setComplaints] = useState<any[]>([])
  
  // KPI Counters
  const [openCount, setOpenCount] = useState(0)
  const [workingCount, setWorkingCount] = useState(0)
  const [closedCount, setClosedCount] = useState(0)

  // Feeds
  const [customerFeed, setCustomerFeed] = useState<FeedItem[]>([])
  const [techFeed, setTechFeed] = useState<FeedItem[]>([])

  useEffect(() => {
    let isMounted = true
    const fetchData = async () => {
      try {
        const raw = await getComplaints()
        if (!isMounted) return

        // Compute KPIs
        let open = 0, working = 0, closed = 0
        raw.forEach(c => {
          if (c.status === 'RESOLVED') closed++
          else if (c.status === 'IN_PROGRESS' || c.status === 'PREMIUM') working++
          else open++
        })
        setOpenCount(open)
        setWorkingCount(working)
        setClosedCount(closed)

        // Customers feed: Sort by createdAt
        const custEvents = [...raw].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)).map(c => ({
          id: `c_${c.id}`,
          type: 'customer' as const,
          ticketId: c.id,
          timestamp: c.createdAt || Date.now(),
          customerName: c.customer,
          phone: c.phone,
          issue: c.issue,
          slaHours: c.slaHours || 4
        }))

        // Tech feed: Sort by assignedAt or resolvedAt to show tech activity
        const techEvents = [...raw].filter(c => c.tech && c.tech !== 'Unassigned').map(c => ({
          id: `t_${c.id}_${c.status}`,
          type: 'tech' as const,
          ticketId: c.id,
          timestamp: c.resolvedAt ? new Date(c.resolvedAt).getTime() : (c.acceptedAt ? new Date(c.acceptedAt).getTime() : (c.assignedAt || Date.now())),
          techName: c.tech,
          phone: c.phone,
          location: c.address,
          status: c.status
        })).sort((a, b) => a.timestamp - b.timestamp)

        // Keep only last 10 for each feed to fill 2 panels (5 cards each)
        setCustomerFeed(custEvents.slice(-10))
        setTechFeed(techEvents.slice(-10))

      } catch (e) {
        console.error("PulseDesk data fetch error:", e)
      }
    }

    fetchData()
    const timer = setInterval(fetchData, 3000)
    return () => { isMounted = false; clearInterval(timer) }
  }, [])

  // Slice into panels (Max 5 per panel)
  // Panel 1 & 2 (Customers)
  const custPanel1 = customerFeed.slice(0, Math.max(0, customerFeed.length - 5))
  const custPanel2 = customerFeed.slice(Math.max(0, customerFeed.length - 5))

  // Panel 3 & 4 (Techs)
  const techPanel1 = techFeed.slice(0, Math.max(0, techFeed.length - 5))
  const techPanel2 = techFeed.slice(Math.max(0, techFeed.length - 5))

  return (
    <div className="-m-[28px] p-6 min-h-[calc(100vh-64px)] bg-[#151a23] font-sans text-slate-300">
      {/* Header & KPIs */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide">PulseDesk Live</h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Global Dispatch Terminal</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-[#1d2430] border border-red-500/20 px-4 py-2 rounded-full">
            <CircleDashed size={12} className="text-red-400" />
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Open</span>
            <span className="text-[12px] font-bold text-white ml-2">{openCount}</span>
          </div>
          <div className="flex items-center gap-2 bg-[#1d2430] border border-blue-500/20 px-4 py-2 rounded-full">
            <Zap size={12} className="text-blue-400" />
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Working</span>
            <span className="text-[12px] font-bold text-white ml-2">{workingCount}</span>
          </div>
          <div className="flex items-center gap-2 bg-[#1d2430] border border-emerald-500/20 px-4 py-2 rounded-full">
            <CheckCircle2 size={12} className="text-emerald-400" />
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Closed</span>
            <span className="text-[12px] font-bold text-white ml-2">{closedCount}</span>
          </div>
        </div>
      </div>

      {/* 4-Column Waterfall Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 h-[calc(100vh-160px)]">
        
        {/* PANEL 1: CUSTOMERS (Older) */}
        <div className="flex flex-col gap-2 relative">
          <div className="text-[9px] uppercase tracking-widest text-slate-500 mb-2 font-semibold">Customer Complaints (Overflow)</div>
          <div className="flex-1 overflow-hidden relative">
            <div className="absolute inset-0 flex flex-col gap-2 justify-end">
              <AnimatePresence mode="popLayout">
                {custPanel1.map(item => <CustomerCard key={item.id} item={item} />)}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* PANEL 2: CUSTOMERS (Newer) */}
        <div className="flex flex-col gap-2 relative border-r border-slate-800/50 pr-4">
          <div className="text-[9px] uppercase tracking-widest text-slate-500 mb-2 font-semibold flex justify-between">
            <span>Customer Complaints (Live)</span>
            <span className="animate-pulse text-emerald-500">● LIVE</span>
          </div>
          <div className="flex-1 overflow-hidden relative">
            <div className="absolute inset-0 flex flex-col gap-2 justify-end">
              <AnimatePresence mode="popLayout">
                {custPanel2.map(item => <CustomerCard key={item.id} item={item} />)}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* PANEL 3: TECHNICIANS (Older) */}
        <div className="flex flex-col gap-2 relative pl-2">
          <div className="text-[9px] uppercase tracking-widest text-slate-500 mb-2 font-semibold">Technician Dispatch (Overflow)</div>
          <div className="flex-1 overflow-hidden relative">
            <div className="absolute inset-0 flex flex-col gap-2 justify-end">
              <AnimatePresence mode="popLayout">
                {techPanel1.map(item => <TechCard key={item.id} item={item} />)}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* PANEL 4: TECHNICIANS (Newer) */}
        <div className="flex flex-col gap-2 relative">
          <div className="text-[9px] uppercase tracking-widest text-slate-500 mb-2 font-semibold flex justify-between">
            <span>Technician Dispatch (Live)</span>
            <span className="animate-pulse text-blue-500">● LIVE</span>
          </div>
          <div className="flex-1 overflow-hidden relative">
            <div className="absolute inset-0 flex flex-col gap-2 justify-end">
              <AnimatePresence mode="popLayout">
                {techPanel2.map(item => <TechCard key={item.id} item={item} />)}
              </AnimatePresence>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

function CustomerCard({ item }: { item: FeedItem }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-[#1d2430] border border-[#2a3441] rounded-md p-3 shrink-0"
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center border border-slate-700">
            <span className="text-[8px] font-mono text-slate-400">CBS</span>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-300">{item.ticketId}</span>
        </div>
        <div className="flex items-center gap-1 text-slate-500 text-[8px]">
          <Clock size={10} />
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      
      <div className="grid grid-cols-[60px_1fr] gap-y-2 items-center">
        <div className="text-[8px] text-slate-500 flex items-center gap-1"><Users size={10}/> Cust</div>
        <div className="text-[9px] text-white font-semibold">{item.customerName}</div>
        
        <div className="text-[8px] text-slate-500 flex items-center gap-1"><Phone size={10}/> Phone</div>
        <div className="text-[9px] text-slate-400 font-mono">{item.phone || 'N/A'}</div>
        
        <div className="text-[8px] text-slate-500 flex items-center gap-1"><FileWarning size={10}/> Issue</div>
        <div className="text-[9px] text-red-400 font-medium">{item.issue}</div>
      </div>

      <div className="mt-3 pt-2 border-t border-slate-800 flex justify-between items-center">
        <div className="text-[8px] text-slate-500 flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          NEW COMPLAINT
        </div>
        <div className="flex items-center gap-1 border border-orange-500/20 bg-orange-500/5 px-2 py-0.5 rounded text-[8px] text-orange-400 font-bold tracking-wider">
          {item.slaHours} HOURS
        </div>
      </div>
    </motion.div>
  )
}

function TechCard({ item }: { item: FeedItem }) {
  const isResolved = item.status === 'RESOLVED'
  const isWorking = item.status === 'IN_PROGRESS' || item.status === 'PREMIUM'
  
  // Custom Tailwind arbitrary values don't always work nicely in dynamic class strings without a full safelist, 
  // so we'll use style objects or static maps if we want to be safe. But we can use predefined utility strings safely.
  const borderColor = isResolved ? 'border-emerald-500/20' : isWorking ? 'border-blue-500/20' : 'border-slate-500/20'
  const bgColor = isResolved ? 'bg-emerald-500/5' : isWorking ? 'bg-blue-500/5' : 'bg-slate-500/5'
  const textColor = isResolved ? 'text-emerald-400' : isWorking ? 'text-blue-400' : 'text-slate-400'
  const dotColor = isResolved ? 'bg-emerald-500' : isWorking ? 'bg-blue-500' : 'bg-slate-500'
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-[#1d2430] border border-[#2a3441] rounded-md p-3 shrink-0"
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center border border-slate-700">
            <span className="text-[8px] font-mono text-slate-400">TCH</span>
          </div>
          <span className="text-[10px] font-mono font-bold text-slate-300">{item.ticketId}</span>
        </div>
        <div className="flex items-center gap-1 text-slate-500 text-[8px]">
          <Clock size={10} />
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      
      <div className="grid grid-cols-[60px_1fr] gap-y-2 items-center">
        <div className="text-[8px] text-slate-500 flex items-center gap-1"><Users size={10}/> Tech</div>
        <div className="text-[9px] text-white font-semibold">{item.techName}</div>
        
        <div className="text-[8px] text-slate-500 flex items-center gap-1"><Phone size={10}/> Phone</div>
        <div className="text-[9px] text-slate-400 font-mono">{item.phone || 'N/A'}</div>
        
        <div className="text-[8px] text-slate-500 flex items-center gap-1"><MapPin size={10}/> Dest</div>
        <div className="text-[9px] text-slate-400 truncate">{item.location || 'Unknown'}</div>
      </div>

      <div className="mt-3 pt-2 border-t border-slate-800 flex justify-between items-center">
        <div className="text-[8px] text-slate-500 flex items-center gap-1">
          <div className={`w-1.5 h-1.5 rounded-full ${dotColor} ${isWorking ? 'animate-pulse' : ''}`}></div>
          {isResolved ? 'JOB COMPLETED' : 'DISPATCH EVENT'}
        </div>
        <div className={`flex items-center gap-1 border ${borderColor} ${bgColor} px-2 py-0.5 rounded text-[8px] ${textColor} font-bold tracking-wider uppercase`}>
          {item.status?.replace('_', ' ') || 'ASSIGNED'}
        </div>
      </div>
    </motion.div>
  )
}
