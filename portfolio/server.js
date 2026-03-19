import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3850;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, 'public')));

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
