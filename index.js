const songs = [
"music/song1.mp3",
"music/song2.mp3",
"music/song3.mp3"
]

const titles = [
"Song 1",
"Song 2",
"Song 3"
]

let songIndex = 0

const audio = document.getElementById("audio")
const playBtn = document.getElementById("playBtn")
const progress = document.getElementById("progress")
const songTitle = document.getElementById("songTitle")

loadSong()

function loadSong(){

audio.src = songs[songIndex]
songTitle.textContent = titles[songIndex]

}

function togglePlay(){

if(audio.paused){

audio.play()
playBtn.textContent = "⏸"

}else{

audio.pause()
playBtn.textContent = "▶"

}

}

function prevSong(){

songIndex--

if(songIndex < 0){
songIndex = songs.length - 1
}

loadSong()
audio.play()
playBtn.textContent = "⏸"

}

function nextSong(){

songIndex++

if(songIndex > songs.length - 1){
songIndex = 0
}

loadSong()
audio.play()
playBtn.textContent = "⏸"

}

audio.addEventListener("timeupdate", () => {

progress.value = (audio.currentTime / audio.duration) * 100

})

progress.addEventListener("input", () => {

audio.currentTime = (progress.value / 100) * audio.duration

})