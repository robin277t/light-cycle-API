const WebSocket = require('ws');
const wsServer = new WebSocket.Server({port:9000});
const Game = require('./src/game');

const clients = {};
const games = {};

const onConnect = (wsClient) => {

  const ID = Math.floor(Math.random() * Date.now());
  clients[ID] = wsClient;

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
          const newGame = new Game(ID);
          games[newGame.getGameId()] = newGame;
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
          
          connectGame.setSecondPlayer(ID);
          startGame(connectGame.getGameId());
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
      clients[gameInfo.hostPlayer].send(`${timer}...`);
      clients[gameInfo.secondPlayer].send(`${timer}...`);
      timer > 1 ? timer-- : clearInterval(startTimer);
    }, 1000);
  
  currentGame.startGame();
}

wsServer.on('connection', onConnect);
console.log(`Example app listening at ws://localhost:${9000}`)