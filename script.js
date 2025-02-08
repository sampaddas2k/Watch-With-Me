// const socket = io();
// const video = document.getElementById("video");
// let isSeeking = false;
// let lastSyncedTime = 0;
// let lastState = { isPlaying: false, currentTime: 0 };

// // Function to sync playback smoothly
// function adjustPlayback(targetTime) {
//     const timeDiff = targetTime - video.currentTime;

//     if (Math.abs(timeDiff) > 2) {
//         video.currentTime = targetTime; // Hard seek if difference > 2 sec
//     } else if (Math.abs(timeDiff) > 0.5) {
//         video.playbackRate = 1 + (timeDiff * 0.05); // Small speed correction
//     } else {
//         video.playbackRate = 1; // Reset speed when in sync
//     }
// }

// // Sync new user
// socket.on("sync-video", (state) => {
//     lastState = state;
//     if (Math.abs(video.currentTime - state.currentTime) > 1) {
//         video.currentTime = state.currentTime;
//     }
//     if (state.isPlaying && video.paused) {
//         video.play();
//     } else if (!state.isPlaying && !video.paused) {
//         video.pause();
//     }
// });

// // Handle play event (Prevent spam)
// video.addEventListener("play", () => {
//     if (!lastState.isPlaying) {
//         socket.emit("play");
//         lastState.isPlaying = true;
//     }
// });

// // Handle pause event (Prevent spam)
// video.addEventListener("pause", () => {
//     if (lastState.isPlaying) {
//         socket.emit("pause");
//         lastState.isPlaying = false;
//     }
// });

// // Handle seeking (No redundant syncs)
// video.addEventListener("seeking", () => {
//     isSeeking = true;
// });
// video.addEventListener("seeked", () => {
//     if (isSeeking) {
//         socket.emit("seek", video.currentTime);
//         isSeeking = false;
//     }
// });

// // Handle received play event
// socket.on("play", (state) => {
//     if (video.paused) {
//         video.currentTime = state.currentTime + (Date.now() - state.lastUpdate) / 1000;
//         video.play();
//     }
//     lastState = state;
// });

// // Handle received pause event
// socket.on("pause", (state) => {
//     if (!video.paused) {
//         video.currentTime = state.currentTime;
//         video.pause();
//     }
//     lastState = state;
// });

// // Handle received seek event
// socket.on("seek", (state) => {
//     if (Math.abs(video.currentTime - state.currentTime) > 0.5) {
//         video.currentTime = state.currentTime;
//     }
//     lastState = state;
// });



const socket = io();
const video = document.getElementById("video");
const chatInput = document.getElementById("chat-input");
const messages = document.getElementById("messages");
let isSeeking = false;

// Send chat message when "Enter" is pressed
chatInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && chatInput.value.trim() !== "") {
        socket.emit("chat-message", chatInput.value.trim());
        chatInput.value = "";
        event.preventDefault();
    }
});

// Receive and display chat messages
socket.on("chat-message", (message) => {
    const messageElement = document.createElement("div");
    messageElement.textContent = message;
    messages.appendChild(messageElement);
    messages.scrollTop = messages.scrollHeight;
});

// Gradual speed correction for desync
function adjustPlaybackSpeed(targetTime) {
    const currentTime = video.currentTime;
    const timeDiff = targetTime - currentTime;

    if (Math.abs(timeDiff) > 1.5) {
        video.currentTime = targetTime;
    } else if (Math.abs(timeDiff) > 0.1) {
        video.playbackRate = 1 + (timeDiff * 0.1);
    } else {
        video.playbackRate = 1;
    }
}

// Sync video state when a new user joins
socket.on("sync-video", (state) => {
    adjustPlaybackSpeed(state.currentTime);
    if (state.isPlaying) {
        video.play();
    } else {
        video.pause();
    }
});

// Play event
video.addEventListener("play", () => {
    socket.emit("play");
});

// Pause event
video.addEventListener("pause", () => {
    socket.emit("pause");
});

// Seek event - Prevent duplicate seeking issues
video.addEventListener("seeking", () => {
    isSeeking = true;
});
video.addEventListener("seeked", () => {
    if (isSeeking) {
        socket.emit("seek", video.currentTime);
        isSeeking = false;
    }
});

// Receive play event from server
socket.on("play", (state) => {
    adjustPlaybackSpeed(state.currentTime + (Date.now() - state.lastUpdate) / 1000);
    if (video.paused) video.play();
});

// Receive pause event from server
socket.on("pause", (state) => {
    adjustPlaybackSpeed(state.currentTime);
    if (!video.paused) video.pause();
});

// Receive seek event from server
socket.on("seek", (state) => {
    if (Math.abs(video.currentTime - state.currentTime) > 0.5) {
        video.currentTime = state.currentTime;
    }
});
