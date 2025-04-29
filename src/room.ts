import WebSocket from 'ws';

const WEBSOCKET_PROTOCOL_CODES = {
	'START_REQUEST': 0,
	'START_ACCEPTED': 1
};

class Client {
	private ws!: WebSocket;
	private name!: string;
	private room!: Room;
	private symbol!: number;

	constructor (ws: WebSocket, name: string | null, room: Room) {
		this.ws = ws;

		if (!name) name = Client.randomName();

		this.name = name;
		this.room = room;

		this.ws.addEventListener('message', (event: WebSocket.MessageEvent) => {
			const data = JSON.parse(event.data as string);

			if (!data || !data.code) return;

			if (data.code === WEBSOCKET_PROTOCOL_CODES['START_ACCEPTED']) {
				this.room.gameStartAccept(this);
			}
		});

		this.ws.addEventListener('close', () => {});
	}

	public setSymbol (symbol: number) {
		if (symbol == 1 || symbol == 2) {
			this.symbol = symbol;
		}
	}

	public getSymbol (): number {
		return this.symbol;
	}

	public getName (): string {
		return this.name;
	}

	public send (message: any) {
		return new Promise<any>((resolve, reject) => {
			try {
				if (this.ws.readyState === WebSocket.OPEN) {
					this.ws.send(JSON.stringify(message));
					resolve(true);
					return;
				}

				reject('Websocket is not opened');
			} catch (error) {
				reject(error);
			}
		});
	}

	public close (): void {
		this.ws.close();
	}

	private static randomName (): string {
		const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
		let name = '';
		let len = Math.floor(Math.random() * 4) + 4;

		for (let a = 0; a < len; a++)
			name += letters[Math.floor(Math.random() * letters.length)]

		return name;
	}
}

export default class Room {
	public static STATUS_WAITING = 0;
	public static STATUS_STARTED = 1;
	public static STATUS_CLOSED = 2;
	public static STATUS_STARTING = 3;

	private clientA!: Client;
	private clientB!: Client;
	private id!: string;
	private readyCount: number = 0;

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

	private tryInit (): Promise<any> {
		let retryCount = 0;

		const retry = async () => {
			const message = {
				code: WEBSOCKET_PROTOCOL_CODES['START_REQUEST'],
				player: this.clientA.getSymbol(),
				roomId: this.id,
				opponentName: this.clientB.getName()
			};

			await this.clientA.send(message);

			message.player = this.clientB.getSymbol();
			message.opponentName = this.clientA.getName();

			await this.clientB.send(message);

			this.status = Room.STATUS_WAITING;
		};

		return new Promise(async (resolve, reject) => {
			try {
				await retry();
			} catch (error) {
				console.error(error);
				retryCount++;

				if (retryCount == 10) {
					console.warn(`Maximum retry count reach for init game in room ${this.id}. Room is closing`);
					this.clientA.close();
					this.clientB.close();

					this.status = Room.STATUS_CLOSED;
				} else {
					setTimeout(() => {
						this.tryInit();
					}, 500);
				}
			}
		});
	}

	private async initRoom (): Promise<any> {
		if (Math.random() > 0.5) {
			this.clientA.setSymbol(1);
			this.clientB.setSymbol(2);
		} else {
			this.clientA.setSymbol(2);
			this.clientB.setSymbol(1);
		}

		await this.tryInit();
	}

	public gameStartAccept (client: Client): void {
		if (client == this.clientA || client == this.clientB) {
			this.readyCount++;

			if (this.readyCount == 2) {
				this.status = Room.STATUS_STARTED;
			}
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
