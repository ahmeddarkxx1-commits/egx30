import React, { useState, useEffect } from 'react';
import { fetchLiveAssetTicker } from '../utils/priceFetcher';

// Helper to reliably parse UTC dates from RSS (e.g., "2026-09-28 20:41:44")
const parseUtcDate = (dateStr) => {
  if (!dateStr) return new Date();
  if (typeof dateStr !== 'string') return new Date(dateStr);
  if (dateStr.includes('T') && (dateStr.endsWith('Z') || dateStr.includes('+'))) {
    return new Date(dateStr);
  }
  const normalized = dateStr.trim().replace(' ', 'T') + 'Z';
  const parsed = new Date(normalized);
  return isNaN(parsed.getTime()) ? new Date(dateStr) : parsed;
};

// Smart Arabic Financial Headline Translator for English RSS Feeds
const translateHeadlineToArabic = (text = '', category = 'FOREX') => {
  if (!text) return 'تحديث جديد في الأسواق المالية العالمية';
  if (/[\u0600-\u06FF]/.test(text)) return text; // Already Arabic

  const lower = text.toLowerCase();
  
  // Custom smart phrase mapping for geopolitics, wars & disasters
  if (lower.includes('oil') && (lower.includes('iran') || lower.includes('bounce') || lower.includes('prices') || lower.includes('strait'))) {
    return 'أسعار النفط الخام تتفاعل بقوة وسط التطورات الجيوسياسية والعناوين الإيرانية ومخاوف التوريد';
  }
  if (lower.includes('trump') || lower.includes('gas prices') || lower.includes('war') || lower.includes('military')) {
    return 'تصريحات عسكرية وجيوسياسية تؤثر على تحركات أسعار الطاقة والأسواق العالمية';
  }
  if (lower.includes('rba') || (lower.includes('rate hike') && lower.includes('expected'))) {
    return 'ترقب قرار أسعار الفائدة وتحديثات البنك المركزي والأسواق المالية المرتقبة';
  }
  if (lower.includes('goldman sachs') || lower.includes('treasury fund')) {
    return 'جولدمان ساكس يعزز استثماراته المؤسسية في الأصول الرقمية وصناديق الخزانة';
  }
  if (lower.includes('fed') || lower.includes('powell') || lower.includes('fomc')) {
    return `تحديثات الفيدرالي الأمريكي المؤثرة على حركة الدولار والأسواق: ${text.slice(0, 70)}...`;
  }

  // Keyword replacement mapping
  let translated = text;
  const terms = [
    { en: 'Oil prices', ar: 'أسعار النفط' },
    { en: 'Gold prices', ar: 'أسعار الذهب' },
    { en: 'Interest rates', ar: 'أسعار الفائدة' },
    { en: 'Inflation', ar: 'معدلات التضخم' },
    { en: 'Rate hike', ar: 'رفع الفائدة' },
    { en: 'Rate cut', ar: 'خفض الفائدة' },
    { en: 'Yields rise', ar: 'ارتفاع عوائد السندات' },
    { en: 'Dollar', ar: 'الدولار الأمريكي' },
    { en: 'Euro', ar: 'اليورو' },
    { en: 'Bitcoin', ar: 'البيتكوين' },
    { en: 'Crypto', ar: 'العملات الرقمية' },
    { en: 'Central bank', ar: 'البنك المركزي' },
    { en: 'Markets', ar: 'الأسواق' }
  ];

  terms.forEach(t => {
    const reg = new RegExp(t.en, 'gi');
    translated = translated.replace(reg, t.ar);
  });

  if (category === 'WARS') return `⚔️ تطورات الحروب والأزمات الجيوسياسية: ${translated}`;
  if (category === 'GOLD') return `تحركات أسعار الذهب XAU: ${translated}`;
  if (category === 'FED') return `تطورات الفيدرالي والدولار: ${translated}`;
  if (category === 'FOREX') return `تحديثات سوق العملات الأجنبية: ${translated}`;
  return `أخبار الأسواق المباشرة: ${translated}`;
};

