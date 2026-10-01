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

  const formatTvSymbol = (s) => {
    if (!s) return 'BINANCE:BTCUSDT';
    let clean = s.toUpperCase().trim();

    // Strip broken or un-entitled prefixes
    clean = clean.replace('GLOBALPRIME:', '').replace('FX:', '').replace('OANDA:', '').replace('BINANCE:', '').replace('NASDAQ:', '').replace('FOREXCOM:', '');
    clean = clean.replace('/', '');

    if (clean === 'US30' || clean.includes('US30') || clean === 'DJI') return 'FOREXCOM:US30';
    if (clean === 'NAS100' || clean.includes('NAS100') || clean === 'NDX') return 'FOREXCOM:NAS100';
    if (clean === 'SPX500' || clean.includes('SPX500') || clean === 'SPX') return 'FOREXCOM:SPX500';
    if (clean === 'GER40' || clean.includes('GER40') || clean === 'DAX') return 'FOREXCOM:GER40';
    if (clean === 'UK100' || clean.includes('UK100') || clean === 'FTSE') return 'FOREXCOM:UK100';
    if (clean === 'JPN225' || clean.includes('JPN225')) return 'CAPITALCOM:JPN225';
    if (clean === 'WTI' || clean === 'USOIL') return 'TVC:USOIL';
    if (clean === 'BRENT' || clean === 'UKOIL') return 'TVC:UKOIL';
    if (clean.includes('XAU') || clean.includes('GOLD')) return 'OANDA:XAUUSD';
    if (clean.includes('XAG') || clean.includes('SILVER')) return 'OANDA:XAGUSD';
    if (clean.includes('XPT')) return 'OANDA:XPTUSD';

    if (['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'META', 'GOOGL', 'AMD', 'INTC', 'COIN', 'PLTR'].includes(clean)) return `NASDAQ:${clean}`;
    if (clean.includes('USDT') || clean.includes('BTC') || clean.includes('ETH') || clean.includes('SOL') || clean.includes('BNB') || clean.includes('XRP') || clean.includes('ADA') || clean.includes('AVAX') || clean.includes('SUI') || clean.includes('NEAR') || clean.includes('DOGE') || clean.includes('PEPE') || clean.includes('SHIB')) {
      return `BINANCE:${clean.includes('USDT') ? clean : clean + 'USDT'}`;
    }
    return `FX:${clean}`;
  };

  const formattedSymbol = formatTvSymbol(symbol);

  const handleOpenExternal = (e) => {
    if (e) e.preventDefault();
    const tvUrl = `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(formattedSymbol)}`;
    if (window.Telegram && window.Telegram.WebApp && typeof window.Telegram.WebApp.openLink === 'function') {
      window.Telegram.WebApp.openLink(tvUrl);
    } else {
      window.open(tvUrl, '_blank', 'noopener,noreferrer');
    }
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
        "symbol": "${formattedSymbol}",
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
          
          <button
            onClick={handleOpenExternal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 'bold',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.35)',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            title={`فتح ${symbol} في متصفح الجهاز خارجي بحجم شاشة كاملة`}
          >
            <span>🖥️ فتح في متصفح TradingView ↗</span>
          </button>
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

