import React, { useState, useEffect } from 'react';
import { ChevronRight, Clock, Zap, AlertTriangle, ShieldCheck, Flame, TrendingUp } from 'lucide-react';
import TradingViewWidget from './TradingViewWidget';
import { fetchLiveAssetTicker } from '../utils/priceFetcher';

export default function GoldLiquidityRadar({ onBack, onAnalyzeGold }) {
  const [goldTicker, setGoldTicker] = useState({ price: 4236.50, change24h: -1.02, isUp: false });
  const [currentTimeUTC, setCurrentTimeUTC] = useState(new Date().toUTCString().slice(17, 25));
  const [sessionInfo, setSessionInfo] = useState({
    title: 'تداخل لندن ونيويورك (Peak Overlap)',
    status: 'peak',
    color: '#10b981',
    badge: 'ذروة السيولة 🔥',
    desc: 'أقوى وأعلى فترة حركة وسيولة للذهب على مدار اليوم. فرصة عالية جداً للسكالبينج والصفقات السريعة.',
    volumeLevel: 95
  });
  const [nextEventCountdown, setNextEventCountdown] = useState({ label: '', timeStr: '' });

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

      {/* Embedded Live Chart */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>شارت الذهب المباشر (Live Gold Chart) 📊</div>
        <TradingViewWidget symbol="OANDA:XAUUSD" height={400} timeframe="15m" />
      </div>

    </div>
  );
}
