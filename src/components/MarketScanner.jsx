import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, PlusCircle, Trash2, Sparkles, CheckCircle2 } from 'lucide-react';
import TradingViewWidget from './TradingViewWidget';
import RasadAnalysisCard from './RasadAnalysisCard';
import { AssetLogo } from '../utils/assetLogos';
import { analyzeStudiedTechnicalSignal } from '../utils/priceFetcher';

// Comprehensive Built-in Master Assets List
const defaultAssets = [
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
  { pair: 'AUD/CAD', name: 'دولار أسترالي / كندي', symbol: 'FX:AUDCAD', icon: '🇦🇺', category: 'forex' },
  { pair: 'AUD/NZD', name: 'دولار أسترالي / نيوزيلندي', symbol: 'FX:AUDNZD', icon: '🇦🇺', category: 'forex' },
  { pair: 'EUR/NZD', name: 'يورو / دولار نيوزيلندي', symbol: 'FX:EURNZD', icon: '🇪🇺', category: 'forex' },
  { pair: 'GBP/NZD', name: 'جنيه / دولار نيوزيلندي', symbol: 'FX:GBPNZD', icon: '💷', category: 'forex' },

  // Forex Exotics & Arab Currencies
  { pair: 'USD/TRY', name: 'دولار / ليرة تركية', symbol: 'FX:USDTRY', icon: '🇹🇷', category: 'forex' },
  { pair: 'USD/EGP', name: 'دولار / جنيه مصري', symbol: 'FX:USDEGP', icon: '🇪🇬', category: 'forex' },
  { pair: 'USD/SAR', name: 'دولار / ريال سعودي', symbol: 'FX:USDSAR', icon: '🇸🇦', category: 'forex' },
  { pair: 'USD/AED', name: 'دولار / درهم إماراتي', symbol: 'FX:USDAED', icon: '🇦🇪', category: 'forex' },
  { pair: 'USD/MXN', name: 'دولار / بيزو مكسيكي', symbol: 'FX:USDMXN', icon: '🇲🇽', category: 'forex' },
  { pair: 'USD/ZAR', name: 'دولار / راند جنوب أفريقيا', symbol: 'FX:USDZAR', icon: '🇿🇦', category: 'forex' },

  // Metals & Energy
  { pair: 'XAU/USD', name: 'الذهب / Dollar', symbol: 'OANDA:XAUUSD', icon: '🥇', category: 'metals' },
  { pair: 'XAG/USD', name: 'الفضة / Dollar', symbol: 'OANDA:XAGUSD', icon: '🥈', category: 'metals' },
  { pair: 'XPT/USD', name: 'البلاتين / Dollar', symbol: 'OANDA:XPTUSD', icon: '💎', category: 'metals' },
  { pair: 'WTI', name: 'النفط الخام الأمريكي', symbol: 'TVC:USOIL', icon: '🛢️', category: 'metals' },
  { pair: 'BRENT', name: 'نفط برنت العالمي', symbol: 'TVC:UKOIL', icon: '⛽', category: 'metals' },
  { pair: 'NGAS', name: 'الغاز الطبيعي', symbol: 'TVC:NGAS', icon: '🔥', category: 'metals' },

  // Crypto
  { pair: 'BTC/USDT', name: 'Bitcoin', symbol: 'BINANCE:BTCUSDT', icon: '₿', category: 'crypto' },
  { pair: 'ETH/USDT', name: 'Ethereum', symbol: 'BINANCE:ETHUSDT', icon: 'Ξ', category: 'crypto' },
  { pair: 'BNB/USDT', name: 'Binance Coin', symbol: 'BINANCE:BNBUSDT', icon: '🔶', category: 'crypto' },
  { pair: 'SOL/USDT', name: 'Solana', symbol: 'BINANCE:SOLUSDT', icon: '◎', category: 'crypto' },
  { pair: 'ADA/USDT', name: 'Cardano', symbol: 'BINANCE:ADAUSDT', icon: '₳', category: 'crypto' },
  { pair: 'XRP/USDT', name: 'Ripple XRP', symbol: 'BINANCE:XRPUSDT', icon: '✕', category: 'crypto' },
  { pair: 'AVAX/USDT', name: 'Avalanche', symbol: 'BINANCE:AVAXUSDT', icon: '🔺', category: 'crypto' },
  { pair: 'DOGE/USDT', name: 'Dogecoin', symbol: 'BINANCE:DOGEUSDT', icon: '🐕', category: 'crypto' },
  { pair: 'DOT/USDT', name: 'Polkadot', symbol: 'BINANCE:DOTUSDT', icon: '🔴', category: 'crypto' },
  { pair: 'LINK/USDT', name: 'Chainlink', symbol: 'BINANCE:LINKUSDT', icon: '🔗', category: 'crypto' },
  { pair: 'SUI/USDT', name: 'Sui Network', symbol: 'BINANCE:SUIUSDT', icon: '💧', category: 'crypto' },
  { pair: 'NEAR/USDT', name: 'Near Protocol', symbol: 'BINANCE:NEARUSDT', icon: 'Ⓝ', category: 'crypto' },

  // Indices
  { pair: 'US30', name: 'مؤشر داو جونز الأمريكي', symbol: 'GLOBALPRIME:US30', icon: '📈', category: 'indices' },
  { pair: 'NAS100', name: 'مؤشر ناسداك التكنولوجي', symbol: 'GLOBALPRIME:NAS100', icon: '💻', category: 'indices' },
  { pair: 'SPX500', name: 'مؤشر S&P 500 الرئيسي', symbol: 'GLOBALPRIME:SPX500', icon: '📊', category: 'indices' },
  { pair: 'GER40', name: 'مؤشر الداكس الألماني DAX', symbol: 'GLOBALPRIME:GER40', icon: '🇩🇪', category: 'indices' },
  { pair: 'UK100', name: 'مؤشر الفوتسي البريطاني FTSE', symbol: 'GLOBALPRIME:UK100', icon: '🇬🇧', category: 'indices' },

  // Global US Stocks
  { pair: 'AAPL', name: 'شركة أبل (Apple)', symbol: 'NASDAQ:AAPL', icon: '🍎', category: 'stocks' },
  { pair: 'NVDA', name: 'إنفيديا (Nvidia AI)', symbol: 'NASDAQ:NVDA', icon: '💚', category: 'stocks' },
  { pair: 'TSLA', name: 'تسلا (Tesla)', symbol: 'NASDAQ:TSLA', icon: '⚡', category: 'stocks' },
  { pair: 'MSFT', name: 'مايكروسوفت (Microsoft)', symbol: 'NASDAQ:MSFT', icon: '🪟', category: 'stocks' },
  { pair: 'AMZN', name: 'أمازون (Amazon)', symbol: 'NASDAQ:AMZN', icon: '📦', category: 'stocks' },
  { pair: 'META', name: 'ميتا فيسبوك (Meta)', symbol: 'NASDAQ:META', icon: '♾️', category: 'stocks' },
  { pair: 'GOOGL', name: 'جوجل ألفابت (Google)', symbol: 'NASDAQ:GOOGL', icon: '🔍', category: 'stocks' },
  { pair: 'COIN', name: 'كوينبيس (Coinbase)', symbol: 'NASDAQ:COIN', icon: '🪙', category: 'stocks' }
];

