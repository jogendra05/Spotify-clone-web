let songs;
let currFolder;

// Get the songs
async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`/${folder}`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response
    let s = div.getElementsByTagName("a");
    songs = [];
    for (let i = 0; i < s.length; i++) {
        const element = s[i]
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = ""
    let i = 0
    for (const song of songs) {
        let a = await fetch(`${folder}/info.json`);
        let response = await a.json(); 
        songUL.innerHTML += `
        <li>
            <img class="selectSong invert" src="img/music.svg" alt="">
            <div class="info">
                <div>${song.replaceAll('%20', " ")}</div>
                <div class="singerName">${response.singer[i]}</div>
            </div>
            <div class="playnow">
                <span>Play now</span>
                <img class="svgfilter invert" src="img/pause.svg" alt="">
            </div>
        </li>`
        i += 1;
    }

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML)
        })
    })

    return songs
}

// Time updater
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

let currentSong = new Audio();


// Play Music Function
let playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play()
    }
    let sName = decodeURI(track).split(".")[0];
    document.querySelector(".songinfo").innerHTML = sName;
    document.querySelector(".songtime1").innerHTML = "00:00"
    document.querySelector(".songtime2").innerHTML = "00:00"
}

// Display Album function
async function displayAlbums() {
    let a = await fetch(`/songs`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response

    let anchors = div.getElementsByTagName("a")
    let array = Array.from(anchors)

    for (let i = 0; i < array.length; i++) {
        const e = array[i];

        if (e.href.includes("songs/")) {
            let folder = e.href.split("/").slice(-1)[0];
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();

            document.querySelector(".cardContainer").innerHTML += `<div data-folder=${folder} class="card">
                        <div class="playButton">
                            <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="50" cy="50" r="45" fill="#1Ed760" />
                                <polygon points="40,30 70,50 40,70" fill="black" />
                            </svg>     
                        </div>
                        <img src="/songs/${folder}/cover.jpeg" alt="image">
                        <h2>${response.title}</h2>
                        <p>${response.discription}</p>
                    </div> `
        }
    }
    // Load the playlist
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
        })
    })
}



// main function
async function main() {

    // getting the songs
    await getSongs("songs/folder1");
    playMusic(songs[0], true)

    // Displaying all the Album
    displayAlbums()

    // Play and Pause Event
    let play = document.querySelector("#play");
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/play.svg"

        } else {
            currentSong.pause()
            play.src = "img/pause.svg"
        }
    })

    // Time update event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime1").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}`;
        document.querySelector(".songtime2").innerHTML = `${secondsToMinutesSeconds(currentSong.duration)}`


        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })

    // Event listener to Seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width * 100 - 1);
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration * percent) / 100)
    })

    // Event Listener for Hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0
    })

    // For closing Hamburger
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-130%"
    })

    // EventListener for Previous button
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split('/').slice(-1)[0])
        if (index - 1 >= 0) {
            playMusic(songs[index - 1])
        }
    })

    // EventListener for Next button
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split('/').slice(-1)[0])
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    // Volume Range
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        if (currentSong.volume > 0) {
            document.querySelector(".volume > img").src = document.querySelector(".volume > img").src.replace("img/mute.svg", "img/volume.svg");
        }
    })

    // Event Listener for Mute
    document.querySelector(".volume>img").addEventListener("click", (e) => {
        if (e.target.src.endsWith("volume.svg")) {
            e.target.src = "img/mute.svg";
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        } else {
            e.target.src = "img/volume.svg";
            currentSong.volume = 0.4;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 40;
        }
    })

    // Event Listener for Library Play Button
    document.querySelector(".songList li").addEventListener("click", (e) => {
        document.querySelector("#play").src = "img/play.svg"
    })

}

main()
