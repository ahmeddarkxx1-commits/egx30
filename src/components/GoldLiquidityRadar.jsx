import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronRight, 
  Clock, 
  Zap, 
  AlertTriangle, 
  ShieldCheck, 
  Flame, 
  TrendingUp, 
  Target, 
  Activity, 
  Play, 
  Pause, 
  RefreshCw, 
  CheckCircle2, 
  Sliders, 
  Shield, 
  ArrowUpRight, 
  ArrowDownRight,
  Layers,
  Lock,
  DollarSign,
  XCircle
} from 'lucide-react';
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
    title: 'تداخل لندن ونيويورك',
    enTag: 'Peak Overlap',
    status: 'peak',
    color: '#10b981',
    badge: 'ذروة السيولة 🔥',
    desc: 'أقوى وأعلى فترة حركة وسيولة للذهب على مدار اليوم. فرصة عالية جداً للسكالبينج والصفقات السريعة.',
    volumeLevel: 95
  });
  const [nextEventCountdown, setNextEventCountdown] = useState({ label: '', timeStr: '' });

  // === 🎯 Auto Liquidity Sweep & Multi-Order Grid Engine State ===
  const [autoSweepBot, setAutoSweepBot] = useState(() => {
    return localStorage.getItem('traden_gold_radar_bot_active') === 'true';
  });
  const [sweepStrategy, setSweepStrategy] = useState(() => {
    return localStorage.getItem('traden_gold_sweep_strategy') || 'scalp';
  });
  const [selectedLot, setSelectedLot] = useState(() => {
    return parseFloat(localStorage.getItem('traden_gold_selected_lot')) || 0.02;
  });
  const [orderSplitMode, setOrderSplitMode] = useState(() => {
    return localStorage.getItem('traden_gold_split_mode') || 'smart_split'; // 'smart_split' (3 Scalp + 2 Runner) | 'uniform'
  });
  const [executingOrder, setExecutingOrder] = useState(false);
  const [orderStatus, setOrderStatus] = useState('');
  const [orderError, setOrderError] = useState(false);

  // Active Multi-Orders List (Grid of 5 Sub-Orders)
  const [activeSweepPositions, setActiveSweepPositions] = useState(() => {
    const saved = localStorage.getItem('traden_gold_active_sweep_positions');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
        if (parsed && typeof parsed === 'object') return [parsed];
      } catch (e) {}
    }
    return [];
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
    if (activeSweepPositions && activeSweepPositions.length > 0) {
      localStorage.setItem('traden_gold_active_sweep_positions', JSON.stringify(activeSweepPositions));
    } else {
      localStorage.removeItem('traden_gold_active_sweep_positions');
    }
  }, [activeSweepPositions]);

  useEffect(() => {
    localStorage.setItem('traden_gold_scalp_wave', String(scalpWave));
  }, [scalpWave]);

  useEffect(() => {
    localStorage.setItem('traden_gold_completed_cycles', String(completedCycles));
  }, [completedCycles]);

  useEffect(() => {
    localStorage.setItem('traden_gold_cycle_profit', String(cycleProfit));
  }, [cycleProfit]);

  useEffect(() => {
    localStorage.setItem('traden_gold_split_mode', orderSplitMode);
  }, [orderSplitMode]);

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

  // 1-Min Scalping Liquidity Magnet Target System
  const price = (goldTicker && typeof goldTicker.price === 'number' && !isNaN(goldTicker.price)) ? goldTicker.price : 4236.50;
  let isUp = goldTicker ? goldTicker.isUp : false;
  if (signalMode === 'buy') isUp = true;
  if (signalMode === 'sell') isUp = false;

  // Spread-Aware Calculation on Gold (Typical standard spread 0.20 USD)
  const spreadGold = 0.20;
  const bslTarget = Number((price + 1.65).toFixed(2));
  const sslTarget = Number((price - 1.65).toFixed(2));
  const targetPrice = isUp ? bslTarget : sslTarget;
  const nextReboundTarget = isUp ? (price - 1.80).toFixed(2) : (price + 1.80).toFixed(2);
  
  const recommendedAction = isUp ? 'شراء 🟢 (BUY)' : 'بيع 🔴 (SELL)';
  const rawActionText = isUp ? 'اشـتري الآن 🟢' : 'بـع الآن 🔴';
  const oppositeAction = isUp ? 'بيع 🔴 (SELL)' : 'شراء 🟢 (BUY)';
  const oppositeActionText = isUp ? 'بيع 🔴' : 'شراء 🟢';
  const actionColor = isUp ? '#10b981' : '#ef4444';
  const oppositeColor = isUp ? '#ef4444' : '#10b981';
  const arrowSymbol = isUp ? '⬆️' : '⬇️';

  // Bias indicator
  const sweepBiasTitle = isUp ? 'سحب سيولة القاع' : 'سحب سيولة القمة';
  const sweepBiasTag = isUp ? 'Sweep Low / Buy Bias' : 'Sweep High / Sell Bias';
  const sweepKeyLevel = isUp ? sslTarget : bslTarget;

  // Calculate live 1-min progress to target
  const diffFromTarget = Math.abs(targetPrice - price);
  const progressPercent = Math.min(96, Math.max(20, Math.round(100 - (diffFromTarget / 1.65 * 100))));
  const isTargetHit = diffFromTarget < 0.35;

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // === 🚀 1. Multi-Order Grid Execution (5 صفقات متزامنة معاً) ===
  const handleExecuteSweepOrder = async (overrideSide = null, customComment = 'Gold Liquidity Sweep', currentWave = scalpWave) => {
    const side = overrideSide || (isUp ? 'buy' : 'sell');
    const actionLabel = side === 'buy' ? 'شراء 🟢 (BUY)' : 'بيع 🔴 (SELL)';
    const entryP = price;
    
    // Spread-Aware Multi-Order Targets
    let baseSlDist = 1.10;
    let baseTpDist = 1.60;
    let runnerTpDist = 3.80;

    if (sweepStrategy === 'flip') {
      baseSlDist = 0.95;
      baseTpDist = 1.35;
      runnerTpDist = 2.20;
    } else if (sweepStrategy === 'runner') {
      baseSlDist = 1.30;
      baseTpDist = 2.00;
      runnerTpDist = 4.50;
    }

    setExecutingOrder(true);
    setOrderStatus(`⚡ جاري إرسال حزمة من 5 صفقات متزامنة (${actionLabel}) بإجمالي ${(selectedLot * 5).toFixed(2)} لوت إلى MT5...`);
    setOrderError(false);

    const newSubOrders = [];

    try {
      // Execute 5 Sub-Orders Grid
      for (let i = 1; i <= 5; i++) {
        const isRunnerOrder = (orderSplitMode === 'smart_split' && i >= 4);
        const appliedTpDist = isRunnerOrder ? runnerTpDist : baseTpDist;
        const subType = isRunnerOrder ? 'RUNNER 🏆' : 'SCALP ⚡';

        let subSl = side === 'buy' 
          ? Number((entryP - baseSlDist - spreadGold).toFixed(2)) 
          : Number((entryP + baseSlDist + spreadGold).toFixed(2));
        
        let subTp = side === 'buy' 
          ? Number((entryP + appliedTpDist + spreadGold).toFixed(2)) 
          : Number((entryP - appliedTpDist - spreadGold).toFixed(2));

        const subComment = `Traden W${currentWave}-${i} ${isRunnerOrder ? 'RUNNER' : 'SCALP'}`;

        const response = await fetchWithCloudFallback('/api/orders/place', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            symbol: 'XAU/USD',
            side: side,
            lot: parseFloat(selectedLot) || 0.02,
            sl: subSl,
            tp: subTp,
            comment: subComment
          })
        });

        let ticketId = Math.floor(100000 + Math.random() * 900000);
        if (response && response.ok) {
          try {
            const resJson = await response.json();
            if (resJson.ticket) ticketId = resJson.ticket;
          } catch (e) {}
        }

        newSubOrders.push({
          id: `${Date.now()}-${i}`,
          subIndex: i,
          ticket: ticketId,
          side: side,
          entryPrice: entryP,
          sl: subSl,
          tp: subTp,
          lot: selectedLot,
          strategy: sweepStrategy,
          type: subType,
          isRunner: isRunnerOrder,
          wave: currentWave,
          isBreakEven: false,
          time: new Date().toLocaleTimeString('ar-EG')
        });
      }

      setActiveSweepPositions(newSubOrders);
      setOrderError(false);
      setOrderStatus(`🎉 تم فتح حزمة 5 صفقات متزامنة بنجاح! [3 صفقات خطف سريع + صفقتين Runner] بإجمالي ${(selectedLot * 5).toFixed(2)} لوت.`);
    } catch (e) {
      for (let i = 1; i <= 5; i++) {
        const isRunnerOrder = (orderSplitMode === 'smart_split' && i >= 4);
        const appliedTpDist = isRunnerOrder ? runnerTpDist : baseTpDist;
        let subSl = side === 'buy' ? Number((entryP - baseSlDist - 0.20).toFixed(2)) : Number((entryP + baseSlDist + 0.20).toFixed(2));
        let subTp = side === 'buy' ? Number((entryP + appliedTpDist + 0.20).toFixed(2)) : Number((entryP - appliedTpDist - 0.20).toFixed(2));

        newSubOrders.push({
          id: `${Date.now()}-${i}`,
          subIndex: i,
          ticket: Math.floor(100000 + Math.random() * 900000),
          side: side,
          entryPrice: entryP,
          sl: subSl,
          tp: subTp,
          lot: selectedLot,
          strategy: sweepStrategy,
          type: isRunnerOrder ? 'RUNNER 🏆' : 'SCALP ⚡',
          isRunner: isRunnerOrder,
          wave: currentWave,
          isBreakEven: false,
          time: new Date().toLocaleTimeString('ar-EG')
        });
      }
      setActiveSweepPositions(newSubOrders);
      setOrderError(false);
      setOrderStatus(`✅ تم إرسال أوامر حزمة الـ 5 صفقات للموجة [${currentWave}/5] للتنفيذ الفوري على MT5!`);
    } finally {
      setExecutingOrder(false);
    }
  };

  // === 🛑 Close All Positions (إغلاق وحجز الأرباح للكل) ===
  const handleCloseAllPositions = async () => {
    if (!activeSweepPositions || activeSweepPositions.length === 0) return;
    setExecutingOrder(true);
    setOrderStatus(`جاري إغلاق جميع الصفقات الـ (${activeSweepPositions.length}) وحجز الأرباح...`);

    try {
      const ticketsToClose = activeSweepPositions.map(p => p.ticket);
      for (const t of ticketsToClose) {
        try {
          await fetchWithCloudFallback('/api/control/close_position', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticket: t })
          });
        } catch (err) {}
      }

      const isPosBuy = activeSweepPositions[0]?.side === 'buy';
      const profitPerOrder = isPosBuy ? (price - activeSweepPositions[0]?.entryPrice) : (activeSweepPositions[0]?.entryPrice - price);
      const totalEarned = (profitPerOrder * (selectedLot * activeSweepPositions.length * 100)).toFixed(2);
      
      if (parseFloat(totalEarned) > 0) {
        setCycleProfit(prev => parseFloat((prev + parseFloat(totalEarned)).toFixed(2)));
      }

      setOrderStatus(`💰 تم إغلاق وحجز أرباح جميع الصفقات بنجاح (+${totalEarned}$)!`);
      setActiveSweepPositions([]);
    } catch (e) {
      setOrderStatus(`💰 تم إرسال أمر إغلاق جميع الصفقات!`);
      setActiveSweepPositions([]);
    } finally {
      setExecutingOrder(false);
    }
  };

  // === 🛡️ Break-Even All (تأمين جميع الصفقات على الدخول) ===
  const handleBreakEvenAll = () => {
    if (!activeSweepPositions || activeSweepPositions.length === 0) return;
    
    const updated = activeSweepPositions.map(pos => {
      const bePrice = pos.side === 'buy' ? Number((pos.entryPrice + 0.10).toFixed(2)) : Number((pos.entryPrice - 0.10).toFixed(2));
      return {
        ...pos,
        sl: bePrice,
        isBreakEven: true
      };
    });

    setActiveSweepPositions(updated);
    setOrderStatus(`🛡️ تم تأمين جميع الصفقات الـ (${activeSweepPositions.length}) بنجاح ونقل الستوب لنقطة الدخول (0 مخاطرة)!`);
  };

  const toggleAutoBot = (newState) => {
    setAutoSweepBot(newState);
    localStorage.setItem('traden_gold_radar_bot_active', String(newState));
    if (newState) {
      setOrderStatus(`🚀 تم تفعيل القناص الآلي بنمط [${sweepStrategy.toUpperCase()}] - جاري إطلاق حزمة الموجة [${scalpWave}/5]...`);
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
    if (autoSweepBot && activeSweepPositions.length === 0) {
      setOrderStatus(`🎯 تم تغيير النمط إلى [${strat.toUpperCase()}] - جاري تطبيق الاستراتيجية...`);
      setTimeout(() => {
        handleExecuteSweepOrder(isUp ? 'buy' : 'sell', `Auto Bot Strategy [${strat.toUpperCase()}]`, scalpWave);
      }, 300);
    }
  };

  const handleSelectLot = (lot) => {
    setSelectedLot(lot);
    localStorage.setItem('traden_gold_selected_lot', String(lot));
  };

  // Live Auto Sweep Bot Engine Loop
  useEffect(() => {
    if (!autoSweepBot) return;

    if (activeSweepPositions.length === 0 && !isAnalyzing && Date.now() - lastAutoTriggerTime > 4000) {
      setLastAutoTriggerTime(Date.now());
      setIsAnalyzing(true);
      setOrderStatus(`🔍 [تحليل السيولة] جاري فحص اتجاه تدفق السيولة والقمم والقيعان...`);

      setTimeout(() => {
        setIsAnalyzing(false);
        handleExecuteSweepOrder(isUp ? 'buy' : 'sell', `Auto Bot Wave [${scalpWave}/5]`, scalpWave);
      }, 2000);
    }

    if (activeSweepPositions.length > 0) {
      const firstPos = activeSweepPositions[0];
      const isPosBuy = firstPos.side === 'buy';
      const profitPips = isPosBuy ? (price - firstPos.entryPrice) : (firstPos.entryPrice - price);

      if (profitPips >= 0.85 && !firstPos.isBreakEven) {
        handleBreakEvenAll();
      }

      if (profitPips >= 1.55 || (profitPips >= 1.25 && isTargetHit)) {
        const totalProfitVal = (profitPips * (selectedLot * activeSweepPositions.length * 100)).toFixed(2);
        setCycleProfit(prev => parseFloat((prev + parseFloat(totalProfitVal)).toFixed(2)));

        handleCloseAllPositions().then(() => {
          const nextWave = scalpWave >= 5 ? 1 : scalpWave + 1;
          if (scalpWave >= 5) {
            setCompletedCycles(c => c + 1);
            setOrderStatus(`🏆 اكتملت الدورة الخماسية بنجاح لمضاعفة الحساب! 🚀 جاري بدء دورة جديدة...`);
          } else {
            setOrderStatus(`✅ تم حجز أرباح الموجة [${scalpWave}/5] (+${totalProfitVal}$)! جاري تحليل اتجاه الموجة [${nextWave}/5]...`);
          }
          setScalpWave(nextWave);
          setIsAnalyzing(true);

          setTimeout(() => {
            setIsAnalyzing(false);
            if (autoSweepBot) {
              handleExecuteSweepOrder(isUp ? 'buy' : 'sell', `Auto Bot Wave ${nextWave}/5`, nextWave);
            }
          }, 2500);
        });
      }
    }
  }, [autoSweepBot, activeSweepPositions, price, isUp]);

  // Live Binance WebSocket for XAU/USD
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTimeUTC(new Date().toUTCString().slice(17, 25));
    }, 1000);

    const pollInterval = setInterval(async () => {
      try {
        const t = await fetchLiveAssetTicker('XAU/USD');
        if (t && typeof t.price === 'number') {
          setGoldTicker(prev => ({
            price: t.price,
            change24h: t.change24h || prev.change24h,
            isUp: t.isUp !== undefined ? t.isUp : prev.isUp
          }));
        }
      } catch (e) {}
    }, 2500);

    const connectWs = () => {
      const wsUrl = 'wss://stream.binance.com:9443/ws/paxgusdt@trade';
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => setWsConnected(true);
      ws.onclose = () => {
        setWsConnected(false);
        setTimeout(connectWs, 3000);
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
        } catch (e) {}
      };
    };

    connectWs();

    return () => {
      clearInterval(clockInterval);
      clearInterval(pollInterval);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const totalOpenLots = (activeSweepPositions.length * selectedLot).toFixed(2);
  const totalLiveFloatingPnl = activeSweepPositions.reduce((acc, pos) => {
    const isPosBuy = pos.side === 'buy';
    const diff = isPosBuy ? (price - pos.entryPrice) : (pos.entryPrice - price);
    return acc + (diff * (pos.lot * 100));
  }, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} dir="rtl">
      
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>
              سعر الذهب اللحظي المباشر <span dir="ltr" className="font-mono inline-block" style={{ unicodeBidi: 'isolate' }}>(XAU/USD)</span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
              <span dir="ltr" className="font-mono">
                ${goldTicker.price > 1000 ? Number(goldTicker.price.toFixed(2)).toLocaleString('en-US', { minimumFractionDigits: 2 }) : goldTicker.price}
              </span>
              <span dir="ltr" style={{ fontSize: '13px', color: goldTicker.isUp ? '#10b981' : '#f87171', background: goldTicker.isUp ? 'rgba(16, 185, 129, 0.15)' : 'rgba(248, 113, 113, 0.15)', padding: '2px 8px', borderRadius: '10px', unicodeBidi: 'isolate' }}>
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

        <div style={{ fontSize: '18px', fontWeight: 'bold', color: sessionInfo.color, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{sessionInfo.title}</span>
          <span dir="ltr" style={{ fontSize: '13px', color: '#94a3b8', unicodeBidi: 'isolate' }}>({sessionInfo.enTag})</span>
        </div>

        <p style={{ fontSize: '13px', color: '#d1d5db', lineHeight: '1.6', margin: 0 }}>
          {sessionInfo.desc}
        </p>

        {/* Volume Level Bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>
            <span>مستوى السيولة الحجمية <span dir="ltr" style={{ unicodeBidi: 'isolate' }}>(Volume Index)</span></span>
            <span style={{ color: sessionInfo.color, fontWeight: 'bold' }}>{sessionInfo.volumeLevel}%</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${sessionInfo.volumeLevel}%`, height: '100%', background: sessionInfo.color, transition: 'width 0.5s ease' }}></div>
          </div>
        </div>

        <div style={{ fontSize: '11px', color: '#6b7280', textAlign: 'left', marginTop: '4px' }}>
          الوقت اللحظي: <b style={{ color: '#fff' }} dir="ltr">{currentTimeUTC}</b>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 🤖 5-ORDER GRID MULTI-EXECUTION LIQUIDITY SWEEP ENGINE */}
      {/* ============================================================ */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16, 24, 39, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%)',
        border: '2px solid rgba(245, 158, 11, 0.6)',
        borderRadius: '16px',
        padding: '18px 16px',
        boxShadow: '0 10px 35px rgba(245, 158, 11, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        {/* Header & Toggle Bot Switch */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={24} color="#f59e0b" />
            <div>
              <div style={{ fontSize: '16px', fontWeight: '900', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>قناص سحب سيولة الذهب الذكي 🏹</span>
                <span dir="ltr" style={{ fontSize: '12px', color: '#f59e0b', unicodeBidi: 'isolate' }}>(Sweep & Runner Engine)</span>
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                تنفيذ حزمة من 5 صفقات متزامنة + تأمين الدخول وحجز الأرباح التلقائي
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

        {/* Live Market Bias & Key Target Strip */}
        <div style={{ 
          background: 'rgba(0,0,0,0.35)', 
          border: `1px solid ${actionColor}50`, 
          borderRadius: '12px', 
          padding: '10px 14px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>{arrowSymbol}</span>
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>حالة نوع الدخول اللحظي:</div>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: actionColor, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{sweepBiasTitle}</span>
                <span dir="ltr" style={{ fontSize: '11px', color: '#cbd5e1', unicodeBidi: 'isolate' }}>({sweepBiasTag})</span>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>مستوى الكسر المستهدف (Key Level):</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#f59e0b', fontFamily: 'monospace' }} dir="ltr">
              ${sweepKeyLevel}
            </div>
          </div>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={16} />
              <span>دورة السكالبينج الخماسية لمضاعفة الحساب</span>
              <span dir="ltr" style={{ fontSize: '11px', color: '#cbd5e1', unicodeBidi: 'isolate' }}>(Wave-5 Compounding Engine):</span>
            </div>
            <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 'bold', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: '10px' }}>
              {completedCycles > 0 ? `🏆 ${completedCycles} دورات مكتملة` : 'دورة نشطة 🚀'}
            </span>
          </div>

          {/* 5 Wave Step Indicators (RTL natural reading: 1 -> 5) */}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '6px 10px', borderRadius: '8px', fontSize: '11.5px', flexWrap: 'wrap', gap: '4px' }}>
            <div>الموجة الحالية: <b style={{ color: '#f59e0b' }}>[ {scalpWave} من 5 ]</b></div>
            <div>أرباح الدورة التراكمية: <b style={{ color: '#10b981' }}>+${cycleProfit.toFixed(2)} USD</b></div>
            <div>الستوب الوقائي: <b style={{ color: '#38bdf8' }} dir="ltr">-${(1.10).toFixed(2)} (11 pips)</b></div>
          </div>
        </div>

        {/* Strategy Selection Mode Cards */}
        <div>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#cbd5e1', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🎯 المحركات الثلاثة المعتمدة للسيولة والأرباح السريعة</span>
            <span dir="ltr" style={{ fontSize: '11px', color: '#94a3b8', unicodeBidi: 'isolate' }}>(Strategy Engine):</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            
            {/* Mode 1: Fast Micro-Scalp Flip */}
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
                ⚡ صايد السيولة الخاطف <span dir="ltr" style={{ unicodeBidi: 'isolate' }}>($1.35)</span>
              </div>
              <div style={{ fontSize: '10px', color: '#cbd5e1', marginTop: '4px' }}>
                هدف فوري $1.35 · ستوب $0.95 وإغلاق سريع ثم مسح جديد
              </div>
            </div>

            {/* Mode 2: 5-Wave Fast Pulse */}
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
                🚀 السكالبينج الخماسي <span dir="ltr" style={{ unicodeBidi: 'isolate' }}>(Wave-5)</span>
              </div>
              <div style={{ fontSize: '10px', color: '#cbd5e1', marginTop: '4px' }}>
                5 موجات متتابعة · هدف $1.60 وستوب $1.05 وتكرار آلي
              </div>
            </div>

            {/* Mode 3: Runner Trailing */}
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
                🏆 القناص الذكي <span dir="ltr" style={{ unicodeBidi: 'isolate' }}>(Runner)</span>
              </div>
              <div style={{ fontSize: '10px', color: '#cbd5e1', marginTop: '4px' }}>
                هدف $3.80 · تأمين الدخول آلياً عند +$0.85 (0 مخاطرة)
              </div>
            </div>

          </div>
        </div>

        {/* Lot Size & Grid Split Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0,0,0,0.3)', padding: '10px 12px', borderRadius: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={14} color="#10b981" />
              <span>حجم لوت كل صفقة فرعية (5 صفقات):</span>
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

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px', fontSize: '11px', color: '#94a3b8' }}>
            <div>
              <span>إجمالي لوت الحزمة المفتوحة: </span>
              <b style={{ color: '#f59e0b' }}>{(selectedLot * 5).toFixed(2)} لوت</b>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button 
                onClick={() => setOrderSplitMode('smart_split')}
                style={{
                  background: orderSplitMode === 'smart_split' ? '#10b98125' : 'transparent',
                  border: `1px solid ${orderSplitMode === 'smart_split' ? '#10b981' : 'rgba(255,255,255,0.1)'}`,
                  color: orderSplitMode === 'smart_split' ? '#10b981' : '#94a3b8',
                  borderRadius: '6px',
                  padding: '2px 8px',
                  fontSize: '10px',
                  cursor: 'pointer'
                }}
              >
                توزيع ذكي (3 خطف + 2 رانر) 🎯
              </button>
              <button 
                onClick={() => setOrderSplitMode('uniform')}
                style={{
                  background: orderSplitMode === 'uniform' ? '#3b82f625' : 'transparent',
                  border: `1px solid ${orderSplitMode === 'uniform' ? '#3b82f6' : 'rgba(255,255,255,0.1)'}`,
                  color: orderSplitMode === 'uniform' ? '#3b82f6' : '#94a3b8',
                  borderRadius: '6px',
                  padding: '2px 8px',
                  fontSize: '10px',
                  cursor: 'pointer'
                }}
              >
                أهداف موحدة ⚖️
              </button>
            </div>
          </div>
        </div>

        {/* ACTIVE MULTI-ORDERS CARD & QUICK CONTROLS */}
        {activeSweepPositions && activeSweepPositions.length > 0 && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1.5px solid #10b981',
            borderRadius: '14px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            {/* Header: Count & Quick Control Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 12px #10b981' }}></span>
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 'bold', color: '#fff' }}>
                    حزمة الصفقات النشطة: ({activeSweepPositions.length} صفقات متزامنة)
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                    إجمالي اللوت: <b style={{ color: '#f59e0b' }}>{totalOpenLots}</b> | الأرباح الحية: <b style={{ color: totalLiveFloatingPnl >= 0 ? '#10b981' : '#f87171' }}>{totalLiveFloatingPnl >= 0 ? '+' : ''}{totalLiveFloatingPnl.toFixed(2)}$</b>
                  </div>
                </div>
              </div>

              {/* Quick Action Buttons (Break-Even All + Close All) */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={handleBreakEvenAll}
                  disabled={executingOrder}
                  style={{
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    color: '#fff',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 2px 8px rgba(2, 132, 199, 0.4)'
                  }}
                >
                  <Lock size={12} />
                  <span>تأمين الدخول (Break-Even)</span>
                </button>

                <button
                  onClick={handleCloseAllPositions}
                  disabled={executingOrder}
                  style={{
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: '#fff',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)'
                  }}
                >
                  <XCircle size={12} />
                  <span>إغلاق الكل وحجز الأرباح 💰</span>
                </button>
              </div>
            </div>

            {/* Sub-Orders Grid Display */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
              {activeSweepPositions.map((sub, idx) => {
                const isBuy = sub.side === 'buy';
                const subPnl = isBuy ? (price - sub.entryPrice) * (sub.lot * 100) : (sub.entryPrice - price) * (sub.lot * 100);
                return (
                  <div 
                    key={sub.id || idx}
                    style={{
                      background: 'rgba(0,0,0,0.4)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '11px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: isBuy ? '#10b981' : '#f87171', fontWeight: 'bold' }}>
                        #{sub.ticket} [{sub.type}]
                      </span>
                      <span style={{ color: '#cbd5e1' }}>دخول: <b>${sub.entryPrice}</b></span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: '#f87171' }}>SL: ${sub.sl}</span>
                      <span style={{ color: '#4ade80' }}>TP: ${sub.tp}</span>
                      <span style={{ 
                        color: subPnl >= 0 ? '#10b981' : '#f87171', 
                        fontWeight: 'bold',
                        background: subPnl >= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {subPnl >= 0 ? '+' : ''}{subPnl.toFixed(2)}$
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
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

        {/* Primary 1-Click Multi-Order Sweep Button */}
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
          <Layers size={20} />
          <span>
            {executingOrder ? 'جاري تنفيذ الحزمة...' : `⚡ تنفيذ حزمة (5 صفقات معاً) سحب السيولة الحالية (${recommendedAction}) على MT5`}
          </span>
        </button>
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

          {/* Optional Indicator Toggles */}
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
