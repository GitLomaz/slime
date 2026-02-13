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
    this.automatic = true;

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
        if (this.automatic) {
          return;
        }
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

  tick(delta) {
    // Reset velocity each tick
    this.body.setVelocity(0, 0);

    if (this.attackCooldown > 0) {
      this.attackCooldown -= delta;
      if (this.attackCooldown < 0) this.attackCooldown = 0;
    }

    if (this.swinging > 0) {
      this.swinging -= delta;
      if (this.swinging < 0) this.swinging = 0;
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

    if (pointer && this.pointerDown && !this.automatic) {
      const wp = pointer.positionToCamera(cam); // { x, y } in world space

      const dx = wp.x - this.x;
      const dy = wp.y - this.y;
      const dist = Math.hypot(dx, dy);

      if (dist > STOP_RADIUS) {
        this.body.setVelocity((dx / dist) * SPEED, (dy / dist) * SPEED);
        moving = true;

        const angle =
          Phaser.Math.RAD_TO_DEG *
          Phaser.Math.Angle.Between(this.x, this.y, wp.x, wp.y);

        this.playerAngle = angle;
      }
    }

    if (this.automatic) {
      let { closestEnemy, closestDistance } = this.getClosestEnemy();
      console.log(closestEnemy, closestDistance);
      if (closestEnemy) {
        const angleRad = Phaser.Math.Angle.Between(
          this.x,
          this.y,
          closestEnemy.x,
          closestEnemy.y
        );
        const angleDeg = Phaser.Math.RadToDeg(angleRad);
        this.playerAngle = angleDeg;

        if (closestDistance > STOP_RADIUS) {
          // Move toward enemy
          this.body.setVelocity(
            Math.cos(angleRad) * SPEED,
            Math.sin(angleRad) * SPEED
          );
          moving = true;
        } else {
          this.body.setVelocity(0, 0);
        }
      } else {
        this.body.setVelocity(0, 0);
      }
    }

    // --- Walk animation timing (was stepCounter++ per frame) ---
    // Keep your exact math: newFrame = floor(stepCounter/6)%4 + offset
    // At 60fps, stepCounter += 1/frame -> frame changes every 6 frames = 100ms
    const STEP_RATE = 1000 / 16.6667; // 60 "stepCounter units" per second ≈ 60
    // simpler: stepCounter += delta / 16.6667

    if (moving) {
      this.stepCounter += delta / 16.6667;
    } else {
      this.stepCounter = 21;
    }

    const newFrame = (Math.floor(this.stepCounter / 6) % 4) + offset;
    if (this.player.frame.name !== newFrame) {
      this.player.setFrame(newFrame);
    }

    this.attack(scene.time.now);
  }

  attack(now) {
    // Not ready yet
    if (now < this.nextAttackAt) return;

    let { closestEnemy, closestDistance } = this.getClosestEnemy();

    if (!closestEnemy || closestDistance > 80) return;

    const COOLDOWN_MS = 1000;

    this.nextAttackAt = now + COOLDOWN_MS;

    this.swinging = 250;

    const spr = scene.add.sprite(0, 0, "slash");
    spr.setScale(3);
    spr.setAngle(this.playerAngle);
    this.add(spr);

    spr.anims.play("slash", true);
    spr.on("animationcomplete", () => spr.destroy());

    scene.sprites.children.entries.forEach((e) => {
      if (!e || e.type !== "enemy") return;

      const d = Phaser.Math.Distance.Between(this.x, this.y, e.x, e.y);
      if (d >= 100) return;

      const a = Phaser.Math.Angle.Between(this.x, this.y, e.x, e.y);

      const angleDelta = Math.abs(
        Phaser.Math.Angle.Wrap(Phaser.Math.DegToRad(this.playerAngle) - a)
      );

      if (angleDelta < 1.2 && e.knockback <= 0) {
        e.takeDamage(4, { x: Math.cos(a), y: Math.sin(a) });
      }
    });
  }

  getClosestEnemy() {
    let closestEnemy = null;
    let closestDistance = Infinity;

    scene.sprites.children.entries.forEach((e) => {
      if (!e || e.type !== "enemy") return;

      const dist = Phaser.Math.Distance.Between(this.x, this.y, e.x, e.y);
      if (dist < closestDistance) {
        closestDistance = dist;
        closestEnemy = e;
      }
    });

    return { closestEnemy, closestDistance };
  }

  gainCoins() {
    this.coins++;
  }
}
