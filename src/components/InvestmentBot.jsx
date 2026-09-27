import React, { useState } from 'react';
import { ChevronRight, Sparkles, TrendingUp, ShieldCheck, PieChart, DollarSign, Calculator, Check, Lock, ArrowUpRight } from 'lucide-react';

const allInvestableAssets = [
  { id: 'BTC', pair: 'BTC/USDT', name: 'Bitcoin', icon: '₿', category: 'crypto', isHalal: true, basePrice: 84250, targetMultiplier: 1.45, risk: 'منخفضة 🟢', score: 96, thesis: 'مخزن القيمة الرقمي الأساسي لجميع المحافظ طويلة الأجل.' },
  { id: 'ETH', pair: 'ETH/USDT', name: 'Ethereum', icon: 'Ξ', category: 'crypto', isHalal: true, basePrice: 2678, targetMultiplier: 1.65, risk: 'منخفضة 🟢', score: 92, thesis: 'عمود اقتصاد العقود الذكية والتطبيقات اللامركزية.' },
  { id: 'PAXG', pair: 'PAXG/USDT', name: 'الذهب الرقمي (PAX Gold)', icon: '🥇', category: 'metals', isHalal: true, basePrice: 2682, targetMultiplier: 1.18, risk: 'آمن جداً 🟢', score: 98, thesis: 'تحوط عالي الأمان ومطابق للشريعة 100% ضد التضخم.' },
  { id: 'SOL', pair: 'SOL/USDT', name: 'Solana', icon: '◎', category: 'crypto', isHalal: true, basePrice: 121.45, targetMultiplier: 2.10, risk: 'متوسطة 🟡', score: 88, thesis: 'بلوكتشين عالي السرعة مع جذب هائل للمطورين والسيولة.' },
  { id: 'NVDA', pair: 'NVDA', name: 'NVIDIA Corp', icon: '🟢', category: 'stocks', isHalal: true, basePrice: 120, targetMultiplier: 1.80, risk: 'متوسطة 🟡', score: 94, thesis: 'العملاق القائد لثورة معالجات الذكاء الاصطناعي.' },
  { id: 'AAPL', pair: 'AAPL', name: 'Apple Inc.', icon: '🍎', category: 'stocks', isHalal: true, basePrice: 225, targetMultiplier: 1.35, risk: 'منخفضة 🟢', score: 93, thesis: 'شركة تكنولوجية قوية تدفقات نقدية مستقرة ومتوافقة شرعاً.' },
  { id: 'LINK', pair: 'LINK/USDT', name: 'Chainlink', icon: '⬢', category: 'crypto', isHalal: true, basePrice: 13.95, targetMultiplier: 2.30, risk: 'متوسطة 🟡', score: 85, thesis: 'البنية التحتية لربط البنوك والمؤسسات بالبلوكتشين.' },
  { id: 'RENDER', pair: 'RENDER/USDT', name: 'Render Network', icon: '🎨', category: 'crypto', isHalal: true, basePrice: 5.40, targetMultiplier: 3.10, risk: 'عالية 🔴', score: 89, thesis: 'شبكة رندرة وحوسبة الذكاء الاصطناعي السحابية.' },
  { id: 'BNB', pair: 'BNB/USDT', name: 'Binance Coin', icon: '🔶', category: 'crypto', isHalal: false, basePrice: 585, targetMultiplier: 1.50, risk: 'متوسطة 🟡', score: 84, thesis: 'عملة منصة تداول مركزية (تتضمن خدمات ربوية).' },
  { id: 'COIN', pair: 'COIN', name: 'Coinbase Stock', icon: '🪙', category: 'stocks', isHalal: false, basePrice: 165, targetMultiplier: 1.90, risk: 'عالية 🔴', score: 80, thesis: 'أسهم بورصة كريبتو تعتمد على إيرادات الستيكينغ والإقراض الربوي.' }
];

