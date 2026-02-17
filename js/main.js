let config = {
  type: Phaser.AUTO,

  width: GAME_WIDTH,
  height: GAME_HEIGHT,

  parent: "wrapper",

  scale: {
    mode: Phaser.Scale.ENVELOP,
    autoCenter: Phaser.Scale.CENTER_BOTH,

    width: GAME_WIDTH,
    height: GAME_HEIGHT,

    // 👇 Prevents iOS resize chaos
    expandParent: false,
  },

  render: {
    pixelArt: true,
    antialias: false,
    roundPixels: true,
  },

  input: {
    activePointers: 3,
  },

  physics: {
    default: "arcade",
    arcade: {
      debug: true,
    },
  },

  scene: [gameScene],
};

let game = new Phaser.Game(config);



let resizeRAF = 0;
let resizeCount = 0;

function logResize() {
  resizeCount++;
  if (!resizeRAF) {
    resizeRAF = requestAnimationFrame(() => {
      console.log("resize events this frame:", resizeCount);
      resizeCount = 0;
      resizeRAF = 0;
    });
  }
}

window.addEventListener("resize", logResize);
window.visualViewport?.addEventListener("resize", logResize);