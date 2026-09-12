// Serverless proxy: fetches the current CSV export of the "Historico
// Financeiro" Google Sheet server-side and hands it to the dashboard.
// The sheet is shared as "anyone with the link can view", so no
// credentials are needed. Runs on every request — no caching — so the
// dashboard always reflects whatever is currently in the sheet.

const SHEET_ID = '1HZM_TEF4p3F_wy-MvirzeFbV_ff8jzmd2DFxxznSOL4';
const GID = '0';

module.exports = async function handler(req, res) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;
  try {
    const upstream = await fetch(url, { redirect: 'follow' });
    if (!upstream.ok) {
      res.status(502).json({ error: 'upstream_error', status: upstream.status });
      return;
    }
    const csv = await upstream.text();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).send(csv);
  } catch (err) {
    res.status(500).json({ error: 'fetch_failed', message: String(err && err.message || err) });
  }
};
