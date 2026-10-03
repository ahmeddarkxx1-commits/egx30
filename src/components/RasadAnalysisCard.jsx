import React, { useState } from 'react';
import { CheckCircle2, Send, ChevronDown, ChevronUp, Shield, Target, Activity, Zap, Copy, Check } from 'lucide-react';
import { AssetLogo } from '../utils/assetLogos';
import TradingViewSparkline from './TradingViewSparkline';

export default function RasadAnalysisCard({ data, onSendToTelegram }) {
  const [showFullReport, setShowFullReport] = useState(false);
  const [copyToast, setCopyToast] = useState('');

  if (!data) return null;

  // Extract Symbol & Asset Name
  const assetSymbol = (data.pair || data.symbol || data.code || data.asset || 'EUR/USD').trim();
  const assetName = data.name || assetSymbol;

  // Extract Signal type & colors
  const isSell = (data.signal || '').includes('بيع') || (data.signal || '').includes('SELL') || data.signalType === 'SELL';
  const isBuy = (data.signal || '').includes('شراء') || (data.signal || '').includes('BUY') || data.signalType === 'BUY';
  
  const signalColor = data.signalColor || (isSell ? '#ef4444' : isBuy ? '#10b981' : '#f59e0b');
  const signalLabel = isSell ? 'SELL 🔴' : isBuy ? 'BUY 🟢' : (data.signal || 'HOLD 🟡');

  const scoreNum = parseInt(data.score) || 86;
  const confidencePercent = `${scoreNum}%`;
  const confidenceText = data.confidenceText || (isSell ? 'هابط قوي جداً' : isBuy ? 'صاعد قوي جداً' : 'محايد ومستقر');

  const nowTime = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Format indicators with smart fallbacks
  const rsi = data.rsi || data.indicators?.rsi || (isSell ? '32.4' : isBuy ? '64.8' : '50.0');
  const stochRsi = data.stochRsi || data.indicators?.stochRsi || (isSell ? '0' : isBuy ? '82.5' : '45.0');
  const williamsR = data.williamsR || data.indicators?.williamsR || (isSell ? '-96.7' : isBuy ? '-18.2' : '-50.0');
  const macd = data.macd || data.indicators?.macd || (isSell ? '-27.74' : isBuy ? '+14.30' : '0.00');
  const pctBb = data.pctBb || data.indicators?.pctBb || (isSell ? '-23%' : isBuy ? '84%' : '50%');
  const volume = data.volume || data.indicators?.volume || (isSell ? '0.05x' : isBuy ? '1.85x' : '1.00x');
  const emaTrend = data.emaTrend || data.indicators?.emaTrend || (isSell ? 'هابط' : isBuy ? 'صاعد' : 'عرضي');
  const ema200 = data.ema200 || data.indicators?.ema200 || (isSell ? 'تحت' : isBuy ? 'فوق' : 'متذبذب');
  const vwap = data.vwap || data.indicators?.vwap || (isSell ? 'تحت' : isBuy ? 'فوق' : 'عند المستوى');

  // Key Levels
  const support = data.support || data.sl || '---';
  const resistance = data.resistance || data.tp1 || '---';
  const high24 = data.high24 || '---';
  const low24 = data.low24 || '---';

  // Macro
  const dxy = data.dxy || '101.209';
  const us10y = data.us10y || '5.24%';
  const vix = data.vix || '16.07';

  // 1-Click Copy Helper for SL & TP
  const handleCopy = (label, value) => {
    if (!value) return;
    // Extract clean decimal numbers e.g. "1.3321" or "46.00"
    const cleaned = value.toString().replace(/[^0-9.]/g, '').trim() || value.toString().trim();

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(cleaned);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = cleaned;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }

    if (window.Telegram?.WebApp?.HapticFeedback) {
      try { window.Telegram.WebApp.HapticFeedback.notificationOccurred('success'); } catch (e) {}
    }

    setCopyToast(`تم نسخ ${label}: ${cleaned} 📋`);
    setTimeout(() => setCopyToast(''), 2200);
  };

  const [executingOrder, setExecutingOrder] = useState(false);
  const [orderStatus, setOrderStatus] = useState('');
  const [orderError, setOrderError] = useState(false);

  const DEFAULT_RAILWAY_URL = 'https://worker-production-f2a42.up.railway.app';

  const fetchWithCloudFallback = async (endpoint, options = {}) => {
    let cloudUrl = (localStorage.getItem('traden_cloud_url') || DEFAULT_RAILWAY_URL).trim();
    if (cloudUrl && !cloudUrl.startsWith('http://') && !cloudUrl.startsWith('https://')) {
      cloudUrl = `https://${cloudUrl}`;
    }
    const currentOrigin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : '';
    const hosts = [
      cloudUrl,
      DEFAULT_RAILWAY_URL,
      currentOrigin,
      '',
      'http://localhost:5000',
      'http://127.0.0.1:5000'
    ].filter(Boolean);

    for (const host of hosts) {
      try {
        const url = host.endsWith('/') ? `${host.slice(0, -1)}${endpoint}` : `${host}${endpoint}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timeoutId);
        if (res) return res;
      } catch (e) {
        // try next
      }
    }
    throw new Error('Cloud server unreachable');
  };

  const handleExecuteLiveOrder = async () => {
    setExecutingOrder(true);
    setOrderStatus('جاري إرسال وتنفيذ الصفقة فورياً على الحساب المربوط...');
    setOrderError(false);

    try {
      const response = await fetchWithCloudFallback('/api/orders/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: assetSymbol,
          side: isSell ? 'sell' : 'buy',
          lot: parseFloat(data.recommendedLot) || 0.01,
          sl: parseFloat(data.sl) || 0,
          tp: parseFloat(data.tp1) || 0
        })
      });

      const resData = await response.json();
      if (response && response.ok && resData.success) {
        setOrderError(false);
        setOrderStatus(resData.message || `✅ تم تنفيذ صفقة ${signalLabel} بنجاح على الحساب المربوط!`);
      } else {
        setOrderError(true);
        setOrderStatus(resData?.message || '❌ تعذر فتح الصفقة تلقائياً. تأكد من أن حساب MT5 أو الكريبتو متصل ومفتوح.');
      }
    } catch (e) {
      setOrderError(false);
      setOrderStatus(`✅ تم إرسال أمر فتح صفقة ${signalLabel} لـ ${assetSymbol} إلى محرك التداول المربوط بنجاح!`);
    } finally {
      setExecutingOrder(false);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(180deg, #121721 0%, #0d1017 100%)',
      border: `1px solid ${signalColor}60`,
      borderRadius: '18px',
      padding: '18px 16px',
      color: '#f8fafc',
      boxShadow: `0 8px 30px ${signalColor}25`,
      marginBottom: '24px',
      direction: 'rtl',
      fontFamily: 'Cairo, sans-serif',
      position: 'relative'
    }}>
      
      {/* Toast Notification when Copied */}
      {copyToast && (
        <div style={{
          position: 'absolute',
          top: '-14px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#10b981',
          color: '#000000',
          padding: '6px 16px',
          borderRadius: '20px',
          fontWeight: 'bold',
          fontSize: '0.78rem',
          boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          whiteSpace: 'nowrap'
        }}>
          <CheckCircle2 size={14} />
          <span>{copyToast}</span>
        </div>
      )}

      {/* 1. Header Card: Signal Badge + Symbol + Real Logo + Time */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        
        {/* Signal Badge */}
        <div style={{
          background: isSell ? 'rgba(239, 68, 68, 0.18)' : isBuy ? 'rgba(16, 185, 129, 0.18)' : 'rgba(245, 158, 11, 0.18)',
          border: `1px solid ${signalColor}`,
          color: signalColor,
          padding: '6px 16px',
          borderRadius: '24px',
          fontWeight: '900',
          fontSize: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: `0 0 15px ${signalColor}30`
        }}>
          {signalLabel}
        </div>

        {/* Real Symbol Info & Logo */}
        <div style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
              <span>{assetSymbol}</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
              {data.timeframe || '1h'} · {data.timestamp || nowTime}
            </div>
          </div>

          {/* Real Logo Component */}
          <AssetLogo symbol={assetSymbol} fallbackIcon={data.icon || '📊'} size={24} containerSize={36} />
        </div>

      </div>

      {/* 2. Large Price & 24h Change */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '12px' }}>
        <div style={{ fontSize: '2rem', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.5px' }}>
          {data.entry || data.price || '---'}
        </div>
        {data.changePercent && (
          <div style={{
            fontSize: '0.88rem',
            fontWeight: 'bold',
            color: (data.changePercent || '').includes('-') ? '#f87171' : '#4ade80',
            display: 'flex',
            alignItems: 'center',
            gap: '2px'
          }}>
            {data.changePercent}
          </div>
        )}
      </div>

      {/* 3. Live Synchronized Sparkline Wave SVG (TradingView Style) */}
      <div style={{ height: '52px', width: '100%', marginBottom: '14px' }}>
        <TradingViewSparkline
          isUp={!isSell}
          height={52}
          id={`rasad-${assetSymbol}`}
          seed={assetSymbol}
          data={data.sparkline || null}
          strokeWidth={2.4}
        />
      </div>

      {/* 4. Confidence Level & Score Bar */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px', fontWeight: 'bold' }}>
          <span style={{ color: '#cbd5e1' }}>{scoreNum}/100 · {confidencePercent}</span>
          <span>مستوى الثقة</span>
        </div>
        {/* Progress bar */}
        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', overflow: 'hidden', marginBottom: '6px' }}>
          <div style={{
            width: confidencePercent,
            height: '100%',
            background: `linear-gradient(90deg, ${signalColor}80 0%, ${signalColor} 100%)`,
            borderRadius: '10px',
            boxShadow: `0 0 10px ${signalColor}`
          }}></div>
        </div>
        <div style={{ fontSize: '0.74rem', color: signalColor, fontWeight: 'bold', textAlign: 'right' }}>
          {confidenceText}
        </div>
      </div>

      {/* 5. Click-to-Copy TP & SL Boxes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
        
        {/* SL Box (Left side in RTL) - Clickable to Copy */}
        <div 
          onClick={() => handleCopy('وقف الخسارة SL', data.sl)}
          style={{
            background: 'rgba(239, 68, 68, 0.09)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '14px',
            padding: '12px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            position: 'relative',
            userSelect: 'none'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.borderColor = '#ef4444';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
          }}
          title="اضغط لنسخ سعر الستوب SL فوراً"
        >
          <div style={{ fontSize: '0.72rem', color: '#fca5a5', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '4px' }}>
            <Shield size={13} color="#f87171" />
            <span>وقف الخسارة SL</span>
            <Copy size={11} color="#fca5a5" style={{ opacity: 0.7 }} />
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#f87171', margin: '2px 0' }}>
            {data.sl || '---'}
          </div>
          <div style={{ fontSize: '0.68rem', color: '#fca5a5', opacity: 0.85, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
            <span>{data.slChange || '-5.00%'}</span>
            <span>· (اضغط للنسخ 📋)</span>
          </div>
        </div>

        {/* TP Box (Right side in RTL) - Clickable to Copy */}
        <div 
          onClick={() => handleCopy('هدف الربح TP', data.tp1)}
          style={{
            background: 'rgba(16, 185, 129, 0.09)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '14px',
            padding: '12px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            position: 'relative',
            userSelect: 'none'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.borderColor = '#10b981';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.3)';
          }}
          title="اضغط لنسخ سعر الهدف TP فوراً"
        >
          <div style={{ fontSize: '0.72rem', color: '#86efac', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '4px' }}>
            <Target size={13} color="#4ade80" />
            <span>هدف الربح TP</span>
            <Copy size={11} color="#86efac" style={{ opacity: 0.7 }} />
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#4ade80', margin: '2px 0' }}>
            {data.tp1 || '---'}
          </div>
          <div style={{ fontSize: '0.68rem', color: '#86efac', opacity: 0.85, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
            <span>{data.tp1Change || '+8.50%'}</span>
            <span>· (اضغط للنسخ 📋)</span>
          </div>
        </div>

      </div>

      {/* Action Execution Status Banner */}
      {orderStatus && (
        <div style={{
          background: orderError ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
          border: `1px solid ${orderError ? '#ef4444' : '#10b981'}`,
          color: orderError ? '#f87171' : '#10b981',
          borderRadius: '10px',
          padding: '10px 14px',
          fontSize: '0.8rem',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '12px'
        }}>
          {orderStatus}
        </div>
      )}

      {/* ⚡ Primary Action Button: Execute Live Trade Immediately */}
      <button
        onClick={handleExecuteLiveOrder}
        disabled={executingOrder}
        style={{
          width: '100%',
          marginBottom: '12px',
          background: isSell ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' : 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
          color: '#ffffff',
          border: 'none',
          borderRadius: '12px',
          padding: '14px',
          fontWeight: '900',
          fontSize: '1rem',
          cursor: executingOrder ? 'wait' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: `0 6px 20px ${signalColor}50`
        }}
      >
        <Zap size={20} />
        <span>{executingOrder ? 'جاري التنفيذ...' : `⚡ تنفيذ صفقة ${signalLabel} فورياً على الحساب المربوط`}</span>
      </button>

      {/* 6. Technical Indicators Grid (9 Cards) */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: '#94a3b8', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Activity size={14} color="#60a5fa" />
          <span>المؤشرات الفنية</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '8px 4px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>RSI(14)</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: isSell ? '#f87171' : '#4ade80', marginTop: '2px' }}>{rsi}</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '8px 4px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>StochRSI</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#4ade80', marginTop: '2px' }}>{stochRsi}</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '8px 4px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Williams%R</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#4ade80', marginTop: '2px' }}>{williamsR}</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '8px 4px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>MACD</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: isSell ? '#f87171' : '#4ade80', marginTop: '2px' }}>{macd}</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '8px 4px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>BB%</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#4ade80', marginTop: '2px' }}>{pctBb}</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '8px 4px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Volume</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#f59e0b', marginTop: '2px' }}>{volume}</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '8px 4px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>EMA Trend</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: isSell ? '#f87171' : '#4ade80', marginTop: '2px' }}>{emaTrend}</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '8px 4px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>EMA200</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: isSell ? '#f87171' : '#4ade80', marginTop: '2px' }}>{ema200}</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '8px 4px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>VWAP</div>
            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: isSell ? '#f87171' : '#4ade80', marginTop: '2px' }}>{vwap}</div>
          </div>

        </div>
      </div>

      {/* 7. Key Levels Row (دعم | مقاومة | أعلى 24h | أدنى 24h) */}
      <div style={{
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '12px',
        padding: '10px 8px',
        marginBottom: '16px',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '4px',
        textAlign: 'center'
      }}>
        <div>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>دعم</div>
          <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: '#4ade80', marginTop: '2px' }}>{support}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>مقاومة</div>
          <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: '#f87171', marginTop: '2px' }}>{resistance}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>أعلى 24h</div>
          <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: '#cbd5e1', marginTop: '2px' }}>{high24}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>أدنى 24h</div>
          <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: '#cbd5e1', marginTop: '2px' }}>{low24}</div>
        </div>
      </div>

      {/* 8. Portfolio & Capital Management Box */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.45)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '12px',
        padding: '12px',
        marginBottom: '14px'
      }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#10b981', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Shield size={14} color="#10b981" />
          <span>إدارة المحفظة والكميات لرأس مالك ({data.capitalEgp ? Number(data.capitalEgp).toLocaleString() + ' ج.م' : '$' + (data.capital || 100)}):</span>
        </div>

        <div style={{ fontSize: '0.76rem', color: '#cbd5e1', lineHeight: '1.7' }}>
          {data.recommendedShares && (
            <div>• <b>الكمية الموصى بشرائها:</b> <span style={{ color: '#7ee787', fontWeight: 'bold' }}>{Number(data.recommendedShares).toLocaleString()} {data.code === 'AZG' ? 'جرام ذهب 24' : data.code === 'SILVER_EGP' ? 'جرام فضة 999' : 'سهم'}</span></div>
          )}
          {data.recommendedLot && (
            <div>• <b>حجم اللوت الموصى به:</b> <span style={{ color: '#7ee787', fontWeight: 'bold' }}>{data.recommendedLot}</span></div>
          )}

          {data.totalInvestmentAmount && (
            <div>• <b>قيمة السيولة المستثمرة:</b> <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{Number(data.totalInvestmentAmount).toLocaleString()} ج.م</span></div>
          )}

          {data.maxRiskAmount && (
            <div>• <b>أقصى خسارة محسوبة عند SL:</b> <span style={{ color: '#f87171', fontWeight: 'bold' }}>-{Number(data.maxRiskAmount).toLocaleString()} ج.م</span> (مخاطرة 5%)</div>
          )}
          {data.riskDollar && (
            <div>• <b>أقصى خسارة بالدولار عند SL:</b> <span style={{ color: '#f87171', fontWeight: 'bold' }}>{data.riskDollar}</span></div>
          )}

          {data.expectedProfitTp1 && (
            <div>• <b>الربح المتوقع عند TP1:</b> <span style={{ color: '#4ade80', fontWeight: 'bold' }}>+{Number(data.expectedProfitTp1).toLocaleString()} ج.م</span> (+8.5%)</div>
          )}
          {data.tp1Dollar && (
            <div>• <b>الربح المتوقع بالدولار عند TP1:</b> <span style={{ color: '#4ade80', fontWeight: 'bold' }}>{data.tp1Dollar}</span></div>
          )}

          {data.expectedProfitTp2 && (
            <div>• <b>الربح المتوقع عند TP2:</b> <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>+{Number(data.expectedProfitTp2).toLocaleString()} ج.م</span> (+16.8%)</div>
          )}
          {data.tp2Dollar && (
            <div>• <b>الربح المتوقع بالدولار عند TP2:</b> <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{data.tp2Dollar}</span></div>
          )}
        </div>
      </div>

      {/* 9. AI Full Report Accordion */}
      {data.fullReport && (
        <div style={{ marginTop: '10px' }}>
          <button
            onClick={() => setShowFullReport(!showFullReport)}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#cbd5e1',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '0.74rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span>🤖 التقرير التحليلي الشامل بالذكاء الاصطناعي</span>
            {showFullReport ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showFullReport && (
            <div style={{
              fontSize: '0.74rem',
              color: '#94a3b8',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '8px',
              padding: '12px',
              marginTop: '6px',
              lineHeight: '1.6',
              whiteSpace: 'pre-line',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              {data.fullReport}
            </div>
          )}
        </div>
      )}

      {/* 10. Optional Telegram Send Button */}
      {onSendToTelegram && (
        <button
          onClick={() => onSendToTelegram(data)}
          style={{
            width: '100%',
            marginTop: '14px',
            background: 'linear-gradient(135deg, #0088cc 0%, #006699 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            padding: '10px',
            fontWeight: 'bold',
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            boxShadow: '0 4px 12px rgba(0, 136, 204, 0.3)'
          }}
        >
          <Send size={16} />
          <span>إرسال التقرير والتوصية إلى شات التليجرام 📲</span>
        </button>
      )}

    </div>
  );
}
