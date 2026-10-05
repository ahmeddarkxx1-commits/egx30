import { useState, useEffect } from 'react';
import { 
  Bot, BarChart2, Shield, Activity, Zap, Lock, Key, 
  Send, Sparkles, TrendingUp, Cpu, Globe, Crosshair, 
  Layers, ArrowUpRight, DollarSign, RefreshCw, ChevronRight
} from 'lucide-react';
import { fetchLiveAssetTicker } from './utils/priceFetcher';
import MarketScanner from './components/MarketScanner';
import SignalBot from './components/SignalBot';
import MarketNews from './components/MarketNews';
import TradenRadar from './components/TradenRadar';
import PreciousMetals from './components/PreciousMetals';
import HalalGuide from './components/HalalGuide';
import InvestmentBot from './components/InvestmentBot';
import GoldLiquidityRadar from './components/GoldLiquidityRadar';
import AutoPilotTrader from './components/AutoPilotTrader';
import EgxAnalysis from './components/EgxAnalysis';
import TradingViewSparkline from './components/TradingViewSparkline';
import PlatformsConnect from './components/PlatformsConnect';
import './App.css';

const MASTER_VIP_CODE = 'TRADEN2026';
const WHITELISTED_TELEGRAM_IDS = [1914514519, 12345678, 87654321];

