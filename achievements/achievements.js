/* ============================================================
   ACHIEVEMENT SYSTEM 🏆 — belasgamingroom
   ------------------------------------------------------------
   Como usar:
   1. Inclua este arquivo em TODAS as páginas do site:
        <script src="achievements.js"></script>
      (de preferência logo antes de </body>)
   2. Inclua também o achievements.css no <head>.
   3. O botão 🏆 e o modal são criados automaticamente.

   Para desbloquear conquistas de qualquer lugar do seu código:
        unlockAchievement("fortune_seeker");
   Para contadores (ex: biscoito da sorte):
        countAchievementEvent("fortune");   // soma +1 e desbloqueia ao atingir a meta
   Para widgets da home:
        markWidgetUsed("player");           // veja WIDGETS_DA_HOME abaixo
   ============================================================ */

/* ------------------------------------------------------------
   1. CONFIGURAÇÃO CENTRAL
   Adicionar conquista nova = adicionar um objeto aqui. Só isso!
   Campos:
     id          -> identificador único (usado no localStorage)
     icon        -> emoji mostrado na lista
     title       -> nome da conquista
     description -> como desbloquear / o que fez
     hidden      -> true = aparece como "??????" até desbloquear
   ------------------------------------------------------------ */
const ACHIEVEMENTS = [
  { id: "welcome",        icon: "🌸", title: "Welcome!",          description: "Visited the website for the first time.",      hidden: false },
  { id: "reader",         icon: "📖", title: "Reader",            description: "Visited the About page.",                      hidden: false },
  { id: "explorer",       icon: "🗺️", title: "Explorer",          description: "Visited every page of the website.",           hidden: false },
  { id: "curious",        icon: "🖱️", title: "Curious Explorer",  description: "Interacted with every homepage widget.",       hidden: false },
  { id: "fortune_seeker", icon: "🥠", title: "Fortune Seeker",    description: "Generated 20 fortune cookies.",                hidden: false },
  { id: "todays_bela",    icon: "🎀", title: "Today's Bela",      description: "Generated 15 Today's Bela results.",           hidden: false },
  { id: "time_traveler",  icon: "⏰", title: "Time Traveler",     description: "Stayed on the website for 5 minutes.",         hidden: false },
  { id: "night_owl",      icon: "🦉", title: "Night Owl",         description: "Visited between 1 AM and 4 AM.",               hidden: true  },
  { id: "early_bird",     icon: "🐦", title: "Early Bird",        description: "Visited before 7 AM.",                         hidden: true  },
  { id: "returning",      icon: "💌", title: "Returning Visitor", description: "Came back after 7 days away.",                 hidden: true  },
  { id: "completionist",  icon: "👑", title: "Completionist",     description: "Unlocked every single achievement.",           hidden: false },
];

/* Metas dos contadores: evento -> { meta, conquista } */
const COUNTER_GOALS = {
  fortune: { goal: 20, achievement: "fortune_seeker" },
  bela:    { goal: 15, achievement: "todays_bela" },
};

/* Páginas que contam para o "Explorer".
   Use o nome do arquivo html de cada página do seu site. */
const PAGINAS_DO_SITE = ["index.html", "abtme.html", "diary.html", "stories.html"];

/* Widgets da home que contam para o "Curious Explorer".
   Chame markWidgetUsed("nome") no evento de cada um. */
const WIDGETS_DA_HOME = ["player", "fortune", "bela", "guestbook"];

const STORAGE_KEY = "bela_achievements_v1";
const TIME_TRAVELER_MS = 5 * 60 * 1000; // 5 minutos
const RETURNING_DAYS = 7;

/* ------------------------------------------------------------
   2. ESTADO + STORAGE
   Estrutura salva no localStorage:
   {
     achievements: { welcome: true, reader: false, ... },
     unseen: ["reader"],          // desbloqueadas mas ainda não vistas no log
     counters: { fortune: 3 },    // contadores de eventos
     pagesVisited: ["index.html"],
     widgetsUsed: ["player"],
     firstVisit: 1710000000000,
     lastVisit: 1710000000000
   }
   ------------------------------------------------------------ */
let achvState = null;

function loadAchievements() {
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch (e) {
    saved = null; // storage corrompido? começa do zero sem quebrar o site
  }

  achvState = {
    achievements: {},
    unseen: [],
    counters: {},
    pagesVisited: [],
    widgetsUsed: [],
    firstVisit: Date.now(),
    lastVisit: Date.now(),
    ...(saved || {}),
  };

  // Inicializa conquistas que ainda não existem no save
  // (assim dá pra adicionar conquistas novas sem quebrar saves antigos)
  for (const a of ACHIEVEMENTS) {
    if (!(a.id in achvState.achievements)) achvState.achievements[a.id] = false;
  }

  saveAchievements();
}

