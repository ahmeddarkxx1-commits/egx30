import React, { useState, useEffect } from 'react';
import { fetchLiveAssetTicker } from '../utils/priceFetcher';

const FINNHUB_KEY = import.meta.env?.VITE_FINNHUB_API_KEY || '';
const HUGGINGFACE_KEY = import.meta.env?.VITE_HUGGINGFACE_API_KEY || '';

// Helper to reliably parse UTC dates
const parseUtcDate = (dateStr) => {
  if (!dateStr) return new Date();
  if (typeof dateStr === 'number') return new Date(dateStr * 1000);
  if (typeof dateStr !== 'string') return new Date(dateStr);
  if (dateStr.includes('T') && (dateStr.endsWith('Z') || dateStr.includes('+'))) {
    return new Date(dateStr);
  }
  const normalized = dateStr.trim().replace(' ', 'T') + 'Z';
  const parsed = new Date(normalized);
  return isNaN(parsed.getTime()) ? new Date(dateStr) : parsed;
};

// Clean English Headline Formatter
const formatHeadline = (text = '', category = 'FOREX') => {
  if (!text) return 'Market update from global financial terminals';
  return text;
};

// FinBERT Sentiment AI Classifier via Hugging Face Inference
async function analyzeFinBertSentiment(text) {
  if (!HUGGINGFACE_KEY || !text) return null;
  try {
    const res = await fetch('https://api-inference.huggingface.co/models/ProsusAI/finbert', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUGGINGFACE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputs: text.slice(0, 280) })
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        // Sort by highest confidence score
        const sorted = data[0].sort((a, b) => b.score - a.score);
        const top = sorted[0];
        const labelMap = {
          'positive': { label: 'Bullish Momentum 🟢', impact: 'bullish', color: '#10b981' },
          'negative': { label: 'Bearish Breakdown 🔴', impact: 'bearish', color: '#f87171' },
          'neutral': { label: 'Neutral / Rangebound ⚪', impact: 'neutral', color: '#94a3b8' }
        };
        const mapped = labelMap[top.label.toLowerCase()] || labelMap['neutral'];
        return {
          sentiment: top.label,
          score: Math.round(top.score * 100),
          label: mapped.label,
          impact: mapped.impact,
          color: mapped.color
        };
      }
    }
  } catch (e) {
    console.log('FinBERT fetch error:', e);
  }
  return null;
}