function LiveMarketWidget({ onOpenBot }) {
  const [activeAsset, setActiveAsset] = useState('BTC/USDT');
  const [tickerData, setTickerData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async (symbol) => {
    try {
      const data = await fetchLiveAssetTicker(symbol);
      setTickerData(data);
    } catch (e) {
      console.error('Ticker fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(activeAsset);
    const interval = setInterval(() => loadData(activeAsset), 2000);
    return () => clearInterval(interval);
  }, [activeAsset]);

  const priceFormatted = tickerData?.price 
    ? (tickerData.price >= 1000 
        ? '$' + tickerData.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) 
        : '$' + tickerData.price)
    : '...';

  const changeVal = tickerData?.change24h || 0;
  const isUp = changeVal >= 0;
  const highVal = tickerData?.high24h ? '$' + tickerData.high24h.toLocaleString() : (tickerData?.price ? '$' + (tickerData.price * 1.012).toFixed(2) : '...');
  const lowVal = tickerData?.low24h ? '$' + tickerData.low24h.toLocaleString() : (tickerData?.price ? '$' + (tickerData.price * 0.988).toFixed(2) : '...');
  
  const trendText = changeVal > 0.15 ? 'BULLISH ↗' : changeVal < -0.15 ? 'BEARISH ↘' : 'SIDEWAYS ⇄';
  const trendColor = changeVal > 0.15 ? '#10b981' : changeVal < -0.15 ? '#f43f5e' : '#f59e0b';

  return (
    <div className="hero-market-card">
      {/* Asset Selector Tabs */}
      <div className="asset-pill-group">
        {[
          { symbol: 'BTC/USDT', label: 'BTC' },
          { symbol: 'XAU/USD', label: 'GOLD' },
          { symbol: 'EUR/USD', label: 'EUR/USD' },
          { symbol: 'ETH/USDT', label: 'ETH' },
          { symbol: 'US30', label: 'US30' },
        ].map(item => (
          <button
            key={item.symbol}
            onClick={() => setActiveAsset(item.symbol)}
            className={`asset-pill ${activeAsset === item.symbol ? 'active' : ''}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Main Price & Trend Row */}
      <div className="hero-price-row">
        <div>
          <div className="hero-price-big mono">
            {loading && !tickerData ? 'SYNCING...' : priceFormatted}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', fontWeight: '600' }}>
            {activeAsset} · REAL-TIME TICKER
          </div>
        </div>
        <div className={`hero-pct-badge mono ${isUp ? 'pct-up' : 'pct-down'}`}>
          {isUp ? '▲ +' : '▼ '}{changeVal.toFixed(2)}%
        </div>
      </div>
      
      {/* Wave Sparkline */}
      <div style={{ height: '54px', width: '100%', margin: '6px 0 10px 0' }}>
        <TradingViewSparkline
          isUp={isUp}
          height={54}
          id={`home-widget-${activeAsset}`}
          seed={activeAsset}
          strokeWidth={2.2}
        />
      </div>

      {/* 3 Metric Chips */}
      <div className="hero-metrics-grid">
        <div className="metric-chip">
          <div className="metric-chip-label">24H LOW</div>
          <div className="metric-chip-val mono">{lowVal}</div>
        </div>
        <div className="metric-chip">
          <div className="metric-chip-label">24H HIGH</div>
          <div className="metric-chip-val mono">{highVal}</div>
        </div>
        <div className="metric-chip">
          <div className="metric-chip-label">AI SENTIMENT</div>
          <div className="metric-chip-val mono" style={{ color: trendColor }}>{trendText}</div>
        </div>
      </div>

      {/* Instant Action Button */}
      <button
        onClick={() => onOpenBot(activeAsset)}
        className="hero-action-btn"
      >
        <Zap size={16} />
        <span>Analyze & Instant Trade {activeAsset}</span>
        <ArrowUpRight size={16} style={{ marginLeft: 'auto' }} />
      </button>
    </div>
  );
}

function App() {
  const [tgUser, setTgUser] = useState(null);
  const [currentView, setCurrentView] = useState('home');
  const [selectedSymbol, setSelectedSymbol] = useState('BTC/USDT');
  const [accountBalance, setAccountBalance] = useState(null);
  
  // Authorization state
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activationInput, setActivationInput] = useState('');
  const [activationError, setActivationError] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await fetch('https://worker-production-f2a42.up.railway.app/api/account');
        if (res.ok) {
          const data = await res.json();
          if (data.connected && data.balance !== undefined) {
            setAccountBalance(data.balance);
          }
        }
      } catch (e) {
        // silent fail
      }
    };
    fetchBalance();
    const bInterval = setInterval(fetchBalance, 6000);
    return () => clearInterval(bInterval);
  }, []);

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.expand();
      if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const u = tg.initDataUnsafe.user;
        setTgUser(u);
        
        const userStorageKey = `traden_user_authorized_${u.id}`;
        const storedUserAuth = localStorage.getItem(userStorageKey);

        if (WHITELISTED_TELEGRAM_IDS.includes(u.id) || u.id === 1914514519 || storedUserAuth === 'true') {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } else {
        const storedAuth = localStorage.getItem('traden_user_authorized_browser');
        if (storedAuth === 'true') {
          setIsAuthorized(true);
        }
      }
    }
  }, []);

  const handleActivateWithCode = () => {
    const cleanInput = activationInput.trim().toUpperCase();
    const isValidKey = cleanInput === MASTER_VIP_CODE || 
                       cleanInput.startsWith('TRADEN-') || 
                       cleanInput.includes('TRADEN');

    if (isValidKey) {
      setIsAuthorized(true);
      const userKey = tgUser ? `traden_user_authorized_${tgUser.id}` : 'traden_user_authorized_browser';
      localStorage.setItem(userKey, 'true');
      setActivationError(false);
    } else {
      setActivationError(true);
    }
  };

  // 🔒 RESTRICTED ACCESS SCREEN
  if (!isAuthorized) {
    return (
      <div className="app-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '85vh', textAlign: 'center', padding: '20px' }}>
        <div style={{ 
          width: '72px', height: '72px', borderRadius: '50%', 
          background: 'rgba(244, 63, 94, 0.12)', border: '1px solid rgba(244, 63, 94, 0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto',
          boxShadow: '0 0 24px rgba(244, 63, 94, 0.2)'
        }}>
          <Lock size={34} color="#f43f5e" />
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', margin: '0 0 8px 0' }}>
          Terminal Access Required 🔒
        </h2>

        <p style={{ fontSize: '12.5px', color: '#94a3b8', lineHeight: '1.5', maxWidth: '320px', margin: '0 0 18px 0' }}>
          Traden Pro Terminal requires verified VIP activation to execute algorithmic trades.
        </p>

        {tgUser && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '8px 14px', fontSize: '11.5px', color: '#f59e0b', marginBottom: '16px' }}>
            ID: <b>{tgUser.id}</b> (@{tgUser.username || tgUser.first_name})
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '300px' }}>
          <a 
            href={tgUser ? `https://t.me/share/url?url=Request%20Traden%20AI%20Access%20ID:${tgUser.id}` : 'https://t.me/'}
            target="_blank" 
            rel="noreferrer"
            style={{ 
              background: '#f59e0b', color: '#000', textDecoration: 'none', 
              padding: '12px', borderRadius: '10px', fontWeight: '700', fontSize: '13px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              boxShadow: '0 0 15px rgba(245, 158, 11, 0.3)'
            }}
          >
            <Send size={16} />
            <span>Contact Admin for Activation</span>
          </a>

          <button 
            onClick={() => setShowCodeInput(!showCodeInput)}
            style={{ 
              background: 'rgba(255,255,255,0.04)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)',
              padding: '10px', borderRadius: '10px', fontSize: '12px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
            }}
          >
            <Key size={14} color="#a855f7" />
            <span>Enter License Key (VIP)</span>
          </button>

          {showCodeInput && (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '12px', padding: '12px', marginTop: '4px' }}>
              <input 
                type="text"
                placeholder="Enter License Key..."
                value={activationInput}
                onChange={(e) => { setActivationInput(e.target.value); setActivationError(false); }}
                style={{
                  width: '100%', background: 'rgba(0,0,0,0.5)', border: `1px solid ${activationError ? '#f43f5e' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '8px', padding: '9px', color: '#fff', fontSize: '12px', textAlign: 'center', outline: 'none', boxSizing: 'border-box'
                }}
              />
              {activationError && (
                <div style={{ color: '#f43f5e', fontSize: '11px', marginTop: '4px' }}>Invalid Key ❌</div>
              )}
              <button 
                onClick={handleActivateWithCode}
                style={{
                  width: '100%', background: '#a855f7', color: '#fff', border: 'none',
                  borderRadius: '8px', padding: '9px', marginTop: '8px', fontWeight: '700', fontSize: '12px', cursor: 'pointer'
                }}
              >
                Activate Terminal ✨
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const renderHeaderNav = () => (
    <div className="header-glass-wrapper">
      <div className="top-navbar-row">
        <div className="brand-logo" onClick={() => setCurrentView('home')}>
          <div className="brand-icon-chip">
            <Cpu size={16} color="#38bdf8" />
          </div>
          <span>TRADEN</span>
          <span className="brand-badge">PRO AI</span>
        </div>

        <div 
          className="account-pill"
          onClick={() => setCurrentView('platforms_connect')}
        >
          <span className="pulse-dot"></span>
          <span className="mono">
            {accountBalance !== null ? `MT5: $${accountBalance.toFixed(2)}` : 'MT5 Live'}
          </span>
        </div>
      </div>

      <div className="sub-nav-tabs">
        {[
          { id: 'home', label: 'Terminal', icon: Activity },
          { id: 'autopilot_trader', label: 'Auto-Pilot 🤖', icon: Bot },
          { id: 'gold_liquidity', label: 'Gold Radar', icon: Crosshair },
          { id: 'signal_bot', label: 'AI Signals', icon: Zap },
          { id: 'traden_radar', label: 'Market Radar', icon: Activity },
          { id: 'market_scanner', label: 'Scanner', icon: BarChart2 },
          { id: 'egx_stocks', label: 'EGX Stocks', icon: Globe },
          { id: 'platforms_connect', label: 'Broker Sync', icon: Shield },
          { id: 'investment_bot', label: 'Investment', icon: TrendingUp },
          { id: 'market_news', label: 'News', icon: Globe },
        ].map(tab => {
          const IconComponent = tab.icon;
          const isActive = currentView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentView(tab.id)}
              className={`sub-nav-btn ${isActive ? 'active' : ''}`}
            >
              <IconComponent size={13} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  // VIEW ROUTING
  if (currentView === 'autopilot_trader') {
    return (
      <div className="app-container">
        {renderHeaderNav()}
        <AutoPilotTrader onBack={() => setCurrentView('home')} />
      </div>
    );
  }

  if (currentView === 'platforms_connect') {
    return (
      <div className="app-container">
        {renderHeaderNav()}
        <PlatformsConnect onBack={() => setCurrentView('home')} />
      </div>
    );
  }

  if (currentView === 'investment_bot') {
    return (
      <div className="app-container">
        {renderHeaderNav()}
        <InvestmentBot onBack={() => setCurrentView('home')} />
      </div>
    );
  }

  if (currentView === 'halal_guide') {
    return (
      <div className="app-container">
        {renderHeaderNav()}
        <HalalGuide onBack={() => setCurrentView('home')} />
      </div>
    );
  }

  if (currentView === 'precious_metals') {
    return (
      <div className="app-container">
        {renderHeaderNav()}
        <PreciousMetals onBack={() => setCurrentView('home')} />
      </div>
    );
  }

  if (currentView === 'traden_radar') {
    return (
      <div className="app-container">
        {renderHeaderNav()}
        <TradenRadar 
          onBack={() => setCurrentView('home')} 
          onOpenBot={(symbol) => {
            if (symbol) setSelectedSymbol(symbol);
            setCurrentView('signal_bot');
          }}
        />
      </div>
    );
  }

  if (currentView === 'market_scanner') {
    return (
      <div className="app-container">
        {renderHeaderNav()}
        <MarketScanner onBack={() => setCurrentView('home')} />
      </div>
    );
  }

  if (currentView === 'signal_bot') {
    return (
      <div className="app-container">
        {renderHeaderNav()}
        <SignalBot initialSymbol={selectedSymbol} onBack={() => setCurrentView('home')} />
      </div>
    );
  }

  if (currentView === 'gold_liquidity') {
    return (
      <div className="app-container">
        {renderHeaderNav()}
        <GoldLiquidityRadar 
          onBack={() => setCurrentView('home')} 
          onAnalyzeGold={(symbol) => {
            if (symbol) setSelectedSymbol(symbol);
            setCurrentView('signal_bot');
          }}
        />
      </div>
    );
  }

  if (currentView === 'egx_stocks') {
    return (
      <div className="app-container">
        {renderHeaderNav()}
        <EgxAnalysis onBack={() => setCurrentView('home')} />
      </div>
    );
  }

  if (currentView === 'market_news') {
    return (
      <div className="app-container">
        {renderHeaderNav()}
        <MarketNews onBack={() => setCurrentView('home')} />
      </div>
    );
  }

  // DEFAULT DASHBOARD
  return (
    <div className="app-container">
      {renderHeaderNav()}

      {/* 1. Compact Live Market Hero Widget */}
      <LiveMarketWidget 
        onOpenBot={(symbol) => {
          if (symbol) setSelectedSymbol(symbol);
          setCurrentView('signal_bot');
        }} 
      />

      {/* 2. Pro Bento Tools Grid */}
      <div>
        <div className="section-header-row">
          <div className="section-title-clean">
            <Zap size={14} color="#f59e0b" />
            <span>Trading Engines & Tools</span>
          </div>
        </div>

        <div className="bento-grid">
          {/* AI Auto-Pilot Intraday Trader */}
          <div className="bento-card" onClick={() => setCurrentView('autopilot_trader')} style={{ borderLeft: '3px solid #10b981', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(15, 23, 42, 0.6) 100%)' }}>
            <div className="bento-card-top">
              <div className="bento-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                <Bot size={18} />
              </div>
              <span className="bento-tag" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', fontWeight: 'bold' }}>5 صفقات يومية 🚀</span>
            </div>
            <div>
              <div className="bento-title">التداول الآلي الذكي (Auto-Pilot)</div>
              <div className="bento-desc">تحليل يومي مستمر + 5 صفقات مدروسة بأرباح عالية</div>
            </div>
          </div>

          {/* Gold Liquidity Radar */}
          <div className="bento-card" onClick={() => setCurrentView('gold_liquidity')} style={{ borderLeft: '3px solid #f59e0b' }}>
            <div className="bento-card-top">
              <div className="bento-icon-box" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
                <Crosshair size={18} />
              </div>
              <span className="bento-tag" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>HOT</span>
            </div>
            <div>
              <div className="bento-title">Gold Liquidity Radar</div>
              <div className="bento-desc">Smart sweep & runner trailing bot</div>
            </div>
          </div>

          {/* AI Signal Bot */}
          <div className="bento-card" onClick={() => setCurrentView('signal_bot')} style={{ borderLeft: '3px solid #38bdf8' }}>
            <div className="bento-card-top">
              <div className="bento-icon-box" style={{ background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8' }}>
                <Bot size={18} />
              </div>
              <span className="bento-tag" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>AI PRO</span>
            </div>
            <div>
              <div className="bento-title">Signal & Risk Bot</div>
              <div className="bento-desc">Exact SL/TP & 1-click execution</div>
            </div>
          </div>

          {/* Broker Sync */}
          <div className="bento-card" onClick={() => setCurrentView('platforms_connect')} style={{ borderLeft: '3px solid #10b981' }}>
            <div className="bento-card-top">
              <div className="bento-icon-box" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
                <Shield size={18} />
              </div>
              <span className="bento-tag" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>LIVE</span>
            </div>
            <div>
              <div className="bento-title">Broker & Terminal Sync</div>
              <div className="bento-desc">Exness MT5 & positions monitor</div>
            </div>
          </div>

          {/* Market Radar */}
          <div className="bento-card" onClick={() => setCurrentView('traden_radar')}>
            <div className="bento-card-top">
              <div className="bento-icon-box" style={{ background: 'rgba(99, 102, 241, 0.12)', color: '#818cf8' }}>
                <Activity size={18} />
              </div>
            </div>
            <div>
              <div className="bento-title">Market Radar</div>
              <div className="bento-desc">Live institutional multi-market scanner</div>
            </div>
          </div>

          {/* Technical Scanner */}
          <div className="bento-card" onClick={() => setCurrentView('market_scanner')}>
            <div className="bento-card-top">
              <div className="bento-icon-box" style={{ background: 'rgba(236, 72, 153, 0.12)', color: '#f472b6' }}>
                <BarChart2 size={18} />
              </div>
            </div>
            <div>
              <div className="bento-title">Technical Scanner</div>
              <div className="bento-desc">Multi-timeframe RSI, MACD & volume</div>
            </div>
          </div>

          {/* EGX Egyptian Stocks */}
          <div className="bento-card" onClick={() => setCurrentView('egx_stocks')}>
            <div className="bento-card-top">
              <div className="bento-icon-box" style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#f8fafc' }}>
                <Globe size={18} />
              </div>
            </div>
            <div>
              <div className="bento-title">EGX Egyptian Stocks</div>
              <div className="bento-desc">EGX30, COMI & Cairo equities analysis</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
