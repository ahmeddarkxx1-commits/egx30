import React, { useEffect, useRef, memo } from 'react';

function TradingViewWidget({ symbol = "BINANCE:BTCUSDT", height = 550, timeframe = "1h" }) {
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
    <div className="tradingview-widget-container" ref={container} style={{ height: `${height}px`, width: "100%", borderRadius: "12px", overflow: "hidden" }}>
      <div className="tradingview-widget-container__widget" style={{ height: "100%", width: "100%" }}></div>
    </div>
  );
}

export default memo(TradingViewWidget);
