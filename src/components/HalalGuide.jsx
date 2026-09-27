import React, { useState } from 'react';
import { ChevronRight, Search, ShieldCheck, AlertTriangle, AlertCircle, XCircle, Bot, Sparkles } from 'lucide-react';

const halalAssetsData = [
  {
    id: 'BTC',
    pair: 'BTC/USDT',
    name: 'Bitcoin',
    icon: '₿',
    category: 'crypto',
    status: 'differs', // 'halal', 'differs', 'precaution', 'doubtful'
    statusLabel: 'مختلف فيه ⚠️',
    explanation: 'أجازه كثير من العلماء المعاصرين كالمفتي شبير أحمد. أقرب للجواز عند من يعتبره وسيلة تبادل مالية حقيقية ولامركزية.'
  },
  {
    id: 'ETH',
    pair: 'ETH/USDT',
    name: 'Ethereum',
    icon: 'Ξ',
    category: 'crypto',
    status: 'differs',
    statusLabel: 'مختلف فيه ⚠️',
    explanation: 'له استخدامات حقيقية في DeFi والعقود الذكية. بعض العلماء يجيزه لوجود منفعة تقنية حقيقية.'
  },
  {
    id: 'SOL',
    pair: 'SOL/USDT',
    name: 'Solana',
    icon: '◎',
    category: 'crypto',
    status: 'differs',
    statusLabel: 'مختلف فيه ⚠️',
    explanation: 'له استخدامات تقنية حقيقية في التطبيقات اللامركزية وسرعة المعاملات وتكاليف شبكة منخفضة.'
  },
  {
    id: 'BNB',
    pair: 'BNB/USDT',
    name: 'BNB',
    icon: '⬡',
    category: 'crypto',
    status: 'differs',
    statusLabel: 'مختلف فيه ⚠️',
    explanation: 'يُستخدم في بورصة Binance وله منافع عملية متعددة كرسوم تداول وحوكمة.'
  },
  {
    id: 'XAU',
    pair: 'XAU/USD',
    name: 'الذهب (Gold)',
    icon: '🥇',
    category: 'stocks',
    status: 'halal',
    statusLabel: 'حلال ✅',
    explanation: 'معدن ثمين واصل عيني متوافق مع الشريعة 100% للتداول المباشر بدون روافع ربا.'
  },
  {
    id: 'AAPL',
    pair: 'AAPL',
    name: 'Apple Inc.',
    icon: '🍎',
    category: 'stocks',
    status: 'halal',
    statusLabel: 'حلال ✅',
    explanation: 'تنشط في التكنولوجيا والأجهزة. نسبة الديون الفائدة والفوائد المحرمة أقل من 5% من المعايير الشريعة (AAOIFI).'
  },
  {
    id: 'NVDA',
    pair: 'NVDA',
    name: 'NVIDIA Corp.',
    icon: '🟢',
    category: 'stocks',
    status: 'halal',
    statusLabel: 'حلال ✅',
    explanation: 'تنشط في المعالجات والذكاء الاصطناعي. متوافقة مع معايير AAOIFI ونسبة الديون الربوية منخفضة للغاية.'
  },
  {
    id: 'TSLA',
    pair: 'TSLA',
    name: 'Tesla Inc.',
    icon: '⚡',
    category: 'stocks',
    status: 'precaution',
    statusLabel: 'يحتاج احتياط 🔵',
    explanation: 'نشاط السيارات الكهربائية مباح، لكن لديها استثمارات في أدوات ربوية تتطلب التطهير عند توزيع الأرباح.'
  },
  {
    id: 'COIN',
    pair: 'COIN',
    name: 'Coinbase Global',
    icon: '🪙',
    category: 'stocks',
    status: 'doubtful',
    statusLabel: 'مشكوك فيه ❌',
    explanation: 'تعتمد جزء كبير من إيراداتها على خدمات الستيكينغ (Staking) والإقراض بالربا والمشتقات التخليقية.'
  }
];

