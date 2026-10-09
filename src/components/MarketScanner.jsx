import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, PlusCircle, Trash2, Sparkles, CheckCircle2, Star, Zap } from 'lucide-react';
import TradingViewWidget from './TradingViewWidget';
import RasadAnalysisCard from './RasadAnalysisCard';
import { AssetLogo } from '../utils/assetLogos';
import { analyzeStudiedTechnicalSignal } from '../utils/priceFetcher';

// Clean Core Default Favorites
const defaultCoreAssets = [
  { pair: 'XAU/USD', name: 'الذهب / Dollar', symbol: 'OANDA:XAUUSD', icon: '🥇', category: 'metals' },
  { pair: 'BTC/USDT', name: 'Bitcoin', symbol: 'BINANCE:BTCUSDT', icon: '₿', category: 'crypto' },
  { pair: 'ETH/USDT', name: 'Ethereum', symbol: 'BINANCE:ETHUSDT', icon: 'Ξ', category: 'crypto' },
  { pair: 'EUR/USD', name: 'يورو / دولار', symbol: 'FX:EURUSD', icon: '💶', category: 'forex' },
  { pair: 'GBP/USD', name: 'جنيه استرليني / دولار', symbol: 'FX:GBPUSD', icon: '💷', category: 'forex' },
  { pair: 'US30', name: 'مؤشر داو جونز', symbol: 'FOREXCOM:US30', icon: '📈', category: 'indices' },
  { pair: 'NVDA', name: 'إنفيديا (Nvidia)', symbol: 'NASDAQ:NVDA', icon: '💚', category: 'stocks' }
];