function saveAchievements() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(achvState));
  } catch (e) {
    /* localStorage cheio ou bloqueado — o site continua funcionando,
       só não persiste. */
  }
}

/* ------------------------------------------------------------
   3. API PÚBLICA
   ------------------------------------------------------------ */
function hasAchievement(id) {
  return !!achvState.achievements[id];
}

function unlockAchievement(id) {
  const config = ACHIEVEMENTS.find((a) => a.id === id);
  if (!config) return console.warn(`Conquista desconhecida: ${id}`);
  if (hasAchievement(id)) return; // já tem, não repete

  achvState.achievements[id] = true;
  achvState.unseen.push(id);
  saveAchievements();

  showAchievementToast(config);
  updateTrophyGlow();
  renderAchievements(); // se o modal estiver aberto, atualiza na hora
  checkCompletionist();
}

/* Soma +1 num contador e desbloqueia a conquista ao bater a meta */
function countAchievementEvent(eventName) {
  const goal = COUNTER_GOALS[eventName];
  if (!goal) return console.warn(`Evento desconhecido: ${eventName}`);

  achvState.counters[eventName] = (achvState.counters[eventName] || 0) + 1;
  saveAchievements();

  if (achvState.counters[eventName] >= goal.goal) unlockAchievement(goal.achievement);
}

/* Marca um widget da home como usado (para o Curious Explorer) */
function markWidgetUsed(widgetName) {
  if (!WIDGETS_DA_HOME.includes(widgetName)) return;
  if (!achvState.widgetsUsed.includes(widgetName)) {
    achvState.widgetsUsed.push(widgetName);
    saveAchievements();
  }
  if (WIDGETS_DA_HOME.every((w) => achvState.widgetsUsed.includes(w))) {
    unlockAchievement("curious");
  }
}

/* Completionist = todas as outras desbloqueadas */
function checkCompletionist() {
  const others = ACHIEVEMENTS.filter((a) => a.id !== "completionist");
  if (others.every((a) => hasAchievement(a.id))) unlockAchievement("completionist");
}

/* ------------------------------------------------------------
   4. TRIGGERS AUTOMÁTICOS (rodam em todo carregamento de página)
   ------------------------------------------------------------ */
function runAutoTriggers() {
  const now = new Date();
  const hour = now.getHours();

  // Welcome — primeira visita
  unlockAchievement("welcome");

  // Night Owl / Early Bird — horário da visita
  if (hour >= 1 && hour < 4) unlockAchievement("night_owl");
  if (hour < 7) unlockAchievement("early_bird");

  // Returning Visitor — voltou depois de 7 dias
  const diasDesdeUltimaVisita = (Date.now() - achvState.lastVisit) / (1000 * 60 * 60 * 24);
  if (diasDesdeUltimaVisita >= RETURNING_DAYS) unlockAchievement("returning");
  achvState.lastVisit = Date.now();

// Explorer / Reader — registra a página atual
  // O Neocities serve URLs limpas (/stories em vez de /stories.html),
  // então normalizamos tudo pro formato com .html antes de comparar.
  function normalizePage(name) {
    let p = (name || "").split("?")[0].split("#")[0].toLowerCase();
    if (p === "" || p === "/") return "index.html";
    if (!p.endsWith(".html")) p += ".html";
    return p;
  }

  const page = normalizePage(location.pathname.split("/").pop());
  console.log("🏆 [achievements] página detectada:", page);

  // migra registros antigos salvos sem .html (ex: "stories" → "stories.html")
  achvState.pagesVisited = [...new Set(achvState.pagesVisited.map(normalizePage))];

  if (!achvState.pagesVisited.includes(page)) {
    achvState.pagesVisited.push(page);
  }
  console.log("🏆 [achievements] lista:", achvState.pagesVisited);

  if (page === "abtme.html") unlockAchievement("reader");

  const faltam = PAGINAS_DO_SITE.filter((p) => !achvState.pagesVisited.includes(p));
  if (faltam.length === 0) {
    unlockAchievement("explorer");
  } else {
    console.log("🏆 [achievements] faltam para o Explorer:", faltam);
  }

  saveAchievements();

  // Time Traveler — 5 minutos de site (acumula entre páginas na mesma sessão? 
  // versão simples: 5 min contínuos em qualquer página)
  if (!hasAchievement("time_traveler")) {
    setTimeout(() => unlockAchievement("time_traveler"), TIME_TRAVELER_MS);
  }
}

