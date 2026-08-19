export default function Loading() {
  return (
    <div className="flex-1 p-6 pb-8 flex flex-col h-full overflow-hidden" style={{ backgroundColor: 'var(--color-bg-app)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <div className="skeleton-pulse" style={{ width: '160px', height: '16px', borderRadius: '4px', marginBottom: '6px' }} />
          <div className="skeleton-pulse" style={{ width: '200px', height: '11px', borderRadius: '4px' }} />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div className="skeleton-pulse" style={{ width: '36px', height: '36px', borderRadius: '8px' }} />
          <div className="skeleton-pulse" style={{ width: '100px', height: '36px', borderRadius: '8px' }} />
        </div>
      </div>

      {/* Table */}
      <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-border)', flex: 1 }}>
        <div className="skeleton-pulse" style={{ height: '42px', borderBottom: '1px solid var(--color-border)' }} />
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div key={i} style={{ display: 'flex', gap: '16px', padding: '12px 16px', borderBottom: '1px solid rgba(30,41,59,0.3)' }}>
            <div className="skeleton-pulse" style={{ width: '55px', height: '12px', borderRadius: '4px' }} />
            <div className="skeleton-pulse" style={{ width: '110px', height: '12px', borderRadius: '4px' }} />
            <div className="skeleton-pulse" style={{ flex: 1, height: '12px', borderRadius: '4px' }} />
            <div className="skeleton-pulse" style={{ width: '70px', height: '12px', borderRadius: '4px' }} />
            <div className="skeleton-pulse" style={{ width: '90px', height: '12px', borderRadius: '4px' }} />
            <div className="skeleton-pulse" style={{ width: '70px', height: '24px', borderRadius: '6px' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
