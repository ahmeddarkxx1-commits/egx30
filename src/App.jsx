import React, { useState } from 'react';
import { 
  Bot, BarChart2, Shield, Activity, Zap, Sparkles, TrendingUp, Cpu, Globe, Crosshair, 
  Layers, ArrowUpRight, DollarSign, RefreshCw, ChevronRight, BookOpen, Flame, 
  ArrowLeft, LayoutDashboard, Compass, ChevronDown, Grid, X
} from 'lucide-react';
import { fetchLiveAssetTicker } from './utils/priceFetcher';
import SignalBot from './components/SignalBot';
import MarketNews from './components/MarketNews';
import TradenRadar from './components/TradenRadar';
import PreciousMetals from './components/PreciousMetals';
import HalalGuide from './components/HalalGuide';
import InvestmentBot from './components/InvestmentBot';
import GoldLiquidityRadar from './components/GoldLiquidityRadar';
import EgxAnalysis from './components/EgxAnalysis';
import TradingViewSparkline from './components/TradingViewSparkline';
import StocketaLandingPage from './components/StocketaLandingPage';
import ProTradingTerminal from './components/ProTradingTerminal';
import DisclaimerView from './components/DisclaimerView';
import FooterDisclaimer from './components/FooterDisclaimer';
import './App.css';

function LiveMarketWidget({ onOpenView, onSelectSymbol }) {
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

  React.useEffect(() => {
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
    <div className="hero-layout-grid">
      {/* 1. Main Live Chart & Market Card */}
      <div className="hero-market-card">
        <div>
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
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '3px', fontWeight: '600' }}>
                {activeAsset} · Live Global Exchange Stream ({tickerData?.provider || 'LIVE FEED'})
              </div>
            </div>
            <div className={`hero-pct-badge mono ${isUp ? 'pct-up' : 'pct-down'}`}>
              {isUp ? '▲ +' : '▼ '}{changeVal.toFixed(2)}%
            </div>
          </div>
          
          {/* Wave Sparkline */}
          <div style={{ height: '64px', width: '100%', margin: '8px 0 12px 0' }}>
            <TradingViewSparkline
              isUp={isUp}
              height={64}
              id={`home-widget-${activeAsset}`}
              seed={activeAsset}
              strokeWidth={2.4}
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
              <div className="metric-chip-label">AI BIAS</div>
              <div className="metric-chip-val mono" style={{ color: trendColor }}>{trendText}</div>
            </div>
          </div>
        </div>

        {/* Instant Action Button */}
        <button
          onClick={() => {
            if (onSelectSymbol) onSelectSymbol(activeAsset);
            onOpenView('signal_bot');
          }}
          className="hero-action-btn"
        >
          <Zap size={17} />
          <span>Analyze & Generate Instant {activeAsset} AI Trade Setup</span>
          <ArrowUpRight size={17} style={{ marginLeft: 'auto' }} />
        </button>
      </div>

      {/* 2. AI Market Pulse & Quick Insights Panel */}
      <div className="hero-side-card">
        <div>
          <div className="side-card-header">
            <div className="side-card-title">
              <Activity size={16} color="#38bdf8" />
              <span>AI Market Intelligence & Session Status</span>
            </div>
            <span style={{ fontSize: '10.5px', color: '#10b981', fontWeight: '800', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: '6px' }}>
              LIVE 🟢
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
            <div className="pulse-stat-row">
              <div className="pulse-stat-label">
                <Globe size={14} color="#10b981" />
                <span>Egyptian Exchange (EGX)</span>
              </div>
              <span className="pulse-stat-value mono" style={{ color: '#34d399' }}>10:00 AM - 02:30 PM</span>
            </div>

            <div className="pulse-stat-row">
              <div className="pulse-stat-label">
                <Crosshair size={14} color="#f59e0b" />
                <span>Gold Liquidity Concept (SMC)</span>
              </div>
              <span className="pulse-stat-value mono" style={{ color: '#f59e0b' }}>BSL / SSL ACTIVE</span>
            </div>

            <div className="pulse-stat-row">
              <div className="pulse-stat-label">
                <Bot size={14} color="#38bdf8" />
                <span>AI Engine Consensus</span>
              </div>
              <span className="pulse-stat-value mono" style={{ color: '#38bdf8' }}>TRADEN AI MATRIX™</span>
            </div>

            <div className="pulse-stat-row">
              <div className="pulse-stat-label">
                <Shield size={14} color="#a855f7" />
                <span>Risk & Position Sizing</span>
              </div>
              <span className="pulse-stat-value mono" style={{ color: '#c084fc' }}>1:2.5 RR TARGET</span>
            </div>
          </div>
        </div>

        {/* Quick Shortcut Pills */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '6px' }}>
          <button 
            onClick={() => onOpenView('egx_stocks')}
            style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#34d399',
              borderRadius: '10px',
              padding: '8px 10px',
              fontSize: '11.5px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span>🇪🇬 EGX 30 STOCKS</span>
            <ChevronRight size={13} />
          </button>

          <button 
            onClick={() => onOpenView('gold_liquidity')}
            style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: '#fbbf24',
              borderRadius: '10px',
              padding: '8px 10px',
              fontSize: '11.5px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span>🥇 GOLD SMC RADAR</span>
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

