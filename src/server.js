import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { calculatePanchapakshi, exportTables } from './panchapakshi.js';

const app = new Hono();
app.get('/api/panchapakshi', c => {
  try {
    const q = c.req.query();
    return c.json(calculatePanchapakshi({ date:q.date, time:q.time, lat:q.lat, lon:q.lon }));
  } catch (err) {
    return c.json({ error: err.message || String(err) }, 400);
  }
});
app.get('/api/tables', c => c.json(exportTables()));
app.get('/health', c => c.json({ ok:true, runtime:'node', framework:'hono' }));
app.use('/*', serveStatic({ root: './public' }));

const port = Number(process.env.PORT || 3000);
serve({ fetch: app.fetch, port }, info => console.log(`panchapakshi.com running on http://localhost:${info.port}`));
