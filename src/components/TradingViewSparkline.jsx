import React from 'react';

/**
 * Generates smooth cubic bezier SVG path from a set of (x, y) coordinates
 */
function getSmoothPath(points) {
  if (points.length < 2) return '';
  
  let path = `M ${points[0].x.toFixed(2)},${points[0].y.toFixed(2)}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? i : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
  }

  return path;
}

/**
 * Generates realistic 28-point financial chart data if raw points aren't provided
 */
function generateRealisticPoints(isUp, seedStr = 'default') {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  
  const pseudoRandom = (step) => {
    const x = Math.sin(hash + step) * 10000;
    return x - Math.floor(x);
  };

  const count = 28;
  const raw = [];
  let currentY = isUp ? 75 : 25; // In Y coordinates (lower value = higher on chart)

  for (let i = 0; i < count; i++) {
    const progress = i / (count - 1);
    
    // Overall trend bias (isUp means Y decreases towards top of SVG)
    const trendBias = isUp ? (progress * -45) : (progress * 45); 
    
    // Micro market swings (realistic pullbacks & rallies like TradingView)
    const wave1 = Math.sin(progress * Math.PI * 4) * 8;
    const wave2 = Math.cos(progress * Math.PI * 7) * 4;
    const noise = (pseudoRandom(i) - 0.48) * 6;

    let y = currentY + trendBias + wave1 + wave2 + noise;
    // Clamp to bounds
    y = Math.max(8, Math.min(92, y));
    raw.push(y);
  }

  // Ensure last point strongly reflects the trend direction
  if (isUp) {
    raw[count - 1] = Math.min(...raw) + 2;
  } else {
    raw[count - 1] = Math.max(...raw) - 2;
  }

  return raw;
}

export default function TradingViewSparkline({
  data = null,
  isUp = true,
  height = 50,
  width = '100%',
  strokeWidth = 2.2,
  id = 'tv-spark',
  showDot = true,
  seed = 'asset'
}) {
  // TradingView Signature Colors:
  // Bullish: Vibrant TradingView Green #089981 / #10b981
  // Bearish: Vibrant TradingView Red #f23645 / #ef4444
  const strokeColor = isUp ? '#089981' : '#f23645';
  const fillColor = isUp ? '#089981' : '#f23645';
  const gradientId = `grad-${id.toString().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  // Get numerical Y values
  let rawValues = data && Array.isArray(data) && data.length >= 3
    ? data
    : generateRealisticPoints(isUp, seed);

  // If rawValues has fewer than 20 points, interpolate to 25 points for smooth micro-swings
  if (rawValues.length < 20) {
    const interpolated = [];
    const targetCount = 25;
    for (let i = 0; i < targetCount; i++) {
      const pos = (i / (targetCount - 1)) * (rawValues.length - 1);
      const indexLow = Math.floor(pos);
      const indexHigh = Math.min(rawValues.length - 1, Math.ceil(pos));
      const t = pos - indexLow;
      const val = rawValues[indexLow] * (1 - t) + rawValues[indexHigh] * t;
      
      // Add subtle micro noise
      const noise = Math.sin(i * 1.5) * 0.6;
      interpolated.push(val + noise);
    }
    rawValues = interpolated;
  }

  const viewBoxWidth = 100;
  const viewBoxHeight = 40;

  // Map values to coordinates
  const minVal = Math.min(...rawValues);
  const maxVal = Math.max(...rawValues);
  const range = maxVal - minVal || 1;

  // Padding so stroke doesn't clip
  const paddingTop = 4;
  const paddingBottom = 4;
  const availableHeight = viewBoxHeight - paddingTop - paddingBottom;

  const points = rawValues.map((val, idx) => {
    const x = (idx / (rawValues.length - 1)) * viewBoxWidth;
    // Higher value = lower Y in SVG coordinate system
    const y = viewBoxHeight - paddingBottom - ((val - minVal) / range) * availableHeight;
    return { x, y };
  });

  const linePath = getSmoothPath(points);
  const lastPoint = points[points.length - 1];

  // Complete area path for TradingView gradient fill under chart
  const areaPath = `${linePath} L ${viewBoxWidth},${viewBoxHeight} L 0,${viewBoxHeight} Z`;

  return (
    <div style={{ width: width, height: `${height}px`, position: 'relative', overflow: 'hidden' }}>
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        preserveAspectRatio="none"
        style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fillColor} stopOpacity="0.42" />
            <stop offset="60%" stopColor={fillColor} stopOpacity="0.12" />
            <stop offset="100%" stopColor={fillColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* 1. TradingView Gradient Area Fill */}
        <path d={areaPath} fill={`url(#${gradientId})`} />

        {/* 2. Crisp TradingView Top Curve Line */}
        <path
          d={linePath}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 3. Glowing End Dot (TradingView Style) */}
        {showDot && lastPoint && (
          <g>
            <circle
              cx={lastPoint.x}
              cy={lastPoint.y}
              r="2.0"
              fill={strokeColor}
            />
            <circle
              cx={lastPoint.x}
              cy={lastPoint.y}
              r="4.2"
              fill={strokeColor}
              fillOpacity="0.35"
            />
          </g>
        )}
      </svg>
    </div>
  );
}
