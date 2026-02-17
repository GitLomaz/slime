let gameScene = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function gameScene() {
    Phaser.Scene.call(this, {
      key: "gameScene",
    });
  },

  preload: function () {
    this.load.image("grassBig", "images/grassBig_big.png");
    this.load.image("pixel2", "images/pixel2_big.png");
    this.load.image("backpack", "images/backpack.png");
    this.load.tilemapTiledJSON("map", "js/data/template.json");

      
    this.load.spritesheet("basicFrame", "images/basicFrame.png", {
      frameWidth: 12,
      frameHeight: 12,
    });

    this.load.spritesheet("buttonFrame", "images/buttonFrame.png", {
      frameWidth: 12,
      frameHeight: 12,
    });
    
    this.load.spritesheet("coinDrop", "images/silverCoin_big.png", {
      frameWidth: 24,
      frameHeight: 24,
    });

    this.load.spritesheet("waterSprite", "images/water_big.png", {
      frameWidth: 24,
      frameHeight: 24,
    });

    this.load.spritesheet("slash", "images/slash_big.png", {
      frameWidth: 48,
      frameHeight: 48,
    });

    this.load.spritesheet("blob", "images/blob_big.png", {
      frameWidth: 72,
      frameHeight: 72,
    });

    this.load.spritesheet("player", "images/player_big.png", {
      frameWidth: 72,
      frameHeight: 72,
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
    this.enemies = this.add.group();

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

    this.ui = new FixedUIContainer()
    new BackpackButton()

    this.physics.add.collider(this.sprites, this.layer, (sprite, layer) => {
      if (sprite.type === "enemy" && sprite.knockback > 0) {
        sprite.body.setVelocityX(0);
        sprite.body.setVelocityY(0);
        sprite.knockback = 250;
      }
    });

    this.physics.add.collider(this.drops, this.layer, (sprite, layer) => {
      sprite.body.setVelocityX(0);
      sprite.body.setVelocityY(0);
      sprite.knockback = 250;
    });

    this.physics.add.collider(this.drops, this.layer);
    this.physics.add.collider(this.sprites);

    this.player = new Player();

    spawnLevel();

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

    this.events.on("enemyDied", () => {
      if (this.enemies.countActive(true) === 0) {
        spawnLevel();
      }
    });



    // PATHFINDING!!
    const layerData = scene.map.layers[0].data; // 2D array: [row][col] of Tile objects
    const height = layerData.length;
    const width = layerData[0].length;

    // PF matrix: 0 = walkable, 1 = blocked
    const matrix = Array.from({ length: height }, (_, y) =>
      Array.from({ length: width }, (_, x) => {
        const tile = layerData[y][x];

        // Your rule: NOT 0 is walkable
        // So blocked if index === 0
        return tile && tile.index !== 0 ? 0 : 1;
      })
    );

    scene.pfGrid = new PF.Grid(width, height, matrix);
    scene.pfFinder = new PF.AStarFinder({
      allowDiagonal: true,
      dontCrossCorners: true,
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
