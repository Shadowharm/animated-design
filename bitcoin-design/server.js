import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cryptoRoutes from './routes/crypto.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3847;

app.use('/api', cryptoRoutes);
app.use(express.static(join(__dirname, 'public')));

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
