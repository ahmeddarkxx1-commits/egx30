import React, { useState } from 'react';
import { ChevronRight, Sparkles, TrendingUp, ShieldCheck, PieChart, DollarSign, Calculator, Award, Zap } from 'lucide-react';

const portfolios = {
  conservative: {
    name: 'المحفظة الآمنة 🛡️',
    desc: 'مخاطرة منخفضة · تركيز على الأصول الراسخة والذهب الرقمي',
    expectedReturn: '+18% إلى +25% سنوياً',
    riskLevel: 'منخفضة 🟢',
    allocations: [
      { pair: 'BTC/USDT', name: 'Bitcoin', icon: '₿', percent: 50, price: '$84,250', target: '$120,000', score: 95, thesis: 'مخزن القيمة الأساسي والأكثر أماناً للاستثمار طويل الأجل.' },
      { pair: 'ETH/USDT', name: 'Ethereum', icon: 'Ξ', percent: 30, price: '$2,678', target: '$4,500', score: 91, thesis: 'عمود الاقتصاد الرقمي والشبكات اللامركزية.' },
      { pair: 'PAXG/USDT', name: 'Gold Digital', icon: '🥇', percent: 20, price: '$2,682', target: '$3,100', score: 98, thesis: 'تحوط ضد التضخم وتقلبات الأسواق.' }
    ]
  },
  balanced: {
    name: 'المحفظة المتوازنة ⚖️',
    desc: 'مخاطرة متوسطة · توازن مثالي بين الأمان والنمو السريع',
    expectedReturn: '+35% إلى +60% سنوياً',
    riskLevel: 'متوسطة 🟡',
    allocations: [
      { pair: 'BTC/USDT', name: 'Bitcoin', icon: '₿', percent: 35, price: '$84,250', target: '$120,000', score: 95, thesis: 'أمان الأصول وتثبيت رأس المال.' },
      { pair: 'ETH/USDT', name: 'Ethereum', icon: 'Ξ', percent: 25, price: '$2,678', target: '$4,500', score: 91, thesis: 'نمو قوي وتطبيق العقود الذكية.' },
      { pair: 'SOL/USDT', name: 'Solana', icon: '◎', percent: 20, price: '$121.45', target: '$250', score: 88, thesis: 'أسرع شبكة بلوكتشين وتدفق سيولة عالي.' },
      { pair: 'BNB/USDT', name: 'Binance Coin', icon: '🔶', percent: 10, price: '$585.00', target: '$900', score: 86, thesis: 'عملة المنصة الأولى عالمياً مع حرق دوري.' },
      { pair: 'LINK/USDT', name: 'Chainlink', icon: '⬢', percent: 10, price: '$13.95', target: '$32', score: 84, thesis: 'جسر البيانات الأهم بين البنوك والتطبيقات.' }
    ]
  },
  growth: {
    name: 'محفظة النمو العالي 🚀',
    desc: 'مخاطرة مرتفعة · تركيز على مشاريع الذكاء الاصطناعي والبنية التحتية',
    expectedReturn: '+90% إلى +180% سنوياً',
    riskLevel: 'مرتفعة 🔴',
    allocations: [
      { pair: 'SOL/USDT', name: 'Solana', icon: '◎', percent: 30, price: '$121.45', target: '$280', score: 88, thesis: 'منظومة سريعة النمو وجذب المطورين.' },
      { pair: 'RENDER/USDT', name: 'Render AI', icon: '🎨', percent: 25, price: '$5.40', target: '$18', score: 89, thesis: 'شبكة الحوسبة السحابية والرندرة للذكاء الاصطناعي.' },
      { pair: 'FET/USDT', name: 'Artificial Superintelligence', icon: '🤖', percent: 25, price: '$1.45', target: '$5.50', score: 87, thesis: 'ائتلاف شركات الذكاء الاصطناعي اللامركزي.' },
      { pair: 'AVAX/USDT', name: 'Avalanche', icon: '🔺', percent: 20, price: '$28.10', target: '$75', score: 82, thesis: 'شبكات المؤسسات المالية والتوسع السريع.' }
    ]
  },
  yield: {
    name: 'محفظة العوائد الدورية (Staking) 💰',
    desc: 'تحقيق دخل منفصل عبر الستيكينغ والعوائد التراكمية',
    expectedReturn: '+12% إلى +18% APY ثابته',
    riskLevel: 'منخفضة 🟢',
    allocations: [
      { pair: 'ETH (Staked)', name: 'Lido Staked ETH', icon: '💧', percent: 40, price: '$2,678', target: '5.2% APY', score: 94, thesis: 'عائد استثمار سنوي مباشر بالايثريوم.' },
      { pair: 'SOL (Staked)', name: 'Jito SOL Staking', icon: '🌿', percent: 35, price: '$121.45', target: '7.8% APY', score: 90, thesis: 'أفضل عائد ستيكينغ مدعوم بأرباح الشبكة.' },
      { pair: 'DOT (Staked)', name: 'Polkadot Staking', icon: '🟣', percent: 25, price: '$4.25', target: '11.8% APY', score: 85, thesis: 'أعلى نسبة عائد سنوي مثبت للأصول التأسيسية.' }
    ]
  }
};

