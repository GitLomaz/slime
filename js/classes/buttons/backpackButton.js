class BackpackButton extends Phaser.GameObjects.Image {
  constructor() {
    super(scene, 0, 0, "backpack");

    this.setScale(2);
    this.setScrollFactor(0);
    this.setDepth(10001);

    // Make it clickable
    this.setInteractive({ useHandCursor: true });

    // Create popup once
    this.popup = new Popup(0, 0, 400, 200);
    this.popup.setDepth(10002);

    // Add to fixed UI container (so x/y are screen pixels)
    scene.ui.addAnchored(this, "top-left", 16, 16);

    // --- Show on press ---
    this.on("pointerdown", (pointer) => {
      pointer.event?.preventDefault?.();

      this.showPopup();

      // Hide when this pointer is released anywhere
      scene.input.once(Phaser.Input.Events.POINTER_UP, () => this.popup.hide());
    });

    // Hide if finger/mouse leaves button (optional)
    this.on("pointerout", () => this.popup.hide());

    // Hide if game loses focus (mobile sometimes does this)
    scene.game.events.on("blur", () => this.popup.hide());

    // Reposition popup on resize (keeps it aligned)
    scene.scale.on("resize", () => {
      if (this.popup.visible) this.showPopup();
    });
  }

  showPopup() {
    const pad = 8;

    // Button top-left in SCREEN space, based on its current x/y and origin
    const btnLeft = this.x - this.displayWidth * this.originX;
    const btnTop  = this.y - this.displayHeight * this.originY;

    // Place popup to the right of the button
    let px = btnLeft + this.displayWidth + pad;
    let py = btnTop;

    // Clamp to screen so it never gets cut off
    const cam = scene.cameras.main;
    const W = cam.width;
    const H = cam.height;

    px = Phaser.Math.Clamp(px, 0, W - this.popup.w);
    py = Phaser.Math.Clamp(py, 0, H - this.popup.h);

    this.popup.showAt(px, py);
  }
}