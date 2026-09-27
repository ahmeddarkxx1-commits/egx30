import React, { useState } from 'react';
import { ChevronRight, Globe, Search, RefreshCw } from 'lucide-react';

const newsItems = [
  {
    id: 1,
    source: 'Reuters',
    title: 'الذهب يرتفع مع تراجع الدولار وترقب قرار الفيدرالي',
    desc: 'ارتفع الذهب 0.8% مع ضعف الدولار وتوقعات بتثبيت الفائدة.',
    impact: 'positive',
    impactLabel: 'إيجابي ▲',
    asset: 'الذهب',
    tags: ['XAU', 'USD']
  },
  {
    id: 2,
    source: 'Bloomberg',
    title: 'باول يلمح إلى إبقاء الفائدة مرتفعة لفترة أطول',
    desc: 'صرح رئيس الفيدرالي بأن التضخم لا يزال أعلى من الهدف.',
    impact: 'negative',
    impactLabel: 'سلبي ▼',
    asset: 'الفيدرالي',
    tags: ['USD', 'XAU', 'BTC']
  },
  {
    id: 3,
    source: 'CoinDesk',
    title: 'Bitcoin يتجاوز 98,000$ وسط تدفقات قياسية لصناديق ETF',
    desc: 'سجلت صناديق Bitcoin ETF تدفقات بلغت 1.2$ مليار خلال يوم واحد.',
    impact: 'positive',
    impactLabel: 'إيجابي ▲',
    asset: 'كريبتو',
    tags: ['BTC']
  }
];

export default function MarketNews({ onBack }) {
  const tabs = ['الكل', 'كريبتو', 'الذهب', 'الفيدرالي', 'النفط', 'فوركس', 'عام'];
  const [activeTab, setActiveTab] = useState('الكل');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>📰</span>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px' }}>أخبار الأسواق</h2>
            <div style={{ fontSize: '12px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
              يجلب الأخبار... جاري التحديث <RefreshCw size={12} />
            </div>
          </div>
        </div>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
          <ChevronRight size={28} />
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
        {tabs.map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: activeTab === tab ? 'rgba(255,255,255,0.1)' : 'transparent',
              border: `1px solid ${activeTab === tab ? '#fff' : 'rgba(255,255,255,0.2)'}`,
              color: '#fff',
              padding: '6px 16px',
              borderRadius: '20px',
              whiteSpace: 'nowrap',
              cursor: 'pointer'
            }}
          >
            {tab === 'الكل' && <Globe size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} color="#3b82f6" />}
            {tab}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {newsItems.map(news => (
          <div key={news.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ color: '#9ca3af', fontSize: '12px' }}>{news.source}</div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ 
                  color: news.impact === 'positive' ? '#10b981' : '#ef4444', 
                  fontSize: '12px', fontWeight: 'bold' 
                }}>
                  {news.impactLabel}
                </span>
                <span style={{ color: '#f59e0b', fontSize: '12px' }}>{news.asset}</span>
              </div>
            </div>

            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', lineHeight: '1.4' }}>{news.title}</h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#9ca3af', lineHeight: '1.5' }}>{news.desc}</p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: '#9ca3af' }}>يؤثر على:</span>
                {news.tags.map(tag => (
                  <span key={tag} style={{ border: '1px solid rgba(255,255,255,0.2)', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>
                    {tag}
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{ background: 'transparent', border: '1px solid rgba(168, 85, 247, 0.5)', color: '#c084fc', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  تحليل معمق <Search size={12} />
                </button>
                <button style={{ background: 'transparent', border: '1px solid rgba(59, 130, 246, 0.5)', color: '#60a5fa', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  ترجمة + تحليل <Globe size={12} />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
