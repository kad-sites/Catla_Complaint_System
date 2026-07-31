'use client'

import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

type Tech = {
  id: string
  name: string
  status: string
  lat: number
  lng: number
  activeJob: string | null
  customer: string | null
  vehicle: string
  speed: string
}

function markerColor(status: string) {
  return status === 'en-route' ? '#f59e0b' : status === 'on-site' ? '#10b981' : '#64748b'
}

function createIcon(tech: Tech, isSelected: boolean) {
  const color = markerColor(tech.status || 'idle')
  const size = isSelected ? 36 : 28
  const vtype = (tech.vehicle || 'Bike').toLowerCase()
  const emoji = vtype === 'car' ? '🚗' : '🛵'
  
  return L.divIcon({
    className: 'custom-tech-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `
      <div style="
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: white;
        border: 3px solid ${color};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${size - 12}px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        ${isSelected ? 'transform: scale(1.2); z-index: 1000;' : ''}
      ">
        ${emoji}
      </div>
    `
  })
}

export default function TrackingMap({
  techs,
  selected,
  onSelect,
}: {
  techs: Tech[]
  selected: string | null
  onSelect: (id: string | null) => void
}) {
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<Record<string, L.Marker>>({})
  const containerRef = useRef<HTMLDivElement>(null)

  // Init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: [26.1445, 91.7362], // Guwahati City
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map)

    L.control.zoom({ position: 'topright' }).addTo(map)

    // Attribution in corner
    L.control.attribution({ position: 'bottomright', prefix: false })
      .addAttribution('© OpenStreetMap © CARTO')
      .addTo(map)

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      markersRef.current = {} // MUST clear markers for React 18 strict mode
    }
  }, [])

  // Update markers
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    techs.forEach(tech => {
      const existing = markersRef.current[tech.id]
      const icon = createIcon(tech, tech.id === selected)

      if (existing) {
        existing.setLatLng([tech.lat, tech.lng])
        existing.setIcon(icon)
        existing.setTooltipContent(`${tech.name} · ${tech.speed}`)
      } else {
        const marker = L.marker([tech.lat, tech.lng], { icon })
          .addTo(map)
          .bindTooltip(`${tech.name} · ${tech.speed}`, {
            direction: 'top',
            offset: [0, -14],
            className: 'tech-tooltip',
          })
          .on('click', () => onSelect(tech.id === selected ? null : tech.id))

        markersRef.current[tech.id] = marker
      }
    })
  }, [techs, selected, onSelect])

  // Pan to selected
  useEffect(() => {
    if (!selected || !mapRef.current) return
    const tech = techs.find(t => t.id === selected)
    if (tech) {
      mapRef.current.flyTo([tech.lat, tech.lng], 17, { duration: 0.5 })
    }
  }, [selected, techs])

  return (
    <>
      <style>{`
        .custom-tech-marker {
          background: transparent !important;
          border: none !important;
        }
        .tech-tooltip {
          background: #111827 !important;
          border: 1px solid #1e293b !important;
          color: #f1f5f9 !important;
          font-size: 11px !important;
          font-weight: 600 !important;
          padding: 4px 10px !important;
          border-radius: 6px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4) !important;
        }
        .tech-tooltip::before {
          border-top-color: #1e293b !important;
        }
        .leaflet-control-zoom a {
          background: #111827 !important;
          color: #f1f5f9 !important;
          border-color: #1e293b !important;
        }
      `}</style>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </>
  )
}
