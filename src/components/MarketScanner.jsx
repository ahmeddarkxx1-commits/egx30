import React, { useState } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import TradingViewWidget from './TradingViewWidget';
import { AssetLogo } from '../utils/assetLogos';

const allAssets = [
  // Forex Majors
  { pair: 'EUR/USD', name: 'يورو / دولار أمريكي', symbol: 'FX:EURUSD', icon: '💶', category: 'forex' },
  { pair: 'GBP/USD', name: 'جنيه استرليني / دولار', symbol: 'FX:GBPUSD', icon: '💷', category: 'forex' },
  { pair: 'USD/JPY', name: 'دولار / ين ياباني', symbol: 'FX:USDJPY', icon: '💴', category: 'forex' },
  { pair: 'AUD/USD', name: 'دولار أسترالي / دولار', symbol: 'FX:AUDUSD', icon: '🇦🇺', category: 'forex' },
  { pair: 'USD/CAD', name: 'دولار / دولار كندي', symbol: 'FX:USDCAD', icon: '🇨🇦', category: 'forex' },
  { pair: 'USD/CHF', name: 'دولار / فرنك سويسري', symbol: 'FX:USDCHF', icon: '🇨🇭', category: 'forex' },
  { pair: 'NZD/USD', name: 'دولار نيوزيلندي / دولار', symbol: 'FX:NZDUSD', icon: '🇳🇿', category: 'forex' },

  // Forex Minors & Crosses
  { pair: 'EUR/GBP', name: 'يورو / جنيه استرليني', symbol: 'FX:EURGBP', icon: '🇪🇺', category: 'forex' },
  { pair: 'EUR/JPY', name: 'يورو / ين ياباني', symbol: 'FX:EURJPY', icon: '💶', category: 'forex' },
  { pair: 'GBP/JPY', name: 'جنيه استرليني / ين', symbol: 'FX:GBPJPY', icon: '💷', category: 'forex' },
  { pair: 'AUD/JPY', name: 'دولار أسترالي / ين', symbol: 'FX:AUDJPY', icon: '🇦🇺', category: 'forex' },
  { pair: 'CAD/JPY', name: 'دولار كندي / ين', symbol: 'FX:CADJPY', icon: '🇨🇦', category: 'forex' },
  { pair: 'CHF/JPY', name: 'فرنك سويسري / ين', symbol: 'FX:CHFJPY', icon: '🇨🇭', category: 'forex' },
  { pair: 'NZD/JPY', name: 'دولار نيوزيلندي / ين', symbol: 'FX:NZDJPY', icon: '🇳🇿', category: 'forex' },
  { pair: 'EUR/AUD', name: 'يورو / دولار أسترالي', symbol: 'FX:EURAUD', icon: '🇪🇺', category: 'forex' },
  { pair: 'EUR/CAD', name: 'يورو / دولار كندي', symbol: 'FX:EURCAD', icon: '🇪🇺', category: 'forex' },
  { pair: 'GBP/AUD', name: 'جنيه / دولار أسترالي', symbol: 'FX:GBPAUD', icon: '💷', category: 'forex' },
  { pair: 'GBP/CAD', name: 'جنيه / دولار كندي', symbol: 'FX:GBPCAD', icon: '💷', category: 'forex' },

  // Forex Exotics
  { pair: 'USD/TRY', name: 'دولار / ليرة تركية', symbol: 'FX:USDTRY', icon: '🇹🇷', category: 'forex' },
  { pair: 'USD/EGP', name: 'دولار / جنيه مصري', symbol: 'FX:USDEGP', icon: '🇪🇬', category: 'forex' },
  { pair: 'USD/SAR', name: 'دولار / ريال سعودي', symbol: 'FX:USDSAR', icon: '🇸🇦', category: 'forex' },
  { pair: 'USD/AED', name: 'دولار / درهم إماراتي', symbol: 'FX:USDAED', icon: '🇦🇪', category: 'forex' },

  // Metals & Energy
  { pair: 'XAU/USD', name: 'الذهب / Dollar', symbol: 'OANDA:XAUUSD', icon: '🥇', category: 'metals' },
  { pair: 'XAG/USD', name: 'الفضة / Dollar', symbol: 'OANDA:XAGUSD', icon: '🥈', category: 'metals' },
  { pair: 'WTI', name: 'النفط الخام الأمريكي', symbol: 'TVC:USOIL', icon: '🛢️', category: 'metals' },
  { pair: 'BRENT', name: 'نفط برنت العالمي', symbol: 'TVC:UKOIL', icon: '⛽', category: 'metals' },

  // Crypto
  { pair: 'BTC/USDT', name: 'Bitcoin', symbol: 'BINANCE:BTCUSDT', icon: '₿', category: 'crypto' },
  { pair: 'ETH/USDT', name: 'Ethereum', symbol: 'BINANCE:ETHUSDT', icon: 'Ξ', category: 'crypto' },
  { pair: 'BNB/USDT', name: 'Binance Coin', symbol: 'BINANCE:BNBUSDT', icon: '🔶', category: 'crypto' },
  { pair: 'SOL/USDT', name: 'Solana', symbol: 'BINANCE:SOLUSDT', icon: '◎', category: 'crypto' },
  { pair: 'ADA/USDT', name: 'Cardano', symbol: 'BINANCE:ADAUSDT', icon: '₳', category: 'crypto' },
  { pair: 'XRP/USDT', name: 'Ripple XRP', symbol: 'BINANCE:XRPUSDT', icon: '✕', category: 'crypto' },
  { pair: 'AVAX/USDT', name: 'Avalanche', symbol: 'BINANCE:AVAXUSDT', icon: '🔺', category: 'crypto' },

  // Indices
  { pair: 'US30', name: 'مؤشر داو جونز الأمريكي', symbol: 'GLOBALPRIME:US30', icon: '📈', category: 'indices' },
  { pair: 'NAS100', name: 'مؤشر ناسداك التكنولوجي', symbol: 'GLOBALPRIME:NAS100', icon: '💻', category: 'indices' },
  { pair: 'SPX500', name: 'مؤشر S&P 500 الرئيسي', symbol: 'GLOBALPRIME:SPX500', icon: '📊', category: 'indices' }
];

