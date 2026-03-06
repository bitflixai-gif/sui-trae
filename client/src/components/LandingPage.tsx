import React from 'react';
import { Zap, Shield, Rocket, ArrowRight, Wallet } from 'lucide-react';
import './LandingPage.css';

interface LandingPageProps {
  onPlay: () => void;
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onPlay, onLogin }) => {
  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="logo">
          <Zap size={24} /> SUI24
        </div>
        <div className="nav-links">
          <button onClick={onLogin} className="btn-login">Login</button>
          <button onClick={onPlay} className="btn-play">Play Demo</button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <div className="badge">1000x Crypto Futures</div>
          <h1>The Ultimate Crypto <br /><span className="text-gradient">Futures Arena</span></h1>
          <p>Real-time crypto futures with up to 1000x leverage. No house edge. Just pure market action.</p>
          
          <div className="cta-group">
            <button onClick={onPlay} className="btn-primary-lg">
              Play Game <ArrowRight size={20} />
            </button>
            <div className="stats">
              <span><Shield size={16} /> No KYC</span>
              <span><Zap size={16} /> Instant Cash Out</span>
            </div>
          </div>
        </div>
        
        <div className="hero-visual">
          {/* Visual placeholder or chart graphic */}
          <div className="visual-card">
            <div className="visual-header">BTC/USD 1000x Long</div>
            <div className="visual-pnl text-green">+$12,450 (320%)</div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <Wallet size={32} className="icon-blue" />
          <h3>Deposit Instantly</h3>
          <p>No lengthy sign-ups, no KYC. Deposit your favorite crypto instantly.</p>
        </div>
        <div className="feature-card">
          <Zap size={32} className="icon-yellow" />
          <h3>1000x Leverage</h3>
          <p>Trade with supercharged leverage. Tiny moves create massive profits.</p>
        </div>
        <div className="feature-card">
          <Rocket size={32} className="icon-purple" />
          <h3>Instant Cash Out</h3>
          <p>Cash out your winnings instantly. No delays, no excuses.</p>
        </div>
      </section>

      <section className="bonus-banner">
        <h2>100% First Deposit Bonus</h2>
        <p>We'll match your first deposit with a 100% bonus. Double your firepower.</p>
        <button onClick={onLogin} className="btn-secondary">DEPOSIT & ACTIVATE BONUS</button>
      </section>

      <footer className="landing-footer">
        <div className="footer-col">
          <h4>SUI24</h4>
          <p>The future of 1000x crypto futures.</p>
        </div>
        <div className="footer-col">
          <h4>Socials</h4>
          <a href="#">Telegram</a>
          <a href="#">Twitter</a>
        </div>
        <div className="footer-col">
          <h4>Support</h4>
          <a href="mailto:contact@aark.digital">contact@sui24.com</a>
        </div>
      </footer>
    </div>
  );
};
