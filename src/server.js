import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { calculatePanchapakshi, exportTables } from './panchapakshi.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const publicDir = path.join(__dirname, '..', 'public');

app.get('/api/panchapakshi', (req, res) => {
  try {
    res.json(calculatePanchapakshi({
      date: req.query.date,
      time: req.query.time,
      lat: req.query.lat,
      lon: req.query.lon,
      tzOffset: req.query.tzOffset,
    }));
  } catch (err) {
    res.status(400).json({ error: err.message || String(err) });
  }
});

app.get('/api/tables', (_req, res) => res.json(exportTables()));
app.get('/health', (_req, res) => res.json({ ok: true, runtime: 'node', framework: 'express' }));

app.use(express.static(publicDir));
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  return res.sendFile(path.join(publicDir, 'index.html'));
});

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '0.0.0.0';
app.listen(port, host, () => {
  console.log(`panchapakshi.com running on http://${host}:${port}`);
});
