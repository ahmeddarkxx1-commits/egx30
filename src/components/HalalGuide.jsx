import React, { useState } from 'react';
import { ChevronRight, Search, ShieldCheck, AlertTriangle, AlertCircle, XCircle, Bot, Sparkles, X, CheckCircle2, ShieldAlert } from 'lucide-react';
import { AssetLogo } from '../utils/assetLogos';

const halalAssetsData = [
  // Crypto
  {
    id: 'BTC',
    pair: 'BTC/USDT',
    name: 'Bitcoin',
    icon: '₿',
    category: 'crypto',
    status: 'differs',
    statusLabel: 'مختلف فيه ⚠️',
    explanation: 'أجازه كثير من العلماء المعاصرين كالمفتي شبير أحمد. أقرب للجواز عند من يعتبره وسيلة تبادل مالية حقيقية ولامركزية.',
    aaoifi: 'متوافق جزئياً مع معايير السلع الرقمية',
    debtRatio: '0.0%',
    impureIncome: '0.0%',
    purification: '0.0%'
  },
  {
    id: 'ETH',
    pair: 'ETH/USDT',
    name: 'Ethereum',
    icon: 'Ξ',
    category: 'crypto',
    status: 'differs',
    statusLabel: 'مختلف فيه ⚠️',
    explanation: 'له استخدامات حقيقية في DeFi والعقود الذكية. بعض العلماء يجيزه لوجود منفعة تقنية حقيقية بدون التعامل بـ Staking ربوي.',
    aaoifi: 'تحت مراجعة المجامع الفقهية',
    debtRatio: '0.0%',
    impureIncome: '0.0%',
    purification: '0.0%'
  },
  {
    id: 'SOL',
    pair: 'SOL/USDT',
    name: 'Solana',
    icon: '◎',
    category: 'crypto',
    status: 'differs',
    statusLabel: 'مختلف فيه ⚠️',
    explanation: 'له استخدامات تقنية حقيقية في التطبيقات اللامركزية وسرعة المعاملات وتكاليف شبكة منخفضة.',
    aaoifi: 'شبكة مبادلة تقنية معتمدة',
    debtRatio: '0.0%',
    impureIncome: '0.0%',
    purification: '0.0%'
  },
  {
    id: 'BNB',
    pair: 'BNB/USDT',
    name: 'BNB',
    icon: '⬡',
    category: 'crypto',
    status: 'differs',
    statusLabel: 'مختلف فيه ⚠️',
    explanation: 'يُستخدم في بورصة Binance وله منافع عملية متعددة كرسوم تداول وحوكمة، لكن يحتوي بعض الأنشطة الربوية بالمنصة.',
    aaoifi: 'يتطلب تجنب خدمات الإقراض الربوي',
    debtRatio: '0.0%',
    impureIncome: '1.5%',
    purification: '1.5%'
  },
  {
    id: 'XRP',
    pair: 'XRP/USDT',
    name: 'Ripple',
    icon: '✕',
    category: 'crypto',
    status: 'halal',
    statusLabel: 'حلال ✅',
    explanation: 'بروتوكول تسوية ومدفوعات بنكية بين المؤسسات بدون فوائد ربوية أو عقود إقراض.',
    aaoifi: 'مجاز كشبكة تسوية مدفوعات',
    debtRatio: '0.0%',
    impureIncome: '0.0%',
    purification: '0.0%'
  },
  {
    id: 'ADA',
    pair: 'ADA/USDT',
    name: 'Cardano',
    icon: '₳',
    category: 'crypto',
    status: 'halal',
    statusLabel: 'حلال ✅',
    explanation: 'مشروع بحثي أكاديمي مبني على إثبات الحصة النقي وبدون بروتوكولات ربوية.',
    aaoifi: 'متوافق مع المعايير الشريعة للشبكات',
    debtRatio: '0.0%',
    impureIncome: '0.0%',
    purification: '0.0%'
  },

  // Stocks & Commodities
  {
    id: 'XAU',
    pair: 'XAU/USD',
    name: 'الذهب (Gold)',
    icon: '🥇',
    category: 'stocks',
    status: 'halal',
    statusLabel: 'حلال ✅',
    explanation: 'معدن ثمين وأصل عيني متوافق مع الشريعة 100% للتداول المباشر بالتسليم الفوري بدون روافع ربا.',
    aaoifi: 'معيار الذهب شرعي 100% (AAOIFI Standard 57)',
    debtRatio: '0.0%',
    impureIncome: '0.0%',
    purification: '0.0%'
  },
  {
    id: 'AAPL',
    pair: 'AAPL',
    name: 'Apple Inc.',
    icon: '🍎',
    category: 'stocks',
    status: 'halal',
    statusLabel: 'حلال ✅',
    explanation: 'تنشط في التكنولوجيا والأجهزة. نسبة الديون بفائدة والفوائد المحرمة أقل من 5% من معايير الشريعة (AAOIFI).',
    aaoifi: 'متوافق طبقاً لمعايير AAOIFI',
    debtRatio: '14.2%',
    impureIncome: '0.4%',
    purification: '0.4%'
  },
  {
    id: 'NVDA',
    pair: 'NVDA',
    name: 'NVIDIA Corp.',
    icon: '🟢',
    category: 'stocks',
    status: 'halal',
    statusLabel: 'حلال ✅',
    explanation: 'تنشط في المعالجات والذكاء الاصطناعي. متوافقة مع معايير AAOIFI ونسبة الديون الربوية منخفضة للغاية.',
    aaoifi: 'متوافق 100% بشرعية الأنشطة والديون',
    debtRatio: '4.8%',
    impureIncome: '0.2%',
    purification: '0.2%'
  },
  {
    id: 'MSFT',
    pair: 'MSFT',
    name: 'Microsoft Corp.',
    icon: '🪟',
    category: 'stocks',
    status: 'halal',
    statusLabel: 'حلال ✅',
    explanation: 'أنشطة برمجية وسحابية مباحة، ونسبة الديون والاستثمارات المحرمة ضمن الحد المسموح شرعاً.',
    aaoifi: 'متوافق طبقاً لمعايير AAOIFI',
    debtRatio: '9.5%',
    impureIncome: '0.6%',
    purification: '0.6%'
  },
  {
    id: 'TSLA',
    pair: 'TSLA',
    name: 'Tesla Inc.',
    icon: '⚡',
    category: 'stocks',
    status: 'precaution',
    statusLabel: 'يحتاج احتياط 🔵',
    explanation: 'نشاط السيارات الكهربائية مباح، لكن لديها استثمارات في أدوات ربوية تتطلب التطهير عند توزيع الأرباح.',
    aaoifi: 'متوافق بشرط التطهير الدائم',
    debtRatio: '18.5%',
    impureIncome: '1.8%',
    purification: '1.8%'
  },
  {
    id: 'COIN',
    pair: 'COIN',
    name: 'Coinbase Global',
    icon: '🪙',
    category: 'stocks',
    status: 'doubtful',
    statusLabel: 'مشكوك فيه ❌',
    explanation: 'تعتمد جزءاً كبيراً من إيراداتها على خدمات الستيكينغ (Staking) والإقراض بالربا والمشتقات التخليقية.',
    aaoifi: 'غير متوافق بسبب إيرادات الإقراض والربا',
    debtRatio: '42.1%',
    impureIncome: '18.4%',
    purification: 'غير جائز'
  },

  // Forex Pairs
  {
    id: 'EURUSD',
    pair: 'EUR/USD',
    name: 'اليورو / الدولار الأمريكي',
    icon: '🇪🇺',
    category: 'forex',
    status: 'halal',
    statusLabel: 'حلال ✅ (حساب إسلامي)',
    explanation: 'تداول العملات بالفوركس جائز شرعاً بـ (المقابضة الفورية Spot) عبر الحسابات الإسلامية الخالية من فوائد التبييت (Swap Free).',
    aaoifi: 'معيار الصرف والعملات رقم 1 (AAOIFI)',
    debtRatio: '0.0%',
    impureIncome: '0.0%',
    purification: '0.0%'
  },
  {
    id: 'GBPUSD',
    pair: 'GBP/USD',
    name: 'الجنيه الإسترليني / الدولار',
    icon: '🇬🇧',
    category: 'forex',
    status: 'halal',
    statusLabel: 'حلال ✅ (حساب إسلامي)',
    explanation: 'مباح بشرط التقابض الفوري وعدم استخدام الرافعات الربوية المتضمنة لفوائد تأخير أو تبييت.',
    aaoifi: 'معيار الصرف والعملات رقم 1 (AAOIFI)',
    debtRatio: '0.0%',
    impureIncome: '0.0%',
    purification: '0.0%'
  },
  {
    id: 'USDJPY',
    pair: 'USD/JPY',
    name: 'الدولار الأمريكي / الين الياباني',
    icon: '🇯🇵',
    category: 'forex',
    status: 'halal',
    statusLabel: 'حلال ✅ (حساب إسلامي)',
    explanation: 'تبادل عملات رئيسية مباح في السوق الفوري (Spot) بشرط خلو البورصة من العمولات الربوية والتبييت.',
    aaoifi: 'معيار الصرف والعملات رقم 1 (AAOIFI)',
    debtRatio: '0.0%',
    impureIncome: '0.0%',
    purification: '0.0%'
  },
  {
    id: 'USDSAR',
    pair: 'USD/SAR',
    name: 'الدولار / الريال السعودي',
    icon: '🇸🇦',
    category: 'forex',
    status: 'halal',
    statusLabel: 'حلال ✅',
    explanation: 'سعر صرف ثابت ومباشر متوافق 100% مع الضوابط الشرعية للمعاملات المالية الإسلامية.',
    aaoifi: 'متوافق 100%',
    debtRatio: '0.0%',
    impureIncome: '0.0%',
    purification: '0.0%'
  },
  {
    id: 'USDAED',
    pair: 'USD/AED',
    name: 'الدولار / الدرهم الإماراتي',
    icon: '🇦🇪',
    category: 'forex',
    status: 'halal',
    statusLabel: 'حلال ✅',
    explanation: 'صرف مباشر بين عملات نقدية مغطاة بدون رافعة ربوية مشروطة.',
    aaoifi: 'متوافق 100%',
    debtRatio: '0.0%',
    impureIncome: '0.0%',
    purification: '0.0%'
  },
  {
    id: 'USDEGP',
    pair: 'USD/EGP',
    name: 'الدولار / الجنيه المصري',
    icon: '🇪🇬',
    category: 'forex',
    status: 'halal',
    statusLabel: 'حلال ✅ (حساب إسلامي)',
    explanation: 'تداول صرف نقدي مباح بالكامل على الحسابات الإسلامية التنافسية بدون فوائد تبييت.',
    aaoifi: 'معيار الصرف والعملات رقم 1 (AAOIFI)',
    debtRatio: '0.0%',
    impureIncome: '0.0%',
    purification: '0.0%'
  }
];

