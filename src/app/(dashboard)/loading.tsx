export default function Loading() {
  return (
    <div className="flex-1 p-6 pb-8 flex flex-col h-full overflow-hidden" style={{ backgroundColor: 'var(--color-bg-app)' }}>
      {/* Header skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <div className="skeleton-pulse" style={{ width: '180px', height: '18px', borderRadius: '4px', marginBottom: '6px' }} />
          <div className="skeleton-pulse" style={{ width: '260px', height: '12px', borderRadius: '4px' }} />
        </div>
        <div className="skeleton-pulse" style={{ width: '140px', height: '36px', borderRadius: '8px' }} />
      </div>

      {/* Stats row skeleton */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="skeleton-pulse" style={{ flex: 1, height: '80px', borderRadius: '12px' }} />
        ))}
      </div>

      {/* Table skeleton */}
      <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-border)', flex: 1 }}>
        <div className="skeleton-pulse" style={{ height: '40px', borderBottom: '1px solid var(--color-border)' }} />
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ display: 'flex', gap: '16px', padding: '14px 16px', borderBottom: '1px solid rgba(30,41,59,0.3)' }}>
            <div className="skeleton-pulse" style={{ width: '60px', height: '14px', borderRadius: '4px' }} />
            <div className="skeleton-pulse" style={{ width: '120px', height: '14px', borderRadius: '4px' }} />
            <div className="skeleton-pulse" style={{ flex: 1, height: '14px', borderRadius: '4px' }} />
            <div className="skeleton-pulse" style={{ width: '80px', height: '14px', borderRadius: '4px' }} />
            <div className="skeleton-pulse" style={{ width: '80px', height: '14px', borderRadius: '4px' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
