const myWs = new WebSocket('ws://localhost:9000');
myWs.onopen = () => {
    console.log('connected');
};
myWs.onmessage = (message) => {
    console.log('Message: %s', message.data);
};

const wsEcho = (value) => {
    myWs.send(JSON.stringify({action: 'ECHO', data: value.toString()}));
}

const wsPing = () => {
    myWs.send(JSON.stringify({action: 'PING'}));
}

const wsUsers = () => {
    myWs.send(JSON.stringify({action: 'USERS'}));
}

const wsNewGame = () => {
    myWs.send(JSON.stringify({action: 'NEW_GAME'}));
}

const wsConnectGame = (gameId) => {
    myWs.send(JSON.stringify({action: 'GAME_CONNECT', data: gameId.toString()}))
}

const wsGameList = () => {
    myWs.send(JSON.stringify({action: 'GAME_LIST'}))
}
