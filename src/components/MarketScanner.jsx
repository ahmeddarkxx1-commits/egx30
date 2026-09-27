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

  const filteredCoins = coins.filter(c => 
    c.pair.toLowerCase().includes(search.toLowerCase()) || 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

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
            onClick={() => setSelectedCoin(coin)}
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
        onClick={() => {
          if (window.Telegram && window.Telegram.WebApp) {
            const data = JSON.stringify({ 
              action: "analyze", 
              symbol: selectedCoin.pair, 
              name: selectedCoin.name 
            });
            window.Telegram.WebApp.sendData(data);
          } else {
            alert(`تم إرسال طلب التحليل لعملة ${selectedCoin.pair} إلى البوت!`);
          }
        }}
        style={{ 
          width: '100%', 
          background: '#f59e0b', 
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
          marginTop: '8px',
          marginBottom: '24px'
        }}>
        🤖 تحليل Traden الشامل ({selectedCoin.pair})
      </button>
    </div>
  );
}
