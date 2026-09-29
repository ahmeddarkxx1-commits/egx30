import React, { useState, useEffect } from 'react';
import { ChevronRight, Zap, TrendingUp, ShieldAlert, Award, DollarSign } from 'lucide-react';
import { egxStocksList, analyzeEgxStockWithGlobalMacro } from '../utils/egxFetcher';
import TradingViewWidget from './TradingViewWidget';

export default function EgxAnalysis({ onBack }) {
  const [selectedStock, setSelectedStock] = useState(egxStocksList[0]);
  const [capitalEgp, setCapitalEgp] = useState(50000);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

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
            <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              🇪🇬 البورصة المصرية (EGX 30)
            </h2>
            <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 'bold' }}>
              تحليل مدمج: محلي + عالمي + سلع + GDRs 🌐
            </div>
          </div>
        </div>
        <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid #f59e0b', color: '#f59e0b', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
          مباشر EGX ⚡
        </div>
      </div>

      {/* Stock Selection Pills */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '0.8rem', color: '#8b949e', marginBottom: '8px', fontWeight: 'bold' }}>
          اختر السهم للتحليل المدمج:
        </div>
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
          {egxStocksList.map((stock) => (
            <button
              key={stock.code}
              onClick={() => { setSelectedStock(stock); setAnalysisResult(null); }}
              style={{
                background: selectedStock.code === stock.code ? '#f59e0b' : 'rgba(255,255,255,0.04)',
                color: selectedStock.code === stock.code ? '#000' : '#fff',
                border: selectedStock.code === stock.code ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '6px 12px',
                fontSize: '0.78rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
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
          <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#f59e0b' }}>
            {selectedStock.icon} {selectedStock.name} ({selectedStock.code})
          </div>
          <div style={{ fontSize: '0.75rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>
            القطاع: {selectedStock.sector}
          </div>
        </div>
        <div style={{ fontSize: '0.8rem', color: '#9ca3af', lineHeight: '1.4' }}>
          {selectedStock.description}
        </div>
        {selectedStock.gdrCorrelated && (
          <div style={{ fontSize: '0.75rem', color: '#7ee787', marginTop: '6px', fontWeight: 'bold' }}>
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
        <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#10b981', marginBottom: '8px' }}>
          💰 أدخل قيمة رأس مالك بالجنيه المصري (EGP) لحساب عدد الأسهم والأرباح:
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
              fontSize: '0.9rem',
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
          fontSize: '1rem',
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
        {loading ? '⚡ جاري ربط أبعاد السوق العالمي والسلع بالسهم...' : `🤖 تحليل Traden الشامل لسهم (${selectedStock.code})`}
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
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#f59e0b' }}>
                {analysisResult.icon} {analysisResult.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                كود السهم: {analysisResult.code} | {analysisResult.sector}
              </div>
            </div>
            <div style={{ background: analysisResult.signalColor, color: '#000', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>
              السكور: {analysisResult.score}
            </div>
          </div>

          {/* Grid Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.82rem', marginBottom: '14px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '8px' }}>
              <div style={{ color: '#9ca3af', fontSize: '0.72rem' }}>التوصية والإشارة</div>
              <div style={{ fontWeight: 'bold', color: analysisResult.signalColor, fontSize: '0.9rem' }}>{analysisResult.signal}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '8px' }}>
              <div style={{ color: '#9ca3af', fontSize: '0.72rem' }}>نطاق سعر الدخول</div>
              <div style={{ fontWeight: 'bold', color: '#38bdf8' }}>{analysisResult.entry}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '8px' }}>
              <div style={{ color: '#9ca3af', fontSize: '0.72rem' }}>الهدف الأول (TP1)</div>
              <div style={{ fontWeight: 'bold', color: '#4ade80' }}>{analysisResult.tp1}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '8px' }}>
              <div style={{ color: '#9ca3af', fontSize: '0.72rem' }}>وقف الخسارة (SL)</div>
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
            <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#10b981', marginBottom: '6px' }}>
              🛡️ إدارة المحفظة وعدد الأسهم لرأس مالك ({Number(analysisResult.capitalEgp).toLocaleString()} ج.م):
            </div>
            <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: '1.6' }}>
              • <b>عدد الأسهم الموصى بشرائها:</b> <span style={{ color: '#7ee787', fontWeight: 'bold' }}>{Number(analysisResult.recommendedShares).toLocaleString()} سهم</span><br/>
              • <b>قيمة السيولة المستثمرة بالصفقة:</b> <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{Number(analysisResult.totalInvestmentAmount).toLocaleString()} ج.م</span><br/>
              • <b>أقصى خسارة محسوبة عند SL:</b> <span style={{ color: '#f87171', fontWeight: 'bold' }}>-{Number(analysisResult.maxRiskAmount).toLocaleString()} ج.م</span> (مخاطرة آمنة 5%)<br/>
              • <b>الربح المتوقع بالجنيه عند TP1:</b> <span style={{ color: '#4ade80', fontWeight: 'bold' }}>+{Number(analysisResult.expectedProfitTp1).toLocaleString()} ج.م</span> (+8.5%)<br/>
              • <b>الربح المتوقع بالجنيه عند TP2:</b> <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>+{Number(analysisResult.expectedProfitTp2).toLocaleString()} ج.م</span> (+16.8%)
            </div>
          </div>

          {/* Full Multi-Dimensional AI Report */}
          <div style={{
            fontSize: '0.8rem',
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

      {/* Chart Box */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '10px' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#f59e0b', marginBottom: '8px' }}>
          📈 المخطط التفاعلي للسلع والملاذات المتقاطعة مع السهم:
        </div>
        <TradingViewWidget symbol={selectedStock.code === 'COMI' ? 'OANDA:XAUUSD' : selectedStock.code === 'AMOC' ? 'TVC:USOIL' : 'BINANCE:BTCUSDT'} height={400} timeframe="1d" />
      </div>
    </div>
  );
}
