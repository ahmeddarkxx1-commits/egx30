import React, { useEffect, useRef, memo } from 'react';

function TradingViewWidget({ symbol = "BINANCE:BTCUSDT" }) {
  const container = useRef();

  useEffect(() => {
    // Clear the container first to avoid duplicate widgets
    if (container.current) {
        container.current.innerHTML = "";
    }
    
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "autosize": true,
        "symbol": "${symbol}",
        "interval": "60",
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
        "container_id": "tradingview_${Math.random().toString(36).substring(7)}"
      }`;
    container.current.appendChild(script);
  }, [symbol]);

  return (
    <div className="tradingview-widget-container" ref={container} style={{ height: "400px", width: "100%", borderRadius: "12px", overflow: "hidden" }}>
      <div className="tradingview-widget-container__widget" style={{ height: "calc(100% - 32px)", width: "100%" }}></div>
    </div>
  );
}

export default memo(TradingViewWidget);
