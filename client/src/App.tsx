import { useState, useEffect } from 'react'
import { Wallet, Package, TrendingUp, Users, LogOut, Loader2, ArrowUpRight, Zap, ArrowLeft } from 'lucide-react'
import { TradingGame } from './components/TradingGame'
import { LandingPage } from './components/LandingPage'

// Types
interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface PackageType {
  id: string;
  name: string;
  price_sui: string;
  roi_percent: string;
  duration_days: number;
  status: string;
}

interface WalletData {
  deposit_wallet: string;
  earnings_wallet: string;
  commission_wallet: string;
}

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [packages, setPackages] = useState<PackageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Auth Form State
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [sponsor, setSponsor] = useState('');
  
  // Landing / Demo State
  const [showDemo, setShowDemo] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  // Admin State
  const [newPackage, setNewPackage] = useState({ name: '', price: '', roi: '', days: '' });

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [meRes, walletRes, pkgRes] = await Promise.all([
        fetch('/api/me', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/wallet', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/packages')
      ]);

      if (!meRes.ok) {
        logout();
        return;
      }

      const meData = await meRes.json();
      const walletData = await walletRes.json();
      const pkgData = await pkgRes.json();

      setUser(meData.user);
      setWallet(walletData);
      setPackages(pkgData.packages);
    } catch (error) {
      console.error(error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const createPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm('Create this package?')) return;
    try {
      const res = await fetch('/api/packages/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          name: newPackage.name,
          price_sui: newPackage.price,
          roi_percent: newPackage.roi,
          duration_days: parseInt(newPackage.days)
        })
      });
      if (res.ok) {
        alert('Package Created');
        setNewPackage({ name: '', price: '', roi: '', days: '' });
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (err) {
      alert('Failed to create package');
    }
  };

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setShowAuth(false); // Close auth view
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const register = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, sponsorReferralCode: sponsor || undefined })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Registration successful! Please login.');
        setIsLogin(true);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setWallet(null);
    setShowDemo(false);
  };

  const purchase = async (pkgId: string) => {
    if (!confirm('Confirm purchase?')) return;
    try {
      const res = await fetch('/api/packages/purchase', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ packageId: pkgId })
      });
      if (res.ok) {
        alert('Package Activated!');
        fetchData(); // Refresh wallet
      } else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (err) {
      alert('Purchase failed');
    }
  };

  // --- Render Logic ---

  if (!token) {
    // 1. Show Auth Form
    if (showAuth) {
      return (
        <div className="auth-container">
          <div className="auth-card">
            <div style={{display: 'flex', alignItems: 'center', marginBottom: '1rem', cursor: 'pointer'}} onClick={() => setShowAuth(false)}>
               <ArrowLeft size={20} /> <span style={{marginLeft: '0.5rem'}}>Back</span>
            </div>
            <h1>SUI24</h1>
            <p>{isLogin ? 'Login to your account' : 'Create a new account'}</p>
            
            <form onSubmit={isLogin ? login : register}>
              {!isLogin && (
                <input 
                  type="text" 
                  placeholder="Username" 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                />
              )}
              <input 
                type="email" 
                placeholder="Email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              {!isLogin && (
                <input 
                  type="text" 
                  placeholder="Sponsor Code (Optional)" 
                  value={sponsor}
                  onChange={e => setSponsor(e.target.value)}
                />
              )}
              <button type="submit" disabled={loading}>
                {loading ? <Loader2 className="spin" /> : (isLogin ? 'Login' : 'Register')}
              </button>
            </form>
            
            <p className="toggle-auth" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
            </p>
          </div>
        </div>
      );
    }

    // 2. Show Demo Mode
    if (showDemo) {
      return (
        <div className="dashboard">
          <nav className="sidebar">
            <div className="logo">
              <TrendingUp size={28} /> SUI24
            </div>
            <div className="menu">
              <button className="menu-item active">
                <Zap size={20} /> 1000x Futures
              </button>
              <button className="menu-item" onClick={() => setShowAuth(true)}>
                <Users size={20} /> Login to Save
              </button>
            </div>
            <div className="user-info">
              <div className="avatar">D</div>
              <div className="details">
                <span className="name">Demo User</span>
                <span className="role">Guest</span>
              </div>
              <button onClick={() => setShowDemo(false)} className="logout-btn" title="Exit Demo"><LogOut size={16} /></button>
            </div>
          </nav>

          <main className="content">
            <header>
              <h2>1000x Futures (Demo)</h2>
              <div className="status-badge">System Online</div>
            </header>
            <TradingGame 
              token={null} 
              realBalance={0}
              onTrade={() => {}} 
            />
          </main>
        </div>
      );
    }

    // 3. Show Landing Page
    return <LandingPage onPlay={() => setShowDemo(true)} onLogin={() => setShowAuth(true)} />;
  }

  // --- Authenticated Dashboard ---

  return (
    <div className="dashboard">
      <nav className="sidebar">
        <div className="logo">
          <TrendingUp size={28} /> SUI24
        </div>
        <div className="menu">
          <button className={`menu-item ${activeTab === 'trade' ? 'active' : ''}`} onClick={() => setActiveTab('trade')}>
            <Zap size={20} /> 1000x Futures
          </button>
          <button className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <TrendingUp size={20} /> Dashboard
          </button>
          <button className={`menu-item ${activeTab === 'packages' ? 'active' : ''}`} onClick={() => setActiveTab('packages')}>
            <Package size={20} /> Packages
          </button>
          <button className={`menu-item ${activeTab === 'wallet' ? 'active' : ''}`} onClick={() => setActiveTab('wallet')}>
            <Wallet size={20} /> Wallet
          </button>
          {user?.role === 'admin' && (
            <button className={`menu-item ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => setActiveTab('admin')}>
              <Users size={20} /> Admin Panel
            </button>
          )}
        </div>
        <div className="user-info">
          <div className="avatar">{user?.username?.[0]?.toUpperCase()}</div>
          <div className="details">
            <span className="name">{user?.username}</span>
            <span className="role">{user?.role}</span>
          </div>
          <button onClick={logout} className="logout-btn" title="Logout"><LogOut size={16} /></button>
        </div>
      </nav>

      <main className="content">
        <header>
          <h2>{activeTab === 'admin' ? 'Admin Panel' : activeTab === 'trade' ? '1000x Futures' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
          <div className="status-badge">System Online</div>
        </header>

        {loading && <div style={{textAlign: 'center', padding: '2rem'}}>Loading...</div>}

        {!loading && activeTab === 'trade' ? (
          <TradingGame 
            token={token} 
            realBalance={parseFloat(wallet?.deposit_wallet || '0')}
            onTrade={fetchData} 
          />
        ) : !loading && activeTab === 'admin' && user?.role === 'admin' ? (
          <div className="admin-panel">
            <h3>Create New Package</h3>
            <form onSubmit={createPackage} className="admin-form">
              <div className="form-group">
                <label>Package Name</label>
                <input value={newPackage.name} onChange={e => setNewPackage({...newPackage, name: e.target.value})} placeholder="e.g. VIP Plan" required />
              </div>
              <div className="form-group">
                <label>Price (SUI)</label>
                <input type="number" value={newPackage.price} onChange={e => setNewPackage({...newPackage, price: e.target.value})} placeholder="1000" required />
              </div>
              <div className="form-group">
                <label>Daily ROI (%)</label>
                <input type="number" step="0.1" value={newPackage.roi} onChange={e => setNewPackage({...newPackage, roi: e.target.value})} placeholder="1.5" required />
              </div>
              <div className="form-group">
                <label>Duration (Days)</label>
                <input type="number" value={newPackage.days} onChange={e => setNewPackage({...newPackage, days: e.target.value})} placeholder="30" required />
              </div>
              <button type="submit" className="create-btn">Create Package</button>
            </form>
          </div>
        ) : !loading && (
          <>
            {/* Wallet Cards */}
            <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon deposit"><Wallet size={24} /></div>
            <div className="stat-info">
              <span className="label">Deposit Wallet</span>
              <span className="value">{parseFloat(wallet?.deposit_wallet || '0').toFixed(2)} SUI</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon earnings"><TrendingUp size={24} /></div>
            <div className="stat-info">
              <span className="label">Earnings Wallet</span>
              <span className="value">{parseFloat(wallet?.earnings_wallet || '0').toFixed(2)} SUI</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon commission"><Users size={24} /></div>
            <div className="stat-info">
              <span className="label">Commission Wallet</span>
              <span className="value">{parseFloat(wallet?.commission_wallet || '0').toFixed(2)} SUI</span>
            </div>
          </div>
        </div>

        {/* Packages Section */}
        <h3>Investment Packages</h3>
        {packages.length === 0 ? (
          <p style={{color: 'var(--text-secondary)'}}>No packages available.</p>
        ) : (
          <div className="packages-grid">
            {packages.map(pkg => (
              <div key={pkg.id} className="package-card">
                <div className="pkg-header">
                  <h4>{pkg.name}</h4>
                  <span className="pkg-price">{parseFloat(pkg.price_sui).toFixed(0)} SUI</span>
                </div>
                <ul className="pkg-features">
                  <li><span>ROI</span> <strong>{pkg.roi_percent}% Daily</strong></li>
                  <li><span>Duration</span> <strong>{pkg.duration_days} Days</strong></li>
                  <li><span>Total Return</span> <strong>{(parseFloat(pkg.roi_percent) * pkg.duration_days).toFixed(1)}%</strong></li>
                </ul>
                <button onClick={() => purchase(pkg.id)} className="buy-btn">
                  Activate Plan <ArrowUpRight size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
        </>
        )}
      </main>
    </div>
  )
}

export default App