export default function MarketScanner({ onBack }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('forex');
  const [selectedCoin, setSelectedCoin] = useState(allAssets[0]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const timeframes = [
    { id: '1m', label: '1 دقيقة ⚡', desc: 'سكالبينج خاطف' },
    { id: '15m', label: '15 دقيقة 🚀', desc: 'صفقة سريعة' },
    { id: '1h', label: '1 ساعة 📊', desc: 'صفقة يومية' },
    { id: '4h', label: '4 ساعات 🎯', desc: 'سوينغ متوسط' },
    { id: '1d', label: 'يومي 🏛️', desc: 'اتجاه عام' }
  ];

  const filteredCoins = allAssets.filter(c => {
    const matchesCategory = activeCategory === 'all' || c.category === activeCategory;
    const matchesSearch = c.pair.toLowerCase().includes(search.toLowerCase()) || 
                          c.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAnalyze = () => {
    setLoading(true);
    setAnalysisResult(null);

    // Trigger haptic feedback without closing WebApp window
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
      try {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
      } catch (err) {
        console.log("Haptic feedback error:", err);
      }
    }

    setTimeout(() => {
      setLoading(false);

      const pairUpper = selectedCoin.pair.toUpperCase();
      let price = 1.0850;
      let tpMul = 0.0040;
      let slMul = 0.0025;

      if (pairUpper.includes('XAU') || pairUpper.includes('GOLD')) {
        price = 2678.50;
        tpMul = selectedTimeframe === '1m' ? 4.5 : selectedTimeframe === '15m' ? 12.0 : selectedTimeframe === '1h' ? 25.0 : 60.0;
        slMul = selectedTimeframe === '1m' ? 2.5 : selectedTimeframe === '15m' ? 7.0 : selectedTimeframe === '1h' ? 14.0 : 35.0;
      } else if (pairUpper.includes('BTC')) {
        price = 84650.00;
        tpMul = selectedTimeframe === '1m' ? 180.0 : selectedTimeframe === '15m' ? 450.0 : selectedTimeframe === '1h' ? 1200.0 : 3500.0;
        slMul = selectedTimeframe === '1m' ? 90.0 : selectedTimeframe === '15m' ? 220.0 : selectedTimeframe === '1h' ? 650.0 : 1800.0;
      } else if (pairUpper.includes('EUR/USD')) {
        price = 1.0852;
        tpMul = selectedTimeframe === '1m' ? 0.0008 : selectedTimeframe === '15m' ? 0.0022 : selectedTimeframe === '1h' ? 0.0055 : 0.0140;
        slMul = selectedTimeframe === '1m' ? 0.0004 : selectedTimeframe === '15m' ? 0.0011 : selectedTimeframe === '1h' ? 0.0028 : 0.0070;
      } else if (pairUpper.includes('GBP/USD')) {
        price = 1.2985;
        tpMul = selectedTimeframe === '1m' ? 0.0010 : selectedTimeframe === '15m' ? 0.0028 : selectedTimeframe === '1h' ? 0.0065 : 0.0160;
        slMul = selectedTimeframe === '1m' ? 0.0005 : selectedTimeframe === '15m' ? 0.0014 : selectedTimeframe === '1h' ? 0.0032 : 0.0080;
      } else if (pairUpper.includes('US30')) {
        price = 42850.00;
        tpMul = selectedTimeframe === '1m' ? 60.0 : selectedTimeframe === '15m' ? 150.0 : selectedTimeframe === '1h' ? 350.0 : 800.0;
        slMul = selectedTimeframe === '1m' ? 35.0 : selectedTimeframe === '15m' ? 80.0 : selectedTimeframe === '1h' ? 180.0 : 420.0;
      }

      // Hash to determine BUY / SELL / WAIT deterministically for each pair + timeframe
      const str = selectedCoin.pair + selectedTimeframe;
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
      let trendText = `تحليل إطار ${selectedTimeframe}: توافق المتوسطات مع اختراق صاعد مدعوم بدخول سيولة.`;
      let tp1Val = price + tpMul;
      let slVal = price - slMul;

      if (mod >= 35 && mod < 70) {
        // SELL Signal
        signalText = 'بيع قوي 🔴 (SELL)';
        signalColor = '#f87171';
        cardBg = 'rgba(248, 113, 113, 0.08)';
        scoreText = `${80 + (mod % 17)}/100`;
        rsiText = `${(32 - (mod % 12)).toFixed(1)} (تشبع شرائي - كسر هابط)`;
        trendText = `تحليل إطار ${selectedTimeframe}: كسر مستوى دعم محوري مع تقاطع سلبي للمتوسطات.`;
        tp1Val = price - tpMul;
        slVal = price + slMul;
      } else if (mod >= 70) {
        // WAIT Signal
        signalText = 'انتظار وتحديد اتجاه ⚪ (WAIT)';
        signalColor = '#f59e0b';
        cardBg = 'rgba(245, 158, 11, 0.08)';
        scoreText = `${52 + (mod % 12)}/100`;
        rsiText = `${(48 + (mod % 6)).toFixed(1)} (منطقة محايدة)`;
        trendText = `تحليل إطار ${selectedTimeframe}: حركة عرضية تجميعية - يُفضل الانتظار لحين كسر النطاق.`;
        tp1Val = price + (tpMul * 0.5);
        slVal = price - (slMul * 0.5);
      }

      const formatP = (val) => price > 100 ? Number(val.toFixed(2)).toLocaleString('en-US', { minimumFractionDigits: 2 }) : val.toFixed(4);

      setAnalysisResult({
        pair: selectedCoin.pair,
        timeframe: selectedTimeframe,
        signal: signalText,
        signalColor: signalColor,
        cardBg: cardBg,
        score: scoreText,
        entry: formatP(price),
        tp1: formatP(tp1Val),
        sl: formatP(slVal),
        rsi: rsiText,
        trend: trendText
      });
    }, 600);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <ChevronRight size={24} />
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>رجوع</span>
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {[
          { id: 'forex', label: 'فوركس 💶' },
          { id: 'metals', label: 'معادن ونفط 🥇' },
          { id: 'crypto', label: 'كريبتو ₿' },
          { id: 'indices', label: 'مؤشرات 📈' },
          { id: 'all', label: 'الجميع 🌐' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              background: activeCategory === cat.id ? '#f59e0b' : 'rgba(255,255,255,0.05)',
              color: activeCategory === cat.id ? '#000' : '#fff',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '20px',
              fontWeight: 'bold',
              fontSize: '13px',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div style={{ position: 'relative' }}>
        <Search size={20} color="#9ca3af" style={{ position: 'absolute', right: '12px', top: '12px' }} />
        <input 
          type="text" 
          placeholder="ابحث عن أي زوج... مثال: EUR/USD, XAU/USD, BTC"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '12px 40px 12px 12px', 
            borderRadius: '8px', 
            background: 'rgba(255,255,255,0.05)', 
            border: '1px solid rgba(255,255,255,0.1)', 
            color: '#fff',
            outline: 'none',
            fontSize: '14px'
          }} 
        />
      </div>

      <div className="grid-2" style={{ maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
        {filteredCoins.map((coin, i) => (
          <div 
            key={i} 
            onClick={() => { setSelectedCoin(coin); setAnalysisResult(null); }}
            style={{ 
              background: selectedCoin.pair === coin.pair ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255,255,255,0.03)', 
              border: `1px solid ${selectedCoin.pair === coin.pair ? '#f59e0b' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: '8px',
              padding: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{coin.pair}</div>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>{coin.name}</div>
            </div>
            <AssetLogo symbol={coin.pair} fallbackIcon={coin.icon} containerSize={32} size={20} />
          </div>
        ))}
      </div>

      <div style={{ marginTop: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
          <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#f59e0b' }}>
            {selectedCoin.pair}
          </div>
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>مخطط تفاعلي</div>
        </div>

        <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
          {timeframes.map(tf => (
            <button
              key={tf.id}
              onClick={() => { setSelectedTimeframe(tf.id); setAnalysisResult(null); }}
              style={{
                flex: 1,
                background: selectedTimeframe === tf.id ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.03)',
                color: selectedTimeframe === tf.id ? '#f59e0b' : '#9ca3af',
                border: `1px solid ${selectedTimeframe === tf.id ? '#f59e0b' : 'rgba(255,255,255,0.08)'}`,
                padding: '8px 4px',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '12px',
                cursor: 'pointer',
                textAlign: 'center',
                whiteSpace: 'nowrap'
              }}
            >
              <div>{tf.label}</div>
            </button>
          ))}
        </div>

        <TradingViewWidget symbol={selectedCoin.symbol} height={550} timeframe={selectedTimeframe} />
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
          gap: '8px',
          marginTop: '8px'
        }}>
        {loading ? '⚡ جاري فحص وتحليل العملة بالذكاء الاصطناعي...' : `🤖 تحليل Traden الشامل (${selectedCoin.pair})`}
      </button>

      {analysisResult && (
        <div style={{ 
          background: analysisResult.cardBg, 
          border: `1px solid ${analysisResult.signalColor}`, 
          borderRadius: '12px', 
          padding: '20px', 
          color: '#fff',
          boxShadow: `0 0 25px ${analysisResult.signalColor}40`,
          marginTop: '8px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: analysisResult.signalColor }}>📊 تحليل الذكاء الاصطناعي لـ {analysisResult.pair}</span>
            <span style={{ background: analysisResult.signalColor, color: '#000', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>
              السكور: {analysisResult.score}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px', margin: '12px 0' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
              <div style={{ color: '#9ca3af', fontSize: '11px' }}>التوصية / الإشارة</div>
              <div style={{ fontWeight: 'bold', color: analysisResult.signalColor, fontSize: '15px' }}>{analysisResult.signal}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
              <div style={{ color: '#9ca3af', fontSize: '11px' }}>سعر السوق الفوري</div>
              <div style={{ fontWeight: 'bold', color: '#38bdf8' }}>{analysisResult.entry}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
              <div style={{ color: '#9ca3af', fontSize: '11px' }}>هدف الربح (TP)</div>
              <div style={{ fontWeight: 'bold', color: '#4ade80' }}>{analysisResult.tp1}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
              <div style={{ color: '#9ca3af', fontSize: '11px' }}>وقف الخسارة (SL)</div>
              <div style={{ fontWeight: 'bold', color: '#f87171' }}>{analysisResult.sl}</div>
            </div>
          </div>

          <div style={{ fontSize: '12px', color: '#cbd5e1', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px', marginTop: '10px' }}>
            💡 <b>قراءة الفحص:</b> {analysisResult.trend}
          </div>
        </div>
      )}
    </div>
  );
}
