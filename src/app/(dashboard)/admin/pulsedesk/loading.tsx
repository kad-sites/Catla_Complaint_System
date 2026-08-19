export default function Loading() {
  return (
    <div className="flex-1 p-6 pb-8 flex flex-col h-full overflow-hidden" style={{ backgroundColor: 'var(--color-bg-app)' }}>
      {/* KPI Banner skeleton */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', paddingTop: '6px', paddingBottom: '20px' }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton-pulse" style={{ width: '160px', height: '36px', borderRadius: '6px' }} />
        ))}
      </div>

      {/* 4-column grid skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', flex: 1, minHeight: 0 }}>
        {[1, 2, 3, 4].map(col => (
          <div key={col} style={{ 
            borderRadius: '12px', 
            border: '1px solid var(--color-border)', 
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column' as const,
          }}>
            {/* Column header */}
            <div className="skeleton-pulse" style={{ height: '35px', borderBottom: '1px solid var(--color-border)' }} />
            {/* Card placeholders */}
            <div style={{ padding: '8px', display: 'flex', flexDirection: 'column' as const, gap: '8px' }}>
              {[1, 2].map(card => (
                <div key={card} className="skeleton-pulse" style={{ height: '90px', borderRadius: '6px' }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
