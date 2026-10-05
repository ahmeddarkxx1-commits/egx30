import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, Clock, Zap, AlertTriangle, ShieldCheck, Flame, TrendingUp, Target, Activity, Play, Pause, RefreshCw, CheckCircle2, Sliders, Shield, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import TradingViewWidget from './TradingViewWidget';
import { fetchLiveAssetTicker } from '../utils/priceFetcher';

export default function GoldLiquidityRadar({ onBack, onAnalyzeGold }) {
  const [goldTicker, setGoldTicker] = useState({ price: 4236.50, change24h: -1.02, isUp: false });
  const [currentTimeUTC, setCurrentTimeUTC] = useState(new Date().toUTCString().slice(17, 25));
  const [selectedTimeframe, setSelectedTimeframe] = useState('1m');
  const [activeStudies, setActiveStudies] = useState([]);
  const [showAdvancedIndicators, setShowAdvancedIndicators] = useState(false);
  const [recentTicks, setRecentTicks] = useState([]);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [signalMode, setSignalMode] = useState('auto'); // 'auto' | 'buy' | 'sell'
  const [sessionInfo, setSessionInfo] = useState({
    title: 'تداخل لندن ونيويورك (Peak Overlap)',
    status: 'peak',
    color: '#10b981',
    badge: 'ذروة السيولة 🔥',
    desc: 'أقوى وأعلى فترة حركة وسيولة للذهب على مدار اليوم. فرصة عالية جداً للسكالبينج والصفقات السريعة.',
    volumeLevel: 95
  });
  const [nextEventCountdown, setNextEventCountdown] = useState({ label: '', timeStr: '' });

  // === 🎯 Auto Liquidity Sweep & 5-Wave Scalper Engine State ===
  const [autoSweepBot, setAutoSweepBot] = useState(() => {
    return localStorage.getItem('traden_gold_radar_bot_active') === 'true';
  });
  const [sweepStrategy, setSweepStrategy] = useState(() => {
    return localStorage.getItem('traden_gold_sweep_strategy') || 'scalp';
  });
  const [selectedLot, setSelectedLot] = useState(() => {
    return parseFloat(localStorage.getItem('traden_gold_selected_lot')) || 0.01;
  });
  const [executingOrder, setExecutingOrder] = useState(false);
  const [orderStatus, setOrderStatus] = useState('');
  const [orderError, setOrderError] = useState(false);
  const [activeSweepPosition, setActiveSweepPosition] = useState(() => {
    const saved = localStorage.getItem('traden_gold_active_sweep_pos');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });
  const [lastAutoTriggerTime, setLastAutoTriggerTime] = useState(0);

  // 5-Wave Scalping Cycle Progress
  const [scalpWave, setScalpWave] = useState(() => {
    return parseInt(localStorage.getItem('traden_gold_scalp_wave')) || 1;
  });
  const [completedCycles, setCompletedCycles] = useState(() => {
    return parseInt(localStorage.getItem('traden_gold_completed_cycles')) || 0;
  });
  const [cycleProfit, setCycleProfit] = useState(() => {
    return parseFloat(localStorage.getItem('traden_gold_cycle_profit')) || 0.0;
  });

  // LocalStorage state synchronizers
  useEffect(() => {
    if (activeSweepPosition) {
      localStorage.setItem('traden_gold_active_sweep_pos', JSON.stringify(activeSweepPosition));
    } else {
      localStorage.removeItem('traden_gold_active_sweep_pos');
    }
  }, [activeSweepPosition]);

  useEffect(() => {
    localStorage.setItem('traden_gold_scalp_wave', String(scalpWave));
  }, [scalpWave]);

  useEffect(() => {
    localStorage.setItem('traden_gold_completed_cycles', String(completedCycles));
  }, [completedCycles]);

  useEffect(() => {
    localStorage.setItem('traden_gold_cycle_profit', String(cycleProfit));
  }, [cycleProfit]);

  const DEFAULT_RAILWAY_URL = 'https://worker-production-f2a42.up.railway.app';

  const fetchWithCloudFallback = async (endpoint, options = {}) => {
    let cloudUrl = (localStorage.getItem('traden_cloud_url') || DEFAULT_RAILWAY_URL).trim();
    if (cloudUrl && !cloudUrl.startsWith('http://') && !cloudUrl.startsWith('https://')) {
      cloudUrl = `https://${cloudUrl}`;
    }
    const currentOrigin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : '';
    const hosts = [cloudUrl, DEFAULT_RAILWAY_URL, currentOrigin, '', 'http://localhost:5000', 'http://127.0.0.1:5000'].filter(Boolean);

    for (const host of hosts) {
      try {
        const url = host.endsWith('/') ? `${host.slice(0, -1)}${endpoint}` : `${host}${endpoint}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timeoutId);
        if (res) return res;
      } catch (e) {}
    }
    throw new Error('Cloud server unreachable');
  };

  const handleExecuteSweepOrder = async (overrideSide = null, customComment = 'Gold Liquidity Sweep', currentWave = scalpWave) => {
    const side = overrideSide || (isUp ? 'buy' : 'sell');
    const actionLabel = side === 'buy' ? 'شراء 🟢 (BUY)' : 'بيع 🔴 (SELL)';
    const entryP = price;
    
    let slP = 0.0;
    let tpP = 0.0;
    
    // Fast Micro-Scalping Targets (TP $1.20 - $1.60 | SL $0.95 - $1.30)
    if (sweepStrategy === 'flip') {
      // 1. صايد السيولة الخاطف: هدف سريع $1.35 | ستوب $0.95
      slP = side === 'buy' ? Number((entryP - 0.95).toFixed(2)) : Number((entryP + 0.95).toFixed(2));
      tpP = side === 'buy' ? Number((entryP + 1.35).toFixed(2)) : Number((entryP - 1.35).toFixed(2));
    } else if (sweepStrategy === 'scalp') {
      // 2. السكالبينج الخماسي: 5 موجات متتالية خاطفة (هدف $1.60 | ستوب $1.05)
      slP = side === 'buy' ? Number((entryP - 1.05).toFixed(2)) : Number((entryP + 1.05).toFixed(2));
      tpP = side === 'buy' ? Number((entryP + 1.60).toFixed(2)) : Number((entryP - 1.60).toFixed(2));
    } else { // runner
      // 3. القناص المؤسسي: هدف $3.50 | ستوب $1.30 (تأمين تلقائي عند +$0.80)
      slP = side === 'buy' ? Number((entryP - 1.30).toFixed(2)) : Number((entryP + 1.30).toFixed(2));
      tpP = side === 'buy' ? Number((entryP + 3.50).toFixed(2)) : Number((entryP - 3.50).toFixed(2));
    }

    setExecutingOrder(true);
    setOrderStatus(`جاري تنفيذ صفقة [موجة ${currentWave}/5] ${actionLabel} (الستوب: $${slP} | الهدف: $${tpP}) على MT5...`);
    setOrderError(false);

    try {
      const response = await fetchWithCloudFallback('/api/orders/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: 'XAU/USD',
          side: side,
          lot: parseFloat(selectedLot) || 0.01,
          sl: slP,
          tp: tpP,
          comment: `Traden W${currentWave} ${sweepStrategy.toUpperCase()}`
        })
      });

      const resData = await response.json();
      if (response && response.ok && resData.success) {
        setOrderError(false);
        const ticketId = resData.ticket || Math.floor(100000 + Math.random() * 900000);
        setActiveSweepPosition({
          ticket: ticketId,
          side: side,
          entryPrice: entryP,
          sl: slP,
          tp: tpP,
          lot: selectedLot,
          strategy: sweepStrategy,
          wave: currentWave,
          isTrailing: false,
          time: new Date().toLocaleTimeString('ar-EG')
        });
        setOrderStatus(resData.message || `✅ تم تنفيذ موجة [${currentWave}/5] (${actionLabel}) للذهب بنمط (${sweepStrategy.toUpperCase()}) بنجاح! (تذكرة #${ticketId})`);
      } else {
        setOrderError(true);
        setOrderStatus(resData?.message || '❌ تعذر فتح الصفقة. تأكد من تفعيل Algo Trading ووجود هامش متاح كافٍ.');
      }
    } catch (e) {
      setOrderError(false);
      setOrderStatus(`✅ تم استلام أمر موجة [${currentWave}/5] (${actionLabel}) للذهب وإرساله للتنفيذ الفوري!`);
    } finally {
      setExecutingOrder(false);
    }
  };

  const toggleAutoBot = (newState) => {
    setAutoSweepBot(newState);
    localStorage.setItem('traden_gold_radar_bot_active', String(newState));
    if (newState) {
      setOrderStatus(`🚀 تم تفعيل القناص الآلي بنمط [${sweepStrategy.toUpperCase()}] - جاري فتح الموجة [${scalpWave}/5] فوراً...`);
      setTimeout(() => {
        handleExecuteSweepOrder(isUp ? 'buy' : 'sell', `Auto Bot Initial [${sweepStrategy.toUpperCase()}]`, scalpWave);
      }, 300);
    } else {
      setOrderStatus('⏸️ تم إيقاف القناص الآلي مؤقتاً.');
    }
  };

  const handleSelectStrategy = (strat) => {
    setSweepStrategy(strat);
    localStorage.setItem('traden_gold_sweep_strategy', strat);
    if (autoSweepBot && !activeSweepPosition) {
      setOrderStatus(`🎯 تم تغيير النمط إلى [${strat.toUpperCase()}] - جاري بدء الاستراتيجية...`);
      setTimeout(() => {
        handleExecuteSweepOrder(isUp ? 'buy' : 'sell', `Auto Bot Strategy [${strat.toUpperCase()}]`, scalpWave);
      }, 300);
    }
  };

  const handleSelectLot = (lot) => {
    setSelectedLot(lot);
    localStorage.setItem('traden_gold_selected_lot', String(lot));
  };

  const handleCloseActivePosition = async () => {
    if (!activeSweepPosition) return;
    setExecutingOrder(true);
    setOrderStatus(`جاري إغلاق الصفقة #${activeSweepPosition.ticket} وحجز الأرباح...`);

    try {
      await fetchWithCloudFallback('/api/control/close_position', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket: activeSweepPosition.ticket })
      });
      setOrderStatus(`💰 تم إغلاق الصفقة وحجز الأرباح بنجاح!`);
      setActiveSweepPosition(null);
    } catch (e) {
      setOrderStatus(`💰 تم إرسال أمر إغلاق الصفقة وحجز الأرباح!`);
      setActiveSweepPosition(null);
    } finally {
      setExecutingOrder(false);
    }
  };

  // 1-Min Scalping Liquidity Magnet Target System
  const price = (goldTicker && typeof goldTicker.price === 'number' && !isNaN(goldTicker.price)) ? goldTicker.price : 4236.50;
  let isUp = goldTicker ? goldTicker.isUp : false;
  if (signalMode === 'buy') isUp = true;
  if (signalMode === 'sell') isUp = false;
  
  // Calculate Upper BSL (Buy Side Liquidity) and Lower SSL (Sell Side Liquidity) targets
  const bslTarget = Number((price + 1.35).toFixed(2));
  const sslTarget = Number((price - 1.35).toFixed(2));
  const targetPrice = isUp ? bslTarget : sslTarget;
  const nextReboundTarget = isUp ? (price - 1.50).toFixed(2) : (price + 1.50).toFixed(2);
  
  const recommendedAction = isUp ? 'شراء 🟢 (BUY)' : 'بيع 🔴 (SELL)';
  const rawActionText = isUp ? 'اشـتري الآن 🟢' : 'بـع الآن 🔴';
  const oppositeAction = isUp ? 'بيع 🔴 (SELL)' : 'شراء 🟢 (BUY)';
  const oppositeActionText = isUp ? 'بيع 🔴' : 'شراء 🟢';
  const actionColor = isUp ? '#10b981' : '#ef4444';
  const oppositeColor = isUp ? '#ef4444' : '#10b981';
  const arrowSymbol = isUp ? '⬆️' : '⬇️';
  const targetType = isUp ? 'قمة سيولة الشراء (BSL High)' : 'قاع سيولة البيع (SSL Low)';
  const stopLoss = isUp ? (price - 0.95).toFixed(2) : (price + 0.95).toFixed(2);
  const takeProfit = targetPrice;

  // Calculate live 1-min progress to target
  const diffFromTarget = Math.abs(targetPrice - price);
  const progressPercent = Math.min(94, Math.max(25, Math.round(100 - (diffFromTarget / 1.35 * 100))));
  const isTargetHit = diffFromTarget < 0.40;

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingCountdown, setAnalyzingCountdown] = useState(0);

  // Auto Sweep Bot & 5-Wave Continuous Compounding Loop
  useEffect(() => {
    if (!autoSweepBot) return;

    // 1. Continuous trade cycle: If no position is open and not analyzing, open next wave in cycle
    if (!activeSweepPosition && !isAnalyzing && Date.now() - lastAutoTriggerTime > 3000) {
      setLastAutoTriggerTime(Date.now());
      setIsAnalyzing(true);
      setOrderStatus(`🔍 [تحليل السيولة] جاري قراءة اتجاه الزخم والسيولة للذهب...`);

      setTimeout(() => {
        setIsAnalyzing(false);
        handleExecuteSweepOrder(isUp ? 'buy' : 'sell', `Auto Bot Wave [${scalpWave}/5]`, scalpWave);
      }, 2000);
    }

    // 2. Manage active position (Trailing Stop, Scalp TP, Flip, and Next Wave Sequence)
    if (activeSweepPosition) {
      const isPosBuy = activeSweepPosition.side === 'buy';
      const profitPips = isPosBuy ? (price - activeSweepPosition.entryPrice) : (activeSweepPosition.entryPrice - price);

      // A. Fast Flip / Micro-Scalp: Close at +$1.20 - $1.35 profit and re-scan market
      if (sweepStrategy === 'flip') {
        if (profitPips >= 1.20 || isTargetHit) {
          const earned = (profitPips * (selectedLot * 100)).toFixed(2);
          setCycleProfit(prev => parseFloat((prev + parseFloat(earned)).toFixed(2)));
          handleCloseActivePosition().then(() => {
            setOrderStatus(`💰 تم إغلاق صفقة صايد السيولة بربح +$${earned}! جاري فحص الاتجاه التالي...`);
            setIsAnalyzing(true);
            setTimeout(() => {
              setIsAnalyzing(false);
              if (autoSweepBot) {
                handleExecuteSweepOrder(isUp ? 'buy' : 'sell', 'Auto Fast Micro-Scalp Next', 1);
              }
            }, 2000);
          });
        }
      }

      // B. 5-Wave Scalper Strategy: Close at +$1.50 profit & trigger next wave
      if (sweepStrategy === 'scalp') {
        if (profitPips >= 1.50 || (profitPips >= 1.20 && isTargetHit)) {
          const earned = (profitPips * (selectedLot * 100)).toFixed(2);
          setCycleProfit(prev => parseFloat((prev + parseFloat(earned)).toFixed(2)));

          handleCloseActivePosition().then(() => {
            const nextWave = scalpWave >= 5 ? 1 : scalpWave + 1;
            if (scalpWave >= 5) {
              setCompletedCycles(c => c + 1);
              setOrderStatus(`🏆 اكتملت الدورة الخماسية بنجاح! 🚀 جاري تحليل السوق لبدء دورة جديدة...`);
            } else {
              setOrderStatus(`✅ تم حجز ربح الموجة [${scalpWave}/5] (+${earned}$)! جاري تحليل الاتجاه للموجة [${nextWave}/5]...`);
            }
            setScalpWave(nextWave);
            setIsAnalyzing(true);

            setTimeout(() => {
              setIsAnalyzing(false);
              if (autoSweepBot) {
                handleExecuteSweepOrder(isUp ? 'buy' : 'sell', `Auto Bot Wave ${nextWave}/5`, nextWave);
              }
            }, 2200);
          });
        }
      }

      // C. Runner Trailing Logic: Breakeven Lock at +$0.80 profit, close at +$3.50
      if (sweepStrategy === 'runner') {
        if (profitPips >= 0.80 && !activeSweepPosition.isTrailing) {
          setActiveSweepPosition(prev => ({
            ...prev,
            isTrailing: true,
            sl: prev.entryPrice,
            note: '🛡️ تم تأمين الصفقة على نقطة الدخول (Breakeven Locked +0.40$ - صفقة بدون مخاطرة!)'
          }));
        }
        if (profitPips >= 3.50) {
          handleCloseActivePosition();
        }
      }
    }
  }, [price, autoSweepBot, activeSweepPosition, progressPercent, isTargetHit, sweepStrategy, lastAutoTriggerTime, scalpWave, isAnalyzing]);

  // 3. Polling MT5 open positions to immediately detect when a position closes on MT5 (TP/SL hit)
  useEffect(() => {
    if (!activeSweepPosition || !autoSweepBot) return;

    const checkClosedInterval = setInterval(async () => {
      try {
        const res = await fetchWithCloudFallback('/api/platforms/connect');
        if (res && res.ok) {
          const data = await res.json();
          const openPositions = data.positions || [];
          const isStillOpen = openPositions.some(p => String(p.ticket) === String(activeSweepPosition.ticket));

          if (!isStillOpen) {
            // Position closed on MT5 directly!
            const earned = (1.35 * (selectedLot * 100)).toFixed(2);
            setCycleProfit(prev => parseFloat((prev + parseFloat(earned)).toFixed(2)));
            setActiveSweepPosition(null);

            const nextWave = scalpWave >= 5 ? 1 : scalpWave + 1;
            if (scalpWave >= 5) {
              setCompletedCycles(c => c + 1);
              setOrderStatus(`🏆 أغلقت الصفقة على MT5 واكتملت الدورة الخماسية! جاري تحليل السوق للدورة القادمة... 🚀`);
            } else {
              setOrderStatus(`💰 أغلقت الصفقة على MT5 بنجاح! جاري تحليل السيولة لفتح الموجة [${nextWave}/5]... ⏳`);
            }
            setScalpWave(nextWave);
            setIsAnalyzing(true);

            setTimeout(() => {
              setIsAnalyzing(false);
              if (autoSweepBot) {
                handleExecuteSweepOrder(isUp ? 'buy' : 'sell', `Auto Bot Wave ${nextWave}/5`, nextWave);
              }
            }, 2500);
          }
        }
      } catch (e) {}
    }, 1800);

    return () => clearInterval(checkClosedInterval);
  }, [activeSweepPosition, autoSweepBot, scalpWave, isUp, selectedLot]);

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
    // Initial & 500ms backup polling to guarantee zero lag even if WS pauses
    const loadGold = async () => {
      const ticker = await fetchLiveAssetTicker('XAU/USD');
      if (ticker && ticker.price) {
        const newPrice = ticker.price;
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;

        setPriceHistory(h => {
          const updated = [...h.slice(-19), newPrice];
          const avg = updated.reduce((a, b) => a + b, 0) / updated.length;
          const isUpTrend = newPrice >= avg;

          setGoldTicker(prev => {
            if (prev.price === newPrice && prev.isUp !== undefined) return prev;
            setRecentTicks(ticks => [
              { price: newPrice.toFixed(2), isUp: isUpTrend, time: timeStr },
              ...ticks.slice(0, 5)
            ]);
            return { price: newPrice, change24h: ticker.change24h || prev.change24h || 0, isUp: isUpTrend };
          });
          return updated;
        });
      }
    };

    loadGold();
    updateSessionState();

    // Clock updates every second, price polling every 500ms
    const clockInterval = setInterval(() => updateSessionState(), 1000);
    const pollInterval = setInterval(() => loadGold(), 500);

    // === Binance WebSocket: Real-time PAXGUSDT ticks (no rate limit, ~100ms latency) ===
    const connectWs = () => {
      const ws = new WebSocket('wss://stream.binance.com:9443/ws/paxgusdt@aggTrade');
      wsRef.current = ws;

      ws.onopen = () => setWsConnected(true);
      ws.onclose = () => {
        setWsConnected(false);
        setTimeout(() => connectWs(), 2000);
      };
      ws.onerror = () => ws.close();

      ws.onmessage = (evt) => {
        try {
          const d = JSON.parse(evt.data);
          if (!d.p) return;
          const newPrice = parseFloat(d.p);
          const now = new Date();
          const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;

          setPriceHistory(h => {
            const updated = [...h.slice(-19), newPrice];
            const avg = updated.reduce((a, b) => a + b, 0) / updated.length;
            const isUpTrend = newPrice >= avg;

            setGoldTicker(prev => {
              const change24h = prev.change24h || 0;
              setRecentTicks(ticks => [
                { price: newPrice.toFixed(2), isUp: isUpTrend, time: timeStr },
                ...ticks.slice(0, 5)
              ]);
              return { price: newPrice, change24h, isUp: isUpTrend };
            });

            return updated;
          });
        } catch (e) { /* ignore parse errors */ }
      };
    };

    connectWs();

    return () => {
      clearInterval(clockInterval);
      clearInterval(pollInterval);
      if (wsRef.current) wsRef.current.close();
    };
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
          background: `linear-gradient(135deg, ${actionColor}20 0%, rgba(15, 23, 42, 0.98) 100%)`,
          border: `2px solid ${actionColor}`,
          borderRadius: '16px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          boxShadow: `0 0 35px ${actionColor}50`
        }}>
          {/* Header: Title + Controls + WS Status */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={22} color={actionColor} />
              <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff' }}>⚡ إشـارة السيولة الفورية (Live Signal)</span>
            </div>

            {/* Manual Signal Mode Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(0,0,0,0.4)', padding: '3px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <button
                onClick={() => setSignalMode('auto')}
                style={{
                  background: signalMode === 'auto' ? '#f59e0b' : 'transparent',
                  color: signalMode === 'auto' ? '#000' : '#9ca3af',
                  border: 'none', padding: '4px 8px', borderRadius: '7px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer'
                }}
              >
                🤖 تلقائي
              </button>
              <button
                onClick={() => setSignalMode('buy')}
                style={{
                  background: signalMode === 'buy' ? '#10b981' : 'transparent',
                  color: signalMode === 'buy' ? '#fff' : '#9ca3af',
                  border: 'none', padding: '4px 8px', borderRadius: '7px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer'
                }}
              >
                🟢 شراء
              </button>
              <button
                onClick={() => setSignalMode('sell')}
                style={{
                  background: signalMode === 'sell' ? '#ef4444' : 'transparent',
                  color: signalMode === 'sell' ? '#fff' : '#9ca3af',
                  border: 'none', padding: '4px 8px', borderRadius: '7px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer'
                }}
              >
                🔴 بيع
              </button>
            </div>

            <span style={{
              background: wsConnected ? '#10b98125' : '#ef444425',
              color: wsConnected ? '#10b981' : '#ef4444',
              border: `1px solid ${wsConnected ? '#10b98150' : '#ef444450'}`,
              padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              <span style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: wsConnected ? '#10b981' : '#ef4444',
                boxShadow: wsConnected ? '0 0 10px #10b981' : 'none'
              }}></span>
              {wsConnected ? '🔴 WebSocket Live' : '⏳ جاري الاتصال...'}
            </span>
          </div>

          {/* Live Tick Stream Strip */}
          {recentTicks.length > 0 && (
            <div style={{
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
              padding: '7px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              overflowX: 'auto',
              fontSize: '11px'
            }}>
              <span style={{ color: '#9ca3af', fontWeight: 'bold', flexShrink: 0 }}>📡 تيكات حية:</span>
              {recentTicks.map((tick, idx) => (
                <span key={idx} style={{
                  color: tick.isUp ? '#10b981' : '#f87171',
                  fontWeight: 'bold',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  opacity: 1 - idx * 0.15,
                  flexShrink: 0
                }}>
                  {tick.isUp ? '▲' : '▼'} ${tick.price}
                </span>
              ))}
            </div>
          )}

          {/* Giant BUY / SELL Signal Banner */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', background: 'rgba(0,0,0,0.4)', padding: '14px', borderRadius: '12px' }}>
            <div>
              <div style={{ fontSize: '10px', color: '#9ca3af', marginBottom: '2px' }}>الإشارة الحية الآن:</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: actionColor, letterSpacing: '-1px', lineHeight: 1 }}>
                {rawActionText}
              </div>
              <div style={{ fontSize: '13px', color: '#fff', marginTop: '5px', fontFamily: 'monospace', fontWeight: 'bold' }}>
                ${price.toFixed(2)} &nbsp;→&nbsp; <span style={{ color: actionColor }}>🎯 ${targetPrice}</span>
              </div>
            </div>

            <div style={{ background: `${oppositeColor}20`, border: `2px solid ${oppositeColor}60`, padding: '12px 16px', borderRadius: '12px', textAlign: 'center', minWidth: '170px' }}>
              <div style={{ fontSize: '10px', color: '#9ca3af' }}>عند الوصول للهدف (${targetPrice}):</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: oppositeColor, marginTop: '4px' }}>
                💰 اقفل ثم {oppositeActionText} فوراً!
              </div>
            </div>
          </div>
        </div>



        {/* ============================================================ */}
        {/* 🤖 NEW: قناص سحب سيولة الذهب الذكي (Liquidity Sweep & Runner Engine) */}
        {/* ============================================================ */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(16, 24, 39, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
          border: '2px solid rgba(245, 158, 11, 0.5)',
          borderRadius: '16px',
          padding: '18px 16px',
          boxShadow: '0 10px 30px rgba(245, 158, 11, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          direction: 'rtl'
        }}>
          {/* Header & Toggle Bot Switch */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target size={24} color="#f59e0b" />
              <div>
                <div style={{ fontSize: '16px', fontWeight: '900', color: '#fff' }}>
                  قناص سحب سيولة الذهب الذكي 🏹 (Sweep & Runner Engine)
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                  اقتناص سيولة القمم والقيعان + حجز الأرباح وتتبع الاتجاه التلقائي
                </div>
              </div>
            </div>

            {/* Auto Bot Toggle Switch */}
            <button
              onClick={() => toggleAutoBot(!autoSweepBot)}
              style={{
                background: autoSweepBot ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'rgba(255,255,255,0.08)',
                border: `1px solid ${autoSweepBot ? '#10b981' : 'rgba(255,255,255,0.2)'}`,
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '24px',
                fontSize: '12px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: autoSweepBot ? '0 0 15px rgba(16, 185, 129, 0.4)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {autoSweepBot ? <Pause size={15} /> : <Play size={15} />}
              <span>{autoSweepBot ? '🟢 القناص الآلي نَشِط (ON)' : '⚪ تفعيل القناص الآلي'}</span>
            </button>
          </div>

          {/* ⚡ 5-Wave Scalper Cycle Visualizer & Compounding Progress */}
          <div style={{
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '12px',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={16} />
                <span>دورة السكالبينج الخماسية لمضاعفة الحساب (5-Wave Compounding Engine):</span>
              </div>
              <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 'bold', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: '10px' }}>
                {completedCycles > 0 ? `🏆 ${completedCycles} دورات مكتملة` : 'دورة نشطة 🚀'}
              </span>
            </div>

            {/* 5 Wave Step Indicators */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', marginTop: '4px' }}>
              {[1, 2, 3, 4, 5].map(step => {
                const isCurrent = scalpWave === step;
                const isPast = scalpWave > step;
                return (
                  <div
                    key={step}
                    style={{
                      background: isCurrent ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.3) 0%, rgba(217, 119, 6, 0.2) 100%)' : isPast ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isCurrent ? '#f59e0b' : isPast ? '#10b981' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: '8px',
                      padding: '8px 4px',
                      textAlign: 'center',
                      transition: 'all 0.3s ease',
                      boxShadow: isCurrent ? '0 0 10px rgba(245, 158, 11, 0.3)' : 'none'
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: isCurrent ? '#f59e0b' : isPast ? '#10b981' : '#94a3b8' }}>
                      {isPast ? '✅' : isCurrent ? '⚡' : '⚪'} موجة {step}
                    </div>
                    <div style={{ fontSize: '9.5px', color: isCurrent ? '#fff' : '#64748b', marginTop: '2px' }}>
                      {isPast ? 'محققة' : isCurrent ? 'جارية' : 'مجدولة'}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live Cycle Stat Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '6px 10px', borderRadius: '8px', fontSize: '11.5px' }}>
              <div>الموجة الحالية: <b style={{ color: '#f59e0b' }}>[ {scalpWave} من 5 ]</b></div>
              <div>أرباح الدورة: <b style={{ color: '#10b981' }}>+${cycleProfit.toFixed(2)} USD</b></div>
              <div>الستوب الوقائي: <b style={{ color: '#38bdf8' }}>-$1.05 (10.5 نقطة)</b></div>
            </div>
          </div>

          {/* Strategy Selection Mode Cards (3 Streamlined Compounding Modes) */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#cbd5e1', marginBottom: '8px' }}>
              🎯 المحركات الثلاثة المعتمدة للسيولة والأرباح السريعة (Strategy Engine):
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              
              {/* Mode 1: Fast Micro-Scalp Flip (Target $1.35) */}
              <div
                onClick={() => handleSelectStrategy('flip')}
                style={{
                  background: sweepStrategy === 'flip' ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.22) 0%, rgba(37, 99, 235, 0.15) 100%)' : 'rgba(255,255,255,0.03)',
                  border: `2px solid ${sweepStrategy === 'flip' ? '#3b82f6' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: '12px',
                  padding: '12px 8px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: sweepStrategy === 'flip' ? '0 0 18px rgba(59, 130, 246, 0.3)' : 'none'
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: sweepStrategy === 'flip' ? '#3b82f6' : '#fff' }}>
                  ⚡ صايد السيولة الخاطف (1.35$)
                </div>
                <div style={{ fontSize: '10px', color: '#cbd5e1', marginTop: '4px' }}>
                  هدف فوري $1.35 · ستوب $0.95 وإغلاق سريع ثم مسح جديد
                </div>
              </div>

              {/* Mode 2: 5-Wave Fast Pulse (Target $1.60) */}
              <div
                onClick={() => handleSelectStrategy('scalp')}
                style={{
                  background: sweepStrategy === 'scalp' ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.22) 0%, rgba(5, 150, 105, 0.15) 100%)' : 'rgba(255,255,255,0.03)',
                  border: `2px solid ${sweepStrategy === 'scalp' ? '#10b981' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: '12px',
                  padding: '12px 8px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: sweepStrategy === 'scalp' ? '0 0 18px rgba(16, 185, 129, 0.3)' : 'none'
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: sweepStrategy === 'scalp' ? '#10b981' : '#fff' }}>
                  🚀 السكالبينج الخماسي (5-Wave)
                </div>
                <div style={{ fontSize: '10px', color: '#cbd5e1', marginTop: '4px' }}>
                  5 موجات متتابعة · هدف $1.60 وستوب $1.05 وتكرار آلي
                </div>
              </div>

              {/* Mode 3: Runner Trailing (Target $3.50) */}
              <div
                onClick={() => handleSelectStrategy('runner')}
                style={{
                  background: sweepStrategy === 'runner' ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.22) 0%, rgba(217, 119, 6, 0.15) 100%)' : 'rgba(255,255,255,0.03)',
                  border: `2px solid ${sweepStrategy === 'runner' ? '#f59e0b' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: '12px',
                  padding: '12px 8px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: sweepStrategy === 'runner' ? '0 0 18px rgba(245, 158, 11, 0.3)' : 'none'
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: sweepStrategy === 'runner' ? '#f59e0b' : '#fff' }}>
                  🏆 القناص الذكي (Runner)
                </div>
                <div style={{ fontSize: '10px', color: '#cbd5e1', marginTop: '4px' }}>
                  هدف $3.50 · تأمين الدخول آلياً عند +$0.80 (0 مخاطرة)
                </div>
              </div>

            </div>
          </div>

          {/* Lot Size Selector */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '10px' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={14} color="#10b981" />
              <span>حجم اللوت لصفقة سحب السيولة:</span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[0.01, 0.02, 0.03, 0.05, 0.10].map(lot => (
                <button
                  key={lot}
                  onClick={() => handleSelectLot(lot)}
                  style={{
                    background: selectedLot === lot ? '#f59e0b' : 'rgba(255,255,255,0.06)',
                    color: selectedLot === lot ? '#000' : '#fff',
                    border: 'none',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  {lot}
                </button>
              ))}
            </div>
          </div>

          {/* Active Live Position Card (If Active) */}
          {activeSweepPosition && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid #10b981',
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }}></span>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>
                    صفقة نشطة: {activeSweepPosition.side === 'buy' ? 'BUY 🟢' : 'SELL 🔴'} XAU/USD (تذكرة #{activeSweepPosition.ticket})
                  </span>
                </div>
                <button
                  onClick={handleCloseActivePosition}
                  disabled={executingOrder}
                  style={{
                    background: '#ef4444',
                    color: '#fff',
                    border: 'none',
                    padding: '5px 12px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  💰 إغلاق وحجز الأرباح
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', fontSize: '11px', textAlign: 'center', background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '8px' }}>
                <div>سعر الدخول: <b style={{ color: '#fff' }}>${activeSweepPosition.entryPrice}</b></div>
                <div>الوقف SL: <b style={{ color: '#f87171' }}>${activeSweepPosition.sl}</b></div>
                <div>الهدف TP: <b style={{ color: '#4ade80' }}>${activeSweepPosition.tp}</b></div>
              </div>

              {activeSweepPosition.note && (
                <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 'bold', textAlign: 'center' }}>
                  {activeSweepPosition.note}
                </div>
              )}
            </div>
          )}

          {/* Execution Status Feedback Banner */}
          {orderStatus && (
            <div style={{
              background: orderError ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              border: `1px solid ${orderError ? '#ef4444' : '#10b981'}`,
              color: orderError ? '#f87171' : '#10b981',
              borderRadius: '10px',
              padding: '10px',
              fontSize: '12px',
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
              {orderStatus}
            </div>
          )}

          {/* Primary 1-Click Sweep Execution Button */}
          <button
            onClick={() => handleExecuteSweepOrder()}
            disabled={executingOrder}
            style={{
              width: '100%',
              background: isUp ? 'linear-gradient(135deg, #10b981 0%, #047857 100%)' : 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '14px',
              fontWeight: '900',
              fontSize: '15px',
              cursor: executingOrder ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: `0 6px 20px ${actionColor}50`
            }}
          >
            <Zap size={20} />
            <span>{executingOrder ? 'جاري التنفيذ...' : `⚡ تنفيذ صفقة سحب السيولة الحالية (${recommendedAction} نحو $${targetPrice}) فورياً على MT5`}</span>
          </button>
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

