/* ============================================================
   DIARY 📖 — lógica
   ------------------------------------------------------------
   ARQUITETURA:
   1. API LAYER  — todas as conversas com o backend ficam aqui.
   2. STATE      — filtros atuais + entradas carregadas.
   3. RENDER     — funções que desenham feed/calendário/tags.
   4. ADMIN      — login secreto + publicação.
   Nada de dados hardcoded: tudo vem dos endpoints.
   ============================================================ */

/* ============================================================
   1. API LAYER
   Endpoints assumidos (Vercel + Supabase/Postgres):
     GET  /api/diary/entries?q=&mood=&tag=&sort=   → [entries]
     POST /api/diary/login    {password}           → {token}
     POST /api/diary/entries  (Bearer token)       → created entry
   Cada entry: { id, title, date: "YYYY-MM-DD", mood,
                 tags: [..], image: url|null, text }
   ============================================================ */
const DIARY_API = {
  base: "/api/diary", // mesmo domínio na Vercel; se hospedar o front
                      // no Neocities, troque pela URL completa da Vercel

  async getEntries(filters) {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.mood) params.set("mood", filters.mood);
    if (filters.tag) params.set("tag", filters.tag);
    params.set("sort", filters.sort || "newest");

    const res = await fetch(`${this.base}/entries?${params}`);
    if (!res.ok) throw new Error("Failed to load entries");
    return res.json();
  },

  async login(password) {
    const res = await fetch(`${this.base}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) throw new Error("Wrong password");
    return res.json(); // { token }
  },

  async publish(entry, token) {
    const res = await fetch(`${this.base}/entries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(entry),
    });
    if (!res.ok) throw new Error("Failed to publish");
    return res.json();
  },
};

/* ============================================================
   CONFIG
   ============================================================ */
const MOODS = {
  devastated: { emoji: "😭", label: "Devastated" },
  sad:        { emoji: "☹",  label: "Sad" },
  neutral:    { emoji: "😐", label: "Neutral" },
  happy:      { emoji: "🙂", label: "Happy" },
  veryhappy:  { emoji: "🥹", label: "Very Happy" },
};

const TAGS = [
  "programming", "gaming", "writing", "school", "friends",
  "life", "family", "website", "art",
];

const ADMIN_TOKEN_KEY = "bela_diary_token";
const TITLE_CLICKS_TO_UNLOCK = 5;

/* ============================================================
   2. STATE
   ============================================================ */
const state = {
  filters: { q: "", mood: "", tag: "", sort: "newest" },
  entries: [],          // último resultado da API
  calendarCursor: new Date(), // mês exibido no calendário
};

/* ============================================================
   3. RENDER
   ============================================================ */
const els = {
  feed: document.getElementById("diary-feed"),
  search: document.getElementById("diary-search"),
  sort: document.getElementById("diary-sort"),
  mood: document.getElementById("diary-mood"),
  tags: document.getElementById("diary-tags"),
  calGrid: document.getElementById("calendar-grid"),
  calLabel: document.getElementById("cal-month-label"),
};

/* ---------- feed ---------- */
function renderFeed() {
  els.feed.innerHTML = "";

  if (state.entries.length === 0) {
    const empty = document.createElement("p");
    empty.className = "diary-empty";
    empty.textContent = "No memories match your search… yet 🌸";
    els.feed.appendChild(empty);
    return;
  }

  for (const entry of state.entries) {
    els.feed.appendChild(buildEntryCard(entry));
  }
}

