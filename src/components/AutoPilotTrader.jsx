import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Power, CheckCircle2, Shield, Target, Plus, Trash2, 
  TrendingUp, Activity, AlertTriangle, ArrowUpRight, ArrowDownRight, 
  Clock, RefreshCw, Sliders, DollarSign, Zap, ChevronRight, X, Globe, Sparkles, Lock
} from 'lucide-react';
import { fetchLiveAssetTicker } from '../utils/priceFetcher';
import { AssetLogo } from '../utils/assetLogos';

export default function AutoPilotTrader({ onBack }) {
  // Master ON/OFF Switch
  const [isAutoPilotActive, setIsAutoPilotActive] = useState(() => {
    return localStorage.getItem('traden_autopilot_active') === 'true';
  });

  // Target Selected Pairs
  const [selectedPairs, setSelectedPairs] = useState(() => {
    const saved = localStorage.getItem('traden_autopilot_pairs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { symbol: 'XAU/USD', name: 'الذهب مقابل الدولار', enabled: true, category: 'Metals' },
      { symbol: 'EUR/USD', name: 'اليورو مقابل الدولار', enabled: true, category: 'Forex' },
      { symbol: 'GBP/USD', name: 'الجنيه الإسترليني', enabled: true, category: 'Forex' },
      { symbol: 'US30', name: 'مؤشر الداو جونز', enabled: true, category: 'Indices' },
      { symbol: 'BTC/USDT', name: 'البيتكوين', enabled: false, category: 'Crypto' }
    ];
  });

  // Daily Trade Budget & Lot Size
  const [selectedLot, setSelectedLot] = useState(() => {
    return parseFloat(localStorage.getItem('traden_autopilot_lot')) || 0.01;
  });

  // Daily Quota ($20 Daily Target & Max 5 Trades with legacy state compatibility)
  const [dailyQuota, setDailyQuota] = useState(() => {
    const today = new Date().toISOString().slice(0, 10);
    const savedData = localStorage.getItem(`traden_autopilot_quota_${today}`);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        return { 
          date: parsed.date || today, 
          executedCount: Number(parsed.executedCount) || 0, 
          maxDaily: Number(parsed.maxDaily) || 5, 
          currentProfit: Number(parsed.currentProfit ?? parsed.totalProfit ?? 0.0), 
          targetDaily: Number(parsed.targetDaily) || 20.0, 
          maxLoss: Number(parsed.maxLoss) || 10.0,
          targetReached: Boolean(parsed.targetReached),
          stopLossLocked: Boolean(parsed.stopLossLocked)
        };
      } catch (e) {}
    }
    return { 
      date: today, 
      executedCount: 0, 
      maxDaily: 5, 
      currentProfit: 0.0, 
      targetDaily: 20.0, 
      maxLoss: 10.0,
      targetReached: false,
      stopLossLocked: false
    };
  });

  // Active Autopilot Trades
  const [activeAutoTrades, setActiveAutoTrades] = useState(() => {
    const saved = localStorage.getItem('traden_autopilot_active_trades');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  // Active Market Session Info with default fallbacks
  const [sessionInfo, setSessionInfo] = useState(() => {
    const nowUtc = new Date();
    const decHour = nowUtc.getUTCHours() + nowUtc.getUTCMinutes() / 60;
    if (decHour >= 12 && decHour < 16) {
      return {
        session_id: 'london_ny_overlap',
        name: 'تداخل لندن ونيويورك 🇬🇧🇺🇸',
        tag: 'Peak Global Liquidity',
        volatility: 'VERY_HIGH',
        optimal_pairs: ['XAU/USD', 'US30', 'EUR/USD', 'GBP/USD'],
        strategy: 'سحب سيولة القمم واختراق الـ FVG المؤسسي',
        rr_target: '1:3.0'
      };
    } else if (decHour >= 16 && decHour < 21) {
      return {
        session_id: 'new_york',
        name: 'جلسة نيويورك 🇺🇸',
        tag: 'New York Power Hour',
        volatility: 'HIGH',
        optimal_pairs: ['XAU/USD', 'US30', 'NAS100', 'EUR/USD'],
        strategy: 'متابعة الزخم الأمريكي وإغلاق الفجوات السعرية',
        rr_target: '1:2.8'
      };
    } else if (decHour >= 7 && decHour < 12) {
      return {
        session_id: 'london',
        name: 'جلسة لندن 🇬🇧',
        tag: 'London Open Breakouts',
        volatility: 'HIGH',
        optimal_pairs: ['GBP/USD', 'EUR/USD', 'XAU/USD'],
        strategy: 'كسر نطاق آسيا وسحب سيولة القمم والقيعان',
        rr_target: '1:3.0'
      };
    } else {
      return {
        session_id: 'tokyo_asia',
        name: 'جلسة طوكيو وآسيا 🇯🇵',
        tag: 'Asian Range & Accumulation',
        volatility: 'MODERATE',
        optimal_pairs: ['USD/JPY', 'AUD/USD', 'BTC/USDT', 'XAU/USD'],
        strategy: 'تجميع السيولة وارتداد حدود النطاق العرضي',
        rr_target: '1:2.2'
      };
    }
  });

  // Custom Pair Input Modal
  const [showAddPairModal, setShowAddPairModal] = useState(false);
  const [newPairInput, setNewPairInput] = useState('');
  const [newPairName, setNewPairName] = useState('');

  // AI Agent Status & Live Thoughts
  const [agentStatus, setAgentStatus] = useState('مسح وتحليل الهيكل الذكي للجلسة 🔍');
  const [agentLogs, setAgentLogs] = useState([
    { time: new Date().toLocaleTimeString('ar-EG'), text: 'تم بدء تشغيل العقل التحليلي لـ Agent Horizon بنجاح.' },
    { time: new Date().toLocaleTimeString('ar-EG'), text: `فحص توافق الجلسة الحالية (${sessionInfo.name}) وتحديد مناطق السيولة المؤسسية.` }
  ]);

  const [livePrices, setLivePrices] = useState({});
  const [executingOrder, setExecutingOrder] = useState(false);
  const [orderStatus, setOrderStatus] = useState('');
  const [serverSynced, setServerSynced] = useState(false);

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

  // Sync state with Server 24/7
  useEffect(() => {
    const fetchServerState = async () => {
      try {
        const res = await fetchWithCloudFallback('/api/autopilot/state');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.state) {
            setServerSynced(true);
            
            if (data.state.session_info) {
              setSessionInfo(data.state.session_info);
            }

            const localActive = localStorage.getItem('traden_autopilot_active');
            if (localActive !== null) {
              const boolActive = localActive === 'true';
              setIsAutoPilotActive(boolActive);
            } else {
              setIsAutoPilotActive(data.state.active);
              localStorage.setItem('traden_autopilot_active', String(data.state.active));
            }

            if (data.state.pairs && Array.isArray(data.state.pairs) && data.state.pairs.length > 0) {
              const localPairs = localStorage.getItem('traden_autopilot_pairs');
              if (!localPairs) {
                setSelectedPairs(data.state.pairs);
                localStorage.setItem('traden_autopilot_pairs', JSON.stringify(data.state.pairs));
              }
            }

            if (data.state.lot) {
              setSelectedLot(data.state.lot);
            }

            setDailyQuota(prev => {
              const today = new Date().toISOString().slice(0, 10);
              const updated = {
                ...prev,
                executedCount: data.state.executed_today ?? prev.executedCount,
                currentProfit: data.state.current_profit_usd ?? prev.currentProfit,
                targetDaily: data.state.daily_target_usd ?? 20.0,
                targetReached: !!data.state.target_reached,
                stopLossLocked: !!data.state.stop_loss_locked
              };
              localStorage.setItem(`traden_autopilot_quota_${today}`, JSON.stringify(updated));
              return updated;
            });
          }
        }
      } catch (e) {
        console.log('Server autopilot sync notice:', e);
      }
    };
    fetchServerState();
    const interval = setInterval(fetchServerState, 10000);
    return () => clearInterval(interval);
  }, []);

  // Poll live price feeds for enabled pairs
  useEffect(() => {
    const updatePrices = async () => {
      const enabled = selectedPairs.filter(p => p.enabled);
      const updates = {};
      for (const p of enabled) {
        try {
          const tick = await fetchLiveAssetTicker(p.symbol);
          if (tick && tick.price) {
            updates[p.symbol] = tick;
          }
        } catch (e) {}
      }
      setLivePrices(prev => ({ ...prev, ...updates }));
    };
    updatePrices();
    const priceInt = setInterval(updatePrices, 5000);
    return () => clearInterval(priceInt);
  }, [selectedPairs]);

  const handleToggleAutoPilot = async (newState) => {
    setIsAutoPilotActive(newState);
    localStorage.setItem('traden_autopilot_active', String(newState));
    try {
      await fetchWithCloudFallback('/api/autopilot/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: newState, lot: selectedLot })
      });
      setOrderStatus(newState ? '🟢 تم تفعيل الأوتوبايلوت الذكي سحابياً 24/7!' : '⏸️ تم إيقاف الأوتوبايلوت.');
    } catch (e) {
      setOrderStatus(newState ? '🟢 تم تفعيل الأوتوبايلوت محلياً.' : '⏸️ تم إيقاف الأوتوبايلوت.');
    }
  };

  const handleUpdatePairsOnServer = async (newPairs, newLot = selectedLot) => {
    setSelectedPairs(newPairs);
    localStorage.setItem('traden_autopilot_pairs', JSON.stringify(newPairs));
    try {
      await fetchWithCloudFallback('/api/autopilot/update_pairs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pairs: newPairs, lot: newLot })
      });
    } catch (e) {}
  };

  const handleSelectLot = (newLot) => {
    setSelectedLot(newLot);
    localStorage.setItem('traden_autopilot_lot', String(newLot));
    handleUpdatePairsOnServer(selectedPairs, newLot);
  };

  const handleResetDailyQuota = async () => {
    try {
      await fetchWithCloudFallback('/api/autopilot/reset_daily', { method: 'POST' });
      const today = new Date().toISOString().slice(0, 10);
      const resetData = {
        date: today,
        executedCount: 0,
        maxDaily: 5,
        currentProfit: 0.0,
        targetDaily: 20.0,
        maxLoss: 10.0,
        targetReached: false,
        stopLossLocked: false
      };
      setDailyQuota(resetData);
      localStorage.setItem(`traden_autopilot_quota_${today}`, JSON.stringify(resetData));
      setOrderStatus('🔄 تم تصفير العداد اليومي وبدء جولة تداول جديدة بنجاح!');
    } catch (e) {
      setOrderStatus('🔄 تم تصفير العداد محلياً.');
    }
  };

  // Close Autopilot Trade Manually
  const handleCloseAutoTrade = async (trade) => {
    setExecutingOrder(true);
    try {
      await fetchWithCloudFallback('/api/control/close_position', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket: trade.ticket })
      });
      setActiveAutoTrades(prev => prev.filter(t => t.id !== trade.id));
      setOrderStatus(`💰 تم إغلاق صفقة ${trade.symbol} وحجز الربح بنجاح.`);
    } catch (e) {
      setActiveAutoTrades(prev => prev.filter(t => t.id !== trade.id));
    } finally {
      setExecutingOrder(false);
    }
  };

  // Toggle Pair Selection
  const handleTogglePair = (sym) => {
    const updated = selectedPairs.map(p => p.symbol === sym ? { ...p, enabled: !p.enabled } : p);
    handleUpdatePairsOnServer(updated);
  };

  // Delete Pair
  const handleDeletePair = (sym) => {
    const updated = selectedPairs.filter(p => p.symbol !== sym);
    handleUpdatePairsOnServer(updated);
  };

  // Add Custom Pair
  const handleAddCustomPair = () => {
    if (!newPairInput.trim()) return;
    const cleanSym = newPairInput.trim().toUpperCase();
    const cleanName = newPairName.trim() || cleanSym;

    if (!selectedPairs.some(p => p.symbol === cleanSym)) {
      const updated = [...selectedPairs, {
        symbol: cleanSym,
        name: cleanName,
        enabled: true,
        category: 'Custom'
      }];
      handleUpdatePairsOnServer(updated);
    }
    setNewPairInput('');
    setNewPairName('');
    setShowAddPairModal(false);
  };

  const currentProfitSafe = Number(dailyQuota?.currentProfit ?? dailyQuota?.totalProfit ?? 0.0);
  const isTargetAchieved = Boolean(dailyQuota?.targetReached || currentProfitSafe >= 20.0);
  const isLossLocked = Boolean(dailyQuota?.stopLossLocked || currentProfitSafe <= -10.0);
  const progressPercent = Math.min(100, Math.max(0, (currentProfitSafe / 20.0) * 100));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', direction: 'rtl', fontFamily: 'Cairo, sans-serif' }}>
      
      {/* Header Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ChevronRight size={22} />
          <span style={{ fontSize: '16px', fontWeight: 'bold' }}>رجوع للرئيسية</span>
        </button>

        <div style={{
          background: isAutoPilotActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${isAutoPilotActive ? '#10b981' : '#ef4444'}`,
          color: isAutoPilotActive ? '#10b981' : '#f87171',
          padding: '5px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isAutoPilotActive ? '#10b981' : '#ef4444', boxShadow: isAutoPilotActive ? '0 0 8px #10b981' : 'none' }}></span>
          <span>{isAutoPilotActive ? 'الأوتوبايلوت نَشِط (سحابي 24/7) 🟢' : 'الأوتوبايلوت مُتوقف ⚪'}</span>
        </div>
      </div>

      {/* 🌐 Smart Session Intelligence Card */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.12) 0%, rgba(30, 41, 59, 0.7) 100%)',
        border: '1px solid rgba(56, 189, 248, 0.35)',
        borderRadius: '16px',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        boxShadow: '0 4px 20px rgba(14, 165, 233, 0.15)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={18} color="#38bdf8" />
            <span style={{ fontSize: '13px', fontWeight: '900', color: '#fff' }}>رادار الجلسات المالية الذكي:</span>
          </div>
          <span style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            color: '#fff',
            fontSize: '11px',
            fontWeight: 'bold',
            padding: '3px 10px',
            borderRadius: '20px',
            boxShadow: '0 0 10px rgba(56, 189, 248, 0.4)'
          }}>
            {sessionInfo?.name || 'جلسة التداول المالية'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '11.5px' }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ color: '#94a3b8', fontSize: '10px' }}>🎯 الاستراتيجية المعتمدة للجلسة:</div>
            <div style={{ color: '#38bdf8', fontWeight: 'bold', marginTop: '2px' }}>{sessionInfo?.strategy || 'تتبع السيولة المؤسسية'}</div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ color: '#94a3b8', fontSize: '10px' }}>⭐ نسبة العائد / المخاطرة (R:R):</div>
            <div style={{ color: '#10b981', fontWeight: '900', marginTop: '2px' }}>{sessionInfo?.rr_target || '1:3.0'} (عائد مضاعف)</div>
          </div>
        </div>

        <div style={{ fontSize: '11px', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={14} color="#f59e0b" />
          <span><b>الأزواج المفضلة للجلسة الحالية:</b> {Array.isArray(sessionInfo?.optimal_pairs) ? sessionInfo.optimal_pairs.join(' • ') : 'XAU/USD, EUR/USD, GBP/USD'}</span>
        </div>
      </div>

      {/* 🏆 $20 Daily Profit Target & Safety Engine Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 100%)',
        border: `2px solid ${isTargetAchieved ? '#f59e0b' : isAutoPilotActive ? '#10b981' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: '18px',
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        boxShadow: isTargetAchieved ? '0 0 35px rgba(245, 158, 11, 0.3)' : isAutoPilotActive ? '0 0 30px rgba(16, 185, 129, 0.2)' : 'none'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: isTargetAchieved ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : isAutoPilotActive ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              boxShadow: isTargetAchieved ? '0 0 15px rgba(245, 158, 11, 0.5)' : isAutoPilotActive ? '0 0 15px rgba(16, 185, 129, 0.5)' : 'none'
            }}>
              {isTargetAchieved ? '🏆' : '🤖'}
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '900', color: '#fff' }}>
                نظام الأوتوبايلوت (هدف 20$ يومياً)
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                اقتناص أفضل صفقات الجلسات + قفل آلي ذكي عند تحقيق الـ 20$
              </div>
            </div>
          </div>

          {/* Master Switch Button */}
          <button
            onClick={() => handleToggleAutoPilot(!isAutoPilotActive)}
            style={{
              background: isAutoPilotActive ? 'linear-gradient(135deg, #10b981 0%, #047857 100%)' : 'rgba(255,255,255,0.08)',
              border: `1px solid ${isAutoPilotActive ? '#10b981' : 'rgba(255,255,255,0.2)'}`,
              color: '#fff',
              padding: '10px 18px',
              borderRadius: '24px',
              fontWeight: '900',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: isAutoPilotActive ? '0 0 20px rgba(16, 185, 129, 0.4)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Power size={16} />
            <span>{isAutoPilotActive ? 'إيقاف الأوتوبايلوت ⏸️' : 'تفعيل الأوتوبايلوت 🚀'}</span>
          </button>
        </div>

        {/* 🎯 $20 Target Progress Visualizer Card */}
        <div style={{
          background: 'rgba(0,0,0,0.45)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '14px',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '12px', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Target size={15} color="#f59e0b" />
              <span>الهدف اليومي الثابت (Target Goal):</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: '900', color: isTargetAchieved ? '#f59e0b' : '#10b981' }}>
                ${currentProfitSafe.toFixed(2)} / $20.00
              </span>
              <button 
                onClick={handleResetDailyQuota}
                title="تصفير العداد اليومي"
                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <RefreshCw size={13} />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: isTargetAchieved 
                ? 'linear-gradient(90deg, #f59e0b 0%, #10b981 100%)' 
                : 'linear-gradient(90deg, #38bdf8 0%, #10b981 100%)',
              transition: 'width 0.4s ease'
            }} />
          </div>

          {/* Quota Steps & Status */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
            <span style={{ color: '#94a3b8' }}>
              عدد الصفقات المنفذة اليوم: <b>{Number(dailyQuota?.executedCount || 0)} من {Number(dailyQuota?.maxDaily || 5)} صفقات</b>
            </span>
            {isTargetAchieved ? (
              <span style={{ color: '#f59e0b', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Lock size={12} /> تم تحقيق الهدف وقفل الأرباح 🏆
              </span>
            ) : isLossLocked ? (
              <span style={{ color: '#f87171', fontWeight: 'bold' }}>
                🛡️ تم تفعيل حماية الحساب اليومية
              </span>
            ) : (
              <span style={{ color: '#10b981', fontWeight: 'bold' }}>
                جاري اقتناص الهدف (Scouting Active) 🏹
              </span>
            )}
          </div>
        </div>

        {/* Lot Size Selector with Projected Gain */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '10px', flexWrap: 'wrap', gap: '6px' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Shield size={14} color="#10b981" />
            <span>حجم اللوت المنفذ:</span>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[0.01, 0.02, 0.03, 0.05, 0.10].map(lot => (
              <button
                key={lot}
                onClick={() => handleSelectLot(lot)}
                style={{
                  background: selectedLot === lot ? '#10b981' : 'rgba(255,255,255,0.06)',
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
      </div>

      {/* Target Selected Pairs Section with Session Badges */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendingUp size={16} color="#38bdf8" />
            <span>الأزواج المستهدفة للأوتوبايلوت ({selectedPairs.filter(p => p.enabled).length} مفعّلة):</span>
          </div>

          <button
            onClick={() => setShowAddPairModal(true)}
            style={{
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#38bdf8',
              padding: '5px 12px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Plus size={14} />
            <span>إضافة زوج جديد</span>
          </button>
        </div>

        {/* Pairs List Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {selectedPairs.map((pair) => {
            const pairData = livePrices[pair.symbol];
            const cleanSym = pair.symbol.replace('/', '').toUpperCase();
            const isOptimalSession = sessionInfo.optimal_pairs && sessionInfo.optimal_pairs.some(x => x.replace('/', '').toUpperCase() === cleanSym);

            return (
              <div
                key={pair.symbol}
                style={{
                  background: isOptimalSession ? 'rgba(56, 189, 248, 0.05)' : pair.enabled ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.01)',
                  border: `1px solid ${isOptimalSession ? 'rgba(56, 189, 248, 0.4)' : pair.enabled ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)'}`,
                  borderRadius: '12px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <AssetLogo symbol={pair.symbol} size={20} containerSize={32} />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 'bold', color: pair.enabled ? '#fff' : '#64748b' }}>
                        {pair.symbol}
                      </span>
                      {isOptimalSession && (
                        <span style={{ fontSize: '9px', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', padding: '1px 5px', borderRadius: '4px', fontWeight: 'bold' }}>
                          🔥 قمة سيولة الجلسة
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                      {pair.name}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {pairData && pairData.price && (
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>
                        ${pairData.price >= 100 ? pairData.price.toFixed(2) : pairData.price.toFixed(4)}
                      </div>
                      <div style={{ fontSize: '10px', color: pairData.isUp ? '#10b981' : '#f87171' }}>
                        {pairData.isUp ? '▲' : '▼'} {pairData.change}%
                      </div>
                    </div>
                  )}

                  {/* Toggle Button */}
                  <button
                    onClick={() => handleTogglePair(pair.symbol)}
                    style={{
                      background: pair.enabled ? '#10b981' : 'rgba(255,255,255,0.1)',
                      color: pair.enabled ? '#000' : '#cbd5e1',
                      border: 'none',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    {pair.enabled ? 'مُفعّل 🟢' : 'معطل ⚪'}
                  </button>

                  {/* Delete Option for custom pairs */}
                  {pair.category === 'Custom' && (
                    <button
                      onClick={() => handleDeletePair(pair.symbol)}
                      style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '2px' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Autopilot Daily Trades (If any open) */}
      {activeAutoTrades.length > 0 && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: '16px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={16} />
            <span>الصفقات اليومية النشطة حالياً ({activeAutoTrades.length}):</span>
          </div>

          {activeAutoTrades.map((trade) => (
            <div
              key={trade.id}
              style={{
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                padding: '10px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}>
                  {trade.side === 'buy' ? 'BUY 🟢' : 'SELL 🔴'} {trade.symbol} (تذكرة #{trade.ticket})
                </div>
                <button
                  onClick={() => handleCloseAutoTrade(trade)}
                  style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  💰 إغلاق وحجز الربح
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', fontSize: '10.5px', textAlign: 'center', background: 'rgba(255,255,255,0.02)', padding: '6px', borderRadius: '6px' }}>
                <div>الدخول: <b>${trade.entryPrice}</b></div>
                <div style={{ color: '#f87171' }}>الوقف SL: <b>${trade.sl}</b></div>
                <div style={{ color: '#10b981' }}>الهدف TP: <b>${trade.tp}</b></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Autonomous AI Agent Thought Log Box */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.45)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '14px',
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Bot size={16} />
            <span>نشاط خوارزمية الذكاء الاصطناعي (Agent Horizon Live):</span>
          </div>
          <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 'bold' }}>{agentStatus}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '120px', overflowY: 'auto' }}>
          {agentLogs.map((log, idx) => (
            <div key={idx} style={{ fontSize: '10.5px', color: '#cbd5e1', lineHeight: '1.5', background: 'rgba(255,255,255,0.02)', padding: '4px 8px', borderRadius: '6px' }}>
              <span style={{ color: '#94a3b8', marginLeft: '6px' }}>[{log.time}]</span>
              <span>{log.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Add Custom Pair Modal with Smart Autocomplete */}
      {showAddPairModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.82)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: '#0f172a',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            borderRadius: '20px',
            padding: '20px',
            width: '100%',
            maxWidth: '420px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 25px rgba(56, 189, 248, 0.15)',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>⚡</span>
                <span style={{ fontSize: '15px', fontWeight: '900', color: '#fff' }}>إضافة زوج تداول للأوتوبايلوت</span>
              </div>
              <button
                onClick={() => {
                  setShowAddPairModal(false);
                  setNewPairInput('');
                  setNewPairName('');
                }}
                style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#94a3b8', cursor: 'pointer', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Popular Chips */}
            <div>
              <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 'bold', marginBottom: '6px' }}>
                🚀 اختيارات سريعة شائعة (اضغط للإضافة الفورية):
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {[
                  { symbol: 'XAU/USD', name: 'الذهب مقابل الدولار', category: 'Metals' },
                  { symbol: 'EUR/USD', name: 'اليورو مقابل الدولار', category: 'Forex' },
                  { symbol: 'GBP/USD', name: 'الجنيه الإسترليني', category: 'Forex' },
                  { symbol: 'USD/JPY', name: 'الدولار مقابل الين', category: 'Forex' },
                  { symbol: 'US30', name: 'مؤشر الداو جونز', category: 'Indices' },
                  { symbol: 'NAS100', name: 'مؤشر ناسداك', category: 'Indices' },
                  { symbol: 'USOIL', name: 'نفط تكساس (WTI)', category: 'Energy' },
                  { symbol: 'BTC/USDT', name: 'البيتكوين', category: 'Crypto' },
                  { symbol: 'ETH/USDT', name: 'الإيثيريوم', category: 'Crypto' }
                ].map(item => {
                  const alreadyAdded = selectedPairs.some(p => p.symbol.toUpperCase() === item.symbol.toUpperCase());
                  return (
                    <button
                      key={item.symbol}
                      onClick={() => {
                        if (!alreadyAdded) {
                          const updated = [...selectedPairs, {
                            symbol: item.symbol,
                            name: item.name,
                            enabled: true,
                            category: item.category
                          }];
                          handleUpdatePairsOnServer(updated);
                          setShowAddPairModal(false);
                        }
                      }}
                      style={{
                        background: alreadyAdded ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.06)',
                        border: `1px solid ${alreadyAdded ? '#10b981' : 'rgba(255,255,255,0.12)'}`,
                        color: alreadyAdded ? '#10b981' : '#e2e8f0',
                        padding: '4px 10px',
                        borderRadius: '16px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        cursor: alreadyAdded ? 'default' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>{item.symbol}</span>
                      {alreadyAdded && <span>✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Autocomplete Search Input */}
            <div>
              <label style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>اكتب أي حرف للبحث التلقائي الفوري (Symbol / Name):</span>
                <span style={{ color: '#38bdf8', fontSize: '10px' }}>بحث فوري 🔍</span>
              </label>
              <input
                type="text"
                placeholder="مثال: JPY أو ذهب أو CAD أو ETH أو US30..."
                value={newPairInput}
                autoFocus
                onChange={(e) => {
                  const val = e.target.value;
                  setNewPairInput(val);
                }}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: 'rgba(0,0,0,0.6)',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  color: '#fff',
                  boxSizing: 'border-box',
                  fontSize: '13px',
                  outline: 'none',
                  fontWeight: 'bold'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>اسم الزوج التوضيحي (اختياري):</label>
              <input
                type="text"
                placeholder="مثال: الدولار الأمريكي مقابل الين"
                value={newPairName}
                onChange={(e) => setNewPairName(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', boxSizing: 'border-box', fontSize: '12px' }}
              />
            </div>

            <button
              onClick={handleAddCustomPair}
              disabled={!newPairInput.trim()}
              style={{
                background: newPairInput.trim() ? 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)' : 'rgba(255,255,255,0.1)',
                color: newPairInput.trim() ? '#000' : '#64748b',
                border: 'none',
                padding: '12px',
                borderRadius: '12px',
                fontWeight: '900',
                fontSize: '13px',
                cursor: newPairInput.trim() ? 'pointer' : 'not-allowed',
                marginTop: '4px',
                boxShadow: newPairInput.trim() ? '0 4px 15px rgba(56, 189, 248, 0.4)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <span>حفظ وتفعيل الزوج للتداول الآلي 24/7 🚀</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
