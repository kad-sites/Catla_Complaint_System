const fs = require('fs');
const content = fs.readFileSync('src/app/technician/page.tsx', 'utf8');

const oldState = `  const [loggedInTech, setLoggedInTech] = useState<string | null>(null)
  const [availableTechs, setAvailableTechs] = useState<string[]>([])`;

const newState = `  const [loggedInTech, setLoggedInTech] = useState<string | null>(null)
  const [availableTechs, setAvailableTechs] = useState<string[]>([])
  const [isLoadingApp, setIsLoadingApp] = useState(true)
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [loginError, setLoginError] = useState('')`;

const oldEffect = `  useEffect(() => {
    if (loggedInTech) return
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
      }
    }
    loadTechs()
  }, [loggedInTech])`;

const newEffect = `  useEffect(() => {
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
  }, [loggedInTech])`;

const oldLoginScreen = `  if (!loggedInTech) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-app)', color: 'var(--color-text-primary)' }}>
        <div style={{ padding: '32px', background: 'var(--color-bg-card)', borderRadius: '16px', border: '1px solid var(--color-border)', width: '90%', maxWidth: '400px', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)', borderRadius: '16px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wrench size={32} color="white" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Technician App</h1>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px', fontSize: '14px' }}>Select your profile to continue</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {availableTechs.map(tech => (
              <button key={tech} onClick={() => setLoggedInTech(tech)} style={{ padding: '16px', background: '#1a2236', border: '1px solid #2d3a4f', borderRadius: '12px', color: 'var(--color-text-primary)', fontWeight: 600, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(14, 165, 233, 0.2)', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{tech.split(' ').map(n => n[0]).join('')}</div>
                {tech}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }`;

const newLoginScreen = `  if (isLoadingApp) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-app)' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid var(--color-border)', borderTop: '4px solid var(--color-accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{\`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }\`}</style>
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
        <div style={{ padding: '32px', background: 'var(--color-bg-card)', borderRadius: '16px', border: '1px solid var(--color-border)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', background: 'var(--color-accent)', borderRadius: '16px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Wrench size={32} color="white" />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Technician App</h1>
          
          {!selectedProfile ? (
            <>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px', fontSize: '14px' }}>Select your profile to continue</p>
              {availableTechs.length === 0 ? (
                <div style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '12px' }}>
                  No active technicians found.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {availableTechs.map(tech => (
                    <button key={tech} onClick={() => setSelectedProfile(tech)} style={{ padding: '16px', background: 'var(--color-bg-app)', border: '1px solid var(--color-border)', borderRadius: '12px', color: 'var(--color-text-primary)', fontWeight: 600, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'all 0.2s' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'color-mix(in srgb, var(--color-accent) 20%, transparent)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{tech.split(' ').map(n => n[0]).join('')}</div>
                      {tech}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--color-bg-app)', borderRadius: '12px', border: '1px solid var(--color-border)', marginBottom: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'color-mix(in srgb, var(--color-accent) 20%, transparent)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                  {selectedProfile.split(' ').map(n => n[0]).join('')}
                </div>
                <div style={{ flex: 1, fontWeight: 600 }}>{selectedProfile}</div>
                <button type="button" onClick={() => { setSelectedProfile(null); setPassword(''); setLoginError(''); }} style={{ background: 'none', border: 'none', color: '#0ea5e9', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>Change</button>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password" 
                  autoFocus
                  style={{ width: '100%', padding: '14px', background: 'var(--color-bg-app)', border: '1px solid var(--color-border)', borderRadius: '8px', color: 'var(--color-text-primary)', fontSize: '16px' }}
                />
              </div>

              {loginError && <div style={{ color: '#ef4444', fontSize: '13px', textAlign: 'center' }}>{loginError}</div>}

              <button type="submit" disabled={isVerifying || !password} className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '16px', fontWeight: 700, marginTop: '8px', opacity: (isVerifying || !password) ? 0.7 : 1 }}>
                {isVerifying ? 'Verifying...' : 'Login'}
              </button>
            </form>
          )}
        </div>
      </div>
    )
  }`;

const oldLogout = `onClick={() => setLoggedInTech(null)}`;
const newLogout = `onClick={() => { localStorage.removeItem('loggedInTech'); setLoggedInTech(null); }}`;

let updated = content.replace(oldState, newState);
updated = updated.replace(oldEffect, newEffect);
updated = updated.replace(oldLoginScreen, newLoginScreen);
updated = updated.replace(oldLogout, newLogout);

fs.writeFileSync('src/app/technician/page.tsx', updated);
console.log('Patched technician page!');
