class Game {
  constructor (hostPlayer) {
    this.gameId = Math.floor(Math.random() * Date.now());
    this.hostPlayer = hostPlayer;
    this.secondPlayer = null;
    this.gridSide = null;
    this.trailLength = null;
    this.gameSpeed = null;
    this.gameStart = false;
  }

  setSecondPlayer = (userId) => {
    this.secondPlayer = userId;
  }

  startGame = () => {
    this.gameStart = true;
  }

  stopGame = () => {
    this.gameStart = false;
  }

  getGameId = () => {
    return this.gameId;
  }

  getGameInfo = () => {
    return (
      {
        id: this.gameId,
        hostPlayer: this.hostPlayer,
        secondPlayer: this.secondPlayer,
        gridSide: this.gridSide,
        trailLength: this.trailLength,
        gameSpeed: this.gameSpeed,
        gameStart: this.gameStart,
      }
    )
  }
}

module.exports = Game;