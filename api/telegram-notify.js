// api/telegram-notify.js
// Vercel Serverless Function: Send verified signals to Telegram

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { 
      symbol = 'BTC/USDT',
      action = 'BUY',
      entry = 0,
      stopLoss = 0,
      takeProfit1 = 0,
      takeProfit2 = 0,
      takeProfit3 = 0,
      confidence = 90,
      reason = ''
    } = req.body || {};

    const botToken = process.env.TELEGRAM_TOKEN || "";
    const chatId = process.env.TELEGRAM_CHAT_ID || "";

    const emoji = action === 'BUY' ? '🟢 شراء قوي (BUY)' : '🔴 بيع قوي (SELL)';
    const text = `🤖 <b>إشارة تداول ذكية معتمدة (Traden Multi-AI)</b>\n\n` +
      `📌 <b>الأصل:</b> <code>${symbol}</code>\n` +
      `⚡ <b>نوع الصفقة:</b> ${emoji}\n` +
      `🎯 <b>سعر الدخول:</b> <code>${entry}</code>\n` +
      `🛑 <b>وقف الخسارة (SL):</b> <code>${stopLoss}</code>\n` +
      `✅ <b>الهدف الأول (TP1):</b> <code>${takeProfit1}</code>\n` +
      `🚀 <b>الهدف الثاني (TP2):</b> <code>${takeProfit2}</code>\n` +
      `💎 <b>الهدف الثالث (TP3):</b> <code>${takeProfit3}</code>\n` +
      `📊 <b>نسبة تأكيد النماذج:</b> <code>${confidence}%</code>\n\n` +
      `📝 <b>التحليل الفني:</b>\n<i>${reason}</i>\n\n` +
      `✨ <i>تم التحليل والتأكيد بواسطة: Google Gemini & Groq & DeepSeek</i>`;

    const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML'
      })
    });

    const tgData = await tgRes.json();
    return res.status(200).json({ success: tgData.ok, result: tgData });
  } catch (error) {
    console.error('Telegram error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
