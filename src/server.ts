import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import WebSocket from 'ws';
import path from 'path';
import fs from 'fs';
import { URL } from 'url';
import Room from './room';

dotenv.config();

const port = process.env.PORT || 8080;
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

const server = app.listen(port, () => console.log(`Server is running on http://localhost:${port}`));
const wss = new WebSocket.Server({ server });

let rooms = new Array<Room>();
let lastRoom: Room | null = null;

wss.on('connection', (ws, req) => {
	const url = new URL(req.url!, `http://${req.headers.host}`);
	const playerName = url.searchParams.get('name');

	if (lastRoom) {
		lastRoom.setClientB(ws, playerName);
		lastRoom = null;
	} else {
		lastRoom = new Room(ws, playerName);

		rooms.push(lastRoom);
	}

	console.log('Player name:', playerName);
});

setInterval(() => {
	rooms = rooms.filter(room => room.status !== Room.STATUS_CLOSED);
	console.log(rooms.map(room => `[${room.id}-${room.status}]`).join(', '));
}, 1000);
