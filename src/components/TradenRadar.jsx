import React, { useState, useEffect } from 'react';
import { ChevronRight, RefreshCw } from 'lucide-react';

const initialRadarAssets = [
  // Crypto
  { pair: 'SOL/USDT', price: '$121.45', score: 88, signal: 'BUY', signalType: 'buy', change: '+0.17%', isUp: true, sparkline: [10, 15, 12, 22, 18, 25, 20], category: 'crypto', isHot: true },
  { pair: 'DOT/USDT', price: '$1.2510', score: 88, signal: 'BUY', signalType: 'buy', change: '+0.89%', isUp: true, sparkline: [8, 12, 18, 14, 24, 28, 30], category: 'crypto', isHot: true },
  { pair: 'MATIC/USDT', price: '$0.3794', score: 88, signal: 'BUY', signalType: 'buy', change: '-0.29%', isUp: false, sparkline: [25, 20, 15, 18, 12, 10, 8], category: 'crypto', isHot: true },
  { pair: 'BTC/USDT', price: '$84,232', score: 82, signal: 'BUY', signalType: 'buy', change: '-0.13%', isUp: false, sparkline: [30, 28, 32, 26, 22, 25, 20], category: 'crypto', isHot: true },
  { pair: 'ETH/USDT', price: '$2,678.20', score: 76, signal: 'BUY', signalType: 'buy', change: '+0.45%', isUp: true, sparkline: [15, 18, 22, 20, 26, 24, 28], category: 'crypto', isHot: false },
  { pair: 'LINK/USDT', price: '$13.9490', score: 32, signal: 'SELL', signalType: 'sell', change: '-0.42%', isUp: false, sparkline: [24, 20, 18, 15, 12, 10, 8], category: 'crypto', isHot: false },

  // Forex Majors
  { pair: 'EUR/USD', price: '$1.0852', score: 71, signal: 'BUY', signalType: 'buy', change: '+0.12%', isUp: true, sparkline: [12, 14, 16, 15, 18, 20, 22], category: 'forex', isHot: false },
  { pair: 'GBP/USD', price: '$1.3228', score: 78, signal: 'BUY', signalType: 'buy', change: '+0.08%', isUp: true, sparkline: [14, 18, 15, 22, 20, 26, 24], category: 'forex', isHot: false },
  { pair: 'USD/JPY', price: '$157.6440', score: 22, signal: 'SELL', signalType: 'sell', change: '+0.15%', isUp: true, sparkline: [28, 25, 22, 18, 15, 12, 10], category: 'forex', isHot: true },
  { pair: 'AUD/USD', price: '$0.6710', score: 75, signal: 'BUY', signalType: 'buy', change: '+0.22%', isUp: true, sparkline: [10, 12, 15, 18, 20, 22, 25], category: 'forex', isHot: false },
  { pair: 'USD/CAD', price: '$1.3540', score: 28, signal: 'SELL', signalType: 'sell', change: '-0.10%', isUp: false, sparkline: [25, 22, 20, 18, 16, 14, 12], category: 'forex', isHot: false },
  { pair: 'USD/CHF', price: '$0.8490', score: 30, signal: 'SELL', signalType: 'sell', change: '-0.05%', isUp: false, sparkline: [20, 18, 16, 15, 14, 12, 10], category: 'forex', isHot: false },
  { pair: 'NZD/USD', price: '$0.6230', score: 72, signal: 'BUY', signalType: 'buy', change: '+0.18%', isUp: true, sparkline: [12, 15, 18, 20, 22, 24, 26], category: 'forex', isHot: false },

  // Forex Minors & Crosses
  { pair: 'EUR/GBP', price: '$0.8415', score: 55, signal: 'HOLD', signalType: 'wait', change: '+0.04%', isUp: true, sparkline: [18, 18, 19, 18, 19, 18, 19], category: 'forex', isHot: false },
  { pair: 'EUR/JPY', price: '$171.10', score: 81, signal: 'BUY', signalType: 'buy', change: '+0.28%', isUp: true, sparkline: [15, 18, 22, 25, 28, 30, 32], category: 'forex', isHot: true },
  { pair: 'GBP/JPY', price: '$208.50', score: 84, signal: 'BUY', signalType: 'buy', change: '+0.24%', isUp: true, sparkline: [18, 20, 24, 28, 30, 32, 35], category: 'forex', isHot: true },
  { pair: 'AUD/JPY', price: '$105.78', score: 79, signal: 'BUY', signalType: 'buy', change: '+0.35%', isUp: true, sparkline: [12, 16, 20, 24, 26, 28, 30], category: 'forex', isHot: false },
  { pair: 'CAD/JPY', price: '$116.40', score: 70, signal: 'BUY', signalType: 'buy', change: '+0.12%', isUp: true, sparkline: [14, 16, 18, 20, 22, 24, 25], category: 'forex', isHot: false },
  { pair: 'CHF/JPY', price: '$185.65', score: 76, signal: 'BUY', signalType: 'buy', change: '+0.20%', isUp: true, sparkline: [16, 18, 20, 22, 25, 28, 30], category: 'forex', isHot: false },
  { pair: 'NZD/JPY', price: '$98.25', score: 77, signal: 'BUY', signalType: 'buy', change: '+0.30%', isUp: true, sparkline: [14, 16, 20, 22, 24, 26, 28], category: 'forex', isHot: false },
  { pair: 'EUR/AUD', price: '$1.6170', score: 34, signal: 'SELL', signalType: 'sell', change: '-0.11%', isUp: false, sparkline: [24, 22, 20, 18, 16, 14, 12], category: 'forex', isHot: false },
  { pair: 'EUR/CAD', price: '$1.4690', score: 58, signal: 'HOLD', signalType: 'wait', change: '+0.02%', isUp: true, sparkline: [18, 19, 18, 19, 18, 19, 18], category: 'forex', isHot: false },
  { pair: 'EUR/NZD', price: '$1.7418', score: 31, signal: 'SELL', signalType: 'sell', change: '-0.06%', isUp: false, sparkline: [22, 20, 18, 16, 14, 12, 10], category: 'forex', isHot: false },
  { pair: 'GBP/AUD', price: '$1.9710', score: 33, signal: 'SELL', signalType: 'sell', change: '-0.14%', isUp: false, sparkline: [26, 24, 22, 20, 18, 16, 14], category: 'forex', isHot: false },
  { pair: 'GBP/CAD', price: '$1.7910', score: 52, signal: 'HOLD', signalType: 'wait', change: '-0.02%', isUp: false, sparkline: [19, 18, 19, 18, 19, 18, 18], category: 'forex', isHot: false },
  { pair: 'GBP/NZD', price: '$2.1230', score: 29, signal: 'SELL', signalType: 'sell', change: '-0.10%', isUp: false, sparkline: [25, 23, 21, 19, 17, 15, 13], category: 'forex', isHot: false },
  { pair: 'AUD/CAD', price: '$0.9080', score: 68, signal: 'BUY', signalType: 'buy', change: '+0.12%', isUp: true, sparkline: [12, 14, 16, 18, 20, 22, 24], category: 'forex', isHot: false },

  // Forex Exotics & Arab Currencies
  { pair: 'USD/TRY', price: '$34.1500', score: 18, signal: 'SELL', signalType: 'sell', change: '+0.45%', isUp: true, sparkline: [35, 30, 25, 20, 15, 10, 5], category: 'forex', isHot: true },
  { pair: 'USD/EGP', price: '$48.6000', score: 45, signal: 'HOLD', signalType: 'wait', change: '+0.10%', isUp: true, sparkline: [20, 20, 21, 20, 21, 20, 21], category: 'forex', isHot: false },
  { pair: 'USD/SAR', price: '$3.7510', score: 50, signal: 'HOLD', signalType: 'wait', change: '0.00%', isUp: true, sparkline: [20, 20, 20, 20, 20, 20, 20], category: 'forex', isHot: false },
  { pair: 'USD/AED', price: '$3.6725', score: 50, signal: 'HOLD', signalType: 'wait', change: '0.00%', isUp: true, sparkline: [20, 20, 20, 20, 20, 20, 20], category: 'forex', isHot: false },
  { pair: 'USD/MXN', price: '$19.6500', score: 26, signal: 'SELL', signalType: 'sell', change: '-0.18%', isUp: false, sparkline: [28, 25, 22, 19, 16, 13, 10], category: 'forex', isHot: false },
  { pair: 'USD/ZAR', price: '$17.8500', score: 24, signal: 'SELL', signalType: 'sell', change: '-0.32%', isUp: false, sparkline: [30, 26, 22, 18, 14, 10, 8], category: 'forex', isHot: true },

  // Metals & Energy & Indices
  { pair: 'XAU/USD', price: '$4,297', score: 12, signal: 'SELL', signalType: 'sell', change: '0.00%', isUp: true, sparkline: [22, 20, 18, 15, 12, 10, 6], category: 'metals', isHot: true },
  { pair: 'XAG/USD', price: '$31.85', score: 85, signal: 'BUY', signalType: 'buy', change: '+0.76%', isUp: true, sparkline: [12, 15, 18, 22, 25, 28, 30], category: 'metals', isHot: true },
  { pair: 'XPT/USD', price: '$1,778', score: 88, signal: 'BUY', signalType: 'buy', change: '0.00%', isUp: true, sparkline: [12, 10, 15, 14, 18, 12, 10], category: 'metals', isHot: true },
  { pair: 'WTI/USD', price: '$71.40', score: 55, signal: 'HOLD', signalType: 'wait', change: '0.00%', isUp: true, sparkline: [18, 18, 19, 18, 19, 18, 19], category: 'metals', isHot: false },
  { pair: 'US30', price: '$42,850', score: 68, signal: 'BUY', signalType: 'buy', change: '+0.34%', isUp: true, sparkline: [20, 22, 25, 24, 28, 30, 32], category: 'indices', isHot: false }
];