export default function MarketScanner({ onBack }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('forex');
  const [customAssets, setCustomAssets] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(defaultAssets[0]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h');
  const [capital, setCapital] = useState(100);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [addToast, setAddToast] = useState('');

  // Load user's custom pairs from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('traden_custom_pairs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setCustomAssets(parsed);
      }
    } catch (e) {
      console.log('Error loading custom pairs:', e);
    }
  }, []);

  const timeframes = [
    { id: '1m', label: '1 دقيقة ⚡', desc: 'سكالبينج خاطف' },
    { id: '15m', label: '15 دقيقة 🚀', desc: 'صفقة سريعة' },
    { id: '1h', label: '1 ساعة 📊', desc: 'صفقة يومية' },
    { id: '4h', label: '4 ساعات 🎯', desc: 'سوينغ متوسط' },
    { id: '1d', label: 'يومي 🏛️', desc: 'اتجاه عام' }
  ];

  const allAssets = [...defaultAssets, ...customAssets];

  const filteredCoins = allAssets.filter(c => {
    if (activeCategory === 'custom') return c.isCustom;
    const matchesCategory = activeCategory === 'all' || c.category === activeCategory;
    const matchesSearch = c.pair.toLowerCase().includes(search.toLowerCase()) || 
                          c.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Broker-Style Custom Pair Categorization & Addition
  const handleAddCustomPair = () => {
    if (!search || !search.trim()) return;
    const rawSearch = search.trim().toUpperCase();
    let pairFormatted = rawSearch;
    if (!pairFormatted.includes('/') && (pairFormatted.endsWith('USDT') || pairFormatted.endsWith('USD'))) {
      if (pairFormatted.endsWith('USDT')) {
        pairFormatted = pairFormatted.replace('USDT', '') + '/USDT';
      } else if (pairFormatted.endsWith('USD') && !pairFormatted.startsWith('USD')) {
        pairFormatted = pairFormatted.replace('USD', '') + '/USD';
      }
    }

    // Check if pair already exists
    const exists = allAssets.find(a => a.pair.toUpperCase() === pairFormatted);
    if (exists) {
      setSelectedCoin(exists);
      setSearch('');
      setAddToast(`الزوج ${exists.pair} موجود ومحدد بالفعل 🎯`);
      setTimeout(() => setAddToast(''), 2500);
      return;
    }

    // Auto-detect category & icon
    let cat = 'stocks';
    let icon = '⭐️';
    if (pairFormatted.includes('USDT') || pairFormatted.includes('BTC') || pairFormatted.includes('ETH') || pairFormatted.includes('SOL')) {
      cat = 'crypto';
      icon = '₿';
    } else if (pairFormatted.includes('/') && !pairFormatted.includes('XAU') && !pairFormatted.includes('XAG')) {
      cat = 'forex';
      icon = '💶';
    } else if (pairFormatted.includes('XAU') || pairFormatted.includes('XAG') || pairFormatted.includes('OIL') || pairFormatted.includes('WTI') || pairFormatted.includes('BRENT')) {
      cat = 'metals';
      icon = '🥇';
    } else if (pairFormatted.includes('US30') || pairFormatted.includes('NAS') || pairFormatted.includes('SPX') || pairFormatted.includes('GER')) {
      cat = 'indices';
      icon = '📈';
    }

    const newPairObj = {
      pair: pairFormatted,
      name: `${pairFormatted} (زوج مخصص)`,
      symbol: pairFormatted,
      icon: icon,
      category: cat,
      isCustom: true
    };

    const updatedCustoms = [...customAssets, newPairObj];
    setCustomAssets(updatedCustoms);
    try {
      localStorage.setItem('traden_custom_pairs', JSON.stringify(updatedCustoms));
    } catch (e) {}

    setSelectedCoin(newPairObj);
    setSearch('');
    setAddToast(`تمت إضافة الزوج ${pairFormatted} بنجاح! 🚀`);
    setTimeout(() => setAddToast(''), 3000);
  };

  const handleRemoveCustomPair = (pairToRemove, e) => {
    if (e) e.stopPropagation();
    const updatedCustoms = customAssets.filter(c => c.pair !== pairToRemove);
    setCustomAssets(updatedCustoms);
    try {
      localStorage.setItem('traden_custom_pairs', JSON.stringify(updatedCustoms));
    } catch (err) {}
    if (selectedCoin.pair === pairToRemove) {
      setSelectedCoin(defaultAssets[0]);
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setAnalysisResult(null);

    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
      try {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
      } catch (err) {}
    }

    const result = await analyzeStudiedTechnicalSignal(selectedCoin.pair, selectedTimeframe, capital);

    setTimeout(() => {
      setLoading(false);
      setAnalysisResult(result);
    }, 400);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Toast Notification */}
      {addToast && (
        <div style={{
          background: '#10b981',
          color: '#000',
          padding: '10px 16px',
          borderRadius: '12px',
          fontWeight: 'bold',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
        }}>
          <CheckCircle2 size={16} />
          <span>{addToast}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <ChevronRight size={24} />
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>ماسح الأسواق والأزواج 📡</span>
        </button>
      </div>

      {/* Category Pills Bar */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
        {[
          { id: 'forex', label: 'فوركس 💶' },
          { id: 'metals', label: 'معادن ونفط 🥇' },
          { id: 'crypto', label: 'كريبتو ₿' },
          { id: 'indices', label: 'مؤشرات 📈' },
          { id: 'stocks', label: 'أسهم عالمية 🏛️' },
          { id: 'custom', label: `أزواجي ⭐ (${customAssets.length})` },
          { id: 'all', label: 'الجميع 🌐' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              background: activeCategory === cat.id ? '#f59e0b' : 'rgba(255,255,255,0.05)',
              color: activeCategory === cat.id ? '#000' : '#fff',
              border: activeCategory === cat.id ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.08)',
              padding: '6px 14px',
              borderRadius: '16px',
              fontWeight: 'bold',
              fontSize: '12px',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Search Input Box */}
      <div style={{ position: 'relative' }}>
        <Search size={16} color="#9ca3af" style={{ position: 'absolute', right: '12px', top: '12px' }} />
        <input 
          type="text" 
          placeholder="ابحث عن أي زوج... مثال: EUR/USD, SUI/USDT, TSLA, XAU/USD"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '10px 38px 10px 12px', 
            borderRadius: '10px', 
            background: 'rgba(255,255,255,0.06)', 
            border: '1px solid rgba(255,255,255,0.12)', 
            color: '#fff',
            outline: 'none',
            fontSize: '13px'
          }} 
        />
      </div>

      {/* Broker-Style "Add Custom Pair" Action Card */}
      {search && search.trim().length >= 2 && (
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(217, 119, 6, 0.06) 100%)', 
          border: '1px dashed #f59e0b', 
          borderRadius: '12px', 
          padding: '12px 14px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div>
            <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <PlusCircle size={16} color="#f59e0b" />
              <span>إضافة "{search.trim().toUpperCase()}" كزوج جديد ➕</span>
            </div>
            <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
              إضافة الزوج لقائمتك الخاصة وتحليله فوراً كمنصات البروكر العالمية
            </div>
          </div>
          <button 
            onClick={handleAddCustomPair}
            style={{ 
              background: '#f59e0b', 
              color: '#000', 
              fontWeight: 'bold', 
              padding: '8px 14px', 
              borderRadius: '8px', 
              border: 'none', 
              cursor: 'pointer',
              fontSize: '12px',
              whiteSpace: 'nowrap'
            }}
          >
            إضافة وتحليل 🚀
          </button>
        </div>
      )}

      {/* Active Pairs Badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '140px', overflowY: 'auto', paddingRight: '2px' }}>
        {filteredCoins.map((coin, i) => (
          <div
            key={i}
            onClick={() => { setSelectedCoin(coin); setAnalysisResult(null); }}
            style={{ 
              background: selectedCoin.pair === coin.pair ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255,255,255,0.04)', 
              border: `1px solid ${selectedCoin.pair === coin.pair ? '#f59e0b' : 'rgba(255,255,255,0.1)'}`,
              color: selectedCoin.pair === coin.pair ? '#f59e0b' : '#fff',
              borderRadius: '8px',
              padding: '6px 10px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>{coin.pair}</span>
            <span style={{ fontSize: '10px', opacity: 0.7 }}>{coin.icon}</span>
            {coin.isCustom && (
              <Trash2 
                size={12} 
                color="#f87171" 
                style={{ cursor: 'pointer', marginRight: '4px' }} 
                onClick={(e) => handleRemoveCustomPair(coin.pair, e)}
              />
            )}
          </div>
        ))}
      </div>

      {/* Interactive Chart Container */}
      <div style={{ marginTop: '4px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
          <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AssetLogo symbol={selectedCoin.pair} size={18} containerSize={26} />
            <span>{selectedCoin.pair} ({selectedCoin.name})</span>
          </div>
          <div style={{ fontSize: '11px', color: '#9ca3af' }}>مخطط تفاعلي مباشر</div>
        </div>

        {/* Timeframe Selector */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
          {timeframes.map(tf => (
            <button
              key={tf.id}
              onClick={() => { setSelectedTimeframe(tf.id); setAnalysisResult(null); }}
              style={{
                flex: 1,
                background: selectedTimeframe === tf.id ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.03)',
                color: selectedTimeframe === tf.id ? '#f59e0b' : '#9ca3af',
                border: `1px solid ${selectedTimeframe === tf.id ? '#f59e0b' : 'rgba(255,255,255,0.08)'}`,
                padding: '6px 4px',
                borderRadius: '6px',
                fontWeight: 'bold',
                fontSize: '11px',
                cursor: 'pointer',
                textAlign: 'center',
                whiteSpace: 'nowrap'
              }}
            >
              <div>{tf.label}</div>
            </button>
          ))}
        </div>

        <TradingViewWidget symbol={selectedCoin.symbol || selectedCoin.pair} height={420} timeframe={selectedTimeframe} />
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

      {/* Main Analysis Button */}
      <button 
        onClick={handleAnalyze}
        disabled={loading}
        style={{ 
          width: '100%', 
          background: loading ? '#b45309' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
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

      {analysisResult && <RasadAnalysisCard data={analysisResult} />}
    </div>
  );
}