function buildEntryCard(entry) {
  const mood = MOODS[entry.mood] || MOODS.neutral;

  const card = document.createElement("article");
  card.className = "diary-window entry";
  card.id = `entry-${entry.id}`;
  card.dataset.date = entry.date;

  // header da janelinha: título + data
  const header = document.createElement("div");
  header.className = "window-header";
  const title = document.createElement("p");
  title.append(`✎ ${entry.title}`);
  const date = document.createElement("span");
  date.className = "entry-date";
  date.textContent = formatDate(entry.date);
  title.appendChild(date);
  header.appendChild(title);
  card.appendChild(header);

  // corpo
  const body = document.createElement("div");
  body.className = "entry-body";

  // mood + tags
  const meta = document.createElement("p");
  const badge = document.createElement("span");
  badge.className = "mood-badge";
  badge.textContent = `${mood.emoji} feeling ${mood.label.toLowerCase()}`;
  meta.appendChild(badge);

  if (entry.tags && entry.tags.length) {
    const tagsWrap = document.createElement("span");
    tagsWrap.className = "entry-tags";
    for (const t of entry.tags) {
      const chip = document.createElement("span");
      chip.className = "entry-tag";
      chip.textContent = t;
      tagsWrap.appendChild(chip);
    }
    meta.appendChild(tagsWrap);
  }
  body.appendChild(meta);

  // foto opcional em polaroid
  if (entry.image) {
    const photo = document.createElement("div");
    photo.className = "entry-photo";
    const img = document.createElement("img");
    img.src = entry.image;
    img.alt = entry.title;
    img.loading = "lazy";
    photo.appendChild(img);
    body.appendChild(photo);
  }

  // texto (textContent = seguro contra HTML; pre-wrap preserva linhas)
  const text = document.createElement("p");
  text.className = "entry-text";
  text.textContent = entry.text;
  body.appendChild(text);

  // assinaturinha
  const sign = document.createElement("p");
  sign.className = "entry-sign";
  sign.textContent = "— bela ♥";
  body.appendChild(sign);

  card.appendChild(body);
  return card;
}

function formatDate(iso) {
  const [y, m, d] = iso.split("-");
  return `${m}/${d}/${y}`;
}

/* ---------- tags ---------- */
function renderTagCloud() {
  els.tags.innerHTML = "";
  for (const tag of TAGS) {
    const chip = document.createElement("button");
    chip.className = "tag-chip";
    chip.textContent = tag;
    chip.addEventListener("click", () => {
      // clicar de novo na tag ativa desliga o filtro
      state.filters.tag = state.filters.tag === tag ? "" : tag;
      document.querySelectorAll(".tag-chip").forEach((c) =>
        c.classList.toggle("active", c.textContent === state.filters.tag)
      );
      refreshEntries();
    });
    els.tags.appendChild(chip);
  }
}

/* ---------- calendário ---------- */
function renderCalendar() {
  const cursor = state.calendarCursor;
  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  els.calLabel.textContent = cursor.toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  // dias (YYYY-MM-DD) deste mês que têm entrada → id da primeira
  const entryDays = new Map();
  for (const e of state.entries) {
    if (!e.date) continue;
    const [ey, em] = e.date.split("-").map(Number);
    if (ey === year && em === month + 1 && !entryDays.has(e.date)) {
      entryDays.set(e.date, e.id);
    }
  }

  els.calGrid.innerHTML = "";

  for (const dow of ["S", "M", "T", "W", "T", "F", "S"]) {
    const cell = document.createElement("div");
    cell.className = "cal-cell cal-dow";
    cell.textContent = dow;
    els.calGrid.appendChild(cell);
  }

  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDow; i++) {
    const cell = document.createElement("div");
    cell.className = "cal-cell cal-empty";
    els.calGrid.appendChild(cell);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const cell = document.createElement("div");
    cell.className = "cal-cell";
    cell.textContent = day;

    if (entryDays.has(iso)) {
      cell.classList.add("has-entry");
      cell.title = "there's a memory here!";
      cell.addEventListener("click", () => scrollToEntry(entryDays.get(iso)));
    }
    els.calGrid.appendChild(cell);
  }
}

function scrollToEntry(id) {
  const card = document.getElementById(`entry-${id}`);
  if (!card) return;
  card.scrollIntoView({ behavior: "smooth", block: "start" });
  card.classList.remove("flash");
  void card.offsetWidth;
  card.classList.add("flash");
}

/* ============================================================
   BUSCA / FILTROS → API
   ============================================================ */
let searchDebounce = null;

async function refreshEntries() {
  try {
    state.entries = await DIARY_API.getEntries(state.filters);
    renderFeed();
    renderCalendar();
  } catch (err) {
    els.feed.innerHTML = "";
    const msg = document.createElement("p");
    msg.className = "diary-empty";
    msg.textContent = "The diary won't open right now… try again in a bit 🗝";
    els.feed.appendChild(msg);
  }
}

