/**
 * OMNI-ENDO AI: static host for the triage page.
 *
 * Upstream, this file also implemented POST /my-data: it took a Glooko email and
 * password typed into the browser, logged into Glooko on the user's behalf, and
 * proxied back the three raw API payloads.
 *
 * That handler is gone. /my-data is now served by omni-endo (the MCP server),
 * which already holds a Glooko session and returns the identical
 * {startDate, endDate, data1, data2, data3} shape, so no credential ever reaches
 * the browser. The reverse proxy in front routes /my-data there; this app only
 * serves the page. Deleted rather than left dead, because the one thing it did
 * was accept and forward credentials.
 *
 * This means the app is NOT standalone: without something answering /my-data on
 * the same origin, the page loads but "Connect & Generate Triage" fails. Loading
 * a previously downloaded session file still works offline.
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 4000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.static(path.join(__dirname, 'public')));

// Single-page app: anything unmatched returns the page itself.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`
    ================================================
    OMNI-ENDO AI SERVICE ACTIVE
    Port: ${PORT}
    URL: http://localhost:${PORT}
    Status: Serving the triage page (/my-data is upstream).
    ================================================`);
});
