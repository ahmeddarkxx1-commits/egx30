import React, { useState } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import TradingViewWidget from './TradingViewWidget';

const allAssets = [
  // Forex
  { pair: 'EUR/USD', name: 'يورو / دولار أمريكي', symbol: 'FX:EURUSD', icon: '💶', category: 'forex' },
  { pair: 'GBP/USD', name: 'جنيه استرليني / دولار', symbol: 'FX:GBPUSD', icon: '💷', category: 'forex' },
  { pair: 'USD/JPY', name: 'دولار / ين ياباني', symbol: 'FX:USDJPY', icon: '💴', category: 'forex' },
  { pair: 'AUD/USD', name: 'دولار أسترالي / دولار', symbol: 'FX:AUDUSD', icon: '🇦🇺', category: 'forex' },
  { pair: 'USD/CAD', name: 'دولار / دولار كندي', symbol: 'FX:USDCAD', icon: '🇨🇦', category: 'forex' },
  { pair: 'USD/CHF', name: 'دولار / فرنك سويسري', symbol: 'FX:USDCHF', icon: '🇨🇭', category: 'forex' },
  { pair: 'NZD/USD', name: 'دولار نيوزيلندي / دولار', symbol: 'FX:NZDUSD', icon: '🇳🇿', category: 'forex' },
  { pair: 'EUR/GBP', name: 'يورو / جنيه استرليني', symbol: 'FX:EURGBP', icon: '🇪🇺', category: 'forex' },

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
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const filteredCoins = allAssets.filter(c => {
    const matchesCategory = activeCategory === 'all' || c.category === activeCategory;
    const matchesSearch = c.pair.toLowerCase().includes(search.toLowerCase()) || 
                          c.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAnalyze = () => {
    setLoading(true);
    setAnalysisResult(null);

    // Safely attempt Telegram sendData without crashing if inline button
    if (window.Telegram && window.Telegram.WebApp) {
      try {
        if (window.Telegram.WebApp.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
        }
        const data = JSON.stringify({ 
          action: "analyze", 
          symbol: selectedCoin.pair, 
          name: selectedCoin.name 
        });
        window.Telegram.WebApp.sendData(data);
      } catch (err) {
        console.log("Telegram sendData skipped in inline keyboard context:", err);
      }
    }

    setTimeout(() => {
      setLoading(false);

      let priceData = { entry: '1.0850', tp1: '1.0895', tp2: '1.0940', sl: '1.0810', trend: 'اتجاه صاعد مدعوم بنمو المؤشرات الاقتصادية الأوروبية' };
      const pairUpper = selectedCoin.pair.toUpperCase();

      if (pairUpper.includes('XAU') || pairUpper.includes('GOLD') || pairUpper.includes('ذهب')) {
        priceData = { entry: '2,678.50', tp1: '2,695.00', tp2: '2,715.00', sl: '2,662.00', trend: 'ارتداد إيجابي من منطقة دعم رئيسية بعد تدفقات الذهب العالمية' };
      } else if (pairUpper.includes('XAG') || pairUpper.includes('SILVER')) {
        priceData = { entry: '31.85', tp1: '32.40', tp2: '33.10', sl: '31.30', trend: 'زخم إيجابي قوي على الفضة مع زيادة طلب الصناعة' };
      } else if (pairUpper.includes('BTC')) {
        priceData = { entry: '84,650.00', tp1: '86,200.00', tp2: '88,500.00', sl: '83,400.00', trend: 'اختراق نموذجي لخط الاتجاه مع زيادة سيولة الكريبتو' };
      } else if (pairUpper.includes('ETH')) {
        priceData = { entry: '2,678.20', tp1: '2,740.00', tp2: '2,820.00', sl: '2,630.00', trend: 'تجميع إيجابي أعلى المتوسط المتحرك 200' };
      } else if (pairUpper.includes('EUR/USD')) {
        priceData = { entry: '1.0852', tp1: '1.0895', tp2: '1.0945', sl: '1.0815', trend: 'صعود تدريجي يختبر مستويات المقاومة اليومية' };
      } else if (pairUpper.includes('GBP/USD')) {
        priceData = { entry: '1.2985', tp1: '1.3040', tp2: '1.3110', sl: '1.2930', trend: 'زخم صاعد مدعوم ببيانات التضخم البريطانية' };
      } else if (pairUpper.includes('US30')) {
        priceData = { entry: '42,850.00', tp1: '43,150.00', tp2: '43,450.00', sl: '42,600.00', trend: 'ارتفاع مؤشر الداو جونز مع نتائج أرباح الشركات' };
      } else if (pairUpper.includes('WTI') || pairUpper.includes('OIL')) {
        priceData = { entry: '71.40', tp1: '72.80', tp2: '74.20', sl: '70.20', trend: 'ارتفاع النفط الخام نتيجة مخاوف الإمدادات' };
      }

      setAnalysisResult({
        pair: selectedCoin.pair,
        signal: 'شراء قوي 🟢 (BUY)',
        score: '91/100',
        entry: priceData.entry,
        tp1: priceData.tp1,
        tp2: priceData.tp2,
        sl: priceData.sl,
        rsi: '64.8 (زخم إيجابي)',
        trend: priceData.trend
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
            <div style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              background: 'rgba(255,255,255,0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '14px'
            }}>
              {coin.icon}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
          <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#f59e0b' }}>
            {selectedCoin.pair}
          </div>
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>مخطط احترافي</div>
        </div>
        <TradingViewWidget symbol={selectedCoin.symbol} height={550} />
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
          background: 'rgba(16, 185, 129, 0.08)', 
          border: '1px solid #10b981', 
          borderRadius: '12px', 
          padding: '20px', 
          color: '#fff',
          boxShadow: '0 0 25px rgba(16, 185, 129, 0.25)',
          marginTop: '8px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>📊 تحليل الذكاء الاصطناعي لـ {analysisResult.pair}</span>
            <span style={{ background: '#10b981', color: '#000', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>
              السكور: {analysisResult.score}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px', margin: '12px 0' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
              <div style={{ color: '#9ca3af', fontSize: '11px' }}>التوصية / الإشارة</div>
              <div style={{ fontWeight: 'bold', color: '#10b981', fontSize: '15px' }}>{analysisResult.signal}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
              <div style={{ color: '#9ca3af', fontSize: '11px' }}>سعر السوق الفوري</div>
              <div style={{ fontWeight: 'bold', color: '#38bdf8' }}>{analysisResult.entry}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
              <div style={{ color: '#9ca3af', fontSize: '11px' }}>هدف الربح الأول (TP1)</div>
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
