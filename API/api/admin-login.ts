// api/admin-login.ts
// Simple server-side admin authentication endpoint.
// POST body: { username, password } compares with ADMIN_USER/ADMIN_PASS env variables.
export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    const { username, password } = req.body || {};
    if (!username || !password) {
      res.status(400).json({ ok: false, error: "Missing credentials" });
      return;
    }

    const ADMIN_USER = process.env.ADMIN_USER || "";
    const ADMIN_PASS = process.env.ADMIN_PASS || "";

    if (!ADMIN_USER || !ADMIN_PASS) {
      res.status(500).json({ ok: false, error: "Server misconfigured: ADMIN_USER/ADMIN_PASS missing" });
      return;
    }

    if (username === ADMIN_USER && password === ADMIN_PASS) {
      res.status(200).json({ ok: true });
    } else {
      res.status(401).json({ ok: false, error: "Invalid credentials" });
    }
  } catch (err: any) {
    console.error("Admin login error:", err);
    res.status(500).json({ ok: false, error: err?.message || "Internal Server Error" });
  }
}
