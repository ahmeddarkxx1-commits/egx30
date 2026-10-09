import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, Send, CheckCircle2, Search, Star, Zap, Activity, 
  BarChart2, Shield, Bot, Layers, DollarSign, PlusCircle, Trash2,
  TrendingUp, Sparkles, Sliders, ArrowUpRight, X, Globe, Flame,
  Cpu, Check, Eye
} from 'lucide-react';
import TradingViewWidget from './TradingViewWidget';
import RasadAnalysisCard from './RasadAnalysisCard';
import { AssetLogo } from '../utils/assetLogos';
import { analyzeStudiedTechnicalSignal } from '../utils/priceFetcher';

// Pure Global International Categories
const categories = [
  { id: 'trending', label: 'Trending & Hot 🔥', icon: '🔥' },
  { id: 'all', label: 'All Markets 🌐', icon: '🌐' },
  { id: 'metals', label: 'Metals & Energy 🥇', icon: '🥇' },
  { id: 'forex', label: 'Forex Majors 💶', icon: '💶' },
  { id: 'indices', label: 'Indices 📈', icon: '📈' },
  { id: 'crypto', label: 'Crypto ₿', icon: '₿' },
  { id: 'stocks', label: 'US Equities 🇺🇸', icon: '🇺🇸' },
  { id: 'watchlist', label: 'Watchlist ⭐', icon: '⭐' }
];

