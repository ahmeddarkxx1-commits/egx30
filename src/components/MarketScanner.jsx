import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, PlusCircle, Trash2, Sparkles, CheckCircle2, Star, Zap } from 'lucide-react';
import TradingViewWidget from './TradingViewWidget';
import RasadAnalysisCard from './RasadAnalysisCard';
import { AssetLogo } from '../utils/assetLogos';
import { analyzeStudiedTechnicalSignal } from '../utils/priceFetcher';

// Clean & Uncluttered Core Essential Favorites
const defaultCoreAssets = [
  { pair: 'XAU/USD', name: 'الذهب / Dollar', symbol: 'OANDA:XAUUSD', icon: '🥇', category: 'metals' },
  { pair: 'BTC/USDT', name: 'Bitcoin', symbol: 'BINANCE:BTCUSDT', icon: '₿', category: 'crypto' },
  { pair: 'ETH/USDT', name: 'Ethereum', symbol: 'BINANCE:ETHUSDT', icon: 'Ξ', category: 'crypto' },
  { pair: 'EUR/USD', name: 'يورو / دولار', symbol: 'FX:EURUSD', icon: '💶', category: 'forex' },
  { pair: 'GBP/USD', name: 'جنيه استرليني / دولار', symbol: 'FX:GBPUSD', icon: '💷', category: 'forex' },
  { pair: 'US30', name: 'مؤشر داو جونز', symbol: 'GLOBALPRIME:US30', icon: '📈', category: 'indices' },
  { pair: 'NVDA', name: 'إنفيديا (Nvidia)', symbol: 'NASDAQ:NVDA', icon: '💚', category: 'stocks' }
];

// Binance Live Search Cache
let binanceTickerCache = null;
let lastCacheFetchTime = 0;