function initFilters() {
  els.search.addEventListener("input", () => {
    // debounce: espera a pessoa parar de digitar (não spamma a API)
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      state.filters.q = els.search.value.trim();
      refreshEntries();
    }, 350);
  });

  els.sort.addEventListener("change", () => {
    state.filters.sort = els.sort.value;
    refreshEntries();
  });

  els.mood.addEventListener("change", () => {
    state.filters.mood = els.mood.value;
    refreshEntries();
  });

  document.getElementById("cal-prev").addEventListener("click", () => {
    state.calendarCursor.setMonth(state.calendarCursor.getMonth() - 1);
    renderCalendar();
  });

  document.getElementById("cal-next").addEventListener("click", () => {
    state.calendarCursor.setMonth(state.calendarCursor.getMonth() + 1);
    renderCalendar();
  });
}

/* ============================================================
   4. ADMIN
   ============================================================ */
function getToken() { return sessionStorage.getItem(ADMIN_TOKEN_KEY); }

function initAdmin() {
  const title = document.getElementById("diary-title");
  const panel = document.getElementById("admin-panel");
  const loginOverlay = document.getElementById("login-overlay");
  const entryOverlay = document.getElementById("entry-overlay");
  const loginBtn = document.getElementById("admin-login-btn");
  const loginError = document.getElementById("login-error");
  const passwordInput = document.getElementById("admin-password");

  /* --- segredinho: 5 cliques no título abrem o login --- */
  let clicks = 0;
  let clickTimer = null;
  title.addEventListener("click", () => {
    clicks++;
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => (clicks = 0), 1500); // cliques têm que ser seguidos
    if (clicks >= TITLE_CLICKS_TO_UNLOCK) {
      clicks = 0;
      if (getToken()) return; // já logada
      loginOverlay.hidden = false;
      passwordInput.focus();
    }
  });

  /* --- login --- */
  async function tryLogin() {
    loginError.hidden = true;
    try {
      const { token } = await DIARY_API.login(passwordInput.value);
      sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
      passwordInput.value = "";
      loginOverlay.hidden = true;
      panel.hidden = false;
    } catch (err) {
      loginError.hidden = false;
    }
  }

  loginBtn.addEventListener("click", tryLogin);
  passwordInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") tryLogin();
  });

  /* --- painel --- */
  if (getToken()) panel.hidden = false; // sessão ainda válida

  document.getElementById("admin-logout").addEventListener("click", () => {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    panel.hidden = true;
  });

  document.getElementById("admin-new-entry").addEventListener("click", () => {
    document.getElementById("entry-date").value =
      new Date().toISOString().slice(0, 10); // hoje, de presente
    entryOverlay.hidden = false;
  });

  /* --- fechar modais (botões ✕ e clique fora) --- */
  document.querySelectorAll("[data-close]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.getElementById(btn.dataset.close).hidden = true;
    });
  });

  for (const overlay of [loginOverlay, entryOverlay]) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.hidden = true;
    });
  }

  /* --- publicar --- */
  const form = document.getElementById("entry-form");
  const publishError = document.getElementById("publish-error");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    publishError.hidden = true;

    const entry = {
      title: document.getElementById("entry-title").value.trim(),
      date: document.getElementById("entry-date").value,
      mood: document.getElementById("entry-mood").value,
      tags: document.getElementById("entry-tags").value
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      text: document.getElementById("entry-text").value,
      image: null,
    };

    // imagem opcional → base64 (o backend decide onde guardar)
    const file = document.getElementById("entry-image").files[0];
    if (file) {
      entry.image = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    try {
      await DIARY_API.publish(entry, getToken());
      form.reset();
      entryOverlay.hidden = true;
      refreshEntries(); // a entrada nova aparece no feed
    } catch (err) {
      publishError.textContent =
        "Couldn't publish — check your connection (or your session expired, log in again).";
      publishError.hidden = false;
    }
  });
}

/* ============================================================
   BOOT
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  renderTagCloud();
  initFilters();
  initAdmin();
  refreshEntries();
});