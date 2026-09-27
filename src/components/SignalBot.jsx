import React, { useState } from 'react';
import { ChevronRight, Link2, Send } from 'lucide-react';
import TradingViewWidget from './TradingViewWidget';

export default function SignalBot({ onBack }) {
  const [category, setCategory] = useState('crypto');
  const [asset, setAsset] = useState('BTC/USDT');
  const [timeframe, setTimeframe] = useState('1h');

  const categories = [
    { id: 'crypto', label: 'كريبتو', icon: '₿' },
    { id: 'metals', label: 'معادن', icon: '🥇' },
    { id: 'forex', label: 'فوركس', icon: '💶' },
    { id: 'oil', label: 'نفط', icon: '🛢️' }
  ];

  const assets = {
    crypto: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT'],
    metals: ['XAU/USD', 'XAG/USD'],
    forex: ['EUR/USD', 'GBP/USD', 'USD/JPY'],
    oil: ['WTI', 'BRENT']
  };

  const timeframes = [
    { id: '15m', label: '15 دق', desc: 'متوسط' },
    { id: '1h', label: '1 ساعة', desc: 'منخفض' },
    { id: '4h', label: '4 ساعات', desc: 'منخفض' },
    { id: '1d', label: 'يومي', desc: 'آمن' }
  ];

  const getSymbol = (a) => {
    if (a.includes('/')) return `BINANCE:${a.replace('/', '')}`;
    if (a === 'XAU/USD') return 'OANDA:XAUUSD';
    if (a === 'XAG/USD') return 'OANDA:XAGUSD';
    return `BINANCE:${a}USDT`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>🤖</span>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px' }}>رصد Signal Bot</h2>
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

      <div>
        <div style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '8px' }}>③ الإطار الزمني</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {timeframes.map(tf => (
            <button 
              key={tf.id}
              onClick={() => setTimeframe(tf.id)}
              style={{
                background: timeframe === tf.id ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${timeframe === tf.id ? '#f59e0b' : 'rgba(255,255,255,0.05)'}`,
                color: '#fff', padding: '12px', borderRadius: '8px', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
              }}
            >
              <div style={{ fontWeight: 'bold', color: timeframe === tf.id ? '#f59e0b' : '#fff' }}>
                {timeframe === tf.id ? '✅ ' : ''}{tf.label}
              </div>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>{tf.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: '#1d4ed8', padding: '8px', borderRadius: '50%' }}>
            <Send size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 'bold', color: '#fff' }}>بوت رصد RASAD BOT</div>
            <div style={{ fontSize: '11px', color: '#9ca3af' }}>جميع الإشارات تُرسل تلقائياً للقناة · انضم الآن</div>
          </div>
        </div>
        <button style={{ background: 'transparent', color: '#3b82f6', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>انضم ←</button>
      </div>

      <button style={{ width: '100%', background: '#f59e0b', color: '#000', padding: '16px', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', border: 'none', cursor: 'pointer' }}>
        🤖 تحليل رصد الشامل
      </button>

      <div style={{ marginTop: '16px' }}>
        <TradingViewWidget symbol={getSymbol(asset)} />
      </div>

    </div>
  );
}
