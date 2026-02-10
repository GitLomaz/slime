class Enemy extends Phaser.GameObjects.Container {
  // static counter = 0;

  constructor(x, y, sprite) {
    super(scene, x, y);
    scene.add.existing(this);
    scene.sprites.add(this);
    this.sprite = scene.add.sprite(0, 0, sprite);
    this.type = "enemy";
    this.add(this.sprite);
    this.knockback = 0;
    this.ticks = getRandomInt(0, 500);
    this.damageFlash = 0;

    this.healthBarBack = scene.add.rectangle(0, -24, 48, 6, 0x1c0000);
    this.healthBarBack.setStrokeStyle(2, 0x0e0000);
    this.healthBar = scene.add.rectangle(0, -24, 48, 6, 0xcb0000);
    this.healthBarBack.setAlpha(0);
    this.healthBar.setAlpha(0);
    this.add(this.healthBarBack);
    this.add(this.healthBar);
  }

  showHealthbar() {
    scene.tweens.add({
      targets: this.healthBarBack,
      alpha: 1,
      duration: 500,
      ease: "Linear",
    });
    scene.tweens.add({
      targets: this.healthBar,
      alpha: 1,
      duration: 500,
      ease: "Linear",
    });
  }

  tick() {
    if (this.damageFlash > 0) {
      this.damageFlash--;
      let damageFlashState = Math.floor(this.damageFlash / 3);
      if (damageFlashState % 5 === 0) {
        this.sprite.clearTint();
        this.sprite.setTint(0xff0000);
      } else if (damageFlashState % 5 === 1) {
        this.sprite.clearTint();
        this.sprite.setTintFill(0xff0000);
      }
    } else {
      this.sprite.clearTint();
    }
  }

  takeDamage(damage, force) {
    if (this.knockback !== 0) {
      return;
    }
    if (this.healthBar.alpha === 0) {
      this.showHealthbar();
    }
    this.damageFlash = 25;
    this.applyKnockback(force);
    this.health = this.health - damage;
    scene.tweens.add({
      targets: this.healthBar,
      width: Math.floor((this.health / this.healthMax) * 48),
      duration: 400,
      ease: "Linear",
    });
    if (this.health <= 0) {
      this.die(force);
    }
  }

  applyKnockback(force, randomizer = 400) {
    this.body.setVelocityX(force.x * getRandomInt(100, randomizer));
    this.body.setVelocityY(force.y * getRandomInt(100, randomizer));
    this.knockback = 10;
  }

  die(force) {
    for (let x = this.points; x > 0; x = x - 10) {
      let money = new CoinDrop(this.x, this.y, 10);
      money.body.setVelocityX(force.x * getRandomInt(100, 400));
      money.body.setVelocityY(force.y * getRandomInt(100, 400));
    }
    this.destroy();
  }
}
