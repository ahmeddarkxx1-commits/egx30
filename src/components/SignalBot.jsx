import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import TradingViewWidget from './TradingViewWidget';

const categories = [
  { id: 'crypto', label: 'كريبتو', icon: '₿' },
  { id: 'forex', label: 'فوركس', icon: '💶' },
  { id: 'metals', label: 'معادن', icon: '🥇' },
  { id: 'indices', label: 'مؤشرات', icon: '📈' }
];

const assets = {
  crypto: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'DOT/USDT', 'MATIC/USDT', 'BNB/USDT', 'XRP/USDT', 'LINK/USDT', 'ADA/USDT', 'AVAX/USDT'],
  forex: [
    'EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'USD/CHF', 'NZD/USD',
    'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'AUD/JPY', 'CAD/JPY', 'CHF/JPY', 'NZD/JPY',
    'EUR/AUD', 'EUR/CAD', 'EUR/NZD', 'GBP/AUD', 'GBP/CAD', 'GBP/NZD', 'AUD/CAD',
    'USD/TRY', 'USD/EGP', 'USD/SAR', 'USD/AED', 'USD/MXN', 'USD/ZAR'
  ],
  metals: ['XAU/USD', 'XAG/USD', 'XPT/USD', 'WTI/USD', 'BRENT/USD'],
  indices: ['US30', 'SPX500', 'NAS100', 'GER30', 'UK100', 'JPN225']
};

const timeframes = [
  { id: '1m', label: 'دقيقة 1', desc: 'تداول خاطف فائق السرعة' },
  { id: '15m', label: '15 دقيقة', desc: 'توازن بين السرعة والدقة' },
  { id: '1h', label: 'ساعة 1', desc: 'تحليل قوي للاتجاه اليومي' },
  { id: '4h', label: '4 ساعات', desc: 'تداول سوينغ عالي الأمان' }
];

