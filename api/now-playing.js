// api/now-playing.js — Função serverless para Vercel
// Coloque este arquivo na pasta /api do seu projeto na Vercel.
//
// Variáveis de ambiente que você deve configurar no painel da Vercel
// (Settings > Environment Variables) — NUNCA no código:
//   SPOTIFY_CLIENT_ID
//   SPOTIFY_CLIENT_SECRET
//   SPOTIFY_REFRESH_TOKEN

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_URL = "https://api.spotify.com/v1/me/player/currently-playing";
const RECENTLY_PLAYED_URL = "https://api.spotify.com/v1/me/player/recently-played?limit=1";

// Cache simples em memória pra não estourar o rate limit do Spotify
let cache = { data: null, timestamp: 0 };
const CACHE_MS = 30 * 1000; // 30 segundos

async function getAccessToken() {
  const basic = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: process.env.SPOTIFY_REFRESH_TOKEN,
    }),
  });

  const data = await res.json();
  return data.access_token;
}

function formatTrack(track, isPlaying) {
  return {
    isPlaying,
    title: track.name,
    artist: track.artists.map((a) => a.name).join(", "),
    album: track.album.name,
    albumArt: track.album.images?.[1]?.url || track.album.images?.[0]?.url || null,
    url: track.external_urls?.spotify || null,
  };
}

export default async function handler(req, res) {
  // CORS: troque "*" pelo domínio do seu site quando publicar, ex:
  res.setHeader("Access-Control-Allow-Origin", "https://belasgamingroom.neocities.org");
  res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60");

  // Serve do cache se for recente
  if (cache.data && Date.now() - cache.timestamp < CACHE_MS) {
    return res.status(200).json(cache.data);
  }

  try {
    const accessToken = await getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };

    // 1) Tenta pegar o que está tocando agora
    const nowRes = await fetch(NOW_PLAYING_URL, { headers });

    let payload;

    // 200 = tocando algo; 204 = nada tocando no momento
    if (nowRes.status === 200) {
      const now = await nowRes.json();
      if (now?.item && now.is_playing) {
        payload = formatTrack(now.item, true);
      }
    }

    // 2) Se não tem nada tocando, pega a última música ouvida
    if (!payload) {
      const recentRes = await fetch(RECENTLY_PLAYED_URL, { headers });
      const recent = await recentRes.json();
      const lastTrack = recent?.items?.[0]?.track;
      if (lastTrack) {
        payload = formatTrack(lastTrack, false);
      } else {
        payload = { isPlaying: false, title: null };
      }
    }

    cache = { data: payload, timestamp: Date.now() };
    return res.status(200).json(payload);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao consultar o Spotify" });
  }
}