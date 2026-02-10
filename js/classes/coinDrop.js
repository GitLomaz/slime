class CoinDrop extends Drop {
  // static counter = 0;

  constructor(x, y, value) {
    super(x, y, "coinDrop");
    this.setSize(10, 10);
    this.body.setCircle(5);
    this.value = value;
    this.sprite.anims.play("coinDrop");
  }

  tick() {
    super.tick();
  }

  collect() {
    scene.player.gainCoins(this.value);
    this.destroy();
  }
}
