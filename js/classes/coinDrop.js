class CoinDrop extends Drop {
  // static counter = 0;

  constructor(x, y, value) {
    super(x, y, "coinDrop");
    this.setSize(20, 20);
    this.body.setCircle(10);
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
