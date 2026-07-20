/* ============================================================
   STORIES 📚 — lógica da página
   Carrega histórias + capítulos da API e monta as estantes.
   Clicar num capítulo abre o reader (openStoryReader, do reader.js).
   ============================================================ */

const STORIES_LIST_API = "https://website-rho-drab-69.vercel.app/api/stories";

async function loadStories() {
  const list = document.getElementById("stories-list");

  let stories;
  try {
    const res = await fetch(STORIES_LIST_API);
    if (!res.ok) throw new Error();
    stories = await res.json();
  } catch (err) {
    list.innerHTML = "";
    const msg = document.createElement("p");
    msg.className = "stories-empty";
    msg.textContent = "The bookshelf won't open right now… try again in a bit 🗝";
    list.appendChild(msg);
    return;
  }

  list.innerHTML = "";

  if (stories.length === 0) {
    const empty = document.createElement("p");
    empty.className = "stories-empty";
    empty.textContent = "No stories on the shelf yet… come back soon! 🌸";
    list.appendChild(empty);
    return;
  }

  for (const story of stories) {
    list.appendChild(buildStoryShelf(story));
  }
}

function buildStoryShelf(story) {
  const win = document.createElement("article");
  win.className = "story-window";

  /* header glossy com o título da história */
  const header = document.createElement("div");
  header.className = "story-header";
  const title = document.createElement("p");
  title.textContent = `📖 ${story.title}`;
  const count = document.createElement("p");
  const n = (story.chapters || []).length;
  count.textContent = `${n} chapter${n === 1 ? "" : "s"}`;
  header.append(title, count);
  win.appendChild(header);

  const body = document.createElement("div");
  body.className = "story-body";

  /* descrição */
  if (story.description) {
    const desc = document.createElement("p");
    desc.className = "story-description";
    desc.textContent = story.description;
    body.appendChild(desc);
  }

  /* tags */
  if (story.tags && story.tags.length) {
    const tags = document.createElement("p");
    tags.className = "story-tags";
    for (const t of story.tags) {
      const tag = document.createElement("span");
      tag.className = "story-tag";
      tag.textContent = t;
      tags.appendChild(tag);
    }
    body.appendChild(tags);
  }

  /* abas de personagens */
  if (story.characters && story.characters.length) {
    const charBar = document.createElement("div");
    charBar.className = "char-tabs";
    const label = document.createElement("span");
    label.className = "char-tabs-label";
    label.textContent = "cast:";
    charBar.appendChild(label);

    for (const char of story.characters) {
      const tab = document.createElement("button");
      tab.className = "char-tab";
      tab.textContent = char.name;
      tab.addEventListener("click", () =>
        openCharacterSheet(story.characters, char.id)
      );
      charBar.appendChild(tab);
    }
    body.appendChild(charBar);
  }

  /* capítulos: cada linha abre o reader */
  for (const chap of story.chapters || []) {
    const row = document.createElement("button");
    row.className = "chapter-row";

    const number = document.createElement("span");
    number.className = "chapter-number";
    number.textContent = `CH ${chap.number}`;

    const chapTitle = document.createElement("span");
    chapTitle.className = "chapter-title";
    chapTitle.textContent = chap.title;

    const likes = document.createElement("span");
    likes.className = "chapter-likes";
    likes.textContent = `♥ ${chap.likes}`;

    const date = document.createElement("span");
    date.className = "chapter-date";
    date.textContent = chap.date || "";

    row.append(number, chapTitle, likes, date);
    row.addEventListener("click", () => openStoryReader(chap.id));
    body.appendChild(row);
  }

  win.appendChild(body);
  return win;
}

/* ============================================================
   CHARACTER SHEET 📇 — ficha estilo Notion
   ============================================================ */
function openCharacterSheet(characters, activeId) {
  // cria o overlay uma vez
  let overlay = document.getElementById("char-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "reader-overlay"; // reusa o overlay do reader!
    overlay.id = "char-overlay";
    overlay.innerHTML = `
      <div class="reader-window char-window">
        <div class="reader-titlebar">
          <p>📇 character file</p>
          <button class="reader-close" id="char-close">✕</button>
        </div>
        <div class="char-tabs-top" id="char-tabs-top"></div>
        <div class="reader-body" id="char-body"></div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.hidden = true;
    });
    overlay.querySelector("#char-close").addEventListener("click", () => {
      overlay.hidden = true;
    });
  }
  overlay.hidden = false;

  /* abas no topo da ficha */
  const tabsTop = document.getElementById("char-tabs-top");
  tabsTop.innerHTML = "";
  for (const c of characters) {
    const tab = document.createElement("button");
    tab.className = "char-tab" + (c.id === activeId ? " active" : "");
    tab.textContent = c.name;
    tab.addEventListener("click", () => openCharacterSheet(characters, c.id));
    tabsTop.appendChild(tab);
  }

  /* a ficha em si */
  const char = characters.find((c) => c.id === activeId);
  const body = document.getElementById("char-body");
  body.innerHTML = "";

  const name = document.createElement("h1");
  name.className = "reader-title";
  name.textContent = char.name;
  body.appendChild(name);

  if (char.quote) {
    const quote = document.createElement("p");
    quote.className = "char-quote";
    quote.textContent = `"${char.quote}"`;
    body.appendChild(quote);
  }

  /* linha de propriedades (só as preenchidas aparecem) */
  const meta = document.createElement("div");
  meta.className = "reader-meta";
  const props = [
    ["role", char.role], ["age", char.age],
    ["pronouns", char.pronouns], ["height", char.height],
  ];
  for (const [label, value] of props) {
    if (!value) continue;
    const prop = document.createElement("span");
    prop.className = "char-prop";
    prop.innerHTML = `<b>${label}:</b> `;
    prop.append(value); // valor via append = seguro
    meta.appendChild(prop);
  }
  body.appendChild(meta);

  /* bio com a mesma formatação das fanfics */
  const bio = document.createElement("div");
  bio.className = "reader-text";
  bio.innerHTML = formatStoryText(char.bio || "");
  body.appendChild(bio);
}

document.addEventListener("DOMContentLoaded", loadStories);