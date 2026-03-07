import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, Wallet, Zap, AlertTriangle, ArrowRight, Settings } from 'lucide-react';
import './TradingGame.css';

interface Position {
  id: string;
  symbol: string;
  direction: 'long' | 'short';
  entryPrice: number;
  leverage: number;
  margin: number;
  size: number;
  liquidationPrice: number;
  pnl: number;
  pnlPercent: number;
}

interface TradingGameProps {
  token: string | null;
  realBalance: number;
  onTrade: () => void; // Callback to refresh real balance
}

export const TradingGame: React.FC<TradingGameProps> = ({ token, realBalance, onTrade }) => {
  // Mode: Demo vs Real
  const [mode, setMode] = useState<'demo' | 'real'>('demo');
  const [demoBalance, setDemoBalance] = useState(10000); // $10k virtual funds
  
  // Market State
  const [symbol, setSymbol] = useState('BTC/USD');
  const [price, setPrice] = useState(65000); 
  const [priceHistory, setPriceHistory] = useState<{time: number, price: number}[]>([]);
  
  const COINS: Record<string, number> = {
    'BTC/USD': 65000,
    'ETH/USD': 3500,
    'SOL/USD': 150,
    'BNB/USD': 600,
    'SUI/USD': 1.85
  };

  // Switch Symbol Handler
  const changeSymbol = (newSymbol: string) => {
    setSymbol(newSymbol);
    setPrice(COINS[newSymbol]);
    setPriceHistory([]); // Clear chart
  };
  
  // Order Form
  const [leverage, setLeverage] = useState(10);
  const [margin, setMargin] = useState(100);
  
  // Positions
  const [positions, setPositions] = useState<Position[]>([]);
  
  // Chart Ref
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- Real-time Price Simulation ---
  useEffect(() => {
    const interval = setInterval(() => {
      setPrice(prev => {
        const volatility = prev * 0.001; // 0.1% volatility per tick
        const change = (Math.random() - 0.5) * volatility; 
        const newPrice = prev + change;
        
        setPriceHistory(history => {
          const newHistory = [...history, { time: Date.now(), price: newPrice }];
          if (newHistory.length > 100) return newHistory.slice(newHistory.length - 100);
          return newHistory;
        });
        
        // Update PnL for active positions
        setPositions(prevPositions => prevPositions.map(pos => {
          // Only update PnL if symbol matches, otherwise keep last known PnL? 
          // Actually, in a real app, we'd track all prices. 
          // For this game, we'll only simulate the CURRENT symbol's price accurately in chart,
          // but strictly we should track all. 
          // To keep it simple, we'll assume positions on other symbols rely on this simulation 
          // ONLY if we simulate all tickers. 
          // Limitation: If you switch symbols, PnL of other symbols won't update in this simple demo.
          // Fix: We will only update PnL for positions matching current symbol.
          
          if (pos.symbol !== symbol) return pos;

          let pnl = 0;
          if (pos.direction === 'long') {
            pnl = ((newPrice - pos.entryPrice) / pos.entryPrice) * pos.size;
          } else {
            pnl = ((pos.entryPrice - newPrice) / pos.entryPrice) * pos.size;
          }
          
          if (pnl <= -pos.margin) {
            return { ...pos, pnl: -pos.margin, pnlPercent: -100, status: 'liquidated' };
          }
          
          return { 
            ...pos, 
            pnl, 
            pnlPercent: (pnl / pos.margin) * 100 
          };
        }).filter(p => (p as any).status !== 'liquidated')); 
        
        return newPrice;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [symbol]); // Restart simulation on symbol change

  // --- Chart Drawing ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (priceHistory.length < 2) return;

    const prices = priceHistory.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const range = maxPrice - minPrice || 1;
    
    ctx.beginPath();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;

    priceHistory.forEach((p, i) => {
      const x = (i / (priceHistory.length - 1)) * canvas.width;
      const y = canvas.height - ((p.price - minPrice) / range) * canvas.height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
    ctx.fillStyle = gradient;
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.fill();

  }, [priceHistory]);

  // --- Trade Logic ---
  const handleTrade = async (direction: 'long' | 'short') => {
    const currentBalance = mode === 'demo' ? demoBalance : realBalance;
    
    if (currentBalance < margin) {
      alert('Insufficient Balance!');
      return;
    }

    if (mode === 'demo') {
      // Execute Demo Trade
      const size = margin * leverage;
      const liquidationPrice = direction === 'long' 
        ? price * (1 - 1/leverage)
        : price * (1 + 1/leverage);
        
      const newPos: Position = {
        id: Math.random().toString(36).substr(2, 9),
        symbol: symbol,
        direction,
        entryPrice: price,
        leverage,
        margin,
        size,
        liquidationPrice,
        pnl: 0,
        pnlPercent: 0
      };
      
      setPositions([newPos, ...positions]);
      setDemoBalance(prev => prev - margin);
    } else {
      // Execute Real Trade via API
      if (!token) {
        alert('Please Login to trade with Real Funds');
        return;
      }
      
      try {
        const res = await fetch('/api/trade/open', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            symbol: symbol,
            direction,
            leverage,
            margin,
            currentPrice: price
          })
        });
        
        if (res.ok) {
          const pos = await res.json();
          // Transform API response to Position type if needed
          // For now, just re-fetch positions or update locally
          onTrade(); // Refresh balance
          alert('Trade Executed!');
        } else {
          const err = await res.json();
          alert(err.error);
        }
      } catch (e) {
        alert('Trade Failed');
      }
    }
  };

  const closePosition = async (pos: Position) => {
    if (mode === 'demo') {
      setDemoBalance(prev => prev + pos.margin + pos.pnl);
      setPositions(prev => prev.filter(p => p.id !== pos.id));
    } else {
      // Real trade close logic
      if (!token) return;
      try {
        const res = await fetch('/api/trade/close', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            positionId: pos.id,
            currentPrice: price
          })
        });
        if (res.ok) {
          onTrade();
          // Remove from local list (should ideally refetch)
          setPositions(prev => prev.filter(p => p.id !== pos.id));
        }
      } catch (e) {
        alert('Failed to close position');
      }
    }
  };

  return (
    <div className="trading-game">
      {/* Header / Mode Switch */}
      <div className="game-header">
        <div className="pair-selector">
          {Object.keys(COINS).map(s => (
            <button 
              key={s} 
              className={symbol === s ? 'active-pair' : 'pair-btn'} 
              onClick={() => changeSymbol(s)}
            >
              {s.split('/')[0]}
            </button>
          ))}
        </div>
        <div className="pair-info">
          <h2>{symbol}</h2>
          <span className="price">${price.toFixed(2)}</span>
        </div>
        
        <div className="account-controls">
          <div className="balance-display">
            <Wallet size={16} />
            <span>
              {mode === 'demo' ? 'DEMO' : 'REAL'}: ${mode === 'demo' ? demoBalance.toFixed(2) : realBalance.toFixed(2)}
            </span>
          </div>
          
          <div className="mode-toggle">
            <button 
              className={mode === 'demo' ? 'active' : ''} 
              onClick={() => setMode('demo')}
            >
              Demo
            </button>
            <button 
              className={mode === 'real' ? 'active' : ''} 
              onClick={() => {
                if (!token) alert('Login required for Real Trading');
                else setMode('real');
              }}
            >
              Real
            </button>
          </div>
        </div>
      </div>

      <div className="game-layout">
        {/* Chart Area */}
        <div className="chart-container">
          <canvas ref={canvasRef} width={800} height={400} />
          <div className="chart-overlay">
            <div className="watermark">1000x FUTURES</div>
          </div>
        </div>

        {/* Order Form */}
        <div className="order-panel">
          <div className="leverage-control">
            <label>Leverage: {leverage}x</label>
            <input 
              type="range" 
              min="1" 
              max="1000" 
              value={leverage} 
              onChange={e => setLeverage(parseInt(e.target.value))} 
            />
            <div className="leverage-marks">
              <span>1x</span>
              <span>100x</span>
              <span>500x</span>
              <span>1000x</span>
            </div>
          </div>

          <div className="amount-control">
            <label>Margin (SUI/USD)</label>
            <input 
              type="number" 
              value={margin} 
              onChange={e => setMargin(parseFloat(e.target.value))} 
            />
          </div>

          <div className="trade-summary">
            <div className="row">
              <span>Position Size</span>
              <span>${(margin * leverage).toLocaleString()}</span>
            </div>
            <div className="row">
              <span>Liquidation</span>
              <span>Est. ${(price * (1 - 1/leverage)).toFixed(0)}</span>
            </div>
          </div>

          <div className="trade-buttons">
            <button className="btn-long" onClick={() => handleTrade('long')}>
              Long <TrendingUp size={16} />
            </button>
            <button className="btn-short" onClick={() => handleTrade('short')}>
              Short <TrendingDown size={16} />
            </button>
          </div>
          
          <div className="risk-warning">
            <AlertTriangle size={12} /> High Risk: 1000x Leverage
          </div>
        </div>
      </div>

      {/* Positions Table */}
      <div className="positions-panel">
        <h3>Active Positions</h3>
        {positions.length === 0 ? (
          <div className="empty-state">No open positions</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Side</th>
                <th>Size</th>
                <th>Entry</th>
                <th>Mark</th>
                <th>PnL</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {positions.map(pos => (
                <tr key={pos.id}>
                  <td>{pos.symbol} <span className="lev-badge">{pos.leverage}x</span></td>
                  <td className={pos.direction === 'long' ? 'text-green' : 'text-red'}>
                    {pos.direction.toUpperCase()}
                  </td>
                  <td>${pos.size.toLocaleString()}</td>
                  <td>${pos.entryPrice.toFixed(2)}</td>
                  <td>${price.toFixed(2)}</td>
                  <td className={pos.pnl >= 0 ? 'text-green' : 'text-red'}>
                    ${pos.pnl.toFixed(2)} ({pos.pnlPercent.toFixed(2)}%)
                  </td>
                  <td>
                    <button className="btn-close" onClick={() => closePosition(pos)}>Close</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
