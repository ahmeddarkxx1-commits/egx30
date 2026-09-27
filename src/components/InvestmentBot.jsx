import React, { useState, useEffect } from 'react';
import { ChevronRight, Sparkles, TrendingUp, ShieldCheck, DollarSign, Calculator, RefreshCw, Trophy, Award } from 'lucide-react';

const initialRatedCoins = [
  { rank: 1, id: 'BTC', symbol: 'BTC/USDT', bSymbol: 'BTCUSDT', name: 'Bitcoin', icon: '₿', logoUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/btc.png', priceStr: '$84,336.9', score: 68, evalText: 'جيد 🟢', isTrophy: true, isHalal: true, targetMultiplier: 1.45, thesis: 'مخزن القيمة الرقمي الأساسي لجميع المحافظ طويلة الأجل.' },
  { rank: 2, id: 'NEAR', symbol: 'NEAR/USDT', bSymbol: 'NEARUSDT', name: 'NEAR Protocol', icon: 'Ⓝ', logoUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/near.png', priceStr: '$5.42', score: 66, evalText: 'جيد 🟢', isTrophy: true, isHalal: true, targetMultiplier: 2.40, thesis: 'شبكة ذكاء اصطناعي وبنية تحتية عالية التوسع.' },
  { rank: 3, id: 'SUI', symbol: 'SUI/USDT', bSymbol: 'SUIUSDT', name: 'Sui', icon: '💧', logoUrl: 'https://assets.coingecko.com/coins/images/26375/large/sui_asset.png', priceStr: '$1.26', score: 66, evalText: 'جيد 🟢', isTrophy: true, isHalal: true, targetMultiplier: 2.80, thesis: 'بلوكتشين الجيل القادم لسرعة المعاملات والالعاب.' },
  { rank: 4, id: 'ETH', symbol: 'ETH/USDT', bSymbol: 'ETHUSDT', name: 'Ethereum', icon: 'Ξ', logoUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/eth.png', priceStr: '$2,683.84', score: 63, evalText: 'جيد 🟢', isTrophy: false, isHalal: true, targetMultiplier: 1.65, thesis: 'عمود اقتصاد العقود الذكية والتطبيقات اللامركزية.' },
  { rank: 5, id: 'SOL', symbol: 'SOL/USDT', bSymbol: 'SOLUSDT', name: 'Solana', icon: '◎', logoUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/sol.png', priceStr: '$121.92', score: 63, evalText: 'جيد 🟢', isTrophy: false, isHalal: true, targetMultiplier: 2.10, thesis: 'أسرع شبكة بلوكتشين وتدفق سيولة عالي للسيولة.' },
  { rank: 6, id: 'ADA', symbol: 'ADA/USDT', bSymbol: 'ADAUSDT', name: 'Cardano', icon: '₳', logoUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/ada.png', priceStr: '$0.25', score: 62, evalText: 'جيد 🟢', isTrophy: false, isHalal: true, targetMultiplier: 1.80, thesis: 'شبكة علمية آمنة مبنية على الأبحاث الأكاديمية.' },
  { rank: 7, id: 'DOT', symbol: 'DOT/USDT', bSymbol: 'DOTUSDT', name: 'Polkadot', icon: '🟣', logoUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/dot.png', priceStr: '$1.26', score: 62, evalText: 'جيد 🟢', isTrophy: false, isHalal: true, targetMultiplier: 2.20, thesis: 'ربط الشبكات المتعددة وحوكمة لامركزية متقدمة.' },
  { rank: 8, id: 'LINK', symbol: 'LINK/USDT', bSymbol: 'LINKUSDT', name: 'Chainlink', icon: '⬢', logoUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/link.png', priceStr: '$13.98', score: 62, evalText: 'جيد 🟢', isTrophy: false, isHalal: true, targetMultiplier: 2.30, thesis: 'جسر البيانات الأهم بين البنوك والمؤسسات المالي.' },
  { rank: 9, id: 'AVAX', symbol: 'AVAX/USDT', bSymbol: 'AVAXUSDT', name: 'Avalanche', icon: '🔺', logoUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/avax.png', priceStr: '$10.83', score: 62, evalText: 'جيد 🟢', isTrophy: false, isHalal: true, targetMultiplier: 2.50, thesis: 'شبكات المؤسسات المالية والتداول السريع.' },
  { rank: 10, id: 'ATOM', symbol: 'ATOM/USDT', bSymbol: 'ATOMUSDT', name: 'Cosmos', icon: '⚛️', logoUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/atom.png', priceStr: '$1.87', score: 62, evalText: 'جيد 🟢', isTrophy: false, isHalal: true, targetMultiplier: 2.10, thesis: 'إنترنت البلوكتشين والتواصل بين سلاسل التداول.' },
  { rank: 11, id: 'OP', symbol: 'OP/USDT', bSymbol: 'OPUSDT', name: 'Optimism', icon: '🔴', logoUrl: 'https://assets.coingecko.com/coins/images/25244/large/Optimism.png', priceStr: '$0.15', score: 62, evalText: 'جيد 🟢', isTrophy: false, isHalal: true, targetMultiplier: 3.00, thesis: 'حلول الطبقة الثانية لتوسيع شبكة الايثريوم.' },
  { rank: 12, id: 'BNB', symbol: 'BNB/USDT', bSymbol: 'BNBUSDT', name: 'BNB', icon: '🔶', logoUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/bnb.png', priceStr: '$777.7', score: 60, evalText: 'جيد 🟢', isTrophy: false, isHalal: false, targetMultiplier: 1.50, thesis: 'عملة المنصة الأولى عالمياً مع حرق دوري.' },
  { rank: 13, id: 'INJ', symbol: 'INJ/USDT', bSymbol: 'INJUSDT', name: 'Injective', icon: '⚡', logoUrl: 'https://assets.coingecko.com/coins/images/12882/large/Secondary_Symbol.png', priceStr: '$7.76', score: 57, evalText: 'محايد 🟡', isTrophy: false, isHalal: true, targetMultiplier: 2.20, thesis: 'بلوكتشين متخصص للأسواق المالية والمشتقات.' },
  { rank: 14, id: 'POL', symbol: 'POL/USDT', bSymbol: 'MATICUSDT', name: 'Polygon', icon: '⬡', logoUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/matic.png', priceStr: '$0.38', score: 55, evalText: 'محايد 🟡', isTrophy: false, isHalal: true, targetMultiplier: 1.90, thesis: 'شبكة التوسعة الرئيسية للايثريوم والشراكات.' },
  { rank: 15, id: 'PAXG', symbol: 'PAXG/USDT', bSymbol: 'PAXGUSDT', name: 'PAX Gold', icon: '🥇', logoUrl: 'https://assets.coingecko.com/coins/images/9519/large/paxg.png', priceStr: '$2,682.50', score: 72, evalText: 'ممتاز 🔥', isTrophy: true, isHalal: true, targetMultiplier: 1.18, thesis: 'ذهب رقمي مغطى بالكامل ومطابق للشريعة 100%.' },
  { rank: 16, id: 'RENDER', symbol: 'RENDER/USDT', bSymbol: 'RENDERUSDT', name: 'Render', icon: '🎨', logoUrl: 'https://assets.coingecko.com/coins/images/11636/large/render.png', priceStr: '$5.40', score: 65, evalText: 'جيد 🟢', isTrophy: false, isHalal: true, targetMultiplier: 3.10, thesis: 'شبكة رندرة وحوسبة الذكاء الاصطناعي السحابية.' },
  { rank: 17, id: 'FET', symbol: 'FET/USDT', bSymbol: 'FETUSDT', name: 'Fetch.ai', icon: '🤖', logoUrl: 'https://assets.coingecko.com/coins/images/5681/large/Fetch.jpg', priceStr: '$1.45', score: 64, evalText: 'جيد 🟢', isTrophy: false, isHalal: true, targetMultiplier: 3.20, thesis: 'ائتلاف بروتوكولات الذكاء الاصطناعي والوكلاء.' },
  { rank: 18, id: 'APT', symbol: 'APT/USDT', bSymbol: 'APTUSDT', name: 'Aptos', icon: '🌐', logoUrl: 'https://assets.coingecko.com/coins/images/26455/large/aptos_round.png', priceStr: '$8.20', score: 59, evalText: 'محايد 🟡', isTrophy: false, isHalal: true, targetMultiplier: 2.00, thesis: 'لغة Move البرمجية المعالجة فائقة السرعة.' },
  { rank: 19, id: 'ARB', symbol: 'ARB/USDT', bSymbol: 'ARBUSDT', name: 'Arbitrum', icon: '🟦', logoUrl: 'https://assets.coingecko.com/coins/images/16547/large/arbitrum.png', priceStr: '$0.58', score: 56, evalText: 'محايد 🟡', isTrophy: false, isHalal: true, targetMultiplier: 2.10, thesis: 'أعلى القيمة المقفولة TVL في الطبقة الثانية.' },
  { rank: 20, id: 'PEPE', symbol: 'PEPE/USDT', bSymbol: 'PEPEUSDT', name: 'Pepe Meme', icon: '🐸', logoUrl: 'https://assets.coingecko.com/coins/images/29850/large/pepe-token.png', priceStr: '$0.0000095', score: 32, evalText: 'ضعيف 🔴', isTrophy: false, isHalal: false, targetMultiplier: 1.10, thesis: 'عملة ميم عالية التقلب تفتقر للمنافع التقنية.' }
];

export default function InvestmentBot({ onBack }) {
  const [ratedCoins, setRatedCoins] = useState(initialRatedCoins);
  const [investmentAmount, setInvestmentAmount] = useState('1000');
  const [durationMonths, setDurationMonths] = useState(12);
  const [halalOnly, setHalalOnly] = useState(true);
  const [riskTolerance, setRiskTolerance] = useState('balanced');
  const [generatedPortfolio, setGeneratedPortfolio] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleTimeString('ar-EG'));
  const [isUpdating, setIsUpdating] = useState(false);

  // Live Real-Time Price Auto Refresh (Binance 24h Ticker)
  const fetchLivePrices = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch('https://api.binance.com/api/v3/ticker/24hr');
      if (res.ok) {
        const binanceData = await res.json();
        const mapBinance = {};
        binanceData.forEach(item => {
          mapBinance[item.symbol] = item;
        });

        setRatedCoins(prev => prev.map(coin => {
          const live = mapBinance[coin.bSymbol];
          if (live) {
            const rawPrice = parseFloat(live.lastPrice);
            const priceStr = rawPrice > 100
              ? `$${rawPrice.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}`
              : rawPrice > 1
              ? `$${rawPrice.toFixed(2)}`
              : `$${rawPrice.toFixed(4)}`;
            
            return {
              ...coin,
              priceStr
            };
          }
          return coin;
        }));
      }
    } catch (e) {
      console.log('Using fallback prices for rating table:', e);
    } finally {
      setLastUpdate(new Date().toLocaleTimeString('ar-EG'));
      setTimeout(() => setIsUpdating(false), 500);
    }
  };

  useEffect(() => {
    fetchLivePrices();
    const interval = setInterval(() => {
      fetchLivePrices();
    }, 6000); // refresh every 6s
    return () => clearInterval(interval);
  }, []);

  const numAmount = parseFloat(investmentAmount) || 0;

  const handleGeneratePortfolio = () => {
    setIsGenerating(true);

    setTimeout(() => {
      let eligible = ratedCoins.filter(a => !halalOnly || a.isHalal);

      let selected = [];
      if (riskTolerance === 'conservative') {
        selected = [
          { ...eligible.find(a => a.id === 'BTC') || eligible[0], sharePercent: 45 },
          { ...eligible.find(a => a.id === 'PAXG') || eligible[1], sharePercent: 30 },
          { ...eligible.find(a => a.id === 'ETH') || eligible[2], sharePercent: 25 }
        ];
      } else if (riskTolerance === 'growth') {
        selected = [
          { ...eligible.find(a => a.id === 'SOL') || eligible[0], sharePercent: 30 },
          { ...eligible.find(a => a.id === 'SUI') || eligible[1], sharePercent: 25 },
          { ...eligible.find(a => a.id === 'NEAR') || eligible[2], sharePercent: 25 },
          { ...eligible.find(a => a.id === 'RENDER') || eligible[3], sharePercent: 20 }
        ];
      } else {
        // Balanced
        selected = [
          { ...eligible.find(a => a.id === 'BTC') || eligible[0], sharePercent: 35 },
          { ...eligible.find(a => a.id === 'ETH') || eligible[1], sharePercent: 25 },
          { ...eligible.find(a => a.id === 'SOL') || eligible[2], sharePercent: 20 },
          { ...eligible.find(a => a.id === 'NEAR') || eligible[3], sharePercent: 20 }
        ];
      }

      let totalExpectedReturn = 0;
      const portfolioItems = selected.map(item => {
        const itemAmount = (numAmount * item.sharePercent) / 100;
        const years = durationMonths / 12;
        const expectedValue = itemAmount * Math.pow(item.targetMultiplier, years);
        totalExpectedReturn += expectedValue;

        return {
          ...item,
          dollarAmount: itemAmount,
          expectedValue: Math.round(expectedValue),
          profit: Math.round(expectedValue - itemAmount)
        };
      });

      const totalProfit = Math.round(totalExpectedReturn - numAmount);
      const roiPercent = numAmount > 0 ? Math.round((totalProfit / numAmount) * 100) : 0;

      setGeneratedPortfolio({
        items: portfolioItems,
        totalInitial: numAmount,
        totalExpected: Math.round(totalExpectedReturn),
        totalProfit: totalProfit,
        roiPercent: roiPercent
      });

      setIsGenerating(false);
    }, 600);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#fff' }}>بوت الاستثمار الذكي 🌱</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 8px', borderRadius: '12px', color: '#10b981', fontSize: '11px', fontWeight: 'bold' }}>
              <span className={isUpdating ? 'spin' : ''}>🟢</span>
              <span>مباشر</span>
            </div>
          </div>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>تحديث الأسعار: {lastUpdate} · {ratedCoins.length} عملة محللة</span>
            <RefreshCw size={12} className={isUpdating ? 'spin' : ''} style={{ cursor: 'pointer' }} onClick={fetchLivePrices} />
          </div>
        </div>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
          <ChevronRight size={28} />
        </button>
      </div>

      {/* Input Calculator Form Box */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        {/* Custom Investment Amount Input */}
        <div>
          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <DollarSign size={16} color="#f59e0b" />
            <span>1. اكتب مبلغ الاستثمار المخصص ($)</span>
          </label>
          <input
            type="number"
            placeholder="اكتب المبلغ مثل: 1000..."
            value={investmentAmount}
            onChange={(e) => setInvestmentAmount(e.target.value)}
            style={{
              width: '100%',
              background: '#181b22',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '12px',
              padding: '12px 14px',
              color: '#fff',
              fontSize: '16px',
              fontWeight: 'bold',
              direction: 'rtl',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          <div style={{ display: 'flex', gap: '6px', marginTop: '8px', overflowX: 'auto' }}>
            {['100', '250', '500', '1000', '2500', '5000', '10000'].map(val => (
              <button
                key={val}
                onClick={() => setInvestmentAmount(val)}
                style={{
                  background: investmentAmount === val ? '#f59e0b' : 'rgba(255,255,255,0.04)',
                  color: investmentAmount === val ? '#000' : '#9ca3af',
                  border: `1px solid ${investmentAmount === val ? '#f59e0b' : 'rgba(255,255,255,0.08)'}`,
                  padding: '4px 10px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                ${parseInt(val).toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Duration Selector */}
        <div>
          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Calculator size={16} color="#60a5fa" />
            <span>2. حدد مدة الاستثمار</span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
            {[
              { m: 6, label: '6 شهور' },
              { m: 12, label: 'سنة 1' },
              { m: 36, label: '3 سنوات' },
              { m: 60, label: '5 سنوات' }
            ].map(d => (
              <button
                key={d.m}
                onClick={() => setDurationMonths(d.m)}
                style={{
                  background: durationMonths === d.m ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.04)',
                  color: durationMonths === d.m ? '#60a5fa' : '#9ca3af',
                  border: `1px solid ${durationMonths === d.m ? '#60a5fa' : 'rgba(255,255,255,0.08)'}`,
                  padding: '8px 0',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Halal Filter Toggle */}
        <div style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🕌</span>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#10b981' }}>فلتر الحلال 100% (تصفية شرعية معتمدة)</div>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>استبعاد العملات المشبوهة أو الربوية تلقائياً</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={halalOnly}
            onChange={(e) => setHalalOnly(e.target.checked)}
            style={{ width: '20px', height: '20px', accentColor: '#10b981', cursor: 'pointer' }}
          />
        </div>

        {/* Risk Tolerance Buttons */}
        <div>
          <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>درجة تحمّل المخاطرة:</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            {[
              { id: 'conservative', label: '🛡️ آمنة جـداً' },
              { id: 'balanced', label: '⚖️ متوازنة' },
              { id: 'growth', label: '🚀 نمو عالي' }
            ].map(r => (
              <button
                key={r.id}
                onClick={() => setRiskTolerance(r.id)}
                style={{
                  background: riskTolerance === r.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                  border: `1px solid ${riskTolerance === r.id ? '#fff' : 'rgba(255,255,255,0.08)'}`,
                  color: '#fff',
                  padding: '6px 0',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGeneratePortfolio}
          disabled={isGenerating || numAmount <= 0}
          style={{
            width: '100%',
            background: isGenerating ? '#b45309' : '#f59e0b',
            color: '#000',
            padding: '14px',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '16px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 0 20px rgba(245, 158, 11, 0.3)',
            marginTop: '4px'
          }}
        >
          <Sparkles size={18} />
          <span>{isGenerating ? 'جاري بناء المحفظة بالذكاء الاصطناعي...' : `توليد محفظة بـ $${numAmount.toLocaleString()} 🤖`}</span>
        </button>

      </div>

      {/* Generated Custom Portfolio Results */}
      {generatedPortfolio && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          <div style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(245, 158, 11, 0.08) 100%)', border: '1px solid #10b981', borderRadius: '16px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '11px', background: '#10b981', color: '#000', padding: '3px 8px', borderRadius: '8px', fontWeight: 'bold' }}>
                العائد التقديري المتوقع: +{generatedPortfolio.roiPercent}% 🚀
              </span>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#10b981', fontWeight: 'bold' }}>توزيع المحفظة المخصصة</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '10px' }}>
              <div>
                <div style={{ fontSize: '10px', color: '#9ca3af' }}>المبلغ المستثمر</div>
                <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#fff', marginTop: '2px' }}>${generatedPortfolio.totalInitial.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#10b981', fontWeight: 'bold' }}>صافي الأرباح</div>
                <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#10b981', marginTop: '2px' }}>+${generatedPortfolio.totalProfit.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#f59e0b', fontWeight: 'bold' }}>القيمة المتوقعة ({durationMonths} شهر)</div>
                <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#f59e0b', marginTop: '2px' }}>${generatedPortfolio.totalExpected.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Allocation Cards */}
          <div style={{ fontSize: '14px', color: '#fff', fontWeight: 'bold', textAlign: 'right' }}>
            الأصول المختارة وتوزيع المبالغ ({generatedPortfolio.items.length} أصول):
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {generatedPortfolio.items.map(item => (
              <div
                key={item.id}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '14px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', padding: '3px 8px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                      ${item.dollarAmount.toLocaleString()} ({item.sharePercent}%)
                    </span>
                    {item.isHalal && (
                      <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '3px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' }}>
                        حلال 🕌
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#fff' }}>{item.symbol}</div>
                      <div style={{ fontSize: '10px', color: '#9ca3af' }}>{item.name}</div>
                    </div>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                      {item.icon}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: '8px' }}>
                  <div>
                    <span style={{ color: '#9ca3af' }}>المبلغ المستثمر: </span>
                    <span style={{ fontWeight: 'bold', color: '#fff' }}>${item.dollarAmount.toLocaleString()}</span>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <span style={{ color: '#9ca3af' }}>القيمـة المستهدفة: </span>
                    <span style={{ fontWeight: 'bold', color: '#10b981' }}>${item.expectedValue.toLocaleString()}</span>
                  </div>
                </div>

                <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', lineHeight: '1.4', direction: 'rtl' }}>
                  💡 <b>سبب الاختيار:</b> {item.thesis}
                </p>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* FULL COIN EVALUATION TABLE SECTION ("تقييم جميع العملات 📊") */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden', marginTop: '8px' }}>
        
        {/* Table Header Banner */}
        <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>{ratedCoins.length} عملة محللة (تحديث حي)</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#fff', fontWeight: 'bold' }}>تقييم جميع العملات 📊</h3>
          </div>
        </div>

        {/* Coin Ranking Rows */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {ratedCoins.map((coin) => (
            <div
              key={coin.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                background: coin.rank <= 3 ? 'rgba(245, 158, 11, 0.03)' : 'transparent',
                transition: 'background 0.2s'
              }}
            >
              {/* Left Side: Score & Rating Badge */}
              <div style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {coin.rank <= 3 && <span style={{ fontSize: '16px' }}>🏆</span>}
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '15px', color: coin.score >= 65 ? '#10b981' : coin.score >= 50 ? '#f59e0b' : '#f87171' }}>
                    {coin.score}
                  </div>
                  <div style={{ fontSize: '10px', color: '#9ca3af' }}>{coin.evalText}</div>
                </div>
              </div>

              {/* Right Side: Rank, Icon, Name, Price */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#fff' }}>{coin.name}</div>
                  <div style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '500' }}>{coin.priceStr}</div>
                </div>

                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {coin.logoUrl ? (
                    <img 
                      src={coin.logoUrl} 
                      alt={coin.name} 
                      style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'contain' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <span style={{ fontSize: '18px' }}>{coin.icon}</span>
                  )}
                </div>

                <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'bold', width: '20px', textAlign: 'center' }}>
                  {coin.rank}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
