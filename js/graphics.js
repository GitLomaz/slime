function spawnAnimation(
  location = { x: 200, y: 200 },
  tints = [0x00454a, 0x00757d, 0x008d96],
  enemy
) {
  let x = 0;
  let intervalID = setInterval(function () {
    let height = Phaser.Math.Between(-10, -20);
    let left = Phaser.Math.Between(-15, 15);
    let at = scene.add.sprite(
      location.x - left,
      location.y + height,
      "pixel2"
    );
    at.tint = tints[Phaser.Math.Between(0, 2)];

    at.downTween = scene.tweens.add({
      targets: at,
      y: location.y + 15,
      duration: 350,
      ease: "Linear",
      onComplete: function () {
        this.targets[0].destroy();
      },
    });

    if (++x === 50) {
      clearInterval(intervalID);
      enemy.setImmobile(false);
    }
  }, 5);
}