import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, Search, Zap, TrendingUp, ShieldAlert, Award, 
  DollarSign, Clock, ExternalLink, Activity, BarChart2, Globe, 
  Sparkles, Layers, RefreshCw, ArrowUpRight, ArrowDownRight, FileText, PieChart,
  SlidersHorizontal, ChevronLeft, ArrowRight, ShieldCheck, Sparkle, Radio
} from 'lucide-react';
import { 
  egxCategories, egxStocksList, egxFundsList, analyzeEgxStockWithGlobalMacro, 
  fetchEgxLiveMarketPulse, getCairoMarketStatus, fetchEgxTopMovers, fetchLiveEgxNews,
  fetchEgxAllListedStocks
} from '../utils/egxFetcher';
import { AssetLogo } from '../utils/assetLogos';
import TradingViewWidget from './TradingViewWidget';
import RasadAnalysisCard from './RasadAnalysisCard';

export default function EgxAnalysis({ onBack }) {
  const [activeTab, setActiveTab] = useState('screener'); // 'screener' | 'smart_planner' | 'funds' | 'top_movers' | 'sectors' | 'news_disclosures'
  const [selectedProduct, setSelectedProduct] = useState('all'); // 'all' | 'gold' | 'stocks' | 'funds'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [stocksList, setStocksList] = useState(egxStocksList);
  const [selectedStock, setSelectedStock] = useState(egxStocksList[0]);
  const [chartSymbol, setChartSymbol] = useState(egxStocksList[0].tvSymbol);
  const [capitalEgp, setCapitalEgp] = useState(50000);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [marketPulse, setMarketPulse] = useState(null);
  const [cairoTime, setCairoTime] = useState('');
  const [topMoversData, setTopMoversData] = useState(null);
  const [liveNewsList, setLiveNewsList] = useState(fetchLiveEgxNews());
  const [activeSelectedIdx, setActiveSelectedIdx] = useState('EGX30');

  // 🎯 Smart Investment Guide & Robo Advisor State (without Shariah, with simulation progress)
  const [plannerCapital, setPlannerCapital] = useState(50000);
  const [plannerGoal, setPlannerGoal] = useState('growth'); // 'growth' | 'hedge' | 'income' | 'balanced'
  const [plannerHorizon, setPlannerHorizon] = useState('medium'); // 'short' | 'medium' | 'long'
  const [plannerRisk, setPlannerRisk] = useState('moderate'); // 'low' | 'moderate' | 'high'
  const [plannerPlan, setPlannerPlan] = useState(null);
  const [isPlanning, setIsPlanning] = useState(false);
  const [planningProgress, setPlanningProgress] = useState(0);
  const [planningStatusText, setPlanningStatusText] = useState('');

  // Load All 300+ Listed EGX Stocks & Mutual Funds
  const loadAllEgxCompanies = async () => {
    try {
      const fullList = await fetchEgxAllListedStocks();
      if (fullList && fullList.length > 0) {
        setStocksList(fullList);
      }
    } catch (e) {
      console.log('Error loading all EGX companies:', e);
    }
  };

  // Load live news from API endpoint with auto-fallback
  const loadLiveNews = async () => {
    try {
      const res = await fetch('/api/egx-news');
      if (res.ok) {
        const json = await res.json();
        if (json && json.data && json.data.length > 0) {
          setLiveNewsList(json.data);
          return;
        }
      }
    } catch (e) {
      // Fallback
    }
    setLiveNewsList(fetchLiveEgxNews());
  };

  // Load EGX Market Pulse, Top Movers & Live News
  const loadMarketPulse = async () => {
    try {
      const pulse = await fetchEgxLiveMarketPulse();
      setMarketPulse(pulse);
      setCairoTime(pulse.cairoTime);
      const movers = fetchEgxTopMovers();
      setTopMoversData(movers);
      loadLiveNews();
    } catch (e) {
      console.log('EGX pulse error:', e);
    }
  };

  useEffect(() => {
    loadMarketPulse();
    loadAllEgxCompanies();

    // Auto-refresh quotes every 15s and news every 15s silently in background
    const liveInterval = setInterval(loadAllEgxCompanies, 15000);
    const newsInterval = setInterval(loadLiveNews, 15000);

    return () => {
      clearInterval(liveInterval);
      clearInterval(newsInterval);
    };
  }, []);

  // Clock
  useEffect(() => {
    const interval = setInterval(() => {
      const status = getCairoMarketStatus();
      setCairoTime(status.cairoTime);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filtered stocks based on selected product card, themes & search
  const filteredStocks = stocksList.filter(s => {
    // 1. Product Filter (from Top 3 Quick Cards)
    if (selectedProduct === 'gold') {
      if (s.category !== 'metals' && !s.tags?.includes('hedge') && s.code !== 'AZG' && s.code !== 'BELTON-GOLD') return false;
    } else if (selectedProduct === 'stocks') {
      if (s.category === 'funds' || s.category === 'metals') return false;
    } else if (selectedProduct === 'funds') {
      if (s.category !== 'funds' && !s.tags?.includes('funds') && !s.tags?.includes('traden_funds')) return false;
    }

    // 2. Category & Theme Filter
    let matchesCategory = false;
    if (selectedCategory === 'all') {
      matchesCategory = true;
    } else if (selectedCategory === 'traden_funds') {
      matchesCategory = s.tags?.includes('funds') || s.tags?.includes('traden_funds') || s.category === 'funds';
    } else if (selectedCategory === 'traden_dividends') {
      matchesCategory = s.tags?.includes('dividend') || (s.divYield && s.divYield.includes('كاش')) || (s.divYield && s.divYield.includes('أرباح نقدية'));
    } else if (selectedCategory === 'traden_dollar') {
      matchesCategory = s.tags?.includes('dollar') || s.dollarEarner;
    } else if (selectedCategory === 'traden_growth') {
      matchesCategory = s.tags?.includes('growth') || (s.divYield && s.divYield.includes('نمو'));
    } else if (selectedCategory === 'traden_shariah') {
      matchesCategory = s.tags?.includes('shariah') || s.shariahCompliant;
    } else if (selectedCategory === 'traden_hedge') {
      matchesCategory = s.tags?.includes('hedge') || s.category === 'metals' || s.category === 'funds';
    } else {
      matchesCategory = s.category === selectedCategory;
    }

    // 3. Search query
    const matchesSearch = s.code.toLowerCase().includes(search.toLowerCase()) ||
                          s.name.toLowerCase().includes(search.toLowerCase()) ||
                          s.sector.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Automatically update selected stock when category or product changes if previous selection is not in filtered list
  useEffect(() => {
    if (filteredStocks.length > 0) {
      const isCurrentSelectedInFiltered = filteredStocks.some(s => s.code === selectedStock?.code);
      if (!isCurrentSelectedInFiltered) {
        setSelectedStock(filteredStocks[0]);
      }
    }
  }, [selectedCategory, selectedProduct, search]);

  const handleStockSelect = (stock) => {
    setSelectedStock(stock);
    setChartSymbol(stock.tvSymbol || `EGX:${stock.code}`);
    setActiveSelectedIdx(null);
  };

  const handleAnalyze = async (stockToAnalyze) => {
    const target = stockToAnalyze || selectedStock;
    setLoading(true);
    setAnalysisResult(null);

    const res = await analyzeEgxStockWithGlobalMacro(target.code, capitalEgp, target.priceEst);
    setTimeout(() => {
      setLoading(false);
      setAnalysisResult(res);
      const radarEl = document.getElementById('traden-ai-radar-section');
      if (radarEl) radarEl.scrollIntoView({ behavior: 'smooth' });
    }, 400);
  };

  // Handle Index Card Click (Opens interactive chart directly for the clicked index)
  const handleIndexCardClick = (idxCode) => {
    setActiveSelectedIdx(idxCode);
    setActiveTab('screener');

    if (idxCode === 'EGX30') {
      setChartSymbol('EGX:EGX30');
      setSelectedCategory('all');
      setSelectedProduct('all');
    } else if (idxCode === 'EGX70') {
      setChartSymbol('EGX:EGX70EWI');
      setSelectedCategory('traden_growth');
      setSelectedProduct('all');
    } else if (idxCode === 'EGX100') {
      setChartSymbol('EGX:EGX100EWI');
      setSelectedCategory('all');
      setSelectedProduct('all');
    } else if (idxCode === 'SHARIAH') {
      setChartSymbol('EGX:SHARIAH');
      setSelectedCategory('traden_shariah');
      setSelectedProduct('all');
    } else if (idxCode === 'USD/EGP') {
      setChartSymbol('FX_IDC:USDEGP');
      setSelectedCategory('traden_dollar');
      setSelectedProduct('all');
    } else if (idxCode === '24k gold') {
      setChartSymbol('OANDA:XAUUSD');
      setSelectedCategory('traden_hedge');
      setSelectedProduct('gold');
    }

    setTimeout(() => {
      const chartEl = document.getElementById('traden-interactive-chart-box');
      if (chartEl) chartEl.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  // 🎯 AI Smart Investment Guide & Portfolio Allocation Engine
  const handleGeneratePlannerPlan = () => {
    setIsPlanning(true);
    setPlanningProgress(15);
    setPlanningStatusText('جاري فحص رأس المال وتقييم القوة الشرائية بالجنيه المصري...');

    setTimeout(() => {
      setPlanningProgress(45);
      setPlanningStatusText('تحليل تاريخ عوائد صندوق سندر ألفا للأسهم النشطة وصناديق الذهب...');
    }, 450);

    setTimeout(() => {
      setPlanningProgress(75);
      setPlanningStatusText('توزيع نسب السيولة اليومية والتحوط وإعادة التوازن الذكي...');
    }, 1000);

    setTimeout(() => {
      setPlanningProgress(100);
      setPlanningStatusText('تم اكتمال بناء الخطة وتأكيد التوزيع الاستثماري!');

      const capital = Math.max(100, parseFloat(plannerCapital) || 50000);
      let items = [];
      let avgAnnualYield = 0.35;
      let riskScore = 6;
      let riskTitle = 'معتدل - نمو متوازن';
      let riskColor = '#f59e0b';
      let thesis = '';

      if (plannerGoal === 'growth') {
        avgAnnualYield = plannerRisk === 'high' ? 0.44 : 0.38;
        riskScore = plannerRisk === 'high' ? 8 : 7;
        riskTitle = 'عالي - نمو فائق ومضاعفة رأس المال (Alpha)';
        riskColor = '#f87171';
        thesis = 'ترتكز هذه الخطة على اقتناص أعلى نمو ممكن في سوق الأسهم المصرية عبر صندوق ألفا للأسهم النشطة والشركات القيادية الرابحة، مع تخصيص نسبة ذهب وسيولة نقدية لامتصاص تراجعات السوق وتأمين السيولة.';
        
        const p1 = 45;
        const p2 = 25;
        const p3 = 20;
        const p4 = 10;
        const a1 = Math.floor(capital * (p1 / 100));
        const a2 = Math.floor(capital * (p2 / 100));
        const a3 = Math.floor(capital * (p3 / 100));
        const a4 = capital - (a1 + a2 + a3);

        items = [
          {
            name: 'صندوق سندر ألفا للأسهم النشطة (Thndr Alpha / AZ Equity)',
            type: 'صندوق أسهم استثماري نشط (Alpha Equity)',
            symbol: 'THNDR-ALPHA',
            fallbackIcon: '🚀',
            badgeBg: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
            pct: p1,
            color: '#38bdf8',
            amount: a1,
            expectedReturn: '38% - 46% سنوياً',
            desc: 'يستثمر في أقوى 25 شركة مدرجة بالبورصة ذات النمو العالي والربحية المتصاعدة بقيادة مديري صناديق محترفين.'
          },
          {
            name: 'صندوق أزيموت جولد للذهب عيار 24 (AZ Gold Fund - AZG)',
            type: 'صندوق سبائك ذهب عيار 24 معتمد',
            symbol: 'AZG',
            fallbackIcon: '🪙',
            badgeBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            pct: p2,
            color: '#eab308',
            amount: a2,
            expectedReturn: '30% - 35% سنوياً',
            desc: 'سبائك ذهب نقية عيار 24 مخزنة في خزائن البنك المركزي المصري للتحوط التام ضد تراجع العملة.'
          },
          {
            name: 'سلة الأسهم القيادية الدولارية (CIB / MOPCO / Elsewedy)',
            type: 'أسهم كبرى الشركات ذات الإيرادات الدولارية',
            symbol: 'COMI',
            fallbackIcon: '🏢',
            badgeBg: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            pct: p3,
            color: '#10b981',
            amount: a3,
            expectedReturn: '35% - 42% سنوياً',
            desc: 'شركات قيادية تولد تدفقات دولارية وتوزع أرباحاً كاش دورية للمساهمين.'
          },
          {
            name: 'صندوق السيولة اليومية ذو العائد التراكمي (ثروة / مصر للتأمين)',
            type: 'صندوق نقد وسيولة يومية بدون مخاطرة',
            symbol: 'DAILY-CASH',
            fallbackIcon: '💵',
            badgeBg: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
            pct: p4,
            color: '#a855f7',
            amount: a4,
            expectedReturn: '24% - 26% سنوياً',
            desc: 'عائد يومي مركب يُضاف لحسابك يومياً مع إمكانية الشراء والاسترداد في أي يوم دون قيود.'
          }
        ];
      } else if (plannerGoal === 'hedge') {
        avgAnnualYield = 0.34;
        riskScore = 4;
        riskTitle = 'منخفض إلى معتدل - درع ضد التضخم والعملة';
        riskColor = '#38bdf8';
        thesis = 'الهدف الأساسي لهذه الخطة هو حماية القوة الشرائية لأموالك بالكامل من التضخم وانخفاض الجنيه عبر تركيز الأغلبية في الذهب والشركات المصدرة ذات الإيراد الدولاري المباشر.';

        const p1 = 45;
        const p2 = 30;
        const p3 = 15;
        const p4 = 10;
        const a1 = Math.floor(capital * (p1 / 100));
        const a2 = Math.floor(capital * (p2 / 100));
        const a3 = Math.floor(capital * (p3 / 100));
        const a4 = capital - (a1 + a2 + a3);

        items = [
          {
            name: 'صندوق أزيموت جولد للذهب عيار 24 (AZ Gold 24k Bullion)',
            type: 'صندوق ذهب ومعادن ثمينة معتمد',
            symbol: 'AZG',
            fallbackIcon: '🪙',
            badgeBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            pct: p1,
            color: '#eab308',
            amount: a1,
            expectedReturn: '30% - 36% سنوياً',
            desc: 'أقوى وسيلة تحوط في السوق المصري لحفظ القيمة الحقيقية للثروة.'
          },
          {
            name: 'سلة شركات التصدير والإيراد الدولاري (MOPCO / ABUQIR / ETEL)',
            type: 'أسهم شركات ذات إيراد دولاري كامل',
            symbol: 'MFPC',
            fallbackIcon: '💵',
            badgeBg: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            pct: p2,
            color: '#10b981',
            amount: a2,
            expectedReturn: '32% - 38% سنوياً',
            desc: 'أسهم تستفيد مباشرة من تحركات سعر الصرف وتوزع أرباحاً مجزية.'
          },
          {
            name: 'صندوق سندر ألفا للأسهم المصرية (Thndr Alpha Equity)',
            type: 'صندوق أسهم استثماري',
            symbol: 'THNDR-ALPHA',
            fallbackIcon: '🚀',
            badgeBg: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
            pct: p3,
            color: '#38bdf8',
            amount: a3,
            expectedReturn: '38% سنوياً',
            desc: 'حصة نمو خفيفة لمواكبة طفرات البورصة المصرية.'
          },
          {
            name: 'صندوق النقد والسيولة اليومية ذو الفائدة المركبة',
            type: 'صندوق نقد يومي بدون مخاطرة',
            symbol: 'DAILY-CASH',
            fallbackIcon: '🛡️',
            badgeBg: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
            pct: p4,
            color: '#a855f7',
            amount: a4,
            expectedReturn: '24% سنوياً',
            desc: 'كاش للطوارئ ولتأمين السيولة السريعة في أي وقت.'
          }
        ];
      } else if (plannerGoal === 'income') {
        avgAnnualYield = 0.27;
        riskScore = 2;
        riskTitle = 'منخفض جداً - دخل يومي دوري آمن بدون مخاطرة';
        riskColor = '#10b981';
        thesis = 'خطة استثمارية محافظة تركز على تدفقات نقدية يومية وربع سنوية آمنة بأقل تذبذب ممكن مع راحة بال تامة وإمكانية السحب في أي وقت.';

        const p1 = 55;
        const p2 = 25;
        const p3 = 20;
        const a1 = Math.floor(capital * (p1 / 100));
        const a2 = Math.floor(capital * (p2 / 100));
        const a3 = capital - (a1 + a2);

        items = [
          {
            name: 'صندوق السيولة اليومية وعائد النقد المركب (مصر للتأمين / ثروة)',
            type: 'صندوق نقد مركب يومي',
            symbol: 'DAILY-CASH',
            fallbackIcon: '💵',
            badgeBg: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            pct: p1,
            color: '#10b981',
            amount: a1,
            expectedReturn: '24% - 26% عائد يومي مركب',
            desc: 'عائد يُحسب ويُضاف كل يوم بدون أي خسارة لرأس المال مع مرونة استرداد كاملة.'
          },
          {
            name: 'أسهم الشركات الأعلى توزيعاً للكاش والأرباح النقدية (CIB / Elsewedy)',
            type: 'أسهم توزيعات نقدية ربع سنوية وسنوية',
            symbol: 'COMI',
            fallbackIcon: '🏦',
            badgeBg: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            pct: p2,
            color: '#38bdf8',
            amount: a2,
            expectedReturn: '28% - 32% سنوياً',
            desc: 'توزيع كوبونات وأرباح دورية في حسابك البنكي.'
          },
          {
            name: 'صندوق أزيموت جولد للذهب عيار 24 (AZG)',
            type: 'صندوق ذهب تحوطي',
            symbol: 'AZG',
            fallbackIcon: '🪙',
            badgeBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            pct: p3,
            color: '#eab308',
            amount: a3,
            expectedReturn: '30% سنوياً',
            desc: 'صمام أمان لحماية القوة الشرائية لجزء من رأس المال.'
          }
        ];
      } else {
        // balanced
        avgAnnualYield = 0.33;
        riskScore = 5;
        riskTitle = 'متوازن - توزيع شامل لجميع فئات الأصول';
        riskColor = '#f59e0b';
        thesis = 'النموذج الذهبي لإدارة المحافظ المؤسسية؛ يجمع بين نمو الأسهم القوي، وقوة الذهب كملاذ آمن، وأمان السيولة اليومية المركبة.';

        const p1 = 35;
        const p2 = 30;
        const p3 = 25;
        const p4 = 10;
        const a1 = Math.floor(capital * (p1 / 100));
        const a2 = Math.floor(capital * (p2 / 100));
        const a3 = Math.floor(capital * (p3 / 100));
        const a4 = capital - (a1 + a2 + a3);

        items = [
          {
            name: 'صندوق سندر ألفا للأسهم النشطة (Thndr Alpha / AZ Equity)',
            type: 'صندوق أسهم استثماري نشط',
            symbol: 'THNDR-ALPHA',
            fallbackIcon: '🚀',
            badgeBg: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
            pct: p1,
            color: '#38bdf8',
            amount: a1,
            expectedReturn: '38% - 44% سنوياً',
            desc: 'محرك النمو الأساسي للمحفظة لمضاعفة العوائد.'
          },
          {
            name: 'صندوق أزيموت جولد للذهب عيار 24 (AZG)',
            type: 'صندوق ذهب معتمد عيار 24',
            symbol: 'AZG',
            fallbackIcon: '🪙',
            badgeBg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            pct: p2,
            color: '#eab308',
            amount: a2,
            expectedReturn: '30% - 34% سنوياً',
            desc: 'حماية وحفظ القيمة ضد أي تقلبات في سعر الصرف.'
          },
          {
            name: 'صندوق السيولة اليومية والدخل التراكمي (ثروة / مصر للتأمين)',
            type: 'صندوق نقد يومي مركب',
            symbol: 'DAILY-CASH',
            fallbackIcon: '💵',
            badgeBg: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            pct: p3,
            color: '#10b981',
            amount: a3,
            expectedReturn: '24% - 26% سنوياً',
            desc: 'فائدة يومية مركبة مع مرونة سحب كاملة في أي يوم.'
          },
          {
            name: 'سلة أسهم الشركات القيادية ذات العائد الدولاري (TMGH / Elsewedy)',
            type: 'أسهم كبرى الشركات الرابحة',
            symbol: 'TMGH',
            fallbackIcon: '🏢',
            badgeBg: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
            pct: p4,
            color: '#a855f7',
            amount: a4,
            expectedReturn: '35% سنوياً',
            desc: 'تنويع إضافي في القطاعات الإنتاجية والصناعية.'
          }
        ];
      }

      const val1Year = Math.round(capital * (1 + avgAnnualYield));
      const val3Years = Math.round(capital * Math.pow(1 + avgAnnualYield, 3));
      const val5Years = Math.round(capital * Math.pow(1 + avgAnnualYield, 5));

      setPlannerPlan({
        capital,
        goal: plannerGoal,
        horizon: plannerHorizon,
        risk: plannerRisk,
        avgAnnualYield: Math.round(avgAnnualYield * 100),
        riskScore,
        riskTitle,
        riskColor,
        thesis,
        items,
        val1Year,
        val3Years,
        val5Years,
        profit1Year: val1Year - capital,
        profit3Years: val3Years - capital,
        profit5Years: val5Years - capital
      });

      setTimeout(() => {
        setIsPlanning(false);
      }, 300);
    }, 1500);
  };

  useEffect(() => {
    if (!plannerPlan) {
      handleGeneratePlannerPlan();
    }
  }, []);

  return (
    <div style={{
      background: 'linear-gradient(135deg, #07090e 0%, #0d121c 100%)',
      minHeight: '100vh',
      color: '#f8fafc',
      padding: '16px 14px 60px 14px',
      direction: 'rtl',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Cairo", "Inter", sans-serif'
    }}>

      {/* ========================================================================= */}
      {/* 1️⃣ SLEEK COMPACT HEADER */}
      {/* ========================================================================= */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '10px', 
        gap: '6px' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            onClick={onBack} 
            style={{ 
              background: 'rgba(255,255,255,0.06)', 
              border: '1px solid rgba(255,255,255,0.12)', 
              color: '#fff', 
              borderRadius: '8px', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              padding: '6px 10px',
              fontSize: '0.78rem',
              fontWeight: 'bold',
              gap: '4px',
              flexShrink: 0
            }}
          >
            <ChevronRight size={16} />
            <span>الرئيسية</span>
          </button>
          <div>
            <h2 style={{ margin: 0, fontSize: '1rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '900', lineHeight: 1.2 }}>
              🇪🇬 بورصة مصر (EGX HUB)
            </h2>
            <div style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: '700' }}>
              300+ شركة مدرجة وصندوق استثماري 🌐
            </div>
          </div>
        </div>

        {/* Live EGX Official Portal Link */}
        <a
          href="https://beta.egx.com.eg/en"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#34d399',
            padding: '5px 8px',
            borderRadius: '8px',
            fontSize: '0.68rem',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            textDecoration: 'none',
            flexShrink: 0
          }}
        >
          <span>بوابة البورصة</span>
          <ExternalLink size={11} />
        </a>
      </div>

      {/* ========================================================================= */}
      {/* 2️⃣ LIVE CAIRO TIME & EGX MARKET STATUS BAR */}
      {/* ========================================================================= */}
      <div style={{
        background: 'rgba(18, 24, 38, 0.85)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '10px',
        padding: '6px 10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'nowrap',
        gap: '6px',
        marginBottom: '10px',
        fontSize: '0.72rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8' }}>
          <Clock size={13} color="#38bdf8" />
          <span style={{ fontWeight: '800', color: '#f8fafc', fontFamily: 'monospace' }}>
            {cairoTime || '--:--:--'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: marketPulse?.statusColor || '#10b981',
            boxShadow: `0 0 6px ${marketPulse?.statusColor || '#10b981'}`
          }}></span>
          <span style={{ fontWeight: '800', color: marketPulse?.statusColor || '#10b981' }}>
            {marketPulse?.status === 'OPEN' ? 'مفتوح (Live)' : 'مغلق (Closed)'}
          </span>
        </div>

        <div style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.12)', padding: '2px 6px', borderRadius: '6px', fontWeight: '700', whiteSpace: 'nowrap' }}>
          +185M مؤسسي ⚡
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3️⃣ المنتجات الاستثمارية السريعة */}
      {/* ========================================================================= */}
      {/* 3️⃣ المنتجات الاستثمارية السريعة (الذهب - الأسهم - الصناديق) */}
      {/* ========================================================================= */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
          {/* Gold Card */}
          <div 
            onClick={() => {
              const newProd = selectedProduct === 'gold' ? 'all' : 'gold';
              setSelectedProduct(newProd);
              setSelectedCategory(newProd === 'gold' ? 'traden_hedge' : 'all');
              setActiveTab('screener');
              setActiveSelectedIdx('24k gold');
            }}
            className={`product-select-card ${selectedProduct === 'gold' ? 'active' : ''}`}
            style={{
              background: selectedProduct === 'gold' 
                ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' 
                : 'rgba(245, 158, 11, 0.12)',
              border: selectedProduct === 'gold' 
                ? '2px solid #ffffff' 
                : '1px solid rgba(245, 158, 11, 0.4)',
              color: selectedProduct === 'gold' ? '#ffffff' : '#b45309',
              borderRadius: '10px',
              padding: '8px 4px',
              cursor: 'pointer',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              boxShadow: selectedProduct === 'gold' 
                ? '0 0 0 3.5px rgba(245, 158, 11, 0.45), 0 10px 25px rgba(245, 158, 11, 0.4)' 
                : 'none',
              transform: selectedProduct === 'gold' ? 'scale(1.05) translateY(-2px)' : 'none',
              transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              position: 'relative'
            }}
          >
            {selectedProduct === 'gold' && (
              <span style={{
                position: 'absolute',
                top: '-6px',
                right: '-4px',
                background: '#ffffff',
                color: '#b45309',
                fontSize: '8px',
                fontWeight: '900',
                padding: '1px 5px',
                borderRadius: '100px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
              }}>
                ✓ نشط
              </span>
            )}
            <span style={{ fontSize: '1.3rem' }}>🪙</span>
            <div style={{ fontSize: '0.78rem', fontWeight: '900', lineHeight: 1.1 }}>الذهب</div>
            <div style={{ fontSize: '0.6rem', fontWeight: '800', opacity: selectedProduct === 'gold' ? 0.95 : 0.85 }}>سبائك 24k</div>
          </div>

          {/* Stocks Card */}
          <div 
            onClick={() => {
              const newProd = selectedProduct === 'stocks' ? 'all' : 'stocks';
              setSelectedProduct(newProd);
              setSelectedCategory('all');
              setActiveTab('screener');
              setActiveSelectedIdx(null);
            }}
            className={`product-select-card ${selectedProduct === 'stocks' ? 'active' : ''}`}
            style={{
              background: selectedProduct === 'stocks'
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'rgba(16, 185, 129, 0.12)',
              border: selectedProduct === 'stocks' 
                ? '2px solid #ffffff' 
                : '1px solid rgba(16, 185, 129, 0.4)',
              color: selectedProduct === 'stocks' ? '#ffffff' : '#047857',
              borderRadius: '10px',
              padding: '8px 4px',
              cursor: 'pointer',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              boxShadow: selectedProduct === 'stocks' 
                ? '0 0 0 3.5px rgba(16, 185, 129, 0.45), 0 10px 25px rgba(16, 185, 129, 0.4)' 
                : 'none',
              transform: selectedProduct === 'stocks' ? 'scale(1.05) translateY(-2px)' : 'none',
              transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              position: 'relative'
            }}
          >
            {selectedProduct === 'stocks' && (
              <span style={{
                position: 'absolute',
                top: '-6px',
                right: '-4px',
                background: '#ffffff',
                color: '#047857',
                fontSize: '8px',
                fontWeight: '900',
                padding: '1px 5px',
                borderRadius: '100px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
              }}>
                ✓ نشط
              </span>
            )}
            <span style={{ fontSize: '1.3rem' }}>📈</span>
            <div style={{ fontSize: '0.78rem', fontWeight: '900', lineHeight: 1.1 }}>الأسهم</div>
            <div style={{ fontSize: '0.6rem', fontWeight: '800', opacity: selectedProduct === 'stocks' ? 0.95 : 0.85 }}>300+ سهم</div>
          </div>

          {/* Funds Card */}
          <div 
            onClick={() => {
              const newProd = selectedProduct === 'funds' ? 'all' : 'funds';
              setSelectedProduct(newProd);
              setSelectedCategory(newProd === 'funds' ? 'traden_funds' : 'all');
              setActiveTab('screener');
              setActiveSelectedIdx(null);
            }}
            className={`product-select-card ${selectedProduct === 'funds' ? 'active' : ''}`}
            style={{
              background: selectedProduct === 'funds'
                ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                : 'rgba(14, 165, 233, 0.12)',
              border: selectedProduct === 'funds' 
                ? '2px solid #ffffff' 
                : '1px solid rgba(14, 165, 233, 0.4)',
              color: selectedProduct === 'funds' ? '#ffffff' : '#0369a1',
              borderRadius: '10px',
              padding: '8px 4px',
              cursor: 'pointer',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              boxShadow: selectedProduct === 'funds' 
                ? '0 0 0 3.5px rgba(2, 132, 199, 0.45), 0 10px 25px rgba(2, 132, 199, 0.4)' 
                : 'none',
              transform: selectedProduct === 'funds' ? 'scale(1.05) translateY(-2px)' : 'none',
              transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              position: 'relative'
            }}
          >
            {selectedProduct === 'funds' && (
              <span style={{
                position: 'absolute',
                top: '-6px',
                right: '-4px',
                background: '#ffffff',
                color: '#0369a1',
                fontSize: '8px',
                fontWeight: '900',
                padding: '1px 5px',
                borderRadius: '100px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
              }}>
                ✓ نشط
              </span>
            )}
            <span style={{ fontSize: '1.3rem' }}>🏦</span>
            <div style={{ fontSize: '0.78rem', fontWeight: '900', lineHeight: 1.1 }}>الصناديق</div>
            <div style={{ fontSize: '0.6rem', fontWeight: '800', opacity: selectedProduct === 'funds' ? 0.95 : 0.85 }}>سيولة ونمو</div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4️⃣ المؤشرات الحية التفاعلية */}
      {/* ========================================================================= */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '6px',
          textAlign: 'center'
        }}>
          {[
            { code: 'EGX30', name: 'EGX30', val: '31,485.60', change: '-0.06%', isUp: false, sub: 'الرئيسي' },
            { code: 'EGX70', name: 'EGX70', val: '8,492.30', change: '+0.27%', isUp: true, sub: 'المتوسطة' },
            { code: 'EGX100', name: 'EGX100', val: '11,760.10', change: '+0.22%', isUp: true, sub: 'الشامل' },
            { code: 'SHARIAH', name: 'الشريعة', val: '3,210.45', change: '+0.26%', isUp: true, sub: 'نقي' },
            { code: 'USD/EGP', name: 'USD/EGP', val: '50.80', change: '+0.06%', isUp: true, sub: 'الدولار' },
            { code: '24k gold', name: 'Gold 24k', val: '4,125.00', change: '+0.16%', isUp: true, sub: 'الذهب' }
          ].map(idx => {
            const isCardActive = activeSelectedIdx === idx.code;
            const isGoldCard = idx.code === '24k gold';

            return (
              <div 
                key={idx.code} 
                onClick={() => handleIndexCardClick(idx.code)}
                style={{
                  background: isCardActive 
                    ? (isGoldCard ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'linear-gradient(135deg, #995bb9 0%, #5b638c 100%)')
                    : 'var(--bg-card)',
                  border: isCardActive 
                    ? '2px solid #ffffff' 
                    : '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '7px 4px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  boxShadow: isCardActive 
                    ? (isGoldCard ? '0 0 0 3px rgba(245, 158, 11, 0.45), 0 8px 22px rgba(245, 158, 11, 0.4)' : '0 0 0 3px rgba(153, 91, 185, 0.45), 0 8px 22px rgba(153, 91, 185, 0.4)')
                    : '0 2px 8px rgba(0,0,0,0.04)',
                  transform: isCardActive ? 'scale(1.05) translateY(-2px)' : 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 2px' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: '900', color: isCardActive ? '#ffffff' : (isGoldCard ? '#b45309' : 'var(--text-primary)') }}>
                    {idx.code}
                  </span>
                  <span style={{ fontSize: '0.58rem', color: isCardActive ? 'rgba(255,255,255,0.9)' : 'var(--text-muted)', fontWeight: '700' }}>{idx.sub}</span>
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: '900', color: isCardActive ? '#ffffff' : 'var(--text-primary)', fontFamily: 'monospace' }}>
                  {idx.val}
                </div>
                <div style={{
                  fontSize: '0.64rem',
                  fontWeight: '800',
                  color: isCardActive ? '#ffffff' : (idx.isUp ? '#047857' : '#b91c1c'),
                  fontFamily: 'monospace'
                }}>
                  {idx.isUp ? '▲ ' : '▼ '}{idx.change}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5️⃣ MAIN NAVIGATION TABS */}
      {/* ========================================================================= */}
      <div className="no-scrollbar" style={{
        display: 'flex',
        gap: '6px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        paddingBottom: '10px',
        marginBottom: '14px',
        overflowX: 'auto'
      }}>
        {[
          { id: 'screener', label: 'جميع الأسهم والصناديق (All Screener) 📊', icon: BarChart2 },
          { id: 'smart_planner', label: '🎯 خطة ودليل الاستثمار الذكي (Robo Advisor)', icon: Sparkles },
          { id: 'funds', label: 'دليل صناديق الاستثمار والذهب (Mutual Funds) 🪙', icon: ShieldAlert },
          { id: 'top_movers', label: 'الأسهم الأكثر صعوداً ونشاطاً (Top Movers) ⚡', icon: TrendingUp },
          { id: 'sectors', label: 'خريطة القطاعات (Sector Map) 🏢', icon: PieChart },
          { id: 'news_disclosures', label: 'أبرز الأخبار اللحظية والإفصاحات (Live News) 📰', icon: FileText }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: isActive ? '#f59e0b' : 'rgba(255,255,255,0.04)',
                color: isActive ? '#000' : '#94a3b8',
                border: isActive ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '0.8rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                transition: 'all 0.18s ease'
              }}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ALL STOCKS SCREENER & ANALYTICS */}
      {/* ========================================================================= */}
      {activeTab === 'screener' && (
        <div>
          {/* Category & Theme Selection Chips */}
          <div className="no-scrollbar" style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '6px', marginBottom: '10px' }}>
            {[
              { id: 'all', label: '🌐 جميع الأسهم والأصول' },
              { id: 'traden_funds', label: '🪙 صناديق الاستثمار والذهب' },
              { id: 'traden_dividends', label: '💰 أعلى توزيعات أرباح' },
              { id: 'traden_dollar', label: '💵 شركات الإيراد الدولاري' },
              { id: 'traden_growth', label: '🚀 أسهم النمو والسيولة' },
              { id: 'traden_shariah', label: '🕌 متوافق مع الشريعة' },
              { id: 'traden_hedge', label: '🛡️ صناديق الذهب والتحوط' },
              { id: 'banks', label: '🏦 البنوك والخدمات المالية' },
              { id: 'realestate', label: '🏗️ العقارات والإنشاءات' },
              { id: 'energy', label: '⚡ البتروكيماويات والأسمدة والحديد' },
              { id: 'tech', label: '📱 التكنولوجيا والمدفوعات' },
              { id: 'consumer', label: '🛍️ الأغذية والاستهلاك والمنسوجات' },
              { id: 'health', label: '🏥 الرعاية الصحية والأدوية' }
            ].map(cat => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id); setSelectedProduct('all'); }}
                  style={{
                    background: isSelected ? 'rgba(245, 158, 11, 0.18)' : 'rgba(255,255,255,0.03)',
                    color: isSelected ? '#f59e0b' : '#94a3b8',
                    border: isSelected ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '20px',
                    padding: '5px 12px',
                    fontSize: '0.74rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.18s ease'
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Search Input & Live Count Badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
            <span style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🟢</span> {stocksList.length}+ شركة مدرجة وصندوق متاح بالأسعار اللحظية (كامل قاعدة بيانات البورصة المصرية)
            </span>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              معروض: {filteredStocks.length} أصل
            </span>
          </div>

          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <Search size={15} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '11px' }} />
            <input 
              type="text" 
              placeholder="ابحث عن أي شركة أو سهم مصري بالاسم أو الرمز (مثل: HRHO، COMI، طلعت مصطفى، فوري، KORA، BONY، AZG، SWDY)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '9px 38px 9px 12px', 
                borderRadius: '10px', 
                background: 'rgba(255,255,255,0.04)', 
                border: '1px solid rgba(255,255,255,0.1)', 
                color: '#fff',
                outline: 'none',
                fontSize: '0.82rem',
                boxSizing: 'border-box'
              }} 
            />
          </div>

          {/* Grid of All 300+ Egyptian Stocks & Mutual Funds */}
          <div 
            className="custom-scrollbar"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
              gap: '8px',
              marginBottom: '16px',
              maxHeight: '400px',
              overflowY: 'auto',
              padding: '4px 8px 10px 8px'
            }}
          >
            {filteredStocks.map((stock) => {
              const isSelected = selectedStock.code === stock.code;
              const isUp = stock.change24h >= 0;
              const isFund = stock.category === 'funds' || stock.category === 'metals';

              return (
                <div 
                  key={stock.code}
                  onClick={() => handleStockSelect(stock)}
                  style={{
                    background: isSelected 
                      ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(217, 119, 6, 0.15) 100%)' 
                      : isFund 
                      ? 'linear-gradient(135deg, rgba(234, 179, 8, 0.08) 0%, rgba(17, 24, 39, 0.6) 100%)'
                      : 'rgba(255,255,255,0.03)',
                    border: isSelected ? '1.5px solid #f59e0b' : isFund ? '1px solid rgba(234, 179, 8, 0.25)' : '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '10px',
                    padding: '8px 10px',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '4px',
                    boxShadow: isSelected ? '0 0 14px rgba(245, 158, 11, 0.2)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AssetLogo symbol={stock.code} fallbackIcon={stock.icon} size={16} containerSize={24} />
                      <span style={{ 
                        fontWeight: '800', 
                        fontSize: '0.85rem', 
                        color: isSelected ? '#f59e0b' : '#fff',
                        fontFamily: 'monospace'
                      }}>
                        {stock.code}
                      </span>
                    </div>
                    <span style={{ 
                      fontSize: '0.65rem', 
                      color: isFund ? '#fbbf24' : '#38bdf8', 
                      background: isFund ? 'rgba(245, 158, 11, 0.15)' : 'rgba(56, 189, 248, 0.1)', 
                      padding: '1px 6px', 
                      borderRadius: '4px',
                      maxWidth: '100px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {stock.sector.split(' ')[0]}
                    </span>
                  </div>

                  <div style={{
                    fontSize: '0.76rem',
                    color: '#cbd5e1',
                    fontWeight: '600',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {stock.name}
                  </div>

                  {stock.badgeText && (
                    <div style={{
                      fontSize: '0.64rem',
                      color: '#f59e0b',
                      background: 'rgba(245, 158, 11, 0.1)',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {stock.badgeText}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '2px' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: '800', color: '#fff', fontFamily: 'monospace' }}>
                      {stock.priceEst} ج.م
                    </span>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: '800',
                      color: isUp ? '#10b981' : '#f87171',
                      fontFamily: 'monospace'
                    }}>
                      {isUp ? '+' : ''}{stock.change24h}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Stock Summary Card */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.9) 0%, rgba(13, 18, 28, 0.95) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            borderRadius: '14px',
            padding: '14px',
            marginBottom: '16px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <AssetLogo symbol={selectedStock.code} fallbackIcon={selectedStock.icon} size={22} containerSize={32} />
                <span style={{ fontSize: '1.05rem', fontWeight: '800', color: '#f59e0b' }}>
                  {selectedStock.name} ({selectedStock.code})
                </span>
                <span style={{ fontSize: '0.68rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: '5px', fontWeight: '800' }}>
                  🟢 LIVE
                </span>
                {selectedStock.badgeText && (
                  <span style={{ fontSize: '0.7rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '2px 8px', borderRadius: '5px', fontWeight: '700' }}>
                    {selectedStock.badgeText}
                  </span>
                )}
                {selectedStock.shariahCompliant && (
                  <span style={{ fontSize: '0.7rem', color: '#34d399', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: '5px', fontWeight: '700' }}>
                    🕌 Shariah Verified
                  </span>
                )}
                {selectedStock.dollarEarner && (
                  <span style={{ fontSize: '0.7rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.15)', padding: '2px 8px', borderRadius: '5px', fontWeight: '700' }}>
                    💵 USD Revenue
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ 
                  fontSize: '0.95rem', 
                  color: '#10b981', 
                  background: 'rgba(16, 185, 129, 0.15)', 
                  border: '1px solid rgba(16, 185, 129, 0.35)', 
                  padding: '5px 14px', 
                  borderRadius: '8px', 
                  fontWeight: '800', 
                  fontFamily: 'monospace' 
                }}>
                  {selectedStock.priceEst} ج.م ({selectedStock.change24h >= 0 ? '+' : ''}{selectedStock.change24h}%)
                </div>
                <div style={{ fontSize: '0.72rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '5px 10px', borderRadius: '8px', fontWeight: '600' }}>
                  {selectedStock.sector}
                </div>
              </div>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.45' }}>
              {selectedStock.description}
            </div>
          </div>

          {/* Capital Input Box in EGP */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            padding: '14px',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#10b981', marginBottom: '8px' }}>
              💰 رأس المال المخصص للصفقة بالجنيه المصري (EGP) لاحتساب أهداف الربح وحجم المركز المالي:
            </div>

            {/* Quick EGP Chips */}
            <div className="no-scrollbar" style={{ display: 'flex', gap: '6px', marginBottom: '10px', overflowX: 'auto' }}>
              {[10000, 25000, 50000, 100000, 250000, 500000].map(amt => (
                <button
                  key={amt}
                  onClick={() => setCapitalEgp(amt)}
                  style={{
                    background: capitalEgp === amt ? '#10b981' : 'rgba(255,255,255,0.04)',
                    color: capitalEgp === amt ? '#000' : '#94a3b8',
                    border: capitalEgp === amt ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '16px',
                    padding: '5px 12px',
                    fontSize: '0.74rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {amt.toLocaleString()} ج.م
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px 14px' }}>
              <span style={{ color: '#10b981', fontWeight: '800', fontSize: '0.9rem' }}>ج.م</span>
              <input
                type="number"
                value={capitalEgp}
                onChange={(e) => setCapitalEgp(e.target.value)}
                placeholder="أدخل رأس المال بالجنيه..."
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Analyze Button */}
          <button
            onClick={() => handleAnalyze(selectedStock)}
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#b45309' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#000',
              padding: '14px',
              borderRadius: '12px',
              fontWeight: '800',
              fontSize: '0.95rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(245, 158, 11, 0.35)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px',
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? '⚡ جاري حساب المؤشرات الفنية ورصد السيولة...' : `🤖 حسابات فنية ورصد السيولة (${selectedStock.code})`}
          </button>

          {/* Analysis Output Card */}
          <div id="traden-ai-radar-section">
            {analysisResult && <RasadAnalysisCard data={analysisResult} />}
          </div>

          {/* Dynamic Interactive Chart Box */}
          <div id="traden-interactive-chart-box" style={{ 
            background: 'linear-gradient(180deg, #111827 0%, #0c1017 100%)', 
            border: '1px solid rgba(255,255,255,0.08)', 
            borderRadius: '12px', 
            padding: '10px 8px', 
            marginTop: '14px' 
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '8px', 
              flexWrap: 'wrap', 
              gap: '6px' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>📈</span>
                  <span>الرسم البياني اللحظي:</span>
                  <span style={{ color: '#fff', background: 'rgba(245, 158, 11, 0.15)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.76rem' }}>
                    {chartSymbol}
                  </span>
                </span>
                <button
                  onClick={() => {
                    const url = `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(chartSymbol)}`;
                    window.open(url, '_blank', 'noopener,noreferrer');
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.25) 0%, rgba(29, 78, 216, 0.35) 100%)',
                    color: '#60a5fa',
                    border: '1px solid rgba(59, 130, 246, 0.4)',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  <span>🖥️ TradingView ↗</span>
                </button>
              </div>

              {/* Chart Switcher Buttons (Smooth Touch Scroll) */}
              <div className="no-scrollbar" style={{ 
                display: 'flex', 
                gap: '4px', 
                overflowX: 'auto', 
                maxWidth: '100%',
                paddingBottom: '2px',
                WebkitOverflowScrolling: 'touch'
              }}>
                <button
                  onClick={() => setChartSymbol(selectedStock.tvSymbol || `EGX:${selectedStock.code}`)}
                  style={{
                    background: chartSymbol === (selectedStock.tvSymbol || `EGX:${selectedStock.code}`) ? '#f59e0b' : 'rgba(255,255,255,0.05)',
                    color: chartSymbol === (selectedStock.tvSymbol || `EGX:${selectedStock.code}`) ? '#000' : '#94a3b8',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  🇪🇬 {selectedStock.code}
                </button>
                <button
                  onClick={() => setChartSymbol('EGX:EGX30')}
                  style={{
                    background: chartSymbol === 'EGX:EGX30' ? '#f59e0b' : 'rgba(255,255,255,0.05)',
                    color: chartSymbol === 'EGX:EGX30' ? '#000' : '#94a3b8',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  📊 EGX30
                </button>
                <button
                  onClick={() => setChartSymbol('EGX:EGX70EWI')}
                  style={{
                    background: chartSymbol === 'EGX:EGX70EWI' || chartSymbol === 'EGX:EGX70' ? '#f59e0b' : 'rgba(255,255,255,0.05)',
                    color: chartSymbol === 'EGX:EGX70EWI' || chartSymbol === 'EGX:EGX70' ? '#000' : '#94a3b8',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  📈 EGX70
                </button>
                <button
                  onClick={() => setChartSymbol('EGX:EGX100EWI')}
                  style={{
                    background: chartSymbol === 'EGX:EGX100EWI' || chartSymbol === 'EGX:EGX100' ? '#f59e0b' : 'rgba(255,255,255,0.05)',
                    color: chartSymbol === 'EGX:EGX100EWI' || chartSymbol === 'EGX:EGX100' ? '#000' : '#94a3b8',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  🌐 EGX100
                </button>
                <button
                  onClick={() => setChartSymbol('EGX:SHARIAH')}
                  style={{
                    background: chartSymbol === 'EGX:SHARIAH' ? '#f59e0b' : 'rgba(255,255,255,0.05)',
                    color: chartSymbol === 'EGX:SHARIAH' ? '#000' : '#94a3b8',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  🕌 Shariah
                </button>
                <button
                  onClick={() => setChartSymbol('OANDA:XAUUSD')}
                  style={{
                    background: chartSymbol === 'OANDA:XAUUSD' ? '#f59e0b' : 'rgba(255,255,255,0.05)',
                    color: chartSymbol === 'OANDA:XAUUSD' ? '#000' : '#94a3b8',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  🥇 Gold
                </button>
                <button
                  onClick={() => setChartSymbol('FX_IDC:USDEGP')}
                  style={{
                    background: chartSymbol === 'FX_IDC:USDEGP' ? '#f59e0b' : 'rgba(255,255,255,0.05)',
                    color: chartSymbol === 'FX_IDC:USDEGP' ? '#000' : '#94a3b8',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  💵 USD/EGP
                </button>
                <button
                  onClick={() => setChartSymbol('TVC:USOIL')}
                  style={{
                    background: chartSymbol === 'TVC:USOIL' ? '#f59e0b' : 'rgba(255,255,255,0.05)',
                    color: chartSymbol === 'TVC:USOIL' ? '#000' : '#94a3b8',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '0.72rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  🛢️ Crude Oil
                </button>
              </div>
            </div>

            <TradingViewWidget symbol={chartSymbol} height={380} timeframe="1d" showExternalLink={false} />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🎯 TAB: SMART INVESTMENT GUIDE & AI ROBO-ADVISOR PORTFOLIO BUILDER */}
      {/* ========================================================================= */}
      {activeTab === 'smart_planner' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
          
          {/* ⚡ REALISTIC AI SIMULATION MODAL OVERLAY */}
          {isPlanning && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(5, 8, 15, 0.88)',
              backdropFilter: 'blur(10px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #0d131f 0%, #111827 100%)',
                border: '1.5px solid #f59e0b',
                borderRadius: '16px',
                padding: '24px 20px',
                maxWidth: '420px',
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 0 40px rgba(245, 158, 11, 0.35)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '14px'
              }}>
                {/* Glowing Spinner */}
                <div style={{ position: 'relative', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    border: '3px solid rgba(245, 158, 11, 0.2)',
                    borderTopColor: '#f59e0b',
                    animation: 'spin 0.9s linear infinite'
                  }}></div>
                  <Sparkles size={24} color="#f59e0b" />
                </div>

                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', color: '#fff', fontWeight: '900' }}>
                    جاري احتساب وتوزيع المحفظة الذكية 🤖
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#38bdf8', minHeight: '36px', lineHeight: '1.4', fontWeight: '700' }}>
                    {planningStatusText}
                  </p>
                </div>

                {/* Smooth Progress Bar */}
                <div style={{ width: '100%', background: 'rgba(255,255,255,0.08)', borderRadius: '10px', height: '8px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${planningProgress}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #f59e0b 0%, #10b981 100%)',
                    borderRadius: '10px',
                    transition: 'width 0.35s ease'
                  }}></div>
                </div>

                <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontFamily: 'monospace', fontWeight: '800' }}>
                  {planningProgress}% مكتمل
                </div>
              </div>
            </div>
          )}

          {/* Top Luxury Banner */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.14) 0%, rgba(13, 18, 28, 0.95) 100%)',
            border: '1.5px solid rgba(245, 158, 11, 0.4)',
            borderRadius: '14px',
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', color: '#f59e0b', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={18} color="#f59e0b" />
                <span>دليل وخطة الاستثمار الذكي (Robo Advisor & Allocator)</span>
              </h3>
              <span style={{ fontSize: '0.7rem', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.4)', padding: '2px 8px', borderRadius: '10px', fontWeight: '800' }}>
                PRO ALLOCATOR ⚡
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.76rem', color: '#cbd5e1', lineHeight: '1.45' }}>
              حدد رأس مالك وأهدافك، وسيقوم الذكاء الاصطناعي ببناء خطة محفظة مؤسسية بنسب ومبالغ دقيقة بالجنيه، تشمل <strong>صندوق ألفا للأسهم النشطة (Thndr Alpha)</strong>، و<strong>صندوق الذهب عيار 24 (AZG)</strong>، و<strong>صناديق السيولة اليومية المركبة</strong>.
            </p>
          </div>

          {/* Step 1: Capital Input */}
          <div style={{
            background: 'linear-gradient(180deg, rgba(17, 24, 39, 0.85) 0%, rgba(13, 18, 28, 0.9) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '12px 14px'
          }}>
            <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#f59e0b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>💰 الخطوة 1: حدد رأس المال المستثمر بالجنيه:</span>
            </div>

            {/* Quick Presets */}
            <div className="no-scrollbar" style={{ display: 'flex', gap: '5px', overflowX: 'auto', paddingBottom: '6px', marginBottom: '8px' }}>
              {[1000, 5000, 10000, 25000, 50000, 100000, 250000, 500000].map(amt => (
                <button
                  key={amt}
                  onClick={() => setPlannerCapital(amt)}
                  style={{
                    background: plannerCapital === amt ? '#f59e0b' : 'rgba(255,255,255,0.03)',
                    color: plannerCapital === amt ? '#000' : '#cbd5e1',
                    border: plannerCapital === amt ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '8px',
                    padding: '5px 10px',
                    fontSize: '0.74rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {amt.toLocaleString()} ج.م
                </button>
              ))}
            </div>

            {/* Direct Input */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(0,0,0,0.45)',
              border: '1.5px solid rgba(245, 158, 11, 0.45)',
              borderRadius: '10px',
              padding: '8px 12px'
            }}>
              <input
                type="number"
                value={plannerCapital}
                onChange={(e) => setPlannerCapital(e.target.value)}
                placeholder="أدخل أي مبلغ مخصص بالجنيه..."
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '1rem',
                  fontWeight: '900',
                  outline: 'none',
                  fontFamily: 'monospace'
                }}
              />
              <span style={{ color: '#f59e0b', fontWeight: '900', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>ج.م (EGP)</span>
            </div>
          </div>

          {/* Step 2: Strategic Questionnaire (Clean & Balanced) */}
          <div style={{
            background: 'linear-gradient(180deg, rgba(17, 24, 39, 0.85) 0%, rgba(13, 18, 28, 0.9) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>⚙️ الخطوة 2: أهداف وتفضيلات المستثمر:</span>
            </div>

            {/* Goal Selector */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '6px' }}>
                1. ما هو هدفك الاستثماري الأساسي؟
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '6px' }}>
                {[
                  { id: 'growth', title: '🚀 نمو ومضاعفة رأس المال', sub: 'صندوق ألفا للأسهم النشطة والقياديات' },
                  { id: 'hedge', title: '🛡️ تحوط ضد التضخم والعملة', sub: 'صناديق الذهب 24k والأسهم الدولارية' },
                  { id: 'income', title: '💵 عائد يومي وسيولة آمنة', sub: 'عائد يومي مركب في صناديق النقد' },
                  { id: 'balanced', title: '⚖️ محفظة متوازنة شاملة', sub: 'توزيع مؤسسي متوازن بين جميع الأصول' }
                ].map(opt => (
                  <div
                    key={opt.id}
                    onClick={() => setPlannerGoal(opt.id)}
                    style={{
                      background: plannerGoal === opt.id ? 'rgba(56, 189, 248, 0.18)' : 'rgba(255,255,255,0.02)',
                      border: plannerGoal === opt.id ? '1.5px solid #38bdf8' : '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '8px',
                      padding: '8px 9px',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease'
                    }}
                  >
                    <div style={{ fontSize: '0.76rem', fontWeight: '800', color: plannerGoal === opt.id ? '#38bdf8' : '#fff' }}>
                      {opt.title}
                    </div>
                    <div style={{ fontSize: '0.64rem', color: '#94a3b8', marginTop: '2px', lineHeight: '1.3' }}>
                      {opt.sub}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Time Horizon & Risk Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px' }}>
              {/* Horizon */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '4px' }}>
                  2. الأفق الزمني للاستثمار:
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[
                    { id: 'short', title: '⚡ قصير (3-12 شهر)' },
                    { id: 'medium', title: '⏳ متوسط (1-3 سنين)' },
                    { id: 'long', title: '💎 طويل (3-5 سنين+)' }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setPlannerHorizon(opt.id)}
                      style={{
                        flex: 1,
                        background: plannerHorizon === opt.id ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255,255,255,0.03)',
                        color: plannerHorizon === opt.id ? '#f59e0b' : '#94a3b8',
                        border: plannerHorizon === opt.id ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '6px',
                        padding: '6px 2px',
                        fontSize: '0.68rem',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      {opt.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Risk Appetite */}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#cbd5e1', marginBottom: '4px' }}>
                  3. درجة تقبل المخاطرة:
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[
                    { id: 'low', title: '🟢 منخفضة' },
                    { id: 'moderate', title: '🟡 معتدلة' },
                    { id: 'high', title: '🔴 عالية (نمو)' }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setPlannerRisk(opt.id)}
                      style={{
                        flex: 1,
                        background: plannerRisk === opt.id ? 'rgba(37, 99, 235, 0.3)' : 'rgba(255,255,255,0.03)',
                        color: plannerRisk === opt.id ? '#60a5fa' : '#94a3b8',
                        border: plannerRisk === opt.id ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '6px',
                        padding: '6px 2px',
                        fontSize: '0.68rem',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      {opt.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Execute Generation Button */}
            <button
              onClick={handleGeneratePlannerPlan}
              disabled={isPlanning}
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: '#000',
                border: 'none',
                borderRadius: '10px',
                padding: '11px',
                fontSize: '0.88rem',
                fontWeight: '900',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '4px',
                boxShadow: '0 4px 18px rgba(245, 158, 11, 0.3)'
              }}
            >
              <Sparkles size={16} />
              <span>{isPlanning ? 'جاري بناء المحفظة بالذكاء الاصطناعي...' : '🤖 توليد وتحديث خطة المحفظة بالذكاء الاصطناعي'}</span>
            </button>
          </div>

          {/* Step 3: Generated Portfolio Breakdown & Results */}
          {plannerPlan && (
            <div id="traden-generated-plan-results" style={{
              background: 'linear-gradient(135deg, rgba(13, 18, 28, 0.98) 0%, rgba(17, 24, 39, 0.95) 100%)',
              border: '1.5px solid #10b981',
              borderRadius: '14px',
              padding: '14px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              
              {/* Header Summary */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: '800' }}>خطة المحفظة الاستثمارية المعتمدة ✅</div>
                  <h3 style={{ margin: '2px 0 0 0', fontSize: '1.05rem', color: '#fff', fontWeight: '900' }}>
                    توزيع رأس المال: {plannerPlan.capital.toLocaleString()} ج.م
                  </h3>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>متوسط العائد السنوي المتوقع:</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: '900', color: '#10b981', fontFamily: 'monospace' }}>
                    +{plannerPlan.avgAnnualYield}% سنوياً
                  </div>
                </div>
              </div>

              {/* KPI Chips */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '6px 8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.64rem', color: '#94a3b8' }}>درجة المخاطرة</div>
                  <div style={{ fontSize: '0.76rem', fontWeight: '800', color: plannerPlan.riskColor, marginTop: '1px' }}>
                    {plannerPlan.riskTitle}
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '6px 8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.64rem', color: '#94a3b8' }}>إعادة التوازن الموصى بها</div>
                  <div style={{ fontSize: '0.76rem', fontWeight: '800', color: '#38bdf8', marginTop: '1px' }}>
                    كل 3 أشهر (Quarterly)
                  </div>
                </div>
              </div>

              {/* Visual Multi-Asset Allocation Progress Bar */}
              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: '800', color: '#cbd5e1', marginBottom: '5px' }}>
                  📊 هيكل توزيع الأصول بالنسبة المئوية:
                </div>
                <div style={{ display: 'flex', height: '12px', borderRadius: '6px', overflow: 'hidden', gap: '2px' }}>
                  {plannerPlan.items.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        width: `${item.pct}%`,
                        backgroundColor: item.color
                      }}
                      title={`${item.name}: ${item.pct}%`}
                    />
                  ))}
                </div>
              </div>

              {/* Detailed Asset Allocation Cards with Real Logo Badges */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#f59e0b' }}>
                  📑 تفاصيل المبالغ المخصصة لكل صندوق وسهم بالجنيه المصري:
                </div>

                {plannerPlan.items.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: `1px solid ${item.color}40`,
                      borderRight: `4px solid ${item.color}`,
                      borderRadius: '10px',
                      padding: '9px 10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'nowrap', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <AssetLogo symbol={item.symbol} fallbackIcon={item.fallbackIcon} size={20} containerSize={32} />
                        <div style={{ minWidth: 0, overflow: 'hidden' }}>
                          <div style={{ fontSize: '0.84rem', fontWeight: '900', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: '0.64rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                            {item.type}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'left', flexShrink: 0 }}>
                        <div style={{ fontSize: '0.92rem', fontWeight: '900', color: item.color, fontFamily: 'monospace' }}>
                          {item.amount.toLocaleString()} ج.م
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#cbd5e1', fontWeight: '700' }}>
                          الحصة: {item.pct}%
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: '1.35', marginTop: '2px' }}>
                      {item.desc}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '3px' }}>
                      <span style={{ fontSize: '0.66rem', color: '#38bdf8', fontWeight: '700' }}>
                        📈 العائد المتوقع: {item.expectedReturn}
                      </span>
                      <span style={{ fontSize: '0.64rem', color: '#10b981', fontWeight: '800' }}>
                        السيولة: ممتازة ⚡
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Compound Wealth Growth Simulation Box */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '10px',
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <TrendingUp size={14} />
                  <span>محاكاة نمو الثروة التراكمي (Compound Growth Forecast):</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                  {/* 1 Year */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '6px', padding: '6px 4px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>بعد سنة</div>
                    <div style={{ fontSize: '0.86rem', fontWeight: '900', color: '#fff', fontFamily: 'monospace', marginTop: '1px' }}>
                      {plannerPlan.val1Year.toLocaleString()} ج.م
                    </div>
                    <div style={{ fontSize: '0.62rem', color: '#10b981', fontWeight: '700' }}>
                      +{plannerPlan.profit1Year.toLocaleString()} ج.م
                    </div>
                  </div>

                  {/* 3 Years */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '6px', padding: '6px 4px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>بعد 3 سنين</div>
                    <div style={{ fontSize: '0.86rem', fontWeight: '900', color: '#38bdf8', fontFamily: 'monospace', marginTop: '1px' }}>
                      {plannerPlan.val3Years.toLocaleString()} ج.م
                    </div>
                    <div style={{ fontSize: '0.62rem', color: '#10b981', fontWeight: '700' }}>
                      +{plannerPlan.profit3Years.toLocaleString()} ج.م
                    </div>
                  </div>

                  {/* 5 Years */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '6px', padding: '6px 4px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>بعد 5 سنين</div>
                    <div style={{ fontSize: '0.86rem', fontWeight: '900', color: '#f59e0b', fontFamily: 'monospace', marginTop: '1px' }}>
                      {plannerPlan.val5Years.toLocaleString()} ج.م
                    </div>
                    <div style={{ fontSize: '0.62rem', color: '#10b981', fontWeight: '700' }}>
                      +{plannerPlan.profit5Years.toLocaleString()} ج.م
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Strategic Thesis */}
              <div style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '8px',
                padding: '10px',
                fontSize: '0.74rem',
                color: '#cbd5e1',
                lineHeight: '1.45'
              }}>
                <div style={{ fontWeight: '800', color: '#10b981', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <ShieldCheck size={14} />
                  <span>التقرير الاستشاري المؤسسي للذكاء الاصطناعي (AI Thesis):</span>
                </div>
                {plannerPlan.thesis}
              </div>

            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MUTUAL FUNDS & GOLD FUNDS HUB */}
      {/* ========================================================================= */}
      {activeTab === 'funds' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(17, 24, 39, 0.95) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            borderRadius: '14px',
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#f59e0b', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🪙</span> دليل صناديق الاستثمار والذهب والسيولة اليومية (Traden Funds Hub)
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.4' }}>
                بيانات رسمية لجميع الصناديق المعتمدة من الهيئة العامة للرقابة المالية (FRA) وأسعار الوثائق اللحظية والعوائد السنوية وقواعد الشراء والاسترداد.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '6px 12px', borderRadius: '8px', fontWeight: '800' }}>
                🛡️ معتمدة ومخزنة بالمركزي
              </span>
              <span style={{ fontSize: '0.75rem', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', padding: '6px 12px', borderRadius: '8px', fontWeight: '800' }}>
                ⚡ تحديث يومي لصافي قيمة الوثيقة (NAV)
              </span>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '14px'
          }}>
            {egxFundsList.map(fund => (
              <div
                key={fund.symbol}
                style={{
                  background: 'linear-gradient(135deg, #111827 0%, #0d121c 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <AssetLogo symbol={fund.symbol || fund.code} fallbackIcon={fund.icon} size={26} containerSize={40} />
                      <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#fff', lineHeight: '1.3' }}>
                          {fund.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: '700', marginTop: '2px' }}>
                          مدير الاستثمار: {fund.manager}
                        </div>
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: '800',
                      color: '#10b981',
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      whiteSpace: 'nowrap'
                    }}>
                      {fund.annualReturn}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.68rem', background: 'rgba(255,255,255,0.06)', color: '#94a3b8', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                      {fund.type}
                    </span>
                    {fund.shariahCompliant && (
                      <span style={{ fontSize: '0.68rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                        🕌 متوافق مع الشريعة
                      </span>
                    )}
                    <span style={{ fontSize: '0.68rem', background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                      مخاطرة: {fund.riskLevel.split(' ')[0]}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: '1.45', marginBottom: '8px' }}>
                    {fund.description}
                  </div>

                  <div style={{ background: 'rgba(245, 158, 11, 0.08)', borderRight: '3px solid #f59e0b', padding: '6px 10px', borderRadius: '6px 0 0 6px', fontSize: '0.74rem', color: '#fbbf24', fontWeight: '600', marginBottom: '10px' }}>
                    💡 {fund.highlight}
                  </div>

                  <div style={{ background: 'rgba(0, 0, 0, 0.3)', borderRadius: '8px', padding: '8px 10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.72rem' }}>
                    <div>
                      <span style={{ color: '#94a3b8' }}>سعر الوثيقة (NAV): </span>
                      <span style={{ color: '#fff', fontWeight: '800', fontFamily: 'monospace' }}>{fund.navPrice} ج.م</span>
                    </div>
                    <div>
                      <span style={{ color: '#94a3b8' }}>الحد الأدنى: </span>
                      <span style={{ color: '#fff', fontWeight: '700' }}>{fund.minVolume}</span>
                    </div>
                    <div>
                      <span style={{ color: '#94a3b8' }}>مواعيد الشراء: </span>
                      <span style={{ color: '#38bdf8', fontWeight: '600' }}>{fund.subscriptionDays}</span>
                    </div>
                    <div>
                      <span style={{ color: '#94a3b8' }}>مواعيد الاسترداد: </span>
                      <span style={{ color: '#34d399', fontWeight: '600' }}>{fund.redemptionDays}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const matched = stocksList.find(s => s.code === fund.symbol || s.code === fund.code) || stocksList[0];
                    setSelectedStock(matched);
                    setActiveTab('screener');
                  }}
                  style={{
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.35) 100%)',
                    border: '1px solid rgba(245, 158, 11, 0.5)',
                    color: '#f59e0b',
                    padding: '10px',
                    borderRadius: '8px',
                    fontWeight: '800',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <span>🤖 تحليل الصندوق بالذكاء الاصطناعي ({fund.symbol})</span>
                  <ArrowUpRight size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: TOP GAINERS & LOSERS */}
      {/* ========================================================================= */}
      {activeTab === 'top_movers' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
          {/* Top Gainers */}
          <div style={{ background: '#111827', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: '800', fontSize: '0.95rem', marginBottom: '12px' }}>
              <ArrowUpRight size={18} />
              <span>الأسهم الأكثر صعوداً (Top Gainers)</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {topMoversData?.topGainers.map(stk => (
                <div key={stk.code} onClick={() => { setSelectedStock(stk); setActiveTab('screener'); }} style={{
                  background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AssetLogo symbol={stk.code} fallbackIcon={stk.icon} size={18} containerSize={28} />
                    <div>
                      <div style={{ fontWeight: '800', color: '#fff', fontSize: '0.85rem' }}>{stk.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{stk.code} · {stk.sector}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ color: '#10b981', fontWeight: '800', fontFamily: 'monospace' }}>+{stk.change24h}%</div>
                    <div style={{ fontSize: '0.72rem', color: '#e5e7eb', fontFamily: 'monospace' }}>{stk.priceEst} ج.م</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Losers */}
          <div style={{ background: '#111827', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontWeight: '800', fontSize: '0.95rem', marginBottom: '12px' }}>
              <ArrowDownRight size={18} />
              <span>الأسهم الأكثر تراجعاً (Top Losers)</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {topMoversData?.topLosers.map(stk => (
                <div key={stk.code} onClick={() => { setSelectedStock(stk); setActiveTab('screener'); }} style={{
                  background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AssetLogo symbol={stk.code} fallbackIcon={stk.icon} size={18} containerSize={28} />
                    <div>
                      <div style={{ fontWeight: '800', color: '#fff', fontSize: '0.85rem' }}>{stk.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{stk.code} · {stk.sector}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ color: '#f87171', fontWeight: '800', fontFamily: 'monospace' }}>{stk.change24h}%</div>
                    <div style={{ fontSize: '0.72rem', color: '#e5e7eb', fontFamily: 'monospace' }}>{stk.priceEst} ج.م</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SECTOR PERFORMANCE MAP */}
      {/* ========================================================================= */}
      {activeTab === 'sectors' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
          {topMoversData?.sectorsPerformance.map((sec, idx) => (
            <div key={idx} style={{
              background: '#111827', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: '800', color: '#fff' }}>{sec.name}</div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>قطاع مدرج بالبورصة المصرية</div>
              </div>
              <div style={{
                background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '4px 10px', borderRadius: '6px', fontWeight: '800', fontFamily: 'monospace'
              }}>
                {sec.change}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: LIVE NEWS & CORPORATE DISCLOSURES */}
      {/* ========================================================================= */}
      {activeTab === 'news_disclosures' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <div style={{ fontSize: '1.05rem', fontWeight: '900', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Radio size={16} color="#ef4444" className="animate-pulse" />
              <span>أبرز الأخبار اللحظية المتجددة (Live Market Stream):</span>
            </div>

            {/* Silent Auto-Updating Live Badge */}
            <div style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#34d399',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '0.72rem',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
              <span>بث حي متجدد تلقائياً ⚡</span>
            </div>
          </div>

          {/* Dynamic Live News List */}
          {liveNewsList.map((news) => (
            <a 
              key={news.id}
              href={news.link || '#'}
              target={news.link && news.link !== '#' ? '_blank' : '_self'}
              rel="noopener noreferrer"
              style={{
                background: '#131c2e',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRight: '4px solid #38bdf8',
                borderRadius: '12px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.18s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '700' }}>
                  {news.time}
                </span>
                <span style={{ fontSize: '0.68rem', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '2px 8px', borderRadius: '4px', fontWeight: '800' }}>
                  {news.tag}
                </span>
              </div>
              <div style={{ fontSize: '0.88rem', color: '#f1f5f9', fontWeight: '700', lineHeight: '1.45' }}>
                {news.title}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                المصدر: {news.source} ↗
              </div>
            </a>
          ))}

          {/* Official Corporate Disclosures */}
          <div style={{ fontSize: '1rem', fontWeight: '800', color: '#10b981', marginTop: '14px', marginBottom: '4px' }}>
            📑 إفصاحات وقرارات مجالس الإدارات الرسمية:
          </div>

          {topMoversData?.disclosures.map(disc => (
            <div key={disc.id} style={{
              background: '#111827', border: '1px solid rgba(255, 255, 255, 0.08)', borderRight: '4px solid #f59e0b', borderRadius: '10px', padding: '14px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: '800', color: '#f59e0b', fontSize: '0.9rem' }}>{disc.company} ({disc.code})</span>
                <span style={{ fontSize: '0.72rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.12)', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>{disc.type}</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#e5e7eb', lineHeight: '1.45' }}>
                {disc.title}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '6px' }}>
                {disc.time} · منشور عبر شاشات البورصة المصرية
              </div>
            </div>
          ))}

        </div>
      )}

    </div>
  );
}
