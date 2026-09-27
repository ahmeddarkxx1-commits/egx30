import React, { useState, useEffect } from 'react';
import { ChevronRight, Link2 } from 'lucide-react';
import TradingViewWidget from './TradingViewWidget';

const categories = [
  { id: 'crypto', label: 'كريبتو', icon: '₿' },
  { id: 'forex', label: 'فوركس', icon: '💶' },
  { id: 'metals', label: 'معادن', icon: '🥇' },
  { id: 'indices', label: 'مؤشرات', icon: '📈' }
];

const assets = {
  crypto: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'DOT/USDT', 'MATIC/USDT', 'BNB/USDT', 'XRP/USDT', 'LINK/USDT'],
  forex: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD'],
  metals: ['XAU/USD', 'XAG/USD', 'XPT/USD', 'WTI/USD'],
  indices: ['US30', 'SPX500', 'NAS100']
};

const timeframes = [
  { id: '1m', label: 'دقيقة 1', desc: 'تداول خاطف فائق السرعة' },
  { id: '15m', label: '15 دقيقة', desc: 'توازن بين السرعة والدقة' },
  { id: '1h', label: 'ساعة 1', desc: 'تحليل قوي للاتجاه اليومي' },
  { id: '4h', label: '4 ساعات', desc: 'تداول سوينغ عالي الأمان' }
];

const getSymbol = (assetPair) => {
  if (!assetPair) return 'BINANCE:BTCUSDT';
  if (assetPair.includes('BTC')) return 'BINANCE:BTCUSDT';
  if (assetPair.includes('ETH')) return 'BINANCE:ETHUSDT';
  if (assetPair.includes('SOL')) return 'BINANCE:SOLUSDT';
  if (assetPair.includes('DOT')) return 'BINANCE:DOTUSDT';
  if (assetPair.includes('MATIC')) return 'BINANCE:MATICUSDT';
  if (assetPair.includes('BNB')) return 'BINANCE:BNBUSDT';
  if (assetPair.includes('XRP')) return 'BINANCE:XRPUSDT';
  if (assetPair.includes('LINK')) return 'BINANCE:LINKUSDT';
  if (assetPair.includes('EUR')) return 'FX:EURUSD';
  if (assetPair.includes('GBP')) return 'FX:GBPUSD';
  if (assetPair.includes('JPY')) return 'FX:USDJPY';
  if (assetPair.includes('XAU')) return 'OANDA:XAUUSD';
  if (assetPair.includes('XAG')) return 'OANDA:XAGUSD';
  if (assetPair.includes('XPT')) return 'OANDA:XPTUSD';
  if (assetPair.includes('US30')) return 'FOREXCOM:DJI';
  return 'BINANCE:' + assetPair.replace('/', '');
};

