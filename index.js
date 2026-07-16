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