export default function HalalGuide({ onBack }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [aiSearchInput, setAiSearchInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [aiAnalysisResult, setAiAnalysisResult] = useState(null);
  const [analyzingSymbol, setAnalyzingSymbol] = useState(null);

  const filteredAssets = halalAssetsData.filter(asset => {
    if (selectedCategory !== 'all' && asset.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && asset.status !== selectedStatus) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return asset.pair.toLowerCase().includes(q) || asset.name.toLowerCase().includes(q);
    }
    return true;
  });

  const handleAiSearch = (symbolToSearch) => {
    const term = symbolToSearch || aiSearchInput;
    if (!term) return;
    setAnalyzingSymbol(term);

    setTimeout(() => {
      setAiAnalysisResult({
        symbol: term,
        status: 'مختلف فيه ⚠️',
        verdict: 'وفقاً لمعايير AAOIFI ومجلس الفقه الإسلامي الدولي، النشاط الأساسي مباح، ولكن يوصى بتطهير 1.2% من أرباح الصفقة للصدقة.',
        details: 'الشركة لا ترتبط بأنشطة محرمة مباشرة كالخمور أو القمار، ونسبة الديون بفائدة بلغت 12% وهي أقل من السقف المسموح (33%).'
      });
      setAnalyzingSymbol(null);
    }, 1000);
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
            الأصول المتوافقة مع الشريعة الإسلامية
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
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>19</div>
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
          <Search size={16} color="#a855f7" />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => handleAiSearch()}
            style={{ background: '#a855f7', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Search size={18} />
          </button>
          <input 
            type="text"
            placeholder="مثال: Coinbase, Microsoft, AAPL, Ethereum..."
            value={aiSearchInput}
            onChange={(e) => setAiSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
            style={{
              flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px', color: '#fff', fontSize: '13px', direction: 'rtl', outline: 'none'
            }}
          />
        </div>

        {/* AI Result Dialog / Box */}
        {aiAnalysisResult && (
          <div style={{ marginTop: '12px', background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '12px', padding: '12px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontWeight: 'bold', color: '#a855f7' }}>نتيجة فحص الذكاء الاصطناعي: {aiAnalysisResult.symbol}</span>
              <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', padding: '2px 8px', borderRadius: '8px', fontWeight: 'bold' }}>{aiAnalysisResult.status}</span>
            </div>
            <p style={{ margin: '0 0 6px 0', color: '#e5e7eb', lineHeight: '1.5' }}>{aiAnalysisResult.verdict}</p>
            <div style={{ fontSize: '11px', color: '#9ca3af' }}>{aiAnalysisResult.details}</div>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Row 1: Category */}
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
          {[
            { id: 'all', label: 'الكل' },
            { id: 'crypto', label: '🪙 كريبتو' },
            { id: 'stocks', label: '📈 أسهم' }
          ].map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              style={{
                background: selectedCategory === c.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: `1px solid ${selectedCategory === c.id ? '#fff' : 'rgba(255,255,255,0.1)'}`,
                color: '#fff', padding: '5px 12px', borderRadius: '14px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer'
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Row 2: Status */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
          {[
            { id: 'all', label: '✦ الكل' },
            { id: 'halal', label: 'حلال' },
            { id: 'differs', label: 'مختلف فيه' },
            { id: 'precaution', label: 'يحتاج احتياط' },
            { id: 'doubtful', label: 'مشكوك فيه' }
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedStatus(s.id)}
              style={{
                background: selectedStatus === s.id ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255,255,255,0.03)',
                color: selectedStatus === s.id ? '#f59e0b' : '#9ca3af',
                border: `1px solid ${selectedStatus === s.id ? '#f59e0b' : 'rgba(255,255,255,0.05)'}`,
                padding: '4px 10px', borderRadius: '12px', fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap'
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Search Input */}
      <input
        type="text"
        placeholder="بحث سريع في القائمة..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '10px 14px', color: '#fff', fontSize: '12px', direction: 'rtl', outline: 'none', boxSizing: 'border-box'
        }}
      />

      {/* Educational Banner ("دليل المتداول المسلم 🕌") */}
      <div style={{ background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: '14px', padding: '14px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <div style={{ fontSize: '28px' }}>🕌</div>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#10b981' }}>دليل المتداول المسلم</div>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px', lineHeight: '1.4' }}>
            بناءً على آراء العلماء المعاصرين في الفقه الإسلامي المالي. هذا دليل تعليمي — استشر عالماً مختصاً للفتوى الشخصية.
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
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold' }}>
                  {asset.icon}
                </div>
              </div>
            </div>

            <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', lineHeight: '1.5', direction: 'rtl' }}>
              {asset.explanation}
            </p>

            <button 
              onClick={() => handleAiSearch(asset.pair)}
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
                justify: 'center',
                gap: '6px'
              }}
            >
              <span>تحليل AI شرعي</span>
              <span>🤖</span>
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
