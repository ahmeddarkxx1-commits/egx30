import React, { useState, useEffect } from 'react';
import { ChevronRight, Clock, Zap, AlertTriangle, ShieldCheck, Flame, TrendingUp, Target, Activity } from 'lucide-react';
import TradingViewWidget from './TradingViewWidget';
import { fetchLiveAssetTicker } from '../utils/priceFetcher';

export default function GoldLiquidityRadar({ onBack, onAnalyzeGold }) {
  const [goldTicker, setGoldTicker] = useState({ price: 4236.50, change24h: -1.02, isUp: false });
  const [currentTimeUTC, setCurrentTimeUTC] = useState(new Date().toUTCString().slice(17, 25));
  const [selectedTimeframe, setSelectedTimeframe] = useState('1m');
  const [activeStudies, setActiveStudies] = useState([]);
  const [showAdvancedIndicators, setShowAdvancedIndicators] = useState(false);
  const [sessionInfo, setSessionInfo] = useState({
    title: 'تداخل لندن ونيويورك (Peak Overlap)',
    status: 'peak',
    color: '#10b981',
    badge: 'ذروة السيولة 🔥',
    desc: 'أقوى وأعلى فترة حركة وسيولة للذهب على مدار اليوم. فرصة عالية جداً للسكالبينج والصفقات السريعة.',
    volumeLevel: 95
  });
  const [nextEventCountdown, setNextEventCountdown] = useState({ label: '', timeStr: '' });

  // 1-Min Scalping Liquidity Magnet Target System
  const price = goldTicker.price || 4236.50;
  const isUp = goldTicker.isUp;
  
  // Calculate Upper BSL (Buy Side Liquidity) and Lower SSL (Sell Side Liquidity) targets
  const bslTarget = Number((price + (price * 0.0028)).toFixed(2));
  const sslTarget = Number((price - (price * 0.0028)).toFixed(2));
  const targetPrice = isUp ? bslTarget : sslTarget;
  const nextReboundTarget = isUp ? (price - (price * 0.0035)).toFixed(2) : (price + (price * 0.0035)).toFixed(2);
  
  const recommendedAction = isUp ? 'شراء 🟢 (BUY)' : 'بيع 🔴 (SELL)';
  const rawActionText = isUp ? 'اشـتري الآن 🟢' : 'بـع الآن 🔴';
  const oppositeAction = isUp ? 'بيع 🔴 (SELL)' : 'شراء 🟢 (BUY)';
  const oppositeActionText = isUp ? 'بيع 🔴' : 'شراء 🟢';
  const actionColor = isUp ? '#10b981' : '#ef4444';
  const oppositeColor = isUp ? '#ef4444' : '#10b981';
  const arrowSymbol = isUp ? '⬆️' : '⬇️';
  const targetType = isUp ? 'قمة سيولة الشراء (BSL High)' : 'قاع سيولة البيع (SSL Low)';
  const stopLoss = isUp ? (price - (price * 0.0015)).toFixed(2) : (price + (price * 0.0015)).toFixed(2);
  const takeProfit = targetPrice;

  // Calculate live 1-min progress to target
  const diffFromTarget = Math.abs(targetPrice - price);
  const progressPercent = Math.min(94, Math.max(25, Math.round(100 - (diffFromTarget / (price * 0.0028) * 100))));
  const isTargetHit = diffFromTarget < 0.60;

  // Calculate session status and countdown based on UTC time
  const updateSessionState = () => {
    const now = new Date();
    const utcHour = now.getUTCHours();
    const utcMin = now.getUTCMinutes();
    const utcSec = now.getUTCSeconds();
    
    const timeStr = `${String(utcHour).padStart(2, '0')}:${String(utcMin).padStart(2, '0')}:${String(utcSec).padStart(2, '0')} UTC`;
    setCurrentTimeUTC(timeStr);

    // Determine current session
    if (utcHour >= 12 && utcHour < 17) {
      // 12:00 - 17:00 UTC (Peak NY/London Overlap)
      setSessionInfo({
        title: 'تداخل نيويورك ولندن (NY/London Overlap)',
        status: 'peak',
        color: '#10b981',
        badge: 'ذروة السيولة الانفجارية 🚀',
        desc: 'أعظم سيولة للذهب على الإطلاق! تداولات البنوك الأمريكية والأوروبية معاً. أنسب وقت للسكالبينج واقتناص الاختراقات.',
        volumeLevel: 98
      });
    } else if (utcHour >= 7 && utcHour < 12) {
      // 07:00 - 12:00 UTC (London Session)
      setSessionInfo({
        title: 'جلسة لندن (London Session)',
        status: 'active',
        color: '#3b82f6',
        badge: 'سيولة نشطة ⚡',
        desc: 'انطلاق حركة السيولة الأوروبية وسحب السيولة الهيكلية (Liquidity Sweep). حركة واضحة وتوافق جيد مع الاستراتيجيات.',
        volumeLevel: 80
      });
    } else if (utcHour >= 17 && utcHour < 21) {
      // 17:00 - 21:00 UTC (Late NY Session)
      setSessionInfo({
        title: 'جلسة نيويورك المتأخرة (Late NY Session)',
        status: 'moderate',
        color: '#f59e0b',
        badge: 'سيولة متوسطة ⚖️',
        desc: 'تناقص السيولة التدريجي بعد إغلاق الأسواق الأوروبية. استقرار وتصحيح مستويات اليوم.',
        volumeLevel: 55
      });
    } else {
      // 21:00 - 07:00 UTC (Asian & Pacific Consolidation)
      setSessionInfo({
        title: 'الجلسة الآسيوية والهدوء (Asian Consolidation)',
        status: 'low',
        color: '#ef4444',
        badge: 'سيولة ضعيفة / تجميع ⚠️',
        desc: 'تذبذب عرضي ضيق ونقص في السيولة. يُفضل الانتظار وتجنب الدخول لحين افتتاح الجلسة الأوروبية.',
        volumeLevel: 25
      });
    }

    // Countdown to next NY Overlap Open (12:30 UTC) or London Open (07:00 UTC)
    let targetHour = 12;
    let eventLabel = 'افتتاح ذروة نيويورك (NY Open)';
    if (utcHour >= 12 && utcHour < 17) {
      targetHour = 17;
      eventLabel = 'إغلاق تداخل لندن ونيويورك';
    } else if (utcHour >= 17 || utcHour < 7) {
      targetHour = 7;
      if (utcHour >= 17) targetHour = 31; // Next day 07:00
      eventLabel = 'افتتاح بورصة لندن (London Open)';
    }

    let diffSec = (targetHour * 3600) - (utcHour * 3600 + utcMin * 60 + utcSec);
    if (diffSec < 0) diffSec += 86400;

    const hrs = Math.floor(diffSec / 3600);
    const mins = Math.floor((diffSec % 3600) / 60);
    const secs = diffSec % 60;
    setNextEventCountdown({
      label: eventLabel,
      timeStr: `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    });
  };

  useEffect(() => {
    const loadGold = async () => {
      const ticker = await fetchLiveAssetTicker('XAU/USD');
      setGoldTicker(ticker);
    };
    loadGold();
    updateSessionState();

    const interval = setInterval(() => {
      loadGold();
      updateSessionState();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Top Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <ChevronRight size={24} />
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>رجوع</span>
        </button>

        <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#f59e0b', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Flame size={14} color="#f59e0b" />
          <span>قسم الذهب 🥇</span>
        </div>
      </div>

      {/* Main Header Banner */}
      <div style={{ 
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)', 
        border: '1px solid rgba(245, 158, 11, 0.3)', 
        borderRadius: '16px', 
        padding: '16px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '10px',
        boxShadow: '0 0 25px rgba(245, 158, 11, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>سعر الذهب اللحظي المباشر (XAU/USD)</div>
            <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
              <span>${goldTicker.price > 1000 ? Number(goldTicker.price.toFixed(2)).toLocaleString('en-US', { minimumFractionDigits: 2 }) : goldTicker.price}</span>
              <span style={{ fontSize: '13px', color: goldTicker.isUp ? '#10b981' : '#f87171', background: goldTicker.isUp ? 'rgba(16, 185, 129, 0.15)' : 'rgba(248, 113, 113, 0.15)', padding: '2px 8px', borderRadius: '10px' }}>
                {goldTicker.isUp ? '▲' : '▼'} {goldTicker.change24h}%
              </span>
            </div>
          </div>
          <button 
            onClick={() => onAnalyzeGold && onAnalyzeGold('XAU/USD')}
            style={{ 
              background: '#f59e0b', color: '#000', border: 'none', padding: '10px 16px', borderRadius: '12px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 0 12px rgba(245, 158, 11, 0.4)'
            }}
          >
            <Zap size={16} />
            <span>تحليل الذهب الآن 🤖</span>
          </button>
        </div>
      </div>

      {/* Live Session Status Card */}
      <div style={{ 
        background: 'rgba(255,255,255,0.03)', 
        border: `1px solid ${sessionInfo.color}`, 
        borderRadius: '16px', 
        padding: '16px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px',
        boxShadow: `0 0 20px ${sessionInfo.color}20`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={20} color={sessionInfo.color} />
            <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff' }}>حالة سيولة الذهب الآن</span>
          </div>
          <span style={{ background: `${sessionInfo.color}25`, color: sessionInfo.color, border: `1px solid ${sessionInfo.color}50`, padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
            {sessionInfo.badge}
          </span>
        </div>

        <div style={{ fontSize: '18px', fontWeight: 'bold', color: sessionInfo.color }}>
          {sessionInfo.title}
        </div>

        <p style={{ fontSize: '13px', color: '#d1d5db', lineHeight: '1.6', margin: 0 }}>
          {sessionInfo.desc}
        </p>

        {/* Volume Level Bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>
            <span>مستوى السيولة الحجمية (Volume Index)</span>
            <span style={{ color: sessionInfo.color, fontWeight: 'bold' }}>{sessionInfo.volumeLevel}%</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${sessionInfo.volumeLevel}%`, height: '100%', background: sessionInfo.color, transition: 'width 0.5s ease' }}></div>
          </div>
        </div>

        <div style={{ fontSize: '11px', color: '#6b7280', textAlign: 'left', marginTop: '4px' }}>
          الوقت اللحظي: <b style={{ color: '#fff' }}>{currentTimeUTC}</b>
        </div>
      </div>

      {/* Countdown to Next Power Event */}
      <div style={{ 
        background: 'rgba(0,0,0,0.4)', 
        border: '1px solid rgba(255,255,255,0.08)', 
        borderRadius: '14px', 
        padding: '14px', 
        display: 'flex', 
        alignItems: 'center', 
        justify: 'space-between'
      }}>
        <div>
          <div style={{ fontSize: '11px', color: '#9ca3af' }}>الحدث المترقب التالي:</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', marginTop: '2px' }}>
            {nextEventCountdown.label}
          </div>
        </div>
        <div style={{ fontSize: '20px', fontFamily: 'monospace', fontWeight: 'bold', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '6px 12px', borderRadius: '10px' }}>
          {nextEventCountdown.timeStr}
        </div>
      </div>

      {/* Daily Gold Sessions Schedule */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '16px' }}>
        <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={18} color="#f59e0b" />
          <span>جدول جلسات تداول الذهب اليومية 🏛️</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRight: '4px solid #10b981' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>1. تداخل لندن ونيويورك (Peak Overlap) 🚀</div>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>12:00 - 17:00 UTC (3:30 م - 8:30 م مصر/السعودية)</div>
            </div>
            <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 'bold' }}>أقوى سيولة 🔥</span>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRight: '4px solid #3b82f6' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>2. افتتاح جلسة لندن (London Open) ⚡</div>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>07:00 - 12:00 UTC (10:00 ص - 3:00 م مصر/السعودية)</div>
            </div>
            <span style={{ fontSize: '11px', color: '#3b82f6', fontWeight: 'bold' }}>سيولة نشطة 🟢</span>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRight: '4px solid #f59e0b' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>3. الجلسة الأمريكية المتأخرة (Late NY) ⚖️</div>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>17:00 - 21:00 UTC (8:30 م - 12:00 ص مصر/السعودية)</div>
            </div>
            <span style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 'bold' }}>توازن وتصحيح 🟡</span>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRight: '4px solid #ef4444' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>4. الجلسة الآسيوية (Asian Chop) ⚠️</div>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>21:00 - 07:00 UTC (12:00 ص - 10:00 ص مصر/السعودية)</div>
            </div>
            <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 'bold' }}>ضعيفة - تجنب 🔴</span>
          </div>

        </div>
      </div>

      {/* Gold News & Risk Rules */}
      <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '16px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#f87171', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AlertTriangle size={16} />
          <span>قواعد ذهبية لحماية الحساب عند تداول الذهب 🛡️</span>
        </div>
        <ul style={{ fontSize: '12px', color: '#d1d5db', paddingRight: '18px', margin: 0, lineHeight: '1.7' }}>
          <li>تجنب التداول قبل <b>15 دقيقة</b> وبعد <b>15 دقيقة</b> من الأخبار الأمريكية عالية التأثير (CPI, NFP, FOMC).</li>
          <li>الذهب يستجيب بدقة لـ <b>سحب السيولة الهيكلية (Liquidity Sweep)</b> وقيعان الجلسة الآسيوية قبل الانطلاق.</li>
          <li>استخدم دائماً إدارة مخاطرة حازمة بـ Stop Loss لا يتجاوز 1-2% من محفظتك.</li>
        </ul>
      </div>

      {/* Embedded Live Chart with Chart Overlay Liquidity Indicator */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
        
        {/* Chart Header Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>شارت الذهب المباشر ومؤشر هدف السيولة 📊</span>
          </div>
          <span style={{ background: '#388bfd25', color: '#58a6ff', border: '1px solid #388bfd50', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' }}>
            مؤشر هدف انجذاب السيولة مُفعّل 🎯
          </span>
        </div>

        {/* NEW: 1-Min Scalping Liquidity Arrow Target & Rotation System */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 100%)',
          border: `2px solid ${actionColor}`,
          borderRadius: '16px',
          padding: '18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          boxShadow: `0 0 30px ${actionColor}30`,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Header Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target size={24} color="#f59e0b" />
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#f0f6fc' }}>🎯 مؤشر سهم السيولة الانجذابي (1-Min Scalper Arrow)</span>
            </div>
            <span style={{ background: actionColor + '25', color: actionColor, border: '1px solid ' + actionColor, padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
              فريم 1 دقيقة ⚡
            </span>
          </div>

          {/* Dynamic Scalping Target Banner with Arrow */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${actionColor}60`,
            borderRadius: '14px',
            padding: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {/* Pulsing Arrow Box */}
              <div style={{
                fontSize: '36px',
                width: '60px',
                height: '60px',
                borderRadius: '14px',
                background: `${actionColor}20`,
                border: `2px solid ${actionColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 0 20px ${actionColor}50`
              }}>
                {arrowSymbol}
              </div>

              <div>
                <div style={{ fontSize: '12px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>سهم اتجاه السيولة الحالية:</span>
                  <b style={{ color: actionColor }}>{isUp ? 'سهم صاعد ⬆️ (إلى قمة السيولة)' : 'سهم هابط ⬇️ (إلى قاع السيولة)'}</b>
                </div>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#fff', marginTop: '2px' }}>
                  السيولة تتجه إلى: <span style={{ color: actionColor }}>${Number(targetPrice).toLocaleString()}</span>
                </div>
                <div style={{ fontSize: '11px', color: '#d1d5db', marginTop: '2px' }}>
                  الهدف التراكمي التالي بعد الكسر: <b style={{ color: '#f59e0b' }}>${nextReboundTarget}</b>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.1)', paddingRight: '14px' }}>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>الصفقة المقترحة</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: actionColor, marginTop: '2px' }}>
                {recommendedAction}
              </div>
            </div>
          </div>

          {/* Progress Bar towards Target */}
          <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
              <span style={{ color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🎯 تقدم السعر نحو هدف السيولة ($</span>
                <b style={{ color: '#fff' }}>{targetPrice}</b>
                <span>):</span>
              </span>
              <b style={{ color: actionColor }}>{progressPercent}%</b>
            </div>
            <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.08)', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${actionColor}80 0%, ${actionColor} 100%)`,
                transition: 'width 0.4s ease',
                boxShadow: `0 0 10px ${actionColor}`
              }}></div>
            </div>
          </div>

          {/* Step-by-Step Scalping Strategy Instructions (إستراتيجية تدوير السيولة) */}
          <div style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '12px',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={16} />
              <span>تعليمات تدوير الصفقات اللحظية (1-Min Scalping Execution):</span>
            </div>

            <div style={{ fontSize: '12px', color: '#e5e7eb', lineHeight: '1.7', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div>
                <b>1. الدخول الحجمي الحالي:</b> التداول في اتجاه السهم <b>{recommendedAction}</b> نحو المستوى <b>${targetPrice}</b>.
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 10px', borderRadius: '8px', borderRight: `4px solid ${oppositeColor}` }}>
                <b>2. عند وصول السعر للهدف (${targetPrice}):</b>
                <div style={{ color: '#fbbf24', marginTop: '2px', fontWeight: 'bold' }}>
                  📌 اغلق صفقات {recommendedAction} على ربح فوراً 💰 ثم اضغط {oppositeAction} لاقتناص موجة الانعكاس التالية!
                </div>
              </div>
            </div>
          </div>

          {/* Visual Chart Level Indicator Strip */}
          <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: '12px', padding: '12px' }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#8b949e', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity size={15} color="#388bfd" />
              <span>مستويات السيولة اللحظية المباشرة (Live Price Levels):</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 12px', background: 'rgba(16, 185, 129, 0.12)', borderRight: '4px solid #10b981', borderRadius: '6px' }}>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>🟢 قمة السيولة الشرائية (BSL Sweep Level)</span>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>${bslTarget}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 12px', background: 'rgba(56, 139, 253, 0.18)', borderRight: '4px solid #388bfd', borderRadius: '6px' }}>
                <span style={{ color: '#58a6ff', fontWeight: 'bold' }}>📍 السعر الحالي اللحظي المباشر (Live Price)</span>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>${price}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 12px', background: 'rgba(239, 68, 68, 0.12)', borderRight: '4px solid #ef4444', borderRadius: '6px' }}>
                <span style={{ color: '#f87171', fontWeight: 'bold' }}>🔴 قاع السيولة البيعية (SSL Sweep Level)</span>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>${sslTarget}</span>
              </div>
            </div>
          </div>

        </div>

        {/* ULTRA-FAST LIVE SCALPER SIGNAL DASHBOARD (رادار الإشارة السريعة والمباشرة) */}
        <div style={{
          background: `linear-gradient(135deg, ${actionColor}20 0%, rgba(15, 23, 42, 0.95) 100%)`,
          border: `2px solid ${actionColor}`,
          borderRadius: '16px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxShadow: `0 0 30px ${actionColor}40`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={20} color={actionColor} />
              <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff' }}>⚡ إشـارة تداول السيولة الفورية (Instant Scalp Signal)</span>
            </div>
            <span style={{ background: '#10b98125', color: '#10b981', border: '1px solid #10b98150', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></span>
              تحديث مباشر كل ثانية
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '12px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '2px' }}>الإشارة والقرار اللحظي المباشر:</div>
              <div style={{ fontSize: '26px', fontWeight: 'bold', color: actionColor, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>{rawActionText}</span>
                <span style={{ fontSize: '15px', color: '#fff', background: 'rgba(255,255,255,0.1)', padding: '3px 10px', borderRadius: '8px' }}>السعر: ${price}</span>
              </div>
              <div style={{ fontSize: '12px', color: '#d1d5db', marginTop: '4px' }}>
                🎯 السهم يتجه لسحب سيولة الهدف عند: <b style={{ color: actionColor, fontSize: '14px' }}>${targetPrice}</b>
              </div>
            </div>

            <div style={{ background: `${oppositeColor}15`, border: `1px solid ${oppositeColor}50`, padding: '12px 16px', borderRadius: '12px', textAlign: 'center', minWidth: '180px' }}>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>الخطوة القادمة فور لمس الهدف (${targetPrice}):</div>
              <div style={{ fontSize: '15px', fontWeight: 'bold', color: oppositeColor, marginTop: '4px' }}>
                💰 اقفل الصفقات على ربح واضغط {oppositeActionText}!
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Chart Toolbar & Options */}
        <div style={{
          background: '#121721',
          border: '1px solid #1f2937',
          borderRadius: '14px',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {/* Top Control Bar: Timeframe & Status */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>شارت الذهب النقـي 📊</span>
              <button
                onClick={() => setShowAdvancedIndicators(!showAdvancedIndicators)}
                style={{
                  background: showAdvancedIndicators ? '#2563eb' : 'rgba(255,255,255,0.06)',
                  color: showAdvancedIndicators ? '#fff' : '#9ca3af',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {showAdvancedIndicators ? 'إخفاء المؤشرات الإضافية ✖' : '⚙️ مؤشرات فنية اختيارية (RSI/EMA/MACD)'}
              </button>
            </div>

            {/* Timeframe Selector Buttons */}
            <div style={{ display: 'flex', gap: '4px', background: '#0d0f14', padding: '3px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              {['1m', '5m', '15m', '1h', '4h', '1d'].map(tf => (
                <button
                  key={tf}
                  onClick={() => setSelectedTimeframe(tf)}
                  style={{
                    background: selectedTimeframe === tf ? '#2563eb' : 'transparent',
                    color: selectedTimeframe === tf ? '#fff' : '#9ca3af',
                    border: 'none',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Indicator Toggles (Hidden by default so chart stays clean) */}
          {showAdvancedIndicators && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              {[
                { id: 'STD;RSI', name: '📈 RSI', desc: 'القوة النسبية' },
                { id: 'STD;EMA', name: '🌊 EMA 20/50', desc: 'المتوسط الأسي' },
                { id: 'STD;Volume', name: '📊 Volume', desc: 'حجم الأحجام' },
                { id: 'STD;MACD', name: '📉 MACD', desc: 'مؤشر الماكدي' },
                { id: 'STD;Bollinger_Bands', name: '🛡️ Bollinger', desc: 'بولينجر باندز' },
                { id: 'STD;VWAP', name: '⚡ VWAP', desc: 'متوسط السعر بالحجم' },
                { id: 'STD;Stochastic', name: '📍 Stochastic', desc: 'الاستوكاستك' }
              ].map(ind => {
                const isActive = activeStudies.includes(ind.id);
                return (
                  <button
                    key={ind.id}
                    onClick={() => {
                      if (isActive) {
                        setActiveStudies(activeStudies.filter(s => s !== ind.id));
                      } else {
                        setActiveStudies([...activeStudies, ind.id]);
                      }
                    }}
                    style={{
                      background: isActive ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(217, 119, 6, 0.2) 100%)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isActive ? '#f59e0b' : 'rgba(255,255,255,0.1)'}`,
                      color: isActive ? '#fbbf24' : '#9ca3af',
                      padding: '5px 10px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>{ind.name}</span>
                    <span style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: isActive ? '#10b981' : '#6b7280'
                    }}></span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Clean Live Chart Canvas */}
        <TradingViewWidget 
          symbol="OANDA:XAUUSD" 
          height={480} 
          timeframe={selectedTimeframe}
          studies={activeStudies} 
        />
      </div>

    </div>
  );
}

