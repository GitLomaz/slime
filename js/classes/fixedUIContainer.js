class FixedUIContainer extends Phaser.GameObjects.Container {
  constructor() {
    super(scene, 0, 0);
    this._anchors = [];

    // Fixed to the camera
    this.setScrollFactor(0);
    this.setDepth(10000);

    scene.add.existing(this);

    // Only needs resize (NOT every frame)
    scene.scale.on("resize", this.updateLayout, this);

    // Run once right away
    this.updateLayout();
  }

  /**
   * anchor:
   *  "top-left" "top-right" "bottom-left" "bottom-right"
   *  "top" "bottom" "left" "right" "center"
   */
  addAnchored(child, anchor, padX = 0, padY = padX) {
    this.add(child);
    this._anchors.push({ child, anchor, padX, padY });
    this.updateLayout();
    return child;
  }

  updateLayout() {
    const cam = this.scene.cameras.main;

    // Camera viewport in SCREEN pixels
    const W = cam.width;
    const H = cam.height;

    const left = 0;
    const top = 0;
    const right = W;
    const bottom = H;
    const centerX = W / 2;
    const centerY = H / 2;

    for (const { child, anchor, padX, padY } of this._anchors) {
      switch (anchor) {
        case "top-left":
          child.setOrigin(0, 0);
          child.setPosition(left + padX, top + padY);
          break;

        case "top-right":
          child.setOrigin(1, 0);
          child.setPosition(right - padX, top + padY);
          break;

        case "bottom-left":
          child.setOrigin(0, 1);
          child.setPosition(left + padX, bottom - padY);
          break;

        case "bottom-right":
          child.setOrigin(1, 1);
          child.setPosition(right - padX, bottom - padY);
          break;

        case "top":
          child.setOrigin(0.5, 0);
          child.setPosition(centerX, top + padY);
          break;

        case "bottom":
          child.setOrigin(0.5, 1);
          child.setPosition(centerX, bottom - padY);
          break;

        case "left":
          child.setOrigin(0, 0.5);
          child.setPosition(left + padX, centerY);
          break;

        case "right":
          child.setOrigin(1, 0.5);
          child.setPosition(right - padX, centerY);
          break;

        case "center":
        default:
          child.setOrigin(0.5, 0.5);
          child.setPosition(centerX, centerY);
          break;
      }
    }
  }

  destroy(fromScene) {
    scene.scale.off("resize", this.updateLayout, this);
    super.destroy(fromScene);
  }
}