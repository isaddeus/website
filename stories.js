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

document.addEventListener("DOMContentLoaded", loadStories);