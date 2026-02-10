class Drop extends Phaser.GameObjects.Container {
  // static counter = 0;

  constructor(x, y, sprite) {
    super(scene, x, y);
    scene.add.existing(this);
    scene.drops.add(this);
    this.sprite = scene.add.sprite(0, 0, sprite);
    this.type = "drop";
    this.add(this.sprite);
    this.cooldown = 30;
  }

  tick() {
    if (this.cooldown > 0) {
      this.cooldown--;
      return;
    }
    let dist = Phaser.Math.Distance.Between(
      scene.player.x,
      scene.player.y,
      this.x,
      this.y
    );
    if (dist < 10) {
      this.collect();
    } else if (dist < scene.player.magnet) {
      scene.physics.moveToObject(
        this,
        scene.player,
        2 * (scene.player.magnet - dist)
      );
    }
  }
}
