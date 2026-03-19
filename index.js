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
    }, 30)
}

function stopDisc(){
    clearInterval(rotateInterval)
}

audio.addEventListener("play", startDisc)
audio.addEventListener("pause", stopDisc)
audio.addEventListener("ended", stopDisc)