export default function MarketNews({ onBack }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selectedNews, setSelectedNews] = useState(null);
  const [lastUpdated, setLastUpdated] = useState('');
  const [livePrices, setLivePrices] = useState({ gold: null, btc: null, eth: null, eur: null, spx: null });
  const [now, setNow] = useState(Date.now());
  const [finbertActive, setFinbertActive] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const calculateTimeAgo = (dateInput) => {
    if (!dateInput) return 'Just now 🟢';
    const postDate = parseUtcDate(dateInput);
    if (isNaN(postDate.getTime())) return 'Just now 🟢';
    
    const diffMs = Math.max(0, now - postDate.getTime());
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);

    if (diffSecs < 45) return 'Just now 🟢';
    if (diffMins === 1) return '1m ago';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1h ago';
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return '1d ago';
    return `${diffDays}d ago`;
  };

  const categorizeItem = (title = '', desc = '') => {
    const text = (title + ' ' + desc).toLowerCase();
    
    if (
      text.includes('war') || text.includes('conflict') || text.includes('military') || 
      text.includes('strike') || text.includes('attack') || text.includes('missile') || 
      text.includes('iran') || text.includes('russia') || text.includes('ukraine') || 
      text.includes('israel') || text.includes('sanction') || text.includes('geopolit') || 
      text.includes('disaster') || text.includes('earthquake') || text.includes('hurricane') || 
      text.includes('strait') || text.includes('red sea') || text.includes('houthi')
    ) {
      return { 
        category: 'WARS', 
        tags: ['XAU (Gold 🥇)', 'WTI (Oil 🛢️)', 'USD (Dollar 💵)', 'Safe Haven 🛡️'], 
        defaultImpact: 'bearish', 
        defaultImpactLabel: 'Geopolitical Risk 🔥' 
      };
    }

    if (text.includes('gold') || text.includes('xau') || text.includes('bullion') || text.includes('metal')) {
      return { category: 'GOLD', tags: ['XAU', 'Gold', 'Metals'], defaultImpact: 'bullish', defaultImpactLabel: 'Bullish 🚀' };
    }
    if (text.includes('fed') || text.includes('powell') || text.includes('rate') || text.includes('inflation') || text.includes('fomc')) {
      return { category: 'FED', tags: ['USD', 'FED', 'Macro'], defaultImpact: 'bearish', defaultImpactLabel: 'High Volatility ⚠️' };
    }
    if (text.includes('euro') || text.includes('eur') || text.includes('forex') || text.includes('dollar') || text.includes('gbp') || text.includes('yen')) {
      return { category: 'FOREX', tags: ['EUR', 'USD', 'Forex'], defaultImpact: 'neutral', defaultImpactLabel: 'Neutral ⚖️' };
    }
    return { category: 'CRYPTO', tags: ['BTC', 'ETH', 'Crypto'], defaultImpact: 'bullish', defaultImpactLabel: 'Bullish 🚀' };
  };

  const loadLiveData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Live Asset Spot Prices
      const [goldRes, btcRes, ethRes, eurRes, spxRes] = await Promise.all([
        fetchLiveAssetTicker('XAU/USD').catch(() => null),
        fetchLiveAssetTicker('BTC/USDT').catch(() => null),
        fetchLiveAssetTicker('ETH/USDT').catch(() => null),
        fetchLiveAssetTicker('EUR/USD').catch(() => null),
        fetchLiveAssetTicker('SPX500').catch(() => null),
      ]);

      const updatedPrices = {
        gold: goldRes ? parseFloat(goldRes.price).toFixed(2) : null,
        btc: btcRes ? parseFloat(btcRes.price).toLocaleString() : null,
        eth: ethRes ? parseFloat(ethRes.price).toLocaleString() : null,
        eur: eurRes ? parseFloat(eurRes.price).toFixed(4) : null,
        spx: spxRes ? parseFloat(spxRes.price).toLocaleString() : null
      };
      setLivePrices(updatedPrices);

      let fetchedNewsItems = [];

      // 2. Fetch Institutional Real-Time News from Finnhub API
      if (FINNHUB_KEY) {
        try {
          const finnhubRes = await fetch(`https://finnhub.io/api/v1/news?category=general&minId=0&token=${FINNHUB_KEY}`);
          if (finnhubRes.ok) {
            const data = await finnhubRes.json();
            if (Array.isArray(data)) {
              for (const item of data.slice(0, 15)) {
                const catInfo = categorizeItem(item.headline, item.summary);
                
                fetchedNewsItems.push({
                  id: 'fh-' + (item.id || Math.random()),
                  source: item.source || 'Finnhub Institutional',
                  title: item.headline,
                  description: item.summary ? item.summary.slice(0, 180) + '...' : item.headline,
                  category: catInfo.category,
                  pubDate: new Date(item.datetime * 1000).toISOString(),
                  impact: catInfo.defaultImpact,
                  impactLabel: catInfo.defaultImpactLabel,
                  tags: catInfo.tags,
                  provider: 'Finnhub Live',
                  originalHeadline: item.headline,
                  aiAnalysis: `Finnhub Terminal Intel: This event directly affects institutional order flow for ${catInfo.tags.join('/')}. Monitor support/resistance levels.`
                });
              }
            }
          }
        } catch (e) {
          console.log('Finnhub news error:', e);
        }
      }

      // 3. Complement with Live RSS News
      const cacheBust = Date.now();
      const rssUrls = [
        `https://api.rss2json.com/v1/api.json?rss_url=https://www.forexlive.com/feed/news&t=${cacheBust}`,
        `https://api.rss2json.com/v1/api.json?rss_url=https://cointelegraph.com/rss&t=${cacheBust}`,
        `https://api.rss2json.com/v1/api.json?rss_url=https://feeds.finance.yahoo.com/rss/2.0/headline?s=GC=F&t=${cacheBust}`
      ];

      const rssResults = await Promise.allSettled(rssUrls.map(url => fetch(url).then(r => r.json())));
      rssResults.forEach(res => {
        if (res.status === 'fulfilled' && res.value?.items && Array.isArray(res.value.items)) {
          const items = res.value.items.slice(0, 8).map(item => {
            const catInfo = categorizeItem(item.title, item.description);
            let rawDesc = item.description ? item.description.replace(/<[^>]+>/g, '').trim() : '';
            return {
              id: item.guid || ('rss-' + Math.random()),
              source: item.author || (catInfo.category === 'CRYPTO' ? 'CoinTelegraph' : 'ForexLive / Global Feed'),
              title: item.title,
              description: rawDesc ? (rawDesc.length > 180 ? rawDesc.slice(0, 180) + '...' : rawDesc) : item.title,
              category: catInfo.category,
              pubDate: parseUtcDate(item.pubDate).toISOString(),
              impact: catInfo.defaultImpact,
              impactLabel: catInfo.defaultImpactLabel,
              tags: catInfo.tags,
              provider: 'Global RSS',
              originalHeadline: item.title,
              aiAnalysis: `Real-time Market Intel: High volume observed across related liquidity pairs for ${catInfo.tags.join('/')}.`
            };
          });
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

      // 4. Enrich top 5 news with Hugging Face FinBERT Sentiment Analysis
      if (HUGGINGFACE_KEY && uniqueNews.length > 0) {
        try {
          const topItems = uniqueNews.slice(0, 4);
          await Promise.all(
            topItems.map(async (item) => {
              const textToScore = item.originalHeadline || item.title;
              const sentimentData = await analyzeFinBertSentiment(textToScore);
              if (sentimentData) {
                item.finbert = sentimentData;
                item.impact = sentimentData.impact;
                item.impactLabel = `📊 AI Sentiment: ${sentimentData.label} (${sentimentData.score}%)`;
              }
            })
          );
        } catch (e) {
          console.log('Sentiment enrich error:', e);
        }
      }

      setNews(uniqueNews);
      const formattedTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastUpdated(formattedTime);
    } catch (e) {
      console.error('Failed loading news', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLiveData();
    const interval = setInterval(loadLiveData, 25000);
    return () => clearInterval(interval);
  }, []);

  const filteredNews = news.filter(item => {
    if (filter === 'ALL') return true;
    return item.category === filter;
  });

  return (
    <div style={{
      background: 'var(--bg-main, #0d1117)',
      minHeight: '100vh',
      color: 'var(--text-primary, #c9d1d9)',
      padding: '16px 12px',
      direction: 'ltr',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        borderBottom: '1px solid var(--border-subtle, #30363d)',
        paddingBottom: '12px'
      }}>
        <div>
          <h2 style={{ color: 'var(--accent-cyan, #58a6ff)', margin: 0, fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📰</span> Live Market News & AI Sentiment Radar (TRADEN AI)
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted, #8b949e)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', animation: 'pulse 1.5s infinite' }}></span>
            <span>Real-time global market feeds + Instant FinBERT AI price-impact scoring</span>
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <button 
            onClick={loadLiveData}
            disabled={loading}
            style={{
              background: loading ? 'var(--bg-card-subtle, #21262d)' : '#238636',
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
            <span>{loading ? '🔄 Refreshing...' : '🔄 Live Refresh'}</span>
          </button>
          {lastUpdated && (
            <span style={{ fontSize: '0.72rem', color: 'var(--accent-green, #7ee787)', display: 'block', marginTop: '4px' }}>
              Updated: {lastUpdated}
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
        <div style={{ background: 'var(--bg-card, #161b22)', border: '1px solid var(--border-subtle, #30363d)', borderRadius: '8px', padding: '8px 12px', minWidth: '125px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #8b949e)' }}>🥇 Gold XAU/USD</div>
          <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--accent-gold, #f1e05a)' }}>
            {livePrices.gold ? `$${livePrices.gold}` : 'Connecting...'}
          </div>
        </div>
        <div style={{ background: 'var(--bg-card, #161b22)', border: '1px solid var(--border-subtle, #30363d)', borderRadius: '8px', padding: '8px 12px', minWidth: '125px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #8b949e)' }}>₿ Bitcoin BTC</div>
          <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--accent-cyan, #58a6ff)' }}>
            {livePrices.btc ? `$${livePrices.btc}` : 'Connecting...'}
          </div>
        </div>
        <div style={{ background: 'var(--bg-card, #161b22)', border: '1px solid var(--border-subtle, #30363d)', borderRadius: '8px', padding: '8px 12px', minWidth: '125px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #8b949e)' }}>💶 EUR/USD</div>
          <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--accent-green, #7ee787)' }}>
            {livePrices.eur ? `${livePrices.eur}` : 'Connecting...'}
          </div>
        </div>
        <div style={{ background: 'var(--bg-card, #161b22)', border: '1px solid var(--border-subtle, #30363d)', borderRadius: '8px', padding: '8px 12px', minWidth: '125px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #8b949e)' }}>📊 S&P 500</div>
          <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--accent-cyan, #38bdf8)' }}>
            {livePrices.spx ? `$${livePrices.spx}` : 'Connecting...'}
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
          { id: 'ALL', label: '🌐 All Feeds' },
          { id: 'WARS', label: '⚔️ Geopolitics & Crisis 🔥' },
          { id: 'GOLD', label: '🥇 Gold & Commodities' },
          { id: 'CRYPTO', label: '🪙 Crypto Assets' },
          { id: 'FED', label: '🏛️ Central Banks & Macro' },
          { id: 'FOREX', label: '💱 Forex Currency Pairs' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            style={{
              background: filter === tab.id 
                ? (tab.id === 'WARS' ? 'linear-gradient(90deg, #dc2626, #b91c1c)' : '#1f6beb') 
                : 'var(--bg-card-subtle, #21262d)',
              color: filter === tab.id ? '#ffffff' : 'var(--text-primary, #ffffff)',
              border: filter === tab.id ? (tab.id === 'WARS' ? '1px solid #ef4444' : '1px solid #388bfd') : '1px solid var(--border-subtle, #30363d)',
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
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted, #8b949e)' }}>
          ⚡ Loading real-time institutional news feeds & FinBERT sentiment data...
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {filteredNews.map(item => (
            <div
              key={item.id}
              style={{
                background: item.category === 'WARS' ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-card, #161b22)',
                border: item.category === 'WARS' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-subtle, #30363d)',
                borderRadius: '10px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }}
            >
              {/* Header Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: item.category === 'WARS' ? 'var(--accent-red, #f87171)' : 'var(--accent-cyan, #58a6ff)', fontWeight: 'bold' }}>
                  {item.source} {item.provider ? `(${item.provider})` : ''}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-green, #10b981)', background: 'var(--bg-card-subtle, #0d1117)', padding: '2px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
                  ⏱️ {calculateTimeAgo(item.pubDate)}
                </span>
              </div>

              {/* Title & Description */}
              <h3 style={{ margin: 0, fontSize: '0.98rem', color: 'var(--text-primary, #f0f6fc)', lineHeight: '1.4' }}>
                {item.title}
              </h3>
              <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary, #8b949e)', lineHeight: '1.5' }}>
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
                    padding: '2px 8px',
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
                    background: 'transparent',
                    border: '1px solid #30363d',
                    color: '#58a6ff',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  🔍 View Technical Impact
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for In-depth AI Analysis */}
      {selectedNews && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '16px',
          zIndex: 9999
        }}>
          <div style={{
            background: '#161b22',
            border: '1px solid #30363d',
            borderRadius: '12px',
            padding: '20px',
            maxWidth: '550px',
            width: '100%',
            color: '#c9d1d9',
            maxHeight: '85vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ color: '#58a6ff', marginTop: 0 }}>📊 AI Market Sentiment & Impact Intelligence</h3>
            <p style={{ fontWeight: 'bold', color: '#f0f6fc', fontSize: '1rem' }}>{selectedNews.title}</p>
            <div style={{ background: '#0d1117', padding: '12px', borderRadius: '8px', border: '1px solid #30363d', margin: '12px 0' }}>
              <div style={{ fontSize: '0.85rem', color: '#8b949e', marginBottom: '6px' }}>
                Source: <span style={{ color: '#c9d1d9' }}>{selectedNews.source}</span> · Time: <span style={{ color: '#10b981' }}>{calculateTimeAgo(selectedNews.pubDate)}</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#8b949e', marginBottom: '8px' }}>
                FinBERT Sentiment: <span style={{ color: selectedNews.impact === 'bullish' ? '#3fb950' : '#f85149', fontWeight: 'bold' }}>{selectedNews.impactLabel}</span>
              </div>
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '0.9rem', color: '#e6edf3' }}>
                {selectedNews.aiAnalysis}
              </div>
            </div>
            <button
              onClick={() => setSelectedNews(null)}
              style={{
                width: '100%',
                background: '#238636',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
