let gameScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function gameScene() {
    Phaser.Scene.call(this, {
      key: "gameScene",
    });
  },

  preload: function () {
    this.load.image("grassBig", "images/grassBig.png");
    this.load.tilemapTiledJSON("map", "js/data/template.json");

    
    this.load.spritesheet("coinDrop", "images/coinDrop.png", {
      frameWidth: 12,
      frameHeight: 12,
    });

    this.load.spritesheet("waterSprite", "images/water.png", {
      frameWidth: 16,
      frameHeight: 16,
    });

    this.load.spritesheet("slash", "images/slash.png", {
      frameWidth: 32,
      frameHeight: 32,
    });

    this.load.spritesheet("blob", "images/blob.png", {
      frameWidth: 48,
      frameHeight: 48,
    });

    this.load.spritesheet("player", "images/player.png", {
      frameWidth: 48,
      frameHeight: 48,
    });

  },

  create: function () {
    this.fpsText = this.add.text(10, 10, "FPS:", {
      font: "16px Arial",
      fill: "#00ff00",
    }).setScrollFactor(0).setDepth(9999);
    scene = this;
    this.counter = 0;

    this.map = this.make.tilemap({ key: "map" });
    this.map = transformMap(scene.map);

    this.water = this.add
      .tileSprite(
        0,
        0,
        this.map.widthInPixels,
        this.map.heightInPixels,
        "waterSprite"
      )
      .setScale(2);

    this.tiles = this.map.addTilesetImage("grassBig", "grassBig");
    this.layer = this.map.createLayer("layer", this.tiles, 0, 0);

    this.layer.setCollision([0]);

    this.doodads = this.map.createLayer("doodads", this.tiles, 0, 0);

    this.sprites = this.physics.add.group();
    this.enemyProjectiles = this.physics.add.group();
    this.drops = this.physics.add.group({
      dragX: 500,
      dragY: 500,
    });

    this.physics.add.collider(this.sprites, this.layer);
    this.physics.add.collider(this.drops, this.layer);

    this.physics.add.collider(this.sprites);

    this.player = new Player();

    for (let i = 0; i < 20; i++) {
      new Blob();
    }

    this.anims.create({
      key: "slash",
      frames: this.anims.generateFrameNumbers("slash"),
      frameRate: 30,
      repeat: 0,
    });

    this.anims.create({
      key: "coinDrop",
      frames: this.anims.generateFrameNumbers("coinDrop"),
      frameRate: 10,
      repeat: -1,
    });
  },

  update: function (time, delta) {
    const fps = Math.floor(this.game.loop.actualFps);
    this.fpsText.setText("1.1 - FPS: " + fps);
    if (this.counter % 20 === 0) {
      this.water.setFrame((this.counter % 80) / 20);
    }

    scene.sprites.children.entries.forEach(e => {
      e.tick(delta);
    });

    scene.drops.children.entries.forEach(e => {
      e.tick(delta);
    });

    this.counter++;
  },
});