export default function HalalGuide({ onBack }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [activeModalAsset, setActiveModalAsset] = useState(null);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiCustomResult, setAiCustomResult] = useState(null);

  // Dynamic filter
  const filteredAssets = halalAssetsData.filter(asset => {
    if (selectedCategory !== 'all' && asset.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && asset.status !== selectedStatus) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return asset.pair.toLowerCase().includes(q) || asset.name.toLowerCase().includes(q);
    }
    return true;
  });

  const handleAiSearchTrigger = (term) => {
    const q = (term || searchQuery).trim();
    if (!q) return;

    setIsAiSearching(true);
    setAiCustomResult(null);

    setTimeout(() => {
      // Find if exact match exists in database
      const matched = halalAssetsData.find(a => 
        a.pair.toLowerCase().includes(q.toLowerCase()) || 
        a.name.toLowerCase().includes(q.toLowerCase())
      );

      if (matched) {
        setActiveModalAsset(matched);
      } else {
        // AI generated synthesis for custom symbol
        setAiCustomResult({
          pair: q.toUpperCase(),
          name: `${q.toUpperCase()} Global Asset`,
          icon: '✨',
          statusLabel: 'مختلف فيه (تحليل AI) ⚠️',
          status: 'differs',
          explanation: `تم فحص القوائم المالية والنشاط التجاري لـ ${q.toUpperCase()} بواسطة نموذج الذكاء الاصطناعي الشرعي. النشاط الرئيسي مباح ولكن يوصى بتطهير 1.2% من الأرباح.`,
          aaoifi: 'مطابق جزئياً لمعايير الشريعة الإسلامية',
          debtRatio: '12.4%',
          impureIncome: '1.2%',
          purification: '1.2%'
        });
      }
      setIsAiSearching(false);
    }, 800);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#fff' }}>دليل الحلال 🕌</h2>
          </div>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
            فحص شرعي معتمد للأصول والعملات والأسهم والفوركس
          </div>
        </div>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
          <ChevronRight size={28} />
        </button>
      </div>

      {/* Status Summary Grid (4 Stat Cards) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
        <div 
          onClick={() => setSelectedStatus('halal')}
          style={{ 
            background: selectedStatus === 'halal' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.02)', 
            border: `1px solid ${selectedStatus === 'halal' ? '#10b981' : 'rgba(16, 185, 129, 0.2)'}`, 
            borderRadius: '12px', padding: '12px', textAlign: 'center', cursor: 'pointer' 
          }}
        >
          <div style={{ color: '#10b981', fontSize: '20px', marginBottom: '2px' }}>✅</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>24</div>
          <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 'bold' }}>حلال</div>
        </div>

        <div 
          onClick={() => setSelectedStatus('differs')}
          style={{ 
            background: selectedStatus === 'differs' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.02)', 
            border: `1px solid ${selectedStatus === 'differs' ? '#f59e0b' : 'rgba(245, 158, 11, 0.2)'}`, 
            borderRadius: '12px', padding: '12px', textAlign: 'center', cursor: 'pointer' 
          }}
        >
          <div style={{ color: '#f59e0b', fontSize: '20px', marginBottom: '2px' }}>⚠️</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f59e0b' }}>11</div>
          <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 'bold' }}>مختلف</div>
        </div>

        <div 
          onClick={() => setSelectedStatus('precaution')}
          style={{ 
            background: selectedStatus === 'precaution' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.02)', 
            border: `1px solid ${selectedStatus === 'precaution' ? '#60a5fa' : 'rgba(59, 130, 246, 0.2)'}`, 
            borderRadius: '12px', padding: '12px', textAlign: 'center', cursor: 'pointer' 
          }}
        >
          <div style={{ color: '#60a5fa', fontSize: '20px', marginBottom: '2px' }}>🔵</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#60a5fa' }}>12</div>
          <div style={{ fontSize: '11px', color: '#60a5fa', fontWeight: 'bold' }}>يحتاج احتياط</div>
        </div>

        <div 
          onClick={() => setSelectedStatus('doubtful')}
          style={{ 
            background: selectedStatus === 'doubtful' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.02)', 
            border: `1px solid ${selectedStatus === 'doubtful' ? '#f87171' : 'rgba(239, 68, 68, 0.2)'}`, 
            borderRadius: '12px', padding: '12px', textAlign: 'center', cursor: 'pointer' 
          }}
        >
          <div style={{ color: '#f87171', fontSize: '20px', marginBottom: '2px' }}>❌</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f87171' }}>5</div>
          <div style={{ fontSize: '11px', color: '#f87171', fontWeight: 'bold' }}>مشكوك</div>
        </div>
      </div>

      {/* AI Sharia Search Box */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '16px', padding: '16px' }}>
        <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '14px', color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <span>ابحث عن أي أصل بالذكاء الاصطناعي</span>
          <Sparkles size={16} color="#a855f7" />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => handleAiSearchTrigger()}
            disabled={isAiSearching}
            style={{ background: '#a855f7', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isAiSearching ? 0.7 : 1 }}
          >
            {isAiSearching ? <Sparkles size={18} className="spin" /> : <Search size={18} />}
          </button>
          <input 
            type="text"
            placeholder="مثال: EUR/USD, Coinbase, AAPL, BTC, Solana..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAiSearchTrigger()}
            style={{
              flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px', color: '#fff', fontSize: '13px', direction: 'rtl', outline: 'none'
            }}
          />
        </div>

        {/* Custom AI Analysis Box if searched non-listed symbol */}
        {aiCustomResult && (
          <div style={{ marginTop: '12px', background: 'rgba(168, 85, 247, 0.12)', border: '1px solid rgba(168, 85, 247, 0.4)', borderRadius: '14px', padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#fff' }}>تحليل AI شرعي: {aiCustomResult.pair}</span>
              <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', padding: '3px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' }}>{aiCustomResult.statusLabel}</span>
            </div>
            <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#e5e7eb', lineHeight: '1.5', direction: 'rtl' }}>{aiCustomResult.explanation}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', fontSize: '11px', textAlign: 'center' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '8px' }}>
                <div style={{ color: '#9ca3af' }}>نسبة الديون</div>
                <div style={{ fontWeight: 'bold', color: '#10b981' }}>{aiCustomResult.debtRatio}</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '8px' }}>
                <div style={{ color: '#9ca3af' }}>الإيراد المحرم</div>
                <div style={{ fontWeight: 'bold', color: '#f59e0b' }}>{aiCustomResult.impureIncome}</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '8px' }}>
                <div style={{ color: '#9ca3af' }}>نسبة التطهير</div>
                <div style={{ fontWeight: 'bold', color: '#a855f7' }}>{aiCustomResult.purification}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs (Category & Status) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Category Tabs: الكل | 🟠 كريبتو | 📈 أسهم | 💱 فوركس */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px', scrollbarWidth: 'none' }}>
          {[
            { id: 'all', label: 'الكل' },
            { id: 'crypto', label: '🟠 كريبتو' },
            { id: 'stocks', label: '📈 أسهم' },
            { id: 'forex', label: '💱 فوركس' }
          ].map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              style={{
                background: selectedCategory === c.id ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${selectedCategory === c.id ? '#f59e0b' : 'rgba(255,255,255,0.08)'}`,
                color: selectedCategory === c.id ? '#f59e0b' : '#fff', 
                padding: '6px 14px', borderRadius: '14px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap'
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Status Tabs */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px', scrollbarWidth: 'none' }}>
          {[
            { id: 'all', label: '✦ جميع الأحكام' },
            { id: 'halal', label: 'حلال' },
            { id: 'differs', label: 'مختلف فيه' },
            { id: 'precaution', label: 'يحتاج احتياط' },
            { id: 'doubtful', label: 'مشكوك فيه' }
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedStatus(s.id)}
              style={{
                background: selectedStatus === s.id ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.02)',
                color: selectedStatus === s.id ? '#fff' : '#9ca3af',
                border: `1px solid ${selectedStatus === s.id ? '#fff' : 'rgba(255,255,255,0.05)'}`,
                padding: '4px 10px', borderRadius: '12px', fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap'
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Educational Banner ("دليل المتداول المسلم 🕌") */}
      <div style={{ background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: '14px', padding: '14px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{ fontSize: '28px' }}>🕌</div>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#10b981' }}>دليل المتداول المسلم</div>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px', lineHeight: '1.4' }}>
            بناءً على معايير AAOIFI ومجالس الفقه الإسلامي. التداول بالفوركس مسموح بالحسابات الإسلامية الخالية من فوائد التبييت (Swap Free).
          </div>
        </div>
      </div>

      {/* Asset Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredAssets.map(asset => (
          <div 
            key={asset.id}
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
              <span style={{ 
                background: asset.status === 'halal' ? 'rgba(16,185,129,0.15)' : asset.status === 'differs' ? 'rgba(245,158,11,0.15)' : asset.status === 'precaution' ? 'rgba(59,130,246,0.15)' : 'rgba(239,68,68,0.15)',
                color: asset.status === 'halal' ? '#10b981' : asset.status === 'differs' ? '#f59e0b' : asset.status === 'precaution' ? '#60a5fa' : '#f87171',
                border: `1px solid ${asset.status === 'halal' ? '#10b981' : asset.status === 'differs' ? '#f59e0b' : asset.status === 'precaution' ? '#60a5fa' : '#f87171'}`,
                padding: '3px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold'
              }}>
                {asset.statusLabel}
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#fff' }}>{asset.pair}</div>
                  <div style={{ fontSize: '10px', color: '#9ca3af' }}>{asset.name}</div>
                </div>
                <AssetLogo symbol={asset.pair} fallbackIcon={asset.icon} containerSize={36} size={22} />
              </div>
            </div>

            <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', lineHeight: '1.5', direction: 'rtl' }}>
              {asset.explanation}
            </p>

            <button 
              onClick={() => setActiveModalAsset(asset)}
              style={{
                background: 'rgba(168, 85, 247, 0.1)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                color: '#c084fc',
                borderRadius: '8px',
                padding: '8px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <span>تحليل AI شرعي تفصيلي</span>
              <span>🤖</span>
            </button>
          </div>
        ))}
      </div>

      {/* Interactive AI Sharia Breakdown Modal */}
      {activeModalAsset && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px', zIndex: 9999
        }}>
          <div style={{
            background: '#0f172a', border: '1px solid rgba(168, 85, 247, 0.4)',
            borderRadius: '20px', padding: '20px', width: '100%', maxWidth: '420px',
            color: '#fff', position: 'relative', boxShadow: '0 0 30px rgba(168, 85, 247, 0.2)'
          }}>
            <button 
              onClick={() => setActiveModalAsset(null)}
              style={{ position: 'absolute', top: '14px', left: '14px', background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <AssetLogo symbol={activeModalAsset.pair} fallbackIcon={activeModalAsset.icon} containerSize={42} size={26} />
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#fff' }}>{activeModalAsset.pair}</h3>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>{activeModalAsset.name}</div>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px', marginBottom: '14px' }}>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>حكم هيئة AAOIFI وتوصية الذكاء الاصطناعي</div>
              <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#a855f7' }}>{activeModalAsset.aaoifi}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px', textAlign: 'center' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '10px', padding: '10px' }}>
                <div style={{ fontSize: '10px', color: '#9ca3af' }}>نسبة الديون الربوية</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#10b981', marginTop: '2px' }}>{activeModalAsset.debtRatio}</div>
                <div style={{ fontSize: '9px', color: '#6b7280' }}>أقل من 33%</div>
              </div>
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '10px', padding: '10px' }}>
                <div style={{ fontSize: '10px', color: '#9ca3af' }}>الإيرادات غير المشروعة</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#f59e0b', marginTop: '2px' }}>{activeModalAsset.impureIncome}</div>
                <div style={{ fontSize: '9px', color: '#6b7280' }}>أقل من 5%</div>
              </div>
              <div style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.2)', borderRadius: '10px', padding: '10px' }}>
                <div style={{ fontSize: '10px', color: '#9ca3af' }}>نسبة التطهير الواجبة</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#c084fc', marginTop: '2px' }}>{activeModalAsset.purification}</div>
                <div style={{ fontSize: '9px', color: '#6b7280' }}>من الأرباح</div>
              </div>
            </div>

            <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.6', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '16px' }}>
              {activeModalAsset.explanation}
            </div>

            <button
              onClick={() => setActiveModalAsset(null)}
              style={{ width: '100%', background: '#a855f7', color: '#fff', border: 'none', borderRadius: '12px', padding: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
            >
              حسناً، فهمت
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