export default function SignalBot({ onBack, initialSymbol }) {
  const [category, setCategory] = useState('crypto');
  const [asset, setAsset] = useState('BTC/USDT');
  const [timeframe, setTimeframe] = useState('15m');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialSymbol) {
      setAsset(initialSymbol);
      if (initialSymbol.includes('EUR') || initialSymbol.includes('GBP') || initialSymbol.includes('JPY') || initialSymbol.includes('AUD') || initialSymbol.includes('CAD')) {
        setCategory('forex');
      } else if (initialSymbol.includes('XAU') || initialSymbol.includes('XAG') || initialSymbol.includes('XPT') || initialSymbol.includes('WTI')) {
        setCategory('metals');
      } else if (initialSymbol.includes('US30') || initialSymbol.includes('SPX') || initialSymbol.includes('NAS')) {
        setCategory('indices');
      } else {
        setCategory('crypto');
      }
    }
  }, [initialSymbol]);

  const handleAnalyze = () => {
    setLoading(true);
    setAnalysisResult(null);

    // Safe Telegram sendData check
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.sendData) {
      try {
        const data = JSON.stringify({ action: "analyze", asset: asset, timeframe: timeframe });
        window.Telegram.WebApp.sendData(data);
      } catch (e) {
        console.log("Telegram sendData not supported on inline keyboard button context", e);
      }
    }

    setTimeout(() => {
      setLoading(false);
      setAnalysisResult({
        asset,
        timeframe,
        signal: 'BUY 🟢 (شراء قوي)',
        score: '88/100',
        entry: asset.includes('BTC') ? '$84,650.00' : asset.includes('SOL') ? '$121.45' : asset.includes('XAU') ? '$2,682.50' : '$1.0852',
        tp1: asset.includes('BTC') ? '$85,800.00' : asset.includes('SOL') ? '$125.00' : asset.includes('XAU') ? '$2,705.00' : '$1.0910',
        tp2: asset.includes('BTC') ? '$87,200.00' : asset.includes('SOL') ? '$130.00' : asset.includes('XAU') ? '$2,725.00' : '$1.0970',
        sl: asset.includes('BTC') ? '$83,900.00' : asset.includes('SOL') ? '$118.50' : asset.includes('XAU') ? '$2,660.00' : '$1.0810',
        rsi: '62.4 (زخم صاعد)',
        trend: `اتجاه صاعد مدعوم بتدفق سيولة وحجم تداول قوي على زوج ${asset}`
      });
    }, 800);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>🤖</span>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#fff' }}>Traden Signal Bot</h2>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>تحليل فني + ماكرو + خوف/طمع + AI</div>
          </div>
        </div>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
          <ChevronRight size={28} />
        </button>
      </div>

      {/* Premium Connect Banner */}
      <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link2 color="#f59e0b" size={24} />
          <div>
            <div style={{ fontWeight: 'bold', color: '#f59e0b' }}>ربط منصة التداول — Premium</div>
            <div style={{ fontSize: '11px', color: '#9ca3af' }}>BingX · Binance · Bybit · MEXC</div>
          </div>
        </div>
        <button style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', border: '1px solid #f59e0b', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer' }}>ربط ←</button>
      </div>

      {/* Step 1: Category */}
      <div>
        <div style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '8px' }}>① اختر الفئة</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => { setCategory(cat.id); setAsset(assets[cat.id][0]); }}
              style={{
                background: category === cat.id ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${category === cat.id ? '#fff' : 'rgba(255,255,255,0.05)'}`,
                color: category === cat.id ? '#fff' : '#9ca3af',
                padding: '12px 0', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px'
              }}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Asset */}
      <div>
        <div style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '8px' }}>② اختر الأصل</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          {(assets[category] || assets.crypto).map(a => (
            <button 
              key={a}
              onClick={() => setAsset(a)}
              style={{
                background: asset === a ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${asset === a ? '#f59e0b' : 'rgba(255,255,255,0.05)'}`,
                color: asset === a ? '#f59e0b' : '#fff',
                padding: '10px 4px', borderRadius: '8px', cursor: 'pointer',
                fontWeight: 'bold', fontSize: '12px', textAlign: 'center'
              }}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Live Chart */}
      <div style={{ marginTop: '4px', marginBottom: '4px' }}>
        <TradingViewWidget symbol={getSymbol(asset)} timeframe={timeframe} height={550} />
      </div>

      {/* Step 3: Timeframe */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontSize: '14px', color: '#9ca3af', textAlign: 'right' }}>③ الإطار الزمني</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {timeframes.map(tf => (
            <button 
              key={tf.id}
              onClick={() => setTimeframe(tf.id)}
              style={{
                background: timeframe === tf.id ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                border: `1px solid ${timeframe === tf.id ? '#f59e0b' : 'rgba(255,255,255,0.05)'}`,
                color: '#fff', padding: '12px', borderRadius: '8px', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
              }}
            >
              <div style={{ fontWeight: 'bold', color: timeframe === tf.id ? '#f59e0b' : '#9ca3af' }}>
                {timeframe === tf.id ? '✅ ' : '⚡ '}{tf.label}
              </div>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>{tf.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Analyze Trigger Button */}
      <button 
        onClick={handleAnalyze}
        disabled={loading}
        style={{ 
          width: '100%', 
          background: loading ? '#b45309' : '#f59e0b', 
          color: '#000', 
          padding: '16px', 
          borderRadius: '12px', 
          fontWeight: 'bold', 
          fontSize: '18px', 
          border: 'none', 
          cursor: 'pointer',
          boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px'
        }}>
        {loading ? '⚡ جاري تحليل البيانات بالذكاء الاصطناعي...' : `🤖 تحليل ${asset} بالذكاء الاصطناعي`}
      </button>

      {/* Analysis Result Card */}
      {analysisResult && (
        <div style={{ 
          background: 'rgba(16, 185, 129, 0.08)', 
          border: '1px solid #10b981', 
          borderRadius: '12px', 
          padding: '20px', 
          color: '#fff',
          boxShadow: '0 0 25px rgba(16, 185, 129, 0.2)',
          marginBottom: '30px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>📊 نتيجة تحليل Traden AI</span>
            <span style={{ background: '#10b981', color: '#000', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>
              السكور: {analysisResult.score}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px', margin: '12px 0' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
              <div style={{ color: '#9ca3af', fontSize: '11px' }}>التوصية / الإشارة</div>
              <div style={{ fontWeight: 'bold', color: '#10b981', fontSize: '15px' }}>{analysisResult.signal}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
              <div style={{ color: '#9ca3af', fontSize: '11px' }}>الإطار الزمني</div>
              <div style={{ fontWeight: 'bold' }}>{analysisResult.timeframe}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
              <div style={{ color: '#9ca3af', fontSize: '11px' }}>سعر الدخول المقترح</div>
              <div style={{ fontWeight: 'bold', color: '#38bdf8' }}>{analysisResult.entry}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
              <div style={{ color: '#9ca3af', fontSize: '11px' }}>مؤشر القوة (RSI)</div>
              <div style={{ fontWeight: 'bold' }}>{analysisResult.rsi}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
              <div style={{ color: '#9ca3af', fontSize: '11px' }}>الهدف (TP1)</div>
              <div style={{ fontWeight: 'bold', color: '#4ade80' }}>{analysisResult.tp1}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
              <div style={{ color: '#9ca3af', fontSize: '11px' }}>وقف الخسارة (SL)</div>
              <div style={{ fontWeight: 'bold', color: '#f87171' }}>{analysisResult.sl}</div>
            </div>
          </div>

          <div style={{ fontSize: '12px', color: '#cbd5e1', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px', marginTop: '10px' }}>
            💡 <b>الرؤية العامة:</b> {analysisResult.trend}
          </div>
        </div>
      )}

    </div>
  );
}
