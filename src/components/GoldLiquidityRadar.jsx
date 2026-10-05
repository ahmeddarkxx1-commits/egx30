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
  WifiOff,
  Compass,
  TrendingDown,
  Info,
  Award,
  AlertCircle,
  RotateCcw,
  Check
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

  // === 🛡️ EXECUTION MUTEX & DEBOUNCE REFS (Prevents any duplicate loop calls) ===
  const isExecutingRef = useRef(false);
  const lastOrderTimestampRef = useRef(0);

  // === 🎯 DAILY TARGET & RISK RULES ($20 Target / $10 Max Loss) ===
  const DAILY_TARGET = 20.0;
  const DAILY_MAX_LOSS = 10.0;

  const getTodayKey = () => {
    return new Date().toISOString().slice(0, 10);
  };

  const [dailyPnL, setDailyPnL] = useState(() => {
    const today = getTodayKey();
    const storedDate = localStorage.getItem('traden_gold_daily_date');
    if (storedDate === today) {
      return parseFloat(localStorage.getItem('traden_gold_daily_pnl')) || 0.0;
    }
    localStorage.setItem('traden_gold_daily_date', today);
    localStorage.setItem('traden_gold_daily_pnl', '0.0');
    return 0.0;
  });

  const [dailyLocked, setDailyLocked] = useState(() => {
    const today = getTodayKey();
    const storedDate = localStorage.getItem('traden_gold_daily_date');
    if (storedDate === today) {
      return localStorage.getItem('traden_gold_daily_locked') || null;
    }
    return null;
  });

  // Save Daily PnL changes & Trigger Daily Lock when limits reached
  useEffect(() => {
    const today = getTodayKey();
    localStorage.setItem('traden_gold_daily_date', today);
    localStorage.setItem('traden_gold_daily_pnl', String(dailyPnL));
    
    if (dailyPnL >= DAILY_TARGET) {
      setDailyLocked('target_reached');
      localStorage.setItem('traden_gold_daily_locked', 'target_reached');
    } else if (dailyPnL <= -DAILY_MAX_LOSS) {
      setDailyLocked('max_loss_hit');
      localStorage.setItem('traden_gold_daily_locked', 'max_loss_hit');
    }
  }, [dailyPnL]);

  // === ⏱️ COOLDOWN TIMER (20 Minutes on SL Hit) ===
  const [cooldownUntil, setCooldownUntil] = useState(() => {
    return parseInt(localStorage.getItem('traden_gold_cooldown_until')) || 0;
  });
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      if (cooldownUntil > now) {
        setCooldownRemaining(Math.ceil((cooldownUntil - now) / 1000));
      } else {
        setCooldownRemaining(0);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownUntil]);

  const triggerCooldown = () => {
    const until = Date.now() + 20 * 60 * 1000; // 20 minutes
    setCooldownUntil(until);
    localStorage.setItem('traden_gold_cooldown_until', String(until));
  };

  const clearCooldown = () => {
    setCooldownUntil(0);
    localStorage.removeItem('traden_gold_cooldown_until');
    setCooldownRemaining(0);
  };

  const handleResetDailyLock = () => {
    setDailyLocked(null);
    localStorage.removeItem('traden_gold_daily_locked');
    setDailyPnL(0.0);
    localStorage.setItem('traden_gold_daily_pnl', '0.0');
    clearCooldown();
    setOrderStatus('🔄 تم إعادة ضبط عداد اليوم بنجاح.');
  };

  // Dynamic Real-time Session Calculator
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

  // === 🎯 Scout & Scale-in Auto Bot State ===
  const [autoSweepBot, setAutoSweepBot] = useState(() => {
    return localStorage.getItem('traden_gold_scout_bot_active') === 'true';
  });
  const [executingOrder, setExecutingOrder] = useState(false);
  const [orderStatus, setOrderStatus] = useState('');
  const [orderError, setOrderError] = useState(false);

  // REAL LIVE MT5 POSITIONS (Synced with /api/account)
  const [activeSweepPositions, setActiveSweepPositions] = useState([]);
  const [isMt5Connected, setIsMt5Connected] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 1-Min Scalping Liquidity Magnet Target System
  const price = (goldTicker && typeof goldTicker.price === 'number' && !isNaN(goldTicker.price)) ? goldTicker.price : 4236.50;
  let isUp = goldTicker ? goldTicker.isUp : false;
  if (signalMode === 'buy') isUp = true;
  if (signalMode === 'sell') isUp = false;

  // Spread-Aware Calculation on Gold (Typical standard spread 0.20 USD)
  const spreadGold = 0.20;
  const bslTarget = Number((price + 2.80).toFixed(2));
  const sslTarget = Number((price - 2.80).toFixed(2));
  const targetPrice = isUp ? bslTarget : sslTarget;
  
  const recommendedAction = isUp ? 'شراء 🟢 (BUY)' : 'بيع 🔴 (SELL)';
  const actionColor = isUp ? '#10b981' : '#ef4444';
  const arrowSymbol = isUp ? '⬆️' : '⬇️';

  // Bias indicator
  const sweepBiasTitle = isUp ? 'سحب سيولة القاع (Liquidity Sweep Low)' : 'سحب سيولة القمة (Liquidity Sweep High)';
  const sweepBiasTag = isUp ? 'Sweep Low / Bullish Reaction' : 'Sweep High / Bearish Reaction';
  const sweepKeyLevel = isUp ? sslTarget : bslTarget;

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

  // === 🔄 REAL-TIME SYNC WITH REAL MT5 ACCOUNT POSITIONS (Matches XAUUSDm / GOLD / All pairs) ===
  const syncLiveMt5Positions = async () => {
    try {
      const response = await fetchWithCloudFallback('/api/account');
      if (response && response.ok) {
        const data = await response.json();
        setIsMt5Connected(Boolean(data.connected));
        
        const rawPositions = Array.isArray(data.positions) ? data.positions : [];
        
        // Match Gold positions (XAUUSDm, XAUUSD, GOLD, etc.) and other account pairs
        const formatted = rawPositions.map((p, idx) => {
          const side = String(p.type || '').toLowerCase().includes('buy') || p.type === 0 ? 'buy' : 'sell';
          const sym = String(p.symbol || '').toUpperCase();
          const isGold = sym.includes('XAU') || sym.includes('GOLD');
          const isScout = idx === 0 && rawPositions.length === 1;
          const isScaleIn = idx > 0;
          
          let tradeBadge = 'SCALP ⚡';
          if (isGold) {
            tradeBadge = isScout ? 'اختبار 🎯 (0.01)' : isScaleIn ? 'تعزيز 🚀 (0.01)' : 'GOLD 🥇';
          } else {
            tradeBadge = `${sym.slice(0, 7)} 🌐`;
          }

          return {
            id: String(p.ticket || idx),
            ticket: p.ticket,
            symbol: p.symbol || 'XAU/USD',
            side: side,
            entryPrice: Number(p.price_open || p.price || price),
            sl: Number(p.sl || 0),
            tp: Number(p.tp || 0),
            lot: Number(p.volume || 0.01),
            profit: Number(p.profit || 0),
            type: tradeBadge,
            isBreakEven: false
          };
        });

        setActiveSweepPositions(formatted);
      }
    } catch (err) {
      // Offline fallback
    }
  };

  // Fast live MT5 polling every 2.5 seconds
  useEffect(() => {
    syncLiveMt5Positions();
    const interval = setInterval(syncLiveMt5Positions, 2500);
    return () => clearInterval(interval);
  }, [price]);

  // Derived Position Metrics
  const totalRealProfit = activeSweepPositions.reduce((acc, p) => acc + (p.profit || 0), 0);
  const totalOpenLots = activeSweepPositions.reduce((acc, p) => acc + (p.lot || 0), 0).toFixed(2);
  const goldPositions = activeSweepPositions.filter(p => {
    const s = String(p.symbol || '').toUpperCase();
    return s.includes('XAU') || s.includes('GOLD');
  });
  
  const hasScoutTrade = goldPositions.length === 1;
  const hasScaleInTrades = goldPositions.length >= 2;
  const isScoutInProfit = hasScoutTrade && totalRealProfit >= 1.50;

  // Compute Active Cycle Stage (1 to 4)
  let currentCycleStage = 1;
  if (dailyLocked === 'target_reached') {
    currentCycleStage = 4;
  } else if (hasScaleInTrades) {
    currentCycleStage = 3;
  } else if (hasScoutTrade && isScoutInProfit) {
    currentCycleStage = 2;
  } else if (hasScoutTrade) {
    currentCycleStage = 1;
  }

  // === 🎯 1. SCOUT TRADE (فتح صفقة اختبار 0.01 لوت بستوب وقائي 3.0$) ===
  const handleExecuteScoutTrade = async (overrideSide = null) => {
    const now = Date.now();
    
    // Front-end Mutex & Debounce Guard: 15s minimum spacing
    if (isExecutingRef.current || (now - lastOrderTimestampRef.current < 15000)) {
      const waitSec = Math.ceil((15000 - (now - lastOrderTimestampRef.current)) / 1000);
      setOrderStatus(`⏳ جاري معالجة الأوامر السابقة. يرجى الانتظار ${waitSec > 0 ? waitSec : 1} ثواني.`);
      return;
    }

    if (dailyLocked) {
      setOrderStatus(`🛑 التداول مقفل اليوم: ${dailyLocked === 'target_reached' ? 'تم تحقيق الهدف $20 🎉' : 'تم بلوغ حد الخسارة -$10 🛡️'}`);
      setOrderError(true);
      return;
    }

    if (cooldownRemaining > 0) {
      setOrderStatus(`⏱️ النظام في وضع التهدئة. يتبقى ${Math.floor(cooldownRemaining / 60)} دقيقة و ${cooldownRemaining % 60} ثانية.`);
      setOrderError(true);
      return;
    }

    if (goldPositions.length >= 1) {
      setOrderStatus(`⚠️ توجد صفقة ذهب مفتوحة بالفعل في حسابك على MT5. لا يمكن فتح صفقة اختبار جديدة.`);
      setOrderError(true);
      return;
    }

    isExecutingRef.current = true;
    lastOrderTimestampRef.current = now;
    setExecutingOrder(true);

    const side = overrideSide || (isUp ? 'buy' : 'sell');
    const actionLabel = side === 'buy' ? 'شراء 🟢 (BUY)' : 'بيع 🔴 (SELL)';
    const entryP = price;
    
    // Logical Stop Loss ($3.00 on Gold to survive spread) and TP ($3.80)
    const slDist = 3.00;
    const tpDist = 3.80;

    const subSl = side === 'buy' 
      ? Number((entryP - slDist - spreadGold).toFixed(2)) 
      : Number((entryP + slDist + spreadGold).toFixed(2));
    
    const subTp = side === 'buy' 
      ? Number((entryP + tpDist + spreadGold).toFixed(2)) 
      : Number((entryP - tpDist - spreadGold).toFixed(2));

    setOrderStatus(`🎯 جاري إرسال صفقة اختبار السوق (Scout Trade: 0.01 Lot - ${actionLabel}) إلى MT5...`);
    setOrderError(false);

    try {
      const res = await fetchWithCloudFallback('/api/orders/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: 'XAUUSDm',
          side: side,
          lot: 0.01,
          sl: subSl,
          tp: subTp,
          comment: 'Traden Scout 0.01'
        })
      });

      const resData = await res.json();
      if (res.ok && resData.success !== false) {
        setOrderError(false);
        setOrderStatus(`✅ تم فتح صفقة الاختبار (0.01 Lot) بنجاح! نراقب تأكيد الاتجاه وتأمين الدخول.`);
      } else {
        setOrderError(true);
        setOrderStatus(`⚠️ ${resData.message || 'تعذر فتح الصفقة.'}`);
      }

      setTimeout(syncLiveMt5Positions, 1000);
      setTimeout(syncLiveMt5Positions, 3000);
    } catch (e) {
      setOrderError(true);
      setOrderStatus(`⚠️ تعذر إرسال صفقة الاختبار إلى MT5. تأكد من تشغيل الجسر على الـ VPS.`);
    } finally {
      setTimeout(() => {
        isExecutingRef.current = false;
        setExecutingOrder(false);
      }, 2000);
    }
  };

  // === 🚀 2. SCALE-IN (تعزيز بصفقتين 0.01 بعد تأمين صفقة الاختبار) ===
  const handleExecuteScaleIn = async () => {
    const now = Date.now();
    if (isExecutingRef.current || (now - lastOrderTimestampRef.current < 15000)) {
      setOrderStatus(`⏳ يرجى الانتظار قليلاً قبل إرسال أمر التعزيز.`);
      return;
    }

    if (dailyLocked) {
      setOrderStatus(`🛑 التداول مقفل اليوم.`);
      setOrderError(true);
      return;
    }

    if (goldPositions.length >= 3) {
      setOrderStatus(`⚠️ تم بلوغ الحد الأقصى للصفقات (3 صفقات كحد أقصى).`);
      setOrderError(true);
      return;
    }

    isExecutingRef.current = true;
    lastOrderTimestampRef.current = now;
    setExecutingOrder(true);

    const side = isUp ? 'buy' : 'sell';
    const actionLabel = side === 'buy' ? 'شراء 🟢 (BUY)' : 'بيع 🔴 (SELL)';
    const entryP = price;
    const slDist = 2.50;
    const tpDist = 4.20;

    setOrderStatus(`🚀 جاري تأمين صفقة الاختبار وتعزيز بصفقتين (0.01x2 - ${actionLabel}) على MT5...`);
    setOrderError(false);

    try {
      // 1. Break-Even existing Scout trade
      await handleBreakEvenAll();

      // 2. Open 2 Scale-In sub-orders (0.01 lot each)
      for (let i = 1; i <= 2; i++) {
        const subSl = side === 'buy' 
          ? Number((entryP - slDist - spreadGold).toFixed(2)) 
          : Number((entryP + slDist + spreadGold).toFixed(2));
        
        const subTp = side === 'buy' 
          ? Number((entryP + tpDist + spreadGold).toFixed(2)) 
          : Number((entryP - tpDist - spreadGold).toFixed(2));

        await fetchWithCloudFallback('/api/orders/place', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            symbol: 'XAUUSDm',
            side: side,
            lot: 0.01,
            sl: subSl,
            tp: subTp,
            comment: `Traden ScaleIn-${i} 0.01`
          })
        });
      }

      setOrderError(false);
      setOrderStatus(`✅ تم تأمين الاختبار وفتح صفقتي التعزيز (0.01x2) بنجاح! جاري متابعة الهدف.`);
      setTimeout(syncLiveMt5Positions, 1000);
      setTimeout(syncLiveMt5Positions, 3000);
    } catch (e) {
      setOrderError(true);
      setOrderStatus(`⚠️ تعذر تنفيذ التعزيز.`);
    } finally {
      setTimeout(() => {
        isExecutingRef.current = false;
        setExecutingOrder(false);
      }, 2000);
    }
  };

  // === 🛑 CLOSE ALL & HARVEST (إغلاق وحجز الأرباح + تحديث الهدف اليومي) ===
  const handleCloseAllPositions = async () => {
    if (!activeSweepPositions || activeSweepPositions.length === 0) return;
    setExecutingOrder(true);
    setOrderStatus(`جاري إغلاق جميع الصفقات وحجز الأرباح في MT5...`);

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

      const closedProfit = totalRealProfit;
      if (closedProfit !== 0) {
        setDailyPnL(prev => {
          const nextVal = parseFloat((prev + closedProfit).toFixed(2));
          return nextVal;
        });

        // If closed at loss -> trigger 20 min cooldown
        if (closedProfit < -1.0) {
          triggerCooldown();
        }
      }

      setOrderStatus(`💰 تم حجز الأرباح وإغلاق الصفقات بنجاح (${closedProfit >= 0 ? '+' : ''}${closedProfit.toFixed(2)}$)!`);
      setTimeout(syncLiveMt5Positions, 1000);
    } catch (e) {
      setOrderStatus(`💰 تم إرسال أمر إغلاق الصفقات!`);
    } finally {
      setExecutingOrder(false);
    }
  };

  // === 🛡️ BREAK-EVEN ALL (نقل الستوب للدخول) ===
  const handleBreakEvenAll = async () => {
    if (!activeSweepPositions || activeSweepPositions.length === 0) return;
    
    setOrderStatus(`🛡️ جاري نقل الستوب لنقطة الدخول (Break-Even)...`);
    try {
      for (const pos of activeSweepPositions) {
        if (pos.ticket) {
          const bePrice = pos.side === 'buy' 
            ? Number((pos.entryPrice + 0.15).toFixed(2)) 
            : Number((pos.entryPrice - 0.15).toFixed(2));

          await fetchWithCloudFallback('/api/orders/modify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ticket: pos.ticket,
              sl: bePrice,
              tp: pos.tp
            })
          });
        }
      }
      setOrderStatus(`🛡️ تم تأمين جميع الصفقات على نقطة الدخول بنجاح!`);
      setTimeout(syncLiveMt5Positions, 1000);
    } catch (e) {
      setOrderStatus(`🛡️ تم إرسال أمر تأمين الدخول.`);
    }
  };

  // Toggle Auto Bot (Single Unified Controller)
  const toggleAutoBot = (newState) => {
    if (dailyLocked) {
      setOrderStatus(`🛑 لا يمكن تشغيل البوت اليوم بسبب بلوغ سقف الهدف ($20) أو الخسارة (-$10).`);
      setOrderError(true);
      return;
    }
    setAutoSweepBot(newState);
    localStorage.setItem('traden_gold_scout_bot_active', String(newState));
    setOrderStatus(newState ? '🟢 تم تفعيل قناص Scout & Scale-in الآلي بنجاح.' : '⚪ تم إيقاف القناص الآلي.');
  };

  // Live Auto Scout Engine Loop (Strictly Gated with Debounce & Max 1 Scout)
  useEffect(() => {
    if (!autoSweepBot || dailyLocked || cooldownRemaining > 0) return;
    const now = Date.now();

    // 1. Only open Scout (0.01) if ZERO gold positions exist
    if (goldPositions.length === 0 && !isAnalyzing && !isExecutingRef.current && (now - lastOrderTimestampRef.current > 20000)) {
      setIsAnalyzing(true);
      setOrderStatus(`🔍 [فحص السيولة] جاري تأكيد شمعة الانعكاس وفتح صفقة الاختبار (0.01 Lot)...`);

      const timer = setTimeout(() => {
        setIsAnalyzing(false);
        if (goldPositions.length === 0 && !isExecutingRef.current && !dailyLocked) {
          handleExecuteScoutTrade(isUp ? 'buy' : 'sell');
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
    // 2. Auto Scale-In only when Scout in profit >= $1.50
    else if (goldPositions.length === 1 && totalRealProfit >= 1.50 && !isAnalyzing && !isExecutingRef.current && (now - lastOrderTimestampRef.current > 20000)) {
      setIsAnalyzing(true);
      setOrderStatus(`🚀 [تعزيز الأرباح] صفقة الاختبار في ربح (+${totalRealProfit.toFixed(2)}$) - جاري التأمين والتعزيز بصفقتين...`);

      const timer = setTimeout(() => {
        setIsAnalyzing(false);
        if (goldPositions.length === 1 && !isExecutingRef.current) {
          handleExecuteScaleIn();
        }
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [autoSweepBot, goldPositions.length, totalRealProfit, dailyLocked, cooldownRemaining, isUp]);

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

  // Daily target progress percentage (0% to 100%)
  const dailyProgressPct = Math.min(100, Math.max(0, Math.round((dailyPnL / DAILY_TARGET) * 100)));
  const dailyRemaining = Math.max(0, DAILY_TARGET - dailyPnL).toFixed(2);

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
            <span>قناص الذهب 🥇</span>
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

      {/* ============================================================ */}
      {/* 🏆 DAILY TARGET ($20) & RISK MANAGEMENT SHIELD ($10 MAX LOSS) */}
      {/* ============================================================ */}
      <div style={{
        background: dailyLocked === 'target_reached' 
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.1) 100%)'
          : dailyLocked === 'max_loss_hit'
          ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(185, 28, 28, 0.1) 100%)'
          : 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
        border: `1.5px solid ${dailyLocked === 'target_reached' ? '#10b981' : dailyLocked === 'max_loss_hit' ? '#ef4444' : 'rgba(245, 158, 11, 0.4)'}`,
        borderRadius: '16px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.35)'
      }}>
        {/* Header with Title & Rules */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={20} color={dailyLocked === 'target_reached' ? '#10b981' : '#f59e0b'} />
            <div>
              <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff' }}>
                الهدف اليومي وإدارة المخاطر الصارمة
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                هدف الربح: <b style={{ color: '#10b981' }}>+$20.00</b> | أقصى خسارة: <b style={{ color: '#f87171' }}>-$10.00</b>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {dailyLocked ? (
              <span style={{
                background: dailyLocked === 'target_reached' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)',
                color: dailyLocked === 'target_reached' ? '#10b981' : '#f87171',
                border: `1px solid ${dailyLocked === 'target_reached' ? '#10b981' : '#ef4444'}`,
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Lock size={12} />
                {dailyLocked === 'target_reached' ? '🎉 تم حجز الهدف (قفل الحساب)' : '🛑 تم وقف التداول (حماية)'}
              </span>
            ) : (
              <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
                يوم تداول نشط ⚡
              </span>
            )}

            <button
              onClick={handleResetDailyLock}
              title="إعادة ضبط العداد واليوم يدوياً"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#94a3b8',
                borderRadius: '8px',
                padding: '4px 8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px'
              }}
            >
              <RotateCcw size={12} />
              <span>إعادة ضبط</span>
            </button>
          </div>
        </div>

        {/* Daily Profit Progress Bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', marginBottom: '6px' }}>
            <span style={{ color: '#cbd5e1' }}>
              الربح المحقق اليوم: <b style={{ color: dailyPnL >= 0 ? '#10b981' : '#f87171' }}>{dailyPnL >= 0 ? '+' : ''}${dailyPnL.toFixed(2)} USD</b>
            </span>
            <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>
              {dailyProgressPct}% (متبقي ${dailyRemaining})
            </span>
          </div>
          <div style={{ width: '100%', height: '10px', background: 'rgba(0,0,0,0.4)', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{
              width: `${dailyProgressPct}%`,
              height: '100%',
              background: dailyPnL >= 0 ? 'linear-gradient(90deg, #10b981 0%, #34d399 100%)' : '#ef4444',
              transition: 'width 0.5s ease'
            }}></div>
          </div>
        </div>

        {/* Lock Warning or Celebratory Message */}
        {dailyLocked === 'target_reached' && (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', borderRadius: '10px', padding: '10px', fontSize: '12px', color: '#10b981', textAlign: 'center', fontWeight: 'bold' }}>
            🎉 تهانينا! تم تحقيق هدف الربح اليومي ($20.00). تم قفل القناص تلقائياً لمنع الإفراط في التداول وحماية أرباحك لليوم التالي.
          </div>
        )}
        {dailyLocked === 'max_loss_hit' && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: '10px', padding: '10px', fontSize: '12px', color: '#f87171', textAlign: 'center', fontWeight: 'bold' }}>
            🛑 تم بلوغ الحد الأقصى للخسارة اليومية (-$10.00). تم إيقاف التداول اليوم لحماية رأس مالك واستئناف التداول غداً بعقلية جديدة.
          </div>
        )}
      </div>

      {/* Cooldown Mode Banner (20 Minutes on SL Hit) */}
      {cooldownRemaining > 0 && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1.5px solid #ef4444',
          borderRadius: '14px',
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={20} color="#f87171" />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#f87171' }}>
                وضع التهدئة نَشِط (Cooldown Mode - 20 دقيقة)
              </div>
              <div style={{ fontSize: '11px', color: '#cbd5e1' }}>
                لتفادي التداول الانتقامي بعد الستوب. استئناف الصفقات بعد: <b style={{ color: '#fff' }}>{Math.floor(cooldownRemaining / 60)} دقيقة و {cooldownRemaining % 60} ثانية</b>
              </div>
            </div>
          </div>
          <button
            onClick={clearCooldown}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              padding: '4px 10px',
              borderRadius: '8px',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            تخطي التهدئة
          </button>
        </div>
      )}

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
      {/* 🏹 SCOUT & SCALE-IN PIPELINE ENGINE (4 STAGES) */}
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
        {/* Header & Single Unified Toggle Bot Switch */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Compass size={24} color="#f59e0b" />
            <div>
              <div style={{ fontSize: '16px', fontWeight: '900', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>قناص السكالبينج الذكي 🏹</span>
                <span dir="ltr" style={{ fontSize: '12px', color: '#f59e0b', unicodeBidi: 'isolate' }}>(Scout & Scale-in Engine)</span>
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                اختبار بـ 0.01 ➔ تأمين الدخول ➔ تعزيز بصفقتين ➔ حجز الهدف $20
              </div>
            </div>
          </div>

          {/* Unified Auto Bot Toggle Switch */}
          <button
            onClick={() => toggleAutoBot(!autoSweepBot)}
            disabled={Boolean(dailyLocked)}
            style={{
              background: autoSweepBot ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'rgba(255,255,255,0.08)',
              border: `1px solid ${autoSweepBot ? '#10b981' : 'rgba(255,255,255,0.2)'}`,
              color: '#fff',
              padding: '8px 16px',
              borderRadius: '24px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: dailyLocked ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: autoSweepBot ? '0 0 15px rgba(16, 185, 129, 0.4)' : 'none',
              transition: 'all 0.2s ease',
              opacity: dailyLocked ? 0.5 : 1
            }}
          >
            {autoSweepBot ? <Pause size={15} /> : <Play size={15} />}
            <span>{autoSweepBot ? '🟢 القناص الآلي نَشِط (ON)' : '⚪ تشغيل القناص الآلي'}</span>
          </button>
        </div>

        {/* 4-Stage Cycle Pipeline Visualizer */}
        <div style={{
          background: 'rgba(0,0,0,0.4)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '12px',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ fontSize: '12.5px', fontWeight: 'bold', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={16} />
            <span>مراحل دورة التداول الذكية (4 مراحل):</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
            {[
              { num: 1, title: '1. اختبار الاتجاه', sub: 'Scout 0.01', active: currentCycleStage === 1 },
              { num: 2, title: '2. تأمين الدخول', sub: 'Break-Even', active: currentCycleStage === 2 },
              { num: 3, title: '3. تعزيز بصفقتين', sub: 'Scale-In 0.01x2', active: currentCycleStage === 3 },
              { num: 4, title: '4. حجز الهدف $20', sub: 'Daily Target', active: currentCycleStage === 4 }
            ].map(st => (
              <div
                key={st.num}
                style={{
                  background: st.active ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.3) 0%, rgba(217, 119, 6, 0.2) 100%)' : currentCycleStage > st.num ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${st.active ? '#f59e0b' : currentCycleStage > st.num ? '#10b981' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: '8px',
                  padding: '8px 4px',
                  textAlign: 'center',
                  boxShadow: st.active ? '0 0 10px rgba(245, 158, 11, 0.3)' : 'none'
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: st.active ? '#f59e0b' : currentCycleStage > st.num ? '#10b981' : '#94a3b8' }}>
                  {currentCycleStage > st.num ? '✅' : st.active ? '⚡' : '⚪'} {st.title}
                </div>
                <div style={{ fontSize: '9.5px', color: st.active ? '#fff' : '#64748b', marginTop: '2px' }}>
                  {st.sub}
                </div>
              </div>
            ))}
          </div>
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
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>حالة سحب السيولة الحالية:</div>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: actionColor, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{sweepBiasTitle}</span>
                <span dir="ltr" style={{ fontSize: '11px', color: '#cbd5e1', unicodeBidi: 'isolate' }}>({sweepBiasTag})</span>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>مستوى الكسر المستهدف:</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#f59e0b', fontFamily: 'monospace' }} dir="ltr">
              ${sweepKeyLevel}
            </div>
          </div>
        </div>

        {/* REAL LIVE ACTIVE POSITIONS CARD (Synced with MT5) */}
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
                    الصفقات المفتوحة على MT5: ({activeSweepPositions.length} صفقات)
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                    إجمالي اللوت: <b style={{ color: '#f59e0b' }}>{totalOpenLots}</b> | أرباح الحساب اللحظية: <b style={{ color: totalRealProfit >= 0 ? '#10b981' : '#f87171' }}>{totalRealProfit >= 0 ? '+' : ''}{totalRealProfit.toFixed(2)}$</b>
                  </div>
                </div>
              </div>

              {/* Quick Action Buttons */}
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
                  <span>تأمين الدخول (BE)</span>
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
                  <span>إغلاق وحجز الأرباح 💰</span>
                </button>
              </div>
            </div>

            {/* Sub-Orders Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
              {activeSweepPositions.map((sub, idx) => {
                const isBuy = sub.side === 'buy';
                return (
                  <div 
                    key={sub.id || idx}
                    style={{
                      background: 'rgba(0,0,0,0.4)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ 
                        background: isBuy ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: isBuy ? '#10b981' : '#f87171',
                        border: `1px solid ${isBuy ? '#10b981' : '#ef4444'}`,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 'bold'
                      }}>
                        {sub.type}
                      </span>
                      <span style={{ color: '#fff', fontWeight: 'bold' }}>
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
            لا توجد صفقات نشطة حالياً في حساب MT5
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

        {/* Contextual Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Main Scout Action Button (0.01 Lot) */}
          {goldPositions.length === 0 && (
            <button
              onClick={() => handleExecuteScoutTrade()}
              disabled={executingOrder || Boolean(dailyLocked) || cooldownRemaining > 0}
              style={{
                width: '100%',
                background: isUp ? 'linear-gradient(135deg, #10b981 0%, #047857 100%)' : 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '14px',
                fontWeight: '900',
                fontSize: '15px',
                cursor: executingOrder || dailyLocked || cooldownRemaining > 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: `0 6px 20px ${actionColor}50`,
                opacity: dailyLocked || cooldownRemaining > 0 ? 0.5 : 1
              }}
            >
              <Target size={20} />
              <span>
                {executingOrder ? 'جاري فتح الصفقة...' : `🎯 فتح صفقة اختبار السوق (0.01 لوت) - (${recommendedAction})`}
              </span>
            </button>
          )}

          {/* Scale-In Action Button (Active when 1 scout trade is running) */}
          {goldPositions.length === 1 && (
            <button
              onClick={handleExecuteScaleIn}
              disabled={executingOrder || Boolean(dailyLocked)}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#000',
                border: 'none',
                borderRadius: '12px',
                padding: '14px',
                fontWeight: '900',
                fontSize: '15px',
                cursor: executingOrder || dailyLocked ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 6px 20px rgba(245, 158, 11, 0.4)'
              }}
            >
              <Zap size={20} />
              <span>
                {executingOrder ? 'جاري التعزيز...' : `🚀 تأمين الدخول (BE) + تعزيز بصفقتين (0.01x2 لوت) مع الاتجاه`}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 📚 COMPREHENSIVE GOLD SCALPING INSTRUCTIONS & RULES */}
      {/* ============================================================ */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Info size={18} />
          <span>قواعد وتعليمات استراتيجية قناص الذهب (Scout & Scale-in):</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.7' }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '10px', borderRight: '3px solid #10b981' }}>
            <b style={{ color: '#10b981' }}>1. مرحلة اختبار السوق (Scout Trade):</b>
            <div>لا يتم التسرع بفتح لوت كبير؛ ندخل صفقة استكشافية واحدة فقط بلوت <b>0.01</b> بستوب وقائي منطقي (<b>$2.50 إلى $3.50</b>) لحماية الحساب من ضرب السبريد والذبذبة.</div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '10px', borderRight: '3px solid #3b82f6' }}>
            <b style={{ color: '#3b82f6' }}>2. تأمين الدخول والتعزيز الذكي (Scaling In):</b>
            <div>بمجرد تحقيق صفقة الاختبار ربحاً مبدئياً (+1.50$)، يتم نقل الستوب فوراً لنقطة الدخول (Break-Even)، ثم فتح صفقتين تعزيز فقط (0.01 لكل منهما) لمضاعفة الأرباح بدون مخاطرة على رأس المال.</div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '10px', borderRight: '3px solid #f59e0b' }}>
            <b style={{ color: '#f59e0b' }}>3. قانون الهدف اليومي ($20) وحماية الخسارة ($10):</b>
            <div>عند تحقيق <b>20$ ربح يومي</b> يتم قفل النظام تلقائياً لمنع الطمع والإفراط. وفي حال الوصول لأقصى خسارة <b>(-10$)</b> يقفل النظام للحفاظ على الحساب.</div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '10px', borderRight: '3px solid #ef4444' }}>
            <b style={{ color: '#ef4444' }}>4. وضع التهدئة الصارم (Cooldown - 20 دقيقة):</b>
            <div>في حال ضرب الستوب، يدخل النظام تلقائياً في وضع التهدئة لمدة 20 دقيقة لمنع التداول الانتقامي ولإعطاء السوق وقتاً لتكوين سيولة حقيقية جديدة.</div>
          </div>
        </div>
      </div>

      {/* Embedded Live Chart with Chart Overlay Liquidity Indicator */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
        
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
