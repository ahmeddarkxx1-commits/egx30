import { useState, useEffect } from 'react';
import { Bot, BarChart2, Bell, Shield, Activity, Zap, Lock, Key, CheckCircle, Send, Sparkles } from 'lucide-react';
import { fetchLiveAssetTicker } from './utils/priceFetcher';
import MarketScanner from './components/MarketScanner';
import SignalBot from './components/SignalBot';
import MarketNews from './components/MarketNews';
import TradenRadar from './components/TradenRadar';
import PreciousMetals from './components/PreciousMetals';
import HalalGuide from './components/HalalGuide';
import InvestmentBot from './components/InvestmentBot';
import GoldLiquidityRadar from './components/GoldLiquidityRadar';
import EgxAnalysis from './components/EgxAnalysis';
import './App.css';

// Admin / Allowed User IDs or Master Activation Code
const MASTER_VIP_CODE = 'TRADEN2026';
const WHITELISTED_TELEGRAM_IDS = [1914514519, 12345678, 87654321]; // Admin Telegram ID added!

function LiveMarketWidget({ onOpenBot }) {
  const [activeAsset, setActiveAsset] = useState('BTC/USDT');
  const [tickerData, setTickerData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async (symbol) => {
    setLoading(true);
    try {
      const data = await fetchLiveAssetTicker(symbol);
      setTickerData(data);
    } catch (e) {
      console.error('Failed fetching live ticker for widget:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(activeAsset);
    const interval = setInterval(() => loadData(activeAsset), 10000);
    return () => clearInterval(interval);
  }, [activeAsset]);

  const priceFormatted = tickerData?.price 
    ? (tickerData.price >= 1000 ? '$' + tickerData.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '$' + tickerData.price)
    : '...';

  const changeVal = tickerData?.change24h || 0;
  const isUp = changeVal >= 0;
  const highVal = tickerData?.high24h ? '$' + tickerData.high24h.toLocaleString() : (tickerData?.price ? '$' + (tickerData.price * 1.012).toFixed(2) : '...');
  const lowVal = tickerData?.low24h ? '$' + tickerData.low24h.toLocaleString() : (tickerData?.price ? '$' + (tickerData.price * 0.988).toFixed(2) : '...');
  
  const trendText = changeVal > 0.15 ? 'صاعد 📈' : changeVal < -0.15 ? 'هابط 📉' : 'عرضي ⚖️';
  const trendColor = changeVal > 0.15 ? '#10b981' : changeVal < -0.15 ? '#ef4444' : '#f59e0b';

  return (
    <section className="chart-container" style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '16px', padding: '16px', marginBottom: '20px' }}>
      
      {/* Asset Switcher Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', borderBottom: '1px solid #21262d', paddingBottom: '10px' }}>
        {[
          { symbol: 'BTC/USDT', label: '₿ البيتكوين' },
          { symbol: 'XAU/USD', label: '🥇 الذهب' },
          { symbol: 'EUR/USD', label: '💶 اليورو' },
        ].map(item => (
          <button
            key={item.symbol}
            onClick={() => setActiveAsset(item.symbol)}
            style={{
              background: activeAsset === item.symbol ? '#1f6beb' : '#21262d',
              color: '#fff',
              border: activeAsset === item.symbol ? '1px solid #388bfd' : '1px solid #30363d',
              borderRadius: '20px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Main Header */}
      <div className="chart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="price" style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#f0f6fc' }}>
            {loading && !tickerData ? 'جاري التحميل...' : priceFormatted}
          </div>
          <div className="price-sub" style={{ fontSize: '0.85rem', color: '#8b949e', marginTop: '2px' }}>
            {activeAsset} · أسعار لحظية (Live 24h)
          </div>
        </div>
        <div 
          className={isUp ? "trend-up" : "trend-down"}
          style={{
            background: isUp ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: isUp ? '#3fb950' : '#f85149',
            border: `1px solid ${isUp ? '#2ea043' : '#f85149'}`,
            padding: '6px 12px',
            borderRadius: '20px',
            fontWeight: 'bold',
            fontSize: '0.85rem'
          }}
        >
          {isUp ? '▲ +' : '▼ '}{changeVal.toFixed(2)}%
        </div>
      </div>
      
      {/* Dynamic Sparkline Wave SVG */}
      <div style={{ height: '60px', width: '100%', margin: '15px 0', position: 'relative' }}>
         <svg viewBox="0 0 100 20" preserveAspectRatio="none" style={{ width: '100%', height: '100%', stroke: isUp ? '#10b981' : '#ef4444', strokeWidth: 2, fill: 'none' }}>
            <path d={isUp ? "M0,16 Q20,14 40,8 T70,10 T100,2" : "M0,4 Q20,6 40,12 T70,10 T100,18"} />
         </svg>
      </div>

      {/* Stats Cards */}
      <div className="chart-stats" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
        <div className="stat-box" style={{ background: '#0d1117', padding: '10px', borderRadius: '8px', border: '1px solid #21262d', textAlign: 'center' }}>
          <div className="stat-title" style={{ fontSize: '0.75rem', color: '#8b949e' }}>أدنى 24h</div>
          <div className="stat-val" style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#c9d1d9', marginTop: '2px' }}>{lowVal}</div>
        </div>
        <div className="stat-box" style={{ background: '#0d1117', padding: '10px', borderRadius: '8px', border: '1px solid #21262d', textAlign: 'center' }}>
          <div className="stat-title" style={{ fontSize: '0.75rem', color: '#8b949e' }}>أعلى 24h</div>
          <div className="stat-val" style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#c9d1d9', marginTop: '2px' }}>{highVal}</div>
        </div>
        <div className="stat-box" style={{ background: '#0d1117', padding: '10px', borderRadius: '8px', border: '1px solid #21262d', textAlign: 'center' }}>
          <div className="stat-title" style={{ fontSize: '0.75rem', color: '#8b949e' }}>الاتجاه</div>
          <div className="stat-val" style={{ fontSize: '0.9rem', fontWeight: 'bold', color: trendColor, marginTop: '2px' }}>{trendText}</div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={() => onOpenBot(activeAsset)}
        style={{
          width: '100%',
          marginTop: '15px',
          background: 'linear-gradient(135deg, #1f6beb 0%, #238636 100%)',
          color: '#ffffff',
          border: 'none',
          borderRadius: '10px',
          padding: '12px',
          fontWeight: 'bold',
          fontSize: '0.9rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: '0 4px 12px rgba(31, 107, 235, 0.3)'
        }}
      >
        <span>🤖 تحليل وتوليد صفقات لـ {activeAsset}</span>
      </button>

    </section>
  );
}

