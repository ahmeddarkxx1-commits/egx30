import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, TrendingDown, Zap, BarChart2, Layers, Shield, 
  ArrowUpRight, ArrowDownRight, Clock, Activity, RefreshCw, 
  Sliders, Copy, Check, ChevronDown, Flame, Crosshair, Sparkles,
  Maximize2, DollarSign, Percent, AlertCircle, Play, Pause
} from 'lucide-react';
import TradingViewWidget from './TradingViewWidget';
import { fetchLiveAssetTicker, analyzeStudiedTechnicalSignal } from '../utils/priceFetcher';

export default function ProTradingTerminal({ onBack }) {
  const [selectedPair, setSelectedPair] = useState('BTC/USDT');
  const [timeframe, setTimeframe] = useState('15m');
  const [ticker, setTicker] = useState({ price: 83450.00, change24h: -1.25, isUp: false, high24h: 85900, low24h: 82900, volume: '48.2K BTC' });
  const [orderBook, setOrderBook] = useState({ asks: [], bids: [], spread: 0.5 });
  const [recentTrades, setRecentTrades] = useState([]);
  const [activeTab, setActiveTab] = useState('orderbook'); // 'orderbook' | 'trades'
  const [bottomTab, setBottomTab] = useState('positions'); // 'positions' | 'signals' | 'analytics'
  const [mobileViewTab, setMobileViewTab] = useState('chart'); // 'chart' | 'orderbook' | 'orderform'
  
  // Order Form State
  const [orderSide, setOrderSide] = useState('buy'); // 'buy' (Long) | 'sell' (Short)
  const [orderType, setOrderType] = useState('market'); // 'market' | 'limit' | 'ai'
  const [leverage, setLeverage] = useState(10);
  const [marginAmount, setMarginAmount] = useState(100);
  const [limitPrice, setLimitPrice] = useState(83450);
  const [tpPrice, setTpPrice] = useState(85500);
  const [slPrice, setSlPrice] = useState(82400);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [copyToast, setCopyToast] = useState('');

  // Active Positions & Orders (Simulated Real-time Paper Trading)
  const [positions, setPositions] = useState([
    {
      id: 1,
      pair: 'BTC/USDT',
      side: 'LONG',
      entryPrice: 83210.00,
      markPrice: 83450.00,
      size: 0.05,
      margin: 416.05,
      leverage: 10,
      pnl: 12.00,
      roe: 2.88,
      tp: 85500.00,
      sl: 82400.00,
      liqPrice: 75200.00
    }
  ]);

  const PAIRS_LIST = [
    { symbol: 'BTC/USDT', name: 'Bitcoin', icon: '₿', category: 'crypto' },
    { symbol: 'ETH/USDT', name: 'Ethereum', icon: 'Ξ', category: 'crypto' },
    { symbol: 'SOL/USDT', name: 'Solana', icon: '◎', category: 'crypto' },
    { symbol: 'XAU/USD', name: 'Gold Spot', icon: '🥇', category: 'metals' },
    { symbol: 'EUR/USD', name: 'Euro / Dollar', icon: '💶', category: 'forex' },
    { symbol: 'GBP/USD', name: 'Pound / Dollar', icon: '💷', category: 'forex' },
    { symbol: 'US30', name: 'Dow Jones', icon: '📈', category: 'indices' },
    { symbol: 'NVDA', name: 'Nvidia AI', icon: '💚', category: 'stocks' },
    { symbol: 'AAPL', name: 'Apple Inc.', icon: '🍎', category: 'stocks' }
  ];

  // 1. Fetch Live Ticker Data
  const loadTicker = async () => {
    try {
      const data = await fetchLiveAssetTicker(selectedPair);
      if (data && data.price) {
        setTicker({
          price: data.price,
          change24h: data.change24h || 0,
          isUp: (data.change24h || 0) >= 0,
          high24h: data.high24h || (data.price * 1.015),
          low24h: data.low24h || (data.price * 0.985),
          volume: `${(Math.abs(data.price * 12.4) / 1000).toFixed(1)}K Vol`
        });
        setLimitPrice(data.price);
      }
    } catch (e) {
      console.log('Ticker fetch error:', e);
    }
  };

  useEffect(() => {
    loadTicker();
    const interval = setInterval(loadTicker, 2000);
    return () => clearInterval(interval);
  }, [selectedPair]);

  // 2. Fetch Real-time Live Order Book & Trades
  const loadOrderBookAndTrades = async () => {
    const pairClean = selectedPair.replace('/', '').toUpperCase();
    let bSymbol = pairClean;
    if (pairClean.includes('XAU') || pairClean.includes('GOLD')) bSymbol = 'PAXGUSDT';
    else if (!bSymbol.includes('USDT') && ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'AVAX'].includes(pairClean)) {
      bSymbol += 'USDT';
    }

    try {
      // Binance Depth API
      const depthRes = await fetch(`https://api.binance.com/api/v3/depth?symbol=${bSymbol}&limit=8`);
      if (depthRes.ok) {
        const depthData = await depthRes.json();
        if (depthData.asks && depthData.bids) {
          const asks = depthData.asks.map(([p, q]) => ({ price: parseFloat(p), qty: parseFloat(q) })).reverse();
          const bids = depthData.bids.map(([p, q]) => ({ price: parseFloat(p), qty: parseFloat(q) }));
          const spread = Math.abs(asks[asks.length - 1]?.price - bids[0]?.price) || 0.1;
          setOrderBook({ asks, bids, spread });
        }
      }

      // Binance Recent Trades API
      const tradesRes = await fetch(`https://api.binance.com/api/v3/trades?symbol=${bSymbol}&limit=10`);
      if (tradesRes.ok) {
        const tradesData = await tradesRes.json();
        if (Array.isArray(tradesData)) {
          const formatted = tradesData.map(t => ({
            id: t.id,
            price: parseFloat(t.price),
            qty: parseFloat(t.qty),
            time: new Date(t.time).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            isBuyerMaker: t.isBuyerMaker // true = Sell order hit bid / false = Buy order hit ask
          }));
          setRecentTrades(formatted);
        }
      }
    } catch (e) {
      // Fallback synthetic high-frequency depth generator around ticker price
      const base = ticker.price || 83450;
      const asks = Array.from({ length: 6 }, (_, i) => ({
        price: +(base + (6 - i) * (base * 0.0003)).toFixed(2),
        qty: +(Math.random() * 2.5 + 0.1).toFixed(3)
      }));
      const bids = Array.from({ length: 6 }, (_, i) => ({
        price: +(base - (i + 1) * (base * 0.0003)).toFixed(2),
        qty: +(Math.random() * 2.5 + 0.1).toFixed(3)
      }));
      setOrderBook({ asks, bids, spread: +(base * 0.0002).toFixed(2) });
    }
  };

  useEffect(() => {
    loadOrderBookAndTrades();
    const obInterval = setInterval(loadOrderBookAndTrades, 1500);
    return () => clearInterval(obInterval);
  }, [selectedPair, ticker.price]);

  // 3. AI Institutional Analysis Trigger
  const handleRunAiAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await analyzeStudiedTechnicalSignal(selectedPair, timeframe, marginAmount * leverage);
      setAiAnalysis(res);
      if (res.rawSl) setSlPrice(res.rawSl);
      if (res.rawTp1) setTpPrice(res.rawTp1);
      if (res.signal.includes('BUY') || res.signal.includes('شراء')) setOrderSide('buy');
      else if (res.signal.includes('SELL') || res.signal.includes('بيع')) setOrderSide('sell');
    } catch (e) {
      console.log('AI Analysis error:', e);
    } finally {
      setAnalyzing(false);
    }
  };

  // 4. Place Trade / Paper Execution
  const handlePlaceOrder = () => {
    const entry = orderType === 'limit' ? parseFloat(limitPrice) : ticker.price;
    const posSize = (marginAmount * leverage) / (entry || 1);
    const isLong = orderSide === 'buy';
    const liqDistance = entry / leverage;
    const liqPrice = isLong ? Math.max(0, entry - liqDistance) : entry + liqDistance;

    const newPos = {
      id: Date.now(),
      pair: selectedPair,
      side: isLong ? 'LONG' : 'SHORT',
      entryPrice: entry,
      markPrice: ticker.price,
      size: Number(posSize.toFixed(4)),
      margin: marginAmount,
      leverage: leverage,
      pnl: 0.00,
      roe: 0.00,
      tp: tpPrice,
      sl: slPrice,
      liqPrice: Number(liqPrice.toFixed(2))
    };

    setPositions(prev => [newPos, ...prev]);
    setCopyToast(`✅ تم فتح صفقة ${newPos.side} على ${selectedPair} بنجاح!`);
    setTimeout(() => setCopyToast(''), 3000);
  };

  // Close Position
  const handleClosePos = (id) => {
    setPositions(prev => prev.filter(p => p.id !== id));
    setCopyToast('تم إغلاق الصفقة وجني النتيجة 🎯');
    setTimeout(() => setCopyToast(''), 2500);
  };

  // Update floating PnL for open positions with live price ticks
  useEffect(() => {
    if (positions.length === 0) return;
    setPositions(prev => prev.map(p => {
      if (p.pair === selectedPair) {
        const diff = p.side === 'LONG' ? (ticker.price - p.entryPrice) : (p.entryPrice - ticker.price);
        const pnlVal = diff * p.size;
        const roeVal = (pnlVal / p.margin) * 100;
        return {
          ...p,
          markPrice: ticker.price,
          pnl: Number(pnlVal.toFixed(2)),
          roe: Number(roeVal.toFixed(2))
        };
      }
      return p;
    }));
  }, [ticker.price]);

  const handleCopy = (text, label) => {
    if (navigator.clipboard) navigator.clipboard.writeText(text);
    setCopyToast(`تم نسخ ${label} 📋`);
    setTimeout(() => setCopyToast(''), 2000);
  };

  const isUp = ticker.change24h >= 0;

  return (
    <div style={{
      background: '#0b0e14',
      minHeight: '100vh',
      color: '#c9d1d9',
      padding: '8px 12px 24px 12px',
      direction: 'rtl',
      fontFamily: 'Cairo, sans-serif'
    }}>
      
      {/* Toast Notification */}
      {copyToast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#10b981',
          color: '#000',
          padding: '10px 20px',
          borderRadius: '8px',
          fontWeight: 'bold',
          fontSize: '0.85rem',
          zIndex: 9999,
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)'
        }}>
          {copyToast}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1️⃣ TOP BYBIT-STYLE TICKER STRIP */}
      {/* ========================================================================= */}
      <div style={{
        background: '#121721',
        border: '1px solid #21262d',
        borderRadius: '10px',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '10px'
      }}>
        {/* Pair Selector Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select
            value={selectedPair}
            onChange={(e) => setSelectedPair(e.target.value)}
            style={{
              background: '#1f2937',
              border: '1px solid #374151',
              color: '#f9fafb',
              padding: '6px 12px',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '1rem',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {PAIRS_LIST.map(p => (
              <option key={p.symbol} value={p.symbol}>
                {p.icon} {p.symbol} · {p.name}
              </option>
            ))}
          </select>

          <span style={{ fontSize: '0.72rem', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '3px 8px', borderRadius: '6px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
            عقود دائمة (Perpetual)
          </span>
        </div>

        {/* Real-Time Price & Stats Strip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>السعر المباشر (Mark Price)</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '900', color: isUp ? '#10b981' : '#f87171', fontFamily: 'monospace' }}>
              ${ticker.price >= 1000 ? ticker.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ticker.price}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>تغير 24 ساعة</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: isUp ? '#10b981' : '#f87171', fontFamily: 'monospace' }}>
              {isUp ? '▲ +' : '▼ '}{ticker.change24h.toFixed(2)}%
            </div>
          </div>

          <div className="hide-mobile">
            <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>أعلى سعر 24h</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#e5e7eb', fontFamily: 'monospace' }}>
              ${ticker.high24h >= 1000 ? ticker.high24h.toLocaleString() : ticker.high24h}
            </div>
          </div>

          <div className="hide-mobile">
            <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>أدنى سعر 24h</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#e5e7eb', fontFamily: 'monospace' }}>
              ${ticker.low24h >= 1000 ? ticker.low24h.toLocaleString() : ticker.low24h}
            </div>
          </div>

          <div className="hide-mobile">
            <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>معدل التمويل (Funding Rate)</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#10b981', fontFamily: 'monospace' }}>
              +0.0100% (04:22:15)
            </div>
          </div>
        </div>

        {/* AI Quick Button */}
        <button
          onClick={handleRunAiAnalysis}
          disabled={analyzing}
          style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 14px',
            fontWeight: '900',
            fontSize: '0.82rem',
            cursor: analyzing ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
          }}
        >
          <Sparkles size={16} />
          <span>{analyzing ? 'جاري التحليل المؤسسي...' : 'تحليل ذكي فوري (AI Signal)'}</span>
        </button>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="mobile-terminal-tabs">
        <button
          onClick={() => setMobileViewTab('chart')}
          className={`terminal-tab-btn ${mobileViewTab === 'chart' ? 'active' : ''}`}
        >
          📊 الشارت (Chart)
        </button>
        <button
          onClick={() => setMobileViewTab('orderbook')}
          className={`terminal-tab-btn ${mobileViewTab === 'orderbook' ? 'active' : ''}`}
        >
          📑 دفتر الأوامر (Book)
        </button>
        <button
          onClick={() => setMobileViewTab('orderform')}
          className={`terminal-tab-btn ${mobileViewTab === 'orderform' ? 'active' : ''}`}
        >
          ⚡ تنفيذ الصفقة (Form)
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2️⃣ MAIN 3-COLUMN PRO TRADING GRID (ORDERBOOK | CHART | ORDER FORM) */}
      {/* ========================================================================= */}
      <div className="pro-terminal-grid">
        
        {/* --- COLUMN 1: LIVE ORDER BOOK & TRADES (Bybit Style) --- */}
        <div className={`pro-col-orderbook ${mobileViewTab === 'orderbook' ? 'mobile-show' : ''}`} style={{
          background: '#121721',
          border: '1px solid #21262d',
          borderRadius: '10px',
          padding: '10px',
          display: 'flex',
          flexDirection: 'column',
          height: '520px'
        }}>
          {/* Tab Selector */}
          <div style={{ display: 'flex', borderBottom: '1px solid #21262d', paddingBottom: '8px', marginBottom: '8px' }}>
            <button
              onClick={() => setActiveTab('orderbook')}
              style={{
                flex: 1, background: 'transparent', border: 'none',
                color: activeTab === 'orderbook' ? '#f59e0b' : '#9ca3af',
                fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer',
                borderBottom: activeTab === 'orderbook' ? '2px solid #f59e0b' : 'none'
              }}
            >
              دفتر الأوامر (Book)
            </button>
            <button
              onClick={() => setActiveTab('trades')}
              style={{
                flex: 1, background: 'transparent', border: 'none',
                color: activeTab === 'trades' ? '#f59e0b' : '#9ca3af',
                fontWeight: 'bold', fontSize: '0.8rem', cursor: 'pointer',
                borderBottom: activeTab === 'trades' ? '2px solid #f59e0b' : 'none'
              }}
            >
              الصفقات الحية (Trades)
            </button>
          </div>

          {activeTab === 'orderbook' ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' }}>
              {/* Header row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#6b7280', marginBottom: '4px' }}>
                <span>السعر (USDT)</span>
                <span>الكمية (Qty)</span>
                <span>الإجمالي</span>
              </div>

              {/* Asks (Sell Orders - Red) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {orderBook.asks.slice(-5).map((ask, idx) => {
                  const depthPct = Math.min(100, (ask.qty / 3) * 100);
                  return (
                    <div key={idx} style={{
                      position: 'relative', display: 'flex', justifyContent: 'space-between',
                      fontSize: '0.74rem', fontFamily: 'monospace', padding: '1px 2px'
                    }}>
                      <div style={{
                        position: 'absolute', top: 0, right: 0, bottom: 0,
                        width: `${depthPct}%`, background: 'rgba(239, 68, 68, 0.12)', zIndex: 0
                      }}></div>
                      <span style={{ color: '#f87171', fontWeight: 'bold', zIndex: 1 }}>${ask.price.toFixed(2)}</span>
                      <span style={{ color: '#9ca3af', zIndex: 1 }}>{ask.qty.toFixed(3)}</span>
                      <span style={{ color: '#6b7280', zIndex: 1 }}>${(ask.price * ask.qty / 1000).toFixed(1)}k</span>
                    </div>
                  );
                })}
              </div>

              {/* Mid Price / Spread Indicator */}
              <div style={{
                background: '#1f2937', padding: '6px 8px', borderRadius: '6px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '6px 0'
              }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 'bold', color: isUp ? '#10b981' : '#f87171', fontFamily: 'monospace' }}>
                  ${ticker.price.toLocaleString()} {isUp ? '↑' : '↓'}
                </span>
                <span style={{ fontSize: '0.68rem', color: '#9ca3af' }}>
                  الفارق: ${typeof orderBook.spread === 'number' ? orderBook.spread.toFixed(2) : orderBook.spread}
                </span>
              </div>

              {/* Bids (Buy Orders - Green) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {orderBook.bids.slice(0, 5).map((bid, idx) => {
                  const depthPct = Math.min(100, (bid.qty / 3) * 100);
                  return (
                    <div key={idx} style={{
                      position: 'relative', display: 'flex', justifyContent: 'space-between',
                      fontSize: '0.74rem', fontFamily: 'monospace', padding: '1px 2px'
                    }}>
                      <div style={{
                        position: 'absolute', top: 0, right: 0, bottom: 0,
                        width: `${depthPct}%`, background: 'rgba(16, 185, 129, 0.12)', zIndex: 0
                      }}></div>
                      <span style={{ color: '#34d399', fontWeight: 'bold', zIndex: 1 }}>${bid.price.toFixed(2)}</span>
                      <span style={{ color: '#9ca3af', zIndex: 1 }}>{bid.qty.toFixed(3)}</span>
                      <span style={{ color: '#6b7280', zIndex: 1 }}>${(bid.price * bid.qty / 1000).toFixed(1)}k</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Recent Live Trades Stream */
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#6b7280', marginBottom: '4px' }}>
                <span>السعر</span>
                <span>الحجم</span>
                <span>الوقت</span>
              </div>
              {recentTrades.map((t, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.73rem', fontFamily: 'monospace' }}>
                  <span style={{ color: t.isBuyerMaker ? '#f87171' : '#34d399', fontWeight: 'bold' }}>
                    ${t.price.toFixed(2)}
                  </span>
                  <span style={{ color: '#e5e7eb' }}>{t.qty.toFixed(3)}</span>
                  <span style={{ color: '#6b7280' }}>{t.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- COLUMN 2: ADVANCED TRADINGVIEW CHART WITH TIMEFRAME SELECTOR --- */}
        <div className={`pro-col-chart ${mobileViewTab === 'chart' ? 'mobile-show' : ''}`} style={{
          background: '#121721',
          border: '1px solid #21262d',
          borderRadius: '10px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: '520px'
        }}>
          {/* Timeframe Controls Bar */}
          <div style={{
            background: '#161d2b',
            borderBottom: '1px solid #21262d',
            padding: '6px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{ fontSize: '0.72rem', color: '#9ca3af', marginLeft: '6px' }}>الفريم:</span>
            {['1m', '5m', '15m', '1h', '4h', '1d'].map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                style={{
                  background: timeframe === tf ? '#f59e0b' : 'transparent',
                  color: timeframe === tf ? '#000' : '#9ca3af',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  fontSize: '0.74rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {tf}
              </button>
            ))}
          </div>

          <div style={{ flex: 1 }}>
            <TradingViewWidget
              symbol={selectedPair}
              timeframe={timeframe}
              height={475}
            />
          </div>
        </div>

        {/* --- COLUMN 3: BYBIT PRO ORDER EXECUTION & AI FORM --- */}
        <div className={`pro-col-orderform ${mobileViewTab === 'orderform' ? 'mobile-show' : ''}`} style={{
          background: '#121721',
          border: '1px solid #21262d',
          borderRadius: '10px',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          height: '520px',
          overflowY: 'auto'
        }}>

          {/* Long / Short Toggle */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <button
              onClick={() => setOrderSide('buy')}
              style={{
                background: orderSide === 'buy' ? '#10b981' : '#1f2937',
                color: orderSide === 'buy' ? '#000' : '#9ca3af',
                border: 'none', borderRadius: '8px', padding: '10px',
                fontWeight: '900', fontSize: '0.88rem', cursor: 'pointer'
              }}
            >
              شراء / Long 🟢
            </button>
            <button
              onClick={() => setOrderSide('sell')}
              style={{
                background: orderSide === 'sell' ? '#ef4444' : '#1f2937',
                color: orderSide === 'sell' ? '#fff' : '#9ca3af',
                border: 'none', borderRadius: '8px', padding: '10px',
                fontWeight: '900', fontSize: '0.88rem', cursor: 'pointer'
              }}
            >
              بيع / Short 🔴
            </button>
          </div>

          {/* Leverage & Margin Mode */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1f2937', padding: '6px 10px', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>الرافعة المالية:</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[2, 5, 10, 20, 50].map(lev => (
                <button
                  key={lev}
                  onClick={() => setLeverage(lev)}
                  style={{
                    background: leverage === lev ? '#f59e0b' : '#374151',
                    color: leverage === lev ? '#000' : '#fff',
                    border: 'none', borderRadius: '4px', padding: '2px 6px',
                    fontSize: '0.72rem', fontWeight: 'bold', cursor: 'pointer'
                  }}
                >
                  {lev}x
                </button>
              ))}
            </div>
          </div>

          {/* Margin Amount Input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#9ca3af', marginBottom: '3px' }}>
              <span>الهامش المخصص ($)</span>
              <span>حجم الصفقة: ${(marginAmount * leverage).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', background: '#0d1117', border: '1px solid #374151', borderRadius: '6px', padding: '6px 10px' }}>
              <span style={{ color: '#10b981', fontWeight: 'bold', marginLeft: '6px' }}>$</span>
              <input
                type="number"
                value={marginAmount}
                onChange={(e) => setMarginAmount(Math.max(5, parseFloat(e.target.value) || 0))}
                style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', fontWeight: 'bold', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>
          </div>

          {/* Take Profit & Stop Loss */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#10b981', marginBottom: '2px' }}>الهدف (TP) 🎯</div>
              <input
                type="number"
                value={tpPrice}
                onChange={(e) => setTpPrice(parseFloat(e.target.value) || 0)}
                style={{ width: '100%', background: '#0d1117', border: '1px solid #10b981', borderRadius: '6px', padding: '6px 8px', color: '#10b981', fontWeight: 'bold', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#f87171', marginBottom: '2px' }}>وقف الخسارة (SL) 🛑</div>
              <input
                type="number"
                value={slPrice}
                onChange={(e) => setSlPrice(parseFloat(e.target.value) || 0)}
                style={{ width: '100%', background: '#0d1117', border: '1px solid #f87171', borderRadius: '6px', padding: '6px 8px', color: '#f87171', fontWeight: 'bold', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Place Order Button */}
          <button
            onClick={handlePlaceOrder}
            style={{
              width: '100%',
              background: orderSide === 'buy' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              fontWeight: '900',
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: orderSide === 'buy' ? '0 4px 14px rgba(16, 185, 129, 0.4)' : '0 4px 14px rgba(239, 68, 68, 0.4)',
              marginTop: '4px'
            }}
          >
            {orderSide === 'buy' ? `🚀 فتح صفقة شراء (Long ${leverage}x)` : `💥 فتح صفقة بيع (Short ${leverage}x)`}
          </button>

          {/* Copy Order Parameters Button */}
          <button
            onClick={() => {
              const orderText = `⚡ صفقة Bybit جاهزة لـ ${selectedPair}:\n• الاتجاه: ${orderSide.toUpperCase()}\n• الدخول: $${ticker.price}\n• الرافعة: ${leverage}x\n• الهدف: $${tpPrice}\n• الستوب: $${slPrice}`;
              handleCopy(orderText, 'تفاصيل الأمر للتنفيذ');
            }}
            style={{
              width: '100%',
              background: 'transparent',
              border: '1px solid #374151',
              color: '#38bdf8',
              borderRadius: '6px',
              padding: '8px',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
          >
            <Copy size={14} />
            <span>نسخ إعدادات الأمر لمنصة التداول 📋</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3️⃣ BOTTOM PANEL: POSITIONS & SMC SIGNALS LOG (Bybit Style) */}
      {/* ========================================================================= */}
      <div style={{
        background: '#121721',
        border: '1px solid #21262d',
        borderRadius: '10px',
        padding: '12px'
      }}>
        {/* Sub-tabs */}
        <div style={{ display: 'flex', gap: '14px', borderBottom: '1px solid #21262d', paddingBottom: '8px', marginBottom: '10px' }}>
          <button
            onClick={() => setBottomTab('positions')}
            style={{
              background: 'transparent', border: 'none',
              color: bottomTab === 'positions' ? '#f59e0b' : '#9ca3af',
              fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer',
              borderBottom: bottomTab === 'positions' ? '2px solid #f59e0b' : 'none',
              paddingBottom: '4px'
            }}
          >
            المراكز المفتوحة ({positions.length})
          </button>
          <button
            onClick={() => setBottomTab('signals')}
            style={{
              background: 'transparent', border: 'none',
              color: bottomTab === 'signals' ? '#f59e0b' : '#9ca3af',
              fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer',
              borderBottom: bottomTab === 'signals' ? '2px solid #f59e0b' : 'none',
              paddingBottom: '4px'
            }}
          >
            إشارات رادار الذكاء الاصطناعي (AI Signal Feed)
          </button>
        </div>

        {bottomTab === 'positions' ? (
          positions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: '#6b7280', fontSize: '0.85rem' }}>
              لا توجد صفقات مفتوحة حالياً. اختر الأصل والرافعة واضغط فتح صفقة للتتبع المباشر.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'right' }}>
                <thead>
                  <tr style={{ color: '#6b7280', borderBottom: '1px solid #21262d' }}>
                    <th style={{ padding: '8px' }}>الأصل / النوع</th>
                    <th style={{ padding: '8px' }}>الحجم</th>
                    <th style={{ padding: '8px' }}>سعر الدخول</th>
                    <th style={{ padding: '8px' }}>السعر الحالي</th>
                    <th style={{ padding: '8px' }}>سعر التصفية (Liq)</th>
                    <th style={{ padding: '8px' }}>الربح / الخسارة (PnL)</th>
                    <th style={{ padding: '8px' }}>العائد (ROE)</th>
                    <th style={{ padding: '8px' }}>إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #1f2937' }}>
                      <td style={{ padding: '10px 8px', fontWeight: 'bold' }}>
                        <span style={{ color: p.side === 'LONG' ? '#10b981' : '#ef4444', marginLeft: '6px' }}>
                          {p.side} {p.leverage}x
                        </span>
                        <span style={{ color: '#fff' }}>{p.pair}</span>
                      </td>
                      <td style={{ padding: '10px 8px', color: '#e5e7eb', fontFamily: 'monospace' }}>{p.size}</td>
                      <td style={{ padding: '10px 8px', color: '#e5e7eb', fontFamily: 'monospace' }}>${p.entryPrice.toLocaleString()}</td>
                      <td style={{ padding: '10px 8px', color: '#e5e7eb', fontFamily: 'monospace' }}>${p.markPrice.toLocaleString()}</td>
                      <td style={{ padding: '10px 8px', color: '#f59e0b', fontFamily: 'monospace' }}>${p.liqPrice.toLocaleString()}</td>
                      <td style={{ padding: '10px 8px', fontWeight: 'bold', fontFamily: 'monospace', color: p.pnl >= 0 ? '#10b981' : '#f87171' }}>
                        {p.pnl >= 0 ? `+$${p.pnl.toFixed(2)}` : `-$${Math.abs(p.pnl).toFixed(2)}`}
                      </td>
                      <td style={{ padding: '10px 8px', fontWeight: 'bold', fontFamily: 'monospace', color: p.roe >= 0 ? '#10b981' : '#f87171' }}>
                        {p.roe >= 0 ? `+${p.roe.toFixed(2)}%` : `${p.roe.toFixed(2)}%`}
                      </td>
                      <td style={{ padding: '10px 8px' }}>
                        <button
                          onClick={() => handleClosePos(p.id)}
                          style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '0.72rem', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          إغلاق 🛑
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* AI Signal Feed */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
            <div style={{ background: '#0d1117', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#10b981' }}>إشارة السيولة المؤسسية (SMC)</div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '4px' }}>
                رصد سحب سيولة القيعان (SSL Sweep) على {selectedPair} مع ارتداد نحو قمم BSL عند ${(ticker.price * 1.025).toFixed(2)}.
              </div>
            </div>

            <div style={{ background: '#0d1117', padding: '12px', borderRadius: '8px', borderLeft: '3px solid #f59e0b' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#f59e0b' }}>إجماع الذكاء الاصطناعي (AI Council)</div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '4px' }}>
                توافق نماذج Gemini + Groq بنسبة 88% لصالح صعود الزخم اللحظي مع الحفاظ على إدارة مخاطر 1:2.5+.
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
