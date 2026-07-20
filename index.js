const audio = document.getElementById("audio")
const play = document.getElementById("play")
const prevBtn = document.getElementById("prev")
const nextBtn = document.getElementById("next")
const progress = document.getElementById("progress")
const title = document.getElementById("song-title")

const songs = [
    {
        title:"To All of You - Syd Matters",
        file:"music/To All Of You - Syd Matters.mp3"
    },
    {
        title:"Over the Moon - The Marías",
        file:"music/Over the Moon - The Marías.mp3"
    },
    {
        title:"Obstacles - Syd Matters",
        file:"music/Obstacles - Syd Matters.mp3"
    },
    {
        title:"Oceano - Djavan",
        file:"music/Oceano - Djavan.mp3"
    },
    {
        title:"Sol de Primavera (Album Version) - Beto Guedes",
        file:"music/Sol de Primavera (Album Version) - Beto Guedes.mp3"
    }
]

let songIndex = 0

function loadSong(song){
    title.textContent = song.title
    audio.src = song.file
}

function playSong(){
    audio.play()
    play.textContent = "⏸"
    if (typeof markWidgetUsed === "function") markWidgetUsed("player");
}

function pauseSong(){
    audio.pause()
    play.textContent = "▶"
}

play.addEventListener("click", () => {
    if(audio.paused){
        playSong()
    } else {
        pauseSong()
    }
})

// --------- AVANÇAR UMA MUSICA

function nextSong(){
    songIndex++

    if(songIndex > songs.length - 1){
        songIndex = 0
    }

    loadSong(songs[songIndex])
    playSong()
}

// --------- voltar uma musica 

function prevSong(){
    songIndex--

    if(songIndex < 0){
        songIndex = songs.length - 1
    }

    loadSong(songs[songIndex])
    playSong()
}

nextBtn.addEventListener("click", nextSong)
prevBtn.addEventListener("click", prevSong)

audio.addEventListener("timeupdate", () => {

    const {duration, currentTime} = audio

    const progressPercent = (currentTime / duration) * 100

    progress.style.width = progressPercent + "%"
})

loadSong(songs[songIndex])

// ---------- VOLUME -------------

const volume = document.getElementById("volume")

volume.addEventListener("input", () => {
    audio.volume = volume.value
})


// ---------- MINUTAGEM DA MUSICA --------------

const currentTimeEl = document.getElementById("current-time")
const durationEl = document.getElementById("duration")

// Atualiza a duração total assim que carrega a música
audio.addEventListener("loadedmetadata", () => {
    let minutes = Math.floor(audio.duration / 60)
    let seconds = Math.floor(audio.duration % 60)
    if(seconds < 10) seconds = "0" + seconds
    durationEl.textContent = `${minutes}:${seconds}`
})

// Atualiza o tempo atual durante a reprodução
audio.addEventListener("timeupdate", () => {
    let minutes = Math.floor(audio.currentTime / 60)
    let seconds = Math.floor(audio.currentTime % 60)
    if(seconds < 10) seconds = "0" + seconds
    currentTimeEl.textContent = `${minutes}:${seconds}`
})


// ----------- ANIMAÇÃO DISCO GIRANDO ------------

const disc = document.getElementById("disc")
let rotation = 0
let rotateInterval

function startDisc(){
    rotateInterval = setInterval(() => {
        rotation += 2
        disc.style.transform = `rotate(${rotation}deg)`
    }, 10)
}

function stopDisc(){
    clearInterval(rotateInterval)
}

audio.addEventListener("play", startDisc)
audio.addEventListener("pause", stopDisc)
audio.addEventListener("ended", stopDisc)

// ----------------- CURSOR ---------------------

const cursor = document.getElementById("custom-cursor")

let mouseX = window.innerWidth / 2
let mouseY = window.innerHeight / 2

/* CURSOR SEGUE O MOUSE */
document.addEventListener("mousemove", (e) => {

    mouseX = e.clientX
    mouseY = e.clientY

    cursor.style.left = mouseX + "px"
    cursor.style.top = mouseY + "px"
})

