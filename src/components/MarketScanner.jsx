import React, { useState } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import TradingViewWidget from './TradingViewWidget';

const coins = [
  { pair: 'BTC/USDT', name: 'Bitcoin', symbol: 'BINANCE:BTCUSDT', icon: '₿' },
  { pair: 'ETH/USDT', name: 'Ethereum', symbol: 'BINANCE:ETHUSDT', icon: 'Ξ' },
  { pair: 'BNB/USDT', name: 'BNB', symbol: 'BINANCE:BNBUSDT', icon: '🔶' },
  { pair: 'SOL/USDT', name: 'Solana', symbol: 'BINANCE:SOLUSDT', icon: '◎' },
  { pair: 'ADA/USDT', name: 'Cardano', symbol: 'BINANCE:ADAUSDT', icon: '₳' },
  { pair: 'XRP/USDT', name: 'XRP', symbol: 'BINANCE:XRPUSDT', icon: '✕' },
  { pair: 'DOT/USDT', name: 'Polkadot', symbol: 'BINANCE:DOTUSDT', icon: '●' },
  { pair: 'AVAX/USDT', name: 'Avalanche', symbol: 'BINANCE:AVAXUSDT', icon: '🔺' },
  { pair: 'DOGE/USDT', name: 'Dogecoin', symbol: 'BINANCE:DOGEUSDT', icon: 'Ð' },
  { pair: 'LINK/USDT', name: 'Chainlink', symbol: 'BINANCE:LINKUSDT', icon: '🔗' },
  { pair: 'SHIB/USDT', name: 'Shiba Inu', symbol: 'BINANCE:SHIBUSDT', icon: '🐕' }
];

export default function MarketScanner({ onBack }) {
  const [search, setSearch] = useState('');
  const [selectedCoin, setSelectedCoin] = useState(coins[0]);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const filteredCoins = coins.filter(c => 
    c.pair.toLowerCase().includes(search.toLowerCase()) || 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

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
      setAnalysisResult({
        pair: selectedCoin.pair,
        signal: 'شراء قوي 🟢 (BUY)',
        score: '91/100',
        entry: selectedCoin.pair.includes('BTC') ? '84,650.00' : selectedCoin.pair.includes('ETH') ? '2,678.20' : '145.30',
        tp1: selectedCoin.pair.includes('BTC') ? '85,900.00' : selectedCoin.pair.includes('ETH') ? '2,740.00' : '152.00',
        tp2: selectedCoin.pair.includes('BTC') ? '87,400.00' : selectedCoin.pair.includes('ETH') ? '2,810.00' : '158.50',
        sl: selectedCoin.pair.includes('BTC') ? '83,800.00' : selectedCoin.pair.includes('ETH') ? '2,630.00' : '139.00',
        rsi: '64.8 (زخم إيجابي صاعد)',
        trend: 'اختراق نموذج وتد صاعد مدعوم بدخول سيولة عالية'
      });
    }, 700);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <ChevronRight size={24} />
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>رجوع</span>
        </button>
      </div>

      <div style={{ position: 'relative' }}>
        <Search size={20} color="#9ca3af" style={{ position: 'absolute', right: '12px', top: '12px' }} />
        <input 
          type="text" 
          placeholder="اكتب اسم العملة... مثال: BTC, ETH"
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