// Universal Master Market Dictionary (Indices, Forex, Metals, Stocks)
const globalMarketDictionary = [
  // Indices
  { pair: 'US30', name: 'مؤشر داو جونز الأمريكي (Dow Jones)', symbol: 'FOREXCOM:US30', icon: '📈', category: 'indices', price: '$42,850.00', changeStr: '+0.34%', isUp: true },
  { pair: 'NAS100', name: 'مؤشر ناسداك التكنولوجي (Nasdaq 100)', symbol: 'FOREXCOM:NAS100', icon: '💻', category: 'indices', price: '$19,850.00', changeStr: '+0.52%', isUp: true },
  { pair: 'SPX500', name: 'مؤشر S&P 500 الرئيسي', symbol: 'FOREXCOM:SPX500', icon: '📊', category: 'indices', price: '$5,750.00', changeStr: '+0.28%', isUp: true },
  { pair: 'GER40', name: 'مؤشر الداكس الألماني (DAX 40)', symbol: 'FOREXCOM:GER40', icon: '🇩🇪', category: 'indices', price: '$19,250.00', changeStr: '+0.15%', isUp: true },
  { pair: 'UK100', name: 'مؤشر الفوتسي البريطاني (FTSE 100)', symbol: 'FOREXCOM:UK100', icon: '🇬🇧', category: 'indices', price: '$8,280.00', changeStr: '-0.10%', isUp: false },
  { pair: 'JPN225', name: 'مؤشر النيكي الياباني (Nikkei 225)', symbol: 'GLOBALPRIME:JPN225', icon: '🇯🇵', category: 'indices', price: '$38,400.00', changeStr: '+0.40%', isUp: true },

  // Metals & Energy
  { pair: 'XAU/USD', name: 'الذهب مقابل الدولار (Gold Spot)', symbol: 'OANDA:XAUUSD', icon: '🥇', category: 'metals', price: '$4,164.65', changeStr: '+0.18%', isUp: true },
  { pair: 'XAG/USD', name: 'الفضة مقابل الدولار (Silver Spot)', symbol: 'OANDA:XAGUSD', icon: '🥈', category: 'metals', price: '$31.85', changeStr: '+0.76%', isUp: true },
  { pair: 'XPT/USD', name: 'البلاتين (Platinum)', symbol: 'OANDA:XPTUSD', icon: '💎', category: 'metals', price: '$1,778.00', changeStr: '+0.05%', isUp: true },
  { pair: 'WTI', name: 'النفط الخام الأمريكي (WTI Oil)', symbol: 'TVC:USOIL', icon: '🛢️', category: 'metals', price: '$71.40', changeStr: '-0.20%', isUp: false },
  { pair: 'BRENT', name: 'نفط برنت العالمي (Brent Crude Oil)', symbol: 'TVC:UKOIL', icon: '⛽', category: 'metals', price: '$75.20', changeStr: '-0.15%', isUp: false },
  { pair: 'NGAS', name: 'الغاز الطبيعي (Natural Gas)', symbol: 'TVC:NGAS', icon: '🔥', category: 'metals', price: '$2.85', changeStr: '+0.50%', isUp: true },

  // Forex Majors & Crosses
  { pair: 'EUR/USD', name: 'يورو / دولار أمريكي', symbol: 'FX:EURUSD', icon: '💶', category: 'forex', price: '$1.1385', changeStr: '+0.12%', isUp: true },
  { pair: 'GBP/USD', name: 'جنيه استرليني / دولار', symbol: 'FX:GBPUSD', icon: '💷', category: 'forex', price: '$1.3235', changeStr: '+0.08%', isUp: true },
  { pair: 'USD/JPY', name: 'دولار / ين ياباني', symbol: 'FX:USDJPY', icon: '💴', category: 'forex', price: '$157.49', changeStr: '+0.15%', isUp: true },
  { pair: 'AUD/USD', name: 'دولار أسترالي / دولار', symbol: 'FX:AUDUSD', icon: '🇦🇺', category: 'forex', price: '$0.6710', changeStr: '+0.22%', isUp: true },
  { pair: 'USD/CAD', name: 'دولار / دولار كندي', symbol: 'FX:USDCAD', icon: '🇨🇦', category: 'forex', price: '$1.3540', changeStr: '-0.10%', isUp: false },
  { pair: 'USD/CHF', name: 'دولار / فرنك سويسري', symbol: 'FX:USDCHF', icon: '🇨🇭', category: 'forex', price: '$0.8490', changeStr: '-0.05%', isUp: false },
  { pair: 'NZD/USD', name: 'دولار نيوزيلندي / دولار', symbol: 'FX:NZDUSD', icon: '🇳🇿', category: 'forex', price: '$0.6230', changeStr: '+0.18%', isUp: true },
  { pair: 'EUR/GBP', name: 'يورو / جنيه استرليني', symbol: 'FX:EURGBP', icon: '🇪🇺', category: 'forex', price: '$0.8415', changeStr: '+0.04%', isUp: true },
  { pair: 'EUR/JPY', name: 'يورو / ين ياباني', symbol: 'FX:EURJPY', icon: '💶', category: 'forex', price: '$171.10', changeStr: '+0.28%', isUp: true },
  { pair: 'GBP/JPY', name: 'جنيه استرليني / ين', symbol: 'FX:GBPJPY', icon: '💷', category: 'forex', price: '$208.50', changeStr: '+0.24%', isUp: true },
  { pair: 'USD/TRY', name: 'دولار / ليرة تركية', symbol: 'FX:USDTRY', icon: '🇹🇷', category: 'forex', price: '$34.15', changeStr: '+0.45%', isUp: true },
  { pair: 'USD/EGP', name: 'دولار / جنيه مصري', symbol: 'FX:USDEGP', icon: '🇪🇬', category: 'forex', price: '$48.60', changeStr: '+0.10%', isUp: true },
  { pair: 'USD/SAR', name: 'دولار / ريال سعودي', symbol: 'FX:USDSAR', icon: '🇸🇦', category: 'forex', price: '$3.7510', changeStr: '0.00%', isUp: true },
  { pair: 'USD/AED', name: 'دولار / درهم إماراتي', symbol: 'FX:USDAED', icon: '🇦🇪', category: 'forex', price: '$3.6725', changeStr: '0.00%', isUp: true },

  // US Global Stocks
  { pair: 'AAPL', name: 'شركة أبل (Apple Inc.)', symbol: 'NASDAQ:AAPL', icon: '🍎', category: 'stocks', price: '$228.40', changeStr: '+1.20%', isUp: true },
  { pair: 'NVDA', name: 'إنفيديا (Nvidia AI)', symbol: 'NASDAQ:NVDA', icon: '💚', category: 'stocks', price: '$124.50', changeStr: '+3.45%', isUp: true },
  { pair: 'TSLA', name: 'تسلا (Tesla Inc.)', symbol: 'NASDAQ:TSLA', icon: '⚡', category: 'stocks', price: '$245.20', changeStr: '-0.85%', isUp: false },
  { pair: 'MSFT', name: 'مايكروسوفت (Microsoft)', symbol: 'NASDAQ:MSFT', icon: '🪟', category: 'stocks', price: '$448.10', changeStr: '+0.65%', isUp: true },
  { pair: 'AMZN', name: 'أمازون (Amazon)', symbol: 'NASDAQ:AMZN', icon: '📦', category: 'stocks', price: '$186.50', changeStr: '+0.92%', isUp: true },
  { pair: 'META', name: 'ميتا فيسبوك (Meta)', symbol: 'NASDAQ:META', icon: '♾️', category: 'stocks', price: '$512.30', changeStr: '+1.45%', isUp: true },
  { pair: 'GOOGL', name: 'جوجل ألفابت (Alphabet)', symbol: 'NASDAQ:GOOGL', icon: '🔍', category: 'stocks', price: '$178.60', changeStr: '+0.40%', isUp: true },
  { pair: 'AMD', name: 'شركة AMD للمعالجات', symbol: 'NASDAQ:AMD', icon: '💻', category: 'stocks', price: '$156.40', changeStr: '+2.10%', isUp: true },
  { pair: 'COIN', name: 'منصة كوينبيس (Coinbase)', symbol: 'NASDAQ:COIN', icon: '🪙', category: 'stocks', price: '$215.80', changeStr: '+4.20%', isUp: true },
  { pair: 'PLTR', name: 'بالانتير (Palantir AI)', symbol: 'NASDAQ:PLTR', icon: '🛡️', category: 'stocks', price: '$36.50', changeStr: '+2.80%', isUp: true },

  // 🇪🇬 Egyptian Stocks (EGX)
  { pair: 'COMI', name: 'البنك التجاري الدولي (CIB)', symbol: 'EGX:COMI', icon: '🏦', category: 'stocks', price: '84.50 EGP', changeStr: '+2.15%', isUp: true },
  { pair: 'FAWR', name: 'فوري للمدفوعات الرقمية (Fawry)', symbol: 'EGX:FWRY', icon: '💳', category: 'stocks', price: '6.80 EGP', changeStr: '+3.80%', isUp: true },
  { pair: 'TMGH', name: 'مجموعة طلعت مصطفى (TMG)', symbol: 'EGX:TMGH', icon: '🏢', category: 'stocks', price: '64.00 EGP', changeStr: '+3.40%', isUp: true },
  { pair: 'SWDY', name: 'السويدي إليكتريك (Elsewedy)', symbol: 'EGX:SWDY', icon: '⚡', category: 'stocks', price: '48.20 EGP', changeStr: '+1.45%', isUp: true },
  { pair: 'HRHO', name: 'إي إف جي القابضة (هيرميس)', symbol: 'EGX:HRHO', icon: '📊', category: 'stocks', price: '22.80 EGP', changeStr: '+1.65%', isUp: true },
  { pair: 'BTFH', name: 'بلتون المالية القابضة (Beltone)', symbol: 'EGX:BTFH', icon: '📈', category: 'stocks', price: '3.42 EGP', changeStr: '+4.25%', isUp: true },
  { pair: 'ESRS', name: 'حديد عز (Ezz Steel)', symbol: 'EGX:ESRS', icon: '🏗️', category: 'stocks', price: '92.50 EGP', changeStr: '+2.75%', isUp: true },
  { pair: 'EFIN', name: 'إي فاينانس (e-finance)', symbol: 'EGX:EFIN', icon: '💻', category: 'stocks', price: '24.50 EGP', changeStr: '+1.45%', isUp: true },
  { pair: 'ETEL', name: 'المصرية للاتصالات (WE)', symbol: 'EGX:ETEL', icon: '📡', category: 'stocks', price: '38.50 EGP', changeStr: '+1.95%', isUp: true },
  { pair: 'MFPC', name: 'موبكو للأسمدة (Mopco)', symbol: 'EGX:MFPC', icon: '🌾', category: 'stocks', price: '46.50 EGP', changeStr: '+2.20%', isUp: true },
  { pair: 'ABUK', name: 'أبو قير للأسمدة', symbol: 'EGX:ABUK', icon: '🧪', category: 'stocks', price: '58.20 EGP', changeStr: '+1.15%', isUp: true },
  { pair: 'AMOC', name: 'أموك للبترول', symbol: 'EGX:AMOC', icon: '🛢️', category: 'stocks', price: '9.60 EGP', changeStr: '+0.65%', isUp: true },
  { pair: 'AZG', name: 'صندوق أزيموت الذهب (AZ Gold)', symbol: 'OANDA:XAUUSD', icon: '🥇', category: 'metals', price: '4,125 EGP', changeStr: '+0.85%', isUp: true }
];

