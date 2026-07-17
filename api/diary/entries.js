// api/diary/entries.js
//   GET  /api/diary/entries?q=&mood=&tag=&sort=   (público)
//   POST /api/diary/entries  + Bearer token       (só admin)
//
// Variáveis de ambiente necessárias na Vercel:
//   SUPABASE_URL           → Project URL do Supabase
//   SUPABASE_SERVICE_KEY   → service_role key (NUNCA no frontend!)
//   DIARY_TOKEN_SECRET     → o mesmo do login.js

import { verifyToken } from "./login.js";

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
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

/* conversa com o Supabase via REST (sem precisar instalar nada) */
async function supabase(path, options = {}) {
  const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: process.env.SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Supabase error: ${res.status} ${detail}`);
  }
  return res.json();
}

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    /* ---------------- GET: listar/buscar/filtrar ---------------- */
    if (req.method === "GET") {
      const { q = "", mood = "", tag = "", sort = "newest" } = req.query;

      const params = new URLSearchParams();
      params.set("select", "*");
      params.set("order", sort === "oldest" ? "date.asc" : "date.desc");

      if (mood) params.append("mood", `eq.${mood}`);
      if (tag) params.append("tags", `cs.{${tag}}`); // array contém a tag
      if (q) {
        // busca no título OU no texto (tags são cobertas pelo filtro acima,
        // e o ilike pega buscas parciais, sem diferenciar maiúsculas)
        params.append("or", `(title.ilike.*${q}*,text.ilike.*${q}*)`);
      }

      const entries = await supabase(`diary_entries?${params}`);
      return res.status(200).json(entries);
    }

    /* ---------------- POST: publicar (autenticado) ---------------- */
    if (req.method === "POST") {
      const token = (req.headers.authorization || "").replace("Bearer ", "");
      if (!verifyToken(token)) {
        return res.status(401).json({ error: "Not authorized" });
      }

      const { title, date, mood, tags, image, text } = req.body || {};
      if (!title || !date || !text) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const [created] = await supabase("diary_entries", {
        method: "POST",
        body: JSON.stringify({
          title,
          date,
          mood: mood || "neutral",
          tags: tags || [],
          image: image || null,
          text,
        }),
      });

      return res.status(201).json(created);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
}