class Vulture extends Phaser.GameObjects.Container {
  constructor(x = 396, y = 496) {
    super(scene, x, y);
    this.type = "vulture";

    // --- Visual ---
    // Expect spritesheet: 'vulture' (24x24) with 4 flap frames in a row
    this.sprite = scene.add.sprite(0, 0, "vulture");
    this.sprite.setOrigin(0.5, 0.5);
    this.add(this.sprite);

    // Optional: tint / scale
    this.sprite.setScale(2);

    this.sprite.play("vulture");

    // --- Motion config ---
    this.speed = 110;              // px/sec cruise speed
    this.seekSpeed = 140;          // px/sec when heading to drop
    this.turnRate = Phaser.Math.DegToRad(260); // rad/sec (higher = tighter turns)
    // Smaller turn radius = higher turnRate OR lower speed.
    // radius ~= speed / turnRate

    // heading (radians)
    this.heading = Phaser.Math.FloatBetween(-Math.PI, Math.PI);
    this.desiredHeading = this.heading;

    // wander target
    this.wanderTarget = new Phaser.Math.Vector2(x, y);

    // current target drop
    this.targetDrop = null;
    this.targetCounter = 30

    scene.add.existing(this);
  }

  tick(time, delta) {
    this.timeSinceLastKill += delta
    if (this.targetCounter === 0 || !this.targetDrop) {
      this.setCurrentTarget()
      this.targetCounter = 30
    } else {
      this.targetCounter--;
    }

    // this.targetDrop = null

    const dt = Math.min(delta, 50) / 1000; // clamp for stability

    if (this.targetDrop) {
      // Seek target drop
      const tx = this.targetDrop.x;
      const ty = this.targetDrop.y;

      this.desiredHeading = Math.atan2(ty - this.y, tx - this.x);

      // Move with smooth turning
      this.steerAndMove(dt, this.seekSpeed);
    } else {
      // Wander aimlessly
      this.wander(time);

      this.desiredHeading = Math.atan2(
        this.wanderTarget.y - this.y,
        this.wanderTarget.x - this.x
      );

      this.steerAndMove(dt, this.speed);
    }

    // Rotate sprite to face heading (top-down). Adjust offset if your art faces "up".
    // If your sprite faces up by default, use: this.rotation = this.heading + Math.PI/2
    this.rotation = this.heading + Math.PI / 2;

    // Optional: subtle bank/lean based on turn direction
    // const turnDelta = Phaser.Math.Angle.Wrap(this.desiredHeading - this.heading);
    // this.sprite.setRotation(turnDelta * 0.15); // small wing tilt only
  }

  setCurrentTarget() {
    this.targetDrop = this.getClosestLoot()
  }

  getClosestLoot() {
    let closestDrop = null;
    let closestDistance = Infinity;

    scene.drops.children.entries.forEach((e) => {
      const dist = Phaser.Math.Distance.Between(this.x, this.y, e.x, e.y);
      if (dist < closestDistance) {
        closestDistance = dist;
        closestDrop = e;
      }
    });

    return closestDrop;
  }

  steerAndMove(dt, speed) {
    // Turn toward desired heading at limited rate
    const delta = Phaser.Math.Angle.Wrap(this.desiredHeading - this.heading);
    const maxTurn = this.turnRate * dt;
    const turn = Phaser.Math.Clamp(delta, -maxTurn, maxTurn);

    this.heading = Phaser.Math.Angle.Wrap(this.heading + turn);

    // Move forward
    const vx = Math.cos(this.heading) * speed;
    const vy = Math.sin(this.heading) * speed;

    this.x += vx * dt;
    this.y += vy * dt;
  }

  wander(time = 0) {
    // If we don't currently have a wander destination, pick one
    if (!this.wanderTarget || !Number.isFinite(this.wanderTarget.x)) {
      this.wanderTarget = new Phaser.Math.Vector2(this.x, this.y);
      this._pickNewWanderTarget(time);
      return;
    }

    // If we arrived (or got "stuck" too long), pick a new one
    const dist = Phaser.Math.Distance.Between(this.x, this.y, this.wanderTarget.x, this.wanderTarget.y);

    if (dist <= 24) {
      this._pickNewWanderTarget(time);
      return;
    }

    // Optional: timeout to prevent endless chasing if something weird happens
    if (this._wanderUntil && time > this._wanderUntil) {
      this._pickNewWanderTarget(time);
      return;
    }
  }

  _pickNewWanderTarget(time = 0) {
    // Determine world bounds
    let minX = 0, minY = 0, maxX = 2000, maxY = 2000; // fallback

    if (this.scene.map?.widthInPixels && this.scene.map?.heightInPixels) {
      maxX = this.scene.map.widthInPixels;
      maxY = this.scene.map.heightInPixels;
    } else if (this.scene.physics?.world?.bounds) {
      const b = this.scene.physics.world.bounds;
      minX = b.x; minY = b.y;
      maxX = b.x + b.width;
      maxY = b.y + b.height;
    } else if (this.scene.cameras?.main) {
      const b = this.scene.cameras.main.getBounds();
      minX = b.x; minY = b.y;
      maxX = b.x + b.width;
      maxY = b.y + b.height;
    }

    const margin = 32;

    const targetX = Phaser.Math.Between(minX + margin, maxX - margin);
    const targetY = Phaser.Math.Between(minY + margin, maxY - margin);

    this.wanderTarget.set(targetX, targetY);

    // Give it up to N ms to reach this target before repicking
    this._wanderUntil = time + 4000;
  }
}