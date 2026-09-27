import React, { useState } from 'react';
import { ChevronRight, RefreshCw, Sparkles, Award } from 'lucide-react';

const metalsData = {
  gold: {
    id: 'gold',
    name: 'الذهب',
    symbol: 'XAU/USD',
    rank: 1,
    badge: '🥇',
    basePriceUSD: 2682.50,
    changeUSD: 12.30,
    changePercent: '+0.46%',
    isUp: true
  },
  silver: {
    id: 'silver',
    name: 'الفضة',
    symbol: 'XAG/USD',
    rank: 2,
    badge: '🥈',
    basePriceUSD: 31.85,
    changeUSD: 0.24,
    changePercent: '+0.76%',
    isUp: true
  },
  platinum: {
    id: 'platinum',
    name: 'البلاتين',
    symbol: 'XPT/USD',
    rank: 3,
    badge: '💎',
    basePriceUSD: 988.10,
    changeUSD: -3.20,
    changePercent: '-0.32%',
    isUp: false
  }
};

const currencies = [
  { code: 'USD', name: 'دولار أمريكي', flag: '🇺🇸', rate: 1.0, symbol: '$' },
  { code: 'SAR', name: 'ريال سعودي', flag: '🇸🇦', rate: 3.75, symbol: 'ر.س' },
  { code: 'AED', name: 'درهم إماراتي', flag: '🇦🇪', rate: 3.67, symbol: 'د.إ' },
  { code: 'KWD', name: 'دينار كويتي', flag: '🇰🇼', rate: 0.31, symbol: 'د.ك' },
  { code: 'EGP', name: 'جنيه مصري', flag: '🇪🇬', rate: 48.60, symbol: 'ج.م' },
  { code: 'QAR', name: 'ريال قطري', flag: '🇶🇦', rate: 3.64, symbol: 'ر.ق' },
  { code: 'JOD', name: 'دينار أردني', flag: '🇯🇴', rate: 0.71, symbol: 'د.أ' },
  { code: 'BHD', name: 'دينار بحريني', flag: '🇧🇭', rate: 0.38, symbol: 'د.ب' },
  { code: 'OMR', name: 'ريال عماني', flag: '🇴🇲', rate: 0.38, symbol: 'ر.ع' },
  { code: 'IQD', name: 'دينار عراقي', flag: '🇮🇶', rate: 1310.0, symbol: 'د.ع' },
  { code: 'MAD', name: 'درهم مغربي', flag: '🇲🇦', rate: 9.85, symbol: 'د.م' },
  { code: 'DZD', name: 'دينار جزائري', flag: '🇩🇿', rate: 133.5, symbol: 'د.ج' },
  { code: 'TND', name: 'دينار تونسي', flag: '🇹🇳', rate: 3.08, symbol: 'د.ت' },
  { code: 'EUR', name: 'يورو', flag: '🇪🇺', rate: 0.92, symbol: '€' },
  { code: 'GBP', name: 'جنيه إسترليني', flag: '🇬🇧', rate: 0.77, symbol: '£' },
  { code: 'JPY', name: 'ين ياباني', flag: '🇯🇵', rate: 143.5, symbol: '¥' },
  { code: 'CHF', name: 'فرنك سويسري', flag: '🇨🇭', rate: 0.85, symbol: 'CHF' },
  { code: 'CNY', name: 'يوان صيني', flag: '🇨🇳', rate: 7.02, symbol: '¥' },
  { code: 'INR', name: 'روبية هندية', flag: '🇮🇳', rate: 83.75, symbol: '₹' },
  { code: 'TRY', name: 'ليرة تركية', flag: '🇹🇷', rate: 34.15, symbol: '₺' },
  { code: 'SYP', name: 'ليرة سورية', flag: '🇸🇾', rate: 13000.0, symbol: 'ل.س' }
];

