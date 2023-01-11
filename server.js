const WebSocket = require('ws');
const wsServer = new WebSocket.Server({port:9000});
const Game = require('./src/game');

const clients = {};
const games = {};

const onConnect = (wsClient) => {

  const ID = Math.floor(Math.random() * Date.now());
  clients[ID] = wsClient;
  let takePartGame = null;

  console.log(`New user ${ID}`);
  wsClient.send(`Hello user ${ID}!`);

  wsClient.on('close', () => {
    console.log(`user ${ID} disconnect`);
    delete clients[ID];
  });

  wsClient.on('message', (message) => {
    //work with message
    console.log(JSON.parse(message));
    try {
      const jsonMessage = JSON.parse(message);
      switch (jsonMessage.action){
        case 'ECHO':
          wsClient.send(`${jsonMessage.data}`);
          break;

        case 'PING':
          setTimeout(() => {
            wsClient.send('PONG');
          }, 1000);
          break;

        case 'USERS':
          for (let id in clients) {
            wsClient.send(JSON.stringify({user_id: id}));
          }
          break;

        case 'NEW_GAME':
          let newGame = null;
          if (jsonMessage) {
            newGame = new Game(
              ID, 
              jsonMessage.data.gridSide,
              jsonMessage.data.trailLength,
              jsonMessage.data.gameSpeed
            )
          } else {
            newGame = new Game(ID);
          }
          games[newGame.getGameId()] = newGame;
          takePartGame = newGame;
          console.log(newGame);
          wsClient.send(JSON.stringify(newGame.getGameId()));
          break;

        case 'GAME_LIST':
          for (let id in games) {
            wsClient.send(JSON.stringify(games[id].getGameId()));
          }
          break;

        case 'GAME_CONNECT':
          console.log(jsonMessage);
          const connectGame = games[jsonMessage.data];
          if (connectGame.getGameInfo.secondPlayer == null) {
            connectGame.setSecondPlayer(ID);
            takePartGame = connectGame;
            startGame(connectGame.getGameId());
          } else {
            wsClient.send(JSON.stringify({text: 'game unavailable'}));
          }
          break;

        case 'GAME_GRID':
          if (takePartGame != null) {
            wsClient.send(JSON.stringify({
              action: 'GRID',
              data: takePartGame.getGrid(),
            }))
          } else {
            wsClient.send(JSON.stringify({text: 'You are not in the game'}));
          }
          break;
        
        case 'GAME_MOVE':
          takePartGame.nextMove();
          break;

        case 'GAME_DIRECTION':
          takePartGame.changeDirection(ID, jsonMessage.data);
          break;

        case 'GAME_LEAVE':
          if (takePartGame != null && takePartGame.getGameInfo.hostPlayer === ID) {
            const gameId = takePartGame.getGameInfo.id;
            delete games.gameId;
            takePartGame = null;
          } else {
            wsClient.send(JSON.stringify({text: 'You are not in the game'}));
          }
          break;

        default:
          console.log('unknown request');
          break;
      }
    } catch (error) {
      console.log('ERROR:', error)
    }
  });
}

const startGame = (gameId) => {
  const currentGame = games[gameId];
  console.log(games[gameId]);
  const gameInfo = currentGame.getGameInfo();
  let timer = 5;
  const startTimer = setInterval(() => {
      clients[gameInfo.players.firstPlayer.player].send(`${timer}...`);
      clients[gameInfo.players.secondPlayer.player].send(`${timer}...`);
      timer > 1 ? timer-- : clearInterval(startTimer);
    }, 1000);
  
  currentGame.startGame();
  setTimeout(() => {
    const gameLoop = setInterval(() => {
      let gameStatus = games[gameId].getGameInfo();
      if (gameStatus.gameStart) {
        games[gameId].nextMove();
        clients[games[gameId].players.firstPlayer.player].send(JSON.stringify({
          action: 'GRID',
          data: games[gameId].getGrid(),
        }));
        clients[games[gameId].players.secondPlayer.player].send(JSON.stringify({
          action: 'GRID',
          data: games[gameId].getGrid(),
        }));
      } else {
        clearInterval(gameLoop);
      }
    }, gameInfo.gameSpeed)
  }, 5000);
}

wsServer.on('connection', onConnect);
console.log(`Example app listening at ws://localhost:${9000}`)