export default function InvestmentBot({ onBack }) {
  const [investmentAmount, setInvestmentAmount] = useState('1000');
  const [durationMonths, setDurationMonths] = useState(12);
  const [halalOnly, setHalalOnly] = useState(true);
  const [riskTolerance, setRiskTolerance] = useState('balanced'); // 'conservative', 'balanced', 'growth'
  const [generatedPortfolio, setGeneratedPortfolio] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const numAmount = parseFloat(investmentAmount) || 0;

  const handleGeneratePortfolio = () => {
    setIsGenerating(true);

    setTimeout(() => {
      // Filter assets based on Halal toggle
      let eligible = allInvestableAssets.filter(a => !halalOnly || a.isHalal);

      // Select portfolio allocations
      let selected = [];
      if (riskTolerance === 'conservative') {
        selected = [
          { ...eligible.find(a => a.id === 'BTC') || eligible[0], sharePercent: 50 },
          { ...eligible.find(a => a.id === 'PAXG') || eligible[1], sharePercent: 30 },
          { ...eligible.find(a => a.id === 'ETH') || eligible[2], sharePercent: 20 }
        ];
      } else if (riskTolerance === 'growth') {
        selected = [
          { ...eligible.find(a => a.id === 'SOL') || eligible[0], sharePercent: 35 },
          { ...eligible.find(a => a.id === 'RENDER') || eligible[1], sharePercent: 25 },
          { ...eligible.find(a => a.id === 'NVDA') || eligible[2], sharePercent: 20 },
          { ...eligible.find(a => a.id === 'LINK') || eligible[3], sharePercent: 20 }
        ];
      } else {
        // Balanced
        selected = [
          { ...eligible.find(a => a.id === 'BTC') || eligible[0], sharePercent: 40 },
          { ...eligible.find(a => a.id === 'ETH') || eligible[1], sharePercent: 25 },
          { ...eligible.find(a => a.id === 'SOL') || eligible[2], sharePercent: 20 },
          { ...eligible.find(a => a.id === 'NVDA') || eligible[3], sharePercent: 15 }
        ];
      }

      // Calculate exact dollar allocations and expected returns
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
            <span style={{ fontSize: '11px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
              Smart Portfolio
            </span>
          </div>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
            صمم محفظتك الاستثمارية المخصصة حسب رأس مالك والمدة والشرعية
          </div>
        </div>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
          <ChevronRight size={28} />
        </button>
      </div>

      {/* Input Form Box */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        {/* 1. Custom Investment Amount */}
        <div>
          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <DollarSign size={16} color="#f59e0b" />
            <span>1. اكتب مبلغ الاستثمار المخصص ($)</span>
          </label>
          <div style={{ position: 'relative' }}>
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
          </div>
          {/* Quick Preset Amount Buttons */}
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

        {/* 2. Custom Duration */}
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

        {/* 3. Halal Filter Toggle */}
        <div style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🕌</span>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#10b981' }}>فلتر الحلال 100% (تصفية شرعية معتمدة)</div>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>استبعاد الأصول المشبوهة أو المتضمنة فوائد ربوية</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={halalOnly}
            onChange={(e) => setHalalOnly(e.target.checked)}
            style={{ width: '20px', height: '20px', accentColor: '#10b981', cursor: 'pointer' }}
          />
        </div>

        {/* 4. Risk Tolerance Selection */}
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

        {/* Generate Portfolio Button */}
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

      {/* Generated Portfolio Results Display */}
      {generatedPortfolio && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Summary Box */}
          <div style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(245, 158, 11, 0.08) 100%)', border: '1px solid #10b981', borderRadius: '16px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '11px', background: '#10b981', color: '#000', padding: '3px 8px', borderRadius: '8px', fontWeight: 'bold' }}>
                العائد التقديري المتوقع: +{generatedPortfolio.roiPercent}% 🚀
              </span>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#10b981', fontWeight: 'bold' }}>نتائج المحفظة المخصصة</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '10px' }}>
              <div>
                <div style={{ fontSize: '10px', color: '#9ca3af' }}>رأس المال النهائي</div>
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

          {/* Selected Assets List ("يختارلك كذا حاجة") */}
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
                      <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#fff' }}>{item.pair}</div>
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

    </div>
  );
}