/* CRIA GLITTER CONSTANTEMENTE */
setInterval(() => {

    const sparkle = document.createElement("div")
    sparkle.classList.add("sparkle")

    sparkle.innerHTML = "✧"

    /* posição aleatória perto do cursor */
    sparkle.style.left =
        (mouseX + (Math.random() * 16 - 8)) + "px"

    sparkle.style.top =
        (mouseY + (Math.random() * 16 - 8)) + "px"

    document.body.appendChild(sparkle)

    setTimeout(() => {
        sparkle.remove()
    }, 1200)

}, 60)

const clickable = document.querySelectorAll("a, button")

clickable.forEach(item => {

    item.addEventListener("mouseenter", () => {
        cursor.style.backgroundImage =
            'url("cursor/cursor3.gif")'
    })

    item.addEventListener("mouseleave", () => {
        cursor.style.backgroundImage =
            'url("cursor/cursor2.gif")'
    })

})

// -------------- TODAYS BELA ------------------

const BELA_MODES = [
  { icon: "gifs/bela/coffee.webp",   title: "Sleep Deprived Programmer", description: "Currently surviving on caffeine and questionable life choices." },
  { icon: "gifs/bela/gamer2.webp",    title: "Gamer Goblin",              description: "Will disappear for six hours after saying \"one more match.\"" },
  { icon: "gifs/bela/bookwriting.gif",   title: "Writer Mode",               description: "Thinking about fictional characters instead of real responsibilities." },
  { icon: "gifs/bela/nails.webp",    title: "Nail Artist",               description: "Currently planning another nail design that definitely wasn't necessary." },
  { icon: "gifs/bela/dev.webp",      title: "Hyperfocused Developer",    description: "Has spent two hours fixing a 3-pixel alignment issue." },
  { icon: "gifs/bela/cat2.webp",      title: "Cat Energy",                description: "Needs a nap immediately." },
  { icon: "gifs/bela/cozy.webp",     title: "Cozy Bela",                 description: "Blanket. Latte. Rain. Perfect day." },
  { icon: "gifs/bela/chaos3.webp",    title: "Creative Chaos",            description: "Has fifteen unfinished ideas and somehow started a sixteenth." },
  { icon: "gifs/bela/pink.webp",     title: "Pink Collector",            description: "Everything is better if it's pink." },
  { icon: "gifs/bela/gremlin.webp",  title: "Gremlin Mode",              description: "Running purely on chaos." },
  { icon: "gifs/bela/nightowl2.webp", title: "Night Owl",                 description: "Sleep schedule? Never heard of  her." },
  { icon: "gifs/bela/music.webp",    title: "Music Addict",              description: "Listening to the same song for the 57th time." },
];

  let lastBelaIndex = -1; // evita repetir o mesmo resultado duas vezes seguidas

  function pickBelaMode() {
    if (BELA_MODES.length <= 1) return BELA_MODES[0];
    let index;
    do {
      index = Math.floor(Math.random() * BELA_MODES.length);
    } while (index === lastBelaIndex);
    lastBelaIndex = index;
    return BELA_MODES[index];
  }

  function generateBela() {
    const result = document.getElementById("bela-result");
    const mode = pickBelaMode();

    // 1. fade out + scale down
    result.classList.add("switching");

    // 2. quando a transição de saída termina, troca o conteúdo e volta
    setTimeout(() => {
      document.getElementById("bela-img").src = mode.icon;   // ← era o textContent do emoji
      document.getElementById("bela-title").textContent = mode.title;
      document.getElementById("bela-desc").textContent = mode.description;
      result.classList.remove("switching");
    }, 250); // mesmo tempo do transition do CSS

    // Achievement system 🏆 (só chama se o script estiver na página)
    if (typeof countAchievementEvent === "function") countAchievementEvent("bela");
    if (typeof markWidgetUsed === "function") markWidgetUsed("bela");
  }

  document.getElementById("bela-btn").addEventListener("click", generateBela);

