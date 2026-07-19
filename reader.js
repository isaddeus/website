
/* ============================================================
   STORY READER 📖 — lógica do pop-up
   Inclua depois do reader.css. Em qualquer página:
     openStoryReader(chapterId)
   Ex: <button onclick="openStoryReader(1)">Read more</button>
   ou:  botões com data-chapter-id são conectados sozinhos.
   ============================================================ */

const STORIES_API = "https://website-rho-drab-69.vercel.app/api/stories";
const LIKED_KEY = "bela_liked_chapters"; // trava local de 1 like por navegador

/* ---------- infra: cria o overlay uma vez só ---------- */
function ensureReaderDom() {
  if (document.getElementById("reader-overlay")) return;

  const overlay = document.createElement("div");
  overlay.className = "reader-overlay";
  overlay.id = "reader-overlay";
  overlay.hidden = true;
  overlay.innerHTML = `
    <div class="reader-window">
      <div class="reader-titlebar">
        <p>📖 story reader</p>
        <button class="reader-close" id="reader-close">✕</button>
      </div>
      <div class="reader-body" id="reader-body"></div>
    </div>`;
  document.body.appendChild(overlay);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeStoryReader();
  });
  document.getElementById("reader-close").addEventListener("click", closeStoryReader);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeStoryReader();
  });
}

function closeStoryReader() {
  const overlay = document.getElementById("reader-overlay");
  if (overlay) overlay.hidden = true;
}

/* ---------- likes: trava local ---------- */
function getLikedSet() {
  try {
    return new Set(JSON.parse(localStorage.getItem(LIKED_KEY)) || []);
  } catch (e) { return new Set(); }
}

function markLiked(chapterId) {
  const set = getLikedSet();
  set.add(chapterId);
  try { localStorage.setItem(LIKED_KEY, JSON.stringify([...set])); } catch (e) {}
}


/* ---------- mini formatador de texto (seguro) ---------- */
/* Converte marcações simples em HTML, escapando todo o resto.
   *itálico*  _itálico_  **negrito**  ~~riscado~~  --- (divisor) */
function formatStoryText(raw) {
  // 1. escapa TODO html primeiro (segurança: nada do banco vira tag)
  let safe = raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // 2. aplica as marcações permitidas (ordem importa: ** antes de *)
  safe = safe
    .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
    .replace(/\*(.+?)\*/g, "<i>$1</i>")
    .replace(/_(.+?)_/g, "<i>$1</i>")
    .replace(/~~(.+?)~~/g, "<s>$1</s>")
    .replace(/^---$/gm, '<hr class="scene-break">');

  return safe;
}

/* ---------- abrir e montar a página ---------- */
async function openStoryReader(chapterId) {
  ensureReaderDom();
  const overlay = document.getElementById("reader-overlay");
  const body = document.getElementById("reader-body");

  overlay.hidden = false;
  body.innerHTML = `<p class="reader-loading">opening the story… ✎</p>`;

  let chap;
  try {
    const res = await fetch(`${STORIES_API}?chapter=${chapterId}`);
    if (!res.ok) throw new Error();
    chap = await res.json();
  } catch (err) {
    body.innerHTML = `<p class="reader-loading">couldn't open this story… try again later 🗝</p>`;
    return;
  }

  body.innerHTML = "";

  /* título + nome da história */
  const title = document.createElement("h1");
  title.className = "reader-title";
  title.textContent = chap.title;
  body.appendChild(title);

  if (chap.stories?.title) {
    const storyName = document.createElement("p");
    storyName.className = "reader-story-name";
    storyName.textContent = `from "${chap.stories.title}" · chapter ${chap.number}`;
    body.appendChild(storyName);
  }

  /* linha de propriedades: data, tags, like */
  const meta = document.createElement("div");
  meta.className = "reader-meta";

  const date = document.createElement("span");
  date.className = "reader-date";
  date.textContent = `📅 ${chap.date || ""}`;
  meta.appendChild(date);

  for (const t of chap.stories?.tags || []) {
    const tag = document.createElement("span");
    tag.className = "reader-tag";
    tag.textContent = t;
    meta.appendChild(tag);
  }

  const likeBtn = document.createElement("button");
  likeBtn.className = "reader-like";
  const alreadyLiked = getLikedSet().has(chap.id);
  likeBtn.textContent = `♥ ${chap.likes}`;
  likeBtn.classList.toggle("liked", alreadyLiked);
  likeBtn.title = alreadyLiked ? "you already liked this one ♥" : "leave a like!";

  likeBtn.addEventListener("click", async () => {
    if (getLikedSet().has(chap.id)) return; // um like por navegador
    try {
      const res = await fetch(STORIES_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "like", chapterId: chap.id }),
      });
      const { likes } = await res.json();
      likeBtn.textContent = `♥ ${likes}`;
      likeBtn.classList.add("liked", "pop");
      markLiked(chap.id);
    } catch (err) { /* silencioso: like é enfeite, não pode quebrar a leitura */ }
  });
  meta.appendChild(likeBtn);
  body.appendChild(meta);

/* texto da história (com formatação!) */
  const text = document.createElement("div");
  text.className = "reader-text";
  text.innerHTML = formatStoryText(chap.text);
  body.appendChild(text);

  /* ---------- comentários ---------- */
  const commentsTitle = document.createElement("p");
  commentsTitle.className = "reader-comments-title";
  commentsTitle.textContent = "💬 comments";
  body.appendChild(commentsTitle);

  const commentsList = document.createElement("div");
  commentsList.id = "reader-comments-list";
  body.appendChild(commentsList);
  renderComments(commentsList, chap.comments || []);

  /* formulário */
  const form = document.createElement("form");
  form.className = "reader-comment-form";

  const nameInput = document.createElement("input");
  nameInput.className = "reader-input";
  nameInput.placeholder = "your name (optional)";
  nameInput.maxLength = 30;

  const textInput = document.createElement("textarea");
  textInput.className = "reader-input";
  textInput.placeholder = "leave a cute comment…";
  textInput.rows = 3;
  textInput.maxLength = 1000;
  textInput.required = true;

  const postBtn = document.createElement("button");
  postBtn.type = "submit";
  postBtn.className = "reader-post-btn";
  postBtn.textContent = "🌸 Post comment";

  form.append(nameInput, textInput, postBtn);
  body.appendChild(form);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    postBtn.disabled = true;
    try {
      const res = await fetch(STORIES_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "comment",
          chapterId: chap.id,
          name: nameInput.value,
          text: textInput.value,
        }),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      chap.comments.push(created);
      renderComments(commentsList, chap.comments);
      textInput.value = "";
    } catch (err) {
      alert("Couldn't post your comment — try again in a bit!");
    } finally {
      postBtn.disabled = false;
    }
  });
}

function renderComments(container, comments) {
  container.innerHTML = "";
  if (comments.length === 0) {
    const empty = document.createElement("p");
    empty.className = "reader-no-comments";
    empty.textContent = "no comments yet… be the first! 🌸";
    container.appendChild(empty);
    return;
  }
  for (const c of comments) {
    const box = document.createElement("div");
    box.className = "reader-comment";
    const name = document.createElement("p");
    name.className = "reader-comment-name";
    name.textContent = c.name || "anonymous";
    const text = document.createElement("p");
    text.className = "reader-comment-text";
    text.textContent = c.text;
    box.append(name, text);
    container.appendChild(box);
  }
}

/* ---------- conecta botões marcados com data-chapter-id ---------- */
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-chapter-id]").forEach((btn) => {
    btn.addEventListener("click", () => openStoryReader(btn.dataset.chapterId));
  });
});