export default function TradenRadar({ onBack, onOpenBot }) {
  const [assets, setAssets] = useState(initialRadarAssets);
  const [lastScanTime, setLastScanTime] = useState(new Date().toLocaleTimeString('ar-EG'));
  const [isUpdating, setIsUpdating] = useState(false);
  const [filterSignal, setFilterSignal] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('score');

  // Live Auto-Refresh simulation & Binance API ticker fetch
  const fetchLiveData = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch('https://api.binance.com/api/v3/ticker/24hr');
      if (res.ok) {
        const binanceData = await res.json();
        const mapBinance = {};
        binanceData.forEach(item => {
          mapBinance[item.symbol] = item;
        });

        setAssets(prev => prev.map(a => {
          const bSymbol = a.pair.replace('/', '');
          const liveTicker = mapBinance[bSymbol];
          if (liveTicker) {
            const rawPrice = parseFloat(liveTicker.lastPrice);
            const priceStr = rawPrice > 100 
              ? `$${rawPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : `$${rawPrice.toFixed(4)}`;
            
            const rawChange = parseFloat(liveTicker.priceChangePercent);
            const isUp = rawChange >= 0;
            const changeStr = `${isUp ? '+' : ''}${rawChange.toFixed(2)}%`;

            // Calculate dynamic Traden Score
            const dynamicScore = Math.min(99, Math.max(10, Math.round(50 + rawChange * 5 + (Math.random() * 4 - 2))));
            const signalType = dynamicScore >= 65 ? 'buy' : dynamicScore <= 35 ? 'sell' : 'wait';
            const signal = signalType === 'buy' ? 'BUY' : signalType === 'sell' ? 'SELL' : 'HOLD';

            // Add new point to sparkline
            const newSpark = [...a.sparkline.slice(1), Math.round(20 + Math.random() * 15)];

            return {
              ...a,
              price: priceStr,
              score: dynamicScore,
              signal,
              signalType,
              change: changeStr,
              isUp,
              sparkline: newSpark,
              isHot: dynamicScore >= 80 || dynamicScore <= 25
            };
          }

          // Random slight fluctuation for non-binance assets
          const delta = (Math.random() - 0.49) * 0.2;
          const isUp = delta >= 0;
          return {
            ...a,
            sparkline: [...a.sparkline.slice(1), Math.round(15 + Math.random() * 15)],
            isUp
          };
        }));
      }
    } catch (e) {
      console.log('Using simulated live feed:', e);
    } finally {
      setLastScanTime(new Date().toLocaleTimeString('ar-EG'));
      setTimeout(() => setIsUpdating(false), 500);
    }
  };

  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(() => {
      fetchLiveData();
    }, 8000); // refresh every 8 seconds
    return () => clearInterval(interval);
  }, []);

  const totalScanned = assets.length;
  const hotCount = assets.filter(a => a.isHot).length;
  const buyCount = assets.filter(a => a.signalType === 'buy').length;
  const sellCount = assets.filter(a => a.signalType === 'sell').length;

  const filteredAssets = assets.filter(asset => {
    if (filterSignal === 'buy' && asset.signalType !== 'buy') return false;
    if (filterSignal === 'sell' && asset.signalType !== 'sell') return false;
    if (filterSignal === 'hot' && !asset.isHot) return false;
    if (filterCategory !== 'all' && asset.category !== filterCategory) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'score') return b.score - a.score;
    if (sortBy === 'change') return parseFloat(b.change) - parseFloat(a.change);
    return 0;
  });

  const topBuy = [...assets].filter(a => a.signalType === 'buy').sort((a,b) => b.score - a.score).slice(0, 3);
  const topSell = [...assets].filter(a => a.signalType === 'sell').sort((a,b) => a.score - b.score).slice(0, 3);

  const renderSparkline = (points, isUp) => {
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const width = 60;
    const height = 24;

    const pathData = points.map((p, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((p - min) / range) * (height - 4) - 2;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    return (
      <svg width={width} height={height} style={{ overflow: 'visible' }}>
        <path 
          d={pathData} 
          fill="none" 
          stroke={isUp ? '#10b981' : '#f87171'} 
          strokeWidth="2"
          strokeLinecap="round" 
        />
      </svg>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#fff' }}>رادار الفرص اللحظي 🔭</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 8px', borderRadius: '12px', color: '#10b981', fontSize: '11px', fontWeight: 'bold' }}>
              <span className={isUpdating ? 'spin' : ''}>🟢</span>
              <span>مباشر</span>
            </div>
          </div>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>آخر مسح: {lastScanTime} · {totalScanned}/{totalScanned} أصل</span>
            <RefreshCw size={12} className={isUpdating ? 'spin' : ''} style={{ cursor: 'pointer' }} onClick={fetchLiveData} />
          </div>
        </div>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
          <ChevronRight size={28} />
        </button>
      </div>

      {/* Stats Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>{totalScanned}</div>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>إجمالي مفحوص</div>
        </div>
        <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f59e0b' }}>{hotCount}</div>
          <div style={{ fontSize: '11px', color: '#f59e0b', marginTop: '2px' }}>فرص ساخنة</div>
        </div>
        <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f87171' }}>{sellCount}</div>
          <div style={{ fontSize: '11px', color: '#f87171', marginTop: '2px' }}>إشارات بيع</div>
        </div>
        <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>{buyCount}</div>
          <div style={{ fontSize: '11px', color: '#10b981', marginTop: '2px' }}>إشارات شراء</div>
        </div>
      </div>

      {/* Best Opportunities Section ("أفضل الفرص الآن 🔥") */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '14px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#fff' }}>أفضل الفرص الآن 🔥</div>
          <div style={{ fontSize: '11px', color: '#9ca3af' }}>الإشارات الأقوى بناءً على Traden Score</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {/* Top Buy */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#10b981', textAlign: 'right', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
              <span>أقوى شراء</span>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
            </div>
            {topBuy.map(item => (
              <div 
                key={item.pair} 
                onClick={() => onOpenBot && onOpenBot(item.pair)}
                style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: '8px', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              >
                <span style={{ fontWeight: 'bold', color: '#10b981', fontSize: '15px' }}>{item.score}</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#fff' }}>{item.pair}</div>
                  <div style={{ fontSize: '10px', color: '#9ca3af' }}>{item.price}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Top Sell */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#f87171', textAlign: 'right', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
              <span>أقوى بيع</span>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f87171' }}></span>
            </div>
            {topSell.map(item => (
              <div 
                key={item.pair} 
                onClick={() => onOpenBot && onOpenBot(item.pair)}
                style={{ background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '8px', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              >
                <span style={{ fontWeight: 'bold', color: '#f87171', fontSize: '15px' }}>{item.score}</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#fff' }}>{item.pair}</div>
                  <div style={{ fontSize: '10px', color: '#9ca3af' }}>{item.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
          {[
            { id: 'all', label: 'الكل' },
            { id: 'buy', label: 'شراء 🟢' },
            { id: 'sell', label: 'بيع 🔴' },
            { id: 'hot', label: 'ساخن 🔥' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilterSignal(f.id)}
              style={{
                background: filterSignal === f.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: `1px solid ${filterSignal === f.id ? '#fff' : 'rgba(255,255,255,0.1)'}`,
                color: '#fff', padding: '6px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap'
              }}
            >
              {f.label}
            </button>
          ))}
          <button 
            onClick={() => setSortBy(sortBy === 'score' ? 'change' : 'score')}
            style={{
              background: '#f59e0b', color: '#000', border: 'none', padding: '6px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap'
            }}
          >
            Score 📊
          </button>
        </div>

        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
          {[
            { id: 'all', label: 'الكل' },
            { id: 'crypto', label: '₿ كريبتو' },
            { id: 'metals', label: '🥇 معادن' },
            { id: 'forex', label: '💶 فوركس' },
            { id: 'indices', label: '📈 مؤشرات' }
          ].map(c => (
            <button
              key={c.id}
              onClick={() => setFilterCategory(c.id)}
              style={{
                background: filterCategory === c.id ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.03)',
                color: filterCategory === c.id ? '#f59e0b' : '#9ca3af',
                border: `1px solid ${filterCategory === c.id ? '#f59e0b' : 'rgba(255,255,255,0.05)'}`,
                padding: '4px 10px', borderRadius: '12px', fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap'
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table View */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', overflow: 'hidden' }}>
        {/* Table Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1.2fr', padding: '12px 14px', background: 'rgba(255,255,255,0.04)', fontSize: '12px', color: '#9ca3af', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div>الأصل</div>
          <div style={{ textAlign: 'center' }}>Score</div>
          <div style={{ textAlign: 'center' }}>إشارة</div>
          <div style={{ textAlign: 'center' }}>تغير</div>
          <div style={{ textAlign: 'center' }}>سبارك</div>
        </div>

        {/* Table Body */}
        {filteredAssets.map((asset, idx) => (
          <div 
            key={asset.pair}
            onClick={() => onOpenBot && onOpenBot(asset.pair)}
            style={{ 
              display: 'grid', 
              gridTemplateColumns: '2fr 1fr 1fr 1fr 1.2fr', 
              padding: '14px', 
              alignItems: 'center', 
              borderBottom: idx !== filteredAssets.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#fff' }}>{asset.pair}</div>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>{asset.price}</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <span style={{ 
                fontWeight: 'bold', 
                fontSize: '15px', 
                color: asset.score >= 75 ? '#10b981' : asset.score >= 65 ? '#34d399' : asset.score <= 35 ? '#f87171' : '#f59e0b' 
              }}>
                {asset.score}
              </span>
              <div style={{ height: '4px', width: '36px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', margin: '4px auto 0 auto', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${asset.score}%`, 
                  background: asset.score >= 65 ? '#10b981' : asset.score <= 35 ? '#f87171' : '#f59e0b' 
                }}></div>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <span style={{ 
                background: asset.signalType === 'buy' ? 'rgba(16,185,129,0.15)' : asset.signalType === 'sell' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                color: asset.signalType === 'buy' ? '#10b981' : asset.signalType === 'sell' ? '#f87171' : '#f59e0b',
                border: `1px solid ${asset.signalType === 'buy' ? '#10b981' : asset.signalType === 'sell' ? '#f87171' : '#f59e0b'}`,
                padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold'
              }}>
                {asset.signal}
              </span>
            </div>

            <div style={{ textAlign: 'center', fontSize: '12px', fontWeight: 'bold', color: asset.isUp ? '#10b981' : '#f87171' }}>
              {asset.change} {asset.isUp ? '▲' : '▼'}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              {renderSparkline(asset.sparkline, asset.isUp)}
            </div>
          </div>
        ))}
      </div>

      {/* Score Guide Box */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
        <div style={{ fontSize: '13px', color: '#9ca3af', textAlign: 'center', marginBottom: '12px', fontWeight: 'bold' }}>دليل درجة Traden Score</div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '8px' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold', color: '#f59e0b', fontSize: '14px' }}>36-64</div>
            <div style={{ fontSize: '11px', color: '#9ca3af' }}>انتظار HOLD</div>
          </div>

          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold', color: '#34d399', fontSize: '14px' }}>65-74</div>
            <div style={{ fontSize: '11px', color: '#9ca3af' }}>شراء</div>
          </div>

          <div style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold', color: '#10b981', fontSize: '14px' }}>75-100</div>
            <div style={{ fontSize: '11px', color: '#fff' }}>شراء قوي 🔥</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold', color: '#f87171', fontSize: '14px' }}>0-25</div>
            <div style={{ fontSize: '11px', color: '#f87171' }}>بيع قوي 💥</div>
          </div>

          <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold', color: '#f87171', fontSize: '14px' }}>26-35</div>
            <div style={{ fontSize: '11px', color: '#9ca3af' }}>بيع</div>
          </div>
        </div>
      </div>

      {/* Bottom Bot Launch Banner */}
      <div style={{ 
        background: 'rgba(245, 158, 11, 0.06)', 
        border: '1px solid rgba(245, 158, 11, 0.2)', 
        borderRadius: '12px', 
        padding: '16px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <button 
          onClick={() => onOpenBot && onOpenBot()}
          style={{ background: '#f59e0b', color: '#000', border: 'none', borderRadius: '8px', padding: '10px 18px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
          Traden Bot
        </button>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
            <span>حلل أي أصل بالتفصيل</span>
            <span>🤖</span>
          </div>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>اضغط على أي سطر لفتح Traden Bot بتحليل كامل</div>
        </div>
      </div>

    </div>
  );
}
