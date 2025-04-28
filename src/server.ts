import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import WebSocket from 'ws';
import path from 'path';
import fs from 'fs';
import { URL } from 'url';

dotenv.config();

const port = process.env.PORT || 8080;
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

app.post('/game-data', (req, res) => {
	const receivedData = req.body;
	console.log('Received data:', receivedData);

	const matchId = Math.floor(Math.random() * 1000000);
	const filePath = path.join(__dirname, '..', 'matches', `match-${matchId}.json`);
	const matchesDir = path.join(__dirname, '..', 'matches');

	if (!fs.existsSync(matchesDir)) fs.mkdirSync(matchesDir);

	fs.writeFileSync(filePath, JSON.stringify(receivedData, null, 2));

	res.status(201).send(JSON.stringify({ message: 'Data received successfully' }));
});

const server = app.listen(port, () => console.log(`Server is running on http://localhost:${port}`));
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
	const url = new URL(req.url!, `http://${req.headers.host}`);
	const playerName = url.searchParams.get('name');

	console.log('Player name:', playerName);

	ws.on('message', (message: any) => {
		console.log('Received:', JSON.parse(message));
		sendMessage(ws, { message: JSON.parse(message) });
	});
});

function sendMessage (ws: WebSocket, message: any) {
	if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(message));
}
