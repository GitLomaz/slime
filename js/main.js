let config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: "wrapper",
  scene: [gameScene],
  physics: {
    default: "arcade",
    arcade: {
      // debug: true,
    },
  },
};

let game = new Phaser.Game(config);
