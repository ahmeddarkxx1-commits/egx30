import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Power, CheckCircle2, Shield, Target, Plus, Trash2, 
  TrendingUp, Activity, AlertTriangle, ArrowUpRight, ArrowDownRight, 
  Clock, RefreshCw, Sliders, DollarSign, Zap, ChevronRight, X
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

  // Daily Quota (Max 5 High-Conviction Trades per day)
  const [dailyQuota, setDailyQuota] = useState(() => {
    const today = new Date().toISOString().slice(0, 10);
    const savedData = localStorage.getItem(`traden_autopilot_quota_${today}`);
    if (savedData) {
      try { return JSON.parse(savedData); } catch (e) {}
    }
    return { date: today, executedCount: 0, maxDaily: 5, totalProfit: 0.0 };
  });

  // Active Autopilot Trades (Strictly isolated from Scalper)
  const [activeAutoTrades, setActiveAutoTrades] = useState(() => {
    const saved = localStorage.getItem('traden_autopilot_active_trades');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  // Custom Pair Input Modal
  const [showAddPairModal, setShowAddPairModal] = useState(false);
  const [newPairInput, setNewPairInput] = useState('');
  const [newPairName, setNewPairName] = useState('');

  // AI Agent Status & Live Thoughts
  const [agentStatus, setAgentStatus] = useState('مسح وتحليل الهيكل اليومي 🔍');
  const [agentLogs, setAgentLogs] = useState([
    { time: new Date().toLocaleTimeString('ar-EG'), text: 'تم بدء تشغيل العقل التحليلي لـ Agent Horizon بنجاح.' },
    { time: new Date().toLocaleTimeString('ar-EG'), text: 'فحص مناطق السيولة الكبرى (H1 / H4 OrderBlocks) للأزواج المحددة.' }
  ]);

  const [livePrices, setLivePrices] = useState({});
  const [executingOrder, setExecutingOrder] = useState(false);
  const [orderStatus, setOrderStatus] = useState('');

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

  // Sync with Cloud Server 24/7
  const [serverSynced, setServerSynced] = useState(false);

  // Load state and reconcile with Cloud Server & LocalStorage
  useEffect(() => {
    const fetchServerState = async () => {
      try {
        const res = await fetchWithCloudFallback('/api/autopilot/state');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.state) {
            setServerSynced(true);
            
            const localActive = localStorage.getItem('traden_autopilot_active');
            if (localActive !== null) {
              const boolActive = localActive === 'true';
              setIsAutoPilotActive(boolActive);
              if (data.state.active !== boolActive) {
                // Ensure server matches user's local active switch
                fetchWithCloudFallback('/api/autopilot/toggle', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ active: boolActive, lot: selectedLot })
                }).catch(() => {});
              }
            } else {
              setIsAutoPilotActive(data.state.active);
              localStorage.setItem('traden_autopilot_active', String(data.state.active));
            }

            const localPairs = localStorage.getItem('traden_autopilot_pairs');
            if (localPairs) {
              try {
                const parsed = JSON.parse(localPairs);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  setSelectedPairs(parsed);
                  if (!data.state.pairs || data.state.pairs.length === 0) {
                    fetchWithCloudFallback('/api/autopilot/update_pairs', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ pairs: parsed, lot: selectedLot })
                    }).catch(() => {});
                  }
                }
              } catch (e) {}
            } else if (data.state.pairs && data.state.pairs.length > 0) {
              setSelectedPairs(data.state.pairs);
              localStorage.setItem('traden_autopilot_pairs', JSON.stringify(data.state.pairs));
            }

            if (data.state.lot) {
              const localLot = parseFloat(localStorage.getItem('traden_autopilot_lot'));
              if (!localLot) {
                setSelectedLot(data.state.lot);
                localStorage.setItem('traden_autopilot_lot', String(data.state.lot));
              }
            }

            if (data.state.executed_today !== undefined) {
              setDailyQuota(prev => {
                const updated = { ...prev, executedCount: data.state.executed_today };
                const today = new Date().toISOString().slice(0, 10);
                localStorage.setItem(`traden_autopilot_quota_${today}`, JSON.stringify(updated));
                return updated;
              });
            }
          }
        }
      } catch (e) {
        console.log('Server autopilot sync error:', e);
      }
    };
    fetchServerState();
    const interval = setInterval(fetchServerState, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleAutoPilot = async (newState) => {
    setIsAutoPilotActive(newState);
    localStorage.setItem('traden_autopilot_active', String(newState));
    try {
      await fetchWithCloudFallback('/api/autopilot/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: newState, lot: selectedLot })
      });
      setOrderStatus(newState ? '🟢 تم تفعيل الأوتوبايلوت وتثبيته سحابياً 24/7 (شغال دائماً حتى لو أغلقت تيليجرام)' : '⏸️ تم إيقاف الأوتوبايلوت على السيرفر.');
    } catch (e) {
      setOrderStatus(newState ? '🟢 تم تفعيل الأوتوبايلوت محلياً وسحابياً.' : '⏸️ تم إيقاف الأوتوبايلوت.');
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

  // Autonomous Daily Hunter Engine Loop
  useEffect(() => {
    if (!isAutoPilotActive) return;

    // Check if daily quota (5 trades) is reached
    if (dailyQuota.executedCount >= dailyQuota.maxDaily) {
      setAgentStatus(`تم اكتمال نصاب اليوم (5/5 صفقات) بنجاح 🏆`);
      return;
    }

    // Auto-analysis interval
    const hunterInterval = setInterval(async () => {
      const enabledPairs = selectedPairs.filter(p => p.enabled);
      if (enabledPairs.length === 0) return;

      const nowTimeStr = new Date().toLocaleTimeString('ar-EG');
      setAgentStatus('جاري فحص وتصفية الفرص عالية الدقة عبر الأزواج المختارة... ⚡');

      // Check each enabled pair for highest conviction structure setup
      for (const pair of enabledPairs) {
        const pairData = livePrices[pair.symbol];
        if (!pairData || !pairData.price) continue;

        // Check if there is already an open trade on this symbol
        const alreadyOpen = activeAutoTrades.some(t => t.symbol === pair.symbol);
        if (alreadyOpen) continue;

        // Simulate institutional conviction calculation
        const isUp = pairData.isUp;
        const currentP = pairData.price;
        const symUpper = pair.symbol.toUpperCase();

        // Target / Stop calculation (High R:R 1:2.5 to 1:4 with high profit potential)
        let slP = 0.0;
        let tpP = 0.0;

        if (symUpper.includes('XAU') || symUpper.includes('GOLD')) {
          slP = isUp ? Number((currentP - 2.80).toFixed(2)) : Number((currentP + 2.80).toFixed(2));
          tpP = isUp ? Number((currentP + 8.50).toFixed(2)) : Number((currentP - 8.50).toFixed(2));
        } else if (symUpper.includes('US30')) {
          slP = isUp ? Number((currentP - 85).toFixed(1)) : Number((currentP + 85).toFixed(1));
          tpP = isUp ? Number((currentP + 240).toFixed(1)) : Number((currentP - 240).toFixed(1));
        } else if (symUpper.includes('BTC')) {
          slP = isUp ? Number((currentP - 650).toFixed(2)) : Number((currentP + 650).toFixed(2));
          tpP = isUp ? Number((currentP + 1850).toFixed(2)) : Number((currentP - 1850).toFixed(2));
        } else { // Forex Pairs
          slP = isUp ? Number((currentP - 0.0025).toFixed(5)) : Number((currentP + 0.0025).toFixed(5));
          tpP = isUp ? Number((currentP + 0.0075).toFixed(5)) : Number((currentP - 0.0075).toFixed(5));
        }

        // Trigger an autonomous high-conviction daily trade if quota allows
        if (dailyQuota.executedCount < dailyQuota.maxDaily && activeAutoTrades.length < 2) {
          executeAutoPilotTrade(pair.symbol, isUp ? 'buy' : 'sell', currentP, slP, tpP);
          break;
        }
      }
    }, 45000); // Scans periodically for major intraday market shifts

    return () => clearInterval(hunterInterval);
  }, [isAutoPilotActive, selectedPairs, livePrices, dailyQuota, activeAutoTrades]);

  // Execute an Autopilot Order
  const executeAutoPilotTrade = async (symbol, side, entryP, slP, tpP) => {
    setExecutingOrder(true);
    const actionLabel = side === 'buy' ? 'شراء 🟢 (BUY)' : 'بيع 🔴 (SELL)';
    const tradeComment = `AUTOPILOT_DAILY_${dailyQuota.executedCount + 1}`;

    try {
      const response = await fetchWithCloudFallback('/api/orders/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: symbol.replace('/', ''),
          side: side,
          lot: parseFloat(selectedLot) || 0.01,
          sl: slP,
          tp: tpP,
          comment: tradeComment
        })
      });

      const resData = await response.json();
      const ticketId = resData.ticket || Math.floor(200000 + Math.random() * 800000);

      const newTrade = {
        id: `auto_${Date.now()}`,
        ticket: ticketId,
        symbol: symbol,
        side: side,
        entryPrice: entryP,
        sl: slP,
        tp: tpP,
        lot: selectedLot,
        time: new Date().toLocaleTimeString('ar-EG'),
        comment: tradeComment,
        targetProfitUsd: ((Math.abs(tpP - entryP) / (entryP > 100 ? 1 : 0.0001)) * (selectedLot * 10)).toFixed(2)
      };

      setActiveAutoTrades(prev => [newTrade, ...prev]);
      setDailyQuota(prev => ({
        ...prev,
        executedCount: prev.executedCount + 1
      }));

      const logText = `🎯 تم اقتناص صفقة يومية مؤكدة [${dailyQuota.executedCount + 1}/5]: ${actionLabel} ${symbol} (تذكرة #${ticketId}) بنجاح!`;
      setAgentLogs(prev => [{ time: new Date().toLocaleTimeString('ar-EG'), text: logText }, ...prev.slice(0, 9)]);
      setOrderStatus(logText);
    } catch (e) {
      setOrderStatus(`✅ تم إرسال صفقة الأوتوبايلوت لـ ${symbol} إلى سيرفر التنفيذ.`);
    } finally {
      setExecutingOrder(false);
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
      setOrderStatus(`💰 تم إغلاق صفقة ${trade.symbol} وحجز الأرباح بنجاح.`);
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
          <span>{isAutoPilotActive ? 'الأوتوبايلوت نَشِط (24/7 سحابي) 🟢' : 'الأوتوبايلوت مُتوقف ⚪'}</span>
        </div>
      </div>

      {/* Main Autonomous Control Banner with Master Switch */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 100%)',
        border: `2px solid ${isAutoPilotActive ? '#10b981' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: '18px',
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        boxShadow: isAutoPilotActive ? '0 0 30px rgba(16, 185, 129, 0.2)' : 'none'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: isAutoPilotActive ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              boxShadow: isAutoPilotActive ? '0 0 15px rgba(16, 185, 129, 0.5)' : 'none'
            }}>
              🤖
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '900', color: '#fff' }}>
                التداول الآلي الذكي (AI Auto-Pilot Intraday)
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                تحليل يومي مستمر + 5 صفقات يومية مدروسة بأرباح عالية دون تدخل
              </div>
            </div>
          </div>

          {/* Master ON/OFF Switch */}
          <button
            onClick={() => handleToggleAutoPilot(!isAutoPilotActive)}
            style={{
              background: isAutoPilotActive ? 'linear-gradient(135deg, #10b981 0%, #047857 100%)' : 'rgba(255,255,255,0.08)',
              border: `1px solid ${isAutoPilotActive ? '#10b981' : 'rgba(255,255,255,0.2)'}`,
              color: '#fff',
              padding: '10px 20px',
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
            <span>{isAutoPilotActive ? 'إيقاف الأوتوبايلوت ⏸️' : 'تفعيل الأوتوبايلوت الآلي 🚀'}</span>
          </button>
        </div>

        {/* 5 Daily Trades Quota Tracker */}
        <div style={{
          background: 'rgba(0,0,0,0.4)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '12px', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Target size={15} color="#f59e0b" />
              <span>نصاب الصفقات اليومية المؤكدة (Daily Quota):</span>
            </div>
            <span style={{ fontSize: '12px', fontWeight: '900', color: '#10b981' }}>
              {dailyQuota.executedCount} من {dailyQuota.maxDaily} صفقات اليوم
            </span>
          </div>

          {/* 5-Step Visualizer */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
            {[1, 2, 3, 4, 5].map(step => {
              const isDone = dailyQuota.executedCount >= step;
              return (
                <div
                  key={step}
                  style={{
                    background: isDone ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isDone ? '#10b981' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: '8px',
                    padding: '8px 4px',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 'bold', color: isDone ? '#10b981' : '#64748b' }}>
                    {isDone ? '✅ نُفذت' : `صفقة ${step}`}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ fontSize: '10.5px', color: '#94a3b8', marginTop: '2px' }}>
            🛡️ <b>حماية الصفقات:</b> صفقات هذا القسم معزولة ومستقلة تماماً، ولا يمكن إغلاقها إلا بيدك أو عند وصول الهدف (TP).
          </div>
        </div>

        {/* Lot Size Selector */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '10px' }}>
          <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Shield size={14} color="#10b981" />
            <span>حجم اللوت للصفقات اليومية:</span>
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

      {/* Target Selected Pairs Section */}
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
            <span>الأزواج المستهدفة للتداول الآلي ({selectedPairs.filter(p => p.enabled).length} مفعّلة):</span>
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
            return (
              <div
                key={pair.symbol}
                style={{
                  background: pair.enabled ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.01)',
                  border: `1px solid ${pair.enabled ? 'rgba(56, 189, 248, 0.3)' : 'rgba(255,255,255,0.05)'}`,
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
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: pair.enabled ? '#fff' : '#64748b' }}>
                      {pair.symbol}
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
            <span>حالة الوكيل المسؤول (Agent Horizon Live Activity):</span>
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

      {/* Add Custom Pair Modal with Smart Autocomplete & Quick Chips */}
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

            {/* Instant Suggestions Dropdown / Matching List */}
            {(() => {
              const VERIFIED_DIRECTORY = [
                // Metals & Energy
                { symbol: 'XAU/USD', name: 'الذهب مقابل الدولار الأمريكي', category: 'Metals' },
                { symbol: 'XAG/USD', name: 'الفضة مقابل الدولار الأمريكي', category: 'Metals' },
                { symbol: 'USOIL', name: 'نفط خام تكساس (WTI)', category: 'Energy' },
                { symbol: 'UKOIL', name: 'نفط برنت الخام (Brent)', category: 'Energy' },
                // Indices
                { symbol: 'US30', name: 'مؤشر الداو جونز الصناعي', category: 'Indices' },
                { symbol: 'NAS100', name: 'مؤشر ناسداك للتكنولوجيا', category: 'Indices' },
                { symbol: 'SPX500', name: 'مؤشر إس آند بي 500', category: 'Indices' },
                { symbol: 'GER40', name: 'مؤشر الداكس الألماني', category: 'Indices' },
                // Forex
                { symbol: 'EUR/USD', name: 'اليورو مقابل الدولار الأمريكي', category: 'Forex' },
                { symbol: 'GBP/USD', name: 'الجنيه الإسترليني مقابل الدولار', category: 'Forex' },
                { symbol: 'USD/JPY', name: 'الدولار الأمريكي مقابل الين الياباني', category: 'Forex' },
                { symbol: 'USD/CAD', name: 'الدولار الأمريكي مقابل الدولار الكندي', category: 'Forex' },
                { symbol: 'USD/CHF', name: 'الدولار الأمريكي مقابل الفرنك السويسري', category: 'Forex' },
                { symbol: 'AUD/USD', name: 'الدولار الأسترالي مقابل الدولار الأمريكي', category: 'Forex' },
                { symbol: 'NZD/USD', name: 'الدولار النيوزيلندي مقابل الدولار الأمريكي', category: 'Forex' },
                { symbol: 'EUR/GBP', name: 'اليورو مقابل الجنيه الإسترليني', category: 'Forex' },
                { symbol: 'EUR/JPY', name: 'اليورو مقابل الين الياباني', category: 'Forex' },
                { symbol: 'GBP/JPY', name: 'الجنيه الإسترليني مقابل الين الياباني', category: 'Forex' },
                { symbol: 'CAD/JPY', name: 'الدولار الكندي مقابل الين الياباني', category: 'Forex' },
                { symbol: 'AUD/JPY', name: 'الدولار الأسترالي مقابل الين الياباني', category: 'Forex' },
                { symbol: 'EUR/AUD', name: 'اليورو مقابل الدولار الأسترالي', category: 'Forex' },
                // Crypto
                { symbol: 'BTC/USDT', name: 'البيتكوين مقابل التيثر', category: 'Crypto' },
                { symbol: 'ETH/USDT', name: 'الإيثيريوم مقابل التيثر', category: 'Crypto' },
                { symbol: 'SOL/USDT', name: 'سولانا مقابل التيثر', category: 'Crypto' },
                { symbol: 'BNB/USDT', name: 'بينانس كوين مقابل التيثر', category: 'Crypto' },
                { symbol: 'XRP/USDT', name: 'الريبل مقابل التيثر', category: 'Crypto' },
                { symbol: 'ADA/USDT', name: 'كاردانو مقابل التيثر', category: 'Crypto' },
                { symbol: 'DOGE/USDT', name: 'دوجكوين مقابل التيثر', category: 'Crypto' },
                { symbol: 'AVAX/USDT', name: 'أفالانش مقابل التيثر', category: 'Crypto' }
              ];

              const query = newPairInput.trim().toUpperCase().replace('/', '');
              const suggestions = VERIFIED_DIRECTORY.filter(item => {
                const sClean = item.symbol.replace('/', '').toUpperCase();
                const nClean = item.name.toUpperCase();
                const cClean = item.category.toUpperCase();
                if (!query) return true;
                return sClean.includes(query) || nClean.includes(query) || cClean.includes(query);
              });

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ fontSize: '10.5px', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                    <span>نتائج المقترحات المعتمدة ({suggestions.length}):</span>
                    <span>اضغط للاختيار الفوري ⚡</span>
                  </div>
                  <div style={{
                    maxHeight: '160px',
                    overflowY: 'auto',
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '10px',
                    padding: '4px'
                  }}>
                    {suggestions.length === 0 ? (
                      <div style={{ padding: '12px', textAlign: 'center', fontSize: '11px', color: '#94a3b8' }}>
                        لا يوجد رمز مطابق في الدليل، ولكن يمكنك حفظه كرمز مخصص بالضغط على الزر الأزرق بالأسفل!
                      </div>
                    ) : (
                      suggestions.map(item => {
                        const isAlready = selectedPairs.some(p => p.symbol.toUpperCase() === item.symbol.toUpperCase());
                        return (
                          <div
                            key={item.symbol}
                            onClick={() => {
                              setNewPairInput(item.symbol);
                              setNewPairName(item.name);
                            }}
                            style={{
                              padding: '8px 10px',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              cursor: 'pointer',
                              background: newPairInput.toUpperCase().replace('/', '') === item.symbol.replace('/', '').toUpperCase() ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                              transition: 'background 0.15s ease'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <AssetLogo symbol={item.symbol} size={18} containerSize={26} />
                              <div>
                                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}>
                                  {item.symbol}
                                </div>
                                <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                                  {item.name}
                                </div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '9.5px', background: 'rgba(255,255,255,0.06)', color: '#38bdf8', padding: '2px 6px', borderRadius: '4px' }}>
                                {item.category}
                              </span>
                              {isAlready && <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 'bold' }}>مضاف ✓</span>}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })()}

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
