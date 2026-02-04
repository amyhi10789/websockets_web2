const WebSocket = require("ws");
const http = require("http");
const express = require("express");

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.static("public"));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

function sendUserCount() {
    const count = wss.clients.size;

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: "userCount",
                count: count
            }));
        }
    });
}


wss.on("connection", (socket) => {
    console.log("Client Connected");

    sendUserCount();

    socket.on("message", (data) => {
        wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(data.toString());
            }
        });
    });

    socket.on("close", () => {
        sendUserCount();
    });

});

server.listen(PORT, () => {
    const url = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`
    console.log(`Server running at ${url}`);
});