// Binance Live Search Cache
let binanceTickerCache = null;
let lastCacheFetchTime = 0;

export default function MarketScanner({ onBack }) {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
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

  // Universal Live Search Engine (Global Markets + Binance Crypto Tickers)
  useEffect(() => {
    if (!search || search.trim().length < 1) {
      setSearchResults([]);
      return;
    }

    const query = search.trim().toUpperCase().replace('/', '');
    const queryClean = search.trim().toUpperCase();
    let isCancelled = false;

    const performUnifiedSearch = async () => {
      setIsSearching(true);
      try {
        // 1. Search Global Market Dictionary (Indices, Forex, Metals, Stocks)
        const dictMatches = globalMarketDictionary.filter(item => {
          const pClean = item.pair.toUpperCase().replace('/', '');
          const nClean = item.name.toUpperCase();
          return pClean.includes(query) || nClean.includes(queryClean);
        });

        // 2. Fetch/Query Binance Tickers for Crypto Matches
        let cryptoMatches = [];
        try {
          if (!binanceTickerCache || Date.now() - lastCacheFetchTime > 40000) {
            const res = await fetch('https://api.binance.com/api/v3/ticker/24hr');
            if (res.ok) {
              binanceTickerCache = await res.json();
              lastCacheFetchTime = Date.now();
            }
          }

          if (Array.isArray(binanceTickerCache)) {
            const rawMatches = binanceTickerCache.filter(item => item.symbol.includes(query));
            rawMatches.sort((a, b) => {
              const aUsdt = a.symbol.endsWith('USDT');
              const bUsdt = b.symbol.endsWith('USDT');
              if (aUsdt && !bUsdt) return -1;
              if (!aUsdt && bUsdt) return 1;
              return parseFloat(b.quoteVolume || 0) - parseFloat(a.quoteVolume || 0);
            });

            cryptoMatches = rawMatches.slice(0, 6).map(item => {
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
          }
        } catch (e) {
          console.log('Binance search fallback:', e);
        }

        if (isCancelled) return;

        // Merge dict + crypto matches and deduplicate
        const merged = [...dictMatches, ...cryptoMatches];
        const unique = [];
        const seen = new Set();
        for (const item of merged) {
          if (!seen.has(item.pair)) {
            seen.add(item.pair);
            unique.push(item);
          }
        }

        setSearchResults(unique.slice(0, 8));
      } catch (err) {
        console.log('Search Engine Error:', err);
      } finally {
        if (!isCancelled) setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(performUnifiedSearch, 120);
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
    const exists = userWatchlist.find(a => a.pair.toUpperCase() === assetObj.pair.toUpperCase());
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

      {/* Dynamic Global & Binance Search Input */}
      <div style={{ position: 'relative' }}>
        <Search size={18} color="#f59e0b" style={{ position: 'absolute', right: '14px', top: '13px' }} />
        <input 
          type="text" 
          placeholder="🔍 ابحث عن أي أصل أو مؤشر... (مثال: US30, XAU, BTC, PEPE, NVDA, EUR/USD)"
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

      {/* Live Universal Search Results Panel */}
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
            <span>نتائج البحث المباشرة من بينانس والأسواق العالمية 🌐:</span>
            {isSearching && <span style={{ fontSize: '11px', color: '#9ca3af' }}>جاري الاستعلام...</span>}
          </div>

          {searchResults.length === 0 && !isSearching && (
            <div style={{ textAlign: 'center', padding: '14px', fontSize: '12px', color: '#9ca3af' }}>
              <div>زوج غير مدرج بالقوائم الافتراضية 🔎</div>
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
                style={{ marginTop: '8px', background: '#f59e0b', color: '#000', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
                ➕ تحليل وإضافة "{search.trim().toUpperCase()}" لقائمتي فوراً
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
                    {item.name || item.pair} {item.price ? `· ${item.price}` : ''} {item.changeStr ? <span style={{ color: item.isUp ? '#10b981' : '#f87171', fontWeight: 'bold' }}>{item.changeStr}</span> : ''}
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
          { id: 'indices', label: 'مؤشرات 📈' },
          { id: 'stocks', label: 'أسهم 🏛️' }
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
