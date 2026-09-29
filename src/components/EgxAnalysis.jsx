import React, { useState, useEffect } from 'react';
import { ChevronRight, Search, Zap, TrendingUp, ShieldAlert, Award, DollarSign } from 'lucide-react';
import { egxCategories, egxStocksList, analyzeEgxStockWithGlobalMacro } from '../utils/egxFetcher';
import TradingViewWidget from './TradingViewWidget';

export default function EgxAnalysis({ onBack }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedStock, setSelectedStock] = useState(egxStocksList[0]);
  const [chartSymbol, setChartSymbol] = useState(egxStocksList[0].tvSymbol);
  const [capitalEgp, setCapitalEgp] = useState(50000);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Filtered stocks based on category & search
  const filteredStocks = egxStocksList.filter(s => {
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesSearch = s.code.toLowerCase().includes(search.toLowerCase()) ||
                          s.name.toLowerCase().includes(search.toLowerCase()) ||
                          s.sector.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sync chart symbol when selectedStock changes
  useEffect(() => {
    setChartSymbol(selectedStock.tvSymbol || `EGX:${selectedStock.code}`);
  }, [selectedStock]);

  const handleAnalyze = async () => {
    setLoading(true);
    setAnalysisResult(null);

    if (window.Telegram?.WebApp?.HapticFeedback) {
      try {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
      } catch (err) {
        console.log('Haptic err:', err);
      }
    }

    const res = await analyzeEgxStockWithGlobalMacro(selectedStock.code, capitalEgp);

    setTimeout(() => {
      setLoading(false);
      setAnalysisResult(res);
    }, 400);
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #06080d 0%, #0d1117 100%)',
      minHeight: '100vh',
      color: '#c9d1d9',
      padding: '16px 12px',
      direction: 'rtl',
      fontFamily: 'Cairo, sans-serif'
    }}>
      {/* Back & Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            onClick={onBack} 
            style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
          >
            <ChevronRight size={24} />
          </button>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              🇪🇬 أسهم ثندر والبورصة المصرية (EGX)
            </h2>
            <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 'bold' }}>
              ذهب + فضة + أسهم ثندر + تحليل عالمي مدمج 🌐
            </div>
          </div>
        </div>
        <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid #f59e0b', color: '#f59e0b', padding: '4px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 'bold' }}>
          تأكيد ثندر ⚡
        </div>
      </div>

      {/* Category Selection Tabs */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '6px', marginBottom: '10px' }}>
        {egxCategories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            style={{
              background: selectedCategory === cat.id ? '#f59e0b' : 'rgba(255,255,255,0.05)',
              color: selectedCategory === cat.id ? '#000' : '#fff',
              border: selectedCategory === cat.id ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '5px 12px',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: '12px' }}>
        <Search size={16} color="#9ca3af" style={{ position: 'absolute', right: '10px', top: '10px' }} />
        <input 
          type="text" 
          placeholder="ابحث عن أصل على ثندر (مثال: الذهب, فوري FAWR, CIB, أموك, حديد عز)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ 
            width: '100%', 
            padding: '8px 34px 8px 10px', 
            borderRadius: '8px', 
            background: 'rgba(255,255,255,0.05)', 
            border: '1px solid rgba(255,255,255,0.1)', 
            color: '#fff',
            outline: 'none',
            fontSize: '0.8rem'
          }} 
        />
      </div>

      {/* Stock Selection Pills Grid */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '140px', overflowY: 'auto', paddingRight: '2px' }}>
          {filteredStocks.map((stock) => (
            <button
              key={stock.code}
              onClick={() => { setSelectedStock(stock); setAnalysisResult(null); }}
              style={{
                background: selectedStock.code === stock.code ? '#f59e0b' : (stock.code === 'AZG' || stock.code === 'SILVER_EGP' ? 'rgba(241, 224, 90, 0.15)' : 'rgba(255,255,255,0.04)'),
                color: selectedStock.code === stock.code ? '#000' : (stock.code === 'AZG' || stock.code === 'SILVER_EGP' ? '#f1e05a' : '#fff'),
                border: selectedStock.code === stock.code ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '6px 10px',
                fontSize: '0.78rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>{stock.icon}</span>
              <span>{stock.code}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Stock Summary Header */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: '12px',
        padding: '12px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#f59e0b' }}>
            {selectedStock.icon} {selectedStock.name} ({selectedStock.code})
          </div>
          <div style={{ fontSize: '0.72rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>
            القطاع: {selectedStock.sector}
          </div>
        </div>
        <div style={{ fontSize: '0.78rem', color: '#9ca3af', lineHeight: '1.4' }}>
          {selectedStock.description}
        </div>
        {selectedStock.gdrCorrelated && (
          <div style={{ fontSize: '0.72rem', color: '#7ee787', marginTop: '6px', fontWeight: 'bold' }}>
            🔗 يمتلك شهادات إيداع دولية ببورصة لندن: ({selectedStock.gdrSymbol})
          </div>
        )}
      </div>

      {/* Capital Input Box in EGP */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '12px',
        padding: '12px',
        marginBottom: '16px'
      }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: '#10b981', marginBottom: '8px' }}>
          💰 أدخل قيمة رأس مالك بالجنيه المصري (EGP) لحساب الكمية والأرباح:
        </div>

        {/* Quick EGP Chips */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', overflowX: 'auto' }}>
          {[10000, 25000, 50000, 100000, 250000, 500000].map(amt => (
            <button
              key={amt}
              onClick={() => setCapitalEgp(amt)}
              style={{
                background: capitalEgp === amt ? '#10b981' : 'rgba(255,255,255,0.05)',
                color: capitalEgp === amt ? '#000' : '#9ca3af',
                border: capitalEgp === amt ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '4px 10px',
                fontSize: '0.72rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {amt.toLocaleString()} ج.م
            </button>
          ))}
        </div>

        {/* Custom Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px 12px' }}>
          <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '0.85rem' }}>ج.م</span>
          <input
            type="number"
            value={capitalEgp}
            onChange={(e) => setCapitalEgp(e.target.value)}
            placeholder="أدخل رأس مالك المخصص بالجنيه..."
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '0.88rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={loading}
        style={{
          width: '100%',
          background: loading ? '#b45309' : 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
          color: '#000',
          padding: '14px',
          borderRadius: '12px',
          fontWeight: 'bold',
          fontSize: '0.98rem',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '20px'
        }}
      >
        {loading ? '⚡ جاري ربط أبعاد السوق العالمي والسلع بالأصل...' : `🤖 تحليل Traden الشامل لـ (${selectedStock.code})`}
      </button>

      {/* Analysis Output */}
      {analysisResult && (
        <div style={{
          background: 'rgba(22, 27, 34, 0.95)',
          border: `1px solid ${analysisResult.signalColor}`,
          borderRadius: '14px',
          padding: '16px',
          boxShadow: `0 0 25px ${analysisResult.signalColor}30`,
          marginBottom: '24px'
        }}>
          {/* Header Result */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 'bold', color: '#f59e0b' }}>
                {analysisResult.icon} {analysisResult.name}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                الكود: {analysisResult.code} | {analysisResult.sector}
              </div>
            </div>
            <div style={{ background: analysisResult.signalColor, color: '#000', padding: '4px 10px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 'bold' }}>
              السكور: {analysisResult.score}
            </div>
          </div>

          {/* Grid Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem', marginBottom: '14px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '8px' }}>
              <div style={{ color: '#9ca3af', fontSize: '0.7rem' }}>التوصية والإشارة</div>
              <div style={{ fontWeight: 'bold', color: analysisResult.signalColor, fontSize: '0.88rem' }}>{analysisResult.signal}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '8px' }}>
              <div style={{ color: '#9ca3af', fontSize: '0.7rem' }}>نطاق الدخول الشامل</div>
              <div style={{ fontWeight: 'bold', color: '#38bdf8' }}>{analysisResult.entry}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '8px' }}>
              <div style={{ color: '#9ca3af', fontSize: '0.7rem' }}>الهدف الأول (TP1)</div>
              <div style={{ fontWeight: 'bold', color: '#4ade80' }}>{analysisResult.tp1}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '8px' }}>
              <div style={{ color: '#9ca3af', fontSize: '0.7rem' }}>وقف الخسارة (SL)</div>
              <div style={{ fontWeight: 'bold', color: '#f87171' }}>{analysisResult.sl}</div>
            </div>
          </div>

          {/* Capital Distribution Breakdown */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '10px',
            padding: '12px',
            marginBottom: '14px'
          }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: '#10b981', marginBottom: '6px' }}>
              🛡️ إدارة المحفظة والكميات لرأس مالك ({Number(analysisResult.capitalEgp).toLocaleString()} ج.م):
            </div>
            <div style={{ fontSize: '0.76rem', color: '#cbd5e1', lineHeight: '1.6' }}>
              • <b>الكمية الموصى بشرائها:</b> <span style={{ color: '#7ee787', fontWeight: 'bold' }}>{Number(analysisResult.recommendedShares).toLocaleString()} {analysisResult.code === 'AZG' ? 'جرام ذهب 24' : analysisResult.code === 'SILVER_EGP' ? 'جرام فضة 999' : 'سهم'}</span><br/>
              • <b>قيمة السيولة المستثمرة بالصفقة:</b> <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{Number(analysisResult.totalInvestmentAmount).toLocaleString()} ج.م</span><br/>
              • <b>أقصى خسارة محسوبة عند SL:</b> <span style={{ color: '#f87171', fontWeight: 'bold' }}>-{Number(analysisResult.maxRiskAmount).toLocaleString()} ج.م</span> (مخاطرة آمنة 5%)<br/>
              • <b>الربح المتوقع بالجنيه عند TP1:</b> <span style={{ color: '#4ade80', fontWeight: 'bold' }}>+{Number(analysisResult.expectedProfitTp1).toLocaleString()} ج.م</span> (+8.5%)<br/>
              • <b>الربح المتوقع بالجنيه عند TP2:</b> <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>+{Number(analysisResult.expectedProfitTp2).toLocaleString()} ج.م</span> (+16.8%)
            </div>
          </div>

          {/* Full Multi-Dimensional AI Report */}
          <div style={{
            fontSize: '0.78rem',
            color: '#cbd5e1',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: '12px',
            lineHeight: '1.6',
            whiteSpace: 'pre-line'
          }}>
            {analysisResult.fullReport}
          </div>
        </div>
      )}

      {/* Dynamic Interactive Chart Box */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 'bold', color: '#f59e0b' }}>
              📈 مخطط الشارت المباشر ({selectedStock.code}):
            </span>
            <button
              onClick={() => {
                const url = `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(chartSymbol)}`;
                if (window.Telegram && window.Telegram.WebApp && typeof window.Telegram.WebApp.openLink === 'function') {
                  window.Telegram.WebApp.openLink(url);
                } else {
                  window.open(url, '_blank', 'noopener,noreferrer');
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#60a5fa',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                borderRadius: '6px',
                padding: '3px 8px',
                fontSize: '0.72rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="فتح الشارت في متصفح TradingView للشاشة الكبيرة"
            >
              <span>🖥️ فتح في TradingView ↗</span>
            </button>
          </div>

          {/* Chart Switcher Buttons */}
          <div style={{ display: 'flex', gap: '4px', overflowX: 'auto' }}>
            <button
              onClick={() => setChartSymbol(selectedStock.tvSymbol || `EGX:${selectedStock.code}`)}
              style={{
                background: chartSymbol === (selectedStock.tvSymbol || `EGX:${selectedStock.code}`) ? '#f59e0b' : 'rgba(255,255,255,0.05)',
                color: chartSymbol === (selectedStock.tvSymbol || `EGX:${selectedStock.code}`) ? '#000' : '#9ca3af',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '0.72rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              🇪🇬 {selectedStock.code}
            </button>
            <button
              onClick={() => setChartSymbol('OANDA:XAUUSD')}
              style={{
                background: chartSymbol === 'OANDA:XAUUSD' ? '#f59e0b' : 'rgba(255,255,255,0.05)',
                color: chartSymbol === 'OANDA:XAUUSD' ? '#000' : '#9ca3af',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '0.72rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              🥇 الذهب
            </button>
            <button
              onClick={() => setChartSymbol('TVC:USOIL')}
              style={{
                background: chartSymbol === 'TVC:USOIL' ? '#f59e0b' : 'rgba(255,255,255,0.05)',
                color: chartSymbol === 'TVC:USOIL' ? '#000' : '#9ca3af',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '0.72rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              🛢️ النفط
            </button>
          </div>
        </div>

        <TradingViewWidget symbol={chartSymbol} height={400} timeframe="1d" />
      </div>
    </div>
  );
}
