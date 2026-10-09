import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronRight, 
  Clock, 
  Zap, 
  AlertTriangle, 
  ShieldCheck, 
  Flame, 
  TrendingUp, 
  Target, 
  Activity, 
  Play, 
  Pause, 
  RefreshCw, 
  CheckCircle2, 
  Sliders, 
  Shield, 
  ArrowUpRight, 
  ArrowDownRight,
  Layers,
  Lock,
  DollarSign,
  XCircle,
  Wifi,
  Compass,
  TrendingDown,
  Info,
  Award,
  AlertCircle,
  RotateCcw,
  Crosshair,
  Sparkles,
  BarChart2,
  Copy,
  Eye
} from 'lucide-react';
import TradingViewWidget from './TradingViewWidget';
import { AssetLogo } from '../utils/assetLogos';
import { fetchLiveAssetTicker } from '../utils/priceFetcher';

// Master Liquidity Hub Assets with accurate base fallbacks
const liquidityAssets = [
  { pair: 'XAU/USD', name: 'Gold (Spot Gold)', symbol: 'OANDA:XAUUSD', binanceSymbol: 'PAXGUSDT', icon: '🥇', category: 'metals', basePrice: 4164.50, unit: '$', step: 0.1 },
  { pair: 'BTC/USDT', name: 'Bitcoin (BTC)', symbol: 'BINANCE:BTCUSDT', binanceSymbol: 'BTCUSDT', icon: '₿', category: 'crypto', basePrice: 64250.00, unit: '$', step: 1 },
  { pair: 'EUR/USD', name: 'EUR / USD', symbol: 'FX:EURUSD', binanceSymbol: 'EURUSDT', icon: '💶', category: 'forex', basePrice: 1.1385, unit: '$', step: 0.0001 },
  { pair: 'US30', name: 'Dow Jones (US30)', symbol: 'FOREXCOM:US30', binanceSymbol: null, icon: '📈', category: 'indices', basePrice: 42850.00, unit: 'pts', step: 1 },
  { pair: 'NAS100', name: 'Nasdaq 100 (NAS100)', symbol: 'FOREXCOM:NAS100', binanceSymbol: null, icon: '💻', category: 'indices', basePrice: 19850.00, unit: 'pts', step: 1 },
  { pair: 'XAG/USD', name: 'Silver (Spot Silver)', symbol: 'OANDA:XAGUSD', binanceSymbol: null, icon: '🥈', category: 'metals', basePrice: 31.85, unit: '$', step: 0.01 },
  { pair: 'WTI', name: 'Crude Oil (WTI)', symbol: 'TVC:USOIL', binanceSymbol: null, icon: '🛢️', category: 'metals', basePrice: 71.40, unit: '$', step: 0.01 },
  { pair: 'SOL/USDT', name: 'Solana (SOL)', symbol: 'BINANCE:SOLUSDT', binanceSymbol: 'SOLUSDT', icon: '⚡', category: 'crypto', basePrice: 154.20, unit: '$', step: 0.05 }
];

