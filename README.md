# TicTacToe-WS-for-NN

**TicTacToe-WS-for-NN** is a simple multiplayer Tic Tac Toe game built for one purpose: **collecting gameplay data to train a custom neural network**.  
It’s not about creating the best game — it's about learning how to gather real user interaction data like a software engineer.

## About

- Players connect through a WebSocket server hosted via **ngrok** and play Tic Tac Toe in real-time.
- Every move in the match is recorded into a **JSON object** (no player info, just move data).
- After each match ends, the full game record is automatically **POSTed to a local Express server** (running on my laptop).
- The collected datasets are used to **train a neural network** that is being built from scratch.
- This project is purely for **personal learning** — focused on machine learning and real-world data collection experience.

## Tech Stack

- Node.js
- Express (for hosting static files and receiving data)
- ws (WebSocket library for real-time gameplay)

## How to Run

1. Clone the repo:
   ```bash
   git clone https://github.com/your-username/TicTacToe-WS-for-NN.git
   cd TicTacToe-WS-for-NN
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Create an ngrok tunnel for your server:
   ```bash
   ngrok http 3000
   ```
   (or whatever port you are using)

5. Share the ngrok URL with players.  
   They just need a browser to join and play.

6. Matches will be recorded automatically and sent to the server as JSON.

## Dataset Format

Each match is saved as a JSON object recording the full gameplay.  
The JSON contains the sequence of moves and the final result.  
No player details are collected.

## Important

- This server is temporary and runs only during tournament sessions for a few minutes.
- The main focus is data generation, not game development.

## Goal

The real mission behind this repo is to:
- Gather real match data from actual players
- Learn how to collect and organize datasets
- Use the data to train a self-made neural network
- Get practical experience in handling real-world user data

## License

This project is licensed under the MIT License.  
It’s a **personal learning project** and not intended for public use or contributions, but feel free to use it as you like under the MIT terms.

---

**Play to train the brain.**
