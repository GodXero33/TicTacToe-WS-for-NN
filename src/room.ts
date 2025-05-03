import WebSocket from 'ws';
import Client from './client';
import WEBSOCKET_PROTOCOL_CODES from './protocol';
import fs from 'fs';
import path from 'path';

class MoveHistory {
	public player: number;
	public x: number;
	public y: number;
	public grid: Array<Array<number>>;

	constructor (player: number, x: number, y: number, grid: Array<Array<number>>) {
		this.player = player;
		this.x = x;
		this.y = y;
		this.grid = grid;
	}
}

export default class Room {
	public static STATUS_WAITING = 0;
	public static STATUS_STARTED = 1;
	public static STATUS_CLOSED = 2;
	public static STATUS_STARTING = 3;

	public static GAME_OVER_STATUS_PLAYER_1 = 1;
	public static GAME_OVER_STATUS_PLAYER_2 = 2;
	public static GAME_OVER_STATUS_DRAW = 0;

	private clientA!: Client;
	private clientB!: Client;
	private readyCount: number = 0;
	private isClientAFirstPlayer: boolean  = false;
	private grid: Array<Array<number>>;
	private history: Array<MoveHistory> = new Array();

	public id!: string;
	public status: number = Room.STATUS_STARTING;

	constructor (wsA: WebSocket, clientAName: string | null) {
		this.clientA = new Client(wsA, clientAName, this);
		this.id = Room.getNewId();

		this.grid = Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => 0));
	}

	public isFull (): boolean {
		return this.clientA instanceof WebSocket && this.clientB instanceof WebSocket;
	}

	public setClientB (wsB: WebSocket, clientBName: string | null): void {
		this.clientB = new Client(wsB, clientBName, this);

		this.initRoom();
	}

	private initRoom (): void {
		if (Math.random() > 0.5) {
			this.clientA.setSymbol(1);
			this.clientB.setSymbol(2);

			this.isClientAFirstPlayer = true;
		} else {
			this.clientA.setSymbol(2);
			this.clientB.setSymbol(1);

			this.isClientAFirstPlayer = false;
		}

		this.clientA.send({
			code: WEBSOCKET_PROTOCOL_CODES.START_REQUEST,
			player: this.clientA.getSymbol(),
			roomId: this.id,
			opponentName: this.clientB.getName()
		});

		this.clientB.send({
			code: WEBSOCKET_PROTOCOL_CODES.START_REQUEST,
			player: this.clientB.getSymbol(),
			roomId: this.id,
			opponentName: this.clientA.getName()
		});

		this.status = Room.STATUS_WAITING;
	}

	public gameStartAccept (client: Client): void {
		if (client == this.clientA || client == this.clientB) {
			this.readyCount++;

			if (this.readyCount == 2) {
				this.status = Room.STATUS_STARTED;

				if (this.isClientAFirstPlayer) {
					this.clientA.send({
						code: WEBSOCKET_PROTOCOL_CODES.PLAYER_CHANCE
					});
					this.clientB.send({
						code: WEBSOCKET_PROTOCOL_CODES.WAIT_FOR_OPPONENT
					});
				} else {
					this.clientA.send({
						code: WEBSOCKET_PROTOCOL_CODES.WAIT_FOR_OPPONENT
					});
					this.clientB.send({
						code: WEBSOCKET_PROTOCOL_CODES.PLAYER_CHANCE
					});
				}
			}
		}
	}

	public close () {
		if (this.clientA) this.clientA.close();
		if (this.clientB) this.clientB.close();

		this.status = Room.STATUS_CLOSED;
	}

	public requestMove (client: Client, x: number, y: number): void {
		const mgForOpponent = {
			code: WEBSOCKET_PROTOCOL_CODES.MOVE_BACK,
			cell: [x, y]
		};
		const mgForClient = {
			code: WEBSOCKET_PROTOCOL_CODES.MOVE,
			cell: [x, y]
		};

		if (client == this.clientA) {
			this.clientA.send(mgForClient);
			this.clientB.send(mgForOpponent);
			this.checkMove(x, y, this.isClientAFirstPlayer ? 1 : 2);
		} else {
			this.clientA.send(mgForOpponent);
			this.clientB.send(mgForClient);
			this.checkMove(x, y, this.isClientAFirstPlayer ? 2 : 1);
		}
	}

	private getMatchData () {
		return {
			id: this.id,
			data: this.history
		};
	}

	private saveMatchRoom () {
		const now = new Date();
		const pad = (n: any) => n.toString().padStart(2, '0');
		const formattedTime = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}`;
		const filePath = path.join(__dirname, '..', 'matches', `match-${formattedTime}.json`);
		const matchesDir = path.join(__dirname, '..', 'matches');
	
		if (!fs.existsSync(matchesDir)) fs.mkdirSync(matchesDir);
	
		fs.writeFileSync(filePath, JSON.stringify(this.getMatchData(), null, 2));
	}

	private checkWin (): boolean {
		let total = 0;
		let hasZero = false;

		for (let a = 0; a < 3; a++) {
			for (let b = 0; b < 3; b++) {
				const cell = this.grid[a][b];
				total += cell;

				if (cell == 0) hasZero = true;
			}

			if (!hasZero && total % 3 == 0) return true;

			total = 0;
			hasZero = false;

			for (let b = 0; b < 3; b++) {
				const cell = this.grid[b][a];
				total += cell;

				if (cell == 0) hasZero = true;
			}

			if (!hasZero && total % 3 == 0) return true;
		}

		total = 0;
		hasZero = false;

		for (let a = 0; a < 3; a++) {
			const cell = this.grid[a][a];
			total += cell;

			if (cell == 0) hasZero = true;
		}

		if (!hasZero && total % 3 == 0) return true;

		total = 0;
		hasZero = false;

		for (let a = 0; a < 3; a++) {
			const cell = this.grid[a][2 - a];
			total += cell;

			if (cell == 0) hasZero = true;
		}

		if (!hasZero && total % 3 == 0) return true;

		return false;
	}

	private checkMove (x: number, y: number, player: number): void {
		this.grid[y][x] = player;

		this.history.push(new MoveHistory(player, x, y, this.grid.map(row => row.map(cell => cell))));

		if (this.checkWin()) {
			this.gameOver(player == 1 ? Room.GAME_OVER_STATUS_PLAYER_1 : Room.GAME_OVER_STATUS_PLAYER_2);
			return;
		}

		if (!this.grid.some(row => row.includes(0))) {
			this.gameOver(Room.GAME_OVER_STATUS_DRAW);
			return;
		}

		console.log(this.grid);
	}

	private gameOver (status: number): void {
		const message = {
			code: WEBSOCKET_PROTOCOL_CODES.GAME_OVER,
			winner: status == Room.GAME_OVER_STATUS_DRAW ? 0 : status == Room.GAME_OVER_STATUS_PLAYER_1 ? 1 : 2
		};

		this.clientA.send(message);
		this.clientB.send(message);

		this.saveMatchRoom();
		this.close();
	}

	private static getNewId (): string {
		const chars = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
		let id = '';

		for (let a = 0; a < 16; a++)
			id += chars[Math.floor(Math.random() * chars.length)]

		return id;
	}
}
