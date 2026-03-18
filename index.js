const audio = document.getElementById("audio")
const playBtn = document.getElementById("play")
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
    playBtn.textContent = "⏸"
}

function pauseSong(){
    audio.pause()
    playBtn.textContent = "▶"
}

playBtn.addEventListener("click", () => {
    if(audio.paused){
        playSong()
    } else {
        pauseSong()
    }
})

function nextSong(){
    songIndex++

    if(songIndex > songs.length - 1){
        songIndex = 0
    }

    loadSong(songs[songIndex])
    playSong()
}

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