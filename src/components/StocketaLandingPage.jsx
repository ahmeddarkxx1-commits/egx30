import React, { useState, useEffect } from 'react';
import { 
  Bot, Crosshair, Globe, Shield, Activity, Zap, TrendingUp, ChevronRight, 
  ArrowUpRight, CheckCircle2, Layers, BookOpen, Star, RefreshCw, Sparkles,
  BarChart2, ArrowRight, DollarSign, Lock, Play
} from 'lucide-react';
import { fetchLiveAssetTicker } from '../utils/priceFetcher';
import TradingViewSparkline from './TradingViewSparkline';

export default function StocketaLandingPage({ onLaunchApp, onOpenView, onSelectSymbol, theme, setTheme }) {
  const [activeTab, setActiveTab] = useState('1M');
  const [selectedAsset, setSelectedAsset] = useState('BTC/USDT');
  const [ticker, setTicker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);

  const featureItems = [
    {
      id: 'investments',
      title: 'Track your investments',
      desc: 'Tap any stock or crypto to see a preview of holding details, RSI matrix, and live market depth.',
      icon: Activity,
      view: 'traden_radar'
    },
    {
      id: 'signals',
      title: 'Transaction details & AI Signals',
      desc: 'Dive into individual trades with per-transaction stop loss, take profit targets, and AI confidence.',
      icon: Bot,
      view: 'signal_bot'
    },
    {
      id: 'smc',
      title: 'Gold SMC Liquidity Radar',
      desc: 'Identify Buy-side & Sell-side liquidity sweeps, Fair Value Gaps, and institutional order blocks.',
      icon: Crosshair,
      view: 'gold_liquidity'
    },
    {
      id: 'egx',
      title: 'EGX 30 & Egyptian Equities',
      desc: 'Track AZ Gold Fund (AZG), Silver, CIB, TMGH, Fawry, and top Egyptian equities with live price analytics.',
      icon: Globe,
      view: 'egx_stocks'
    },
    {
      id: 'halal',
      title: 'Halal Screener & Sharia Guide',
      desc: 'Screen equities, swap-free trading rules, Islamic account parameters, and sharia benchmarks.',
      icon: BookOpen,
      view: 'halal_guide'
    }
  ];

  // Auto-rotate active feature step every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeatureIndex(prev => (prev + 1) % featureItems.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Fetch live market data for interactive preview
  useEffect(() => {
    let isMounted = true;
    const loadTicker = async () => {
      try {
        const data = await fetchLiveAssetTicker(selectedAsset);
        if (isMounted) {
          setTicker(data);
          setLoading(false);
        }
      } catch (err) {
        console.error('Landing page ticker error:', err);
      }
    };
    loadTicker();
    const interval = setInterval(loadTicker, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedAsset]);

  const priceStr = ticker?.price 
    ? (ticker.price >= 1000 
        ? '$' + ticker.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : '$' + ticker.price)
    : '$86,410.75';

  const changeVal = ticker?.change24h || 1.46;
  const isPositive = changeVal >= 0;

  return (
    <div className="stocketa-landing-root">
      {/* 1. Header Navigation Bar */}
      <header className="stocketa-navbar-container">
        <div className="stocketa-navbar-inner">
          <div className="stocketa-brand-group" onClick={() => onLaunchApp('home')}>
            <div className="stocketa-brand-logo-icon">
              <TrendingUp size={18} color="#ffffff" />
            </div>
            <span className="stocketa-brand-name">Stocketa</span>
            <span className="stocketa-brand-sub">by TRADEN</span>
          </div>

          <nav className="stocketa-nav-links">
            <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="stocketa-nav-link">Features</a>
            <a href="#signals" onClick={(e) => scrollToSection(e, 'signals')} className="stocketa-nav-link">AI Signals</a>
            <a href="#egx" onClick={(e) => scrollToSection(e, 'features')} className="stocketa-nav-link">EGX 30 🇪🇬</a>
            <a href="#smc" onClick={(e) => scrollToSection(e, 'signals')} className="stocketa-nav-link">Gold SMC</a>
            <a href="#halal" onClick={(e) => scrollToSection(e, 'features')} className="stocketa-nav-link">Halal Check</a>
          </nav>

          <div className="stocketa-nav-actions">
            {/* Theme Switcher Button */}
            <button 
              onClick={() => setTheme && setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
              className="stocketa-btn-ghost stocketa-theme-btn"
            >
              <span className="desktop-theme-text">{theme === 'dark' ? '☀️ Light' : '🌙 Dark'}</span>
              <span className="mobile-theme-text">{theme === 'dark' ? '☀️' : '🌙'}</span>
            </button>

            <button 
              onClick={() => onLaunchApp('home')} 
              className="stocketa-btn-primary stocketa-launch-btn"
            >
              <span>Terminal</span> <ArrowUpRight size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section (2-Column Desktop Grid) */}
      <section className="stocketa-hero-section">
        <div className="stocketa-hero-container">
          {/* Left Column: Headlines & Feature Items */}
          <div className="stocketa-hero-left">
            <div className="stocketa-pill-badge">
              <Sparkles size={13} color="#995bb9" />
              <span>TRADEN AI MATRIX v4.2</span>
            </div>

            <h1 className="stocketa-display-headline">
              Checking your stocks & crypto should be easy.
            </h1>

            <p className="stocketa-hero-lead">
              Stocketa by TRADEN is the most elegant way to keep an eye on your investments, 
              institutional SMC gold sweeps, EGX 30 equities, and live AI trade setups.
            </p>

            <div className="stocketa-hero-btn-row">
              <button 
                onClick={() => onLaunchApp('home')} 
                className="stocketa-btn-primary"
              >
                Read more <ArrowRight size={16} />
              </button>

              <button 
                onClick={() => onLaunchApp('signal_bot')} 
                className="stocketa-btn-ghost"
              >
                Get notified at launch
              </button>
            </div>

            {/* Vertical Interactive Feature List Items */}
            <div className="stocketa-feature-list">
              {featureItems.map((item, index) => {
                const IconComp = item.icon;
                const isActive = activeFeatureIndex === index;
                return (
                  <div 
                    key={item.id}
                    className={`stocketa-feature-item ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      setActiveFeatureIndex(index);
                    }}
                  >
                    <div className="stocketa-feature-icon-badge">
                      <IconComp size={20} color={isActive ? '#ffffff' : '#995bb9'} />
                    </div>
                    <div>
                      <h3 className="stocketa-feature-title">{item.title}</h3>
                      <p className="stocketa-feature-desc">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Dynamic iPhone Mockup Screen & Floating Stock Tickers */}
          <div className="stocketa-hero-right">
            <div className="stocketa-phone-wrapper">
              
              {/* Floating Stock Card 1 (AAPL - Top Left) */}
              <div 
                className="stocketa-floating-card float-aapl"
                onClick={() => {
                  setSelectedAsset('EUR/USD');
                  if (onSelectSymbol) onSelectSymbol('EUR/USD');
                }}
              >
                <div className="floating-card-top">
                  <span className="floating-ticker-name">AAPL</span>
                  <span className="floating-ticker-price">$174.55</span>
                </div>
                <div className="floating-ticker-change pos">
                  +1.53 (+0.88%)
                </div>
                <div className="floating-spark-container">
                  <TradingViewSparkline isUp={true} height={28} seed="AAPL" strokeWidth={2} />
                </div>
              </div>

              {/* Floating Stock Card 2 (TSLA - Left Middle) */}
              <div 
                className="stocketa-floating-card float-tsla"
                onClick={() => {
                  setSelectedAsset('BTC/USDT');
                  if (onSelectSymbol) onSelectSymbol('BTC/USDT');
                }}
              >
                <div className="floating-card-top">
                  <span className="floating-ticker-name">TSLA</span>
                  <span className="floating-ticker-price">$971.99</span>
                </div>
                <div className="floating-ticker-change neg">
                  -1.79 (-0.18%)
                </div>
                <div className="floating-spark-container">
                  <TradingViewSparkline isUp={false} height={24} seed="TSLA" strokeWidth={2} />
                </div>
              </div>

              {/* Floating Stock Card 3 (BTC / GOLD - Bottom Right) */}
              <div 
                className="stocketa-floating-card float-sq"
                onClick={() => {
                  setSelectedAsset('XAU/USD');
                  if (onSelectSymbol) onSelectSymbol('XAU/USD');
                }}
              >
                <div className="floating-card-top">
                  <span className="floating-ticker-name">XAU/USD</span>
                  <span className="floating-ticker-price">$2,684.20</span>
                </div>
                <div className="floating-ticker-change pos">
                  +$34.10 (+1.28%)
                </div>
                <div className="floating-spark-container">
                  <TradingViewSparkline isUp={true} height={26} seed="XAUUSD" strokeWidth={2} />
                </div>
              </div>

              {/* Frosted Glass Shadow Stack Backdrop (Stocketa 3D Layered Depth Effect) */}
              <div className="stocketa-phone-stack-shadow"></div>

              {/* The Central Dynamic iPhone Frame Mockup */}
              <div className="stocketa-phone-frame">
                {/* iPhone Notch & Dynamic Island */}
                <div className="phone-notch-pill"></div>

                {/* Phone Status Bar */}
                <div className="phone-top-bar">
                  <span className="phone-time">9:41</span>
                  <span className="phone-app-title">Stocketa</span>
                  <div className="phone-status-icons">
                    <span className="phone-signal-bars"></span>
                  </div>
                </div>

                {/* Dynamic Phone Content Screen (Changes per Active Feature Step) */}
                <div className="phone-inner-screen animated-screen-fade" key={activeFeatureIndex}>
                  
                  {/* FEATURE SCREEN 0: PORTFOLIO HOLDINGS */}
                  {activeFeatureIndex === 0 && (
                    <>
                      <div className="phone-holdings-header">
                        <div className="phone-label-muted">Holdings</div>
                        <div className="phone-price-main mono">{priceStr}</div>
                        <div className="phone-change-line pos">
                          <span>+$456.10 (+15.91%) 24h</span>
                          <span className="phone-live-dot">LIVE</span>
                        </div>
                      </div>

                      <div className="phone-asset-tabs">
                        {[
                          { sym: 'BTC/USDT', name: 'BTC' },
                          { sym: 'XAU/USD', name: 'GOLD' },
                          { sym: 'EGX30', name: 'EGX 30' },
                          { sym: 'ETH/USDT', name: 'ETH' },
                        ].map(item => (
                          <button
                            key={item.sym}
                            onClick={() => setSelectedAsset(item.sym)}
                            className={`phone-tab-chip ${selectedAsset === item.sym ? 'active' : ''}`}
                          >
                            {item.name}
                          </button>
                        ))}
                      </div>

                      <div className="phone-time-tabs">
                        {['1D', '1M', '6M', '1Y', '5Y', 'ALL'].map(t => (
                          <button
                            key={t}
                            onClick={() => setActiveTab(t)}
                            className={`phone-time-chip ${activeTab === t ? 'active' : ''}`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>

                      <div className="phone-chart-area">
                        <TradingViewSparkline
                          isUp={isPositive}
                          height={90}
                          seed={selectedAsset}
                          strokeWidth={2.5}
                        />
                      </div>

                      <div className="phone-holdings-list">
                        <div 
                          className="phone-holding-card"
                          onClick={() => {
                            if (onSelectSymbol) onSelectSymbol(selectedAsset);
                            onLaunchApp('signal_bot');
                          }}
                        >
                          <div className="holding-left">
                            <div className="holding-icon-circle">
                              <Zap size={14} color="#995bb9" />
                            </div>
                            <div>
                              <div className="holding-ticker">{selectedAsset}</div>
                              <div className="holding-company">AI Consensus Signal</div>
                            </div>
                          </div>
                          <div className="holding-right">
                            <div className="holding-price mono">{priceStr}</div>
                            <div className={`holding-pct ${isPositive ? 'pos' : 'neg'}`}>
                              {isPositive ? '▲ +' : '▼ '}{changeVal}%
                            </div>
                          </div>
                        </div>

                        <div 
                          className="phone-holding-card"
                          onClick={() => onLaunchApp('egx_stocks')}
                        >
                          <div className="holding-left">
                            <div className="holding-icon-circle" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
                              <Globe size={14} color="#10b981" />
                            </div>
                            <div>
                              <div className="holding-ticker">AZG / EGX30</div>
                              <div className="holding-company">Egyptian Equities</div>
                            </div>
                          </div>
                          <div className="holding-right">
                            <div className="holding-price mono">EGP 31,450.00</div>
                            <div className="holding-pct pos">+2.14%</div>
                          </div>
                        </div>
                      </div>

                      <button 
                        className="phone-bottom-action"
                        onClick={() => onLaunchApp('traden_radar')}
                      >
                        <span>Open Multi-Market Radar</span>
                        <ArrowUpRight size={14} />
                      </button>
                    </>
                  )}

                  {/* FEATURE SCREEN 1: AI SIGNALS & TRANSACTION DETAILS */}
                  {activeFeatureIndex === 1 && (
                    <>
                      <div className="phone-holdings-header" style={{ borderBottom: 'none', paddingBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span className="phone-label-muted" style={{ fontWeight: '700' }}>AI SIGNALS & SCANNER</span>
                          <span className="phone-live-dot" style={{ background: 'rgba(153, 91, 185, 0.15)', color: '#995bb9' }}>94.8% AI ACCURACY</span>
                        </div>
                        <div className="phone-price-main mono" style={{ fontSize: '20px', marginTop: '4px', color: '#10b981' }}>
                          BTC/USDT BUY SETUP
                        </div>
                      </div>

                      <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '14px', padding: '10px', margin: '4px 0 10px 0' }}>
                        <div style={{ fontSize: '11px', color: '#9aa1b2', fontWeight: '700' }}>TRADE LEVELS & TARGETS</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginTop: '6px', textAlign: 'center' }}>
                          <div style={{ background: 'rgba(255,255,255,0.7)', padding: '6px', borderRadius: '8px' }}>
                            <div style={{ fontSize: '9px', color: '#64748b' }}>ENTRY</div>
                            <div style={{ fontSize: '11px', fontWeight: '800', color: '#1e293b' }}>$86,400</div>
                          </div>
                          <div style={{ background: 'rgba(255,255,255,0.7)', padding: '6px', borderRadius: '8px' }}>
                            <div style={{ fontSize: '9px', color: '#10b981' }}>TARGET 1</div>
                            <div style={{ fontSize: '11px', fontWeight: '800', color: '#10b981' }}>$88,500</div>
                          </div>
                          <div style={{ background: 'rgba(255,255,255,0.7)', padding: '6px', borderRadius: '8px' }}>
                            <div style={{ fontSize: '9px', color: '#f43f5e' }}>STOP LOSS</div>
                            <div style={{ fontSize: '11px', fontWeight: '800', color: '#f43f5e' }}>$84,200</div>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '4px 0 12px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: '#f8fafc', borderRadius: '10px', fontSize: '11px' }}>
                          <span style={{ color: '#64748b', fontWeight: '600' }}>RSI (14) Momentum</span>
                          <span style={{ fontWeight: '800', color: '#10b981' }}>68.4 Bullish</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: '#f8fafc', borderRadius: '10px', fontSize: '11px' }}>
                          <span style={{ color: '#64748b', fontWeight: '600' }}>MACD Crossover</span>
                          <span style={{ fontWeight: '800', color: '#10b981' }}>Confirmed ▲</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: '#f8fafc', borderRadius: '10px', fontSize: '11px' }}>
                          <span style={{ color: '#64748b', fontWeight: '600' }}>EMA 20/50 Alignment</span>
                          <span style={{ fontWeight: '800', color: '#995bb9' }}>Golden Cross</span>
                        </div>
                      </div>

                      <button 
                        className="phone-bottom-action"
                        style={{ background: '#995bb9', color: '#ffffff' }}
                        onClick={() => onLaunchApp('signal_bot')}
                      >
                        <span>Launch AI Signal Terminal</span>
                        <ArrowUpRight size={14} />
                      </button>
                    </>
                  )}

                  {/* FEATURE SCREEN 2: GOLD SMC LIQUIDITY RADAR */}
                  {activeFeatureIndex === 2 && (
                    <>
                      <div className="phone-holdings-header">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span className="phone-label-muted">GOLD SMC RADAR 🥇</span>
                          <span className="phone-live-dot" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>SMC ACTIVE</span>
                        </div>
                        <div className="phone-price-main mono">$2,684.20</div>
                        <div className="phone-change-line pos">
                          <span>+$34.10 (+1.28%) Spot Gold</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '8px 0 12px 0' }}>
                        <div style={{ padding: '10px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px' }}>
                          <div style={{ fontSize: '10px', color: '#b45309', fontWeight: '800' }}>⚡ LIQUIDITY SWEEP DETECTED</div>
                          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#1e293b', marginTop: '2px' }}>
                            Buy-Side Liquidity (BSL) Swept @ $2,692.00
                          </div>
                        </div>

                        <div style={{ padding: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                          <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '800' }}>🎯 BULLISH FAIR VALUE GAP (FVG)</div>
                          <div style={{ fontSize: '11.5px', fontWeight: '700', color: '#10b981', marginTop: '2px' }}>
                            $2,645.00 – $2,652.00 Institutional Zone
                          </div>
                        </div>

                        <div style={{ padding: '8px 10px', background: '#f8fafc', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                          <span style={{ color: '#64748b', fontWeight: '600' }}>Orderflow Sentiment</span>
                          <span style={{ fontWeight: '800', color: '#10b981' }}>92% Institutional Buy</span>
                        </div>
                      </div>

                      <button 
                        className="phone-bottom-action"
                        style={{ background: '#f59e0b', color: '#000000' }}
                        onClick={() => onLaunchApp('gold_liquidity')}
                      >
                        <span>Analyze Gold SMC Sweeps</span>
                        <ArrowUpRight size={14} />
                      </button>
                    </>
                  )}

                  {/* FEATURE SCREEN 3: EGX 30 & EGYPTIAN EQUITIES */}
                  {activeFeatureIndex === 3 && (
                    <>
                      <div className="phone-holdings-header">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span className="phone-label-muted">EGX 30 EQUITIES 🇪🇬</span>
                          <span className="phone-live-dot">LIVE FEED</span>
                        </div>
                        <div className="phone-price-main mono">31,450.20 EGP</div>
                        <div className="phone-change-line pos">
                          <span>+572.40 (+1.85%) Today</span>
                        </div>
                      </div>

                      <div className="phone-holdings-list" style={{ margin: '8px 0 12px 0' }}>
                        <div className="phone-holding-card">
                          <div className="holding-left">
                            <div className="holding-icon-circle" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                              <span>🥇</span>
                            </div>
                            <div>
                              <div className="holding-ticker">AZG (AZ Gold Fund)</div>
                              <div className="holding-company">Gold Investment Fund</div>
                            </div>
                          </div>
                          <div className="holding-right">
                            <div className="holding-price mono">EGP 28.40</div>
                            <div className="holding-pct pos">+2.40%</div>
                          </div>
                        </div>

                        <div className="phone-holding-card">
                          <div className="holding-left">
                            <div className="holding-icon-circle" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                              <span>🏛️</span>
                            </div>
                            <div>
                              <div className="holding-ticker">CIB Bank</div>
                              <div className="holding-company">Banking & Finance</div>
                            </div>
                          </div>
                          <div className="holding-right">
                            <div className="holding-price mono">EGP 84.50</div>
                            <div className="holding-pct pos">+1.90%</div>
                          </div>
                        </div>
                      </div>

                      <button 
                        className="phone-bottom-action"
                        style={{ background: '#10b981', color: '#ffffff' }}
                        onClick={() => onLaunchApp('egx_stocks')}
                      >
                        <span>Open EGX 30 Equities Hub</span>
                        <ArrowUpRight size={14} />
                      </button>
                    </>
                  )}

                  {/* FEATURE SCREEN 4: HALAL SHARIA SCREENER */}
                  {activeFeatureIndex === 4 && (
                    <>
                      <div className="phone-holdings-header">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span className="phone-label-muted">SHARIA SCREENER 🕌</span>
                          <span className="phone-live-dot" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>VERIFIED HALAL</span>
                        </div>
                        <div className="phone-price-main mono" style={{ color: '#10b981', fontSize: '20px' }}>
                          HALAL COMPLIANT 🟢
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '8px 0 12px 0' }}>
                        <div style={{ padding: '8px 10px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '10px' }}>
                          <div style={{ fontSize: '10px', color: '#047857', fontWeight: '800' }}>DEBT RATIO AUDIT</div>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', marginTop: '2px' }}>
                            12.4% Debt (Passes &lt; 33% Benchmark)
                          </div>
                        </div>

                        <div style={{ padding: '8px 10px', background: '#f8fafc', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                          <span style={{ color: '#64748b', fontWeight: '600' }}>Non-Permissible Income</span>
                          <span style={{ fontWeight: '800', color: '#10b981' }}>0.4% (Purified)</span>
                        </div>

                        <div style={{ padding: '8px 10px', background: '#f8fafc', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                          <span style={{ color: '#64748b', fontWeight: '600' }}>Account Mode</span>
                          <span style={{ fontWeight: '800', color: '#995bb9' }}>Swap-Free Approved</span>
                        </div>
                      </div>

                      <button 
                        className="phone-bottom-action"
                        style={{ background: '#34d399', color: '#000000' }}
                        onClick={() => onLaunchApp('halal_guide')}
                      >
                        <span>Screen Any Stock Sharia Rules</span>
                        <ArrowUpRight size={14} />
                      </button>
                    </>
                  )}

                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Proof & Metrics Bar */}
      <section className="stocketa-metrics-bar">
        <div className="stocketa-metrics-container">
          <div className="stocketa-metric-box">
            <div className="stocketa-metric-num">98.4%</div>
            <div className="stocketa-metric-lbl">AI Technical Precision</div>
          </div>
          <div className="stocketa-metric-box">
            <div className="stocketa-metric-num">7+</div>
            <div className="stocketa-metric-lbl">Institutional Engines</div>
          </div>
          <div className="stocketa-metric-box">
            <div className="stocketa-metric-num">🇪🇬 EGX 30</div>
            <div className="stocketa-metric-lbl">Live Egyptian Exchange</div>
          </div>
          <div className="stocketa-metric-box">
            <div className="stocketa-metric-num">&lt; 50ms</div>
            <div className="stocketa-metric-lbl">Global Feed Latency</div>
          </div>
        </div>
      </section>

      {/* 4. Core Features Grid Section */}
      <section id="features" className="stocketa-section">
        <div className="stocketa-section-container">
          <div className="stocketa-section-header">
            <div className="stocketa-section-tag">UNMATCHED PRECISION</div>
            <h2 className="stocketa-heading-gradient">
              Designed for traders who demand absolute clarity.
            </h2>
            <p className="stocketa-section-sub">
              Every detail in Stocketa by TRADEN is engineered to give you unfair market advantage 
              without cognitive overload.
            </p>
          </div>

          <div className="stocketa-grid-3col">
            {/* Feature Card 1 */}
            <div 
              className="stocketa-card-surface" 
              onClick={() => onLaunchApp('signal_bot')}
            >
              <div className="stocketa-card-icon-badge">
                <Bot size={22} color="#995bb9" />
              </div>
              <h3 className="stocketa-card-title">AI Consensus Matrix</h3>
              <p className="stocketa-card-desc">
                Combines multi-timeframe RSI, MACD, Moving Averages, and Volume Profiles into a single high-probability trade direction.
              </p>
              <div className="stocketa-card-link">
                <span>Explore Signals</span> <ArrowRight size={14} />
              </div>
            </div>

            {/* Feature Card 2 */}
            <div 
              className="stocketa-card-surface" 
              onClick={() => onLaunchApp('gold_liquidity')}
            >
              <div className="stocketa-card-icon-badge">
                <Crosshair size={22} color="#995bb9" />
              </div>
              <h3 className="stocketa-card-title">SMC Gold Liquidity Radar</h3>
              <p className="stocketa-card-desc">
                Detects institutional Smart Money Concepts: Buy-side/Sell-side liquidity sweeps, FVGs, and premium/discount order blocks.
              </p>
              <div className="stocketa-card-link">
                <span>View Gold SMC</span> <ArrowRight size={14} />
              </div>
            </div>

            {/* Feature Card 3 */}
            <div 
              className="stocketa-card-surface" 
              onClick={() => onLaunchApp('egx_stocks')}
            >
              <div className="stocketa-card-icon-badge">
                <Globe size={22} color="#995bb9" />
              </div>
              <h3 className="stocketa-card-title">EGX 30 & Egyptian Equities</h3>
              <p className="stocketa-card-desc">
                Dedicated intelligence for CIB, TMGH, Fawry, EFG Hermes, and AZ Gold Fund (AZG) with live EGP prices and trends.
              </p>
              <div className="stocketa-card-link">
                <span>Open EGX Hub</span> <ArrowRight size={14} />
              </div>
            </div>

            {/* Feature Card 4 */}
            <div 
              className="stocketa-card-surface" 
              onClick={() => onLaunchApp('market_news')}
            >
              <div className="stocketa-card-icon-badge">
                <Zap size={22} color="#995bb9" />
              </div>
              <h3 className="stocketa-card-title">NLP News Sentiment</h3>
              <p className="stocketa-card-desc">
                Scans financial headlines continuously and rates market sentiment (Bullish / Bearish / Neutral) before price breaks out.
              </p>
              <div className="stocketa-card-link">
                <span>Read Sentiment</span> <ArrowRight size={14} />
              </div>
            </div>

            {/* Feature Card 5 */}
            <div 
              className="stocketa-card-surface" 
              onClick={() => onLaunchApp('halal_guide')}
            >
              <div className="stocketa-card-icon-badge">
                <BookOpen size={22} color="#995bb9" />
              </div>
              <h3 className="stocketa-card-title">Sharia & Halal Screener</h3>
              <p className="stocketa-card-desc">
                Automated Sharia compliance check for stocks and Islamic swap-free account parameters.
              </p>
              <div className="stocketa-card-link">
                <span>Check Compliance</span> <ArrowRight size={14} />
              </div>
            </div>

            {/* Feature Card 6 */}
            <div 
              className="stocketa-card-surface" 
              onClick={() => onLaunchApp('precious_metals')}
            >
              <div className="stocketa-card-icon-badge">
                <Layers size={22} color="#995bb9" />
              </div>
              <h3 className="stocketa-card-title">Metals & Commodities</h3>
              <p className="stocketa-card-desc">
                Real-time spot tracking for Gold (XAU), Silver (XAG), Platinum, and Crude Oil orderflow dynamics.
              </p>
              <div className="stocketa-card-link">
                <span>View Metals</span> <ArrowRight size={14} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Interactive Demo Section */}
      <section id="signals" className="stocketa-section stocketa-section-tint">
        <div className="stocketa-section-container">
          <div className="stocketa-demo-box">
            <div className="stocketa-demo-left">
              <div className="stocketa-pill-badge">
                <Play size={12} color="#995bb9" />
                <span>INTERACTIVE LIVE DEMO</span>
              </div>
              <h2 className="stocketa-heading-gradient" style={{ fontSize: '38px' }}>
                Test the Stocketa AI setup right now.
              </h2>
              <p className="stocketa-hero-lead" style={{ fontSize: '16px' }}>
                Select any asset below to view live tick updates and run the TRADEN AI Consensus Matrix in real-time.
              </p>

              <div className="stocketa-demo-assets">
                {[
                  { symbol: 'BTC/USDT', label: 'Bitcoin (BTC)' },
                  { symbol: 'XAU/USD', label: 'Gold (XAU)' },
                  { symbol: 'EUR/USD', label: 'Euro / USD' },
                  { symbol: 'US30', label: 'Dow Jones (US30)' },
                ].map(item => (
                  <button
                    key={item.symbol}
                    onClick={() => setSelectedAsset(item.symbol)}
                    className={`stocketa-demo-asset-btn ${selectedAsset === item.symbol ? 'active' : ''}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="stocketa-demo-right">
              <div className="stocketa-demo-card">
                <div className="demo-card-top">
                  <div>
                    <span className="demo-asset-title">{selectedAsset}</span>
                    <span className="demo-sub">Global Exchange Stream</span>
                  </div>
                  <div className={`demo-pct-chip ${isPositive ? 'pos' : 'neg'}`}>
                    {isPositive ? '▲ +' : '▼ '}{changeVal.toFixed(2)}%
                  </div>
                </div>

                <div className="demo-price-big mono">
                  {loading ? 'SYNCING...' : priceStr}
                </div>

                <div style={{ height: '70px', margin: '14px 0' }}>
                  <TradingViewSparkline
                    isUp={isPositive}
                    height={70}
                    seed={selectedAsset}
                    strokeWidth={2.5}
                  />
                </div>

                <button 
                  onClick={() => {
                    if (onSelectSymbol) onSelectSymbol(selectedAsset);
                    onLaunchApp('signal_bot');
                  }}
                  className="stocketa-btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <Zap size={16} />
                  <span>Launch Deep AI Analysis for {selectedAsset}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5.5 Signature Frosted Blur Callout Section ("Track Gold. Trade Signals. That's TRADEN.") */}
      <section id="signature-blur" className="stocketa-blur-signature-section">
        {/* Floating background currency symbols */}
        <div className="floating-symbols-container">
          <span className="float-symbol symbol-1">$</span>
          <span className="float-symbol symbol-2">$</span>
          <span className="float-symbol symbol-3">EGP</span>
          <span className="float-symbol symbol-4">XAU</span>
          <span className="float-symbol symbol-5">$</span>
          <span className="float-symbol symbol-6">BTC</span>
        </div>

        <div className="blur-signature-content">
          {/* Background Vibrant Gradient Text Overlay */}
          <div className="aurora-hero-text">
            <div className="aurora-text-line line-1">Track Gold.</div>
            <div className="aurora-text-line line-2">Trade Signals.</div>
            <div className="aurora-text-line line-3">That's TRADEN.</div>
          </div>

          {/* Foreground Glass Phone Frame & Category Screener */}
          <div className="signature-phone-container">
            <div className="stocketa-floating-card float-tsla" style={{ top: '15%', left: '8%' }}>
              <span className="floating-ticker-name">AZG</span>
              <span className="floating-ticker-price">EGP 28.40</span>
            </div>
            
            <div className="stocketa-floating-card float-aapl" style={{ top: '22%', right: '8%' }}>
              <span className="floating-ticker-name">XAU/USD</span>
              <span className="floating-ticker-price">$2,684.20</span>
            </div>

            <div className="stocketa-floating-card float-sq" style={{ bottom: '15%', left: '10%' }}>
              <span className="floating-ticker-name">BTC/USD</span>
              <span className="floating-ticker-price">$86,410</span>
            </div>

            <div className="stocketa-phone-frame signature-phone-frame">
              <div className="phone-notch-pill"></div>
              
              <div className="phone-top-bar">
                <span className="phone-time">3:14</span>
                <span className="phone-app-title">TRADEN AI</span>
                <div className="phone-status-icons">
                  <span className="phone-signal-bars"></span>
                </div>
              </div>

              <div className="phone-inner-screen screener-screen">
                <div className="screener-search-bar">
                  <span>🔍 Search stocks, gold, EGX 30...</span>
                </div>

                <div className="screener-pills">
                  <span className="screener-pill active">Stocks & Gold</span>
                  <span className="screener-pill">Crypto</span>
                  <span className="screener-pill">EGX 30</span>
                </div>

                <div className="screener-category-list">
                  <div className="screener-cat-item" onClick={() => onLaunchApp('signal_bot')}>
                    <span className="cat-badge-icon" style={{ background: '#ff4d4d' }}>🔥</span>
                    <span className="cat-name">Popular AI Signals</span>
                    <ChevronRight size={14} className="cat-arrow" />
                  </div>

                  <div className="screener-cat-item" onClick={() => onLaunchApp('gold_liquidity')}>
                    <span className="cat-badge-icon" style={{ background: '#f59e0b' }}>🥇</span>
                    <span className="cat-name">Gold & SMC Sweeps</span>
                    <ChevronRight size={14} className="cat-arrow" />
                  </div>

                  <div className="screener-cat-item" onClick={() => onLaunchApp('egx_stocks')}>
                    <span className="cat-badge-icon" style={{ background: '#10b981' }}>🇪🇬</span>
                    <span className="cat-name">EGX 30 & Thndr Stocks</span>
                    <ChevronRight size={14} className="cat-arrow" />
                  </div>

                  <div className="screener-cat-item" onClick={() => onLaunchApp('halal_guide')}>
                    <span className="cat-badge-icon" style={{ background: '#34d399' }}>🕌</span>
                    <span className="cat-name">Halal Sharia Screener</span>
                    <ChevronRight size={14} className="cat-arrow" />
                  </div>

                  <div className="screener-cat-item" onClick={() => onLaunchApp('precious_metals')}>
                    <span className="cat-badge-icon" style={{ background: '#38bdf8' }}>💎</span>
                    <span className="cat-name">Precious Metals & Oil</span>
                    <ChevronRight size={14} className="cat-arrow" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Call To Action (CTA) Section */}
      <section className="stocketa-cta-section">
        <div className="stocketa-cta-container">
          <div className="stocketa-pill-badge" style={{ margin: '0 auto 16px auto' }}>
            <Sparkles size={13} color="#995bb9" />
            <span>READY TO ELEVATE YOUR TRADING?</span>
          </div>

          <h2 className="stocketa-heading-gradient" style={{ fontSize: '48px', textAlign: 'center' }}>
            Experience Stocketa by TRADEN today.
          </h2>

          <p className="stocketa-hero-lead" style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 32px auto' }}>
            Instant access to AI Signals, SMC Gold Sweeps, EGX Equities, and Real-Time Sentiment. No credit card required to explore.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              onClick={() => onLaunchApp('home')} 
              className="stocketa-btn-primary"
              style={{ padding: '16px 36px', fontSize: '17px' }}
            >
              Open Institutional App <ArrowUpRight size={18} />
            </button>
            <button 
              onClick={() => onLaunchApp('signal_bot')} 
              className="stocketa-btn-ghost"
              style={{ padding: '16px 36px', fontSize: '17px' }}
            >
              View AI Signal Engine
            </button>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="stocketa-footer">
        <div className="stocketa-footer-container">
          <div className="stocketa-footer-left">
            <div className="stocketa-brand-group">
              <div className="stocketa-brand-logo-icon">
                <TrendingUp size={16} color="#ffffff" />
              </div>
              <span className="stocketa-brand-name" style={{ fontSize: '20px' }}>Stocketa</span>
            </div>
            <p className="stocketa-footer-copy">
              Neon aurora on frosted glass — light, weightless trading intelligence by TRADEN PRO AI.
            </p>
          </div>

          <div className="stocketa-footer-links">
            <div>
              <h4 className="footer-col-title">Engines</h4>
              <button onClick={() => onLaunchApp('signal_bot')}>AI Consensus</button>
              <button onClick={() => onLaunchApp('gold_liquidity')}>Gold SMC</button>
              <button onClick={() => onLaunchApp('egx_stocks')}>EGX 30 Hub</button>
            </div>
            <div>
              <h4 className="footer-col-title">Markets</h4>
              <button onClick={() => onLaunchApp('traden_radar')}>Global Radar</button>
              <button onClick={() => onLaunchApp('precious_metals')}>Metals</button>
              <button onClick={() => onLaunchApp('halal_guide')}>Halal Screener</button>
            </div>
            <div>
              <h4 className="footer-col-title">System</h4>
              <span className="footer-status-pill">🟢 Live Feed Connected</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