//   ------------------- FORTUNE COOKIE -------------------
  /* ==========================================================
     FORTUNE GENERATOR (lógica separada da UI)
     ========================================================== */
  const FORTUNES = [
    "🌸 Today is a good day to romanticize your life.",
    "🎀 You're prettier than you think today.",
    "☕ Go make yourself a little treat. You've earned it.",
    "💻 Today your code will compile on the first try. (probably.)",
    "🐈 Pet the first cat you see. It's mandatory.",
    "🌧 It's legally required to stay cozy today.",
    "🎮 One more game won't hurt. (It will.)",
    "🍓 Someone out there would absolutely love your outfit today.",
    "🎧 Put your headphones on. It'll fix at least 30% of your problems.",
    "🍜 Instant noodles count as a real meal today.",
    "💾 Save your project. Seriously.",
    "📚 You'll accidentally learn something useful today.",
    "🖱 Your bug is caused by something incredibly stupid.",
    "🎀 Pink is objectively the best color today.",
    "🌙 Going to sleep at a reasonable hour is just a suggestion.",
    "🍀 Luck is on your side... don't waste it arguing with CSS.",
    "⚠ CSS has chosen violence today.",
    "🐸 Today feels like a frog-on-a-lily-pad kind of day.",
    "🍪 Cookies have zero calories inside personal websites.",
    "🦝 Embrace the gremlin energy.",
    "☁ Maybe everything will be okay.",
    "🌷 You're someone's favorite person and you probably don't even know it.",
    "💌 That message you're overthinking? Just send it.",
    "🛒 You deserve that thing sitting in your shopping cart.",
    "🎮 Steam is about to have a sale. Stay strong.",
    "💖 Your inner child wants stickers.",
    "🖍 Buy the cute stationery.",
    "💸 Financial responsibility can wait... (this is not financial advice.)",
    "☕ Caffeine is a personality trait now.",
    "🎀 Your Pinterest boards have excellent taste.",
    "🐈 A cat would trust you.",
    "🍓 You're just a girl. (gender optional.)",
    "💻 Your computer is judging your desktop organization.",
    "🎵 Today's song will become next month's obsession.",
    "🌸 Someone is silently rooting for you.",
    "👾 Touching grass is optional today.",
    "✨ You're the main character. Act accordingly.",
    "🦆 The ducks believe in you.",
    "💌 Drink some water before opening another browser tab.",
    "📂 Your Downloads folder is crying for help.",
    "🍄 You should collect tiny trinkets today.",
    "🎲 Today is a lucky day to start a new game.",
    "🎀 Being cringe is temporary. Being free is forever.",
    "🧃 Your younger self would think you're pretty cool.",
    "🐛 Every programmer deserves one dramatic debugging session per week.",
    "🎧 Repeat that song again. I know you want to.",
    "💿 Your comfort album misses you.",
    "🌙 Your sleep schedule has officially become a cryptid.",
    "🖱 Closing 47 browser tabs counts as self-care."
  ];
 
  const RARE_FORTUNES = [
     "☆ LEGENDARY FORTUNE ☆ You'll find money on the ground.",
     "☆ LEGENDARY FORTUNE ☆ Your outfit will slay effortlessly.",
     "☆ LEGENDARY FORTUNE ☆ Someone will buy your clothes cart for you.",
     "☆ LEGENDARY FORTUNE ☆ Elon Musk will die soon.",
     "☆ LEGENDARY FORTUNE ☆  Congratulations. Today absolutely nothing bad will happen. Probably.",
     "☆ LEGENDARY FORTUNE ☆  A random cat has blessed your day.",
     "☆ LEGENDARY FORTUNE ☆  You may buy ONE unnecessary cute thing today without guilt.",
     "☆ LEGENDARY FORTUNE ☆  Your wallet is terrified.",
     "☆ LEGENDARY FORTUNE ☆  You have been perceived.",
     "☆ LEGENDARY FORTUNE ☆  The shopping cart has been looking at you too.",
     "☆ LEGENDARY FORTUNE ☆  Today you're the prettiest person in every room you enter.",
     "☆ LEGENDARY FORTUNE ☆  You will clutch the next boss fight.",
     "☆ LEGENDARY FORTUNE ☆  RNG is finally on your side.",
     "☆ LEGENDARY FORTUNE ☆  The bug will magically disappear after you complain about it.",
     "☆ LEGENDARY FORTUNE ☆  That package will arrive earlier than expected.",
     "☆ LEGENDARY FORTUNE ☆  Today is a perfect day to be unapologetically yourself."
  ];
 
  const FOOTERS = [
    "🥠 certified by Bela's Gaming Room.",
    "🎀 100% cute, 0% reliable.",
    "☕ approved by three cups of coffee.",
    "💻 source: trust me bro.",
    "🐈 verified by a random neighborhood cat.",
    "🎮 RNG was feeling generous today.",
    "🍓 today's vibes have been professionally analyzed.",
    "🌸 probably true. don't quote me on that though.",
    "✨ your lawyer advised me not to elaborate.",
    "💀 this cookie has a PhD in making things up.",
    "🍀 results sponsored by pure luck.",
    "🎧 approved by my Spotify playlist.",
    "🛒 your shopping cart agrees with this message.",
    "💸 your wallet strongly disagrees.",
    "👾 generated with absolutely zero scientific evidence.",
    "🎲 statistically questionable.",
    "💌 take this personally.",
    "🦝 written during peak gremlin hours.",
    "🍜 fueled by instant noodles and poor decisions.",
    "💖 emotionally peer-reviewed.",
    "🌙 probably sent by the moon herself.",
    "🐸 certified silly.",
    "🍪 baked with love and misinformation.",
    "🖱 definitely not hallucinated by JavaScript.",
    "📀 your playlist saw this coming.",
    "☁ side effects may include unnecessary confidence.",
    "🌷 if it's wrong... no it isn't.",
    "🧸 the cookie believes in you.",
    "✨ i literally made it up.",
  ];
 
  const RARE_CHANCE = 0.05;        // ~5%
  const FORTUNE_STORAGE = "bela_fortune_v1";
 
  let lastFortuneIndex = -1;
 
  /* sorteia uma fortuna; { text, rare } */
  function drawFortune() {
    if (Math.random() < RARE_CHANCE) {
      const i = Math.floor(Math.random() * RARE_FORTUNES.length);
      return { text: RARE_FORTUNES[i], rare: true };
    }
    let i;
    do {
      i = Math.floor(Math.random() * FORTUNES.length);
    } while (i === lastFortuneIndex && FORTUNES.length > 1);
    lastFortuneIndex = i;
    return { text: FORTUNES[i], rare: false };
  }
 
  function drawFooter() {
    return FOOTERS[Math.floor(Math.random() * FOOTERS.length)];
  }
 
  /* ---------- storage: histórico (últimas 5) + estatísticas ---------- */
  function loadFortuneData() {
    try {
      return JSON.parse(localStorage.getItem(FORTUNE_STORAGE)) || {};
    } catch (e) { return {}; }
  }
 
  function saveFortuneData(data) {
    try {
      localStorage.setItem(FORTUNE_STORAGE, JSON.stringify(data));
    } catch (e) { /* storage indisponível: widget segue funcionando */ }
  }
 
  function recordFortune(text) {
    const data = loadFortuneData();
    data.history = [text, ...(data.history || [])].slice(0, 5);
    data.totalOpened = (data.totalOpened || 0) + 1;
    data.lastFortune = text;
    data.lastOpenedAt = new Date().toISOString();
    saveFortuneData(data);
  }
 
  /* ==========================================================
     UI
     ========================================================== */
  const fortuneEls = {
    widget:  document.getElementById("fortune-widget"),
    cookie:  document.getElementById("fortune-cookie-img"),
    text:    document.getElementById("fortune-text"),
    footer:  document.getElementById("fortune-footer"),
    openBtn: document.getElementById("fortune-open-btn"),
    histBtn: document.getElementById("fortune-history-btn"),
    history: document.getElementById("fortune-history"),
    histList: document.getElementById("fortune-history-list"),
  };
 
  let fortuneBusy = false; // trava durante a animação
 
  function openCookie() {
    if (fortuneBusy) return;
    fortuneBusy = true;
 
    const fortune = drawFortune();
    const footer = drawFooter();
 
    // 1. chacoalha o biscoito
    fortuneEls.cookie.classList.remove("crack");
    void fortuneEls.cookie.offsetWidth;
    fortuneEls.cookie.classList.add("crack");
 
    // 2. fade out do texto antigo
    fortuneEls.text.classList.add("fading");
    fortuneEls.footer.classList.add("fading");
 
    // 3. troca e fade in, sincronizado com o fim da chacoalhada
    setTimeout(() => {
      fortuneEls.text.textContent = fortune.text;
      fortuneEls.text.classList.toggle("rare", fortune.rare);
      fortuneEls.footer.textContent = footer;
 
      fortuneEls.text.classList.remove("fading");
      fortuneEls.footer.classList.remove("fading");
 
      spawnSparkles(fortune.rare ? 7 : 4);
      fortuneBusy = false;
    }, 300);
 
    recordFortune(fortune.text);
 
    /* hook de integração (conquistas etc): o widget só avisa,
       não implementa nada — veja onFortuneOpened lá embaixo */
    if (typeof window.onFortuneOpened === "function") {
      window.onFortuneOpened();
    }
  }
 
  /* sparkles nascendo em posições aleatórias sobre o widget */
  function spawnSparkles(count) {
    for (let s = 0; s < count; s++) {
      const spark = document.createElement("span");
      spark.className = "fortune-sparkle";
      spark.textContent = "✦";
      spark.style.left = 15 + Math.random() * 70 + "%";
      spark.style.top = 25 + Math.random() * 40 + "%";
      spark.style.animationDelay = Math.random() * 0.25 + "s";
      fortuneEls.widget.appendChild(spark);
      setTimeout(() => spark.remove(), 1300);
    }
  }
 
  /* histórico */
  function toggleHistory() {
    const isOpen = fortuneEls.history.classList.toggle("open");
    if (!isOpen) return;
 
    const history = loadFortuneData().history || [];
    fortuneEls.histList.innerHTML = "";
    if (history.length === 0) {
      const li = document.createElement("li");
      li.textContent = "no fortunes yet…";
      fortuneEls.histList.appendChild(li);
      return;
    }
    for (const text of history) {
      const li = document.createElement("li");
      li.textContent = text;
      fortuneEls.histList.appendChild(li);
    }
  }
 
  /* eventos */
  fortuneEls.openBtn.addEventListener("click", openCookie);
  fortuneEls.histBtn.addEventListener("click", toggleHistory);
 
  /* Enter abre um biscoito quando o widget está focado */
  fortuneEls.widget.addEventListener("keydown", (e) => {
    if (e.key === "Enter") openCookie();
  });
 
  /* ==========================================================
     INTEGRAÇÃO COM O ACHIEVEMENT SYSTEM
     O widget expõe window.onFortuneOpened — quem conecta é você.
     Como seu achievements.js já está na página, basta isto:
     ========================================================== */
  window.onFortuneOpened = function () {
    if (typeof countAchievementEvent === "function") countAchievementEvent("fortune");
    if (typeof markWidgetUsed === "function") markWidgetUsed("fortune");
  };

  // ---------- ACHIEVEMENT MARKERS ----------
// guestbook: clicar no link conta como interação
document.querySelector(".guestInner a")?.addEventListener("click", () => {
  if (typeof markWidgetUsed === "function") markWidgetUsed("guestbook");
});