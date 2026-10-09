import React, { useState } from 'react';

// Dedicated Official Logo Maps for Egyptian Stocks, Funds, Global Assets, Crypto & Forex
export const assetLogoMap = {
  // 🪙 Egyptian Mutual Funds & Gold Funds (Thndr / Azimut / Traden Hub)
  'AZG': 'https://assets.thndr.app/funds/AZG.png',
  'AZ-GOLD': 'https://assets.thndr.app/funds/AZG.png',
  'THNDR-ALPHA': 'https://assets.thndr.app/funds/THNDR-ALPHA.png',
  'ALPHA': 'https://assets.thndr.app/funds/THNDR-ALPHA.png',
  'DAILY-CASH': 'https://assets.thndr.app/funds/DAILY-CASH.png',
  'TRADEN-DAILY': 'https://assets.thndr.app/funds/DAILY-CASH.png',
  'AZ-OPP': 'https://assets.thndr.app/funds/AZ-OPP.png',
  'AZ-SAVINGS': 'https://assets.thndr.app/funds/AZ-SAVINGS.png',
  'THARWA': 'https://assets.thndr.app/stocks/CONTACT.png',
  'CONTACT': 'https://assets.thndr.app/stocks/CONTACT.png',
  'VALU': 'https://assets.thndr.app/stocks/VALU.png',
  'CI-30': 'https://assets.thndr.app/funds/CI30.png',
  'MISR-FUND': 'https://assets.thndr.app/funds/MISR.png',
  'AHLY-FUND': 'https://assets.thndr.app/funds/NBE.png',
  'BELTONE-CASH': 'https://assets.thndr.app/funds/BTFH.png',

  // 🇪🇬 Top Egyptian Stocks (Official Logos & Thndr Assets)
  'COMI': 'https://assets.thndr.app/stocks/COMI.png',
  'CIB': 'https://assets.thndr.app/stocks/COMI.png',
  'FAWR': 'https://assets.thndr.app/stocks/FWRY.png',
  'FWRY': 'https://assets.thndr.app/stocks/FWRY.png',
  'FAWRY': 'https://assets.thndr.app/stocks/FWRY.png',
  'TMGH': 'https://assets.thndr.app/stocks/TMGH.png',
  'SWDY': 'https://assets.thndr.app/stocks/SWDY.png',
  'MFPC': 'https://assets.thndr.app/stocks/MFPC.png',
  'ABUK': 'https://assets.thndr.app/stocks/ABUK.png',
  'ETEL': 'https://assets.thndr.app/stocks/ETEL.png',
  'EKHO': 'https://assets.thndr.app/stocks/EKHO.png',
  'HRHO': 'https://assets.thndr.app/stocks/HRHO.png',
  'ESRS': 'https://assets.thndr.app/stocks/ESRS.png',
  'BTFH': 'https://assets.thndr.app/stocks/BTFH.png',
  'SKPC': 'https://assets.thndr.app/stocks/SKPC.png',
  'HELI': 'https://assets.thndr.app/stocks/HELI.png',
  'EFIH': 'https://assets.thndr.app/stocks/EFIH.png',
  'EAST': 'https://assets.thndr.app/stocks/EAST.png',
  'JUFO': 'https://assets.thndr.app/stocks/JUFO.png',
  'DOMTY': 'https://assets.thndr.app/stocks/DOMT.png',
  'DOMT': 'https://assets.thndr.app/stocks/DOMT.png',
  'ORWE': 'https://assets.thndr.app/stocks/ORWE.png',
  'ISPH': 'https://assets.thndr.app/stocks/ISPH.png',
  'CLHO': 'https://assets.thndr.app/stocks/CLHO.png',
  'ACAMD': 'https://assets.thndr.app/stocks/ACAMD.png',
  'ADPC': 'https://assets.thndr.app/stocks/ADPC.png',
  'ATVX': 'https://assets.thndr.app/stocks/ATVX.png',
  'AJWA': 'https://assets.thndr.app/stocks/AJWA.png',
  'ALCN': 'https://assets.thndr.app/stocks/ALCN.png',
  'ALUM': 'https://assets.thndr.app/stocks/ALUM.png',
  'AMIA': 'https://assets.thndr.app/stocks/AMIA.png',
  'ANFI': 'https://assets.thndr.app/stocks/ANFI.png',
  'APSW': 'https://assets.thndr.app/stocks/APSW.png',
  'ARCC': 'https://assets.thndr.app/stocks/ARCC.png',
  'ARVA': 'https://assets.thndr.app/stocks/ARVA.png',
  'AMOC': 'https://assets.thndr.app/stocks/AMOC.png',
  'MASR': 'https://assets.thndr.app/stocks/MASR.png',
  'PHDC': 'https://assets.thndr.app/stocks/PHDC.png',
  'CCAP': 'https://assets.thndr.app/stocks/CCAP.png',
  'ORAS': 'https://assets.thndr.app/stocks/ORAS.png',
  'OCDI': 'https://assets.thndr.app/stocks/OCDI.png',
  'KORA': 'https://assets.thndr.app/stocks/KORA.png',
  'BONY': 'https://assets.thndr.app/stocks/BONY.png',
  'CIEB': 'https://assets.thndr.app/stocks/CIEB.png',
  'ADIB': 'https://assets.thndr.app/stocks/ADIB.png',
  'EGAL': 'https://assets.thndr.app/stocks/EGAL.png',
  'EGTS': 'https://assets.thndr.app/stocks/EGTS.png',
  'ORHD': 'https://assets.thndr.app/stocks/ORHD.png',
  'MNHD': 'https://assets.thndr.app/stocks/MNHD.png',
  'MOIL': 'https://assets.thndr.app/stocks/MOIL.png',
  'POUL': 'https://assets.thndr.app/stocks/POUL.png',
  'PRDC': 'https://assets.thndr.app/stocks/PRDC.png',
  'RAYA': 'https://assets.thndr.app/stocks/RAYA.png',
  'RREI': 'https://assets.thndr.app/stocks/RREI.png',
  'SAUD': 'https://assets.thndr.app/stocks/SAUD.png',
  'SCEM': 'https://assets.thndr.app/stocks/SCEM.png',
  'SMFR': 'https://assets.thndr.app/stocks/SMFR.png',
  'SPMD': 'https://assets.thndr.app/stocks/SPMD.png',
  'TAQA': 'https://assets.thndr.app/stocks/TAQA.png',
  'UNIT': 'https://assets.thndr.app/stocks/UNIT.png',
  'ZEOT': 'https://assets.thndr.app/stocks/ZEOT.png',

  // 🪙 Crypto Icons
  'BTC': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/btc.png',
  'BTC/USDT': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/btc.png',
  'ETH': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/eth.png',
  'ETH/USDT': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/eth.png',
  'SOL': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/sol.png',
  'SOL/USDT': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/sol.png',
  'DOT': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/dot.png',
  'DOT/USDT': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/dot.png',
  'MATIC': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/matic.png',
  'MATIC/USDT': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/matic.png',
  'BNB': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/bnb.png',
  'BNB/USDT': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/bnb.png',
  'XRP': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/xrp.png',
  'XRP/USDT': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/xrp.png',
  'LINK': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/link.png',
  'LINK/USDT': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/link.png',
  'ADA': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/ada.png',
  'ADA/USDT': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/ada.png',
  'AVAX': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/avax.png',
  'AVAX/USDT': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/avax.png',
  'NEAR': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/near.png',
  'NEAR/USDT': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/near.png',
  'SUI': 'https://assets.coingecko.com/coins/images/26375/large/sui_asset.png',
  'SUI/USDT': 'https://assets.coingecko.com/coins/images/26375/large/sui_asset.png',
  'ATOM': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/atom.png',
  'ATOM/USDT': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/atom.png',
  'OP': 'https://assets.coingecko.com/coins/images/25244/large/Optimism.png',
  'OP/USDT': 'https://assets.coingecko.com/coins/images/25244/large/Optimism.png',
  'INJ': 'https://assets.coingecko.com/coins/images/12882/large/Secondary_Symbol.png',
  'INJ/USDT': 'https://assets.coingecko.com/coins/images/12882/large/Secondary_Symbol.png',
  'RENDER': 'https://assets.coingecko.com/coins/images/11636/large/render.png',
  'RENDER/USDT': 'https://assets.coingecko.com/coins/images/11636/large/render.png',
  'FET': 'https://assets.coingecko.com/coins/images/5681/large/Fetch.jpg',
  'FET/USDT': 'https://assets.coingecko.com/coins/images/5681/large/Fetch.jpg',
  'APT': 'https://assets.coingecko.com/coins/images/26455/large/aptos_round.png',
  'APT/USDT': 'https://assets.coingecko.com/coins/images/26455/large/aptos_round.png',
  'ARB': 'https://assets.coingecko.com/coins/images/16547/large/arbitrum.png',
  'ARB/USDT': 'https://assets.coingecko.com/coins/images/16547/large/arbitrum.png',

  // 🌍 Forex Flags
  'EUR/USD': 'https://img.icons8.com/color/96/european-union.png',
  'GBP/USD': 'https://img.icons8.com/color/96/great-britain.png',
  'USD/JPY': 'https://img.icons8.com/color/96/japan.png',
  'AUD/USD': 'https://img.icons8.com/color/96/australia.png',
  'USD/CAD': 'https://img.icons8.com/color/96/canada.png',
  'USD/CHF': 'https://img.icons8.com/color/96/switzerland.png',
  'NZD/USD': 'https://img.icons8.com/color/96/new-zealand.png',
  'EUR/GBP': 'https://img.icons8.com/color/96/european-union.png',
  'EUR/JPY': 'https://img.icons8.com/color/96/european-union.png',
  'GBP/JPY': 'https://img.icons8.com/color/96/great-britain.png',
  'USD/TRY': 'https://img.icons8.com/color/96/turkey.png',
  'USD/EGP': 'https://img.icons8.com/color/96/egypt.png',
  'USD/SAR': 'https://img.icons8.com/color/96/saudi-arabia.png',
  'USD/AED': 'https://img.icons8.com/color/96/united-arab-emirates.png',

  // 🥇 Metals & Commodities
  'XAU/USD': 'https://assets.coingecko.com/coins/images/9519/large/paxg.png',
  'PAXG/USDT': 'https://assets.coingecko.com/coins/images/9519/large/paxg.png',
  'PAXG': 'https://assets.coingecko.com/coins/images/9519/large/paxg.png',
  'XAG/USD': 'https://img.icons8.com/color/96/silver-bars.png',
  'XPT/USD': 'https://img.icons8.com/color/96/diamond.png',
  'WTI/USD': 'https://img.icons8.com/color/96/oil-industry.png',
  'WTI': 'https://img.icons8.com/color/96/oil-industry.png',
  'US30': 'https://img.icons8.com/color/96/usa.png',

  // 🇺🇸 US Tech Stocks
  'AAPL': 'https://img.icons8.com/color/96/apple-logo.png',
  'NVDA': 'https://img.icons8.com/color/96/nvidia.png',
  'COIN': 'https://img.icons8.com/color/96/coinbase.png',
  'TSLA': 'https://img.icons8.com/color/96/tesla-logo.png',
  'MSFT': 'https://img.icons8.com/color/96/microsoft.png',
  'GOOGL': 'https://img.icons8.com/color/96/google-logo.png',
  'AMZN': 'https://img.icons8.com/color/96/amazon.png',
  'META': 'https://img.icons8.com/color/96/meta.png',
  'AMD': 'https://img.icons8.com/color/96/amd.png',
  'INTC': 'https://img.icons8.com/color/96/intel.png'
};

