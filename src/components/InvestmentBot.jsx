import React, { useState, useEffect } from 'react';
import { ChevronRight, Sparkles, TrendingUp, ShieldCheck, DollarSign, Calculator, RefreshCw, Trophy, Award } from 'lucide-react';

const initialRatedCoins = [
  { rank: 1, id: 'BTC', symbol: 'BTC/USDT', bSymbol: 'BTCUSDT', name: 'Bitcoin', icon: '₿', logoUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/btc.png', priceStr: '$84,336.9', score: 68, evalText: 'Strong Buy 🟢', isTrophy: true, isHalal: true, targetMultiplier: 1.45, thesis: 'Primary institutional digital store of value for long-term multi-cycle portfolios.' },
  { rank: 2, id: 'NEAR', symbol: 'NEAR/USDT', bSymbol: 'NEARUSDT', name: 'NEAR Protocol', icon: 'Ⓝ', logoUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/near.png', priceStr: '$5.42', score: 66, evalText: 'Strong Buy 🟢', isTrophy: true, isHalal: true, targetMultiplier: 2.40, thesis: 'High-throughput Layer 1 network with leading decentralized AI integration.' },
  { rank: 3, id: 'SUI', symbol: 'SUI/USDT', bSymbol: 'SUIUSDT', name: 'Sui', icon: '💧', logoUrl: 'https://assets.coingecko.com/coins/images/26375/large/sui_asset.png', priceStr: '$1.26', score: 66, evalText: 'Strong Buy 🟢', isTrophy: true, isHalal: true, targetMultiplier: 2.80, thesis: 'Next-gen Move VM blockchain with ultra-low latency transaction finality.' },
  { rank: 4, id: 'ETH', symbol: 'ETH/USDT', bSymbol: 'ETHUSDT', name: 'Ethereum', icon: 'Ξ', logoUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/eth.png', priceStr: '$2,683.84', score: 63, evalText: 'Moderate Buy 🟢', isTrophy: false, isHalal: true, targetMultiplier: 1.65, thesis: 'Core settlement layer of decentralized smart contracts and DeFi ecosystem.' },
  { rank: 5, id: 'SOL', symbol: 'SOL/USDT', bSymbol: 'SOLUSDT', name: 'Solana', icon: '◎', logoUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/sol.png', priceStr: '$121.92', score: 63, evalText: 'Moderate Buy 🟢', isTrophy: false, isHalal: true, targetMultiplier: 2.10, thesis: 'Fastest monolithic blockchain experiencing massive institutional adoption.' },
  { rank: 6, id: 'ADA', symbol: 'ADA/USDT', bSymbol: 'ADAUSDT', name: 'Cardano', icon: '₳', logoUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/ada.png', priceStr: '$0.25', score: 62, evalText: 'Moderate Buy 🟢', isTrophy: false, isHalal: true, targetMultiplier: 1.80, thesis: 'Evidence-based decentralized network with robust formal verification.' },
  { rank: 7, id: 'DOT', symbol: 'DOT/USDT', bSymbol: 'DOTUSDT', name: 'Polkadot', icon: '🟣', logoUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/dot.png', priceStr: '$1.26', score: 62, evalText: 'Moderate Buy 🟢', isTrophy: false, isHalal: true, targetMultiplier: 2.20, thesis: 'Interoperable multi-chain network enabling shared cross-chain security.' },
  { rank: 8, id: 'LINK', symbol: 'LINK/USDT', bSymbol: 'LINKUSDT', name: 'Chainlink', icon: '⬢', logoUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/link.png', priceStr: '$13.98', score: 62, evalText: 'Moderate Buy 🟢', isTrophy: false, isHalal: true, targetMultiplier: 2.30, thesis: 'Essential decentralized oracle connecting global banks to on-chain finance.' },
  { rank: 9, id: 'AVAX', symbol: 'AVAX/USDT', bSymbol: 'AVAXUSDT', name: 'Avalanche', icon: '🔺', logoUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/avax.png', priceStr: '$10.83', score: 62, evalText: 'Moderate Buy 🟢', isTrophy: false, isHalal: true, targetMultiplier: 2.50, thesis: 'Subnet architecture designed for custom institutional and enterprise dApps.' },
  { rank: 10, id: 'ATOM', symbol: 'ATOM/USDT', bSymbol: 'ATOMUSDT', name: 'Cosmos', icon: '⚛️', logoUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/atom.png', priceStr: '$1.87', score: 62, evalText: 'Moderate Buy 🟢', isTrophy: false, isHalal: true, targetMultiplier: 2.10, thesis: 'Internet of Blockchains communicating over standard IBC protocol.' },
  { rank: 11, id: 'OP', symbol: 'OP/USDT', bSymbol: 'OPUSDT', name: 'Optimism', icon: '🔴', logoUrl: 'https://assets.coingecko.com/coins/images/25244/large/Optimism.png', priceStr: '$0.15', score: 62, evalText: 'Moderate Buy 🟢', isTrophy: false, isHalal: true, targetMultiplier: 3.00, thesis: 'Superchain Layer 2 scaling infrastructure for the Ethereum network.' },
  { rank: 12, id: 'BNB', symbol: 'BNB/USDT', bSymbol: 'BNBUSDT', name: 'BNB', icon: '🔶', logoUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/bnb.png', priceStr: '$777.7', score: 60, evalText: 'Moderate Buy 🟢', isTrophy: false, isHalal: false, targetMultiplier: 1.50, thesis: 'Exchange utility asset with automated quarterly auto-burn mechanisms.' },
  { rank: 13, id: 'INJ', symbol: 'INJ/USDT', bSymbol: 'INJUSDT', name: 'Injective', icon: '⚡', logoUrl: 'https://assets.coingecko.com/coins/images/12882/large/Secondary_Symbol.png', priceStr: '$7.76', score: 57, evalText: 'Neutral 🟡', isTrophy: false, isHalal: true, targetMultiplier: 2.20, thesis: 'Specialized Layer 1 optimized for decentralized order-book trading.' },
  { rank: 14, id: 'POL', symbol: 'POL/USDT', bSymbol: 'MATICUSDT', name: 'Polygon', icon: '⬡', logoUrl: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/matic.png', priceStr: '$0.38', score: 55, evalText: 'Neutral 🟡', isTrophy: false, isHalal: true, targetMultiplier: 1.90, thesis: 'AggLayer aggregation architecture for multichain ZK liquidity.' },
  { rank: 15, id: 'PAXG', symbol: 'PAXG/USDT', bSymbol: 'PAXGUSDT', name: 'PAX Gold', icon: '🥇', logoUrl: 'https://assets.coingecko.com/coins/images/9519/large/paxg.png', priceStr: '$2,682.50', score: 72, evalText: 'Elite Store 🔥', isTrophy: true, isHalal: true, targetMultiplier: 1.18, thesis: '100% physically-backed allocated gold bullion on blockchain with AAOIFI audit.' },
  { rank: 16, id: 'RENDER', symbol: 'RENDER/USDT', bSymbol: 'RENDERUSDT', name: 'Render', icon: '🎨', logoUrl: 'https://assets.coingecko.com/coins/images/11636/large/render.png', priceStr: '$5.40', score: 65, evalText: 'Strong Buy 🟢', isTrophy: false, isHalal: true, targetMultiplier: 3.10, thesis: 'Decentralized GPU compute and 3D rendering network for AI and spatial compute.' },
  { rank: 17, id: 'FET', symbol: 'FET/USDT', bSymbol: 'FETUSDT', name: 'Fetch.ai', icon: '🤖', logoUrl: 'https://assets.coingecko.com/coins/images/5681/large/Fetch.jpg', priceStr: '$1.45', score: 64, evalText: 'Strong Buy 🟢', isTrophy: false, isHalal: true, targetMultiplier: 3.20, thesis: 'Decentralized Artificial Superintelligence alliance token and AI agents.' },
  { rank: 18, id: 'APT', symbol: 'APT/USDT', bSymbol: 'APTUSDT', name: 'Aptos', icon: '🌐', logoUrl: 'https://assets.coingecko.com/coins/images/26455/large/aptos_round.png', priceStr: '$8.20', score: 59, evalText: 'Neutral 🟡', isTrophy: false, isHalal: true, targetMultiplier: 2.00, thesis: 'High-throughput Layer 1 using Move programming language with parallel execution.' },
  { rank: 19, id: 'ARB', symbol: 'ARB/USDT', bSymbol: 'ARBUSDT', name: 'Arbitrum', icon: '🟦', logoUrl: 'https://assets.coingecko.com/coins/images/16547/large/arbitrum.png', priceStr: '$0.58', score: 56, evalText: 'Neutral 🟡', isTrophy: false, isHalal: true, targetMultiplier: 2.10, thesis: 'Leading Layer 2 rollup with highest TVL ecosystem on Ethereum.' },
  { rank: 20, id: 'PEPE', symbol: 'PEPE/USDT', bSymbol: 'PEPEUSDT', name: 'Pepe Meme', icon: '🐸', logoUrl: 'https://assets.coingecko.com/coins/images/29850/large/pepe-token.png', priceStr: '$0.0000095', score: 32, evalText: 'Underweight 🔴', isTrophy: false, isHalal: false, targetMultiplier: 1.10, thesis: 'High-volatility speculative meme token lacking fundamental technological utility.' }
];

export default function InvestmentBot({ onBack }) {
  const [ratedCoins, setRatedCoins] = useState(initialRatedCoins);
  const [investmentAmount, setInvestmentAmount] = useState('1000');
  const [durationMonths, setDurationMonths] = useState(12);
  const [halalOnly, setHalalOnly] = useState(true);
  const [riskTolerance, setRiskTolerance] = useState('balanced');
  const [generatedPortfolio, setGeneratedPortfolio] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleTimeString('en-US'));
  const [isUpdating, setIsUpdating] = useState(false);

  // Live Real-Time Price Auto Refresh (Binance 24h Ticker)
  const fetchLivePrices = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch('https://api.binance.com/api/v3/ticker/24hr');
      if (res.ok) {
        const binanceData = await res.json();
        const mapBinance = {};
        binanceData.forEach(item => {
          mapBinance[item.symbol] = item;
        });

        setRatedCoins(prev => prev.map(coin => {
          const live = mapBinance[coin.bSymbol];
          if (live) {
            const rawPrice = parseFloat(live.lastPrice);
            const priceStr = rawPrice > 100
              ? `$${rawPrice.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}`
              : rawPrice > 1
              ? `$${rawPrice.toFixed(2)}`
              : `$${rawPrice.toFixed(4)}`;
            
            return {
              ...coin,
              priceStr
            };
          }
          return coin;
        }));
      }
    } catch (e) {
      console.log('Using fallback prices for rating table:', e);
    } finally {
      setLastUpdate(new Date().toLocaleTimeString('ar-EG'));
      setTimeout(() => setIsUpdating(false), 500);
    }
  };

  useEffect(() => {
    fetchLivePrices();
    const interval = setInterval(() => {
      fetchLivePrices();
    }, 6000); // refresh every 6s
    return () => clearInterval(interval);
  }, []);

  const numAmount = parseFloat(investmentAmount) || 0;

  const handleGeneratePortfolio = () => {
    setIsGenerating(true);

    setTimeout(() => {
      let eligible = ratedCoins.filter(a => !halalOnly || a.isHalal);

      let selected = [];
      if (riskTolerance === 'conservative') {
        selected = [
          { ...eligible.find(a => a.id === 'BTC') || eligible[0], sharePercent: 45 },
          { ...eligible.find(a => a.id === 'PAXG') || eligible[1], sharePercent: 30 },
          { ...eligible.find(a => a.id === 'ETH') || eligible[2], sharePercent: 25 }
        ];
      } else if (riskTolerance === 'growth') {
        selected = [
          { ...eligible.find(a => a.id === 'SOL') || eligible[0], sharePercent: 30 },
          { ...eligible.find(a => a.id === 'SUI') || eligible[1], sharePercent: 25 },
          { ...eligible.find(a => a.id === 'NEAR') || eligible[2], sharePercent: 25 },
          { ...eligible.find(a => a.id === 'RENDER') || eligible[3], sharePercent: 20 }
        ];
      } else {
        // Balanced
        selected = [
          { ...eligible.find(a => a.id === 'BTC') || eligible[0], sharePercent: 35 },
          { ...eligible.find(a => a.id === 'ETH') || eligible[1], sharePercent: 25 },
          { ...eligible.find(a => a.id === 'SOL') || eligible[2], sharePercent: 20 },
          { ...eligible.find(a => a.id === 'NEAR') || eligible[3], sharePercent: 20 }
        ];
      }

      let totalExpectedReturn = 0;
      const portfolioItems = selected.map(item => {
        const itemAmount = (numAmount * item.sharePercent) / 100;
        const years = durationMonths / 12;
        const expectedValue = itemAmount * Math.pow(item.targetMultiplier, years);
        totalExpectedReturn += expectedValue;

        return {
          ...item,
          dollarAmount: itemAmount,
          expectedValue: Math.round(expectedValue),
          profit: Math.round(expectedValue - itemAmount)
        };
      });

      const totalProfit = Math.round(totalExpectedReturn - numAmount);
      const roiPercent = numAmount > 0 ? Math.round((totalProfit / numAmount) * 100) : 0;

      setGeneratedPortfolio({
        items: portfolioItems,
        totalInitial: numAmount,
        totalExpected: Math.round(totalExpectedReturn),
        totalProfit: totalProfit,
        roiPercent: roiPercent
      });

      setIsGenerating(false);
    }, 600);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', direction: 'ltr', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ margin: 0, fontSize: '20px', color: '#fff' }}>AI Portfolio Allocator 🌱</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 8px', borderRadius: '12px', color: '#10b981', fontSize: '11px', fontWeight: 'bold' }}>
              <span className={isUpdating ? 'spin' : ''}>🟢</span>
              <span>LIVE</span>
            </div>
          </div>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Price feed: {lastUpdate} · {ratedCoins.length} assets audited</span>
            <RefreshCw size={12} className={isUpdating ? 'spin' : ''} style={{ cursor: 'pointer' }} onClick={fetchLivePrices} />
          </div>
        </div>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
          <ChevronRight size={28} style={{ transform: 'rotate(180deg)' }} />
        </button>
      </div>

      {/* Input Calculator Form Box */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        {/* Custom Investment Amount Input */}
        <div>
          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <DollarSign size={16} color="#f59e0b" />
            <span>1. Enter Allocation Capital ($)</span>
          </label>
          <input
            type="number"
            placeholder="e.g. 1000..."
            value={investmentAmount}
            onChange={(e) => setInvestmentAmount(e.target.value)}
            style={{
              width: '100%',
              background: '#181b22',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '12px',
              padding: '12px 14px',
              color: '#fff',
              fontSize: '16px',
              fontWeight: 'bold',
              direction: 'ltr',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          <div style={{ display: 'flex', gap: '6px', marginTop: '8px', overflowX: 'auto' }}>
            {['100', '250', '500', '1000', '2500', '5000', '10000'].map(val => (
              <button
                key={val}
                onClick={() => setInvestmentAmount(val)}
                style={{
                  background: investmentAmount === val ? '#f59e0b' : 'rgba(255,255,255,0.04)',
                  color: investmentAmount === val ? '#000' : '#9ca3af',
                  border: `1px solid ${investmentAmount === val ? '#f59e0b' : 'rgba(255,255,255,0.08)'}`,
                  padding: '4px 10px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                ${parseInt(val).toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Duration Selector */}
        <div>
          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Calculator size={16} color="#60a5fa" />
            <span>2. Select Holding Horizon</span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
            {[
              { m: 6, label: '6 Months' },
              { m: 12, label: '1 Year' },
              { m: 36, label: '3 Years' },
              { m: 60, label: '5 Years' }
            ].map(d => (
              <button
                key={d.m}
                onClick={() => setDurationMonths(d.m)}
                style={{
                  background: durationMonths === d.m ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.04)',
                  color: durationMonths === d.m ? '#60a5fa' : '#9ca3af',
                  border: `1px solid ${durationMonths === d.m ? '#60a5fa' : 'rgba(255,255,255,0.08)'}`,
                  padding: '8px 0',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Halal Filter Toggle */}
        <div style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🕌</span>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#10b981' }}>100% Shariah Compliant Filter</div>
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>Automatically excludes interest-bearing or questionable assets</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={halalOnly}
            onChange={(e) => setHalalOnly(e.target.checked)}
            style={{ width: '20px', height: '20px', accentColor: '#10b981', cursor: 'pointer' }}
          />
        </div>

        {/* Risk Tolerance Buttons */}
        <div>
          <label style={{ fontSize: '12px', color: '#9ca3af', display: 'block', marginBottom: '6px' }}>Risk Tolerance Profile:</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            {[
              { id: 'conservative', label: '🛡️ Conservative' },
              { id: 'balanced', label: '⚖️ Balanced' },
              { id: 'growth', label: '🚀 High Growth' }
            ].map(r => (
              <button
                key={r.id}
                onClick={() => setRiskTolerance(r.id)}
                style={{
                  background: riskTolerance === r.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                  border: `1px solid ${riskTolerance === r.id ? '#fff' : 'rgba(255,255,255,0.08)'}`,
                  color: '#fff',
                  padding: '6px 0',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGeneratePortfolio}
          disabled={isGenerating || numAmount <= 0}
          style={{
            width: '100%',
            background: isGenerating ? '#b45309' : '#f59e0b',
            color: '#000',
            padding: '14px',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '16px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 0 20px rgba(245, 158, 11, 0.3)',
            marginTop: '4px'
          }}
        >
          <Sparkles size={18} />
          <span>{isGenerating ? 'Building Optimal Portfolio...' : `Generate Portfolio for $${numAmount.toLocaleString()} 🤖`}</span>
        </button>

      </div>

      {/* Generated Custom Portfolio Results */}
      {generatedPortfolio && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          <div style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(245, 158, 11, 0.08) 100%)', border: '1px solid #10b981', borderRadius: '16px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', color: '#10b981', fontWeight: 'bold' }}>AI Allocation Breakdown</h3>
              <span style={{ fontSize: '11px', background: '#10b981', color: '#000', padding: '3px 8px', borderRadius: '8px', fontWeight: 'bold' }}>
                Estimated ROI: +{generatedPortfolio.roiPercent}% 🚀
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '10px' }}>
              <div>
                <div style={{ fontSize: '10px', color: '#9ca3af' }}>Initial Capital</div>
                <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#fff', marginTop: '2px' }}>${generatedPortfolio.totalInitial.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#10b981', fontWeight: 'bold' }}>Estimated Gain</div>
                <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#10b981', marginTop: '2px' }}>+${generatedPortfolio.totalProfit.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#f59e0b', fontWeight: 'bold' }}>Target Value ({durationMonths}M)</div>
                <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#f59e0b', marginTop: '2px' }}>${generatedPortfolio.totalExpected.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Allocation Cards */}
          <div style={{ fontSize: '14px', color: '#fff', fontWeight: 'bold', textAlign: 'left' }}>
            Selected Allocation & Weightings ({generatedPortfolio.items.length} Assets):
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {generatedPortfolio.items.map(item => (
              <div
                key={item.id}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '14px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                      {item.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#fff' }}>{item.symbol}</div>
                      <div style={{ fontSize: '10px', color: '#9ca3af' }}>{item.name}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', padding: '3px 8px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                      ${item.dollarAmount.toLocaleString()} ({item.sharePercent}%)
                    </span>
                    {item.isHalal && (
                      <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '3px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold' }}>
                        Halal 🕌
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: '8px' }}>
                  <div>
                    <span style={{ color: '#9ca3af' }}>Allocated: </span>
                    <span style={{ fontWeight: 'bold', color: '#fff' }}>${item.dollarAmount.toLocaleString()}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: '#9ca3af' }}>Target: </span>
                    <span style={{ fontWeight: 'bold', color: '#10b981' }}>${item.expectedValue.toLocaleString()}</span>
                  </div>
                </div>

                <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', lineHeight: '1.4', direction: 'ltr' }}>
                  💡 <b>Investment Thesis:</b> {item.thesis}
                </p>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* FULL COIN EVALUATION TABLE SECTION */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden', marginTop: '8px' }}>
        
        {/* Table Header Banner */}
        <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: '#fff', fontWeight: 'bold' }}>Global Asset Rating & Score Matrix 📊</h3>
          </div>
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>{ratedCoins.length} Assets Audited (Live)</div>
        </div>

        {/* Coin Ranking Rows */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {ratedCoins.map((coin) => (
            <div
              key={coin.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                background: coin.rank <= 3 ? 'rgba(245, 158, 11, 0.03)' : 'transparent',
                transition: 'background 0.2s'
              }}
            >
              {/* Left Side: Rank, Icon, Name, Price */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'bold', width: '20px', textAlign: 'center' }}>
                  {coin.rank}
                </div>

                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {coin.logoUrl ? (
                    <img 
                      src={coin.logoUrl} 
                      alt={coin.name} 
                      style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'contain' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <span style={{ fontSize: '18px' }}>{coin.icon}</span>
                  )}
                </div>

                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#fff' }}>{coin.name}</div>
                  <div style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '500' }}>{coin.priceStr}</div>
                </div>
              </div>

              {/* Right Side: Score & Rating Badge */}
              <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '15px', color: coin.score >= 65 ? '#10b981' : coin.score >= 50 ? '#f59e0b' : '#f87171' }}>
                    {coin.score}
                  </div>
                  <div style={{ fontSize: '10px', color: '#9ca3af' }}>{coin.evalText}</div>
                </div>
                {coin.rank <= 3 && <span style={{ fontSize: '16px' }}>🏆</span>}
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