// Master International Market Dictionary
const globalMarketDictionary = [
  // 1. Metals & Energy
  { pair: 'XAU/USD', name: 'Gold / US Dollar (Spot Gold)', symbol: 'OANDA:XAUUSD', icon: '🥇', category: 'metals', isTrending: true, price: '$4,164.65', changeStr: '+0.18%', isUp: true },
  { pair: 'XAG/USD', name: 'Silver / US Dollar (Spot Silver)', symbol: 'OANDA:XAGUSD', icon: '🥈', category: 'metals', isTrending: true, price: '$31.85', changeStr: '+0.76%', isUp: true },
  { pair: 'XPT/USD', name: 'Platinum (Spot Platinum)', symbol: 'OANDA:XPTUSD', icon: '💎', category: 'metals', price: '$1,778.00', changeStr: '+0.05%', isUp: true },
  { pair: 'WTI', name: 'Crude Oil (WTI Oil)', symbol: 'TVC:USOIL', icon: '🛢️', category: 'metals', isTrending: true, price: '$71.40', changeStr: '-0.20%', isUp: false },
  { pair: 'BRENT', name: 'Brent Crude Oil (Brent)', symbol: 'TVC:UKOIL', icon: '⛽', category: 'metals', price: '$75.20', changeStr: '-0.15%', isUp: false },
  { pair: 'NGAS', name: 'Natural Gas (Henry Hub)', symbol: 'TVC:NGAS', icon: '🔥', category: 'metals', price: '$2.85', changeStr: '+0.50%', isUp: true },

  // 2. Forex Majors & Crosses
  { pair: 'EUR/USD', name: 'EUR / USD (Euro / US Dollar)', symbol: 'FX:EURUSD', icon: '💶', category: 'forex', isTrending: true, price: '$1.1385', changeStr: '+0.12%', isUp: true },
  { pair: 'GBP/USD', name: 'GBP / USD (British Pound)', symbol: 'FX:GBPUSD', icon: '💷', category: 'forex', isTrending: true, price: '$1.3235', changeStr: '+0.08%', isUp: true },
  { pair: 'USD/JPY', name: 'USD / JPY (US Dollar / Yen)', symbol: 'FX:USDJPY', icon: '💴', category: 'forex', isTrending: true, price: '$157.49', changeStr: '+0.15%', isUp: true },
  { pair: 'GBP/JPY', name: 'GBP / JPY (Pound / Yen)', symbol: 'FX:GBPJPY', icon: '💷', category: 'forex', isTrending: true, price: '$208.50', changeStr: '+0.24%', isUp: true },
  { pair: 'AUD/USD', name: 'AUD / USD (Aussie Dollar)', symbol: 'FX:AUDUSD', icon: '🇦🇺', category: 'forex', isTrending: true, price: '$0.6710', changeStr: '+0.22%', isUp: true },
  { pair: 'USD/CAD', name: 'USD / CAD (US Dollar / CAD)', symbol: 'FX:USDCAD', icon: '🇨🇦', category: 'forex', price: '$1.3540', changeStr: '-0.10%', isUp: false },
  { pair: 'USD/CHF', name: 'USD / CHF (US Dollar / Franc)', symbol: 'FX:USDCHF', icon: '🇨🇭', category: 'forex', price: '$0.8490', changeStr: '-0.05%', isUp: false },
  { pair: 'NZD/USD', name: 'NZD / USD (Kiwi Dollar)', symbol: 'FX:NZDUSD', icon: '🇳🇿', category: 'forex', price: '$0.6230', changeStr: '+0.18%', isUp: true },
  { pair: 'EUR/GBP', name: 'EUR / GBP (Euro / Pound)', symbol: 'FX:EURGBP', icon: '🇪🇺', category: 'forex', price: '$0.8415', changeStr: '+0.04%', isUp: true },
  { pair: 'EUR/JPY', name: 'EUR / JPY (Euro / Yen)', symbol: 'FX:EURJPY', icon: '💶', category: 'forex', price: '$171.10', changeStr: '+0.28%', isUp: true },

  // 3. US & Global Indices
  { pair: 'US30', name: 'Dow Jones Industrial (US30)', symbol: 'FOREXCOM:US30', icon: '📈', category: 'indices', isTrending: true, price: '$42,850.00', changeStr: '+0.34%', isUp: true },
  { pair: 'NAS100', name: 'Nasdaq 100 Index (NAS100)', symbol: 'FOREXCOM:NAS100', icon: '💻', category: 'indices', isTrending: true, price: '$19,850.00', changeStr: '+0.52%', isUp: true },
  { pair: 'SPX500', name: 'S&P 500 Index (SPX500)', symbol: 'FOREXCOM:SPX500', icon: '📊', category: 'indices', isTrending: true, price: '$5,750.00', changeStr: '+0.28%', isUp: true },
  { pair: 'GER40', name: 'DAX 40 Index (GER40)', symbol: 'FOREXCOM:GER40', icon: '🇩🇪', category: 'indices', price: '$19,250.00', changeStr: '+0.15%', isUp: true },
  { pair: 'UK100', name: 'FTSE 100 Index (UK100)', symbol: 'FOREXCOM:UK100', icon: '🇬🇧', category: 'indices', price: '$8,280.00', changeStr: '-0.10%', isUp: false },
  { pair: 'JPN225', name: 'Nikkei 225 (JPN225)', symbol: 'GLOBALPRIME:JPN225', icon: '🇯🇵', category: 'indices', price: '$38,400.00', changeStr: '+0.40%', isUp: true },

  // 4. US Wall Street Stocks
  { pair: 'NVDA', name: 'Nvidia Corp. (NVDA)', symbol: 'NASDAQ:NVDA', icon: '💚', category: 'stocks', isTrending: true, price: '$124.50', changeStr: '+3.45%', isUp: true },
  { pair: 'TSLA', name: 'Tesla Inc. (TSLA)', symbol: 'NASDAQ:TSLA', icon: '⚡', category: 'stocks', isTrending: true, price: '$245.20', changeStr: '-0.85%', isUp: false },
  { pair: 'AAPL', name: 'Apple Inc. (AAPL)', symbol: 'NASDAQ:AAPL', icon: '🍎', category: 'stocks', isTrending: true, price: '$228.40', changeStr: '+1.20%', isUp: true },
  { pair: 'PLTR', name: 'Palantir Technologies (PLTR)', symbol: 'NASDAQ:PLTR', icon: '🛡️', category: 'stocks', isTrending: true, price: '$36.50', changeStr: '+2.80%', isUp: true },
  { pair: 'MSFT', name: 'Microsoft Corp. (MSFT)', symbol: 'NASDAQ:MSFT', icon: '🪟', category: 'stocks', price: '$448.10', changeStr: '+0.65%', isUp: true },
  { pair: 'AMZN', name: 'Amazon.com Inc. (AMZN)', symbol: 'NASDAQ:AMZN', icon: '📦', category: 'stocks', price: '$186.50', changeStr: '+0.92%', isUp: true },
  { pair: 'META', name: 'Meta Platforms (META)', symbol: 'NASDAQ:META', icon: '♾️', category: 'stocks', price: '$512.30', changeStr: '+1.45%', isUp: true },
  { pair: 'GOOGL', name: 'Alphabet Inc. (GOOGL)', symbol: 'NASDAQ:GOOGL', icon: '🔍', category: 'stocks', price: '$178.60', changeStr: '+0.40%', isUp: true },
  { pair: 'AMD', name: 'Advanced Micro Devices (AMD)', symbol: 'NASDAQ:AMD', icon: '💻', category: 'stocks', price: '$156.40', changeStr: '+2.10%', isUp: true },
  { pair: 'COIN', name: 'Coinbase Global (COIN)', symbol: 'NASDAQ:COIN', icon: '🪙', category: 'stocks', price: '$215.80', changeStr: '+4.20%', isUp: true },

  // 5. Core Crypto Major Pairs
  { pair: 'BTC/USDT', name: 'Bitcoin / USDT (BTC)', symbol: 'BINANCE:BTCUSDT', icon: '₿', category: 'crypto', isTrending: true, price: '$64,250', changeStr: '+1.85%', isUp: true },
  { pair: 'ETH/USDT', name: 'Ethereum / USDT (ETH)', symbol: 'BINANCE:ETHUSDT', icon: 'Ξ', category: 'crypto', isTrending: true, price: '$2,580', changeStr: '+2.10%', isUp: true },
  { pair: 'SOL/USDT', name: 'Solana / USDT (SOL)', symbol: 'BINANCE:SOLUSDT', icon: '⚡', category: 'crypto', isTrending: true, price: '$154.20', changeStr: '+4.30%', isUp: true },
  { pair: 'PEPE/USDT', name: 'Pepe / USDT (PEPE)', symbol: 'BINANCE:PEPEUSDT', icon: '🐸', category: 'crypto', isTrending: true, price: '$0.000009', changeStr: '+8.40%', isUp: true },
  { pair: 'DOGE/USDT', name: 'Dogecoin / USDT (DOGE)', symbol: 'BINANCE:DOGEUSDT', icon: '🐕', category: 'crypto', isTrending: true, price: '$0.115', changeStr: '+3.20%', isUp: true },
  { pair: 'BNB/USDT', name: 'BNB / USDT (Binance Coin)', symbol: 'BINANCE:BNBUSDT', icon: '🟡', category: 'crypto', price: '$585.00', changeStr: '+0.80%', isUp: true },
  { pair: 'XRP/USDT', name: 'XRP / USDT (Ripple)', symbol: 'BINANCE:XRPUSDT', icon: '💧', category: 'crypto', price: '$0.585', changeStr: '+1.15%', isUp: true }
];

