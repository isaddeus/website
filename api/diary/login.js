// api/diary/login.js — POST {password} → {token}
//
// Variáveis de ambiente necessárias na Vercel:
//   DIARY_ADMIN_PASSWORD  → a senha que você vai digitar no site
//   DIARY_TOKEN_SECRET    → um segredo aleatório pra assinar tokens
//                           (invente um textão tipo "gh2n!x9v...")

import crypto from "crypto";

const TOKEN_TTL_HOURS = 12; // sessão de admin dura 12h

// origens que podem usar a API
const ALLOWED_ORIGINS = [
  "https://belasgamingroom.neocities.org",
  "http://127.0.0.1:5500",
  "http://localhost:5500",
];

function setCors(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

// token = validade + assinatura HMAC (sem dependências externas)
export function makeToken() {
  const expires = Date.now() + TOKEN_TTL_HOURS * 60 * 60 * 1000;
  const sig = crypto
    .createHmac("sha256", process.env.DIARY_TOKEN_SECRET)
    .update(String(expires))
    .digest("hex");
  return `${expires}.${sig}`;
}

export function verifyToken(token) {
  if (!token) return false;
  const [expires, sig] = token.split(".");
  if (!expires || !sig) return false;
  if (Date.now() > Number(expires)) return false; // expirou

  const expected = crypto
    .createHmac("sha256", process.env.DIARY_TOKEN_SECRET)
    .update(expires)
    .digest("hex");

  // comparação em tempo constante (evita timing attacks)
  return (
    sig.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  );
}

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { password } = req.body || {};

  if (!password || password !== process.env.DIARY_ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Wrong password" });
  }

  return res.status(200).json({ token: makeToken() });
}