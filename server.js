// const express = require("express");
// const http = require("http");
// const socketIo = require("socket.io");
// const fs = require("fs");
// const path = require("path");

// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server);

// app.use(express.static("public"));

// // Detect video file
// const videoDir = path.join(__dirname, "public/videos");
// let videoFile = null;

// fs.readdirSync(videoDir).forEach(file => {
//     if (file.endsWith(".mp4")) {
//         videoFile = file;
//     }
// });

// app.get("/video", (req, res) => {
//     if (videoFile) {
//         res.sendFile(path.join(videoDir, videoFile));
//     } else {
//         res.status(404).send("No video found");
//     }
// });

// // Track video state
// let videoState = {
//     currentTime: 0,
//     isPlaying: false,
//     lastUpdate: Date.now(),
// };

// io.on("connection", (socket) => {
//     console.log("User connected");

//     // Sync new user with the latest state
//     socket.emit("sync-video", videoState);

//     socket.on("play", () => {
//         videoState.isPlaying = true;
//         videoState.lastUpdate = Date.now();
//         io.emit("play", videoState);
//     });

//     socket.on("pause", () => {
//         videoState.isPlaying = false;
//         videoState.currentTime += (Date.now() - videoState.lastUpdate) / 1000;
//         io.emit("pause", videoState);
//     });

//     socket.on("seek", (time) => {
//         videoState.currentTime = time;
//         videoState.lastUpdate = Date.now();
//         io.emit("seek", videoState);
//     });

//     socket.on("disconnect", () => {
//         console.log("User disconnected");
//     });
// });

// server.listen(3000, () => {
//     console.log("Server running on port 3000");
//     if (videoFile) {
//         console.log(`Serving video: ${videoFile}`);
//     } else {
//         console.log("No MP4 file found in /public/videos/");
//     }
// });


const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const fs = require("fs");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static("public"));

// Detect video file
const videoDir = path.join(__dirname, "public/videos");
let videoFile = null;

fs.readdirSync(videoDir).forEach(file => {
    if (file.endsWith(".mp4")) {
        videoFile = file;
    }
});

app.get("/video", (req, res) => {
    if (videoFile) {
        res.sendFile(path.join(videoDir, videoFile));
    } else {
        res.status(404).send("No video found");
    }
});

// Track video state
let videoState = {
    currentTime: 0,
    isPlaying: false,
    lastUpdate: Date.now(),
};

io.on("connection", (socket) => {
    console.log("User connected");

    // Sync new user with the latest state
    socket.emit("sync-video", videoState);

    socket.on("play", () => {
        videoState.isPlaying = true;
        videoState.lastUpdate = Date.now();
        io.emit("play", videoState);
    });

    socket.on("pause", () => {
        videoState.isPlaying = false;
        videoState.currentTime += (Date.now() - videoState.lastUpdate) / 1000;
        io.emit("pause", videoState);
    });

    socket.on("seek", (time) => {
        videoState.currentTime = time;
        videoState.lastUpdate = Date.now();
        io.emit("seek", videoState);
    });

    // Handle chat messages
    socket.on("chat-message", (message) => {
        io.emit("chat-message", message);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

server.listen(3000, () => {
    console.log("Server running on port 3000");
    if (videoFile) {
        console.log(`Serving video: ${videoFile}`);
    } else {
        console.log("No MP4 file found in /public/videos/");
    }
});
