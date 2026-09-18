module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY не настроен в переменных окружения Vercel' });
  }

  const { messages, hasImage } = req.body || {};
  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: 'Поле messages обязательно' });
  }

  // Фото умеет анализировать только vision-модель, для обычного текста используем основную
  const model = hasImage ? 'qwen/qwen3.6-27b' : 'openai/gpt-oss-120b';

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ model, messages, max_tokens: 1000 })
    });
    const data = await groqRes.json();
    return res.status(groqRes.status).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
