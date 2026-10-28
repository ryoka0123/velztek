// Serverless API en Vercel para guardar y consultar cuentas de lectores en la nube.
// Funciona automáticamente al conectar Vercel Storage (Upstash Redis / Vercel KV) en la pestaña "Storage" de Vercel.

const REST_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const REST_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";

async function kvGet(key) {
  const r = await fetch(`${REST_URL}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${REST_TOKEN}` }
  });
  const data = await r.json();
  if (!data || data.result == null) return null;
  try { return JSON.parse(data.result); } catch { return data.result; }
}

async function kvSet(key, val) {
  await fetch(`${REST_URL}/set/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${REST_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(JSON.stringify(val))
  });
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (!REST_URL || !REST_TOKEN) {
    return res.status(200).json({ cloud: false, reason: "storage_not_connected" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const action = body.action || req.query?.action;
    const email = String(body.email || req.query?.email || "").trim().toLowerCase();
    if (!email) return res.status(400).json({ ok: false, error: "Falta correo o usuario." });

    const key = `velz_user:${email}`;

    if (action === "register") {
      const existing = await kvGet(key);
      if (existing) return res.status(409).json({ ok: false, error: "Ese correo/usuario ya está registrado. Inicia sesión." });
      const userObj = body.user;
      await kvSet(key, userObj);
      return res.status(200).json({ ok: true, cloud: true, user: userObj });
    }

    if (action === "login") {
      const u = await kvGet(key);
      if (!u) return res.status(404).json({ ok: false, error: "No existe una cuenta con ese correo/usuario. Regístrate primero." });
      if (u.passHash && u.passHash !== body.passHash) {
        return res.status(401).json({ ok: false, error: "Contraseña incorrecta." });
      }
      return res.status(200).json({ ok: true, cloud: true, user: u });
    }

    if (action === "sync") {
      const u = await kvGet(key);
      if (!u) {
        if (body.user) {
          await kvSet(key, body.user);
          return res.status(200).json({ ok: true, cloud: true });
        }
        return res.status(404).json({ ok: false });
      }
      u.name = body.name || u.name;
      u.avatar = body.avatar || u.avatar;
      u.progress = body.progress || u.progress;
      await kvSet(key, u);
      return res.status(200).json({ ok: true, cloud: true, user: u });
    }

    return res.status(400).json({ ok: false, error: "Acción desconocida." });
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err.message || err) });
  }
};
