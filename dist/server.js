"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const ws_1 = __importDefault(require("ws"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const url_1 = require("url");
dotenv_1.default.config();
const port = process.env.PORT || 8080;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use(express_1.default.static('public'));
app.post('/game-data', (req, res) => {
    const receivedData = req.body;
    console.log('Received data:', receivedData);
    const matchId = Math.floor(Math.random() * 1000000);
    const filePath = path_1.default.join(__dirname, '..', 'matches', `match-${matchId}.json`);
    const matchesDir = path_1.default.join(__dirname, '..', 'matches');
    if (!fs_1.default.existsSync(matchesDir))
        fs_1.default.mkdirSync(matchesDir);
    fs_1.default.writeFileSync(filePath, JSON.stringify(receivedData, null, 2));
    res.status(201).send(JSON.stringify({ message: 'Data received successfully' }));
});
const server = app.listen(port, () => console.log(`Server is running on http://localhost:${port}`));
const wss = new ws_1.default.Server({ server });
const rooms = new Array();
wss.on('connection', (ws, req) => {
    const url = new url_1.URL(req.url, `http://${req.headers.host}`);
    const playerName = url.searchParams.get('name');
    console.log('Player name:', playerName);
    ws.on('message', (message) => {
        console.log('Received:', JSON.parse(message));
        sendMessage(ws, JSON.parse(message));
    });
});
function sendMessage(ws, message) {
    if (ws && ws.readyState === ws_1.default.OPEN)
        ws.send(JSON.stringify(message));
}