const viewToPathMap = {
  landing: '#landing',
  home: '#dashboard',
  terminal: '#terminal',
  signal_bot: '#signals',
  market_scanner: '#signals',
  gold_liquidity: '#gold-smc',
  traden_radar: '#radar',
  egx_stocks: '#egx30',
  market_news: '#news',
  precious_metals: '#metals',
  halal_guide: '#halal',
  disclaimer: '#disclaimer',
};

const pathToViewMap = {
  '#landing': 'landing',
  '#dashboard': 'home',
  '#terminal': 'terminal',
  '#signals': 'signal_bot',
  '#gold-smc': 'gold_liquidity',
  '#radar': 'traden_radar',
  '#egx30': 'egx_stocks',
  '#news': 'market_news',
  '#metals': 'precious_metals',
  '#halal': 'halal_guide',
  '#disclaimer': 'disclaimer',
};

const getViewFromUrl = () => {
  const hash = window.location.hash.toLowerCase();
  if (hash && pathToViewMap[hash]) {
    return pathToViewMap[hash];
  }
  return 'landing';
};

function App() {
  const [currentView, setCurrentViewRaw] = useState(() => getViewFromUrl());
  const [selectedSymbol, setSelectedSymbol] = useState('BTC/USDT');
  const [showMobileSheet, setShowMobileSheet] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('traden_theme') || 'dark';
  });

  const setCurrentView = (newView) => {
    setCurrentViewRaw(newView);
    const targetHash = viewToPathMap[newView] || '#landing';
    if (window.location.hash !== targetHash) {
      window.history.pushState(null, '', targetHash);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  React.useEffect(() => {
    const handleHashChange = () => {
      const viewFromHash = getViewFromUrl();
      setCurrentViewRaw(viewFromHash);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);

    if (!window.location.hash) {
      window.history.replaceState(null, '', viewToPathMap[currentView] || '#landing');
    }

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('traden_theme', theme);
  }, [theme]);

  const navItems = [
    { id: 'landing', label: 'LANDING ✨', icon: Sparkles, path: '#landing' },
    { id: 'home', label: 'DASHBOARD 📊', icon: LayoutDashboard, path: '#dashboard' },
    { id: 'terminal', label: 'TERMINAL 💻', icon: Cpu, path: '#terminal' },
    { id: 'signal_bot', label: 'AI SIGNALS 🤖', icon: Bot, path: '#signals' },
    { id: 'gold_liquidity', label: 'GOLD SMC 🎯', icon: Crosshair, path: '#gold-smc' },
    { id: 'traden_radar', label: 'RADAR 🌐', icon: Activity, path: '#radar' },
    { id: 'egx_stocks', label: 'EGX 30 🇪🇬', icon: Globe, path: '#egx30' },
    { id: 'market_news', label: 'NEWS 📰', icon: Zap, path: '#news' },
    { id: 'precious_metals', label: 'METALS 🥇', icon: Layers, path: '#metals' },
    { id: 'halal_guide', label: 'HALAL 🕌', icon: BookOpen, path: '#halal' },
    { id: 'disclaimer', label: 'DISCLAIMER ⚖️', icon: Shield, path: '#disclaimer' },
  ];


  const primaryMobileDockTabs = [
    { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'signal_bot', label: 'Signals', icon: Bot },
    { id: 'gold_liquidity', label: 'Gold SMC', icon: Crosshair },
    { id: 'egx_stocks', label: 'EGX 30', icon: Globe },
  ];

  const secondaryMobileTabs = navItems.filter(item => 
    !primaryMobileDockTabs.some(p => p.id === item.id) && item.id !== 'landing'
  );

  const isSecondaryActive = secondaryMobileTabs.some(item => item.id === currentView);

  const renderHeaderNav = () => (
    <div className="header-glass-wrapper">
      <div className="top-navbar-row">
        <div className="brand-logo" onClick={() => setCurrentView('landing')}>
          <div className="brand-icon-chip">
            <Cpu size={18} color={theme === 'light' ? '#ffffff' : '#38bdf8'} />
          </div>
          <span>TRADEN</span>
          <span className="brand-badge">PRO AI</span>
        </div>

        <div className="header-status-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Theme Toggle Button */}
          <button
            onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
            className="theme-toggle-pill"
            style={{
              background: theme === 'dark' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(153, 91, 185, 0.15)',
              border: theme === 'dark' ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(153, 91, 185, 0.4)',
              color: theme === 'dark' ? '#38bdf8' : '#995bb9',
              borderRadius: '100px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>

          <div className="account-pill hide-on-small">
            <span className="pulse-dot"></span>
            <span className="mono">LIVE STREAM CONNECTED 🟢</span>
          </div>
        </div>
      </div>

      {/* Desktop Sub-Nav Tabs */}
      <div className="sub-nav-tabs">
        {navItems.map(tab => {
          const IconComponent = tab.icon;
          const isActive = currentView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentView(tab.id)}
              className={`sub-nav-btn ${isActive ? 'active' : ''}`}
            >
              <IconComponent size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderMobileDock = () => (
    <>
      {/* Native Mobile Floating Glass Dock */}
      <div className="mobile-floating-dock">
        {primaryMobileDockTabs.map(tab => {
          const IconComp = tab.icon;
          const isActive = currentView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentView(tab.id)}
              className={`mobile-dock-btn ${isActive ? 'active' : ''}`}
            >
              <div className="dock-icon-wrapper">
                <IconComp size={20} />
              </div>
              <span className="dock-label">{tab.label}</span>
              {isActive && <div className="dock-active-indicator" />}
            </button>
          );
        })}

        {/* 'More' Button to Open iOS-Style Bottom Sheet */}
        <button
          onClick={() => setShowMobileSheet(true)}
          className={`mobile-dock-btn ${isSecondaryActive || showMobileSheet ? 'active' : ''}`}
        >
          <div className="dock-icon-wrapper" style={{ position: 'relative' }}>
            <Grid size={20} />
            {isSecondaryActive && <div className="dock-badge-dot" />}
          </div>
          <span className="dock-label">More ✨</span>
          {(isSecondaryActive || showMobileSheet) && <div className="dock-active-indicator" />}
        </button>
      </div>

      {/* iOS Glass Bottom Sheet Drawer */}
      {showMobileSheet && (
        <div className="mobile-sheet-backdrop" onClick={() => setShowMobileSheet(false)}>
          <div className="mobile-sheet-container" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-drag-handle" />

            <div className="mobile-sheet-header">
              <div>
                <div className="mobile-sheet-title">TRADEN Workspaces</div>
                <div className="mobile-sheet-subtitle">Select institutional AI tool or workspace</div>
              </div>
              <button 
                className="sheet-close-btn"
                onClick={() => setShowMobileSheet(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="mobile-sheet-grid">
              {navItems.map(tab => {
                const IconComp = tab.icon;
                const isActive = currentView === tab.id;
                return (
                  <div
                    key={tab.id}
                    onClick={() => {
                      setCurrentView(tab.id);
                      setShowMobileSheet(false);
                    }}
                    className={`mobile-sheet-card ${isActive ? 'active' : ''}`}
                  >
                    <div className="sheet-card-icon-box">
                      <IconComp size={20} />
                    </div>
                    <div className="sheet-card-info">
                      <div className="sheet-card-title">{tab.label}</div>
                      <div className="sheet-card-sub">
                        {tab.id === 'landing' && 'Landing page & Stocketa design'}
                        {tab.id === 'home' && 'Live charts, market ticker & insights'}
                        {tab.id === 'signal_bot' && 'TradingView charts & AI consensus'}
                        {tab.id === 'gold_liquidity' && 'Liquidity sweeps, BSL/SSL & FVG'}
                        {tab.id === 'traden_radar' && 'Multi-asset high-frequency scanner'}
                        {tab.id === 'egx_stocks' && 'AZ Gold, Thndr & Egyptian stocks'}
                        {tab.id === 'market_news' && 'Live news & AI sentiment scoring'}
                        {tab.id === 'precious_metals' && 'Gold, Silver, Oil & Commodities'}
                        {tab.id === 'halal_guide' && 'Sharia compliance & Halal screener'}
                      </div>
                    </div>
                    {isActive && <span className="sheet-active-tag">Active</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );

  // VIEW ROUTING (Clean, dedicated views)
  if (currentView === 'landing') {
    return (
      <StocketaLandingPage 
        onLaunchApp={setCurrentView}
        onOpenView={setCurrentView}
        onSelectSymbol={setSelectedSymbol}
        theme={theme}
        setTheme={setTheme}
      />
    );
  }

  if (currentView === 'disclaimer') {
    return (
      <div className="app-container">
        {renderHeaderNav()}
        <DisclaimerView onBack={() => setCurrentView('home')} />
        <FooterDisclaimer onOpenDisclaimer={() => setCurrentView('disclaimer')} />
        {renderMobileDock()}
      </div>
    );
  }

  if (currentView === 'terminal') {
    return (
      <div className="app-container">
        {renderHeaderNav()}
        <ProTradingTerminal onBack={() => setCurrentView('home')} />
        <FooterDisclaimer onOpenDisclaimer={() => setCurrentView('disclaimer')} />
        {renderMobileDock()}
      </div>
    );
  }

  if (currentView === 'gold_liquidity') {
    return (
      <div className="app-container">
        {renderHeaderNav()}
        <GoldLiquidityRadar 
          onBack={() => setCurrentView('home')} 
          onAnalyzeAsset={(symbol) => {
            if (symbol) setSelectedSymbol(symbol);
            setCurrentView('signal_bot');
          }}
          onAnalyzeGold={(symbol) => {
            if (symbol) setSelectedSymbol(symbol);
            setCurrentView('signal_bot');
          }}
        />
        <FooterDisclaimer onOpenDisclaimer={() => setCurrentView('disclaimer')} />
        {renderMobileDock()}
      </div>
    );
  }

  if (currentView === 'signal_bot' || currentView === 'market_scanner') {
    return (
      <div className="app-container">
        {renderHeaderNav()}
        <SignalBot 
          initialSymbol={selectedSymbol} 
          onBack={() => setCurrentView('home')} 
        />
        <FooterDisclaimer onOpenDisclaimer={() => setCurrentView('disclaimer')} />
        {renderMobileDock()}
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
        <FooterDisclaimer onOpenDisclaimer={() => setCurrentView('disclaimer')} />
        {renderMobileDock()}
      </div>
    );
  }

  if (currentView === 'egx_stocks') {
    return (
      <div className="app-container">
        {renderHeaderNav()}
        <EgxAnalysis onBack={() => setCurrentView('home')} />
        <FooterDisclaimer onOpenDisclaimer={() => setCurrentView('disclaimer')} />
        {renderMobileDock()}
      </div>
    );
  }

  if (currentView === 'market_news') {
    return (
      <div className="app-container">
        {renderHeaderNav()}
        <MarketNews onBack={() => setCurrentView('home')} />
        <FooterDisclaimer onOpenDisclaimer={() => setCurrentView('disclaimer')} />
        {renderMobileDock()}
      </div>
    );
  }

  if (currentView === 'precious_metals') {
    return (
      <div className="app-container">
        {renderHeaderNav()}
        <PreciousMetals onBack={() => setCurrentView('home')} />
        <FooterDisclaimer onOpenDisclaimer={() => setCurrentView('disclaimer')} />
        {renderMobileDock()}
      </div>
    );
  }

  if (currentView === 'halal_guide') {
    return (
      <div className="app-container">
        {renderHeaderNav()}
        <HalalGuide onBack={() => setCurrentView('home')} />
        <FooterDisclaimer onOpenDisclaimer={() => setCurrentView('disclaimer')} />
        {renderMobileDock()}
      </div>
    );
  }

  // DEFAULT DASHBOARD (HOME OVERVIEW)
  return (
    <div className="app-container">
      {renderHeaderNav()}

      {/* 1. Live Market Hero Layout */}
      <LiveMarketWidget 
        onOpenView={setCurrentView} 
        onSelectSymbol={setSelectedSymbol}
      />

      {/* 2. Pro Bento Tools Grid */}
      <div>
        <div className="section-header-row">
          <div className="section-title-clean">
            <Zap size={16} color="#f59e0b" />
            <span>Institutional Analytical Engines & Workspaces</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>
            7 Connected Real-Time Intelligence Engines
          </span>
        </div>

        <div className="bento-grid">
          {/* Unified AI Signal Bot & Technical Scanner */}
          <div className="bento-card bento-card-featured" onClick={() => setCurrentView('signal_bot')} style={{ borderLeft: '3px solid #38bdf8' }}>
            <div className="bento-card-top">
              <div className="bento-icon-box" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                <Bot size={22} />
              </div>
              <span className="bento-tag" style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8' }}>AI CONSENSUS & SCANNER 🤖📊</span>
            </div>
            <div>
              <div className="bento-title" style={{ fontSize: '17px' }}>AI Signal Bot & Master Technical Scanner</div>
              <div className="bento-desc">Interactive TradingView charts, multi-timeframe RSI, MACD, EMAs, TRADEN AI Consensus Matrix, and precise Lot Size Calculator with SL/TP risk controls.</div>
            </div>
          </div>

          {/* Gold Liquidity Radar */}
          <div className="bento-card" onClick={() => setCurrentView('gold_liquidity')} style={{ borderLeft: '3px solid #f59e0b' }}>
            <div className="bento-card-top">
              <div className="bento-icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                <Crosshair size={20} />
              </div>
              <span className="bento-tag" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' }}>SMC RADAR 🥇</span>
            </div>
            <div>
              <div className="bento-title">Gold SMC Liquidity Hub</div>
              <div className="bento-desc">Track real-time Liquidity Sweeps (BSL/SSL), Fair Value Gaps (FVG), and Institutional Order Blocks.</div>
            </div>
          </div>

          {/* EGX Egyptian Stocks & Thndr */}
          <div className="bento-card" onClick={() => setCurrentView('egx_stocks')} style={{ borderLeft: '3px solid #10b981' }}>
            <div className="bento-card-top">
              <div className="bento-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                <Globe size={20} />
              </div>
              <span className="bento-tag" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>EGX & THNDR 🇪🇬</span>
            </div>
            <div>
              <div className="bento-title">EGX 30 & Egyptian Equities Hub</div>
              <div className="bento-desc">AZ Gold Fund (AZG), Silver, CIB, TMGH, Fawry, and top Egyptian equities with live price analytics.</div>
            </div>
          </div>

          {/* Market Radar */}
          <div className="bento-card" onClick={() => setCurrentView('traden_radar')} style={{ borderLeft: '3px solid #818cf8' }}>
            <div className="bento-card-top">
              <div className="bento-icon-box" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                <Activity size={20} />
              </div>
              <span className="bento-tag" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8' }}>MULTI-MARKET 🌐</span>
            </div>
            <div>
              <div className="bento-title">Global Markets Multi-Asset Radar</div>
              <div className="bento-desc">High-frequency scanner across Forex, US Stocks, Indices, Commodities, and Crypto with live tick streaming.</div>
            </div>
          </div>

          {/* Live News & Market Sentiment */}
          <div className="bento-card" onClick={() => setCurrentView('market_news')} style={{ borderLeft: '3px solid #38bdf8' }}>
            <div className="bento-card-top">
              <div className="bento-icon-box" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                <Zap size={20} />
              </div>
              <span className="bento-tag" style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8' }}>AI SENTIMENT 📰</span>
            </div>
            <div>
              <div className="bento-title">Live Market News & AI Sentiment Hub</div>
              <div className="bento-desc">Real-time breaking financial news with NLP sentiment scoring and market impact evaluation.</div>
            </div>
          </div>

          {/* Precious Metals */}
          <div className="bento-card" onClick={() => setCurrentView('precious_metals')} style={{ borderLeft: '3px solid #fbbf24' }}>
            <div className="bento-card-top">
              <div className="bento-icon-box" style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24' }}>
                <Layers size={20} />
              </div>
              <span className="bento-tag" style={{ background: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24' }}>METALS 💎</span>
            </div>
            <div>
              <div className="bento-title">Precious Metals & Commodities</div>
              <div className="bento-desc">Spot Gold, Silver, Platinum, and Crude Oil with supply-demand orderflow tracking.</div>
            </div>
          </div>

          {/* Halal Investment Guide */}
          <div className="bento-card" onClick={() => setCurrentView('halal_guide')} style={{ borderLeft: '3px solid #34d399' }}>
            <div className="bento-card-top">
              <div className="bento-icon-box" style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399' }}>
                <BookOpen size={20} />
              </div>
              <span className="bento-tag" style={{ background: 'rgba(52, 211, 153, 0.2)', color: '#34d399' }}>HALAL 🕌</span>
            </div>
            <div>
              <div className="bento-title">Sharia Compliance & Halal Screener</div>
              <div className="bento-desc">Screen equities, swap-free trading rules, Islamic account parameters, and sharia benchmarks.</div>
            </div>
          </div>
        </div>
      </div>
      <FooterDisclaimer onOpenDisclaimer={() => setCurrentView('disclaimer')} />
      {renderMobileDock()}
    </div>
  );
}

export default App;