export default function PreciousMetals({ onBack }) {
  const [selectedMetal, setSelectedMetal] = useState('gold');
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [unitType, setUnitType] = useState('ounce'); // 'ounce' or 'gram'
  const [isRefreshing, setIsRefreshing] = useState(false);

  const metal = metalsData[selectedMetal];
  const currency = currencies.find(c => c.code === selectedCurrency) || currencies[0];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  // 1 Ounce = 31.1034768 grams
  const ounceToGram = 31.1034768;
  const basePriceInCurrency = metal.basePriceUSD * currency.rate;
  const priceDisplayValue = unitType === 'ounce' 
    ? basePriceInCurrency 
    : basePriceInCurrency / ounceToGram;

  const changeInCurrency = (metal.changeUSD * currency.rate).toFixed(2);

  const formatPrice = (val) => {
    if (val > 1000) {
      return val.toLocaleString('en-US', { maximumFractionDigits: 0 });
    }
    return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Gram Karat calculations for gold
  const gram24 = basePriceInCurrency / ounceToGram;
  const gram22 = gram24 * (22 / 24);
  const gram21 = gram24 * (21 / 24);
  const gram18 = gram24 * (18 / 24);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#fff' }}>المعادن الثمينة 🥇</h2>
            <button 
              onClick={handleRefresh}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#f59e0b', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
            >
              <RefreshCw size={12} className={isRefreshing ? 'spin' : ''} />
              <span>تحديث</span>
            </button>
          </div>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
            آخر تحديث: {new Date().toLocaleTimeString('ar-EG')} · Yahoo Finance
          </div>
        </div>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
          <ChevronRight size={28} />
        </button>
      </div>

      {/* Top 3 Metals Cards Selection (الذهب، الفضة، البلاتين) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        {Object.values(metalsData).map(item => {
          const isSelected = selectedMetal === item.id;
          return (
            <div
              key={item.id}
              onClick={() => setSelectedMetal(item.id)}
              style={{
                background: isSelected ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isSelected ? '#f59e0b' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: '14px',
                padding: '14px 8px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: isSelected ? '0 0 12px rgba(245, 158, 11, 0.2)' : 'none'
              }}
            >
              <div style={{ fontSize: '28px', marginBottom: '4px' }}>{item.badge}</div>
              <div style={{ fontWeight: 'bold', fontSize: '14px', color: isSelected ? '#f59e0b' : '#fff' }}>{item.name}</div>
              <div style={{ fontSize: '11px', fontWeight: 'bold', marginTop: '4px', color: item.isUp ? '#10b981' : '#f87171' }}>
                {item.changePercent} {item.isUp ? '▲' : '▼'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Currency Selector Bar (العملة) */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '12px' }}>
        <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px', textAlign: 'right', fontWeight: 'bold' }}>العملة</div>
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
          {currencies.map(c => {
            const isSel = selectedCurrency === c.code;
            return (
              <button
                key={c.code}
                onClick={() => setSelectedCurrency(c.code)}
                style={{
                  background: isSel ? '#f59e0b' : 'rgba(255,255,255,0.04)',
                  color: isSel ? '#000' : '#fff',
                  border: `1px solid ${isSel ? '#f59e0b' : 'rgba(255,255,255,0.08)'}`,
                  padding: '6px 12px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s'
                }}
              >
                <span>{c.code}</span>
                <span style={{ fontSize: '10px', opacity: 0.8 }}>{c.flag}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Hero Card Display */}
      <div style={{ 
        background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)', 
        border: '1px solid rgba(245, 158, 11, 0.25)', 
        borderRadius: '20px', 
        padding: '24px 16px', 
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Unit Toggle (أونصة / جرام) */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '16px' }}>
          <button
            onClick={() => setUnitType('ounce')}
            style={{
              background: unitType === 'ounce' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
              color: unitType === 'ounce' ? '#f59e0b' : '#9ca3af',
              border: `1px solid ${unitType === 'ounce' ? '#f59e0b' : 'rgba(255,255,255,0.1)'}`,
              padding: '4px 14px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer'
            }}
          >
            الأونصة
          </button>
          <button
            onClick={() => setUnitType('gram')}
            style={{
              background: unitType === 'gram' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
              color: unitType === 'gram' ? '#f59e0b' : '#9ca3af',
              border: `1px solid ${unitType === 'gram' ? '#f59e0b' : 'rgba(255,255,255,0.1)'}`,
              padding: '4px 14px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer'
            }}
          >
            الجرام (24K)
          </button>
        </div>

        {/* Medal Badge Icon */}
        <div style={{ 
          width: '56px', height: '56px', borderRadius: '50%', 
          background: 'rgba(245, 158, 11, 0.15)', 
          border: '1px solid rgba(245, 158, 11, 0.3)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          margin: '0 auto 12px auto',
          fontSize: '28px'
        }}>
          {metal.badge}
        </div>

        {/* Subtitle Label */}
        <div style={{ fontSize: '14px', color: '#9ca3af', fontWeight: '500' }}>
          {metal.name} · {currency.name}
        </div>

        {/* Main Price Number */}
        <div style={{ fontSize: '42px', fontWeight: '900', color: '#fff', margin: '8px 0', letterSpacing: '-0.5px' }}>
          {currency.symbol} {formatPrice(priceDisplayValue)}
        </div>

        {/* Sub label */}
        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>
          لـ {unitType === 'ounce' ? 'الأونصة' : 'الجرام'}
        </div>

        {/* Change Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: metal.isUp ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', border: `1px solid ${metal.isUp ? '#10b981' : '#f87171'}`, borderRadius: '20px', padding: '6px 16px' }}>
          <span style={{ fontWeight: 'bold', fontSize: '13px', color: metal.isUp ? '#10b981' : '#f87171' }}>
            ({metal.changePercent}) {currency.symbol}{changeInCurrency} {metal.isUp ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {/* Gold Karat Prices Breakdown (أسعار الأعيرة بالجرام) */}
      {selectedMetal === 'gold' && (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: '8px', fontWeight: 'bold' }}>{currency.code}</span>
            <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>أسعار جرام الذهب حسب العيار</span>
              <Sparkles size={16} color="#f59e0b" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>عيار 24 (أنقى عيار)</div>
              <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#fff', marginTop: '2px' }}>{currency.symbol} {formatPrice(gram24)}</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>عيار 22</div>
              <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#fff', marginTop: '2px' }}>{currency.symbol} {formatPrice(gram22)}</div>
            </div>

            <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 'bold' }}>عيار 21 (الأكثر طلباً ⭐)</div>
              <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#f59e0b', marginTop: '2px' }}>{currency.symbol} {formatPrice(gram21)}</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>عيار 18</div>
              <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#fff', marginTop: '2px' }}>{currency.symbol} {formatPrice(gram18)}</div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