/* ------------------------------------------------------------
   5. UI — botão troféu, modal e toasts
   (todo o HTML é gerado aqui; nada pra copiar nas páginas)
   ------------------------------------------------------------ */
function buildUI() {
// --- Botão troféu: SÓ existe onde houver um trophy-slot (a home) ---
  const slot = document.getElementById("trophy-slot");
  if (slot) {
    const btn = document.createElement("button");
    btn.id = "achv-trophy";
    btn.title = "Achievements";
    btn.innerHTML = `<img src="achievements/trophy.gif" alt="achievements">`;
    btn.addEventListener("click", openAchievementLog);
    slot.appendChild(btn);
    btn.classList.add("in-slot");
  }

  // --- Overlay + modal ---
  const overlay = document.createElement("div");
  overlay.id = "achv-overlay";
  overlay.innerHTML = `
    <div id="achv-modal">
      <div class="achv-titlebar">
        <p>🏆 Achievement Log</p>
        <button id="achv-close" title="fechar">✕</button>
      </div>
      <div class="achv-progress">
        <div class="achv-progress-text" id="achv-progress-text"></div>
        <div class="achv-progress-bar"><div id="achv-progress-fill"></div></div>
      </div>
      <div id="achv-list"></div>
    </div>`;
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeAchievementLog();
  });
  document.body.appendChild(overlay);
  document.getElementById("achv-close").addEventListener("click", closeAchievementLog);

  // --- Container dos toasts ---
  const toasts = document.createElement("div");
  toasts.id = "achv-toasts";
  document.body.appendChild(toasts);

  updateTrophyGlow();
}

function openAchievementLog() {
  renderAchievements();
  document.getElementById("achv-overlay").classList.add("open");
  // Abrir o log "vê" as conquistas novas -> apaga o glow
  achvState.unseen = [];
  saveAchievements();
  updateTrophyGlow();
}

function closeAchievementLog() {
  document.getElementById("achv-overlay").classList.remove("open");
}

function updateTrophyGlow() {
  const btn = document.getElementById("achv-trophy");
  if (btn) btn.classList.toggle("glow", achvState.unseen.length > 0);
}

/* Gera a lista inteira a partir do array ACHIEVEMENTS */
function renderAchievements() {
  const list = document.getElementById("achv-list");
  if (!list) return;

  const total = ACHIEVEMENTS.length;
  const unlocked = ACHIEVEMENTS.filter((a) => hasAchievement(a.id)).length;
  const pct = Math.round((unlocked / total) * 100);

  document.getElementById("achv-progress-text").textContent =
    `${unlocked} / ${total} unlocked (${pct}%)`;
  document.getElementById("achv-progress-fill").style.width = pct + "%";

  list.innerHTML = "";
  for (const a of ACHIEVEMENTS) {
    const isUnlocked = hasAchievement(a.id);
    const isNew = achvState.unseen.includes(a.id);

    const item = document.createElement("div");
    item.className =
      "achv-item " + (isUnlocked ? "unlocked" : "locked") + (isNew ? " new" : "");

    // Conquista hidden ainda bloqueada = mistério total
    const icon = isUnlocked ? a.icon : a.hidden ? "🔒" : a.icon;
    const title = isUnlocked ? a.title : a.hidden ? "??????" : a.title;
    const desc = isUnlocked
      ? a.description
      : a.hidden
      ? "keep exploring..."
      : a.description;

    item.innerHTML = `
      <div class="achv-icon">${icon}</div>
      <div class="achv-text">
        <div class="achv-title">${isUnlocked ? "✓ " : ""}${title}</div>
        <div class="achv-desc">${desc}</div>
      </div>`;
    list.appendChild(item);
  }
}

/* Toast de "Achievement Unlocked!" — suporta vários em fila */
function showAchievementToast(config) {
  const container = document.getElementById("achv-toasts");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "achv-toast";
  toast.innerHTML = `
    <div class="achv-toast-icon">${config.icon}</div>
    <div>
      <div class="achv-toast-header">🏆 Achievement Unlocked!</div>
      <div class="achv-toast-title">${config.title}</div>
      <div class="achv-toast-desc">${config.description}</div>
    </div>`;
  container.appendChild(toast);

  // entra -> espera -> sai -> remove do DOM
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 500);
  }, 4000);
}

/* ------------------------------------------------------------
   6. BOOT
   ------------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", () => {
  loadAchievements();
  buildUI();
  runAutoTriggers();
});

