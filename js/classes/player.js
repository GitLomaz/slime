class Player extends Phaser.GameObjects.Container {
  constructor() {
    super(scene, 396, 496);

    // --- Visual ---
    this.player = scene.add.sprite(0, -15, "player");
    this.player.setFrame(1);
    this.add(this.player);
    this.playerAngle = 0;
    this.setSize(30, 30);

    scene.add.existing(this);
    scene.physics.add.existing(this);
    scene.sprites.add(this);
    this.body.setCircle(12);
    // this.body.setOffset(0, 20)
    this.body.setImmovable();

    this.targetCounter = 30;

    // this.debugWaypoint = scene.add.graphics();
    // this.debugWaypoint.setDepth(9999); // ensure it's on top
    this.timeSinceLastKill = 0

    // --- Game state ---
    this.attackCooldown = 0;
    this.magnet = 130;
    this.coins = 0;
    this.stepCounter = 0;
    this.swinging = 0;
    this.stun = 0;
    this.automatic = false;
    

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
    this.timeSinceLastKill += delta
    if (this.targetCounter === 0 || !this.currentTarget) {
      this.setCurrentTarget()
      this.targetCounter = 30
    } else {
      this.targetCounter--;
    }

    if (!this.currentTarget) {
      return;
    }


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
    const STOP_RADIUS = 60;
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
      const dist = Phaser.Math.Distance.Between(this.x, this.y, this.currentTarget.x, this.currentTarget.y);
      if (dist > STOP_RADIUS) {
        const clear = hasClearLineToTarget(
          this.x, this.y,
          this.currentTarget.x, this.currentTarget.y
        );
        if (clear) {
          const angleRad = Phaser.Math.Angle.Between(
            this.x,
            this.y,
            this.currentTarget.x,
            this.currentTarget.y
          );
          const angleDeg = Phaser.Math.RadToDeg(angleRad);
          this.playerAngle = angleDeg;
          this.body.setVelocity(
            Math.cos(angleRad) * SPEED,
            Math.sin(angleRad) * SPEED
          );
          moving = true;
          // this.debugWaypoint.clear();
        } else {
          const result = getPathAndNextWaypoint(
            this.x, this.y,
            this.currentTarget.x, this.currentTarget.y
          );

          if (!result) {
            this.setCurrentTarget()
            return
          }

          const wx = result.nextWorldPoint.x;
          const wy = result.nextWorldPoint.y;

          // draw debug waypoint
          // this.debugWaypoint.clear();
          // this.debugWaypoint.fillStyle(0xff0000, 1);
          // this.debugWaypoint.fillCircle(wx, wy, 4);

          const angleRad = Phaser.Math.Angle.Between(
            this.x,
            this.y,
            result.nextWorldPoint.x,
            result.nextWorldPoint.y
          );
          const angleDeg = Phaser.Math.RadToDeg(angleRad);
          this.playerAngle = angleDeg;
          this.body.setVelocity(
            Math.cos(angleRad) * SPEED,
            Math.sin(angleRad) * SPEED
          );
          moving = true;
        }
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
        if (this.timeSinceLastKill > 15000) {
          console.log(this.timeSinceLastKill)
        }
        this.timeSinceLastKill = 0
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

  setCurrentTarget() {
    let closestEnemy = null;
    let closestDistance = Infinity;

    const map = scene.map;

    const start = map.worldToTileXY(this.x, this.y);
    const sx = Phaser.Math.Clamp(start.x, 0, map.width - 1);
    const sy = Phaser.Math.Clamp(start.y, 0, map.height - 1);

    scene.sprites.children.entries.forEach((e) => {
      if (!e || e.type !== "enemy") return;

      const goal = map.worldToTileXY(e.x, e.y);
      const gx = Phaser.Math.Clamp(goal.x, 0, map.width - 1);
      const gy = Phaser.Math.Clamp(goal.y, 0, map.height - 1);

      // Clone grid EVERY time (PF mutates it)
      const grid = scene.pfGrid.clone();

      // If enemy tile isn't walkable, skip for now (we can add nearest-walkable later)
      if (!grid.isWalkableAt(gx, gy)) {
        // enemy e needs to be teleported back onto a walkable tile
        return;
      }
      const path = scene.pfFinder.findPath(sx, sy, gx, gy, grid);
      if (!path || path.length === 0) return;

      const pathLen = path.length;
      if (pathLen < closestDistance) {
        closestDistance = pathLen;
        closestEnemy = e;
      }
    });

    this.currentTarget = closestEnemy
  }


  gainCoins() {
    this.coins++;
  }
}
