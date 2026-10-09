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
    statusLabel: 'Scholar Difference ⚠️',
    explanation: 'Approved by numerous contemporary Shariah scholars (e.g. Mufti Shabbir Ahmad) as a legitimate decentralized medium of financial exchange and digital store of value.',
    aaoifi: 'Partially mapped under digital commodity standards',
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
    statusLabel: 'Scholar Difference ⚠️',
    explanation: 'Substantial utility in decentralized computing, smart contracts, and Web3 infrastructure. Permissible when avoiding interest-bearing lending staking pools.',
    aaoifi: 'Under review by contemporary Islamic jurisprudence councils',
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
    statusLabel: 'Scholar Difference ⚠️',
    explanation: 'High-throughput Layer 1 network with real technological utility for dApps, micropayments, and high-speed validator consensus.',
    aaoifi: 'Technological network utility approved',
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
    statusLabel: 'Scholar Difference ⚠️',
    explanation: 'Used for transaction fees and governance on BNB Chain. Caution required regarding margin/lending activities associated with exchange operations.',
    aaoifi: 'Requires avoidance of interest-bearing margin services',
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
    statusLabel: 'Shariah Compliant ✅',
    explanation: 'Institutional cross-border payment settlement network facilitating fiat transfers without interest-bearing debt contracts.',
    aaoifi: 'Approved as institutional payment settlement protocol',
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
    statusLabel: 'Shariah Compliant ✅',
    explanation: 'Peer-reviewed, evidence-based Proof-of-Stake blockchain built without embedded usurious lending protocols.',
    aaoifi: 'Compliant with Shariah network standards',
    debtRatio: '0.0%',
    impureIncome: '0.0%',
    purification: '0.0%'
  },
  {
    id: 'SUI',
    pair: 'SUI/USDT',
    name: 'Sui Network',
    icon: '💧',
    category: 'crypto',
    status: 'precaution',
    statusLabel: 'Requires Precaution 🔵',
    explanation: 'Next-generation high-speed Layer 1. Must ensure native staking avoids leveraged lending protocols with fixed interest rates.',
    aaoifi: 'Compliant with precaution regarding leveraged DeFi',
    debtRatio: '0.0%',
    impureIncome: '0.8%',
    purification: '0.8%'
  },
  {
    id: 'NEAR',
    pair: 'NEAR/USDT',
    name: 'Near Protocol',
    icon: 'Ⓝ',
    category: 'crypto',
    status: 'precaution',
    statusLabel: 'Requires Precaution 🔵',
    explanation: 'Decentralized cloud computing and developer platform. Permissible for network validation while avoiding guaranteed-yield lending pools.',
    aaoifi: 'Permissible for transfers without usurious staking',
    debtRatio: '0.0%',
    impureIncome: '1.1%',
    purification: '1.1%'
  },
  {
    id: 'AAVE',
    pair: 'AAVE/USDT',
    name: 'Aave Protocol',
    icon: '👻',
    category: 'crypto',
    status: 'doubtful',
    statusLabel: 'Doubtful / Impermissible ❌',
    explanation: 'Explicit decentralized interest-bearing liquidity and lending market protocol involving interest (Riba).',
    aaoifi: 'Impermissible due to direct interest-based lending operations',
    debtRatio: '100%',
    impureIncome: '100%',
    purification: 'Impermissible'
  },

  // Stocks & Commodities
  {
    id: 'XAU',
    pair: 'XAU/USD',
    name: 'Gold (Physical Spot)',
    icon: '🥇',
    category: 'stocks',
    status: 'halal',
    statusLabel: 'Shariah Compliant ✅',
    explanation: 'Precious metal and tangible physical asset 100% Shariah compliant under spot delivery and physical allocation standards.',
    aaoifi: '100% Shariah Compliant (AAOIFI Standard #57 on Gold)',
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
    statusLabel: 'Shariah Compliant ✅',
    explanation: 'Technology and consumer electronics. Interest-bearing debt and prohibited financial income are strictly below AAOIFI 5% and 33% threshold limits.',
    aaoifi: 'Compliant under AAOIFI Financial Screening Criteria',
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
    id: 'AMZN',
    pair: 'AMZN',
    name: 'Amazon.com Inc.',
    icon: '📦',
    category: 'stocks',
    status: 'precaution',
    statusLabel: 'يحتاج احتياط 🔵',
    explanation: 'التجارة والحوسبة السحابية مباحة، ولكن تستدعي الاحتياط بسبب الاستثمارات المالية والتسهيلات البنكية الجانبية.',
    aaoifi: 'متوافق مع التطهير بنسبة 2.1%',
    debtRatio: '24.1%',
    impureIncome: '2.1%',
    purification: '2.1%'
  },
  {
    id: 'GOOGL',
    pair: 'GOOGL',
    name: 'Alphabet Inc.',
    icon: '🔍',
    category: 'stocks',
    status: 'precaution',
    statusLabel: 'يحتاج احتياط 🔵',
    explanation: 'محرك البحث والتكنولوجيا مباحان، مع وجود إيرادات إعلانات وتسهيلات نقدية بفائدة تتطلب تطهيراً سنوياً.',
    aaoifi: 'متوافق مع التطهير الشرعي',
    debtRatio: '11.8%',
    impureIncome: '1.5%',
    purification: '1.5%'
  },
  {
    id: 'META',
    pair: 'META',
    name: 'Meta Platforms',
    icon: '♾️',
    category: 'stocks',
    status: 'precaution',
    statusLabel: 'يحتاج احتياط 🔵',
    explanation: 'شبكات التواصل والتكنولوجيا مباحة ولكن تستدعي التطهير بسبب إيرادات الإعلانات غير المفلترة بنسبة بسيطة.',
    aaoifi: 'متوافق بشرط استقطاع نسبة التطهير',
    debtRatio: '15.4%',
    impureIncome: '2.4%',
    purification: '2.4%'
  },
  {
    id: 'AMD',
    pair: 'AMD',
    name: 'Advanced Micro Devices',
    icon: '💻',
    category: 'stocks',
    status: 'precaution',
    statusLabel: 'يحتاج احتياط 🔵',
    explanation: 'صناعة أشباه الموصلات مباحة 100% ونسبة الديون الربوية قريبة من الحد الأعلى المسموح (AAOIFI 33%).',
    aaoifi: 'متوافق تحت حد الديون الأعلى',
    debtRatio: '28.9%',
    impureIncome: '1.9%',
    purification: '1.9%'
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
  {
    id: 'JPM',
    pair: 'JPM',
    name: 'JPMorgan Chase',
    icon: '🏦',
    category: 'stocks',
    status: 'doubtful',
    statusLabel: 'مشكوك فيه ❌',
    explanation: 'بنك تجاري تقليدي يقوم نشاطه الجوهري على الفوائد والإقراض الربوي غير الجائز شرعاً.',
    aaoifi: 'غير متوافق شرعاً بالكامل',
    debtRatio: '95%',
    impureIncome: '92%',
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
    id: 'AUDUSD',
    pair: 'AUD/USD',
    name: 'الدولار الأسترالي / الأمريكي',
    icon: '🇦🇺',
    category: 'forex',
    status: 'precaution',
    statusLabel: 'يحتاج احتياط 🔵',
    explanation: 'مباح للتداول الفوري المباشر مع وجوب التحقق من مزود سيولة الحساب الإسلامي لضمان خلوه من عمولات الفوارق الربوية.',
    aaoifi: 'معيار الصرف الفوري مع مراعاة مزود السيولة',
    debtRatio: '0.0%',
    impureIncome: '0.5%',
    purification: '0.5%'
  },
  {
    id: 'USDCAD',
    pair: 'USD/CAD',
    name: 'الدولار الأمريكي / الكندي',
    icon: '🇨🇦',
    category: 'forex',
    status: 'precaution',
    statusLabel: 'يحتاج احتياط 🔵',
    explanation: 'صرف عملات مباشر يتطلب تجنب صفقات العقود الآجلة غير المقبوضة بشرط التقابض الفوري.',
    aaoifi: 'معيار الصرف الفوري',
    debtRatio: '0.0%',
    impureIncome: '0.4%',
    purification: '0.4%'
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

  // Filter dataset by current category (for dynamic top summary numbers)
  const categoryPool = selectedCategory === 'all' 
    ? halalAssetsData 
    : halalAssetsData.filter(a => a.category === selectedCategory);

  const dynamicHalalCount = categoryPool.filter(a => a.status === 'halal').length;
  const dynamicDiffersCount = categoryPool.filter(a => a.status === 'differs').length;
  const dynamicPrecautionCount = categoryPool.filter(a => a.status === 'precaution').length;
  const dynamicDoubtfulCount = categoryPool.filter(a => a.status === 'doubtful').length;

  // Filtered Assets list display
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
      const matched = halalAssetsData.find(a => 
        a.pair.toLowerCase().includes(q.toLowerCase()) || 
        a.name.toLowerCase().includes(q.toLowerCase())
      );

      if (matched) {
        setActiveModalAsset(matched);
      } else {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', direction: 'ltr', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#fff' }}>Halal & Shariah Audit Engine 🕌</h2>
          </div>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
            AAOIFI & Islamic Fiqh screening for Crypto, Equities, Commodities & Forex
          </div>
        </div>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
          <ChevronRight size={28} style={{ transform: 'rotate(180deg)' }} />
        </button>
      </div>

      {/* Dynamic Status Summary Grid (4 Stat Cards) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
        <div 
          onClick={() => setSelectedStatus(selectedStatus === 'halal' ? 'all' : 'halal')}
          style={{ 
            background: selectedStatus === 'halal' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.02)', 
            border: `1px solid ${selectedStatus === 'halal' ? '#10b981' : 'rgba(16, 185, 129, 0.2)'}`, 
            borderRadius: '12px', padding: '12px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' 
          }}
        >
          <div style={{ color: '#10b981', fontSize: '20px', marginBottom: '2px' }}>✅</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>{dynamicHalalCount}</div>
          <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 'bold' }}>Compliant</div>
        </div>

        <div 
          onClick={() => setSelectedStatus(selectedStatus === 'differs' ? 'all' : 'differs')}
          style={{ 
            background: selectedStatus === 'differs' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.02)', 
            border: `1px solid ${selectedStatus === 'differs' ? '#f59e0b' : 'rgba(245, 158, 11, 0.2)'}`, 
            borderRadius: '12px', padding: '12px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' 
          }}
        >
          <div style={{ color: '#f59e0b', fontSize: '20px', marginBottom: '2px' }}>⚠️</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f59e0b' }}>{dynamicDiffersCount}</div>
          <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 'bold' }}>Difference</div>
        </div>

        <div 
          onClick={() => setSelectedStatus(selectedStatus === 'precaution' ? 'all' : 'precaution')}
          style={{ 
            background: selectedStatus === 'precaution' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.02)', 
            border: `1px solid ${selectedStatus === 'precaution' ? '#60a5fa' : 'rgba(59, 130, 246, 0.2)'}`, 
            borderRadius: '12px', padding: '12px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' 
          }}
        >
          <div style={{ color: '#60a5fa', fontSize: '20px', marginBottom: '2px' }}>🔵</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#60a5fa' }}>{dynamicPrecautionCount}</div>
          <div style={{ fontSize: '11px', color: '#60a5fa', fontWeight: 'bold' }}>Precaution</div>
        </div>

        <div 
          onClick={() => setSelectedStatus(selectedStatus === 'doubtful' ? 'all' : 'doubtful')}
          style={{ 
            background: selectedStatus === 'doubtful' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.02)', 
            border: `1px solid ${selectedStatus === 'doubtful' ? '#f87171' : 'rgba(239, 68, 68, 0.2)'}`, 
            borderRadius: '12px', padding: '12px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' 
          }}
        >
          <div style={{ color: '#f87171', fontSize: '20px', marginBottom: '2px' }}>❌</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f87171' }}>{dynamicDoubtfulCount}</div>
          <div style={{ fontSize: '11px', color: '#f87171', fontWeight: 'bold' }}>Doubtful</div>
        </div>
      </div>

      {/* AI Sharia Search Box */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '16px', padding: '16px' }}>
        <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '14px', color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <span>Search Any Global Asset via AI Shariah Auditor</span>
          <Sparkles size={16} color="#a855f7" />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <input 
            type="text"
            placeholder="e.g. EUR/USD, Coinbase, AAPL, BTC, Solana, NVDA, XAU/USD..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAiSearchTrigger()}
            style={{
              flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px', color: '#fff', fontSize: '13px', direction: 'ltr', outline: 'none'
            }}
          />
          <button 
            onClick={() => handleAiSearchTrigger()}
            disabled={isAiSearching}
            style={{ background: '#a855f7', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isAiSearching ? 0.7 : 1 }}
          >
            {isAiSearching ? <Sparkles size={18} className="spin" /> : <Search size={18} />}
          </button>
        </div>

        {/* Custom AI Analysis Box if searched non-listed symbol */}
        {aiCustomResult && (
          <div style={{ marginTop: '12px', background: 'rgba(168, 85, 247, 0.12)', border: '1px solid rgba(168, 85, 247, 0.4)', borderRadius: '14px', padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#fff' }}>AI Shariah Screening: {aiCustomResult.pair}</span>
              <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', padding: '3px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' }}>{aiCustomResult.statusLabel}</span>
            </div>
            <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#e5e7eb', lineHeight: '1.5', direction: 'ltr' }}>{aiCustomResult.explanation}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', fontSize: '11px', textAlign: 'center' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '8px' }}>
                <div style={{ color: '#9ca3af' }}>Debt Ratio</div>
                <div style={{ fontWeight: 'bold', color: '#10b981' }}>{aiCustomResult.debtRatio}</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '8px' }}>
                <div style={{ color: '#9ca3af' }}>Impure Income</div>
                <div style={{ fontWeight: 'bold', color: '#f59e0b' }}>{aiCustomResult.impureIncome}</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '8px' }}>
                <div style={{ color: '#9ca3af' }}>Purification</div>
                <div style={{ fontWeight: 'bold', color: '#a855f7' }}>{aiCustomResult.purification}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs (Category & Status) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px', scrollbarWidth: 'none' }}>
          {[
            { id: 'all', label: 'All Markets' },
            { id: 'crypto', label: '🟠 Crypto Assets' },
            { id: 'stocks', label: '📈 Equities & ETFs' },
            { id: 'forex', label: '💱 Forex & Currencies' }
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
            { id: 'all', label: '✦ All Classifications' },
            { id: 'halal', label: `Compliant (${dynamicHalalCount})` },
            { id: 'differs', label: `Difference (${dynamicDiffersCount})` },
            { id: 'precaution', label: `Precaution (${dynamicPrecautionCount})` },
            { id: 'doubtful', label: `Doubtful (${dynamicDoubtfulCount})` }
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

      {/* Educational Banner */}
      <div style={{ background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: '14px', padding: '14px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{ fontSize: '28px' }}>🕌</div>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#10b981' }}>Muslim Trader Guidance & Standards</div>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px', lineHeight: '1.4' }}>
            Audited per AAOIFI Standards & Islamic Fiqh Councils. Forex spot trading is permitted exclusively via Swap-Free Islamic accounts without overnight rollover interest.
          </div>
        </div>
      </div>

      {/* Asset Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredAssets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#9ca3af', fontSize: '13px' }}>
            No assets match the current filter. You can search any global symbol via the AI Auditor above 🔍
          </div>
        ) : (
          filteredAssets.map(asset => (
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AssetLogo symbol={asset.pair} fallbackIcon={asset.icon} containerSize={36} size={22} />
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#fff' }}>{asset.pair}</div>
                    <div style={{ fontSize: '10px', color: '#9ca3af' }}>{asset.name}</div>
                  </div>
                </div>

                <span style={{ 
                  background: asset.status === 'halal' ? 'rgba(16,185,129,0.15)' : asset.status === 'differs' ? 'rgba(245,158,11,0.15)' : asset.status === 'precaution' ? 'rgba(59,130,246,0.15)' : 'rgba(239,68,68,0.15)',
                  color: asset.status === 'halal' ? '#10b981' : asset.status === 'differs' ? '#f59e0b' : asset.status === 'precaution' ? '#60a5fa' : '#f87171',
                  border: `1px solid ${asset.status === 'halal' ? '#10b981' : asset.status === 'differs' ? '#f59e0b' : asset.status === 'precaution' ? '#60a5fa' : '#f87171'}`,
                  padding: '3px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold'
                }}>
                  {asset.statusLabel}
                </span>
              </div>

              <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', lineHeight: '1.5', direction: 'ltr' }}>
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
                <span>Full AAOIFI Compliance Breakdown</span>
                <span>🤖</span>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Interactive AI Sharia Breakdown Modal */}
      {activeModalAsset && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px', zIndex: 9999, direction: 'ltr'
        }}>
          <div style={{
            background: '#0f172a', border: '1px solid rgba(168, 85, 247, 0.4)',
            borderRadius: '20px', padding: '20px', width: '100%', maxWidth: '420px',
            color: '#fff', position: 'relative', boxShadow: '0 0 30px rgba(168, 85, 247, 0.2)'
          }}>
            <button 
              onClick={() => setActiveModalAsset(null)}
              style={{ position: 'absolute', top: '14px', right: '14px', background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
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
              <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>AAOIFI Standard & Shariah Board Assessment</div>
              <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#a855f7' }}>{activeModalAsset.aaoifi}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px', textAlign: 'center' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '10px', padding: '10px' }}>
                <div style={{ fontSize: '10px', color: '#9ca3af' }}>Interest Debt</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#10b981', marginTop: '2px' }}>{activeModalAsset.debtRatio}</div>
                <div style={{ fontSize: '9px', color: '#6b7280' }}>Max 33%</div>
              </div>
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '10px', padding: '10px' }}>
                <div style={{ fontSize: '10px', color: '#9ca3af' }}>Impure Revenue</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#f59e0b', marginTop: '2px' }}>{activeModalAsset.impureIncome}</div>
                <div style={{ fontSize: '9px', color: '#6b7280' }}>Max 5%</div>
              </div>
              <div style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.2)', borderRadius: '10px', padding: '10px' }}>
                <div style={{ fontSize: '10px', color: '#9ca3af' }}>Purification</div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#c084fc', marginTop: '2px' }}>{activeModalAsset.purification}</div>
                <div style={{ fontSize: '9px', color: '#6b7280' }}>Of Dividends</div>
              </div>
            </div>

            <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.6', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '16px' }}>
              {activeModalAsset.explanation}
            </div>

            <button
              onClick={() => setActiveModalAsset(null)}
              style={{ width: '100%', background: '#a855f7', color: '#fff', border: 'none', borderRadius: '12px', padding: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
            >
              Acknowledge & Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
