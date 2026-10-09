import React, { useEffect, useRef, memo } from 'react';

function TradingViewWidget({ symbol = "BINANCE:BTCUSDT", height = 550, timeframe = "1h", showExternalLink = true, studies = [] }) {
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

    // 1. Direct Currency / Specific Pairs
    if (clean.includes('USDEGP') || clean.includes('USD/EGP') || clean.includes('USD_EGP') || clean === 'USD-EGP') {
      return 'FX_IDC:USDEGP';
    }

    // 2. Direct provider prefix checks (already contains full exchange ticker)
    if (
      clean.startsWith('FX_IDC:') || 
      clean.startsWith('FX_OPEN:') || 
      clean.startsWith('TVC:') || 
      clean.startsWith('CAPITALCOM:') || 
      clean.startsWith('FOREXCOM:') || 
      clean.startsWith('OANDA:') || 
      clean.startsWith('BINANCE:') || 
      clean.startsWith('NASDAQ:') || 
      clean.startsWith('NYSE:') || 
      clean.startsWith('AMEX:') || 
      clean.startsWith('INDEX:') ||
      clean.startsWith('PEPPERSTONE:')
    ) {
      return clean;
    }

    if (clean.startsWith('EGX:')) {
      const code = clean.replace('EGX:', '').trim();
      if (code === 'FAWR' || code === 'FWRY') return 'EGX:FWRY';
      if (code === 'EGX70' || code === 'EGX70EWI') return 'EGX:EGX70EWI';
      if (code === 'EGX100' || code === 'EGX100EWI') return 'EGX:EGX100EWI';
      if (code === 'SHARIAH' || code === 'EGX33SHR' || code === 'EGX33SHRIAH') return 'EGX:SHARIAH';
      if (code === 'AZG' || code === 'AZ-GOLD' || code === 'BELTON-GOLD') return 'OANDA:XAUUSD';
      if (code === 'AZ-SILVER') return 'OANDA:XAGUSD';
      return `EGX:${code}`;
    }

    // 3. EGX Stock & Index codes mapping
    const egxMap = {
      'FAWR': 'EGX:FWRY',
      'FWRY': 'EGX:FWRY',
      'COMI': 'EGX:COMI',
      'HRHO': 'EGX:HRHO',
      'TMGH': 'EGX:TMGH',
      'SWDY': 'EGX:SWDY',
      'ETEL': 'EGX:ETEL',
      'ESRS': 'EGX:ESRS',
      'EFIN': 'EGX:EFIN',
      'EKHO': 'EGX:EKHO',
      'ISPH': 'EGX:ISPH',
      'ORAS': 'EGX:ORAS',
      'ABUK': 'EGX:ABUK',
      'MFPC': 'EGX:MFPC',
      'AMOC': 'EGX:AMOC',
      'SKPC': 'EGX:SKPC',
      'HELI': 'EGX:HELI',
      'ORHD': 'EGX:ORHD',
      'MNHD': 'EGX:MNHD',
      'MASR': 'EGX:MASR',
      'PHDC': 'EGX:PHDC',
      'BTFH': 'EGX:BTFH',
      'CIEB': 'EGX:CIEB',
      'ADIB': 'EGX:ADIB',
      'CCAP': 'EGX:CCAP',
      'EAST': 'EGX:EAST',
      'JUFO': 'EGX:JUFO',
      'ORWE': 'EGX:ORWE',
      'CLHO': 'EGX:CLHO',
      'EGX30': 'EGX:EGX30',
      'EGX70': 'EGX:EGX70EWI',
      'EGX70EWI': 'EGX:EGX70EWI',
      'EGX100': 'EGX:EGX100EWI',
      'EGX100EWI': 'EGX:EGX100EWI',
      'SHARIAH': 'EGX:SHARIAH',
      'EGX33SHR': 'EGX:SHARIAH',
      'AZG': 'OANDA:XAUUSD',
      'AZ-GOLD': 'OANDA:XAUUSD',
      'BELTON-GOLD': 'OANDA:XAUUSD',
      'AZ-SILVER': 'OANDA:XAGUSD'
    };

    if (egxMap[clean]) {
      return egxMap[clean];
    }

    // Strip broken or un-entitled prefixes if present
    clean = clean.replace('GLOBALPRIME:', '').replace('FX:', '').replace('/', '').trim();

    // 4. Global indices & Commodities
    if (clean === 'US30' || clean.includes('US30') || clean === 'DJI') return 'FOREXCOM:US30';
    if (clean === 'NAS100' || clean.includes('NAS100') || clean === 'NDX') return 'FOREXCOM:NAS100';
    if (clean === 'SPX500' || clean.includes('SPX500') || clean === 'SPX') return 'FOREXCOM:SPX500';
    if (clean === 'GER40' || clean.includes('GER40') || clean === 'DAX') return 'FOREXCOM:GER40';
    if (clean === 'UK100' || clean.includes('UK100') || clean === 'FTSE') return 'FOREXCOM:UK100';
    if (clean === 'JPN225' || clean.includes('JPN225')) return 'CAPITALCOM:JPN225';
    if (clean === 'WTI' || clean === 'USOIL') return 'TVC:USOIL';
    if (clean === 'BRENT' || clean === 'UKOIL') return 'TVC:UKOIL';
    if (clean.includes('XAU') || clean.includes('GOLD') || clean === '24K GOLD') return 'OANDA:XAUUSD';
    if (clean.includes('XAG') || clean.includes('SILVER')) return 'OANDA:XAGUSD';
    if (clean.includes('XPT')) return 'OANDA:XPTUSD';

    // 5. US Equities
    if (['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'META', 'GOOGL', 'AMD', 'INTC', 'COIN', 'PLTR'].includes(clean)) return `NASDAQ:${clean}`;

    // 6. Crypto
    if (clean.includes('USDT') || clean.includes('BTC') || clean.includes('ETH') || clean.includes('SOL') || clean.includes('BNB') || clean.includes('XRP') || clean.includes('ADA') || clean.includes('AVAX') || clean.includes('SUI') || clean.includes('NEAR') || clean.includes('DOGE') || clean.includes('PEPE') || clean.includes('SHIB')) {
      return `BINANCE:${clean.includes('USDT') ? clean : clean + 'USDT'}`;
    }

    // Default: If 3-5 uppercase letters with no colon, check if it's EGX stock
    if (/^[A-Z]{3,6}$/.test(clean)) {
      return `EGX:${clean}`;
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

  const studiesSerialized = JSON.stringify(studies || []);

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
        "save_image": false,
        "studies": ${studiesSerialized}
      }`;
    container.current.appendChild(script);
  }, [symbol, height, timeframe, studiesSerialized]);

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

