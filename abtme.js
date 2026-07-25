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
  if (!btn) return;

  // restaura o tema salvo (padrão: rock), sem animar
  document.body.dataset.theme = localStorage.getItem(THEME_KEY) || "rock";

  btn.addEventListener("click", () => {
    const next = document.body.dataset.theme === "rock" ? "kawaii" : "rock";
    document.body.dataset.theme = next;
    localStorage.setItem(THEME_KEY, next);

    // gira o gif que está ENTRANDO em cena
    const entering = document.querySelector(
      next === "rock" ? ".toggle-gif-rock" : ".toggle-gif-kawaii"
    );
    if (entering) {
      entering.classList.remove("spin");
      void entering.offsetWidth; // reinicia a animação
      entering.classList.add("spin");
    }
  });
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

/* ---------------- MEME STASH (galeria VSCO aleatória) ---------------- */
/* Bota aqui os caminhos das tuas imagens. Adicionar meme = uma linha. */
const MEMES = [
  "aboutMe/memes/ai.jpg",
  "aboutMe/memes/drawingWomen.jpg",
  "aboutMe/memes/babyHazek.jpg",
  "aboutMe/memes/OCs.jpg",
  "aboutMe/memes/coisando.jpg",
  "aboutMe/memes/dyeHair.jpg",
  "aboutMe/memes/vapoi.jpg",
  "aboutMe/memes/etc.jpg",
  "aboutMe/memes/pink.jpg",
  "aboutMe/memes/guilty.jpg",
  "aboutMe/memes/intoMusic.jpg",
  "aboutMe/memes/cafeEtapioca.jpg",
  "aboutMe/memes/OCs2.jpg",
  "aboutMe/memes/SOADreference.jpg",
  "aboutMe/memes/pads.jpg",
  "aboutMe/memes/painkillers.jpg",
  "aboutMe/memes/reddit.jpg",
  "aboutMe/memes/seeDick.jpg",
  "aboutMe/memes/penis.jpg",
  "aboutMe/memes/thoughts.jpg",
  "aboutMe/memes/meme1.jpg",
  "aboutMe/memes/meme2.jpg",
  "aboutMe/memes/meme3.jpg",
  "aboutMe/memes/meme4.jpg",
  "aboutMe/memes/meme5.jpg",
  "aboutMe/memes/meme6.jpg",
  "aboutMe/memes/meme7.jpg",
  "aboutMe/memes/meme8.jpg",
  "aboutMe/memes/meme9.jpg",
  "aboutMe/memes/meme10.jpg",
  "aboutMe/memes/meme11.jpg",
  "aboutMe/memes/meme12.jpg",
  "aboutMe/memes/meme13.jpg",
  "aboutMe/memes/meme14.jpg",
  "aboutMe/memes/meme15.jpg",
  "aboutMe/memes/meme16.jpg",
  "aboutMe/memes/meme17.jpg",
  "aboutMe/memes/meme18.jpg",
  "aboutMe/memes/meme19.jpg",
  "aboutMe/memes/meme20.jpg",
  "aboutMe/memes/meme21.jpg",
  "aboutMe/memes/meme22.jpg",
  "aboutMe/memes/meme23.jpg",
  "aboutMe/memes/meme24.jpg",
  "aboutMe/memes/meme25.jpg",
  "aboutMe/memes/meme26.jpg",
  "aboutMe/memes/meme27.jpg",
  "aboutMe/memes/meme28.jpg",
  "aboutMe/memes/meme29.jpg",
  "aboutMe/memes/meme30.jpg",
  "aboutMe/memes/meme31.jpg",
  "aboutMe/memes/meme32.jpg",
  "aboutMe/memes/meme33.jpg",
  "aboutMe/memes/meme34.jpg",
  "aboutMe/memes/meme35.jpg",
  "aboutMe/memes/meme36.jpg",
  "aboutMe/memes/meme37.jpg",
  "aboutMe/memes/meme38.jpg",
  "aboutMe/memes/meme39.jpg",
  "aboutMe/memes/meme40.jpg",
  "aboutMe/memes/meme41.jpg",
  "aboutMe/memes/meme42.jpg",
  "aboutMe/memes/meme43.jpg",
  "aboutMe/memes/meme44.jpg",
  "aboutMe/memes/meme45.jpg",
  "aboutMe/memes/meme46.jpg",
  "aboutMe/memes/meme47.jpg",
  "aboutMe/memes/meme48.jpg",
  "aboutMe/memes/meme49.jpg",
  "aboutMe/memes/meme50.jpg",
  "aboutMe/memes/meme51.jpg",
  "aboutMe/memes/meme52.jpg",
  "aboutMe/memes/meme53.jpg",
  "aboutMe/memes/meme54.jpg",
  "aboutMe/memes/meme55.jpg",
  "aboutMe/memes/meme56.jpg",
  "aboutMe/memes/meme57.jpg",
  "aboutMe/memes/meme58.jpg",
  "aboutMe/memes/meme59.jpg",
  "aboutMe/memes/meme60.jpg",
  "aboutMe/memes/meme61.jpg",
  "aboutMe/memes/meme62.jpg",
  "aboutMe/memes/meme63.jpg",
  "aboutMe/memes/meme64.jpg",
  "aboutMe/memes/meme65.jpg",
  "aboutMe/memes/meme66.jpg",
  "aboutMe/memes/meme67.jpg",
  "aboutMe/memes/meme68.jpg",
  "aboutMe/memes/meme69.jpg",
  "aboutMe/memes/meme70.jpg",
  "aboutMe/memes/meme71.jpg",
  "aboutMe/memes/meme72.jpg",
  "aboutMe/memes/meme73.jpg",
  "aboutMe/memes/meme74.jpg",
  "aboutMe/memes/meme75.jpg",
  "aboutMe/memes/meme76.jpg",
  "aboutMe/memes/meme77.jpg",
  "aboutMe/memes/meme78.jpg",
  "aboutMe/memes/meme79.jpg",
  "aboutMe/memes/meme80.jpg",
  "aboutMe/memes/meme81.jpg",
  "aboutMe/memes/meme82.jpg",
  "aboutMe/memes/meme83.jpg",
  "aboutMe/memes/meme84.jpg",
  "aboutMe/memes/meme85.jpg",
  "aboutMe/memes/meme86.jpg",
  "aboutMe/memes/meme87.jpg",
  "aboutMe/memes/meme88.jpg",
  "aboutMe/memes/meme89.jpg",
  "aboutMe/memes/meme90.jpg",
  "aboutMe/memes/meme91.jpg",
  "aboutMe/memes/meme92.jpg",
  "aboutMe/memes/meme93.jpg",
  "aboutMe/memes/meme94.jpg",
  "aboutMe/memes/meme95.jpg",
  "aboutMe/memes/meme96.jpg",
  "aboutMe/memes/meme97.jpg",
  "aboutMe/memes/meme98.jpg",
  "aboutMe/memes/meme99.jpg",
  "aboutMe/memes/meme100.jpg",
  "aboutMe/memes/meme101.jpg",
  "aboutMe/memes/meme102.jpg",
  "aboutMe/memes/meme103.jpg",
  "aboutMe/memes/meme104.jpg",
  "aboutMe/memes/meme105.jpg",
  "aboutMe/memes/meme106.jpg",
  "aboutMe/memes/meme107.jpg",
  "aboutMe/memes/meme108.jpg",
  "aboutMe/memes/meme109.jpg",
  "aboutMe/memes/meme110.jpg",
  "aboutMe/memes/meme111.jpg",
  "aboutMe/memes/meme112.jpg",
  "aboutMe/memes/meme113.jpg",
  "aboutMe/memes/meme114.jpg",
  "aboutMe/memes/meme115.jpg",
  "aboutMe/memes/meme116.jpg",
  "aboutMe/memes/meme117.jpg",
  "aboutMe/memes/meme118.jpg",
  "aboutMe/memes/meme119.jpg",
  "aboutMe/memes/meme120.jpg",
  "aboutMe/memes/meme121.jpg",
  "aboutMe/memes/meme122.jpg",
  "aboutMe/memes/meme123.jpg",
  "aboutMe/memes/meme124.jpg",
  "aboutMe/memes/meme125.jpg",
  "aboutMe/memes/meme126.jpg",
  "aboutMe/memes/meme127.jpg",
  "aboutMe/memes/meme128.jpg",
  "aboutMe/memes/meme129.jpg",
  "aboutMe/memes/meme130.jpg",
  "aboutMe/memes/meme131.jpg",
  "aboutMe/memes/meme132.jpg",
  "aboutMe/memes/meme133.jpg",
  "aboutMe/memes/meme134.jpg",
  "aboutMe/memes/meme135.jpg",
  "aboutMe/memes/meme136.jpg",
  "aboutMe/memes/meme137.jpg",
  "aboutMe/memes/meme138.jpg",
  "aboutMe/memes/meme139.jpg",
  "aboutMe/memes/meme140.jpg",
  "aboutMe/memes/meme141.jpg",
  "aboutMe/memes/meme142.jpg",
  "aboutMe/memes/meme143.jpg",
  "aboutMe/memes/meme144.jpg",
  "aboutMe/memes/meme145.jpg",
  "aboutMe/memes/meme146.jpg",
  "aboutMe/memes/meme147.jpg",
  "aboutMe/memes/meme148.jpg",
  "aboutMe/memes/meme149.jpg",
  "aboutMe/memes/meme150.jpg",
  "aboutMe/memes/meme151.jpg",
  "aboutMe/memes/meme152.jpg",
];