const defaultCoreAssets = globalMarketDictionary;

// Binance Live Ticker Cache
let binanceTickerCache = null;
let lastCacheFetchTime = 0;

const timeframes = [
  { id: '1m', label: '1m ⚡', desc: 'Scalping' },
  { id: '5m', label: '5m 🚀', desc: 'Fast' },
  { id: '15m', label: '15m 🎯', desc: 'Intraday' },
  { id: '1h', label: '1h 📊', desc: 'Hourly' },
  { id: '4h', label: '4h 🏛️', desc: 'Swing' },
  { id: '1d', label: '1d 💎', desc: 'Macro' }
];

export default function SignalBot({ onBack, initialSymbol }) {
  const [selectedCategory, setSelectedCategory] = useState('trending');
  const [mobileTab, setMobileTab] = useState('signals'); // 'signals' | 'chart'
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const [customPairInput, setCustomPairInput] = useState('');
  const [userWatchlist, setUserWatchlist] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(defaultCoreAssets[0]); // Gold XAU/USD
  const [timeframe, setTimeframe] = useState('15m');
  const [capital, setCapital] = useState(100);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [toastMsg, setToastMsg] = useState('');

  // Load user's saved watchlist from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('traden_custom_pairs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setUserWatchlist(parsed);
      }
    } catch (e) {}
  }, []);

  // Handle initial symbol navigation
  useEffect(() => {
    if (initialSymbol) {
      const found = globalMarketDictionary.find(a => 
        a.pair.toUpperCase() === initialSymbol.toUpperCase() || 
        a.symbol?.toUpperCase() === initialSymbol.toUpperCase() ||
        a.pair.toUpperCase().replace('/', '') === initialSymbol.toUpperCase().replace('/', '')
      );
      if (found) {
        setSelectedAsset(found);
      } else {
        setSelectedAsset({
          pair: initialSymbol,
          name: initialSymbol,
          symbol: initialSymbol,
          icon: '⚡',
          category: 'crypto'
        });
      }
      setAnalysisResult(null);
    }
  }, [initialSymbol]);

  // Universal Live Search Engine (Global Markets + Binance Crypto Tickers)
  useEffect(() => {
    if (!search || search.trim().length < 1) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const query = search.trim().toUpperCase().replace('/', '');
    const queryClean = search.trim().toUpperCase();
    let isCancelled = false;

    const performUnifiedSearch = async () => {
      setIsSearching(true);
      try {
        const dictMatches = globalMarketDictionary.filter(item => {
          const pClean = item.pair.toUpperCase().replace('/', '');
          const nClean = item.name.toUpperCase();
          return pClean.includes(query) || nClean.includes(queryClean) || item.pair.toUpperCase().includes(queryClean);
        });

        let cryptoMatches = [];
        try {
          if (!binanceTickerCache || Date.now() - lastCacheFetchTime > 45000) {
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

            cryptoMatches = rawMatches.slice(0, 8).map(item => {
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
                name: `${pairName} (Binance)`,
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

        const merged = [...dictMatches, ...cryptoMatches];
        const unique = [];
        const seen = new Set();
        for (const item of merged) {
          if (!seen.has(item.pair)) {
            seen.add(item.pair);
            unique.push(item);
          }
        }

        setSearchResults(unique.slice(0, 10));
      } catch (err) {
        console.log('Search Engine Error:', err);
      } finally {
        if (!isCancelled) setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(performUnifiedSearch, 100);
    return () => {
      isCancelled = true;
      clearTimeout(debounceTimer);
    };
  }, [search]);

  // Combine Default Core Assets + User Watchlist
  const allWorkspaceAssets = [...defaultCoreAssets, ...userWatchlist.filter(w => !defaultCoreAssets.some(d => d.pair === w.pair))];

  const filteredAssets = allWorkspaceAssets.filter(item => {
    if (selectedCategory === 'watchlist') return userWatchlist.some(w => w.pair === item.pair);
    if (selectedCategory === 'trending') return item.isTrending || userWatchlist.some(w => w.pair === item.pair);
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  // Add/Remove Watchlist
  const toggleWatchlist = (assetObj, e) => {
    if (e) e.stopPropagation();
    const isSaved = userWatchlist.some(a => a.pair === assetObj.pair);
    let updated;
    if (isSaved) {
      updated = userWatchlist.filter(a => a.pair !== assetObj.pair);
      setToastMsg(`Removed ${assetObj.pair} from Watchlist`);
    } else {
      updated = [...userWatchlist, { ...assetObj, isSaved: true }];
      setToastMsg(`Added ${assetObj.pair} to Watchlist ⭐`);
    }
    setUserWatchlist(updated);
    try {
      localStorage.setItem('traden_custom_pairs', JSON.stringify(updated));
    } catch (e) {}
    setTimeout(() => setToastMsg(''), 2500);
  };

  // Add custom manual pair
  const handleAddManualCustomPair = (pairName) => {
    const cleanName = pairName.trim().toUpperCase();
    if (!cleanName) return;

    let symbol = cleanName;
    if (!symbol.includes(':')) {
      if (symbol.endsWith('USDT') || symbol.includes('/USDT')) {
        symbol = `BINANCE:${symbol.replace('/', '')}`;
      } else if (['US30', 'NAS100', 'SPX500', 'GER40', 'UK100'].includes(symbol)) {
        symbol = `FOREXCOM:${symbol}`;
      } else if (['XAUUSD', 'XAU/USD', 'GOLD'].includes(symbol)) {
        symbol = `OANDA:XAUUSD`;
      } else if (symbol.includes('/') || symbol.length === 6) {
        symbol = `FX:${symbol.replace('/', '')}`;
      }
    }

    const customObj = {
      pair: cleanName,
      name: cleanName,
      symbol: symbol,
      icon: '⭐️',
      category: 'watchlist',
      isSaved: true
    };

    const isAlreadySaved = userWatchlist.some(a => a.pair === cleanName);
    if (!isAlreadySaved) {
      const updated = [...userWatchlist, customObj];
      setUserWatchlist(updated);
      try {
        localStorage.setItem('traden_custom_pairs', JSON.stringify(updated));
      } catch (e) {}
    }

    setSelectedAsset(customObj);
    setSearch('');
    setSearchResults([]);
    setShowAddCustomModal(false);
    setCustomPairInput('');
    setAnalysisResult(null);
    setToastMsg(`Added ${cleanName} to watchlist. Click "Generate Signal" to analyze! 🚀`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Multi-Step Interactive Institutional AI Analysis Engine
  const startInstitutionalAnalysis = async (targetAssetOverride = null) => {
    const asset = targetAssetOverride || selectedAsset;
    setLoading(true);
    setAnalysisResult(null);
    setAnalysisStep(1);

    if (window.Telegram?.WebApp?.HapticFeedback) {
      try { window.Telegram.WebApp.HapticFeedback.impactOccurred('medium'); } catch (e) {}
    }

    // Step 1: Market Liquidity & Orderflow (0.4s)
    setTimeout(() => { setAnalysisStep(2); }, 500);
    // Step 2: Momentum & Indicators (0.9s)
    setTimeout(() => { setAnalysisStep(3); }, 1000);
    // Step 3: AI Committee Consensus & Sizing (1.4s)
    setTimeout(() => { setAnalysisStep(4); }, 1500);

    try {
      const result = await analyzeStudiedTechnicalSignal(asset.pair, timeframe, capital);
      
      setTimeout(() => {
        setAnalysisResult(result);
        setLoading(false);
        setAnalysisStep(0);
        if (window.Telegram?.WebApp?.HapticFeedback) {
          try { window.Telegram.WebApp.HapticFeedback.notificationOccurred('success'); } catch (e) {}
        }
      }, 1900);
    } catch (error) {
      console.error("Analysis Execution Error:", error);
      setLoading(false);
      setAnalysisStep(0);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', direction: 'ltr' }}>
      
      {/* 1. Header & Asset Selector Bar (Compact & Mobile-Optimized) */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(13, 18, 28, 0.9) 0%, rgba(17, 24, 39, 0.96) 100%)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '16px',
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.35)'
      }}>
        {/* Top Header: Compact Title & Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '7px',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(37, 99, 235, 0.35))',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Bot size={14} color="#38bdf8" />
            </div>
            <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#fff' }}>
              Market Scanner
            </span>
            <span style={{ fontSize: '9px', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '1px 5px', borderRadius: '4px', fontWeight: '800' }}>
              PRO AI
            </span>
          </div>

          {onBack && (
            <button 
              onClick={onBack}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#94a3b8',
                borderRadius: '6px',
                padding: '3px 8px',
                cursor: 'pointer',
                fontSize: '10.5px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                flexShrink: 0
              }}
            >
              <ChevronRight size={12} style={{ transform: 'rotate(180deg)' }} />
              <span>الرئيسية</span>
            </button>
          )}
        </div>

        {/* Categories Tabs in smooth swipe strip */}
        <div className="no-scrollbar" style={{ display: 'flex', gap: '5px', overflowX: 'auto', width: '100%', paddingBottom: '2px' }}>
          {categories.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  background: isSelected 
                    ? (cat.id === 'trending' ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(239, 68, 68, 0.25))' : 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(37, 99, 235, 0.2))')
                    : 'rgba(255,255,255,0.03)',
                  border: isSelected 
                    ? (cat.id === 'trending' ? '1px solid #f59e0b' : '1px solid #38bdf8') 
                    : '1px solid rgba(255,255,255,0.07)',
                  color: isSelected 
                    ? (cat.id === 'trending' ? '#f59e0b' : '#38bdf8') 
                    : 'var(--text-secondary)',
                  padding: '4px 10px',
                  borderRadius: '7px',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Search & Add in clean responsive row */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', width: '100%' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={13} color="#f59e0b" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search ticker, forex pair, crypto, or US stock..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                height: '34px',
                padding: '0 26px 0 30px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.05)',
                border: search ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                outline: 'none',
                fontSize: '11.5px',
                boxSizing: 'border-box'
              }}
            />
            {search && (
              <button 
                onClick={() => { setSearch(''); setSearchResults([]); }}
                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <X size={13} />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowAddCustomModal(!showAddCustomModal)}
            style={{
              background: showAddCustomModal ? '#f59e0b' : 'rgba(245, 158, 11, 0.12)',
              border: '1px solid #f59e0b',
              color: showAddCustomModal ? '#000' : '#f59e0b',
              borderRadius: '8px',
              height: '34px',
              padding: '0 10px',
              fontSize: '11px',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            <PlusCircle size={13} />
            <span>Add Custom</span>
          </button>
        </div>

        {/* Custom Pair Input Dropdown */}
        {showAddCustomModal && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(17, 24, 39, 0.95) 100%)',
            border: '1px solid #f59e0b',
            borderRadius: '10px',
            padding: '8px 10px',
            display: 'flex',
            gap: '6px'
          }}>
            <input
              type="text"
              value={customPairInput}
              onChange={(e) => setCustomPairInput(e.target.value)}
              placeholder="Symbol (e.g. SOL/USDT, GBP/JPY, US30, or NVDA)..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddManualCustomPair(customPairInput);
              }}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '7px',
                padding: '6px 10px',
                color: '#fff',
                fontSize: '11.5px',
                fontWeight: '700',
                outline: 'none'
              }}
            />
            <button
              onClick={() => handleAddManualCustomPair(customPairInput)}
              style={{
                background: '#f59e0b',
                color: '#000',
                border: 'none',
                borderRadius: '7px',
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              Add 🚀
            </button>
          </div>
        )}

        {/* Live Search Results Dropdown */}
        {search.trim().length > 0 && (
          <div style={{
            background: '#161b22',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            borderRadius: '10px',
            padding: '8px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            zIndex: 30
          }}>
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#f59e0b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Live Search Matches 🌐:</span>
              {isSearching && <span style={{ fontSize: '10px', color: '#9ca3af' }}>Querying feeds...</span>}
            </div>

            {/* Custom add prompt */}
            <div style={{ textAlign: 'center', padding: '5px', background: 'rgba(245, 158, 11, 0.08)', borderRadius: '6px', border: '1px dashed rgba(245, 158, 11, 0.3)' }}>
              <button 
                onClick={() => handleAddManualCustomPair(search)}
                style={{
                  background: '#f59e0b',
                  color: '#000',
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontWeight: '800',
                  fontSize: '10.5px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <PlusCircle size={12} />
                <span>Add & Analyze "{search.trim().toUpperCase()}" ➕</span>
              </button>
            </div>

            {searchResults.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '7px',
                  padding: '6px 8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AssetLogo symbol={item.pair} containerSize={22} size={13} />
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '11.5px', color: '#fff' }}>{item.pair}</div>
                    <div style={{ fontSize: '9.5px', color: '#9ca3af' }}>
                      {item.price ? `${item.price}` : ''} {item.changeStr ? <span style={{ color: item.isUp ? '#10b981' : '#f87171', fontWeight: 'bold' }}>{item.changeStr}</span> : ''}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => {
                      setSelectedAsset(item);
                      setSearch('');
                      setSearchResults([]);
                      setMobileTab('signals');
                      startInstitutionalAnalysis(item);
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '5px',
                      padding: '4px 8px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Analyze ⚡
                  </button>

                  <button
                    onClick={(e) => toggleWatchlist(item, e)}
                    style={{
                      background: 'rgba(245, 158, 11, 0.18)',
                      color: '#f59e0b',
                      border: '1px solid #f59e0b',
                      borderRadius: '5px',
                      padding: '4px 6px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    ⭐
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Compact Horizontal Asset Pills Strip */}
        <div className="no-scrollbar" style={{
          display: 'flex',
          gap: '5px',
          overflowX: 'auto',
          paddingBottom: '2px',
          width: '100%'
        }}>
          {filteredAssets.map(item => {
            const isSelected = selectedAsset.pair === item.pair;
            const isSaved = userWatchlist.some(w => w.pair === item.pair);

            return (
              <div
                key={item.pair}
                onClick={() => { 
                  setSelectedAsset(item); 
                  setAnalysisResult(null); 
                }}
                style={{
                  background: isSelected 
                    ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.25) 0%, rgba(17, 24, 39, 0.9) 100%)' 
                    : 'rgba(255, 255, 255, 0.03)',
                  border: isSelected ? '1.5px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.07)',
                  borderRadius: '7px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'all 0.15s ease'
                }}
              >
                <AssetLogo symbol={item.pair} containerSize={16} size={11} fallbackIcon={item.icon} />
                <span style={{ fontSize: '11px', fontWeight: '800', color: isSelected ? '#38bdf8' : '#fff' }}>
                  {item.pair}
                </span>

                <button
                  onClick={(e) => toggleWatchlist(item, e)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: isSaved ? '#f59e0b' : 'rgba(255,255,255,0.2)',
                    cursor: 'pointer',
                    padding: '0',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Star size={10} fill={isSaved ? '#f59e0b' : 'none'} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.2)',
          border: '1px solid #10b981',
          color: '#34d399',
          padding: '6px 12px',
          borderRadius: '8px',
          fontSize: '11px',
          fontWeight: '700',
          textAlign: 'center'
        }}>
          {toastMsg}
        </div>
      )}

      {/* 2. Mobile Segmented Tab Switcher (Visible on Mobile Only) */}
      <div className="mobile-workbench-tabs">
        <button 
          className={`mobile-tab-btn ${mobileTab === 'signals' ? 'active' : ''}`}
          onClick={() => setMobileTab('signals')}
        >
          <Zap size={14} />
          <span>⚡ Analysis & Setup</span>
          {analysisResult && (
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
          )}
        </button>
        <button 
          className={`mobile-tab-btn ${mobileTab === 'chart' ? 'active' : ''}`}
          onClick={() => setMobileTab('chart')}
        >
          <BarChart2 size={14} />
          <span>📊 Live Chart</span>
        </button>
      </div>

      {/* 3. THE PRO SPLIT TRADING WORKBENCH (Desktop: 2 Columns / Mobile: Segmented View) */}
      <div className="workbench-split-grid">
        
        {/* TradingView Chart Pane */}
        <div className={`workbench-chart-pane ${mobileTab !== 'chart' ? 'mobile-hidden' : ''}`}>
          <div style={{
            background: 'rgba(13, 18, 28, 0.7)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '10px 12px',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AssetLogo symbol={selectedAsset.pair} containerSize={22} size={14} fallbackIcon={selectedAsset.icon || '🌐'} />
                <span style={{ fontSize: '13px', fontWeight: '800', color: '#fff' }}>
                  {selectedAsset.name || selectedAsset.pair}
                </span>
                <span style={{ fontSize: '9.5px', color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '1px 5px', borderRadius: '4px', fontWeight: '700' }}>
                  LIVE 🟢
                </span>
              </div>

              {/* Timeframe Bar */}
              <div style={{ display: 'flex', gap: '3px', overflowX: 'auto' }} className="no-scrollbar">
                {timeframes.map(tf => (
                  <button
                    key={tf.id}
                    onClick={() => {
                      setTimeframe(tf.id);
                      setAnalysisResult(null);
                    }}
                    style={{
                      background: timeframe === tf.id ? '#2563eb' : 'rgba(255,255,255,0.04)',
                      border: timeframe === tf.id ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.06)',
                      color: timeframe === tf.id ? '#fff' : 'var(--text-secondary)',
                      borderRadius: '5px',
                      padding: '2px 7px',
                      fontSize: '10px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>

            <TradingViewWidget
              symbol={selectedAsset.symbol || selectedAsset.pair}
              timeframe={timeframe}
              height={420}
            />

            {/* Quick action button under chart on mobile */}
            <div className="mobile-chart-bottom-cta">
              <button 
                onClick={() => {
                  setMobileTab('signals');
                  startInstitutionalAnalysis();
                }}
                style={{
                  width: '100%',
                  marginTop: '10px',
                  background: 'linear-gradient(135deg, #2563eb 0%, #10b981 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '11px 14px',
                  fontSize: '13px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 15px rgba(37,99,235,0.4)'
                }}
              >
                <Zap size={16} />
                <span>Analyze {selectedAsset.pair} & Generate Signal Now ⚡</span>
              </button>
            </div>
          </div>
        </div>

        {/* Side Pane: Sizing, Execution Engine & Instant Results */}
        <div className={`workbench-side-pane ${mobileTab !== 'signals' ? 'mobile-hidden' : ''}`}>
          
          {/* Capital Sizing & Trigger Card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(13, 18, 28, 0.9) 0%, rgba(17, 24, 39, 0.95) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            borderRadius: '16px',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
              <div style={{ fontSize: '12px', fontWeight: '800', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Sliders size={13} color="#f59e0b" />
                <span>Capital & Risk Sizing:</span>
              </div>

              {/* Quick Presets */}
              <div style={{ display: 'flex', gap: '3px', overflowX: 'auto' }} className="no-scrollbar">
                {[100, 250, 500, 1000, 2500].map(amt => (
                  <button
                    key={amt}
                    onClick={() => setCapital(amt)}
                    style={{
                      background: capital === Number(amt) ? '#f59e0b' : 'rgba(255,255,255,0.05)',
                      color: capital === Number(amt) ? '#000' : 'var(--text-secondary)',
                      border: capital === Number(amt) ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '10px',
                      padding: '2px 7px',
                      fontSize: '9.5px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Input & Action Button in 1 compact block */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type="number"
                value={capital}
                onChange={(e) => setCapital(Number(e.target.value))}
                placeholder="Capital ($)..."
                style={{
                  width: '85px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  padding: '7px 8px',
                  color: '#fff',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  outline: 'none',
                  textAlign: 'center'
                }}
              />

              <button
                onClick={() => startInstitutionalAnalysis()}
                disabled={loading}
                style={{
                  flex: 1,
                  background: '#3a4766',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '100px',
                  padding: '12px 18px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(58, 71, 102, 0.3)',
                  transition: 'all 0.2s ease',
                  opacity: loading ? 0.75 : 1
                }}
              >
                <Zap size={15} />
                <span>
                  {loading 
                    ? `Scanning ${selectedAsset.pair}...` 
                    : `Generate ${selectedAsset.pair} AI Setup ⚡`}
                </span>
                <ArrowUpRight size={14} style={{ marginLeft: 'auto' }} />
              </button>
            </div>
          </div>

          {/* Interactive Multi-Step AI Analysis Progress Card */}
          {loading && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(13, 18, 28, 0.95) 0%, rgba(17, 24, 39, 0.98) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              borderRadius: '16px',
              padding: '16px 14px',
              boxShadow: '0 10px 35px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="pulse-dot" style={{ width: '10px', height: '10px', background: '#38bdf8' }}></div>
                  <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#fff' }}>
                    Scanning {selectedAsset.pair} ({timeframe})
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: '800' }}>
                  {analysisStep === 1 ? '25%' : analysisStep === 2 ? '50%' : analysisStep === 3 ? '75%' : '100%'}
                </span>
              </div>

              {/* Progress Bar */}
              <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{
                  width: analysisStep === 1 ? '25%' : analysisStep === 2 ? '50%' : analysisStep === 3 ? '75%' : '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, #38bdf8 0%, #10b981 100%)',
                  borderRadius: '10px',
                  transition: 'width 0.4s ease'
                }}></div>
              </div>

              {/* Timeline Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: analysisStep >= 1 ? 1 : 0.4, fontSize: '11px', color: analysisStep === 1 ? '#38bdf8' : '#e2e8f0', fontWeight: analysisStep === 1 ? '800' : '600' }}>
                  <span>{analysisStep > 1 ? '✅' : '📡'}</span>
                  <span>Fetching live candles, market structure, and liquidity pools</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: analysisStep >= 2 ? 1 : 0.4, fontSize: '11px', color: analysisStep === 2 ? '#38bdf8' : '#e2e8f0', fontWeight: analysisStep === 2 ? '800' : '600' }}>
                  <span>{analysisStep > 2 ? '✅' : '📊'}</span>
                  <span>Computing indicators & oscillators (RSI, MACD, EMA 200)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: analysisStep >= 3 ? 1 : 0.4, fontSize: '11px', color: analysisStep === 3 ? '#38bdf8' : '#e2e8f0', fontWeight: analysisStep === 3 ? '800' : '600' }}>
                  <span>{analysisStep > 3 ? '✅' : '🤖'}</span>
                  <span>Evaluating Institutional Multi-Engine Consensus Matrix</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: analysisStep >= 4 ? 1 : 0.4, fontSize: '11px', color: analysisStep === 4 ? '#10b981' : '#e2e8f0', fontWeight: analysisStep === 4 ? '800' : '600' }}>
                  <span>{analysisStep === 4 ? '✅' : '🛡️'}</span>
                  <span>Calculating precision entry, TP1/TP2 targets, SL & lot size</span>
                </div>
              </div>
            </div>
          )}

          {/* Instant AI Consensus Result Card */}
          {analysisResult && !loading && (
            <RasadAnalysisCard 
              data={analysisResult}
              result={analysisResult} 
              asset={selectedAsset.pair} 
              timeframe={timeframe} 
              capital={capital} 
            />
          )}

          {/* Placeholder state when not analyzed yet */}
          {!analysisResult && !loading && (
            <div style={{
              background: 'rgba(13, 18, 28, 0.6)',
              border: '1px dashed rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '20px 14px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(56, 189, 248, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8'
              }}>
                <Zap size={18} />
              </div>
              <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#fff' }}>
                Ready to scan {selectedAsset.pair} ({timeframe})
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                Click "Generate AI Setup" above to execute institutional algorithms and calculate entry, stop-loss, and multi-targets.
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
