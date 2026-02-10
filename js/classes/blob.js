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

  tick(delta) {
    super.tick(delta);

    // ---- Knockback (was 1 frame per tick) ----
    if (this.knockback > 0) {
      this.knockback -= delta;
      return;
    } else {
      this.knockback = 0;
    }

    this.ticks += delta;

    if (this.immobile) {
      return;
    }

    // ---- Choose new direction about every ~40 frames @60fps ≈ 660ms ----
    if (!this.moveDir || this.ticks % 660 < delta) {
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);

      this.moveDir = {
        x: Math.cos(angle),
        y: Math.sin(angle),

        // 20–40 frames → 330–660ms
        duration: Phaser.Math.Between(330, 660)
      };
    }

    // ---- Movement ----
    if (this.moveDir.duration > 0) {
      const SPEED = 40; // pixels per SECOND

      this.body.setVelocity(
        this.moveDir.x * SPEED,
        this.moveDir.y * SPEED
      );

      this.moveDir.duration -= delta;
    } 
    else {
      this.body.setVelocity(0, 0);
    }

    // ---- Animation: every ~10 frames ≈ 166ms ----
    if (this.ticks % 166 < delta) {
      this.sprite.setFrame((Math.floor(this.ticks / 166) % 3));
    }
  }
}
