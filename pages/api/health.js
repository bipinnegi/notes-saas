import setCors from './_cors';
export default function handler(req, res) {
  if (req.method === 'OPTIONS') { setCors(res); return res.status(200).end(); }
  setCors(res);
  res.json({ status: 'ok' });
}
