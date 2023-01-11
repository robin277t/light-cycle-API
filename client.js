const myWs = new WebSocket('ws://localhost:9000');
myWs.onopen = () => {
    console.log('connected');
};
myWs.onmessage = (message) => {
    String(message.data)
        ? console.log(message.data) 
        : console.log(JSON.parse(message.data))
    let parseMessage = JSON.parse(message.data)
    if (parseMessage.action === 'GRID') {
        let board = []
        const grid = 10;
        for (let i = grid; i <= grid**2 ; i += grid ) {
            board.push(parseMessage.data.slice(i - grid, i).join(' '));
        }
        console.log(board.join('\n'));
    }
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

const wsNewGame = (gridSide = 10, trailLength = 3, gameSpeed = 1000) => {
    const gameSetup = {
        gridSide,
        trailLength,
        gameSpeed,
    }
    myWs.send(JSON.stringify({action: 'NEW_GAME', data: gameSetup}));
}

const wsConnectGame = (gameId) => {
    myWs.send(JSON.stringify({action: 'GAME_CONNECT', data: gameId}))
}

const wsGameList = () => {
    myWs.send(JSON.stringify({action: 'GAME_LIST'}))
}

const wsGameGrid = () => {
    myWs.send(JSON.stringify({action: 'GAME_GRID'}))
}

const wsLeaveGame = () => {
    myWs.send(JSON.stringify({action: 'GAME_LEAVE'}))
}

const wsNextMove = () => {
    myWs.send(JSON.stringify({action: "GAME_MOVE"}))
}

const wsChangeDirection = (direction) => {
    myWs.send(JSON.stringify({action: 'GAME_DIRECTION', data: direction}))
}