// Colors palette for clean branded fallback avatar chips
const tickerColors = [
  { bg: 'rgba(245, 158, 11, 0.18)', border: '#f59e0b', text: '#fbbf24' },
  { bg: 'rgba(56, 189, 248, 0.18)', border: '#38bdf8', text: '#38bdf8' },
  { bg: 'rgba(16, 185, 129, 0.18)', border: '#10b981', text: '#34d399' },
  { bg: 'rgba(168, 85, 247, 0.18)', border: '#a855f7', text: '#c084fc' },
  { bg: 'rgba(244, 63, 94, 0.18)', border: '#f43f5e', text: '#fb7185' },
  { bg: 'rgba(99, 102, 241, 0.18)', border: '#6366f1', text: '#818cf8' }
];

function getTickerColor(symbol = '') {
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) {
    hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % tickerColors.length;
  return tickerColors[index];
}

export function AssetLogo({ symbol, fallbackIcon, size = 22, containerSize = 34 }) {
  const cleanSymbol = symbol ? symbol.toUpperCase().trim() : '';
  const primarySymbol = cleanSymbol.split('/')[0].split(':')[1] || cleanSymbol.split('/')[0];
  
  // Try mapped URL or Thndr asset CDN
  const initialUrl = assetLogoMap[cleanSymbol] || assetLogoMap[primarySymbol] || `https://assets.thndr.app/stocks/${primarySymbol}.png`;
  
  const [imgSrc, setImgSrc] = useState(initialUrl);
  const [hasError, setHasError] = useState(false);
  const [triedAlt, setTriedAlt] = useState(false);

  const handleImageError = () => {
    if (!triedAlt) {
      setTriedAlt(true);
      // Try fund endpoint before falling back
      setImgSrc(`https://assets.thndr.app/funds/${primarySymbol}.png`);
    } else {
      setHasError(true);
    }
  };

  const colorScheme = getTickerColor(primarySymbol);
  const shortLetters = primarySymbol ? primarySymbol.slice(0, 3) : 'TX';

  return (
    <div 
      style={{ 
        width: `${containerSize}px`, 
        height: `${containerSize}px`, 
        borderRadius: '50%', 
        background: 'rgba(15, 23, 42, 0.8)', 
        border: `1px solid ${hasError ? colorScheme.border : 'rgba(255,255,255,0.12)'}`,
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        overflow: 'hidden',
        flexShrink: 0,
        boxShadow: hasError ? `0 0 8px ${colorScheme.bg}` : '0 2px 6px rgba(0,0,0,0.3)',
        transition: 'transform 0.2s ease'
      }}
    >
      {!hasError && imgSrc ? (
        <img 
          src={imgSrc} 
          alt={cleanSymbol} 
          onError={handleImageError}
          style={{ 
            width: `${size}px`, 
            height: `${size}px`, 
            borderRadius: '50%', 
            objectFit: 'contain',
            padding: '2px'
          }}
        />
      ) : (
        <div 
          style={{ 
            width: '100%', 
            height: '100%', 
            background: colorScheme.bg,
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: `${Math.max(9, Math.round(containerSize * 0.32))}px`,
            fontWeight: '900',
            color: colorScheme.text,
            fontFamily: 'monospace',
            letterSpacing: '-0.5px'
          }}
        >
          {shortLetters}
        </div>
      )}
    </div>
  );
}
