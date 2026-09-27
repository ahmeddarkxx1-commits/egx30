import { useState, useEffect } from 'react';
import { Bot, LineChart, Target, BookOpen, Bell, Coins, BarChart2, Star, Share2, Activity, Zap, Shield, TrendingUp } from 'lucide-react';
import MarketScanner from './components/MarketScanner';
import SignalBot from './components/SignalBot';
import MarketNews from './components/MarketNews';
import TradenRadar from './components/TradenRadar';
import PreciousMetals from './components/PreciousMetals';
import HalalGuide from './components/HalalGuide';
import './App.css';

function App() {
  const [tgUser, setTgUser] = useState(null);
  const [currentView, setCurrentView] = useState('home');
  const [selectedSymbol, setSelectedSymbol] = useState('BTC/USDT');

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        setTgUser(tg.initDataUnsafe.user);
      }
    }
  }, []);

  if (currentView === 'halal_guide') {
    return (
      <div className="app-container">
        <HalalGuide onBack={() => setCurrentView('home')} />
      </div>
    );
  }

  if (currentView === 'precious_metals') {
    return (
      <div className="app-container">
        <PreciousMetals onBack={() => setCurrentView('home')} />
      </div>
    );
  }

  if (currentView === 'traden_radar') {
    return (
      <div className="app-container">
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
        <MarketScanner onBack={() => setCurrentView('home')} />
      </div>
    );
  }

  if (currentView === 'signal_bot') {
    return (
      <div className="app-container">
        <SignalBot initialSymbol={selectedSymbol} onBack={() => setCurrentView('home')} />
      </div>
    );
  }

  if (currentView === 'market_news') {
    return (
      <div className="app-container">
        <MarketNews onBack={() => setCurrentView('home')} />
      </div>
    );
  }

  return (
    <div className="app-container">
      
      <header className="header">
        <div className="header-title">
          تداول أذكى <span>مع Traden AI ✦</span>
        </div>
        <div style={{ fontSize: '12px', color: '#9ca3af' }}>
          إشارات ذكية · تحليل فني · فتح صفقات مباشر
        </div>
        
        {tgUser && (
          <div style={{ fontSize: '14px', color: '#f59e0b' }}>
            مرحباً بك، {tgUser.first_name}
          </div>
        )}

        <div className="action-buttons">
          <button className="btn btn-primary">ابدأ مجاناً ←</button>
          <button className="btn btn-secondary">جرب البوت</button>
        </div>
      </header>

      <section>
        <div className="section-title">
          <Bot size={18} />
          البوتات الذكية
        </div>
        <div className="grid-2">
          <div className="card">
            <span className="card-icon">🤖</span>
            <div className="card-title">بوت التداول الآلي</div>
            <div className="card-desc">يفتح ويغلق صفقاتك تلقائياً</div>
            <div className="badge">PRO</div>
          </div>
          <div className="card" onClick={() => setCurrentView('signal_bot')}>
            <span className="card-icon">📡</span>
            <div className="card-title">Traden Bot</div>
            <div className="card-desc">إشارات BUY/SELL بالذكاء</div>
          </div>
          <div className="card" style={{ gridColumn: 'span 2' }}>
            <span className="card-icon">🌱</span>
            <div className="card-title">بوت الاستثمار</div>
            <div className="card-desc">أفضل عملات للاحتفاظ</div>
          </div>
        </div>
      </section>

      <section>
        <div className="section-title">
          <Zap size={18} />
          الأدوات
        </div>
        <div className="grid-3">
          <div className="card" onClick={() => setCurrentView('traden_radar')} style={{ border: '1px solid rgba(245, 158, 11, 0.4)', background: 'rgba(245, 158, 11, 0.05)' }}>
            <span className="card-icon">🔭</span>
            <div className="card-title">رادار الفرص ✦</div>
            <div className="badge" style={{ background: '#f59e0b', color: '#000' }}>جديد 🔥</div>
          </div>
          <div className="card" onClick={() => setCurrentView('market_scanner')}>
            <BarChart2 size={24} color="#60a5fa" />
            <div className="card-title">Market Scanner</div>
          </div>
          <div className="card">
            <span className="card-icon">🌅</span>
            <div className="card-title">Traden الصباحي</div>
          </div>
          <div className="card" onClick={() => setCurrentView('precious_metals')}>
            <span className="card-icon">🥇</span>
            <div className="card-title">المعادن الثمينة</div>
          </div>
          <div className="card">
            <BookOpen size={24} color="#a78bfa" />
            <div className="card-title">أكاديمية Traden</div>
          </div>
          <div className="card" onClick={() => setCurrentView('halal_guide')}>
            <Shield size={24} color="#34d399" />
            <div className="card-title">دليل الحلال</div>
          </div>
          <div className="card" onClick={() => setCurrentView('market_news')}>
            <span className="card-icon">📰</span>
            <div className="card-title">الأخبار</div>
          </div>
          <div className="card">
            <Activity size={24} color="#f472b6" />
            <div className="card-title">مصفوفة الارتباط</div>
          </div>
          <div className="card">
            <Bell size={24} color="#fbbf24" />
            <div className="card-title">تنبيهات السعر</div>
          </div>
          <div className="card">
            <span className="card-icon">⚖️</span>
            <div className="card-title">مقارنة</div>
          </div>
          <div className="card">
            <Star size={24} color="#fbbf24" />
            <div className="card-title">Premium</div>
            <div className="badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' }}>PRO</div>
          </div>
          <div className="card">
            <span className="card-icon">📝</span>
            <div className="card-title">التداول التجريبي</div>
          </div>
          <div className="card">
            <Share2 size={24} color="#fb923c" />
            <div className="card-title">برنامج الإحالة</div>
            <div className="badge">10%</div>
          </div>
        </div>
      </section>

      <section className="chart-container">
        <div className="chart-header">
          <div>
            <div className="price">$84,580</div>
            <div className="price-sub">Bitcoin · 48h ₿</div>
          </div>
          <div className="trend-up">▲ 0.61%</div>
        </div>
        
        {/* Simple mock chart line */}
        <div style={{ height: '60px', width: '100%', borderBottom: '1px solid #1f2937', position: 'relative' }}>
           <svg viewBox="0 0 100 20" preserveAspectRatio="none" style={{ width: '100%', height: '100%', stroke: '#10b981', strokeWidth: 2, fill: 'none' }}>
             <path d="M0,15 Q10,10 20,12 T40,8 T60,10 T80,5 T100,2" />
           </svg>
        </div>

        <div className="chart-stats">
          <div className="stat-box">
            <div className="stat-title">أدنى 48h</div>
            <div className="stat-val">$83,861</div>
          </div>
          <div className="stat-box">
            <div className="stat-title">أعلى 48h</div>
            <div className="stat-val">$84,992</div>
          </div>
          <div className="stat-box">
            <div className="stat-title">الاتجاه</div>
            <div className="stat-val" style={{ color: '#10b981' }}>صاعد 📈</div>
          </div>
        </div>
      </section>

    </div>
  );
}

export default App;
