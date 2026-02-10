class Player extends Phaser.GameObjects.Container {
  constructor() {
    super(scene, 596, 396);

    // --- Visual ---
    this.player = scene.add.sprite(0, 0, "player");
    this.player.setFrame(1);
    this.add(this.player);
    this.playerAngle = 0;
    this.setSize(20, 20);

    scene.add.existing(this);
    scene.physics.add.existing(this);
    scene.sprites.add(this);
    this.body.setCircle(9);
    this.body.setOffset(0, 16)
    this.body.setImmovable();

    // --- Game state ---
    this.attackCooldown = 0;
    this.magnet = 100;
    this.coins = 0;
    this.stepCounter = 0;
    this.swinging = 0;
    this.stun = 0;

    this.health = {
      health: 100,
      maxHealth: 100,
      shield: 0,
    };

    scene.cameras.main.setBounds(
      0,
      0,
      scene.map.widthInPixels,
      scene.map.heightInPixels
    );
    scene.cameras.main.startFollow(this);

    this.pointerDown = false;

    scene.input.on(
      "pointermove",
      (pointer) => {
        const angle =
          Phaser.Math.RAD_TO_DEG *
          Phaser.Math.Angle.Between(this.x, this.y, pointer.worldX, pointer.worldY);
        this.playerAngle = angle;
      },
      this
    );

    // IMPORTANT: use arrow functions so `this` is the Player
    scene.input.on("pointerdown", () => {
      this.pointerDown = true;
    });

    scene.input.on("pointerup", () => {
      this.pointerDown = false;
    });
  }

  tick() {
    // Reset velocity each tick
    this.body.setVelocity(0, 0);
    if (this.attackCooldown > 0) {
      this.attackCooldown--;
    }

    // --- Directional animation offset based on current angle ---
    let offset = 0;

    if (this.playerAngle > -40 && this.playerAngle < 45) {
      offset = 32; // right
    } else if (this.playerAngle > -45 && this.playerAngle < 130) {
      offset = 0; // down
    } else if (this.playerAngle > -135 && this.playerAngle < -40) {
      offset = 48; // up
    } else {
      offset = 16; // left
    }

    // --- Move toward cursor while mouse/touch is down ---
    const pointer = scene.input && scene.input.activePointer;
    const cam = scene.cameras.main;
    const STOP_RADIUS = 40;
    const SPEED = 200;

    let moving = false;

    if (pointer && this.pointerDown) {
      const wp = pointer.positionToCamera(cam); // { x, y } in world space

      const dx = wp.x - this.x;
      const dy = wp.y - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist > STOP_RADIUS) {
        this.body.setVelocity((dx / dist) * SPEED, (dy / dist) * SPEED);
        moving = true;

        const angle =
          Phaser.Math.RAD_TO_DEG * Phaser.Math.Angle.Between(this.x, this.y, wp.x, wp.y);
        this.playerAngle = angle;
      }
    }

    if (moving) {
      this.stepCounter++;
    } else {
      this.stepCounter = 21;
    }

    const newFrame = (Math.floor(this.stepCounter / 6) % 4) + offset;
    if (this.player.frame.name !== newFrame) {
      this.player.setFrame(newFrame);
    }
    this.attack();
  }

  attack() {
    let closestEnemy = null;
    let closestDistance = Infinity;
    scene.sprites.children.entries.forEach((e) => {
      if (e.type === "enemy") {
        const dist = Phaser.Math.Distance.Between(this.x, this.y, e.x, e.y);
        if (dist < closestDistance) {
          closestDistance = dist;
          closestEnemy = e;
        }
      }
    });
    if (this.attackCooldown !== 0 || !closestEnemy || closestDistance > 80) {
      return;
    }
    let that = this;
    this.attackCooldown = 60;
    this.swinging = 15;
    let spr = scene.add.sprite(0, 0, "slash");
    spr.setScale(3);
    spr.setAngle(this.playerAngle);
    this.add(spr);
    spr.anims.play("slash", true);
    spr.on(
      "animationcomplete",
      function () {
        spr.destroy();
      },
      spr
    );
    let interaction = false;
    do {
      interaction = false;
      scene.sprites.children.entries.forEach(function (e) {
        if (e && e.type === "enemy") {
          let d = Phaser.Math.Distance.Between(that.x, that.y, e.x, e.y);
          if (d < 100) {
            let a = Phaser.Math.Angle.Between(that.x, that.y, e.x, e.y);
            let delta = Math.abs(
              Phaser.Math.Angle.Wrap(Phaser.Math.DegToRad(that.playerAngle) - a)
            );
            if (delta < 1.2 && e.knockback === 0) {
              let x = Math.cos(a);
              let y = Math.sin(a);
              e.takeDamage(4, { x: x, y: y });
              interaction = true;
            }
          }
        }
      });
    } while (interaction);
  }

  gainCoins() {
    this.coins++;
  }
}
