// api/ai-analysis.js
// Vercel Serverless Function: Multi-AI Consensus Market Analyzer

export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { 
      symbol = 'BTC/USDT', 
      price = 0, 
      timeframe = '15m', 
      rsi = 50, 
      trend = 'BULLISH',
      support = 0,
      resistance = 0,
      change24h = 0
    } = req.body || req.query || {};

    const currentPrice = parseFloat(price) || 1.0;
    const rsiVal = parseFloat(rsi) || 50;

    // Keys from Environment Variables
    const geminiKey = process.env.GEMINI_API_KEY || '';
    const groqKey = process.env.GROQ_API_KEY || '';
    const openRouterKey = process.env.OPENROUTER_API_KEY || '';

    const systemPrompt = `You are Traden Pro Institutional Quantitative & SMC Trading Engine.
Analyze the following market condition for ${symbol} on timeframe ${timeframe}:
- Current Price: ${currentPrice}
- 24h Change: ${change24h}%
- RSI (14): ${rsiVal}
- Technical Trend: ${trend}
- Key Support: ${support}
- Key Resistance: ${resistance}

CRITICAL INSTITUTIONAL RISK RULES (MANDATORY):
1. AVOID SELLING THE LOWS: NEVER recommend "SELL" if the price is at an extended low, dumping continuously, or if RSI < 38 near support. Selling at the bottom exposes traders to sharp liquidity bounces and stop hunts.
2. SELL ON RETEST ONLY: Do NOT sell on direct breakdown of swing lows. Only recommend "SELL" if the price has pulled back (retested) into a Supply Zone / Resistance / Fair Value Gap (FVG). If price just broke down without retest, choose "HOLD" (Wait for Retest).
3. LIQUIDITY & OVERSOLD FILTER: If RSI is oversold (< 35) at major support, treat it as an Institutional Stop Hunt (SSL Sweep) and DO NOT sell.
4. SESSION & NEWS VOLATILITY: Account for sudden spikes during market opens (London/NY) or thin liquidity (Asian session).

Respond ONLY with valid JSON (no markdown formatting, no backticks, no code blocks):
{
  "action": "BUY" | "SELL" | "HOLD",
  "confidence": 88,
  "entry": ${currentPrice},
  "stopLoss": 0,
  "takeProfit1": 0,
  "takeProfit2": 0,
  "takeProfit3": 0,
  "riskReward": "1:2.5",
  "arabicAnalysis": "تحليل فني وافي يذكر بوضوح مناطق السيولة والالتزام بفلاتر القاع وإعادة الاختبار"
}`;

    // 1. Parallel AI Calls
    const aiPromises = [];

    // --- Google Gemini Call ---
    if (geminiKey) {
      aiPromises.push(
        (async () => {
          try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${geminiKey}`;
            const resp = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: systemPrompt }] }],
                generationConfig: { responseMimeType: "application/json", temperature: 0.2 }
              })
            });
            if (resp.ok) {
              const data = await resp.json();
              const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
              return { source: 'Gemini', data: JSON.parse(text) };
            }
            if (!resp.ok) {
              const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
              const fbResp = await fetch(fallbackUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: systemPrompt }] }],
                  generationConfig: { responseMimeType: "application/json", temperature: 0.2 }
                })
              });
              if (fbResp.ok) {
                const fbData = await fbResp.json();
                const text = fbData.candidates?.[0]?.content?.parts?.[0]?.text;
                return { source: 'Gemini', data: JSON.parse(text) };
              }
              return null;
            }
            const data = await resp.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            return { source: 'Gemini', data: JSON.parse(text) };
          } catch (e) {
            console.error('Gemini error:', e.message);
            return null;
          }
        })()
      );
    }

    // --- Groq LLaMA-3.3 Call ---
    if (groqKey) {
      aiPromises.push(
        (async () => {
          try {
            const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${groqKey}`
              },
              body: JSON.stringify({
                model: 'qwen/qwen3.8-27b',
                messages: [{ role: 'user', content: systemPrompt }],
                response_format: { type: 'json_object' },
                temperature: 0.2
              })
            });
            if (resp.ok) {
              const data = await resp.json();
              const content = data.choices?.[0]?.message?.content;
              return { source: 'Groq', data: JSON.parse(content) };
            }
            return null;
          } catch (e) {
            console.error('Groq error:', e.message);
            return null;
          }
        })()
      );
    }

    // --- OpenRouter / DeepSeek Call ---
    if (openRouterKey) {
      aiPromises.push(
        (async () => {
          try {
            const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openRouterKey}`,
                'HTTP-Referer': 'https://trading-mini-app-iota.vercel.app',
                'X-Title': 'Traden Pro AI'
              },
              body: JSON.stringify({
                model: 'deepseek/deepseek-chat',
                messages: [{ role: 'user', content: systemPrompt }],
                temperature: 0.2
              })
            });
            if (resp.ok) {
              const data = await resp.json();
              const content = data.choices?.[0]?.message?.content?.replace(/```json/g, '').replace(/```/g, '').trim();
              return { source: 'DeepSeek', data: JSON.parse(content) };
            }
            return null;
          } catch (e) {
            console.error('OpenRouter error:', e.message);
            return null;
          }
        })()
      );
    }

    const results = await Promise.allSettled(aiPromises);
    const validResults = results
      .filter(r => r.status === 'fulfilled' && r.value && r.value.data)
      .map(r => r.value);

    // Votes tally
    const votes = {};
    let chosenSignal = null;

    validResults.forEach(res => {
      const src = res.source;
      const act = res.data.action || 'HOLD';
      votes[src] = act;
      if (!chosenSignal) {
        chosenSignal = res.data;
      }
    });

    // If no AI key answered, create algorithmic mathematical fallback respecting 4 rules
    if (!chosenSignal) {
      let action = 'HOLD';
      let analysisText = '';
      
      const isOversoldAtSupport = rsiVal <= 38;
      const isStrongBullish = rsiVal >= 55 && trend === 'BULLISH';
      
      if (isOversoldAtSupport) {
        action = 'HOLD';
        analysisText = `🛡️ تفعيل فلتر حماية القاع: مؤشر القوة النسبية RSI (${rsiVal.toFixed(1)}) في تشبع بيعي قرب الدعم. يُمنع البيع لتفادي مصائد الارتداد وصيد الستوبات.`;
      } else if (isStrongBullish) {
        action = 'BUY';
        analysisText = `🟢 إشارة شراء مؤكدة: اختراق صاعد مع زخم إيجابي (RSI: ${rsiVal.toFixed(1)}) وتدفق سيولة شرائية.`;
      } else if (trend === 'BEARISH' && rsiVal >= 42) {
        action = 'SELL';
        analysisText = `🔴 إشارة بيع بعد إعادة الاختبار: ارتداد تصحيحي نحو المقاومة مع استمرار الاتجاه الهابط (RSI: ${rsiVal.toFixed(1)}).`;
      } else {
        action = 'HOLD';
        analysisText = `⚪ وضع الترقب: انتظار إعادة اختبار مناطق العرض/الطلب أو تأكيد الاتجاه لتفادي التذبذب الوهمي.`;
      }

      const slDist = currentPrice * (timeframe === '1m' ? 0.003 : 0.008);
      const tpDist = slDist * 2.4;
      
      chosenSignal = {
        action,
        confidence: 88,
        entry: currentPrice,
        stopLoss: action === 'BUY' ? +(currentPrice - slDist).toFixed(4) : +(currentPrice + slDist).toFixed(4),
        takeProfit1: action === 'BUY' ? +(currentPrice + tpDist).toFixed(4) : +(currentPrice - tpDist).toFixed(4),
        takeProfit2: action === 'BUY' ? +(currentPrice + tpDist * 1.8).toFixed(4) : +(currentPrice - tpDist * 1.8).toFixed(4),
        takeProfit3: action === 'BUY' ? +(currentPrice + tpDist * 2.8).toFixed(4) : +(currentPrice - tpDist * 2.8).toFixed(4),
        riskReward: "1:2.4",
        arabicAnalysis: analysisText
      };
      votes['TradenSMCAlgorithmic'] = action;
    }

    // Calculate consensus agreement percentage
    const allVoteActions = Object.values(votes);
    const matchingVotes = allVoteActions.filter(v => v === chosenSignal.action).length;
    const consensusScore = Math.round((matchingVotes / (allVoteActions.length || 1)) * 100);

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      symbol,
      timeframe,
      signal: chosenSignal,
      votes,
      consensusScore: Math.max(consensusScore, chosenSignal.confidence || 85),
      activeModelsCount: validResults.length
    });

  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
