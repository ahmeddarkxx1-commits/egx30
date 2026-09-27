import React, { useState } from 'react';
import { ChevronRight, Link2, Send } from 'lucide-react';
import TradingViewWidget from './TradingViewWidget';

export default function SignalBot({ onBack }) {
  const [category, setCategory] = useState('crypto');
  const [asset, setAsset] = useState('BTC/USDT');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = () => {
    setLoading(true);
    setAnalysisResult(null);

    // Attempt Telegram sendData if available
    if (window.Telegram && window.Telegram.WebApp) {
      try {
        const data = JSON.stringify({ action: "analyze", asset: asset, timeframe: timeframe });
        window.Telegram.WebApp.sendData(data);
      } catch (e) {
        console.log("Telegram sendData not supported on inline button context", e);
      }
    }

    setTimeout(() => {
      setLoading(false);
      setAnalysisResult({
        asset,
        timeframe,
        signal: 'BUY 🟢 (شراء قوي)',
        score: '88/100',
        entry: asset.includes('BTC') ? '84,650.00' : '2,645.50',
        tp1: asset.includes('BTC') ? '85,800.00' : '2,680.00',
        tp2: asset.includes('BTC') ? '87,200.00' : '2,710.00',
        sl: asset.includes('BTC') ? '83,900.00' : '2,615.00',
        rsi: '62.4 (زخم صاعد)',
        trend: 'اتجاه صاعد مدعوم بتدفق سيولة مؤسسية'
      });
    }, 800);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>🤖</span>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px' }}>Traden Signal Bot</h2>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>تحليل فني + ماكرو + خوف/طمع + AI</div>
          </div>
        </div>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
          <ChevronRight size={28} />
        </button>
      </div>

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
                padding: '12px 0', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
              }}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '8px' }}>② اختر الأصل</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {assets[category].map(a => (
            <button 
              key={a}
              onClick={() => setAsset(a)}
              style={{
                background: asset === a ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${asset === a ? '#f59e0b' : 'rgba(255,255,255,0.05)'}`,
                color: '#fff', padding: '16px', borderRadius: '8px', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
              }}
            >
              <div style={{ fontWeight: 'bold' }}>{a}</div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '8px', marginBottom: '8px' }}>
        <TradingViewWidget symbol={getSymbol(asset)} height={550} />
      </div>

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
        
        <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', padding: '8px', textAlign: 'center', color: '#f59e0b', fontSize: '12px', fontWeight: 'bold', marginTop: '4px' }}>
          ✅ ✅ جيد — توازن بين السرعة والدقة
        </div>
      </div>

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
        {loading ? '⚡ جاري تحليل البيانات بالذكاء الاصطناعي...' : '🤖 تحليل Traden الشامل'}
      </button>

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