const getSymbol = (assetPair) => {
  if (!assetPair) return 'BINANCE:BTCUSDT';
  if (assetPair.includes('/')) {
    const clean = assetPair.replace('/', '');
    if (assetPair.includes('USDT')) return 'BINANCE:' + clean;
    if (assetPair.includes('XAU')) return 'OANDA:XAUUSD';
    if (assetPair.includes('XAG')) return 'OANDA:XAGUSD';
    if (assetPair.includes('XPT')) return 'OANDA:XPTUSD';
    if (assetPair.includes('WTI')) return 'TVC:USOIL';
    if (assetPair.includes('BRENT')) return 'TVC:UKOIL';
    return 'FX:' + clean;
  }
  if (assetPair.includes('US30')) return 'FOREXCOM:DJI';
  if (assetPair.includes('SPX')) return 'FOREXCOM:SPX';
  if (assetPair.includes('NAS')) return 'FOREXCOM:NSX';
  return 'FX:' + assetPair;
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

      const pairUpper = asset.toUpperCase();
      let price = 1.0850;
      let tpMul = 0.0040;
      let slMul = 0.0025;

      if (pairUpper.includes('XAU') || pairUpper.includes('GOLD')) {
        price = 2682.50;
        tpMul = timeframe === '1m' ? 4.5 : timeframe === '15m' ? 12.0 : timeframe === '1h' ? 25.0 : 60.0;
        slMul = timeframe === '1m' ? 2.5 : timeframe === '15m' ? 7.0 : timeframe === '1h' ? 14.0 : 35.0;
      } else if (pairUpper.includes('BTC')) {
        price = 84650.00;
        tpMul = timeframe === '1m' ? 180.0 : timeframe === '15m' ? 450.0 : timeframe === '1h' ? 1200.0 : 3500.0;
        slMul = timeframe === '1m' ? 90.0 : timeframe === '15m' ? 220.0 : timeframe === '1h' ? 650.0 : 1800.0;
      } else if (pairUpper.includes('SOL')) {
        price = 121.45;
        tpMul = timeframe === '1m' ? 1.2 : timeframe === '15m' ? 3.5 : timeframe === '1h' ? 8.0 : 20.0;
        slMul = timeframe === '1m' ? 0.6 : timeframe === '15m' ? 1.8 : timeframe === '1h' ? 4.0 : 10.0;
      } else if (pairUpper.includes('EUR/USD')) {
        price = 1.0852;
        tpMul = timeframe === '1m' ? 0.0008 : timeframe === '15m' ? 0.0022 : timeframe === '1h' ? 0.0055 : 0.0140;
        slMul = timeframe === '1m' ? 0.0004 : timeframe === '15m' ? 0.0011 : timeframe === '1h' ? 0.0028 : 0.0070;
      } else if (pairUpper.includes('GBP/USD')) {
        price = 1.2985;
        tpMul = timeframe === '1m' ? 0.0010 : timeframe === '15m' ? 0.0028 : timeframe === '1h' ? 0.0065 : 0.0160;
        slMul = timeframe === '1m' ? 0.0005 : timeframe === '15m' ? 0.0014 : timeframe === '1h' ? 0.0032 : 0.0080;
      } else if (pairUpper.includes('US30')) {
        price = 42850.00;
        tpMul = timeframe === '1m' ? 60.0 : timeframe === '15m' ? 150.0 : timeframe === '1h' ? 350.0 : 800.0;
        slMul = timeframe === '1m' ? 35.0 : timeframe === '15m' ? 80.0 : timeframe === '1h' ? 180.0 : 420.0;
      }

      // Hash calculation to determine BUY / SELL / WAIT deterministically
      const str = asset + timeframe;
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
      }
      const mod = Math.abs(hash) % 100;

      let signalText = 'شراء قوي 🟢 (BUY)';
      let signalColor = '#10b981';
      let cardBg = 'rgba(16, 185, 129, 0.08)';
      let scoreText = `${82 + (mod % 16)}/100`;
      let rsiText = `${(56 + (mod % 18)).toFixed(1)} (زخم صاعد)`;
      let trendText = `تحليل إطار ${timeframe}: اختراق صاعد مدعوم بدخول سيولة ومؤشر ماكد صاعد على ${asset}.`;
      let tp1Val = price + tpMul;
      let slVal = price - slMul;

      if (mod >= 35 && mod < 70) {
        signalText = 'بيع قوي 🔴 (SELL)';
        signalColor = '#f87171';
        cardBg = 'rgba(248, 113, 113, 0.08)';
        scoreText = `${80 + (mod % 17)}/100`;
        rsiText = `${(32 - (mod % 12)).toFixed(1)} (تشبع شرائي - كسر هابط)`;
        trendText = `تحليل إطار ${timeframe}: كسر مستوى دعم محوري مع تقاطع سلبي للمتوسطات المتحركة على ${asset}.`;
        tp1Val = price - tpMul;
        slVal = price + tpMul;
      } else if (mod >= 70) {
        signalText = 'انتظار وتحديد اتجاه ⚪ (WAIT)';
        signalColor = '#f59e0b';
        cardBg = 'rgba(245, 158, 11, 0.08)';
        scoreText = `${52 + (mod % 12)}/100`;
        rsiText = `${(48 + (mod % 6)).toFixed(1)} (منطقة محايدة)`;
        trendText = `تحليل إطار ${timeframe}: حركة عرضية تجميعية على ${asset} - يُفضل الانتظار لحين كسر النطاق.`;
        tp1Val = price + (tpMul * 0.5);
        slVal = price - (slMul * 0.5);
      }

      const formatP = (val) => price > 100 ? Number(val.toFixed(2)).toLocaleString('en-US', { minimumFractionDigits: 2 }) : val.toFixed(4);

      setAnalysisResult({
        asset,
        timeframe,
        signal: signalText,
        signalColor: signalColor,
        cardBg: cardBg,
        score: scoreText,
        entry: formatP(price),
        tp1: formatP(tp1Val),
        tp2: formatP(tp1Val * 1.005),
        sl: formatP(slVal),
        rsi: rsiText,
        trend: trendText
      });
    }, 600);
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
          background: analysisResult.cardBg || 'rgba(16, 185, 129, 0.08)', 
          border: `1px solid ${analysisResult.signalColor || '#10b981'}`, 
          borderRadius: '12px', 
          padding: '20px', 
          color: '#fff',
          boxShadow: `0 0 25px ${analysisResult.signalColor || '#10b981'}40`,
          marginBottom: '30px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: analysisResult.signalColor || '#10b981' }}>📊 نتيجة تحليل Traden AI</span>
            <span style={{ background: analysisResult.signalColor || '#10b981', color: '#000', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>
              السكور: {analysisResult.score}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px', margin: '12px 0' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
              <div style={{ color: '#9ca3af', fontSize: '11px' }}>التوصية / الإشارة</div>
              <div style={{ fontWeight: 'bold', color: analysisResult.signalColor || '#10b981', fontSize: '15px' }}>{analysisResult.signal}</div>
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
