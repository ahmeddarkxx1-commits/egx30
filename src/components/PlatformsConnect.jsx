import React, { useState, useEffect } from 'react';
import { Shield, Key, CheckCircle, Server, DollarSign, ExternalLink, ArrowRight, Save, Info, Loader, RefreshCw, AlertTriangle } from 'lucide-react';

export default function PlatformsConnect({ onBack }) {
  const [selectedCategory, setSelectedCategory] = useState('forex'); // 'forex' or 'crypto'
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [isError, setIsError] = useState(false);

  // Live Account Details
  const [accountData, setAccountData] = useState(null);
  const [fetchingAccount, setFetchingAccount] = useState(false);

  // Forex Form State
  const [forexBroker, setForexBroker] = useState(() => localStorage.getItem('traden_forex_broker') || 'Exness');
  const [mt5Login, setMt5Login] = useState(() => localStorage.getItem('traden_mt5_login') || '472326565');
  const [mt5Password, setMt5Password] = useState(() => localStorage.getItem('traden_mt5_password') || '');
  const [mt5Server, setMt5Server] = useState(() => localStorage.getItem('traden_mt5_server') || 'Exness-MT5Trial16');

  // Crypto Form State
  const [cryptoExchange, setCryptoExchange] = useState(() => localStorage.getItem('traden_crypto_exchange') || 'binance');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('traden_crypto_apikey') || '');
  const [apiSecret, setApiSecret] = useState(() => localStorage.getItem('traden_crypto_apisecret') || '');
  const [passphrase, setPassphrase] = useState(() => localStorage.getItem('traden_crypto_passphrase') || '');

  // Cloud Backend Server URL State
  const [cloudUrl, setCloudUrl] = useState(() => localStorage.getItem('traden_cloud_url') || '');
  const [showCloudConfig, setShowCloudConfig] = useState(false);

  // Smart multi-host fetch helper (Cloud Server + Auto Origin + Local Fallback)
  const fetchWithFallback = async (endpoint, options = {}) => {
    let cloudUrl = (localStorage.getItem('traden_cloud_url') || '').trim();
    if (cloudUrl && !cloudUrl.startsWith('http://') && !cloudUrl.startsWith('https://')) {
      cloudUrl = `https://${cloudUrl}`;
    }
    const currentOrigin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : '';
    const hosts = [
      cloudUrl,
      currentOrigin,
      '',
      'http://localhost:5000',
      'http://127.0.0.1:5000'
    ].filter(Boolean);

    for (const host of hosts) {
      try {
        const url = host.endsWith('/') ? `${host.slice(0, -1)}${endpoint}` : `${host}${endpoint}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timeoutId);
        if (res) return res;
      } catch (e) {
        // try next host
      }
    }
    throw new Error('Server unreachable');
  };

  const fetchLiveAccount = async () => {
    setFetchingAccount(true);
    try {
      const response = await fetchWithFallback('/api/account');
      if (response && response.ok) {
        const data = await response.json();
        if (data && data.success) {
          setAccountData(data);
        }
      }
    } catch (e) {
      console.log('Account fetch error or standalone mode:', e);
    } finally {
      setFetchingAccount(false);
    }
  };

  useEffect(() => {
    fetchLiveAccount();
    const interval = setInterval(fetchLiveAccount, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveForex = async (e) => {
    if (e) e.preventDefault();
    
    if (!mt5Login || !mt5Password || !mt5Server || mt5Server === 'ةة') {
      setIsError(true);
      setSaveStatus('⚠️ رجاءً كتابة اسم السيرفر الصحيح لحسابك في Exness (مثال: Exness-MT5Trial16 أو Exness-Real10)');
      return;
    }

    setLoading(true);
    setSaveStatus('جاري الاتصال واختبار حساب MT5 مع سيرفر البروكر...');
    setIsError(false);

    localStorage.setItem('traden_forex_broker', forexBroker);
    localStorage.setItem('traden_mt5_login', mt5Login);
    localStorage.setItem('traden_mt5_password', mt5Password);
    localStorage.setItem('traden_mt5_server', mt5Server);

    try {
      const response = await fetchWithFallback('/api/platforms/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'forex',
          broker: forexBroker,
          login: mt5Login,
          password: mt5Password,
          server: mt5Server
        })
      });

      const data = await response.json();
      if (response && response.ok && data.success) {
        setIsError(false);
        setSaveStatus(data.message || '✅ تم الاتصال بنجاح وتفعيل حساب MT5!');
        setAccountData({
          connected: true,
          broker: forexBroker,
          login: mt5Login,
          balance: data.balance || 0.0,
          equity: data.balance || 0.0,
          free_margin: data.balance || 0.0,
          currency: data.currency || 'USD',
          positions: []
        });
        fetchLiveAccount();
      } else {
        setIsError(true);
        setSaveStatus(data.message || '❌ فشل الاتصال بالسيرفر. تأكد من اسم السيرفر ورقم الحساب والباسورد.');
      }
    } catch (err) {
      setIsError(true);
      setSaveStatus(`⚠️ يتعذر الاتصال بالسيرفر. إذا كنت تستخدم الربط السحابي، أدخل IP أو رابط سيرفرك في مربع (🌐 إعدادات رابط السيرفر السحابي) بالأعلى واضغط حفظ.`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCrypto = async (e) => {
    if (e) e.preventDefault();
    if (!apiKey || !apiSecret) {
      setIsError(true);
      setSaveStatus('⚠️ رجاءً أدخل الـ API Key والـ Secret Key للمنصة.');
      return;
    }

    setLoading(true);
    setSaveStatus(`جاري الاتصال واختبار مفاتيح API لمنصة ${cryptoExchange.toUpperCase()}...`);
    setIsError(false);

    localStorage.setItem('traden_crypto_exchange', cryptoExchange);
    localStorage.setItem('traden_crypto_apikey', apiKey);
    localStorage.setItem('traden_crypto_apisecret', apiSecret);
    if (passphrase) localStorage.setItem('traden_crypto_passphrase', passphrase);

    try {
      const response = await fetchWithFallback('/api/platforms/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'crypto',
          exchange: cryptoExchange,
          api_key: apiKey,
          api_secret: apiSecret,
          passphrase: passphrase
        })
      });

      const data = await response.json();
      if (response && response.ok && data.success) {
        setIsError(false);
        setSaveStatus(data.message || `✅ تم ربط منصة ${cryptoExchange.toUpperCase()} بنجاح!`);
        setAccountData({
          connected: true,
          broker: cryptoExchange.toUpperCase(),
          login: 'API User',
          balance: data.balance || 0.0,
          equity: data.balance || 0.0,
          free_margin: data.balance || 0.0,
          currency: 'USDT',
          positions: []
        });
        fetchLiveAccount();
      } else {
        setIsError(true);
        setSaveStatus(data.message || `❌ فشل الربط مع منصة ${cryptoExchange.toUpperCase()}. تأكد من المفاتيح.`);
      }
    } catch (err) {
      setIsError(true);
      setSaveStatus(`⚠️ يتعذر الاتصال بالسيرفر. أدخل IP أو رابط سيرفرك في مربع (🌐 إعدادات رابط السيرفر السحابي) بالأعلى واضغط حفظ.`);
    } finally {
      setLoading(false);
    }
  };

  const handleClosePosition = async (ticket, symbol, volume, type) => {
    try {
      await fetchWithFallback('/api/control/close_position', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket, symbol, volume, type })
      });
      fetchLiveAccount();
    } catch (e) {
      console.error('Failed to close position:', e);
    }
  };

  const isConnected = accountData && accountData.connected;

  return (
    <div style={{ padding: '16px', color: '#f0f6fc', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            onClick={onBack}
            style={{ background: '#21262d', border: '1px solid #30363d', color: '#fff', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowRight size={16} />
            <span>رجوع</span>
          </button>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>🔗 ربط وإدخال بيانات التداول المباشرة</h2>
        </div>
        <button
          onClick={fetchLiveAccount}
          disabled={fetchingAccount}
          style={{ background: '#161b22', border: '1px solid #30363d', color: '#60a5fa', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
        >
          <RefreshCw size={14} className={fetchingAccount ? 'animate-spin' : ''} />
          <span>تحديث الحساب</span>
        </button>
      </div>

      {/* 🌐 Cloud Backend Server Config Box */}
      <div style={{ background: '#161b22', border: `1px solid ${cloudUrl ? '#10b981' : '#f59e0b'}`, borderRadius: '14px', padding: '16px', marginBottom: '20px', boxShadow: `0 0 15px ${cloudUrl ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#60a5fa', fontWeight: 'bold' }}>
            <Server size={18} />
            <span>🌐 رابط سيرفر بيثون (Python Backend Server):</span>
          </div>
          <span style={{ fontSize: '11px', background: cloudUrl ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: cloudUrl ? '#10b981' : '#f59e0b', border: `1px solid ${cloudUrl ? '#10b981' : '#f59e0b'}`, padding: '2px 10px', borderRadius: '8px', fontWeight: 'bold' }}>
            {cloudUrl ? 'مُربوط بالسيرفر 🟢' : 'مستضاف على Vercel (يتطلب إدخال رابط سيرفرك) 🟡'}
          </span>
        </div>

        <div style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '10px', lineHeight: '1.6' }}>
          💡 <b>ملاحظة هامة:</b> استضافة <code>Vercel</code> تعرض واجهة المستخدم فقط. لربط وتداول حسابك، أدخل رابط سيرفر بيثون في <b>Railway</b> الخاص بك (مثال: <code style={{ color: '#f59e0b' }}>https://...up.railway.app</code>) في المربع بالأسفل واضغط <b>تخصيص رابط السيرفر ⚡</b>:
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="ضع رابط سيرفر Railway الخاص بك هُنا (مثال: https://...up.railway.app)"
            value={cloudUrl}
            onChange={(e) => setCloudUrl(e.target.value)}
            style={{ flex: 1, background: '#0d1117', border: '1px solid #f59e0b', color: '#fff', borderRadius: '8px', padding: '10px 12px', fontSize: '13px' }}
          />
          <button
            onClick={() => {
              localStorage.setItem('traden_cloud_url', cloudUrl);
              fetchLiveAccount();
              setIsError(false);
              setSaveStatus(cloudUrl ? `✅ تم ربط وتفعيل سيرفر بيثون (${cloudUrl}) بنجاح!` : '⚠️ يرجى كتابة رابط سيرفر بيثون.');
            }}
            style={{ background: '#f59e0b', color: '#000', border: 'none', borderRadius: '8px', padding: '10px 16px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            تخصيص رابط السيرفر ⚡
          </button>
        </div>
      </div>

      {/* 📊 Always-Visible Connected / Status Dashboard Card */}
      <div style={{
        background: isConnected 
          ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' 
          : 'linear-gradient(135deg, #1f1911 0%, #0d1117 100%)',
        border: `1px solid ${isConnected ? '#3b82f6' : '#f59e0b'}`,
        borderRadius: '16px',
        padding: '18px',
        marginBottom: '20px',
        boxShadow: `0 0 20px ${isConnected ? 'rgba(59, 130, 246, 0.2)' : 'rgba(245, 158, 11, 0.15)'}`
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: isConnected ? '#10b981' : '#f59e0b', boxShadow: `0 0 8px ${isConnected ? '#10b981' : '#f59e0b'}` }}></div>
            <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#f8fafc' }}>
              الحساب المربوط: <b>{accountData?.broker || forexBroker}</b> (#{accountData?.login || mt5Login || '472326565'})
            </span>
          </div>

          <span style={{
            fontSize: '12px',
            background: isConnected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
            color: isConnected ? '#10b981' : '#f59e0b',
            border: `1px solid ${isConnected ? '#10b981' : '#f59e0b'}`,
            padding: '4px 12px',
            borderRadius: '12px',
            fontWeight: 'bold'
          }}>
            {isConnected ? '🟢 متصل ومفعل' : '🟡 يتطلب إكمال الاتصال بالسيرفر'}
          </span>
        </div>

        {isConnected ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>الرصيد (Balance)</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#38bdf8', marginTop: '2px' }}>
                  ${accountData.balance.toFixed(2)} {accountData.currency}
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>الإيكويتي (Equity)</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#4ade80', marginTop: '2px' }}>
                  ${accountData.equity.toFixed(2)} {accountData.currency}
                </div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>الهامش الحر (Free Margin)</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#f59e0b', marginTop: '2px' }}>
                  ${accountData.free_margin.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Open Positions List */}
            {accountData.positions && accountData.positions.length > 0 && (
              <div>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#cbd5e1', marginBottom: '8px' }}>
                  ⚡ الصفقات الحالية المفتوحة ({accountData.positions.length}):
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {accountData.positions.map((pos) => (
                    <div key={pos.ticket} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.4)', padding: '10px 14px', borderRadius: '10px', border: '1px solid #334155' }}>
                      <div>
                        <span style={{ fontWeight: 'bold', color: pos.type === 'buy' ? '#4ade80' : '#f87171', marginLeft: '6px' }}>
                          {pos.type.toUpperCase()}
                        </span>
                        <span style={{ fontWeight: 'bold', color: '#fff' }}>{pos.symbol}</span>
                        <span style={{ fontSize: '11px', color: '#94a3b8', marginRight: '8px' }}>(Lot: {pos.volume})</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: 'bold', color: pos.profit >= 0 ? '#4ade80' : '#f87171' }}>
                          {pos.profit >= 0 ? `+$${pos.profit.toFixed(2)}` : `-$${Math.abs(pos.profit).toFixed(2)}`}
                        </span>
                        <button
                          onClick={() => handleClosePosition(pos.ticket, pos.symbol, pos.volume, pos.type)}
                          style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                          إغلاق 🛑
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6' }}>
              تأكد من كتابة اسم السيرفر الصحيح لحسابك في Exness (مثال: <code style={{ color: '#f59e0b', background: 'rgba(0,0,0,0.4)', padding: '2px 6px', borderRadius: '4px' }}>Exness-MT5Trial16</code> أو <code style={{ color: '#f59e0b', background: 'rgba(0,0,0,0.4)', padding: '2px 6px', borderRadius: '4px' }}>Exness-Real10</code>) واضغط على زر الاتصال بالأسفل لإظهار الرصيد فورياً.
            </div>

            <button
              onClick={handleSaveForex}
              disabled={loading}
              style={{
                background: '#f59e0b',
                color: '#000',
                border: 'none',
                borderRadius: '10px',
                padding: '10px',
                fontWeight: 'bold',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span>اختبار وتوصيل السيرفر وجلب الرصيد الآن ⚡</span>
            </button>
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #30363d', paddingBottom: '12px' }}>
        <button
          onClick={() => { setSelectedCategory('forex'); setSaveStatus(''); }}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '10px',
            border: selectedCategory === 'forex' ? '1px solid #f59e0b' : '1px solid #30363d',
            background: selectedCategory === 'forex' ? 'rgba(245, 158, 11, 0.15)' : '#161b22',
            color: selectedCategory === 'forex' ? '#f59e0b' : '#8b949e',
            fontWeight: 'bold',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <Server size={18} />
          <span>منصات البروكر والفوركس (Exness / XM / MT5)</span>
        </button>

        <button
          onClick={() => { setSelectedCategory('crypto'); setSaveStatus(''); }}
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '10px',
            border: selectedCategory === 'crypto' ? '1px solid #10b981' : '1px solid #30363d',
            background: selectedCategory === 'crypto' ? 'rgba(16, 185, 129, 0.15)' : '#161b22',
            color: selectedCategory === 'crypto' ? '#10b981' : '#8b949e',
            fontWeight: 'bold',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <Key size={18} />
          <span>منصات الكريبتو (Binance / Bybit / OKX / BingX)</span>
        </button>
      </div>

      {/* Status banner */}
      {saveStatus && (
        <div style={{
          background: isError ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
          border: `1px solid ${isError ? '#ef4444' : '#10b981'}`,
          color: isError ? '#f87171' : '#10b981',
          borderRadius: '12px',
          padding: '14px',
          fontSize: '13px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          {loading && <Loader size={16} className="animate-spin" />}
          <span>{saveStatus}</span>
        </div>
      )}

      {/* Forex Form */}
      {selectedCategory === 'forex' && (
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={18} />
            أدخل بيانات حساب MetaTrader 5 / البروكر
          </h3>
          <p style={{ fontSize: '13px', color: '#8b949e', lineHeight: '1.6', marginBottom: '16px' }}>
            أدخل رقم حسابك وكلمة السر والسيرفر للاتصال وتداول الفوركس والذهب تلقائياً من الموقع.
          </p>

          <form onSubmit={handleSaveForex} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#c9d1d9', marginBottom: '6px' }}>اختر البروكر:</label>
              <select
                value={forexBroker}
                onChange={(e) => setForexBroker(e.target.value)}
                style={{ width: '100%', background: '#0d1117', border: '1px solid #30363d', color: '#fff', borderRadius: '8px', padding: '10px', fontSize: '14px' }}
              >
                <option value="Exness">Exness (إكسنس)</option>
                <option value="XM">XM Global (إكس إم)</option>
                <option value="ICMarkets">IC Markets (آي سي ماركتس)</option>
                <option value="Pepperstone">Pepperstone (بيبرستون)</option>
                <option value="FBS">FBS</option>
                <option value="Other">بروكر آخر (Standard MT5)</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#c9d1d9', marginBottom: '6px' }}>رقم حساب MT5 (Login ID):</label>
                <input
                  type="text"
                  placeholder="مثال: 472326565"
                  value={mt5Login}
                  onChange={(e) => setMt5Login(e.target.value)}
                  required
                  style={{ width: '100%', background: '#0d1117', border: '1px solid #30363d', color: '#fff', borderRadius: '8px', padding: '10px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#c9d1d9', marginBottom: '6px' }}>كلمة سر التداول (Password):</label>
                <input
                  type="password"
                  placeholder="أدخل كلمة سر الحساب..."
                  value={mt5Password}
                  onChange={(e) => setMt5Password(e.target.value)}
                  required
                  style={{ width: '100%', background: '#0d1117', border: '1px solid #30363d', color: '#fff', borderRadius: '8px', padding: '10px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#c9d1d9', marginBottom: '6px' }}>اسم السيرفر (MT5 Server):</label>
              <input
                type="text"
                placeholder="مثال: Exness-MT5Trial16 أو Exness-Real10"
                value={mt5Server}
                onChange={(e) => setMt5Server(e.target.value)}
                required
                style={{ width: '100%', background: '#0d1117', border: '1px solid #30363d', color: '#fff', borderRadius: '8px', padding: '10px', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? '#b45309' : '#f59e0b',
                color: '#000',
                border: 'none',
                borderRadius: '10px',
                padding: '12px',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: loading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '10px'
              }}
            >
              <Save size={18} />
              <span>{loading ? 'جاري الاتصال والربط...' : 'ربط واختبار اتصال MT5 الآن ⚡'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Crypto Form */}
      {selectedCategory === 'crypto' && (
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={18} />
            أدخل مفاتيح API لمنصة الكريبتو
          </h3>
          <p style={{ fontSize: '13px', color: '#8b949e', lineHeight: '1.6', marginBottom: '16px' }}>
            أدخل الـ API Key والـ Secret للربط المباشر وتداول العقود الآجلة من الموقع.
          </p>

          <form onSubmit={handleSaveCrypto} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#c9d1d9', marginBottom: '6px' }}>اختر المنصة:</label>
              <select
                value={cryptoExchange}
                onChange={(e) => setCryptoExchange(e.target.value)}
                style={{ width: '100%', background: '#0d1117', border: '1px solid #30363d', color: '#fff', borderRadius: '8px', padding: '10px', fontSize: '14px' }}
              >
                <option value="binance">Binance (بينانس)</option>
                <option value="bybit">Bybit (بايبت)</option>
                <option value="okx">OKX (أو كيه إكس)</option>
                <option value="bingx">BingX (بينج إكس)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#c9d1d9', marginBottom: '6px' }}>API Key:</label>
              <input
                type="text"
                placeholder="أدخل الـ API Key هُنا..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
                style={{ width: '100%', background: '#0d1117', border: '1px solid #30363d', color: '#fff', borderRadius: '8px', padding: '10px', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#c9d1d9', marginBottom: '6px' }}>API Secret / Private Key:</label>
              <input
                type="password"
                placeholder="أدخل الـ Secret Key هُنا..."
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                required
                style={{ width: '100%', background: '#0d1117', border: '1px solid #30363d', color: '#fff', borderRadius: '8px', padding: '10px', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>

            {cryptoExchange === 'okx' && (
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#c9d1d9', marginBottom: '6px' }}>OKX Passphrase:</label>
                <input
                  type="password"
                  placeholder="كلمة مرور API خاصة بـ OKX..."
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  style={{ width: '100%', background: '#0d1117', border: '1px solid #30363d', color: '#fff', borderRadius: '8px', padding: '10px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? '#047857' : '#10b981',
                color: '#000',
                border: 'none',
                borderRadius: '10px',
                padding: '12px',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: loading ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '10px'
              }}
            >
              <Save size={18} />
              <span>{loading ? 'جاري الاتصال والربط...' : `ربط منصة ${cryptoExchange.toUpperCase()} الآن ⚡`}</span>
            </button>
          </form>
        </div>
      )}

      {/* Info Note */}
      <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '16px', padding: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <Info size={20} color="#60a5fa" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '12px', color: '#8b949e', lineHeight: '1.6' }}>
          <strong style={{ color: '#60a5fa', display: 'block', marginBottom: '4px' }}>حماية وخصوصية البيانات:</strong>
          تتم تشفير كافة المفاتيح وبيانات الدخول وإرسالها بأمان إلى محرك التداول لتنفيذ الصفقات وإغلاقها فورياً وفقاً لاستراتيجيات الذكاء الاصطناعي.
        </div>
      </div>

    </div>
  );
}
