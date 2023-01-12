const WebSocket = require('ws');
const wsServer = new WebSocket.Server({port: process.env.PORT});
const Game = require('./src/game');

const clients = {};
const games = {};

const onConnect = (wsClient) => {

  const ID = Math.floor(Math.random() * Date.now());
  clients[ID] = wsClient;
  let takePartGame = null;
  console.log(`New user ${ID}`);
  wsClient.send(JSON.stringify({action: 'HELLO', data: `Hello user ${ID}!`}));

  wsClient.on('close', () => {
    console.log(`user ${ID} disconnect`);
    delete clients[ID];
    if (takePartGame != null) {delete games[takePartGame];}
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
            wsClient.send(JSON.stringify({action: 'MESSAGE', data:'PONG'}));
          }, 1000);
          break;

        case 'USERS':
          for (let id in clients) {
            wsClient.send(JSON.stringify({action: 'MESSAGE', data: id}));
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
          wsClient.send(JSON.stringify({action: 'MESSAGE', data: newGame.getGameId()}));
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
            wsClient.send(JSON.stringify({action: 'MESSAGE', data: 'game unavailable'}));
          }
          break;

        case 'GAME_GRID':
          if (takePartGame != null) {
            wsClient.send(JSON.stringify({
              action: 'GRID',
              data: takePartGame.getGrid(),
            }))
          } else {
            wsClient.send(JSON.stringify({action: 'MESSAGE', data: 'You are not in the game'}));
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
        case 'GAME_QUICK':
          const quickGameId = findGame();
          takePartGame = games[quickGameId];
          games[quickGameId].setSecondPlayer(ID);
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

const findGame = () => {
  games.map((gameId) => {
    if (games[gameId].getGameInfo().players.secondPlayer === null){
      return (gameId);
    }
  })
}

const startGame = (gameId) => {
  const currentGame = games[gameId];
  console.log(games[gameId]);
  const gameInfo = currentGame.getGameInfo();
  let timer = 5;
  const startTimer = setInterval(() => {
      clients[gameInfo.players.firstPlayer.player].send(JSON.stringify({action: 'TIMER', data: timer}));
      clients[gameInfo.players.secondPlayer.player].send(JSON.stringify({action: 'TIMER', data: timer}));
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
        sendGameResult(currentGame);
      }
    }, gameInfo.gameSpeed)
  }, 5000);
}

const sendGameResult = (currentGame) => {
  const gameInfo = currentGame.getGameInfo();
  const firstPlayerId = gameInfo.players.firstPlayer.player;
  const secondPlayerId = gameInfo.players.secondPlayer.player;
  const gameWinner = currentGame.getWinner();
  if (gameWinner === false) {
    clients[firstPlayerId].send(JSON.stringify({action: 'WINNER', data: 'draw won'}));
    clients[secondPlayerId].send(JSON.stringify({action: 'WINNER', data: 'draw won'}));
  } else if (gameWinner === firstPlayerId) {
    clients[firstPlayerId].send(JSON.stringify({action: 'WINNER', data: 'You win!'}));
    clients[secondPlayerId].send(JSON.stringify({action: 'WINNER', data: 'You lose!'}));
  } else if (gameWinner === secondPlayerId) {
    clients[firstPlayerId].send(JSON.stringify({action: 'WINNER', data: 'You lose!'}));
    clients[secondPlayerId].send(JSON.stringify({action: 'WINNER', data: 'You win!'}));
  }
}



wsServer.on('connection', onConnect);
console.log(`Example app listening at ws://localhost:${process.env.PORT}`)