export default function MarketNews({ onBack }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selectedNews, setSelectedNews] = useState(null);
  const [lastUpdated, setLastUpdated] = useState('');
  const [livePrices, setLivePrices] = useState({ gold: null, btc: null, eth: null, eur: null });
  const [now, setNow] = useState(Date.now());

  // Dynamic time-ago ticker (updates every 5 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Compute exact human-readable time ago dynamically from timestamp
  const calculateTimeAgo = (dateInput) => {
    if (!dateInput) return 'الآن 🟢';
    const postDate = parseUtcDate(dateInput);
    if (isNaN(postDate.getTime())) return 'الآن 🟢';
    
    const diffMs = Math.max(0, now - postDate.getTime());
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);

    if (diffSecs < 45) return 'الآن 🟢';
    if (diffMins === 1) return 'منذ دقيقة واحدة';
    if (diffMins === 2) return 'منذ دقيقتين';
    if (diffMins < 11) return `منذ ${diffMins} دقائق`;
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return 'منذ ساعة واحدة';
    if (diffHours === 2) return 'منذ ساعتين';
    if (diffHours < 11) return `منذ ${diffHours} ساعات`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'منذ يوم واحد';
    if (diffDays === 2) return 'منذ يومين';
    return `منذ ${diffDays} أيام`;
  };

  // Helper to categorize news into WARS, GOLD, FED, FOREX, CRYPTO
  const categorizeItem = (title = '', desc = '') => {
    const text = (title + ' ' + desc).toLowerCase();
    
    // Check for Geopolitical conflicts, military news, energy crises & natural disasters
    if (
      text.includes('war') || text.includes('conflict') || text.includes('military') || 
      text.includes('strike') || text.includes('attack') || text.includes('missile') || 
      text.includes('iran') || text.includes('russia') || text.includes('ukraine') || 
      text.includes('israel') || text.includes('sanction') || text.includes('geopolit') || 
      text.includes('disaster') || text.includes('earthquake') || text.includes('hurricane') || 
      text.includes('strait') || text.includes('red sea') || text.includes('houthi') ||
      text.includes('حرب') || text.includes('صراع') || text.includes('عسكري') || 
      text.includes('هجوم') || text.includes('صواريخ') || text.includes('عقوبات') || 
      text.includes('زلزال') || text.includes('إعصار') || text.includes('كارثة')
    ) {
      return { 
        category: 'WARS', 
        tags: ['XAU (الذهب 🥇)', 'WTI (النفط 🛢️)', 'USD (الدولار 💵)', 'ملاذ آمن 🛡️'], 
        defaultImpact: 'bearish', 
        defaultImpactLabel: 'أزمة جيوسياسية 🔥' 
      };
    }

    if (text.includes('gold') || text.includes('xau') || text.includes('ذهب') || text.includes('bullion') || text.includes('metal')) {
      return { category: 'GOLD', tags: ['XAU', 'الذهب', 'معادن'], defaultImpact: 'bullish', defaultImpactLabel: 'إيجابي 🚀' };
    }
    if (text.includes('fed') || text.includes('powell') || text.includes('rate') || text.includes('inflation') || text.includes('فيدرالي') || text.includes('فائدة') || text.includes('fomc')) {
      return { category: 'FED', tags: ['USD', 'FED', 'الفيدرالي'], defaultImpact: 'bearish', defaultImpactLabel: 'مخاطرة ⚠️' };
    }
    if (text.includes('euro') || text.includes('eur') || text.includes('forex') || text.includes('dollar') || text.includes('فوركس') || text.includes('gbp') || text.includes('yen')) {
      return { category: 'FOREX', tags: ['EUR', 'USD', 'فوركس'], defaultImpact: 'neutral', defaultImpactLabel: 'محايد ⚖️' };
    }
    return { category: 'CRYPTO', tags: ['BTC', 'ETH', 'كريبتو'], defaultImpact: 'bullish', defaultImpactLabel: 'إيجابي 🚀' };
  };

  // Helper to format RSS items into structured news
  const formatRssNewsItem = (item) => {
    const catInfo = categorizeItem(item.title, item.description);
    const titleAr = translateHeadlineToArabic(item.title, catInfo.category);
    
    let rawDesc = item.description ? item.description.replace(/<[^>]+>/g, '').trim() : '';
    let descAr = rawDesc ? (rawDesc.length > 150 ? rawDesc.slice(0, 150) + '...' : rawDesc) : titleAr;
    if (!/[\u0600-\u06FF]/.test(descAr)) {
      descAr = translateHeadlineToArabic(rawDesc, catInfo.category);
    }

    let aiAnalysisText = `تحليل الذكاء الاصطناعي اللحظي: الخبر يؤثر مباشرة على مستويات السيولة والتداول لـ ${catInfo.tags.join('/')}. يُنصح بمتابعة مستويات الدعم والمقاومة اللحظية قبل الدخول.`;

    if (catInfo.category === 'WARS') {
      aiAnalysisText = `⚔️ **تحليل تأثير الحروب والأزمات والكوارث على أزواج التداول:**\n` +
        `• **الذهب (XAU/USD):** صعود صريح كملاذ آمن قيادي في حالات التحوط ضد مخاطر الحروب والأزمات.\n` +
        `• **النفط (WTI/BRENT):** ارتفاعات حادة بسبب المخاوف من انقطاع خطوط التوريد والملاحة البحرية.\n` +
        `• **الدولار (USD) والفرنك (CHF):** ملاذات آمنة قوية تعزز قيمتها مقابل العملات الأخرى.\n` +
        `• **المؤشرات (US30 / NAS100):** هبوط وتراجع مؤقت نتيجة انخفاض شهية المخاطرة لدى المستثمرين.`;
    }

    const parsedDate = parseUtcDate(item.pubDate);

    return {
      id: item.guid || item.link || ('rss-' + Math.random()),
      source: item.author || (catInfo.category === 'CRYPTO' ? 'CoinTelegraph / CoinDesk' : 'Reuters / ForexLive Geopolitics'),
      title: titleAr,
      description: descAr,
      category: catInfo.category,
      pubDate: parsedDate.toISOString(),
      impact: catInfo.defaultImpact,
      impactLabel: catInfo.defaultImpactLabel,
      tags: catInfo.tags,
      aiAnalysis: aiAnalysisText
    };
  };

  const loadLiveData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Live Asset Spot Prices
      const [goldRes, btcRes, ethRes, eurRes] = await Promise.all([
        fetchLiveAssetTicker('XAU/USD').catch(() => null),
        fetchLiveAssetTicker('BTC/USDT').catch(() => null),
        fetchLiveAssetTicker('ETH/USDT').catch(() => null),
        fetchLiveAssetTicker('EUR/USD').catch(() => null),
      ]);

      const updatedPrices = {
        gold: goldRes ? parseFloat(goldRes.price).toFixed(2) : null,
        btc: btcRes ? parseFloat(btcRes.price).toLocaleString() : null,
        eth: ethRes ? parseFloat(ethRes.price).toLocaleString() : null,
        eur: eurRes ? parseFloat(eurRes.price).toFixed(4) : null,
      };
      setLivePrices(updatedPrices);

      // 2. Fetch Multi-source Live RSS News with timestamp cache-buster
      const cacheBust = Date.now();
      const rssUrls = [
        `https://api.rss2json.com/v1/api.json?rss_url=https://www.forexlive.com/feed/news&t=${cacheBust}`,
        `https://api.rss2json.com/v1/api.json?rss_url=https://cointelegraph.com/rss&t=${cacheBust}`,
        `https://api.rss2json.com/v1/api.json?rss_url=https://www.coindesk.com/arc/outboundfeeds/rss/&t=${cacheBust}`,
        `https://api.rss2json.com/v1/api.json?rss_url=https://feeds.finance.yahoo.com/rss/2.0/headline?s=GC=F&t=${cacheBust}`
      ];

      let fetchedNewsItems = [];
      const rssResults = await Promise.allSettled(rssUrls.map(url => fetch(url).then(r => r.json())));

      rssResults.forEach(res => {
        if (res.status === 'fulfilled' && res.value?.items && Array.isArray(res.value.items)) {
          const items = res.value.items.slice(0, 10).map(formatRssNewsItem);
          fetchedNewsItems.push(...items);
        }
      });

      // Filter duplicates by title
      const uniqueNews = [];
      const seenTitles = new Set();
      for (const item of fetchedNewsItems) {
        if (item.title && !seenTitles.has(item.title)) {
          seenTitles.add(item.title);
          uniqueNews.push(item);
        }
      }

      // Sort strictly by newest pubDate first
      uniqueNews.sort((a, b) => parseUtcDate(b.pubDate) - parseUtcDate(a.pubDate));

      setNews(uniqueNews);
      const formattedTime = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastUpdated(formattedTime);
    } catch (e) {
      console.error('Failed loading news', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLiveData();
    const interval = setInterval(loadLiveData, 20000); // Live refresh every 20 seconds
    return () => clearInterval(interval);
  }, []);

  const filteredNews = news.filter(item => {
    if (filter === 'ALL') return true;
    return item.category === filter;
  });

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)',
      minHeight: '100vh',
      color: '#c9d1d9',
      padding: '16px 12px',
      direction: 'rtl',
      fontFamily: 'Cairo, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        borderBottom: '1px solid #30363d',
        paddingBottom: '12px'
      }}>
        <div>
          <h2 style={{ color: '#58a6ff', margin: 0, fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📰</span> الأخبار اللحظية ورادار الأزمات (Live News)
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#8b949e', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', animation: 'pulse 1.5s infinite' }}></span>
            <span>بث مباشر وتحديث تلقائي كل 20 ثانية</span>
          </p>
        </div>

        <div style={{ textAlign: 'left' }}>
          <button 
            onClick={loadLiveData}
            disabled={loading}
            style={{
              background: loading ? '#21262d' : '#238636',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 12px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>{loading ? '🔄 جاري التحديث...' : '🔄 تحديث فوري'}</span>
          </button>
          {lastUpdated && (
            <span style={{ fontSize: '0.72rem', color: '#7ee787', display: 'block', marginTop: '4px' }}>
              آخر تحديث: {lastUpdated}
            </span>
          )}
        </div>
      </div>

      {/* Ticker Banner */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        marginBottom: '16px',
        paddingBottom: '4px'
      }}>
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '8px', padding: '8px 12px', minWidth: '125px' }}>
          <div style={{ fontSize: '0.75rem', color: '#8b949e' }}>🥇 الذهب XAU</div>
          <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#f1e05a' }}>
            {livePrices.gold ? `$${livePrices.gold}` : 'جاري التحميل...'}
          </div>
        </div>
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '8px', padding: '8px 12px', minWidth: '125px' }}>
          <div style={{ fontSize: '0.75rem', color: '#8b949e' }}>₿ البيتكوين BTC</div>
          <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#58a6ff' }}>
            {livePrices.btc ? `$${livePrices.btc}` : 'جاري التحميل...'}
          </div>
        </div>
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '8px', padding: '8px 12px', minWidth: '125px' }}>
          <div style={{ fontSize: '0.75rem', color: '#8b949e' }}>💶 اليورو EUR/USD</div>
          <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#7ee787' }}>
            {livePrices.eur ? `${livePrices.eur}` : 'جاري التحميل...'}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '6px',
        flexWrap: 'wrap',
        marginBottom: '16px'
      }}>
        {[
          { id: 'ALL', label: '🌐 الكل' },
          { id: 'WARS', label: '⚔️ الحروب والأزمات 🔥' },
          { id: 'GOLD', label: '🥇 الذهب' },
          { id: 'CRYPTO', label: '🪙 كريبتو' },
          { id: 'FED', label: '🏛️ الفيدرالي' },
          { id: 'FOREX', label: '💱 فوركس' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            style={{
              background: filter === tab.id 
                ? (tab.id === 'WARS' ? 'linear-gradient(90deg, #dc2626, #b91c1c)' : '#1f6beb') 
                : '#21262d',
              color: '#ffffff',
              border: filter === tab.id ? (tab.id === 'WARS' ? '1px solid #ef4444' : '1px solid #388bfd') : '1px solid #30363d',
              borderRadius: '16px',
              padding: '5px 12px',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: filter === tab.id && tab.id === 'WARS' ? '0 0 10px rgba(239, 68, 68, 0.5)' : 'none'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* News List */}
      {loading && news.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#8b949e' }}>
          ⚡ جاري جلب الأخبار اللحظية والتحليلات المباشرة...
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {filteredNews.map(item => (
            <div
              key={item.id}
              style={{
                background: item.category === 'WARS' ? 'rgba(239, 68, 68, 0.05)' : '#161b22',
                border: item.category === 'WARS' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid #30363d',
                borderRadius: '10px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            >
              {/* Header Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: item.category === 'WARS' ? '#f87171' : '#58a6ff', fontWeight: 'bold' }}>
                  {item.source}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#10b981', background: '#0d1117', padding: '2px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                  ⏱️ {calculateTimeAgo(item.pubDate)}
                </span>
              </div>

              {/* Title & Description */}
              <h3 style={{ margin: 0, fontSize: '0.98rem', color: '#f0f6fc', lineHeight: '1.4' }}>
                {item.title}
              </h3>
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#8b949e', lineHeight: '1.5' }}>
                {item.description}
              </p>

              {/* Badges & Action */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '4px',
                borderTop: '1px solid #21262d',
                paddingTop: '8px'
              }}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    background: item.category === 'WARS' ? 'rgba(239, 68, 68, 0.2)' : (item.impact === 'bullish' ? 'rgba(46, 160, 67, 0.15)' : 'rgba(248, 81, 73, 0.15)'),
                    color: item.category === 'WARS' ? '#f87171' : (item.impact === 'bullish' ? '#3fb950' : '#f85149'),
                    border: '1px solid ' + (item.category === 'WARS' ? '#ef4444' : (item.impact === 'bullish' ? '#2ea043' : '#f85149'))
                  }}>
                    {item.impactLabel}
                  </span>

                  {item.tags?.map((t, idx) => (
                    <span key={idx} style={{ fontSize: '0.7rem', color: '#8b949e', background: '#21262d', padding: '2px 5px', borderRadius: '4px' }}>
                      #{t}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => setSelectedNews(item)}
                  style={{
                    background: item.category === 'WARS' ? 'rgba(239, 68, 68, 0.2)' : '#21262d',
                    color: item.category === 'WARS' ? '#f87171' : '#58a6ff',
                    border: item.category === 'WARS' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid #30363d',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap'
                  }}
                >
                  🤖 تحليل تأثير الأزواج
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Modal */}
      {selectedNews && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '15px'
        }}>
          <div style={{
            background: '#161b22',
            border: selectedNews.category === 'WARS' ? '1px solid rgba(239, 68, 68, 0.6)' : '1px solid #30363d',
            borderRadius: '14px',
            maxWidth: '500px',
            width: '100%',
            padding: '18px',
            boxShadow: selectedNews.category === 'WARS' ? '0 0 25px rgba(239, 68, 68, 0.3)' : '0 8px 24px rgba(0,0,0,0.4)',
            direction: 'rtl'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: selectedNews.category === 'WARS' ? '#f87171' : '#58a6ff', fontSize: '1.15rem' }}>
              {selectedNews.category === 'WARS' ? '⚔️ تحليل تأثير الحروب والأزمات على الأزواج' : '🤖 تحليل الذكاء الاصطناعي للخبر'}
            </h3>
            <p style={{ fontSize: '0.88rem', fontWeight: 'bold', color: '#f0f6fc', marginBottom: '12px' }}>
              {selectedNews.title}
            </p>
            <div style={{
              background: '#0d1117',
              border: selectedNews.category === 'WARS' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid #30363d',
              borderRadius: '8px',
              padding: '12px',
              color: selectedNews.category === 'WARS' ? '#fca5a5' : '#7ee787',
              fontSize: '0.85rem',
              lineHeight: '1.6',
              marginBottom: '16px',
              whiteSpace: 'pre-line'
            }}>
              {selectedNews.aiAnalysis}
            </div>
            <button
              onClick={() => setSelectedNews(null)}
              style={{
                width: '100%',
                background: selectedNews.category === 'WARS' ? '#dc2626' : '#238636',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '9px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.88rem'
              }}
            >
              إغلاق التحليل
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
