import React, { useState } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import TradingViewWidget from './TradingViewWidget';
import { AssetLogo } from '../utils/assetLogos';
import { analyzeStudiedTechnicalSignal } from '../utils/priceFetcher';

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
  const [capital, setCapital] = useState(100);
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

  const handleAnalyze = async () => {
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

    const result = await analyzeStudiedTechnicalSignal(selectedCoin.pair, selectedTimeframe, capital);

    setTimeout(() => {
      setLoading(false);
      setAnalysisResult(result);
    }, 400);
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

        <TradingViewWidget symbol={selectedCoin.symbol} height={360} timeframe={selectedTimeframe} />
      </div>

      {/* Capital Input & Lot Calculator Box */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '14px', marginTop: '4px' }}>
        <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '8px' }}>
          💰 أدخل قيمة رأس مالك لتحليل دقيق للّوت والربح والخسارة:
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
          marginTop: '4px'
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

          {/* Personalized Lot Size & Risk Breakdown */}
          {analysisResult.capital && (
            <div style={{
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '10px',
              padding: '12px',
              marginTop: '12px',
              marginBottom: '10px'
            }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '6px' }}>
                🛡️ إدارة المخاطر المحسوبة لـ رأس مالك (${analysisResult.capital}):
              </div>
              <div style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: '1.6' }}>
                • <b>حجم اللوت الدقيق الموصى به:</b> <span style={{ color: '#7ee787', fontWeight: 'bold' }}>{analysisResult.recommendedLot}</span><br/>
                • <b>أقصى خسارة بالدولار عند SL:</b> <span style={{ color: '#f87171', fontWeight: 'bold' }}>{analysisResult.riskDollar}</span> (فقط 2.5% مخاطرة)<br/>
                • <b>الربح المتوقع بالدولار عند TP1:</b> <span style={{ color: '#4ade80', fontWeight: 'bold' }}>{analysisResult.tp1Dollar}</span> (+6.0% أرباح)<br/>
                • <b>الربح المتوقع بالدولار عند TP2:</b> <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{analysisResult.tp2Dollar}</span> (+12.0% أرباح)
              </div>
            </div>
          )}

          <div style={{ fontSize: '12px', color: '#cbd5e1', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px', marginTop: '10px' }}>
            💡 <b>قراءة الفحص:</b> {analysisResult.trend}
          </div>
        </div>
      )}
    </div>
  );
}
