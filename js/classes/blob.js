class Blob extends Enemy {
  // static counter = 0;

  constructor(x, y) {
    if (!x || !y) {
      let spawnTile =
        scene.map.validSpawnTiles[
          getRandomInt(0, scene.map.validSpawnTiles.length)
        ];
      x = spawnTile.x;
      y = spawnTile.y;
    }

    super(x, y, "blob");
    this.setSize(25, 0);
    this.body.setCircle(13);
    this.health = 10;
    this.healthMax = 10;
    this.points = getRandomInt(2, 12);
    this.attackType = "melee";
  }

tick() {
  super.tick();

  if (this.knockback > 0) {
    this.knockback--;
    return;
  }

  this.ticks++;

  // Every ~40 ticks choose a new random direction
  if (!this.moveDir || this.ticks % 40 === 0) {
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);

    this.moveDir = {
      x: Math.cos(angle),
      y: Math.sin(angle),
      duration: Phaser.Math.Between(20, 40) // how long to move
    };
  }

  // Move while duration remains
  if (this.moveDir.duration > 0) {
    const SPEED = 40;

    this.body.setVelocity(
      this.moveDir.x * SPEED,
      this.moveDir.y * SPEED
    );

    this.moveDir.duration--;
  } else {
    // pause between hops
    this.body.setVelocity(0, 0);
  }

  // Animation
  if (this.ticks % 10 === 0) {
    this.sprite.setFrame((this.ticks % 30) / 10);
  }
}
}
