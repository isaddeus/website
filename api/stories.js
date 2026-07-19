// api/stories.js — API das histórias (tudo em um endpoint):
//   GET  /api/stories                    → histórias + capítulos (sem texto)
//   GET  /api/stories?chapter=ID         → capítulo completo + comentários
//   POST /api/stories  {action:"like",    chapterId}
//   POST /api/stories  {action:"comment", chapterId, name, text}
//
// Usa as MESMAS variáveis de ambiente do diário:
//   SUPABASE_URL, SUPABASE_SERVICE_KEY

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
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

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
  if (!res.ok) throw new Error(`Supabase: ${res.status} ${await res.text()}`);
  return res.json();
}

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    /* ---------------- GET ---------------- */
    if (req.method === "GET") {
      const { chapter } = req.query;

      // capítulo completo + comentários
      if (chapter) {
        const [chap] = await supabase(
          `chapters?id=eq.${chapter}&select=*,stories(title,tags)`
        );
        if (!chap) return res.status(404).json({ error: "Chapter not found" });

        const comments = await supabase(
          `story_comments?chapter_id=eq.${chapter}&select=*&order=created_at.asc`
        );
        return res.status(200).json({ ...chap, comments });
      }

      // lista de histórias com capítulos (sem o texto, que é pesado)
      const stories = await supabase(
        `stories?select=*,chapters(id,number,title,date,likes)&order=created_at.desc`
      );
      // ordena capítulos por número dentro de cada história
      for (const s of stories) {
        (s.chapters || []).sort((a, b) => a.number - b.number);
      }
      return res.status(200).json(stories);
    }

    /* ---------------- POST (like / comment) ---------------- */
    if (req.method === "POST") {
      const { action, chapterId, name, text } = req.body || {};
      if (!chapterId) return res.status(400).json({ error: "Missing chapterId" });

      if (action === "like") {
        // incrementa o contador (leitura + escrita; simples e suficiente)
        const [chap] = await supabase(`chapters?id=eq.${chapterId}&select=likes`);
        if (!chap) return res.status(404).json({ error: "Chapter not found" });
        const [updated] = await supabase(`chapters?id=eq.${chapterId}`, {
          method: "PATCH",
          body: JSON.stringify({ likes: chap.likes + 1 }),
        });
        return res.status(200).json({ likes: updated.likes });
      }

      if (action === "comment") {
        if (!text || !text.trim()) {
          return res.status(400).json({ error: "Empty comment" });
        }
        // limites anti-bagunça (comentários são públicos!)
        const safeName = (name || "anonymous").trim().slice(0, 30) || "anonymous";
        const safeText = text.trim().slice(0, 1000);

        const [created] = await supabase("story_comments", {
          method: "POST",
          body: JSON.stringify({
            chapter_id: chapterId,
            name: safeName,
            text: safeText,
          }),
        });
        return res.status(201).json(created);
      }

      return res.status(400).json({ error: "Unknown action" });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
}