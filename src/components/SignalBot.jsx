import React, { useState, useEffect } from 'react';
import { ChevronRight, Send, CheckCircle2 } from 'lucide-react';
import TradingViewWidget from './TradingViewWidget';
import { fetchLiveAssetPrice, analyzeStudiedTechnicalSignal } from '../utils/priceFetcher';

const TELEGRAM_BOT_TOKEN = "5426065436:AAEiJvcBc7lC-R8ZgCXENRAtZiwXju2E9XE";

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
  const [capital, setCapital] = useState(100);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sentStatus, setSentStatus] = useState(false);

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

  const sendToTelegramChat = async (res) => {
    try {
      const tg = window.Telegram?.WebApp;
      const user = tg?.initDataUnsafe?.user;

      const messageText = `🤖 *توصية وتحليل Traden AI Bot* 📊

📈 *الأصل:* \`${res.asset}\`
⏰ *الإطار الزمني:* \`${res.timeframe}\`
🎯 *الإشارة:* *${res.signal}*
⭐ *السكور والجودة:* \`${res.score}\`

📍 *سعر الدخول:* \`$${res.entry}\`
🎯 *الهدف 1 (TP1):* \`$${res.tp1}\`
🎯 *الهدف 2 (TP2):* \`$${res.tp2}\`
🛑 *وقف الخسارة (SL):* \`$${res.sl}\`

🛡️ *إدارة المخاطر المحسوبة لرأس مالك ($${res.capital || 100}):*
• اللوت الموصى به: \`${res.recommendedLot || '0.01 Micro'}\`
• الخسارة عند الستوب: \`${res.riskDollar || '-$2.50'}\` (فقط 2.5% مخاطرة)
• الربح المتوقع عند TP1: \`${res.tp1Dollar || '+$6.00'}\` (+6.0% أرباح)
• الربح المتوقع عند TP2: \`${res.tp2Dollar || '+$12.00'}\` (+12.0% أرباح)

📊 *مؤشر RSI:* ${res.rsi}
💡 *الرؤية الفنية:* ${res.trend}`;

      // Send directly via Telegram Bot API if Chat ID / User ID is known
      const chatId = user?.id || "1914514519";
      if (chatId) {
        try {
          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: messageText,
              parse_mode: 'Markdown'
            })
          });
        } catch (e) {
          console.warn("Direct Telegram API send error:", e);
        }
      }

      setSentStatus(true);
      if (tg?.HapticFeedback) {
        tg.HapticFeedback.notificationOccurred('success');
      }
    } catch (err) {
      console.error("Error sending to Telegram", err);
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setAnalysisResult(null);
    setSentStatus(false);

    if (window.Telegram?.WebApp?.HapticFeedback) {
      try {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
      } catch (e) {
        console.log("Haptic feedback error:", e);
      }
    }

    try {
      const result = await analyzeStudiedTechnicalSignal(asset, timeframe, capital);
      setLoading(false);
      setAnalysisResult(result);
      
      // Auto-send result to user Telegram chat
      sendToTelegramChat(result);
    } catch (error) {
      console.error("Analysis Error:", error);
      setLoading(false);
    }
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

      {/* Capital Input & Lot Calculator Box */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '14px', margin: '4px 0' }}>
        <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '8px' }}>
          💰 أدخل رأس مالك للحساب لحساب اللوت والمخاطرة والربح بدقة:
        </div>
        
        {/* Quick Chips */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', overflowX: 'auto' }}>
          {[100, 250, 500, 1000, 2500, 5000].map(amt => (
            <button
              key={amt}
              onClick={() => setCapital(amt)}
              style={{
                background: capital === Number(amt) ? '#f59e0b' : 'rgba(255,255,255,0.05)',
                color: capital === Number(amt) ? '#000' : '#9ca3af',
                border: capital === Number(amt) ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              ${amt}
            </button>
          ))}
        </div>

        {/* Custom Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px 12px' }}>
          <span style={{ color: '#7ee787', fontWeight: 'bold', fontSize: '14px' }}>$</span>
          <input
            type="number"
            value={capital}
            onChange={(e) => setCapital(e.target.value)}
            placeholder="أدخل رأس مالك المخصص..."
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '14px',
              outline: 'none'
            }}
          />
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
        {loading ? '⚡ جاري التحليل والإرسال للتليجرام...' : `🤖 تحليل ${asset} وإرساله للتليجرام 📲`}
      </button>

      {/* Sent Status Notification Toast */}
      {sentStatus && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.2)',
          border: '1px solid #10b981',
          borderRadius: '10px',
          padding: '12px',
          color: '#10b981',
          fontSize: '14px',
          fontWeight: 'bold',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={18} />
          <span>تم إرسال التوصية والتحليل بنجاح إلى شات التليجرام! 🚀</span>
        </div>
      )}

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
              <div style={{ fontWeight: 'bold', color: '#38bdf8' }}>${analysisResult.entry}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
              <div style={{ color: '#9ca3af', fontSize: '11px' }}>مؤشر القوة (RSI)</div>
              <div style={{ fontWeight: 'bold' }}>{analysisResult.rsi}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
              <div style={{ color: '#9ca3af', fontSize: '11px' }}>الهدف (TP1)</div>
              <div style={{ fontWeight: 'bold', color: '#4ade80' }}>${analysisResult.tp1}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
              <div style={{ color: '#9ca3af', fontSize: '11px' }}>وقف الخسارة (SL)</div>
              <div style={{ fontWeight: 'bold', color: '#f87171' }}>${analysisResult.sl}</div>
            </div>
          </div>

          <div style={{ fontSize: '12px', color: '#cbd5e1', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px', marginTop: '10px', marginBottom: '12px' }}>
            💡 <b>الرؤية العامة:</b> {analysisResult.trend}
          </div>

          {/* Account Lot Size & Risk Calculator Guide */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '10px',
            padding: '12px',
            marginTop: '12px',
            marginBottom: '15px'
          }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '6px' }}>
              🛡️ إدارة المخاطر المحسوبة لـ رأس مالك (${analysisResult.capital || 100}):
            </div>
            <div style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: '1.6' }}>
              • <b>حجم اللوت الدقيق الموصى به:</b> <span style={{ color: '#7ee787', fontWeight: 'bold' }}>{analysisResult.recommendedLot || '0.01 Micro'}</span><br/>
              • <b>أقصى خسارة بالدولار عند SL:</b> <span style={{ color: '#f87171', fontWeight: 'bold' }}>{analysisResult.riskDollar || '-$2.50'}</span> (فقط 2.5% مخاطرة)<br/>
              • <b>الربح المتوقع بالدولار عند TP1:</b> <span style={{ color: '#4ade80', fontWeight: 'bold' }}>{analysisResult.tp1Dollar || '+$6.00'}</span> (+6.0% أرباح)<br/>
              • <b>الربح المتوقع بالدولار عند TP2:</b> <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{analysisResult.tp2Dollar || '+$12.00'}</span> (+12.0% أرباح)
            </div>
          </div>

          {/* Manual Send to Telegram Button */}
          <button
            onClick={() => sendToTelegramChat(analysisResult)}
            style={{
              width: '100%',
              background: '#0088cc',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px',
              fontWeight: 'bold',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Send size={16} />
            <span>إعادة إرسال التوصية إلى شات التليجرام 📲</span>
          </button>

        </div>
      )}

    </div>
  );
}
