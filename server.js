const express = require('express')
const socket = require('socket.io')

const app = express();

app.use(express.static('.'));

const server = app.listen(2000, () => {
    console.log("Listening at 2000")
});

const io = socket(server);

io.on('connection', (socket) => {
    io.sockets.emit("counter", socket.adapter.sids.size)
    console.log("The number of connected sockets: " + socket.adapter.sids.size);

    // emit the sound events to all sockets once the scene is clicked
    socket.on("click", () => {
        console.log("Click")
        io.sockets.emit("sound")
    })

    socket.on('disconnect', function () {
        io.sockets.emit("counter", socket.adapter.sids.size)
        console.log("The number of connected sockets: " + socket.adapter.sids.size);
    });
});