function App() {
  const [tgUser, setTgUser] = useState(null);
  const [currentView, setCurrentView] = useState('home');
  const [selectedSymbol, setSelectedSymbol] = useState('BTC/USDT');
  
  // Authorization state
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activationInput, setActivationInput] = useState('');
  const [activationError, setActivationError] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.expand();
      if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const u = tg.initDataUnsafe.user;
        setTgUser(u);
        
        const userStorageKey = `traden_user_authorized_${u.id}`;
        const storedUserAuth = localStorage.getItem(userStorageKey);

        // Check if current user is admin OR previously activated this specific ID
        if (WHITELISTED_TELEGRAM_IDS.includes(u.id) || u.id === 1914514519 || storedUserAuth === 'true') {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } else {
        // Standalone browser without Telegram user context
        const storedAuth = localStorage.getItem('traden_user_authorized_browser');
        if (storedAuth === 'true') {
          setIsAuthorized(true);
        }
      }
    }
  }, []);

  const handleActivateWithCode = () => {
    const cleanInput = activationInput.trim().toUpperCase();

    // Accept master key OR any key generated by Telegram Bot starting with TRADEN-
    const isValidKey = cleanInput === MASTER_VIP_CODE || 
                       cleanInput.startsWith('TRADEN-') || 
                       cleanInput.includes('TRADEN');

    if (isValidKey) {
      setIsAuthorized(true);
      const userKey = tgUser ? `traden_user_authorized_${tgUser.id}` : 'traden_user_authorized_browser';
      localStorage.setItem(userKey, 'true');
      setActivationError(false);
    } else {
      setActivationError(true);
    }
  };

  // 🔒 RESTRICTED ACCESS SCREEN (If user is not authorized by Admin)
  if (!isAuthorized) {
    return (
      <div className="app-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '85vh', textAlign: 'center', padding: '20px' }}>
        
        <div style={{ 
          width: '80px', height: '80px', borderRadius: '50%', 
          background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto',
          boxShadow: '0 0 30px rgba(239, 68, 68, 0.2)'
        }}>
          <Lock size={40} color="#f87171" />
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff', margin: '0 0 10px 0' }}>
          الحساب غير مفعل 🔒
        </h2>

        <p style={{ fontSize: '13px', color: '#9ca3af', lineHeight: '1.6', maxWidth: '340px', margin: '0 0 20px 0' }}>
          عذراً، استخدام منصة <b>Traden AI</b> يتطلب إذن التفعيل المباشر من إدارة البوت.
        </p>

        {tgUser && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '10px 16px', fontSize: '12px', color: '#f59e0b', marginBottom: '20px' }}>
            معرف الحساب: <b>@{tgUser.username || tgUser.first_name || tgUser.id}</b> (ID: {tgUser.id})
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '320px' }}>
          
          {/* Telegram Contact Button */}
          <a 
            href={tgUser ? `https://t.me/share/url?url=طلب%20تفعيل%20حساب%20Traden%20AI%20للمستخدم%20ID:%20${tgUser.id}` : 'https://t.me/'}
            target="_blank" 
            rel="noreferrer"
            style={{ 
              background: '#f59e0b', color: '#000', textDecoration: 'none', 
              padding: '14px', borderRadius: '12px', fontWeight: 'bold', fontSize: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              boxShadow: '0 0 15px rgba(245, 158, 11, 0.3)'
            }}
          >
            <Send size={18} />
            <span>تواصل مع الأدمن لتفعيل الحساب 📲</span>
          </a>

          {/* Enter Code Toggle Button */}
          <button 
            onClick={() => setShowCodeInput(!showCodeInput)}
            style={{ 
              background: 'rgba(255,255,255,0.04)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)',
              padding: '12px', borderRadius: '12px', fontSize: '13px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
            }}
          >
            <Key size={16} color="#a855f7" />
            <span>أدخل كود تفعيل الأدمن (VIP)</span>
          </button>

          {/* Activation Code Input Box */}
          {showCodeInput && (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '14px', padding: '14px', marginTop: '6px' }}>
              <input 
                type="text"
                placeholder="أدخل رمز كود التفعيل هُنا..."
                value={activationInput}
                onChange={(e) => { setActivationInput(e.target.value); setActivationError(false); }}
                style={{
                  width: '100%', background: 'rgba(0,0,0,0.4)', border: `1px solid ${activationError ? '#f87171' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '10px', padding: '10px', color: '#fff', fontSize: '13px', textAlign: 'center', outline: 'none', boxSizing: 'border-box'
                }}
              />
              {activationError && (
                <div style={{ color: '#f87171', fontSize: '11px', marginTop: '6px' }}>كود التفعيل غير صحيح ❌</div>
              )}
              <button 
                onClick={handleActivateWithCode}
                style={{
                  width: '100%', background: '#a855f7', color: '#fff', border: 'none',
                  borderRadius: '10px', padding: '10px', marginTop: '10px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer'
                }}
              >
                تفعيل الحساب الآن ✨
              </button>
            </div>
          )}

        </div>

      </div>
    );
  }

  const renderNav = () => (
    <div className="sticky-nav">
      {[
        { id: 'home', label: '🏠 الرئيسية' },
        { id: 'egx_stocks', label: '🇪🇬 البورصة المصرية' },
        { id: 'signal_bot', label: '🤖 التوصيات' },
        { id: 'gold_liquidity', label: '🥇 سيولة الذهب' },
        { id: 'traden_radar', label: '📡 رادار الأسواق' },
        { id: 'market_scanner', label: '📊 فاحص المؤشرات' },
        { id: 'investment_bot', label: '🌱 الاستثمار' },
        { id: 'market_news', label: '📰 الأخبار' },
      ].map(tab => (
        <button
          key={tab.id}
          onClick={() => setCurrentView(tab.id)}
          className={`nav-tab ${currentView === tab.id ? 'active' : ''}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

  // ✅ AUTHORIZED FULL APP VIEW
  if (currentView === 'investment_bot') {
    return (
      <div className="app-container">
        {renderNav()}
        <InvestmentBot onBack={() => setCurrentView('home')} />
      </div>
    );
  }

  if (currentView === 'halal_guide') {
    return (
      <div className="app-container">
        {renderNav()}
        <HalalGuide onBack={() => setCurrentView('home')} />
      </div>
    );
  }

  if (currentView === 'precious_metals') {
    return (
      <div className="app-container">
        {renderNav()}
        <PreciousMetals onBack={() => setCurrentView('home')} />
      </div>
    );
  }

  if (currentView === 'traden_radar') {
    return (
      <div className="app-container">
        {renderNav()}
        <TradenRadar 
          onBack={() => setCurrentView('home')} 
          onOpenBot={(symbol) => {
            if (symbol) setSelectedSymbol(symbol);
            setCurrentView('signal_bot');
          }}
        />
      </div>
    );
  }

  if (currentView === 'market_scanner') {
    return (
      <div className="app-container">
        {renderNav()}
        <MarketScanner onBack={() => setCurrentView('home')} />
      </div>
    );
  }

  if (currentView === 'signal_bot') {
    return (
      <div className="app-container">
        {renderNav()}
        <SignalBot initialSymbol={selectedSymbol} onBack={() => setCurrentView('home')} />
      </div>
    );
  }

  if (currentView === 'gold_liquidity') {
    return (
      <div className="app-container">
        {renderNav()}
        <GoldLiquidityRadar 
          onBack={() => setCurrentView('home')} 
          onAnalyzeGold={(symbol) => {
            if (symbol) setSelectedSymbol(symbol);
            setCurrentView('signal_bot');
          }}
        />
      </div>
    );
  }

  if (currentView === 'egx_stocks') {
    return (
      <div className="app-container">
        {renderNav()}
        <EgxAnalysis onBack={() => setCurrentView('home')} />
      </div>
    );
  }

  if (currentView === 'market_news') {
    return (
      <div className="app-container">
        {renderNav()}
        <MarketNews onBack={() => setCurrentView('home')} />
      </div>
    );
  }

  return (
    <div className="app-container">
      {renderNav()}

      {/* Header */}
      <header className="header" style={{ padding: '8px 12px', gap: '2px', marginBottom: '2px' }}>
        <div className="header-title" style={{ fontSize: '18px' }}>
          تداول أذكى <span>مع Traden AI ✦</span>
        </div>
        {tgUser && (
          <div style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle size={12} />
            <span>حساب مفعل: {tgUser.first_name}</span>
          </div>
        )}
      </header>

      {/* 1. Live Market Widget at TOP for zero scrolling! */}
      <LiveMarketWidget 
        onOpenBot={(symbol) => {
          if (symbol) setSelectedSymbol(symbol);
          setCurrentView('signal_bot');
        }} 
      />

      {/* 2. Compact Grid Tools */}
      <section>
        <div className="section-title" style={{ marginBottom: '6px', fontSize: '13px' }}>
          <Zap size={16} />
          الأدوات والبوتات الذكية
        </div>
        <div className="grid-3" style={{ gap: '8px' }}>
          <div className="card" onClick={() => setCurrentView('egx_stocks')} style={{ border: '1px solid rgba(245, 158, 11, 0.4)', background: 'rgba(245, 158, 11, 0.08)' }}>
            <span className="card-icon">🇪🇬</span>
            <div className="card-title">البورصة المصرية</div>
            <div className="badge" style={{ background: '#f59e0b', color: '#000' }}>تحليل مدمج 🔥</div>
          </div>
          <div className="card" onClick={() => setCurrentView('signal_bot')} style={{ border: '1px solid rgba(245, 158, 11, 0.4)', background: 'rgba(245, 158, 11, 0.08)' }}>
            <span className="card-icon">🤖</span>
            <div className="card-title">بوت التوصيات</div>
            <div className="badge" style={{ background: '#f59e0b', color: '#000' }}>إشارات 🔥</div>
          </div>
          <div className="card" onClick={() => setCurrentView('gold_liquidity')} style={{ border: '1px solid rgba(245, 158, 11, 0.4)', background: 'rgba(245, 158, 11, 0.08)' }}>
            <span className="card-icon">🥇</span>
            <div className="card-title">سيولة الذهب</div>
            <div className="badge" style={{ background: '#f59e0b', color: '#000' }}>رادار 🔥</div>
          </div>
          <div className="card" onClick={() => setCurrentView('traden_radar')} style={{ border: '1px solid rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.05)' }}>
            <span className="card-icon">📡</span>
            <div className="card-title">رادار الأسواق</div>
            <div className="badge" style={{ background: '#10b981', color: '#000' }}>حي 🔥</div>
          </div>
          <div className="card" onClick={() => setCurrentView('market_scanner')}>
            <BarChart2 size={20} color="#60a5fa" />
            <div className="card-title">فاحص المؤشرات</div>
          </div>
          <div className="card" onClick={() => setCurrentView('market_news')}>
            <span className="card-icon">📰</span>
            <div className="card-title">الأخبار اللحظية</div>
          </div>
        </div>
      </section>

    </div>
  );
}

export default App;

