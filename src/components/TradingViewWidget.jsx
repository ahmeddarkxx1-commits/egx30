import React, { useEffect, useRef, memo } from 'react';

function TradingViewWidget({ symbol = "BINANCE:BTCUSDT", height = 550, timeframe = "1h", showExternalLink = true }) {
  const container = useRef();

  const getTvInterval = (tf) => {
    if (tf === '1m') return '1';
    if (tf === '5m') return '5';
    if (tf === '15m') return '15';
    if (tf === '1h') return '60';
    if (tf === '4h') return '240';
    if (tf === '1d' || tf === 'D') return 'D';
    return tf || '60';
  };

  const getTvUrl = (sym) => {
    return `https://ar.tradingview.com/chart/?symbol=${encodeURIComponent(sym)}`;
  };

  useEffect(() => {
    // Clear the container first to avoid duplicate widgets
    if (container.current) {
        container.current.innerHTML = "";
    }
    
    const tvInterval = getTvInterval(timeframe);

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "autosize": false,
        "width": "100%",
        "height": "${height}",
        "symbol": "${symbol}",
        "interval": "${tvInterval}",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "ar_AE",
        "enable_publishing": false,
        "backgroundColor": "#0d0f14",
        "gridColor": "#1f2937",
        "hide_top_toolbar": false,
        "hide_legend": false,
        "save_image": false
      }`;
    container.current.appendChild(script);
  }, [symbol, height, timeframe]);

  return (
    <div className="tradingview-widget-wrapper" style={{ width: "100%", position: "relative" }}>
      {showExternalLink && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#121721',
          padding: '6px 12px',
          borderRadius: '10px 10px 0 0',
          border: '1px solid #1f2937',
          borderBottom: 'none'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#9ca3af', fontWeight: 'bold' }}>
            <span>📊 رمـز الشـارت:</span>
            <span style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>{symbol}</span>
          </div>
          
          <a
            href={getTvUrl(symbol)}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 'bold',
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.35)',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            title={`فتح ${symbol} في موقع TradingView لفتح الشاشة كاملة`}
          >
            <span>🖥️ فتح في متصفح TradingView ↗</span>
          </a>
        </div>
      )}
      <div 
        className="tradingview-widget-container" 
        ref={container} 
        style={{ 
          height: `${height}px`, 
          width: "100%", 
          borderRadius: showExternalLink ? "0 0 12px 12px" : "12px", 
          overflow: "hidden",
          border: '1px solid #1f2937'
        }}
      >
        <div className="tradingview-widget-container__widget" style={{ height: "100%", width: "100%" }}></div>
      </div>
    </div>
  );
}

export default memo(TradingViewWidget);

