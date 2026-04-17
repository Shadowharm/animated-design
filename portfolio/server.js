import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fetch from 'node-fetch';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3850;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, 'public')));


const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

app.post('/track', async (req, res) => {
  try {
    const data = req.body;

    const message = `
🧠 New visitor

IP: ${req.headers['x-forwarded-for'] || req.socket.remoteAddress}
User-Agent: ${data.userAgent}

Platform: ${data.platform}
Language: ${data.language}
Screen: ${data.screenWidth}x${data.screenHeight}
Viewport: ${data.viewportWidth}x${data.viewportHeight}
Timezone: ${data.timezone}

URL: ${data.url}
Referrer: ${data.referrer}
    `;

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
      }),
    });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false });
  }
});




app.post('/api/contact', (req, res) => {
  const { name, phone, email } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ error: 'Введите ваше имя' });
  }
  if (!phone || phone.replace(/\D/g, '').length < 11) {
    return res.status(400).json({ error: 'Введите полный номер телефона' });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Введите корректный email' });
  }

  console.log('📩 Новая заявка:', { name, phone, email, date: new Date().toISOString() });

  res.json({ success: true, message: 'Заявка отправлена' });
});

app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Mindexa Design — http://localhost:${PORT}`);
});
