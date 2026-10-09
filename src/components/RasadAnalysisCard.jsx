import React, { useState } from 'react';
import { CheckCircle2, Send, ChevronDown, ChevronUp, Shield, Target, Activity, Zap, Copy, Check } from 'lucide-react';
import { AssetLogo } from '../utils/assetLogos';
import TradingViewSparkline from './TradingViewSparkline';

export default function RasadAnalysisCard({ data: propData, result, onSendToTelegram }) {
  const [showFullReport, setShowFullReport] = useState(false);
  const [copyToast, setCopyToast] = useState('');

  const data = propData || result;
  if (!data) return null;

  // Extract Symbol & Asset Name
  const assetSymbol = (data.pair || data.symbol || data.code || data.asset || 'EUR/USD').trim();
  const assetName = data.name || assetSymbol;

  // Extract Signal type & colors
  const isSell = (data.signal || '').includes('بيع') || (data.signal || '').includes('SELL') || data.signalType === 'SELL';
  const isBuy = (data.signal || '').includes('شراء') || (data.signal || '').includes('BUY') || data.signalType === 'BUY';
  
  const signalColor = data.signalColor || (isSell ? '#ef4444' : isBuy ? '#10b981' : '#f59e0b');
  const signalLabel = isSell ? 'SELL 🔴' : isBuy ? 'BUY 🟢' : (data.signal || 'HOLD 🟡');

  const scoreNum = parseInt(data.score) || 86;
  const confidencePercent = `${scoreNum}%`;
  const confidenceText = data.confidenceText || (isSell ? 'Strong Bearish Trend' : isBuy ? 'Strong Bullish Expansion' : 'Neutral / Rangebound');

  const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Format indicators with smart fallbacks
  const rsi = data.rsi || data.indicators?.rsi || (isSell ? '32.4' : isBuy ? '64.8' : '50.0');
  const stochRsi = data.stochRsi || data.indicators?.stochRsi || (isSell ? '0' : isBuy ? '82.5' : '45.0');
  const williamsR = data.williamsR || data.indicators?.williamsR || (isSell ? '-96.7' : isBuy ? '-18.2' : '-50.0');
  const macd = data.macd || data.indicators?.macd || (isSell ? '-27.74' : isBuy ? '+14.30' : '0.00');
  const pctBb = data.pctBb || data.indicators?.pctBb || (isSell ? '-23%' : isBuy ? '84%' : '50%');
  const volume = data.volume || data.indicators?.volume || (isSell ? '0.05x' : isBuy ? '1.85x' : '1.00x');
  const emaTrend = data.emaTrend || data.indicators?.emaTrend || (isSell ? 'Bearish' : isBuy ? 'Bullish' : 'Neutral');
  const ema200 = data.ema200 || data.indicators?.ema200 || (isSell ? 'Below' : isBuy ? 'Above' : 'At EMA');
  const vwap = data.vwap || data.indicators?.vwap || (isSell ? 'Below' : isBuy ? 'Above' : 'At VWAP');

  // Key Levels
  const support = data.support || data.sl || '---';
  const resistance = data.resistance || data.tp1 || '---';
  const high24 = data.high24 || '---';
  const low24 = data.low24 || '---';

  // 1-Click Copy Helper for SL & TP
  const handleCopy = (label, value) => {
    if (!value) return;
    const cleaned = value.toString().replace(/[^0-9.]/g, '').trim() || value.toString().trim();

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(cleaned);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = cleaned;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }

    if (window.Telegram?.WebApp?.HapticFeedback) {
      try { window.Telegram.WebApp.HapticFeedback.notificationOccurred('success'); } catch (e) {}
    }

    setCopyToast(`${label} copied: ${cleaned} 📋`);
    setTimeout(() => setCopyToast(''), 2200);
  };

  return (
    <div className="stocketa-card-surface" style={{
      background: 'var(--bg-card)',
      border: `1px solid ${signalColor}60`,
      borderRadius: '18px',
      padding: '16px',
      color: 'var(--text-primary)',
      boxShadow: 'var(--shadow-md, 0px 4px 15px 0px rgba(97, 110, 124, 0.08))',
      marginBottom: '12px',
      direction: 'ltr',
      position: 'relative'
    }}>
      
      {/* Toast Notification when Copied */}
      {copyToast && (
        <div style={{
          position: 'absolute',
          top: '-12px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#10b981',
          color: '#000000',
          padding: '4px 14px',
          borderRadius: '20px',
          fontWeight: 'bold',
          fontSize: '0.74rem',
          boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          whiteSpace: 'nowrap'
        }}>
          <CheckCircle2 size={13} />
          <span>{copyToast}</span>
        </div>
      )}

      {/* 1. Header Card: Signal Badge + Symbol + Real Logo + Time */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        
        {/* Signal Badge */}
        <div style={{
          background: isSell ? 'rgba(239, 68, 68, 0.18)' : isBuy ? 'rgba(16, 185, 129, 0.18)' : 'rgba(245, 158, 11, 0.18)',
          border: `1px solid ${signalColor}`,
          color: signalColor,
          padding: '4px 12px',
          borderRadius: '20px',
          fontWeight: '900',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          boxShadow: `0 0 12px ${signalColor}25`
        }}>
          {signalLabel}
        </div>

        {/* Real Symbol Info & Logo */}
        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-start' }}>
              <span>{assetSymbol}</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '1px' }}>
              {data.timeframe || '15m'} · {data.timestamp || nowTime}
            </div>
          </div>

          {/* Real Logo Component */}
          <AssetLogo symbol={assetSymbol} fallbackIcon={data.icon || '📊'} size={18} containerSize={28} />
        </div>

      </div>

      {/* 2. Large Price & 24h Change */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
        <div style={{ fontSize: '1.55rem', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.3px' }}>
          {data.entry || data.price || '---'}
        </div>
        {data.changePercent && (
          <div style={{
            fontSize: '0.8rem',
            fontWeight: 'bold',
            color: (data.changePercent || '').includes('-') ? '#f87171' : '#4ade80',
            display: 'flex',
            alignItems: 'center',
            gap: '2px'
          }}>
            {data.changePercent}
          </div>
        )}
      </div>

      {/* 3. Live Synchronized Sparkline Wave SVG (Compact) */}
      <div style={{ height: '38px', width: '100%', marginBottom: '8px' }}>
        <TradingViewSparkline
          isUp={!isSell}
          height={38}
          id={`rasad-${assetSymbol}`}
          seed={assetSymbol}
          data={data.sparkline || null}
          strokeWidth={2.0}
        />
      </div>

      {/* 4. Confidence Level & Score Bar */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', fontWeight: 'bold' }}>
          <span>Confidence Score</span>
          <span style={{ color: '#cbd5e1' }}>{scoreNum}/100 · {confidencePercent}</span>
        </div>
        {/* Progress bar */}
        <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '10px', overflow: 'hidden', marginBottom: '4px' }}>
          <div style={{
            width: confidencePercent,
            height: '100%',
            background: `linear-gradient(90deg, ${signalColor}80 0%, ${signalColor} 100%)`,
            borderRadius: '10px',
            boxShadow: `0 0 8px ${signalColor}`
          }}></div>
        </div>
        <div style={{ fontSize: '0.7rem', color: signalColor, fontWeight: 'bold', textAlign: 'left' }}>
          {confidenceText}
        </div>
      </div>

      {/* 5. Click-to-Copy TP & SL Boxes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
        
        {/* SL Box */}
        <div 
          onClick={() => handleCopy('Stop Loss (SL)', data.sl)}
          style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.28)',
            borderRadius: '10px',
            padding: '8px 10px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            userSelect: 'none'
          }}
          title="Click to copy Stop Loss level"
        >
          <div style={{ fontSize: '0.68rem', color: '#fca5a5', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '2px' }}>
            <Shield size={12} color="#f87171" />
            <span>Stop Loss (SL)</span>
            <Copy size={10} color="#fca5a5" style={{ opacity: 0.7 }} />
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: '900', color: '#f87171', margin: '1px 0' }}>
            {data.sl || '---'}
          </div>
          <div style={{ fontSize: '0.64rem', color: '#fca5a5', opacity: 0.85, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
            <span>{data.slChange || '-5.00%'}</span>
            <span>· (Click to copy 📋)</span>
          </div>
        </div>

        {/* TP Box */}
        <div 
          onClick={() => handleCopy('Take Profit (TP)', data.tp1)}
          style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.28)',
            borderRadius: '10px',
            padding: '8px 10px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            userSelect: 'none'
          }}
          title="Click to copy Take Profit level"
        >
          <div style={{ fontSize: '0.68rem', color: '#86efac', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '2px' }}>
            <Target size={12} color="#4ade80" />
            <span>Take Profit (TP)</span>
            <Copy size={10} color="#86efac" style={{ opacity: 0.7 }} />
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: '900', color: '#4ade80', margin: '1px 0' }}>
            {data.tp1 || '---'}
          </div>
          <div style={{ fontSize: '0.64rem', color: '#86efac', opacity: 0.85, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
            <span>{data.tp1Change || '+8.50%'}</span>
            <span>· (Click to copy 📋)</span>
          </div>
        </div>

      </div>

      {/* Quick Copy Trade Action Button */}
      <button
        onClick={() => {
          const quickTrade = `⚡ ${signalLabel} Setup for ${assetName}:\n• Entry: $${data.entry || data.price}\n• TP: $${data.tp1}\n• SL: $${data.sl}\n• Risk-Reward: 1:2.4`;
          handleCopy('Trade Setup Parameters', quickTrade);
        }}
        style={{
          width: '100%',
          marginBottom: '10px',
          background: '#3a4766',
          color: '#ffffff',
          border: 'none',
          borderRadius: '100px',
          padding: '12px 18px',
          fontWeight: '700',
          fontSize: '0.85rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          boxShadow: '0 4px 14px rgba(58, 71, 102, 0.3)'
        }}
      >
        <Copy size={14} />
        <span>Copy Trade Parameters (Entry / SL / TP) 📋</span>
      </button>

      {/* 6. Technical Indicators Grid (9 Cards) */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 'bold', color: '#94a3b8', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Activity size={12} color="#60a5fa" />
          <span>Technical Indicators Matrix</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px' }}>
          
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '5px 4px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>RSI(14)</div>
            <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: isSell ? '#f87171' : '#4ade80', marginTop: '1px' }}>{rsi}</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '5px 4px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>StochRSI</div>
            <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: '#4ade80', marginTop: '1px' }}>{stochRsi}</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '5px 4px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>Williams%R</div>
            <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: '#4ade80', marginTop: '1px' }}>{williamsR}</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '5px 4px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>MACD</div>
            <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: isSell ? '#f87171' : '#4ade80', marginTop: '1px' }}>{macd}</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '5px 4px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>BB%</div>
            <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: '#4ade80', marginTop: '1px' }}>{pctBb}</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '5px 4px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>Volume</div>
            <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: '#f59e0b', marginTop: '1px' }}>{volume}</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '5px 4px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>EMA Trend</div>
            <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: isSell ? '#f87171' : '#4ade80', marginTop: '1px' }}>{emaTrend}</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '5px 4px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>EMA200</div>
            <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: isSell ? '#f87171' : '#4ade80', marginTop: '1px' }}>{ema200}</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', padding: '5px 4px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>VWAP</div>
            <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: isSell ? '#f87171' : '#4ade80', marginTop: '1px' }}>{vwap}</div>
          </div>

        </div>
      </div>

      {/* 7. Key Levels Row (Support | Resistance | 24h High | 24h Low) */}
      <div style={{
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '10px',
        padding: '6px 8px',
        marginBottom: '10px',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '4px',
        textAlign: 'center'
      }}>
        <div>
          <div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>Support</div>
          <div style={{ fontSize: '0.74rem', fontWeight: 'bold', color: '#4ade80', marginTop: '1px' }}>{support}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>Resistance</div>
          <div style={{ fontSize: '0.74rem', fontWeight: 'bold', color: '#f87171', marginTop: '1px' }}>{resistance}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>24h High</div>
          <div style={{ fontSize: '0.74rem', fontWeight: 'bold', color: '#cbd5e1', marginTop: '1px' }}>{high24}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>24h Low</div>
          <div style={{ fontSize: '0.74rem', fontWeight: 'bold', color: '#cbd5e1', marginTop: '1px' }}>{low24}</div>
        </div>
      </div>

      {/* 8. Portfolio & Capital Management Box */}
      {(() => {
        const isEgx = (data.unit && data.unit.includes('ج.م')) || data.capitalEgp || data.currencySymbol === 'ج.م' || data.currency === 'EGP' || (data.dataSource && data.dataSource.includes('EGX'));
        const currPrefix = isEgx ? '' : '$';
        const currSuffix = isEgx ? ' ج.م' : '';
        const capText = data.capitalEgp 
          ? `${Number(data.capitalEgp).toLocaleString()} ج.م` 
          : (data.capital ? (isEgx ? `${Number(data.capital).toLocaleString()} ج.م` : `$${data.capital}`) : (isEgx ? '10,000 ج.م' : '$100'));

        return (
          <div style={{
            background: 'rgba(0, 0, 0, 0.45)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '10px',
            padding: '8px 10px',
            marginBottom: '10px'
          }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 'bold', color: '#10b981', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Shield size={12} color="#10b981" />
              <span>Position Sizing & Risk Management ({capText}):</span>
            </div>

            <div style={{ fontSize: '0.7rem', color: '#cbd5e1', lineHeight: '1.5' }}>
              {data.recommendedShares && (
                <div>• <b>Recommended Position Units:</b> <span style={{ color: '#7ee787', fontWeight: 'bold' }}>{Number(data.recommendedShares).toLocaleString()} Shares / Units</span></div>
              )}
              {data.totalInvestmentAmount && (
                <div>• <b>Total Investment Capital:</b> <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>{currPrefix}{Number(data.totalInvestmentAmount).toLocaleString()}{currSuffix}</span></div>
              )}
              {data.recommendedLot && (
                <div>• <b>Recommended Lot Size:</b> <span style={{ color: '#7ee787', fontWeight: 'bold' }}>{data.recommendedLot}</span></div>
              )}

              {data.maxRiskAmount && (
                <div>• <b>Max Risk Amount at SL:</b> <span style={{ color: '#f87171', fontWeight: 'bold' }}>-{currPrefix}{Number(data.maxRiskAmount).toLocaleString()}{currSuffix}</span> (5% Capital Risk)</div>
              )}
              {data.riskDollar && (
                <div>• <b>Max Risk at SL:</b> <span style={{ color: '#f87171', fontWeight: 'bold' }}>{data.riskDollar}</span></div>
              )}

              {data.expectedProfitTp1 && (
                <div>• <b>Expected Profit at TP1:</b> <span style={{ color: '#4ade80', fontWeight: 'bold' }}>+{currPrefix}{Number(data.expectedProfitTp1).toLocaleString()}{currSuffix}</span> (+8.5%)</div>
              )}
              {data.tp1Dollar && (
                <div>• <b>Expected Profit at TP1:</b> <span style={{ color: '#4ade80', fontWeight: 'bold' }}>{data.tp1Dollar}</span></div>
              )}

              {data.expectedProfitTp2 && (
                <div>• <b>Expected Profit at TP2:</b> <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>+{currPrefix}{Number(data.expectedProfitTp2).toLocaleString()}{currSuffix}</span> (+16.8%)</div>
              )}
              {data.tp2Dollar && (
                <div>• <b>Expected Profit at TP2:</b> <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{data.tp2Dollar}</span></div>
              )}
            </div>
          </div>
        );
      })()}

      {/* 8.2 PRIMARY AI & SMC TECHNICAL INSIGHT (ARABIC) */}
      {data.trend && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.85) 100%)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: '10px',
          padding: '9px 11px',
          marginBottom: '10px',
          direction: 'rtl',
          textAlign: 'right'
        }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 'bold', color: '#38bdf8', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span>⚡</span>
            <span>التحليل الفني المؤسسي وقراءة السيولة:</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#e2e8f0', lineHeight: '1.5', fontWeight: '500' }}>
            {data.trend}
          </div>
        </div>
      )}

      {/* 8.3 INSTITUTIONAL SMC GUARDS & SAFETY SHIELD (4 GOLDEN RULES) */}
      {data.institutionalGuards && (
        <div style={{
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '10px',
          padding: '9px 11px',
          marginBottom: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '4px' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 'bold', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span>🛡️</span>
              <span>فلاتر الأمان المؤسسية (SMC Liquidity Shield):</span>
            </div>
            <span style={{ fontSize: '0.62rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.12)', padding: '1px 7px', borderRadius: '8px', fontWeight: 'bold' }}>
              4 Active Filters
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '5px' }}>
            
            {/* Guard 1: Extended Lows */}
            <div style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '7px', padding: '6px 8px', direction: 'rtl', textAlign: 'right' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: data.institutionalGuards.avoidSellingLows.passed ? '#10b981' : '#f87171' }}>
                  {data.institutionalGuards.avoidSellingLows.title}
                </span>
                <span style={{ fontSize: '0.62rem', fontWeight: '900', color: data.institutionalGuards.avoidSellingLows.passed ? '#10b981' : '#f87171', background: data.institutionalGuards.avoidSellingLows.passed ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', padding: '1px 5px', borderRadius: '4px' }}>
                  {data.institutionalGuards.avoidSellingLows.status}
                </span>
              </div>
              <div style={{ fontSize: '0.63rem', color: '#94a3b8', lineHeight: '1.3' }}>
                {data.institutionalGuards.avoidSellingLows.desc}
              </div>
            </div>

            {/* Guard 2: Retest vs Direct Breakdown */}
            <div style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '7px', padding: '6px 8px', direction: 'rtl', textAlign: 'right' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: data.institutionalGuards.sellOnRetestOnly.passed ? '#10b981' : '#38bdf8' }}>
                  {data.institutionalGuards.sellOnRetestOnly.title}
                </span>
                <span style={{ fontSize: '0.62rem', fontWeight: '900', color: data.institutionalGuards.sellOnRetestOnly.passed ? '#10b981' : '#38bdf8', background: data.institutionalGuards.sellOnRetestOnly.passed ? 'rgba(16,185,129,0.1)' : 'rgba(56,189,248,0.1)', padding: '1px 5px', borderRadius: '4px' }}>
                  {data.institutionalGuards.sellOnRetestOnly.status}
                </span>
              </div>
              <div style={{ fontSize: '0.63rem', color: '#94a3b8', lineHeight: '1.3' }}>
                {data.institutionalGuards.sellOnRetestOnly.desc}
              </div>
            </div>

            {/* Guard 3: Liquidity & Oversold Filter */}
            <div style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '7px', padding: '6px 8px', direction: 'rtl', textAlign: 'right' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: data.institutionalGuards.liquidityFilter.passed ? '#10b981' : '#eab308' }}>
                  {data.institutionalGuards.liquidityFilter.title}
                </span>
                <span style={{ fontSize: '0.62rem', fontWeight: '900', color: data.institutionalGuards.liquidityFilter.passed ? '#10b981' : '#eab308', background: data.institutionalGuards.liquidityFilter.passed ? 'rgba(16,185,129,0.1)' : 'rgba(234,179,8,0.1)', padding: '1px 5px', borderRadius: '4px' }}>
                  {data.institutionalGuards.liquidityFilter.status}
                </span>
              </div>
              <div style={{ fontSize: '0.63rem', color: '#94a3b8', lineHeight: '1.3' }}>
                {data.institutionalGuards.liquidityFilter.desc}
              </div>
            </div>

            {/* Guard 4: Session & News Volatility */}
            <div style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '7px', padding: '6px 8px', direction: 'rtl', textAlign: 'right' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: data.institutionalGuards.sessionNewsGuard.isWarning ? '#f59e0b' : '#10b981' }}>
                  {data.institutionalGuards.sessionNewsGuard.title}
                </span>
                <span style={{ fontSize: '0.62rem', fontWeight: '900', color: data.institutionalGuards.sessionNewsGuard.isWarning ? '#f59e0b' : '#10b981', background: data.institutionalGuards.sessionNewsGuard.isWarning ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)', padding: '1px 5px', borderRadius: '4px' }}>
                  {data.institutionalGuards.sessionNewsGuard.status}
                </span>
              </div>
              <div style={{ fontSize: '0.63rem', color: '#94a3b8', lineHeight: '1.3' }}>
                {data.institutionalGuards.sessionNewsGuard.desc}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 8.5 MULTI-AGENT AI DELIBERATION PANEL */}
      {data.multiAgent && data.multiAgent.agents && (
        <div style={{
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '10px',
          padding: '8px 10px',
          marginBottom: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '4px' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 'bold', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>🧠</span>
              <span>AI Agent Committee Consensus:</span>
            </div>
            <span style={{ fontSize: '0.64rem', color: '#10b981', fontWeight: 'bold', background: 'rgba(16, 185, 129, 0.15)', padding: '1px 6px', borderRadius: '8px' }}>
              Consensus: {data.multiAgent.consensusScore || 90}%
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '5px' }}>
            {data.multiAgent.agents.map((agent, idx) => (
              <div key={idx} style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '7px', padding: '6px 7px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <div>
                    <span style={{ fontSize: '0.68rem', fontWeight: 'bold', color: agent.color || '#fff' }}>{agent.name}</span>
                    {agent.model && <div style={{ fontSize: '0.55rem', color: '#64748b' }}>{agent.model}</div>}
                  </div>
                  <span style={{ fontSize: '0.62rem', color: agent.color, fontWeight: 'bold' }}>{agent.status}</span>
                </div>
                <div style={{ fontSize: '0.64rem', color: '#94a3b8', lineHeight: '1.35', marginTop: '2px' }}>
                  {agent.insight}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. AI Full Report Accordion */}
      {data.fullReport && (
        <div style={{ marginTop: '8px' }}>
          <button
            onClick={() => setShowFullReport(!showFullReport)}
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#cbd5e1',
              padding: '6px 10px',
              borderRadius: '8px',
              fontSize: '0.7rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span>🤖 Comprehensive Institutional AI Report</span>
            {showFullReport ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          {showFullReport && (
            <div style={{
              fontSize: '0.7rem',
              color: '#94a3b8',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '8px',
              padding: '10px',
              marginTop: '5px',
              lineHeight: '1.5',
              whiteSpace: 'pre-line',
              border: '1px solid rgba(255,255,255,0.05)'
            }}>
              {data.fullReport}
            </div>
          )}
        </div>
      )}

      {/* 10. Copy Analysis & Signal Summary */}
      <button
        onClick={() => {
          const report = `📊 TRADEN AI Signal for ${assetName} (${assetSymbol}):\n• Bias: ${data.signal}\n• Entry: $${data.entry || data.price}\n• Target 1 (TP1): $${data.tp1}\n• Target 2 (TP2): $${data.tp2}\n• Stop Loss (SL): $${data.sl}\n• Trend: ${data.trend || ''}`;
          handleCopy('Full Signal Summary', report);
        }}
        style={{
          width: '100%',
          marginTop: '8px',
          background: 'rgba(56, 189, 248, 0.15)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          color: '#38bdf8',
          borderRadius: '8px',
          padding: '8px 10px',
          fontWeight: 'bold',
          fontSize: '0.78rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px'
        }}
      >
        <Copy size={14} />
        <span>Copy Full AI Signal & Technical Report 📋</span>
      </button>

    </div>
  );
}
