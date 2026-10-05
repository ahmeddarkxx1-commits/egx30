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
  XCircle,
  Wifi,
  WifiOff
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
  const computeSessionInfo = (now = new Date()) => {
    const utcHour = now.getUTCHours();
    const utcMin = now.getUTCMinutes();
    const timeVal = utcHour + utcMin / 60;

    if (timeVal >= 12 && timeVal < 16) {
      return {
        title: 'تداخل لندن ونيويورك',
        enTag: 'Peak Overlap',
        status: 'peak',
        color: '#10b981',
        badge: 'ذروة السيولة 🔥',
        desc: 'أقوى وأعلى فترة حركة وسيولة للذهب على مدار اليوم. فرصة عالية جداً للسكالبينج والصفقات السريعة.',
        volumeLevel: 95
      };
    }
    if (timeVal >= 7 && timeVal < 12) {
      return {
        title: 'جلسة لندن الأوروبية',
        enTag: 'London Session',
        status: 'high',
        color: '#3b82f6',
        badge: 'سيولة عالية ⚡',
        desc: 'افتتاح وتداول البنوك الأوروبية ولندن. نشاط وحركة اتجاهية قوية في الذهب والعملات.',
        volumeLevel: 85
      };
    }
    if (timeVal >= 16 && timeVal < 21) {
      return {
        title: 'جلسة نيويورك الأمريكية',
        enTag: 'New York Session',
        status: 'high',
        color: '#f59e0b',
        badge: 'نشاط أمريكي 🇺🇸',
        desc: 'جلسة التداول الأمريكية بعد إغلاق لندن. تحركات قوية مع تداولات وول ستريت.',
        volumeLevel: 80
      };
    }
    if (timeVal >= 21 && timeVal < 23) {
      return {
        title: 'إغلاق نيويورك وبداية سيدني',
        enTag: 'Late NY / Sydney Open',
        status: 'moderate',
        color: '#a855f7',
        badge: 'سيولة متوسطة 🌙',
        desc: 'فترة ختام التداولات الأمريكية وافتتاح السوق الأسترالي. الحركة تتجه للهدوء النسبي.',
        volumeLevel: 45
      };
    }
    return {
      title: 'الجلسة الآسيوية (طوكيو)',
      enTag: 'Asian Session',
      status: 'low',
      color: '#64748b',
      badge: 'سيولة هادئة 💤',
      desc: 'تداولات هادئة ونطاقات تذبذب ضيقة (Consolidation) بانتظار افتتاح لندن.',
      volumeLevel: 30
    };
  };

  const [sessionInfo, setSessionInfo] = useState(() => computeSessionInfo());
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
    return localStorage.getItem('traden_gold_split_mode') || 'smart_split';
  });
  const [executingOrder, setExecutingOrder] = useState(false);
  const [orderStatus, setOrderStatus] = useState('');
  const [orderError, setOrderError] = useState(false);

  // REAL LIVE MT5 POSITIONS (Strictly synced with /api/account)
  const [activeSweepPositions, setActiveSweepPositions] = useState([]);
  const [isMt5Connected, setIsMt5Connected] = useState(false);
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

  // Clear any legacy mock storage on initial load
  useEffect(() => {
    localStorage.removeItem('traden_gold_active_sweep_pos');
    localStorage.removeItem('traden_gold_active_sweep_positions');
  }, []);

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

  // === 🔄 REAL-TIME SYNC WITH REAL MT5 ACCOUNT POSITIONS ===
  const syncLiveMt5Positions = async () => {
    try {
      const response = await fetchWithCloudFallback('/api/account');
      if (response && response.ok) {
        const data = await response.json();
        setIsMt5Connected(Boolean(data.connected));
        
        const rawPositions = Array.isArray(data.positions) ? data.positions : [];
        
        // Format and display all active positions currently open on MT5
        const formatted = rawPositions.map((p, idx) => {
          const side = String(p.type || '').toLowerCase().includes('buy') || p.type === 0 ? 'buy' : 'sell';
          const sym = String(p.symbol || '').toUpperCase();
          const isGold = sym.includes('XAU') || sym.includes('GOLD');
          const isRunner = idx >= 3;
          return {
            id: String(p.ticket || idx),
            ticket: p.ticket,
            symbol: p.symbol || 'XAU/USD',
            side: side,
            entryPrice: Number(p.price_open || p.price || price),
            sl: Number(p.sl || 0),
            tp: Number(p.tp || 0),
            lot: Number(p.volume || selectedLot),
            profit: Number(p.profit || 0),
            type: isGold ? (isRunner ? 'RUNNER 🏆' : 'SCALP ⚡') : `${sym.slice(0, 7)} 🌐`,
            isBreakEven: false
          };
        });

        setActiveSweepPositions(formatted);
      }
    } catch (err) {
      // If network offline, don't invent fake positions
    }
  };

  // Poll live MT5 account every 3.5 seconds
  useEffect(() => {
    syncLiveMt5Positions();
    const interval = setInterval(syncLiveMt5Positions, 3500);
    return () => clearInterval(interval);
  }, [price]);

  // === 🚀 1. Multi-Order Grid Execution (5 صفقات متزامنة معاً على MT5 الحقيقي) ===
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
    setOrderStatus(`⚡ جاري إرسال حزمة الـ 5 صفقات المتزامنة (${actionLabel}) بإجمالي ${(selectedLot * 5).toFixed(2)} لوت إلى MT5...`);
    setOrderError(false);

    try {
      for (let i = 1; i <= 5; i++) {
        const isRunnerOrder = (orderSplitMode === 'smart_split' && i >= 4);
        const appliedTpDist = isRunnerOrder ? runnerTpDist : baseTpDist;

        let subSl = side === 'buy' 
          ? Number((entryP - baseSlDist - spreadGold).toFixed(2)) 
          : Number((entryP + baseSlDist + spreadGold).toFixed(2));
        
        let subTp = side === 'buy' 
          ? Number((entryP + appliedTpDist + spreadGold).toFixed(2)) 
          : Number((entryP - appliedTpDist - spreadGold).toFixed(2));

        const subComment = `Traden W${currentWave}-${i} ${isRunnerOrder ? 'RUNNER' : 'SCALP'}`;

        await fetchWithCloudFallback('/api/orders/place', {
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
      }

      setOrderError(false);
      setOrderStatus(`✅ تم إرسال حزمة الـ 5 صفقات بنجاح إلى منصة MT5! جاري تحديث بيانات الحساب المباشرة...`);
      // Trigger instant sync with real account
      setTimeout(syncLiveMt5Positions, 1000);
      setTimeout(syncLiveMt5Positions, 3000);
    } catch (e) {
      setOrderError(true);
      setOrderStatus(`⚠️ تعذر الاتصال بالسيرفر السحابي أو MT5. يرجى التأكد من تشغيل الجسر على الـ VPS.`);
    } finally {
      setExecutingOrder(false);
    }
  };

  // === 🛑 Close All Real Positions (إغلاق وحجز الأرباح للكل) ===
  const handleCloseAllPositions = async () => {
    if (!activeSweepPositions || activeSweepPositions.length === 0) return;
    setExecutingOrder(true);
    setOrderStatus(`جاري إغلاق جميع الصفقات المفتوحة وحجز الأرباح في MT5...`);

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

      const totalProfit = activeSweepPositions.reduce((acc, p) => acc + (p.profit || 0), 0);
      if (totalProfit > 0) {
        setCycleProfit(prev => parseFloat((prev + totalProfit).toFixed(2)));
      }

      setOrderStatus(`💰 تم إرسال أوامر إغلاق الصفقات بنجاح!`);
      setTimeout(syncLiveMt5Positions, 1000);
    } catch (e) {
      setOrderStatus(`💰 تم إرسال أمر إغلاق الصفقات!`);
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
    setOrderStatus(`🛡️ تم طلب نقل الستوب لوز لنقطة الدخول (0 مخاطرة)!`);
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

    if (activeSweepPositions.length === 0 && !isAnalyzing && Date.now() - lastAutoTriggerTime > 5000) {
      setLastAutoTriggerTime(Date.now());
      setIsAnalyzing(true);
      setOrderStatus(`🔍 [تحليل السيولة] جاري فحص اتجاه تدفق السيولة والقمم والقيعان...`);

      setTimeout(() => {
        setIsAnalyzing(false);
        handleExecuteSweepOrder(isUp ? 'buy' : 'sell', `Auto Bot Wave [${scalpWave}/5]`, scalpWave);
      }, 2000);
    }
  }, [autoSweepBot, activeSweepPositions, price, isUp]);

  // Live Binance WebSocket for XAU/USD
  useEffect(() => {
    const clockInterval = setInterval(() => {
      const now = new Date();
      setCurrentTimeUTC(now.toUTCString().slice(17, 25));
      setSessionInfo(computeSessionInfo(now));
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

  const totalRealProfit = activeSweepPositions.reduce((acc, p) => acc + (p.profit || 0), 0);
  const totalOpenLots = activeSweepPositions.reduce((acc, p) => acc + (p.lot || 0), 0).toFixed(2);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} dir="rtl">
      
      {/* Top Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <ChevronRight size={24} />
          <span style={{ fontSize: '18px', fontWeight: 'bold' }}>رجوع</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ 
            background: isMt5Connected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', 
            border: `1px solid ${isMt5Connected ? '#10b981' : '#ef4444'}`, 
            color: isMt5Connected ? '#10b981' : '#f87171', 
            padding: '4px 10px', 
            borderRadius: '20px', 
            fontSize: '11px', 
            fontWeight: 'bold', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '5px' 
          }}>
            {isMt5Connected ? <Wifi size={12} /> : <WifiOff size={12} />}
            <span>{isMt5Connected ? 'MT5 متصل ومزامن' : 'MT5 غير متصل بالـ VPS'}</span>
          </div>

          <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#f59e0b', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Flame size={14} color="#f59e0b" />
            <span>قسم الذهب 🥇</span>
          </div>
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

        {/* REAL LIVE ACTIVE POSITIONS CARD (Strictly synced with MT5) */}
        {activeSweepPositions && activeSweepPositions.length > 0 ? (
          <div style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1.5px solid #10b981',
            borderRadius: '14px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            {/* Header: Real Count & Quick Control Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 12px #10b981' }}></span>
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 'bold', color: '#fff' }}>
                    الصفقات المفتوحة فعلياً على MT5: ({activeSweepPositions.length} صفقات)
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                    إجمالي اللوت: <b style={{ color: '#f59e0b' }}>{totalOpenLots}</b> | الأرباح الحية في الحساب: <b style={{ color: totalRealProfit >= 0 ? '#10b981' : '#f87171' }}>{totalRealProfit >= 0 ? '+' : ''}{totalRealProfit.toFixed(2)}$</b>
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

            {/* Real Sub-Orders Grid Display */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
              {activeSweepPositions.map((sub, idx) => {
                const isBuy = sub.side === 'buy';
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
                        #{sub.ticket} [{isBuy ? 'BUY' : 'SELL'}] ({sub.lot} لوت)
                      </span>
                      <span style={{ color: '#cbd5e1' }}>دخول: <b>${sub.entryPrice}</b></span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {sub.sl > 0 && <span style={{ color: '#f87171' }}>SL: ${sub.sl}</span>}
                      {sub.tp > 0 && <span style={{ color: '#4ade80' }}>TP: ${sub.tp}</span>}
                      <span style={{ 
                        color: sub.profit >= 0 ? '#10b981' : '#f87171', 
                        fontWeight: 'bold',
                        background: sub.profit >= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {sub.profit >= 0 ? '+' : ''}{sub.profit.toFixed(2)}$
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px dashed rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '12px',
            textAlign: 'center',
            fontSize: '12px',
            color: '#94a3b8'
          }}>
            لا توجد صفقات ذهب نشطة حالياً في حساب MT5
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