const MEMES_PER_OPEN = 9; // quantas aparecem por vez

function initMemeStash() {
  const btn = document.getElementById("meme-open-btn");
  const preview = document.getElementById("meme-preview");
  if (!btn || !preview) return;

  // preenche a preview com 6 memes sorteados (3x2)
  const previewPick = [...MEMES].sort(() => Math.random() - 0.5).slice(0, 6);
  for (const src of previewPick) {
    const img = document.createElement("img");
    img.src = src;
    img.alt = "";
    img.loading = "lazy";
    preview.appendChild(img);
  }

  // cria o overlay da galeria completa (uma vez)
  let overlay = document.getElementById("meme-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "reader-overlay";
    overlay.id = "meme-overlay";
    overlay.hidden = true;
    overlay.innerHTML = `
      <div class="reader-window meme-window">
        <div class="reader-titlebar">
          <p>✦ meme stash</p>
          <div>
            <button class="reader-close" id="meme-shuffle" title="shuffle">⟳</button>
            <button class="reader-close" id="meme-close">✕</button>
          </div>
        </div>
        <div class="meme-grid" id="meme-grid"></div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.hidden = true;
    });
    document.getElementById("meme-close").addEventListener("click", () => {
      overlay.hidden = true;
    });
    document.getElementById("meme-shuffle").addEventListener("click", fillMemeGrid);
  }

  btn.addEventListener("click", () => {
    overlay.hidden = false;
    fillMemeGrid();
  });
}

/* mostra TODOS os memes, em ordem embaralhada */
function fillMemeGrid() {
  const grid = document.getElementById("meme-grid");
  grid.innerHTML = "";

  // embaralha a ordem, mas exibe a coleção inteira
  const all = [...MEMES].sort(() => Math.random() - 0.5);

  for (const src of all) {
    const img = document.createElement("img");
    img.className = "meme-item";
    img.src = src;
    img.alt = "";
    img.loading = "lazy";
    grid.appendChild(img);
  }
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

// -------------------------- CURSORES --------------------------

/* ---------------- CUSTOM CURSOR + TOOLTIP ---------------- */
const CLICKABLE = "a, button, input, textarea, select, [onclick]";

function initCursor() {
  const cursor = document.getElementById("custom-cursor");
  const tooltip = document.getElementById("cursor-tooltip");
  if (!cursor) return;

  document.addEventListener("mousemove", (e) => {
    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";

    // balãozinho flutua um pouco acima e à direita do cursor
    if (tooltip) {
      tooltip.style.left = e.clientX + 18 + "px";
      tooltip.style.top = e.clientY - 24 + "px";
    }
  });

  document.addEventListener("mouseover", (e) => {
    // mãozinha em cima de clicáveis
    cursor.classList.toggle("hovering", !!e.target.closest(CLICKABLE));

    // balãozinho aparece se o elemento tiver data-tooltip
    if (tooltip) {
      const tipEl = e.target.closest("[data-tooltip]");
      if (tipEl) {
        tooltip.textContent = tipEl.dataset.tooltip;
        tooltip.classList.add("visible");
      } else {
        tooltip.classList.remove("visible");
      }
    }
  });
}

/* ---------------- BOOT ---------------- */
document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  initStories();
  initCoffee();
  initMemeStash();
  initPet();
  initPhotoSwap();
  initFavorites();
  initStampCarousel();
  initCursor();
});