class Game {
  constructor (hostPlayer, gridSide = 100, trailLength = 5, gameSpeed = 500) {
    this.gameId = Math.floor(Math.random() * Date.now());
    this.secondPlayer = null;
    this.gridSide = gridSide;
    this.trailLength = trailLength;
    this.gameSpeed = gameSpeed;
    this.gameStart = false;
    this.players = {
      firstPlayer: {
        player: hostPlayer,
        trail: Array(trailLength).fill(null),
        position: this.gridSide + 1,
        direction: "right",
      },
      secondPlayer: {
        player: null,
        trail: Array(trailLength).fill(null),
        position: this.gridSide ** 2 - gridSide - 2,
        direction: "left",
      }
    }
    this.wallArray = this.generateWall(this.gridSide);
    this.gridArray = this.generateGrid(this.gridSide, this.wallArray);
  }

  setSecondPlayer = (userId) => {
    this.players.secondPlayer.player = userId;
  }

  startGame = () => {
    this.gameStart = true;
  }

  stopGame = () => {
    this.gameStart = false;
  }

  getGrid = () => {
    return this.gridArray;
  }

  getGameId = () => {
    return this.gameId;
  }

  getGameInfo = () => {
    return (
      {
        id: this.gameId,
        players: this.players,
        gridSide: this.gridSide,
        trailLength: this.trailLength,
        gameSpeed: this.gameSpeed,
        gameStart: this.gameStart,
      }
    )
  }

  changeDirection = (player, direction) => {
    if (player === this.players.firstPlayer.player) {
      this.players.firstPlayer.direction = direction;
    } else {
      this.players.secondPlayer.direction = direction;
    }
  }

  nextMove = () => {
    this.moveCycle(1, this.players.firstPlayer.direction, this.players.firstPlayer.position);
    this.moveCycle(2, this.players.secondPlayer.direction, this.players.secondPlayer.position);
    this.gridArray = this.generateGrid(this.gridSide, this.wallArray);
  }

  moveCycle = (playerNum, direction, position) => {
    let tempPos = position;
    switch (direction) {
      case "right":
        tempPos += 1;
        if (playerNum === 1) {
          this.players.firstPlayer.position = tempPos;
          this.players.firstPlayer.trail.push(position);
          this.players.firstPlayer.trail.shift();
        } else if (playerNum === 2) {
          this.players.secondPlayer.position = tempPos;
          this.players.secondPlayer.trail.push(position);
          this.players.secondPlayer.trail.shift();
        }
        break;
      case "left":
        tempPos -= 1;
        if (playerNum === 1) {
          this.players.firstPlayer.position = tempPos;
          this.players.firstPlayer.trail.push(position);
          this.players.firstPlayer.trail.shift();
        } else if (playerNum === 2) {
          this.players.secondPlayer.position = tempPos;
          this.players.secondPlayer.trail.push(position);
          this.players.secondPlayer.trail.shift();
        }
        break;
      case "top":
        tempPos -= this.gridSide;
        if (playerNum === 1) {
          this.players.firstPlayer.position = tempPos;
          this.players.firstPlayer.trail.push(position);
          this.players.firstPlayer.trail.shift();
        } else if (playerNum === 2) {
          this.players.secondPlayer.position = tempPos;
          this.players.secondPlayer.trail.push(position);
          this.players.secondPlayer.trail.shift();
        }
        break;
      case "bottom":
        tempPos += this.gridSide;
        if (playerNum === 1) {
          this.players.firstPlayer.position = tempPos;
          this.players.firstPlayer.trail.push(position);
          this.players.firstPlayer.trail.shift();
        } else if (playerNum === 2) {
          this.players.secondPlayer.position = tempPos;
          this.players.secondPlayer.trail.push(position);
          this.players.secondPlayer.trail.shift();
        }
        break;
      default:
    }
  };

  generateWall = (gridSide) => {
    let wallArray = [];
    for (let i = 0; i <= gridSide ** 2; i++) {
      if (
        i < gridSide ||
        (i + 1) % gridSide === 0 ||
        i % gridSide === 0 ||
        i > gridSide ** 2 - gridSide
      ) {
        wallArray.push(i);
      }
    }
    return wallArray;
  }

  generateGrid = (gridSide, wallArray) => {
    const gridArray = []; 
    const firstPlayer = this.players.firstPlayer;
    const secondPlayer = this.players.secondPlayer;
    for (let i = 0; i < gridSide ** 2; i++) {
      if (i === firstPlayer.position) {
        gridArray.push(1);
      } else if (i === secondPlayer.position) {
        gridArray.push(2);
      } else if (firstPlayer.trail.includes(i)) {
        gridArray.push(9);
      } else if (secondPlayer.trail.includes(i)) {
        gridArray.push(8);
      }else{
        wallArray.includes(i) ? gridArray.push('*') : gridArray.push(0);
      }
    }
    return gridArray;
  }

  generateRandomStartPosition = () => {
    let randNum = Math.ceil(Math.random() * this.gridSide) * this.gridSide;
    if (randNum < this.gridSide || randNum > this.gridSide ** 2 - this.gridSide) {
      return this.gridSide * 2;
    }
    return randNum;
  };
}

module.exports = Game;