import React from 'react';
import { 
  Zap, Shield, Rocket, ArrowRight, Wallet, 
  TrendingUp, Globe, Smartphone, Lock, 
  Users, Award, BarChart3, CheckCircle, 
  Cpu, Activity, CreditCard 
} from 'lucide-react';
import './LandingPage.css';

interface LandingPageProps {
  onPlay: () => void;
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onPlay, onLogin }) => {
  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="logo-container">
          <div className="logo-glow">
            <img src="/logo.png" alt="SUI24 Logo" className="logo-img" />
          </div>
          <div className="logo-text">
            <span className="brand">SUI24</span>
            <span className="tagline">TRADING & AI</span>
          </div>
        </div>
        <div className="nav-links">
          <button onClick={onLogin} className="btn-login">Login</button>
          <button onClick={onPlay} className="btn-play">Play Demo</button>
        </div>
      </nav>

      {/* Live Price Ticker */}
      <div className="price-ticker">
        <div className="ticker-track">
          <span className="ticker-item">SUI <span className="text-green">$1.85 (+5.2%)</span></span>
          <span className="ticker-item">BTC <span className="text-green">$65,420 (+2.1%)</span></span>
          <span className="ticker-item">ETH <span className="text-green">$3,510 (+1.8%)</span></span>
          <span className="ticker-item">SOL <span className="text-green">$148.50 (+4.5%)</span></span>
          <span className="ticker-item">BNB <span className="text-green">$605.20 (+0.9%)</span></span>
          {/* Duplicate for loop */}
          <span className="ticker-item">SUI <span className="text-green">$1.85 (+5.2%)</span></span>
          <span className="ticker-item">BTC <span className="text-green">$65,420 (+2.1%)</span></span>
          <span className="ticker-item">ETH <span className="text-green">$3,510 (+1.8%)</span></span>
          <span className="ticker-item">SOL <span className="text-green">$148.50 (+4.5%)</span></span>
          <span className="ticker-item">BNB <span className="text-green">$605.20 (+0.9%)</span></span>
        </div>
      </div>

      {/* 1. HERO SECTION */}
      <section className="hero">
        <div className="hero-content">
          <div className="badge-pill">
            <span className="pulse-dot"></span> Ultimate Crypto Future Arena
          </div>
          <h1>SUI24 – <br /><span className="text-gradient">Trading & AI</span></h1>
          <p className="hero-sub">
            The Future of AI-Powered Digital Trading and Smart Earnings.
          </p>
          
          <div className="cta-group">
            <button onClick={onLogin} className="btn-primary-lg">
              Start Earning <ArrowRight size={20} />
            </button>
            <button onClick={onPlay} className="btn-secondary-lg">
              View Dashboard
            </button>
          </div>
          
          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-val">24/7</span>
              <span className="stat-label">AI Monitoring</span>
            </div>
            <div className="stat-item">
              <span className="stat-val">0%</span>
              <span className="stat-label">Hidden Fees</span>
            </div>
            <div className="stat-item">
              <span className="stat-val">1000x</span>
              <span className="stat-label">Leverage</span>
            </div>
          </div>
        </div>
        
        <div className="hero-visual">
          <div className="glass-card trading-preview">
            <div className="card-header">
              <div className="coin-icon">SUI</div>
              <div className="live-status">LIVE</div>
            </div>
            <div className="chart-placeholder">
              <svg viewBox="0 0 300 100" className="chart-line">
                <path d="M0,80 C50,80 50,20 100,20 C150,20 150,60 200,60 C250,60 250,10 300,10" fill="none" stroke="var(--primary)" strokeWidth="3" />
                <path d="M0,80 C50,80 50,20 100,20 C150,20 150,60 200,60 C250,60 250,10 300,10 V100 H0 Z" fill="url(#gradient)" opacity="0.2" />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="var(--primary)" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="card-footer">
              <div className="pnl positive">+$1,240.50 (ROI 125%)</div>
              <button className="btn-sm">Trade Now</button>
            </div>
          </div>
          <div className="floating-elements">
            <div className="float-card icon-card"><Cpu size={24} /></div>
            <div className="float-card wallet-card"><Wallet size={24} /></div>
          </div>
        </div>
      </section>

      {/* 2. PLATFORM FEATURES */}
      <section className="features-section">
        <div className="section-header">
          <h2>Advanced Trading Ecosystem</h2>
          <p>Everything you need to succeed in the digital economy.</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="icon-box"><Cpu size={32} /></div>
            <h3>AI Smart Trading</h3>
            <p>Automated algorithms analyze market trends to maximize your potential returns.</p>
          </div>
          <div className="feature-card">
            <div className="icon-box"><Shield size={32} /></div>
            <h3>Secure Digital Wallet</h3>
            <p>Enterprise-grade encryption keeps your assets safe and accessible only to you.</p>
          </div>
          <div className="feature-card">
            <div className="icon-box"><Activity size={32} /></div>
            <h3>Real-Time Earnings</h3>
            <p>Watch your portfolio grow with live updates and instant performance metrics.</p>
          </div>
          <div className="feature-card">
            <div className="icon-box"><Globe size={32} /></div>
            <h3>Global Access</h3>
            <p>Trade from anywhere in the world with our borderless platform.</p>
          </div>
          <div className="feature-card">
            <div className="icon-box"><CreditCard size={32} /></div>
            <h3>Fast Withdrawals</h3>
            <p>Get your earnings quickly with our streamlined payout system.</p>
          </div>
          <div className="feature-card">
            <div className="icon-box"><Award size={32} /></div>
            <h3>Automated Rewards</h3>
            <p>Earn passive income through our integrated staking and reward pools.</p>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section className="steps-section">
        <div className="section-header">
          <h2>Start Your Journey</h2>
          <p>Four simple steps to financial freedom.</p>
        </div>
        <div className="timeline">
          <div className="step-item">
            <div className="step-num">01</div>
            <h3>Create Account</h3>
            <p>Register in seconds and verify your secure profile.</p>
          </div>
          <div className="step-line"></div>
          <div className="step-item">
            <div className="step-num">02</div>
            <h3>Activate Package</h3>
            <p>Choose your trading tier to unlock premium features.</p>
          </div>
          <div className="step-line"></div>
          <div className="step-item">
            <div className="step-num">03</div>
            <h3>Complete Tasks</h3>
            <p>Engage with the platform to boost your daily earnings.</p>
          </div>
          <div className="step-line"></div>
          <div className="step-item">
            <div className="step-num">04</div>
            <h3>Earn Rewards</h3>
            <p>Withdraw your profits or reinvest for compound growth.</p>
          </div>
        </div>
      </section>

      {/* 4. DASHBOARD PREVIEW */}
      <section className="preview-section">
        <div className="preview-container">
          <div className="preview-text">
            <h2>Powerful Dashboard Control</h2>
            <ul>
              <li><CheckCircle size={20} /> Real-time wallet balance tracking</li>
              <li><CheckCircle size={20} /> Interactive earnings charts</li>
              <li><CheckCircle size={20} /> Comprehensive referral network view</li>
              <li><CheckCircle size={20} /> Instant ROI progress indicators</li>
            </ul>
            <button onClick={onLogin} className="btn-primary">Access Dashboard</button>
          </div>
          <div className="preview-image glass-panel">
            {/* Abstract Dashboard UI Representation */}
            <div className="dash-header">
              <div className="dash-avatar"></div>
              <div className="dash-balance">$12,450.00</div>
            </div>
            <div className="dash-chart-area">
              <div className="bar" style={{height: '40%'}}></div>
              <div className="bar" style={{height: '60%'}}></div>
              <div className="bar" style={{height: '30%'}}></div>
              <div className="bar" style={{height: '80%'}}></div>
              <div className="bar" style={{height: '50%'}}></div>
              <div className="bar active" style={{height: '90%'}}></div>
            </div>
            <div className="dash-actions">
              <div className="dash-btn primary">Withdraw</div>
              <div className="dash-btn">Deposit</div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. REFERRAL PROGRAM */}
      <section className="referral-section-landing">
        <div className="section-header">
          <h2>Grow Your Network</h2>
          <p>Earn rewards from your network growth and platform activity.</p>
        </div>
        <div className="network-visual">
          <div className="node root"><Users size={32} /></div>
          <div className="connections">
            <div className="line left"></div>
            <div className="line right"></div>
          </div>
          <div className="level-1">
            <div className="node"><Users size={24} /></div>
            <div className="node"><Users size={24} /></div>
          </div>
          <div className="connections-2">
            <div className="line"></div>
            <div className="line"></div>
            <div className="line"></div>
            <div className="line"></div>
          </div>
           <div className="level-2">
            <div className="node sm"></div>
            <div className="node sm"></div>
            <div className="node sm"></div>
            <div className="node sm"></div>
          </div>
        </div>
        <div className="referral-stats">
          <div className="ref-stat">
            <h3>5 Levels</h3>
            <span>Deep Rewards</span>
          </div>
          <div className="ref-stat">
            <h3>Instant</h3>
            <span>Commission Payouts</span>
          </div>
        </div>
      </section>

      {/* 6. SECURITY */}
      <section className="security-section">
        <div className="section-header">
          <h2>Bank-Grade Security</h2>
        </div>
        <div className="security-badges">
          <div className="badge-card">
            <Lock size={40} className="icon-blue" />
            <h3>Encrypted Transactions</h3>
            <p>AES-256 encryption ensures your data is unreadable to unauthorized parties.</p>
          </div>
          <div className="badge-card">
            <Cpu size={40} className="icon-purple" />
            <h3>AI Monitoring</h3>
            <p>24/7 intelligent systems detect and prevent suspicious activity instantly.</p>
          </div>
          <div className="badge-card">
            <Shield size={40} className="icon-green" />
            <h3>Secure Blockchain</h3>
            <p>Built on immutable ledger technology for absolute transparency.</p>
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIALS */}
      <section className="testimonials-section">
        <div className="section-header">
          <h2>Trusted by Traders</h2>
        </div>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="user-info">
              <div className="avatar">A</div>
              <div>
                <h4>Alex M.</h4>
                <span className="role">Pro Trader</span>
              </div>
            </div>
            <p>"SUI24 changed how I view futures. The AI insights are incredibly accurate."</p>
          </div>
          <div className="testimonial-card">
            <div className="user-info">
              <div className="avatar">S</div>
              <div>
                <h4>Sarah K.</h4>
                <span className="role">Crypto Investor</span>
              </div>
            </div>
            <p>"The withdrawal speed is unmatched. I love the transparency of the platform."</p>
          </div>
          <div className="testimonial-card">
            <div className="user-info">
              <div className="avatar">D</div>
              <div>
                <h4>David R.</h4>
                <span className="role">Network Leader</span>
              </div>
            </div>
            <p>"Building my team here was seamless. The referral rewards are the best in the industry."</p>
          </div>
        </div>
      </section>

      {/* 8. FINAL CTA */}
      <section className="final-cta">
        <div className="cta-content">
          <h2>Join SUI24 and Start Your <br />Smart Trading Journey Today</h2>
          <div className="cta-buttons">
            <button onClick={onLogin} className="btn-primary-lg">Create Account</button>
            <button onClick={onPlay} className="btn-secondary-lg">Explore Platform</button>
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="landing-footer">
        <div className="footer-col">
          <div className="footer-logo">SUI24</div>
          <p>The future of AI trading.</p>
        </div>
        <div className="footer-col">
          <h4>Platform</h4>
          <a href="#">About</a>
          <a href="#">Features</a>
          <a href="#">Pricing</a>
        </div>
        <div className="footer-col">
          <h4>Support</h4>
          <a href="#">Contact</a>
          <a href="#">Help Center</a>
          <a href="#">Bug Bounty 🛡️</a>
          <a href="#">Terms of Service</a>
        </div>
        <div className="footer-col">
          <h4>Legal</h4>
          <a href="#">Privacy Policy</a>
          <a href="#">Risk Disclosure</a>
        </div>
      </footer>
    </div>
  );
};