export default function MarketScanner({ onBack }) {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchingBinance, setIsSearchingBinance] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [userWatchlist, setUserWatchlist] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(defaultCoreAssets[0]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h');
  const [capital, setCapital] = useState(100);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  // Load user's saved watchlist from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('traden_custom_pairs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setUserWatchlist(parsed);
      }
    } catch (e) {
      console.log('Error loading saved watchlist:', e);
    }
  }, []);

  // Dynamic Live Binance Search Query Engine
  useEffect(() => {
    if (!search || search.trim().length < 1) {
      setSearchResults([]);
      return;
    }

    const query = search.trim().toUpperCase().replace('/', '');
    let isCancelled = false;

    const performBinanceSearch = async () => {
      setIsSearchingBinance(true);
      try {
        // Fetch or use cached 24hr Binance tickers
        if (!binanceTickerCache || Date.now() - lastCacheFetchTime > 40000) {
          const res = await fetch('https://api.binance.com/api/v3/ticker/24hr');
          if (res.ok) {
            binanceTickerCache = await res.json();
            lastCacheFetchTime = Date.now();
          }
        }

        if (isCancelled) return;

        if (Array.isArray(binanceTickerCache)) {
          const matches = binanceTickerCache.filter(item => item.symbol.includes(query));

          // Sort: USDT pairs first, then by 24h Volume
          matches.sort((a, b) => {
            const aUsdt = a.symbol.endsWith('USDT');
            const bUsdt = b.symbol.endsWith('USDT');
            if (aUsdt && !bUsdt) return -1;
            if (!aUsdt && bUsdt) return 1;
            return parseFloat(b.quoteVolume || 0) - parseFloat(a.quoteVolume || 0);
          });

          const formatted = matches.slice(0, 7).map(item => {
            let pairName = item.symbol;
            if (item.symbol.endsWith('USDT')) {
              pairName = item.symbol.replace('USDT', '') + '/USDT';
            } else if (item.symbol.endsWith('BTC')) {
              pairName = item.symbol.replace('BTC', '') + '/BTC';
            }
            const pVal = parseFloat(item.lastPrice);
            const cVal = parseFloat(item.priceChangePercent);
            return {
              symbol: `BINANCE:${item.symbol}`,
              pair: pairName,
              name: pairName,
              price: pVal > 100 ? `$${pVal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `$${pVal}`,
              changeStr: `${cVal >= 0 ? '+' : ''}${cVal.toFixed(2)}%`,
              isUp: cVal >= 0,
              icon: '₿',
              category: 'crypto'
            };
          });

          setSearchResults(formatted);
        }
      } catch (err) {
        console.log('Binance Live Search Error:', err);
      } finally {
        if (!isCancelled) setIsSearchingBinance(false);
      }
    };

    const debounceTimer = setTimeout(performBinanceSearch, 150);
    return () => {
      isCancelled = true;
      clearTimeout(debounceTimer);
    };
  }, [search]);

  const timeframes = [
    { id: '1m', label: '1 دقيقة ⚡', desc: 'سكالبينج خاطف' },
    { id: '15m', label: '15 دقيقة 🚀', desc: 'صفقة سريعة' },
    { id: '1h', label: '1 ساعة 📊', desc: 'صفقة يومية' },
    { id: '4h', label: '4 ساعات 🎯', desc: 'سوينغ متوسط' },
    { id: '1d', label: 'يومي 🏛️', desc: 'اتجاه عام' }
  ];

  // Combine Default Core Assets + User Watchlist
  const allWorkspaceAssets = [...defaultCoreAssets, ...userWatchlist];

  const filteredAssets = allWorkspaceAssets.filter(c => {
    if (activeCategory === 'watchlist') return c.isSaved;
    if (activeCategory === 'all') return true;
    return c.category === activeCategory;
  });

  // Save pair to Watchlist
  const handleAddToWatchlist = (assetObj) => {
    const exists = userWatchlist.find(a => a.pair === assetObj.pair);
    if (exists) {
      setSelectedCoin(exists);
      setSearch('');
      setSearchResults([]);
      setToastMsg(`الزوج ${exists.pair} موجود في قائمتك بالفعل ⭐`);
      setTimeout(() => setToastMsg(''), 2500);
      return;
    }

    const newSavedItem = { ...assetObj, isSaved: true };
    const updatedWatchlist = [...userWatchlist, newSavedItem];
    setUserWatchlist(updatedWatchlist);
    try {
      localStorage.setItem('traden_custom_pairs', JSON.stringify(updatedWatchlist));
    } catch (e) {}

    setSelectedCoin(newSavedItem);
    setSearch('');
    setSearchResults([]);
    setToastMsg(`تمت إضافة ${newSavedItem.pair} إلى قائمتك الخاصة! 🚀`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Remove pair from Watchlist
  const handleRemoveFromWatchlist = (pairToRemove, e) => {
    if (e) e.stopPropagation();
    const updatedWatchlist = userWatchlist.filter(c => c.pair !== pairToRemove);
    setUserWatchlist(updatedWatchlist);
    try {
      localStorage.setItem('traden_custom_pairs', JSON.stringify(updatedWatchlist));
    } catch (err) {}
    if (selectedCoin.pair === pairToRemove) {
      setSelectedCoin(defaultCoreAssets[0]);
    }
  };

  // Run AI Analysis
  const handleAnalyze = async (overrideAsset = null) => {
    const targetAsset = overrideAsset || selectedCoin;
    setLoading(true);
    setAnalysisResult(null);

    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
      try {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
      } catch (err) {}
    }

    const result = await analyzeStudiedTechnicalSignal(targetAsset.pair, selectedTimeframe, capital);

    setTimeout(() => {
      setLoading(false);
      setAnalysisResult(result);
    }, 400);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Toast Alert */}
      {toastMsg && (
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
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <ChevronRight size={24} />
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>ماسح بينانس والأسواق اللحظية 📡</span>
        </button>
      </div>

      {/* Dynamic Binance & Global Search Input */}
      <div style={{ position: 'relative' }}>
        <Search size={18} color="#f59e0b" style={{ position: 'absolute', right: '14px', top: '13px' }} />
        <input 
          type="text" 
          placeholder="🔍 ابحث عن أي عملة في Binance أو أزواج الفوركس... (مثال: PEPE, SUI, EUR/USD, XAU)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '12px 42px 12px 14px', 
            borderRadius: '12px', 
            background: 'rgba(255,255,255,0.06)', 
            border: '1px solid rgba(245, 158, 11, 0.3)', 
            color: '#fff',
            outline: 'none',
            fontSize: '13px',
            boxShadow: search ? '0 0 15px rgba(245, 158, 11, 0.2)' : 'none'
          }} 
        />
        {search && (
          <button 
            onClick={() => { setSearch(''); setSearchResults([]); }}
            style={{ position: 'absolute', left: '12px', top: '10px', background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '14px' }}>
            ✕
          </button>
        )}
      </div>

      {/* Live Binance API Search Results Dropdown Panel */}
      {search && (
        <div style={{
          background: '#161b22',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          borderRadius: '12px',
          padding: '12px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#f59e0b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span>نتائج البحث الحية من بينانس والأسواق 🌐:</span>
            {isSearchingBinance && <span style={{ fontSize: '11px', color: '#9ca3af' }}>جاري الاستعلام...</span>}
          </div>

          {searchResults.length === 0 && !isSearchingBinance && (
            <div style={{ textAlign: 'center', padding: '14px', fontSize: '12px', color: '#9ca3af' }}>
              <div>لم نجد نتيجة مطابقة بـ Binance ticker 🔎</div>
              <button 
                onClick={() => {
                  const customObj = {
                    pair: search.trim().toUpperCase(),
                    name: search.trim().toUpperCase(),
                    symbol: search.trim().toUpperCase(),
                    icon: '⭐️',
                    category: 'custom'
                  };
                  handleAddToWatchlist(customObj);
                }}
                style={{ marginTop: '8px', background: '#f59e0b', color: '#000', border: 'none', padding: '6px 14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
                ➕ إضافة "{search.trim().toUpperCase()}" لقائمتي وتحليله فوراً
              </button>
            </div>
          )}

          {searchResults.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                padding: '10px 12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AssetLogo symbol={item.pair} containerSize={30} size={18} />
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#fff' }}>{item.pair}</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                    {item.price} · <span style={{ color: item.isUp ? '#10b981' : '#f87171', fontWeight: 'bold' }}>{item.changeStr}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => {
                    setSelectedCoin(item);
                    setSearch('');
                    setSearchResults([]);
                    handleAnalyze(item);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Zap size={12} />
                  <span>تحليل ⚡</span>
                </button>

                <button
                  onClick={() => handleAddToWatchlist(item)}
                  style={{
                    background: 'rgba(245, 158, 11, 0.18)',
                    color: '#f59e0b',
                    border: '1px solid #f59e0b',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Star size={12} />
                  <span>حفظ ⭐</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Clean Uncluttered Category Bar */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
        {[
          { id: 'all', label: 'الأساسية 🌟' },
          { id: 'watchlist', label: `قائمتي ⭐ (${userWatchlist.length})` },
          { id: 'crypto', label: 'كريبتو ₿' },
          { id: 'forex', label: 'فوركس 💶' },
          { id: 'metals', label: 'معادن 🥇' },
          { id: 'indices', label: 'مؤشرات 📈' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              background: activeCategory === cat.id ? '#f59e0b' : 'rgba(255,255,255,0.04)',
              color: activeCategory === cat.id ? '#000' : '#fff',
              border: `1px solid ${activeCategory === cat.id ? '#f59e0b' : 'rgba(255,255,255,0.08)'}`,
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

      {/* Sleek Active Watchlist Pair Badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {filteredAssets.map((coin, i) => (
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
            <AssetLogo symbol={coin.pair} containerSize={20} size={14} />
            <span>{coin.pair}</span>
            {coin.isSaved && (
              <Trash2 
                size={12} 
                color="#f87171" 
                style={{ cursor: 'pointer', marginRight: '4px' }} 
                onClick={(e) => handleRemoveFromWatchlist(coin.pair, e)}
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
            <span>{selectedCoin.pair} ({selectedCoin.name || selectedCoin.pair})</span>
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

      {/* Capital Input & Risk Calculator Box */}
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

        {/* Custom Capital Input */}
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

      {/* Main Analysis Action Button */}
      <button 
        onClick={() => handleAnalyze()}
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