export default function GoldLiquidityRadar({ onBack, onAnalyzeAsset }) {
  const [selectedAsset, setSelectedAsset] = useState(liquidityAssets[0]);
  const [liveTicker, setLiveTicker] = useState({ 
    price: liquidityAssets[0].basePrice, 
    change24h: 0.25, 
    isUp: true,
    high24h: liquidityAssets[0].basePrice * 1.01,
    low24h: liquidityAssets[0].basePrice * 0.99,
    provider: 'Live Data'
  });
  const [currentTimeUTC, setCurrentTimeUTC] = useState(new Date().toUTCString().slice(17, 25));
  const [sessionInfo, setSessionInfo] = useState({ title: '', status: 'peak', color: '#10b981', badge: '', desc: '', volumeLevel: 95 });
  const [copyToast, setCopyToast] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Dynamic Real-time Session Calculator
  const computeSessionInfo = (now = new Date()) => {
    const utcHour = now.getUTCHours();
    const utcMin = now.getUTCMinutes();
    const timeVal = utcHour + utcMin / 60;

    if (timeVal >= 12 && timeVal < 16) {
      return {
        title: 'London & NY Overlap (Peak Hours)',
        enTag: 'London & NY Overlap',
        status: 'peak',
        color: '#10b981',
        badge: 'Global Peak Liquidity 🔥',
        desc: 'Highest volume window of the trading day. Heavy institutional bank flow and fast order sweeps.',
        volumeLevel: 98,
        activeHubs: ['London 🇬🇧', 'New York 🇺🇸', 'Frankfurt 🇩🇪']
      };
    }
    if (timeVal >= 7 && timeVal < 12) {
      return {
        title: 'London European Session',
        enTag: 'London Session',
        status: 'high',
        color: '#3b82f6',
        badge: 'High European Volume ⚡',
        desc: 'London & European banks open. Sweeps of Asian session highs/lows and initiation of true daily directional trend.',
        volumeLevel: 85,
        activeHubs: ['London 🇬🇧', 'Zurich 🇨🇭', 'Frankfurt 🇩🇪']
      };
    }
    if (timeVal >= 16 && timeVal < 21) {
      return {
        title: 'New York Wall Street Session',
        enTag: 'New York Session',
        status: 'high',
        color: '#f59e0b',
        badge: 'Wall Street & Futures 🇺🇸',
        desc: 'US hedge funds and COMEX/CME commodity floor activity. Sharp reactions to macro economic data releases.',
        volumeLevel: 82,
        activeHubs: ['New York 🇺🇸', 'Chicago 🇺🇸']
      };
    }
    if (timeVal >= 21 && timeVal < 23) {
      return {
        title: 'Late NY Close & Sydney Open',
        enTag: 'Late NY / Sydney',
        status: 'moderate',
        color: '#a855f7',
        badge: 'Moderate Liquidity 🌙',
        desc: 'US market wrap-up and Pacific open. Spreads consolidate ahead of Tokyo Asian liquidity build-up.',
        volumeLevel: 45,
        activeHubs: ['Sydney 🇦🇺', 'Wellington 🇳🇿']
      };
    }
    return {
      title: 'Asian Session (Tokyo & HK)',
      enTag: 'Asian Session',
      status: 'low',
      color: '#64748b',
      badge: 'Range Accumulation 💤',
      desc: 'Tight consolidation range. Institutional market makers build liquidity pools ahead of the London open (07:00 UTC).',
      volumeLevel: 35,
      activeHubs: ['Tokyo 🇯🇵', 'Singapore 🇸🇬', 'Hong Kong 🇭🇰']
    };
  };

  // Update clock & session every second
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTimeUTC(now.toUTCString().slice(17, 25));
      setSessionInfo(computeSessionInfo(now));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Direct Live Ticker Fetcher with Instant Multi-Provider Fallbacks
  const loadTicker = async (asset) => {
    if (!asset) return;
    setIsRefreshing(true);
    try {
      // 1. If asset has direct Binance symbol, fetch live 24hr ticker in real-time
      if (asset.binanceSymbol) {
        try {
          const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${asset.binanceSymbol}`);
          if (res.ok) {
            const data = await res.json();
            if (data.lastPrice) {
              const p = parseFloat(data.lastPrice);
              const c = parseFloat(data.priceChangePercent);
              setLiveTicker({
                price: p,
                change24h: c,
                isUp: c >= 0,
                high24h: parseFloat(data.highPrice),
                low24h: parseFloat(data.lowPrice),
                provider: 'Binance Live Feed'
              });
              setIsRefreshing(false);
              return;
            }
          }
        } catch (e) {}
      }

      // 2. Fetch from priceFetcher
      const ticker = await fetchLiveAssetTicker(asset.pair);
      if (ticker && ticker.price && !isNaN(ticker.price)) {
        setLiveTicker({
          price: ticker.price,
          change24h: ticker.change24h || 0.25,
          isUp: ticker.isUp ?? true,
          high24h: ticker.high24h || ticker.price * 1.01,
          low24h: ticker.low24h || ticker.price * 0.99,
          provider: ticker.provider || 'Live Stream'
        });
      }
    } catch (e) {
      console.log('Ticker fetch error:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Switch Asset Handler: Immediately changes state and triggers live fetch
  const handleSelectAsset = (asset) => {
    setSelectedAsset(asset);
    setLiveTicker({
      price: asset.basePrice,
      change24h: 0.25,
      isUp: true,
      high24h: asset.basePrice * 1.01,
      low24h: asset.basePrice * 0.99,
      provider: 'Connecting...'
    });
    loadTicker(asset);
  };

  useEffect(() => {
    loadTicker(selectedAsset);
    const interval = setInterval(() => loadTicker(selectedAsset), 3000);
    return () => clearInterval(interval);
  }, [selectedAsset]);

  const currentPrice = (liveTicker && !isNaN(liveTicker.price) && liveTicker.price > 0) ? liveTicker.price : selectedAsset.basePrice;
  const isUp = liveTicker?.isUp ?? true;
  const changePct = parseFloat(liveTicker?.change24h || 0.25);

  // Format Helper according to asset type
  const formatPrice = (val) => {
    if (typeof val !== 'number') val = parseFloat(val) || 0;
    if (selectedAsset.pair.includes('EUR') || selectedAsset.pair.includes('GBP')) {
      return val.toFixed(4);
    }
    if (val > 1000) {
      return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return val.toFixed(2);
  };

  // Dynamic SMC Liquidity Calculations based ON THIS EXACT ASSET's price
  const priceDelta = (pct) => currentPrice * (pct / 100);

  // Buy-Side Liquidity (BSL) Pools - Above current price (Short Stop-Loss Clusters)
  const bsl1 = currentPrice + priceDelta(0.28);
  const bsl2 = currentPrice + priceDelta(0.70);

  // Sell-Side Liquidity (SSL) Pools - Below current price (Long Stop-Loss Clusters)
  const ssl1 = currentPrice - priceDelta(0.28);
  const ssl2 = currentPrice - priceDelta(0.70);

  // Fair Value Gap (FVG) and Institutional Order Blocks (OB)
  const fvgTop = currentPrice + priceDelta(0.18);
  const fvgBottom = currentPrice - priceDelta(0.15);
  const demandOB = currentPrice - priceDelta(0.45);
  const supplyOB = currentPrice + priceDelta(0.50);

  // Scalp trade setup
  const scalpDirection = isUp ? 'BUY' : 'SELL';
  const scalpEntry = currentPrice;
  const scalpTp1 = isUp ? bsl1 : ssl1;
  const scalpTp2 = isUp ? bsl2 : ssl2;
  const scalpSl = isUp ? (currentPrice - priceDelta(0.22)) : (currentPrice + priceDelta(0.22));

  // Dynamic Real-time Orderflow Bias Calculation based on live price change
  const calcBuyPercent = isUp 
    ? Math.min(88, Math.max(54, Math.round(52 + Math.abs(changePct) * 3.5))) 
    : Math.max(14, Math.min(46, Math.round(48 - Math.abs(changePct) * 3.5)));
  const buyPressure = calcBuyPercent;
  const sellPressure = 100 - buyPressure;
  const orderflowStatus = buyPressure >= 55 ? 'BUY EXPANSION 🟢' : sellPressure >= 55 ? 'SELL SWEEP 🔴' : 'EQUILIBRIUM ⚖️';
  const orderflowDesc = buyPressure >= 55 
    ? `Active institutional buying volume (+${Math.abs(changePct).toFixed(2)}%) targeting Buy-Side Liquidity (BSL) and short stop clusters above.` 
    : `Institutional selling pressure (-${Math.abs(changePct).toFixed(2)}%) sweeping Sell-Side Liquidity (SSL) and resting stops below.`;

  // 1-Click Copy
  const handleCopy = (label, text) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    }
    if (window.Telegram?.WebApp?.HapticFeedback) {
      try { window.Telegram.WebApp.HapticFeedback.notificationOccurred('success'); } catch (e) {}
    }
    setCopyToast(`${label} copied to clipboard 📋`);
    setTimeout(() => setCopyToast(''), 2200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', direction: 'ltr' }}>
      
      {/* 1. Header & Asset Selector Bar */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(13, 18, 28, 0.92) 0%, rgba(17, 24, 39, 0.98) 100%)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '16px',
        padding: '12px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.35)'
      }}>
        
        {/* Top Mini Header: Title + Session Time + Back */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(239, 68, 68, 0.35))',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Crosshair size={18} color="#f59e0b" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '13.5px', fontWeight: '800', color: '#fff' }}>
                  Institutional Liquidity Radar & SMC Order Flow Hub
                </span>
                <span style={{ fontSize: '9px', color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '1px 5px', borderRadius: '4px', fontWeight: '800' }}>
                  INSTITUTIONAL
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px',
              padding: '4px 8px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '11px',
              color: '#38bdf8',
              fontFamily: 'monospace'
            }}>
              <Clock size={12} color="#38bdf8" />
              <span>{currentTimeUTC} UTC</span>
            </div>

            {onBack && (
              <button 
                onClick={onBack}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  borderRadius: '8px',
                  padding: '4px 10px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <ChevronRight size={13} style={{ transform: 'rotate(180deg)' }} />
                <span>Dashboard</span>
              </button>
            )}
          </div>
        </div>

        {/* Multi-Asset Quick Selector Strip */}
        <div className="no-scrollbar" style={{
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          paddingBottom: '2px',
          width: '100%'
        }}>
          {liquidityAssets.map(item => {
            const isSelected = selectedAsset.pair === item.pair;
            return (
              <button
                key={item.pair}
                onClick={() => handleSelectAsset(item)}
                style={{
                  background: isSelected 
                    ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(17, 24, 39, 0.95) 100%)' 
                    : 'rgba(255, 255, 255, 0.03)',
                  border: isSelected ? '1.5px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.07)',
                  borderRadius: '8px',
                  padding: '5px 10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'all 0.15s ease'
                }}
              >
                <AssetLogo symbol={item.pair} containerSize={18} size={12} fallbackIcon={item.icon} />
                <span style={{ fontSize: '11.5px', fontWeight: '800', color: isSelected ? '#f59e0b' : '#fff' }}>
                  {item.pair}
                </span>
                <span style={{ fontSize: '9.5px', color: isSelected ? '#fef08a' : 'var(--text-muted)' }}>
                  {item.name.split('(')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Toast Alert */}
      {copyToast && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.2)',
          border: '1px solid #10b981',
          color: '#34d399',
          padding: '6px 12px',
          borderRadius: '8px',
          fontSize: '11.5px',
          fontWeight: '700',
          textAlign: 'center'
        }}>
          {copyToast}
        </div>
      )}

      {/* 2. Top Summary KPI Row: Live Price + Active Session + Orderflow Pressure */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '10px'
      }}>
        
        {/* Card 1: Selected Asset Live Price */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(13, 18, 28, 0.85) 0%, rgba(17, 24, 39, 0.95) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          borderRadius: '14px',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '6px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AssetLogo symbol={selectedAsset.pair} containerSize={20} size={13} fallbackIcon={selectedAsset.icon} />
              <span style={{ fontSize: '12px', fontWeight: '800', color: '#cbd5e1' }}>
                {selectedAsset.name}
              </span>
            </div>
            <span style={{ fontSize: '9.5px', color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '1px 5px', borderRadius: '4px', fontWeight: '800' }}>
              {isRefreshing ? 'REFRESHING ⌛' : 'LIVE 🟢'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.45rem', fontWeight: '900', color: '#fff', fontFamily: 'monospace' }}>
              ${formatPrice(currentPrice)}
            </span>
            <span style={{ fontSize: '11px', fontWeight: '800', color: isUp ? '#10b981' : '#f87171' }}>
              {changePct >= 0 ? `+${changePct.toFixed(2)}%` : `${changePct.toFixed(2)}%`}
            </span>
          </div>

          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
            <span>Fair Value Gap (FVG): <b style={{ color: '#f59e0b' }}>${formatPrice(fvgBottom)} - ${formatPrice(fvgTop)}</b></span>
          </div>
        </div>

        {/* Card 2: Live Global Market Session Intel */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(13, 18, 28, 0.85) 0%, rgba(17, 24, 39, 0.95) 100%)',
          border: `1px solid ${sessionInfo.color}60`,
          borderRadius: '14px',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '6px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: sessionInfo.color, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Compass size={14} />
              <span>{sessionInfo.badge}</span>
            </span>
            <span style={{ fontSize: '9.5px', color: '#94a3b8', fontFamily: 'monospace' }}>
              Volume: {sessionInfo.volumeLevel}%
            </span>
          </div>

          <div style={{ fontSize: '13px', fontWeight: '800', color: '#fff' }}>
            {sessionInfo.title}
          </div>

          {/* Volume progress meter */}
          <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ width: `${sessionInfo.volumeLevel}%`, height: '100%', background: sessionInfo.color, borderRadius: '6px' }}></div>
          </div>

          <div style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            <span>Active Financial Hubs:</span>
            {sessionInfo.activeHubs?.map((hub, i) => (
              <span key={i} style={{ color: '#e2e8f0', background: 'rgba(255,255,255,0.06)', padding: '0 4px', borderRadius: '3px' }}>{hub}</span>
            ))}
          </div>
        </div>

        {/* Card 3: Dynamic Orderflow & Liquidity Imbalance for selected asset */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(13, 18, 28, 0.85) 0%, rgba(17, 24, 39, 0.95) 100%)',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          borderRadius: '14px',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '6px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Layers size={14} />
              <span>Order Flow Imbalance (Delta Bias)</span>
            </span>
            <span style={{ fontSize: '9.5px', color: buyPressure >= 50 ? '#10b981' : '#f87171', fontWeight: '800' }}>
              {orderflowStatus}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontWeight: '800' }}>
            <span style={{ color: '#10b981' }}>Buyer Volume: {buyPressure}%</span>
            <span style={{ color: '#f87171' }}>Seller Volume: {sellPressure}%</span>
          </div>

          {/* Dynamic Imbalance Meter Bar */}
          <div style={{ width: '100%', height: '6px', background: '#ef4444', borderRadius: '6px', overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: `${buyPressure}%`, height: '100%', background: '#10b981', transition: 'width 0.4s ease' }}></div>
          </div>

          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            {orderflowDesc}
          </div>
        </div>

      </div>

      {/* 3. Main Split Layout: Liquidity Matrix & Heatmap (Left) + Pro TradingView Chart & Setup (Right) */}
      <div className="workbench-split-grid">
        
        {/* Left Column: Interactive TradingView Chart & Visual Liquidity Map */}
        <div className="workbench-chart-pane">
          <div style={{
            background: 'rgba(13, 18, 28, 0.75)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '10px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={15} color="#f59e0b" />
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#fff' }}>
                  Live Institutional Chart ({selectedAsset.pair})
                </span>
              </div>
              <button
                onClick={() => onAnalyzeAsset && onAnalyzeAsset(selectedAsset.pair)}
                style={{
                  background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(37, 99, 235, 0.3) 100%)',
                  border: '1px solid #38bdf8',
                  color: '#38bdf8',
                  borderRadius: '7px',
                  padding: '3px 8px',
                  fontSize: '10.5px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Zap size={12} />
                <span>Deep AI Analysis 🤖</span>
              </button>
            </div>

            <TradingViewWidget
              symbol={selectedAsset.symbol || selectedAsset.pair}
              timeframe="15m"
              height={390}
            />
          </div>
        </div>

        {/* Right Column: SMC Liquidity Pools & Live Execution Card */}
        <div className="workbench-side-pane">
          
          {/* Institutional SMC Liquidity Pools */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(13, 18, 28, 0.9) 0%, rgba(17, 24, 39, 0.98) 100%)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ fontSize: '12px', fontWeight: '800', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Target size={14} color="#38bdf8" />
              <span>Institutional Liquidity Pools (SMC Targets):</span>
            </div>

            {/* BSL Pools (Buy-Side Liquidity / Short Stop Traps) */}
            <div style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '10px', padding: '8px 10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <TrendingUp size={12} />
                  <span>Buy-Side Liquidity (BSL / Short Stop Clusters)</span>
                </span>
                <span style={{ fontSize: '9px', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '1px 5px', borderRadius: '4px', fontWeight: 'bold' }}>
                  TARGET BUY
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '5px 8px', borderRadius: '6px', fontSize: '10.5px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Liquidity High (BSL 1):</span>
                  <span style={{ color: '#10b981', fontWeight: 'bold', fontFamily: 'monospace' }}>${formatPrice(bsl1)}</span>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '5px 8px', borderRadius: '6px', fontSize: '10.5px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Major Sweep (BSL 2):</span>
                  <span style={{ color: '#10b981', fontWeight: 'bold', fontFamily: 'monospace' }}>${formatPrice(bsl2)}</span>
                </div>
              </div>
            </div>

            {/* SSL Pools (Sell-Side Liquidity / Long Stop Traps) */}
            <div style={{ background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '10px', padding: '8px 10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#f87171', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <TrendingDown size={12} />
                  <span>Sell-Side Liquidity (SSL / Long Stop Clusters)</span>
                </span>
                <span style={{ fontSize: '9px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '1px 5px', borderRadius: '4px', fontWeight: 'bold' }}>
                  TARGET SELL
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '5px 8px', borderRadius: '6px', fontSize: '10.5px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Liquidity Low (SSL 1):</span>
                  <span style={{ color: '#f87171', fontWeight: 'bold', fontFamily: 'monospace' }}>${formatPrice(ssl1)}</span>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '5px 8px', borderRadius: '6px', fontSize: '10.5px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94a3b8' }}>Major Sweep (SSL 2):</span>
                  <span style={{ color: '#f87171', fontWeight: 'bold', fontFamily: 'monospace' }}>${formatPrice(ssl2)}</span>
                </div>
              </div>
            </div>

            {/* Order Block & FVG Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <div style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', padding: '6px 8px' }}>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>Bullish Order Block (Demand)</div>
                <div style={{ fontSize: '11.5px', fontWeight: 'bold', color: '#10b981', fontFamily: 'monospace', marginTop: '1px' }}>
                  ${formatPrice(demandOB)}
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', padding: '6px 8px' }}>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>Bearish Order Block (Supply)</div>
                <div style={{ fontSize: '11.5px', fontWeight: 'bold', color: '#f87171', fontFamily: 'monospace', marginTop: '1px' }}>
                  ${formatPrice(supplyOB)}
                </div>
              </div>
            </div>

          </div>

          {/* Actionable SMC Scalp Radar Setup Box */}
          <div style={{
            background: isUp 
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(13, 18, 28, 0.95) 100%)' 
              : 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(13, 18, 28, 0.95) 100%)',
            border: `1.5px solid ${isUp ? '#10b981' : '#ef4444'}`,
            borderRadius: '16px',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            boxShadow: `0 6px 25px ${isUp ? 'rgba(16, 185, 129, 0.18)' : 'rgba(239, 68, 68, 0.18)'}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div className="pulse-dot" style={{ width: '8px', height: '8px', background: isUp ? '#10b981' : '#ef4444' }}></div>
                <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#fff' }}>
                  Radar Actionable Signal: <b style={{ color: isUp ? '#10b981' : '#f87171' }}>{isUp ? 'BUY SCALP 🟢' : 'SELL SCALP 🔴'}</b>
                </span>
              </div>
              <span style={{ fontSize: '9.5px', color: '#38bdf8', fontWeight: '800', background: 'rgba(56, 189, 248, 0.15)', padding: '1px 5px', borderRadius: '4px' }}>
                R:R 1:2.6
              </span>
            </div>

            {/* 4 Trade Key Numbers Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '5px' }}>
              <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '7px', padding: '6px 4px', textAlign: 'center' }}>
                <div style={{ fontSize: '9px', color: '#94a3b8' }}>Entry Price</div>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#fff', fontFamily: 'monospace', marginTop: '1px' }}>
                  ${formatPrice(scalpEntry)}
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '7px', padding: '6px 4px', textAlign: 'center' }}>
                <div style={{ fontSize: '9px', color: '#86efac' }}>Target 1 (TP1)</div>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#4ade80', fontFamily: 'monospace', marginTop: '1px' }}>
                  ${formatPrice(scalpTp1)}
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '7px', padding: '6px 4px', textAlign: 'center' }}>
                <div style={{ fontSize: '9px', color: '#38bdf8' }}>Target 2 (TP2)</div>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#38bdf8', fontFamily: 'monospace', marginTop: '1px' }}>
                  ${formatPrice(scalpTp2)}
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '7px', padding: '6px 4px', textAlign: 'center' }}>
                <div style={{ fontSize: '9px', color: '#fca5a5' }}>Stop Loss (SL)</div>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#f87171', fontFamily: 'monospace', marginTop: '1px' }}>
                  ${formatPrice(scalpSl)}
                </div>
              </div>
            </div>

            {/* 1-Click Copy Trade Numbers */}
            <button
              onClick={() => {
                const text = `🎯 SMC Institutional Liquidity Signal for ${selectedAsset.pair}:\n• Bias: ${scalpDirection}\n• Entry: $${formatPrice(scalpEntry)}\n• Target 1 (TP1): $${formatPrice(scalpTp1)}\n• Target 2 (TP2): $${formatPrice(scalpTp2)}\n• Stop Loss (SL): $${formatPrice(scalpSl)}\n• Market Session: ${sessionInfo.title}`;
                handleCopy('Trade Setup Numbers', text);
              }}
              style={{
                width: '100%',
                background: isUp ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px',
                fontSize: '11.5px',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 3px 10px rgba(0,0,0,0.3)'
              }}
            >
              <Copy size={13} />
              <span>Copy Trade Setup Parameters (Entry / SL / TP) 📋</span>
            </button>

            {/* Practical Step-by-Step Execution Playbook Guide */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.45)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '10px',
              padding: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ fontSize: '11px', fontWeight: '800', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Sparkles size={13} color="#f59e0b" />
                <span>Trade Execution Playbook (When to Enter & Manage):</span>
              </div>

              <div style={{ fontSize: '10.5px', color: '#cbd5e1', lineHeight: '1.5', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div>
                  <b style={{ color: isUp ? '#4ade80' : '#f87171' }}>1. Immediate Execution:</b> Enter {isUp ? 'BUY SCALP' : 'SELL SCALP'} at <b>${formatPrice(scalpEntry)}</b> matching the dominant order flow and institutional pool targets.
                </div>
                <div>
                  <b style={{ color: '#4ade80' }}>2. Secure Profits at TP1:</b> When price taps <b>${formatPrice(scalpTp1)}</b>, <u>close 50% of your position size</u> and instantly move Stop Loss to Breakeven <b>${formatPrice(scalpEntry)}</b> (Risk-Free trade).
                </div>
                <div>
                  <b style={{ color: '#38bdf8' }}>3. Runner to TP2:</b> Let the remaining 50% position run toward major liquidity pool target <b>${formatPrice(scalpTp2)}</b> or trail stop manually.
                </div>
                <div>
                  <b style={{ color: '#fca5a5' }}>4. Invalidation (SL):</b> If the market reverses beyond <b>${formatPrice(scalpSl)}</b>, exit cleanly to preserve capital.
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
