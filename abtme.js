/* ============================================================
   ABOUT ME — interações
   ------------------------------------------------------------
   Módulos independentes: cada função initX() cuida de um
   widget. Pra remover um widget do HTML, pode apagar o init
   correspondente aqui (ou deixar — todos checam se o elemento
   existe antes de agir, então nada quebra).
   ============================================================ */

/* ---------------- THEME TOGGLE 💀/🌸 ---------------- */
const THEME_KEY = "bela_about_theme";

function initThemeToggle() {
  const btn = document.getElementById("theme-toggle");
  const icon = document.getElementById("toggle-icon");
  if (!btn || !icon) return;

  // restaura o tema salvo (padrão: rock)
  const saved = localStorage.getItem(THEME_KEY) || "rock";
  applyTheme(saved, false);

  btn.addEventListener("click", () => {
    const current = document.body.dataset.theme;
    const next = current === "rock" ? "kawaii" : "rock";
    applyTheme(next, true);
    localStorage.setItem(THEME_KEY, next);
  });

  function applyTheme(theme, animate) {
    document.body.dataset.theme = theme;
    // o ícone mostra o tema PARA ONDE você vai, não o atual:
    // no rock mostra 🌸 (clique pra ir pro kawaii) e vice-versa
    icon.textContent = theme === "rock" ? "🌸" : "💀";

    if (animate) {
      icon.classList.remove("spin");
      void icon.offsetWidth; // reinicia a animação
      icon.classList.add("spin");
    }
  }
}

/* ---------------- STORY CORNER (read more) ---------------- */
function initStories() {
  document.querySelectorAll(".story .read-more").forEach((btn) => {
    btn.addEventListener("click", () => {
      const story = btn.closest(".story");
      const isOpen = story.classList.toggle("open");
      btn.textContent = isOpen ? "Read less" : "Read more";
    });
  });
}

/* ---------------- COFFEE COUNTER ☕ ---------------- */
function initCoffee() {
  const btn = document.getElementById("coffee-btn");
  const num = document.getElementById("coffee-num");
  if (!btn || !num) return;

  let cups = 0; // por visita, de propósito (a piada é essa)
  btn.addEventListener("click", () => {
    cups++;
    num.textContent = cups;
    if (cups === 10) num.textContent = cups + " (?!)";
  });
}

/* ---------------- CURRENTLY AFK 💤 ---------------- */
const AFK_ACTIVITIES = [
  "painting my nails",
  "in a ranked match (do not disturb)",
  "rewriting the same paragraph for the 9th time",
  "making tea",
  "staring at the wall (important)",
  "reorganizing my plushies",
  "downloading a game at 2 MB/s",
  "petting a cat that isn't mine",
  "editing my website instead of sleeping",
];

let lastAfk = -1;

function rollAfk() {
  const el = document.getElementById("afk-text");
  if (!el) return;
  let i;
  do {
    i = Math.floor(Math.random() * AFK_ACTIVITIES.length);
  } while (i === lastAfk && AFK_ACTIVITIES.length > 1);
  lastAfk = i;
  el.textContent = AFK_ACTIVITIES[i];
}

function initAfk() {
  const btn = document.getElementById("afk-btn");
  if (!btn) return;
  rollAfk(); // um resultado já ao carregar
  btn.addEventListener("click", rollAfk);
}

/* ---------------- PIXEL PET 🐾 ---------------- */
const PET_KEY = "bela_pet_count";

function initPet() {
  const pet = document.getElementById("pixel-pet");
  const count = document.getElementById("pet-count");
  if (!pet || !count) return;

  let pets = parseInt(localStorage.getItem(PET_KEY) || "0", 10);
  count.textContent = pets;

  pet.addEventListener("click", () => {
    pets++;
    count.textContent = pets;
    localStorage.setItem(PET_KEY, pets);

    pet.classList.remove("petted");
    void pet.offsetWidth; // reinicia a animação
    pet.classList.add("petted");
  });
}

/* ---------------- PHOTO SWAP (IRL ⇄ pixel) ---------------- */
function initPhotoSwap() {
  const btn = document.getElementById("photo-swap");
  const photo = document.querySelector(".me-photo");
  if (!btn || !photo) return;

  btn.addEventListener("click", () => {
    const showingPixel = photo.classList.toggle("show-pixel");
    btn.textContent = showingPixel ? "📷 irl version" : "✨ pixel version";
  });
}

/* ---------------- FAVORITES (+ more) ---------------- */
/* Corta cada <dd> em 2 linhas e adiciona um botãozinho "+ more"
   APENAS nos tópicos que realmente têm texto sobrando.
   Você não precisa marcar nada no HTML — é automático. */
function initFavorites() {
  document.querySelectorAll(".fav-grid dd").forEach((dd) => {
    dd.classList.add("clamped");

    // com o corte aplicado, mede se o conteúdo transborda
    const overflows = dd.scrollHeight > dd.clientHeight + 1;
    if (!overflows) {
      dd.classList.remove("clamped"); // curtinho: fica limpo, sem botão
      return;
    }

    const btn = document.createElement("button");
    btn.className = "fav-more";
    btn.textContent = "+ more";
    dd.after(btn);

    btn.addEventListener("click", () => {
      const nowClamped = dd.classList.toggle("clamped");
      btn.textContent = nowClamped ? "+ more" : "− less";
    });
  });
}

/* ---------------- STAMP CAROUSEL ---------------- */
/* Clona o span de CADA camada de tema pra fechar o loop.
   Cole os stamps uma vez só em cada grupo no HTML. */
function initStampCarousel() {
  document.querySelectorAll(".stampInner").forEach((inner) => {
    const group = inner.querySelector("span");
    if (group) inner.appendChild(group.cloneNode(true));
  });
}

/* ---------------- BOOT ---------------- */
document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  initStories();
  initCoffee();
  initAfk();
  initPet();
  initPhotoSwap();
  initFavorites();
  initStampCarousel();
});