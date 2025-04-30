import WebSocket from 'ws';
import Client from './client';
import WEBSOCKET_PROTOCOL_CODES from './protocol';

export default class Room {
	public static STATUS_WAITING = 0;
	public static STATUS_STARTED = 1;
	public static STATUS_CLOSED = 2;
	public static STATUS_STARTING = 3;

	private clientA!: Client;
	private clientB!: Client;
	private readyCount: number = 0;
	private isClientAFirstPlayer: boolean  = false;

	public id!: string;
	public status: number = Room.STATUS_STARTING;

	constructor (wsA: WebSocket, clientAName: string | null) {
		this.clientA = new Client(wsA, clientAName, this);
		this.id = Room.getNewId();
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
		} else {
			this.clientA.send(mgForOpponent);
			this.clientB.send(mgForClient);
		}
	}

	private static getNewId (): string {
		const chars = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
		let id = '';

		for (let a = 0; a < 16; a++)
			id += chars[Math.floor(Math.random() * chars.length)]

		return id;
	}
}
