'use client'

export function BootSplash({ visible }: { visible: boolean }) {
  if (!visible) return null

  return (
    <div
      id="boot-splash"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#FDF8F0',
        transition: 'opacity 0.2s ease-out',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <div style={{ position: 'relative', width: '64px', height: '64px' }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '4px solid rgba(232,116,12,0.2)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '4px solid transparent',
              borderTopColor: '#E8740C',
              animation: 'spin 1s linear infinite',
            }}
          />
        </div>
        <img
          src="/logo.png"
          alt="Divine Travel"
          style={{ height: '40px', width: 'auto', objectFit: 'contain' }}
          draggable={false}
        />
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