export default function InvestmentBot({ onBack }) {
  const [activeStrategy, setActiveStrategy] = useState('balanced');
  const [monthlyAmount, setMonthlyAmount] = useState(250);
  const [years, setYears] = useState(3);
  const [aiPortfolioGenerated, setAiPortfolioGenerated] = useState(false);

  const strategy = portfolios[activeStrategy];

  // DCA Calculation logic
  const totalMonths = years * 12;
  const investedAmount = monthlyAmount * totalMonths;
  const returnRate = activeStrategy === 'growth' ? 0.85 : activeStrategy === 'balanced' ? 0.45 : activeStrategy === 'conservative' ? 0.22 : 0.15;
  
  // Future Value with compound growth formula
  const monthlyRate = returnRate / 12;
  const estimatedFutureValue = Math.round(monthlyAmount * (((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate)));
  const estimatedProfit = estimatedFutureValue - investedAmount;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#fff' }}>بوت الاستثمار الذكي 🌱</h2>
            <span style={{ fontSize: '11px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
              HODL AI
            </span>
          </div>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
            توصيات المحافظ طويلة الأجل والاستثمار التراكمي الذكي (DCA)
          </div>
        </div>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
          <ChevronRight size={28} />
        </button>
      </div>

      {/* Strategy Filter Tabs */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
        {[
          { id: 'conservative', label: '🛡️ آمنة' },
          { id: 'balanced', label: '⚖️ متوازنة' },
          { id: 'growth', label: '🚀 نمو عالي' },
          { id: 'yield', label: '💰 عوائد Staking' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveStrategy(tab.id)}
            style={{
              background: activeStrategy === tab.id ? '#f59e0b' : 'rgba(255,255,255,0.03)',
              color: activeStrategy === tab.id ? '#000' : '#fff',
              border: `1px solid ${activeStrategy === tab.id ? '#f59e0b' : 'rgba(255,255,255,0.08)'}`,
              padding: '8px 14px', borderRadius: '14px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Selected Strategy Banner */}
      <div style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(16, 185, 129, 0.08) 100%)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '16px', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.1)', padding: '3px 8px', borderRadius: '8px', color: '#fff' }}>درجة المخاطرة: {strategy.riskLevel}</span>
          <h3 style={{ margin: 0, fontSize: '16px', color: '#f59e0b' }}>{strategy.name}</h3>
        </div>
        <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#9ca3af' }}>{strategy.desc}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 'bold', color: '#10b981' }}>
          <TrendingUp size={16} />
          <span>العائد المتوقع: {strategy.expectedReturn}</span>
        </div>
      </div>

      {/* Smart DCA Calculator Box */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Calculator size={18} color="#f59e0b" />
          <h4 style={{ margin: 0, fontSize: '14px', color: '#fff' }}>حاسبة الاستثمار التراكمي (DCA Calculator)</h4>
        </div>

        {/* Inputs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
          <div>
            <label style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>المبلغ الشهري ($)</label>
            <select
              value={monthlyAmount}
              onChange={(e) => setMonthlyAmount(Number(e.target.value))}
              style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px', color: '#fff', fontSize: '13px', direction: 'rtl' }}
            >
              <option value={50}>50 $ / شهرياً</option>
              <option value={100}>100 $ / شهرياً</option>
              <option value={250}>250 $ / شهرياً</option>
              <option value={500}>500 $ / شهرياً</option>
              <option value={1000}>1,000 $ / شهرياً</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>مدة الاستثمار</label>
            <select
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px', color: '#fff', fontSize: '13px', direction: 'rtl' }}
            >
              <option value={1}>سنة واحدة (12 شهر)</option>
              <option value={3}>3 سنوات (36 شهر)</option>
              <option value={5}>5 سنوات (60 شهر)</option>
            </select>
          </div>
        </div>

        {/* Calculation Result */}
        <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px', padding: '12px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '10px', color: '#9ca3af' }}>إجمالي المدخرات</div>
            <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#fff', marginTop: '2px' }}>${investedAmount.toLocaleString()}</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#10b981', fontWeight: 'bold' }}>الأرباح التقديرية</div>
            <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#10b981', marginTop: '2px' }}>+${estimatedProfit.toLocaleString()}</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#f59e0b', fontWeight: 'bold' }}>القيمة المتوقعة 🚀</div>
            <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#f59e0b', marginTop: '2px' }}>${estimatedFutureValue.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Recommended Coins List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 'bold', textAlign: 'right' }}>
          توزيع الأصول الموصى به لهذه المحفظة:
        </div>

        {strategy.allocations.map((item, idx) => (
          <div 
            key={item.pair}
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '14px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', padding: '3px 8px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                  نسبة {item.percent}%
                </span>
                <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '3px 8px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                  score {item.score}
                </span>
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
                <span style={{ color: '#9ca3af' }}>السعر الحالي: </span>
                <span style={{ fontWeight: 'bold', color: '#fff' }}>{item.price}</span>
              </div>
              <div style={{ textAlign: 'left' }}>
                <span style={{ color: '#9ca3af' }}>الهدف المستقبلي: </span>
                <span style={{ fontWeight: 'bold', color: '#10b981' }}>{item.target}</span>
              </div>
            </div>

            <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', lineHeight: '1.4', direction: 'rtl' }}>
              💡 <b>رؤية الذكاء الاصطناعي:</b> {item.thesis}
            </p>
          </div>
        ))}
      </div>

      {/* AI Custom Portfolio Generator Button */}
      <button 
        onClick={() => setAiPortfolioGenerated(true)}
        style={{
          width: '100%',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: '#fff',
          padding: '16px',
          borderRadius: '14px',
          fontWeight: 'bold',
          fontSize: '15px',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)',
          marginTop: '8px',
          marginBottom: '20px'
        }}
      >
        <Sparkles size={18} />
        <span>توليد محفظة مخصصة بالذكاء الاصطناعي 🤖</span>
      </button>

      {/* AI Generated Modal Confirmation */}
      {aiPortfolioGenerated && (
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '14px', padding: '16px', fontSize: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#10b981', marginBottom: '6px' }}>
            🎉 تم إنشاء خطة الاستثمار التراكمي المخصصة لك!
          </div>
          <p style={{ margin: '0 0 10px 0', color: '#e5e7eb', lineHeight: '1.5' }}>
            تم تحليل أداء السوق وإعداد جدول الشراء الدوري الشهري (DCA) بنجاح. يمكنك المتابعة أو ربط المحفظة للبدء فوراً.
          </p>
          <button 
            onClick={() => setAiPortfolioGenerated(false)}
            style={{ background: '#10b981', color: '#000', border: 'none', padding: '6px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            إغلاق
          </button>
        </div>
      )}

    </div>
  );
}
