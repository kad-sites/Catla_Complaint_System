'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Navigation, Phone, Clock, MapPin, Truck, Signal } from 'lucide-react'

// Dynamically import map to avoid SSR issues with Leaflet
const TrackingMap = dynamic(() => import('@/components/TrackingMap'), { ssr: false })

const TECHNICIANS = [
  {
    id: 't1', name: 'Amit Singh', phone: '+91-9876543210', vehicle: 'Bike',
    status: 'en-route' as const, speed: '32 km/h',
    lat: 26.1450, lng: 91.7310, heading: 'GS Road',
    activeJob: 'CBS-00042', customer: 'Rajesh Kumar',
    lastUpdate: '12s ago',
  },
  {
    id: 't2', name: 'Suresh Pal', phone: '+91-9812345678', vehicle: 'Bike',
    status: 'on-site' as const, speed: '0 km/h',
    lat: 26.1380, lng: 91.7450, heading: 'Dispur',
    activeJob: 'CBS-00039', customer: 'Govt Office Sec-5',
    lastUpdate: '5s ago',
  },
  {
    id: 't3', name: 'Vikram Jha', phone: '+91-9999888877', vehicle: 'Car',
    status: 'en-route' as const, speed: '48 km/h',
    lat: 26.1550, lng: 91.7250, heading: 'Fancy Bazar',
    activeJob: 'CBS-00041', customer: 'TechCorp Pvt Ltd',
    lastUpdate: '8s ago',
  },
  {
    id: 't4', name: 'Ravi Kumar', phone: '+91-9090909099', vehicle: 'Bike',
    status: 'idle' as const, speed: '0 km/h',
    lat: 26.1445, lng: 91.7362, heading: 'Office / Base',
    activeJob: null, customer: null,
    lastUpdate: '2m ago',
  },
]

export type Technician = typeof TECHNICIANS[number]

export default function TrackingPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const [techs, setTechs] = useState(TECHNICIANS)

  // Simulate movement every 3s
  useEffect(() => {
    const interval = setInterval(() => {
      setTechs(prev => prev.map(t => {
        if (t.status === 'en-route') {
          return {
            ...t,
            lat: t.lat + (Math.random() - 0.5) * 0.002,
            lng: t.lng + (Math.random() - 0.5) * 0.002,
            speed: `${Math.floor(20 + Math.random() * 40)} km/h`,
            lastUpdate: 'just now',
          }
        }
        return { ...t, lastUpdate: t.lastUpdate }
      }))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const statusColor = (s: string) =>
    s === 'en-route' ? '#f59e0b' : s === 'on-site' ? '#10b981' : '#64748b'

  const statusLabel = (s: string) =>
    s === 'en-route' ? '🚗 En Route' : s === 'on-site' ? '📍 On Site' : '⏸ Idle'

  return (
    <>
      <div className="animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
              Live Tracking
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
              Real-time technician locations · {techs.filter(t => t.status !== 'idle').length} active in field
            </p>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 12px', borderRadius: '6px',
            background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)',
            fontSize: '12px', fontWeight: 600, color: '#34d399',
          }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)' }} />
            GPS Live
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '16px', height: 'calc(100vh - 160px)' }}>
          {/* Technician List */}
          <div style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{
              padding: '14px 16px',
              borderBottom: '1px solid var(--color-border)',
              fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)',
              textTransform: 'uppercase', letterSpacing: '1.5px',
            }}>
              Field Technicians ({techs.length})
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {techs.map(tech => (
                <div
                  key={tech.id}
                  onClick={() => setSelected(tech.id === selected ? null : tech.id)}
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid var(--color-border)',
                    cursor: 'pointer',
                    background: selected === tech.id ? 'rgba(14, 165, 233, 0.08)' : 'transparent',
                    borderLeft: selected === tech.id ? '3px solid #0ea5e9' : '3px solid transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: statusColor(tech.status),
                        boxShadow: tech.status !== 'idle' ? `0 0 6px ${statusColor(tech.status)}40` : 'none',
                      }} />
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{tech.name}</span>
                    </div>
                    <span style={{
                      fontSize: '10px', padding: '2px 8px', borderRadius: '10px',
                      background: `${statusColor(tech.status)}20`, color: statusColor(tech.status),
                      fontWeight: 600,
                    }}>
                      {statusLabel(tech.status)}
                    </span>
                  </div>

                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Truck size={11} /> {tech.vehicle} · {tech.speed}
                  </div>

                  {tech.activeJob && (
                    <div style={{
                      marginTop: '8px', padding: '8px 10px',
                      background: 'var(--color-bg-app)', borderRadius: '8px',
                      fontSize: '11px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontFamily: 'monospace', color: '#0ea5e9' }}>{tech.activeJob}</span>
                        <span style={{ color: 'var(--color-text-muted)' }}>{tech.lastUpdate}</span>
                      </div>
                      <div style={{ color: 'var(--color-text-secondary)' }}>
                        <MapPin size={10} style={{ display: 'inline', marginRight: '4px' }} />
                        {tech.heading} · {tech.customer}
                      </div>
                    </div>
                  )}

                  {selected === tech.id && (
                    <div style={{ marginTop: '10px', display: 'flex', gap: '6px' }}>
                      <a href={`tel:${tech.phone}`} className="btn btn-secondary btn-sm" style={{ flex: 1, fontSize: '11px', textDecoration: 'none', textAlign: 'center' }}>
                        <Phone size={12} /> Call
                      </a>
                      <button className="btn btn-primary btn-sm" style={{ flex: 1, fontSize: '11px' }}>
                        <Navigation size={12} /> Track
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Map */}
          <div style={{
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            overflow: 'hidden',
            position: 'relative',
          }}>
            <TrackingMap techs={techs} selected={selected} onSelect={setSelected} />
          </div>
        </div>
      </div>
    </>
  )
}
