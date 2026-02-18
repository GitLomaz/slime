// BackpackButton.js
class BackpackButton extends Phaser.GameObjects.Image {
  constructor() {
    super(scene, 0, 0, "backpack");

    this.setScale(2);
    this.setScrollFactor(0);
    this.setDepth(10001);

    this.setInteractive({ useHandCursor: true });

    // ---- Popup (created once) ----
    this.popupW = 400;
    this.baseH = 20;
    this.rowH = 40;

    this.popup = new Popup(0, 0, this.popupW, this.baseH);
    this.popup.setDepth(10002);

    // ---- Row: Coins (created once) ----
    // (If you want a coin icon too, add it here and toggle visibility the same way.)
    this.coinLabel = scene.add.text(24, 20, "Coins:", {
      fontFamily: "font1",
      fontSize: "24px",
      color: "#000000",
    });

    this.coinValue = scene.add.text(150, 20, "", {
      fontFamily: "font1",
      fontSize: "24px",
      color: "#000000",
    });

    this.popup.add([this.coinLabel, this.coinValue]);

    // Start hidden until refresh decides it should show
    this.coinLabel.setVisible(false);
    this.coinValue.setVisible(false);

    // Anchor button in UI space
    scene.ui.addAnchored(this, "top-left", 0, 0);

    // Show on press
    this.on("pointerdown", (pointer) => {
      pointer.event?.preventDefault?.();

      this.refreshPopupContent(); // <- updates rows + height using CURRENT player state
      this.showPopup();

      scene.input.once(Phaser.Input.Events.POINTER_UP, () => this.popup.hide());
    });

    this.on("pointerout", () => this.popup.hide());
    scene.game.events.on("blur", () => this.popup.hide());

    scene.scale.on("resize", () => {
      if (this.popup.visible) this.showPopup();
    });
  }

  refreshPopupContent() {
    const coins = scene.player?.coins ?? 0;

    // Build list of "enabled rows"
    const rows = [];

    if (coins > 0) {
      rows.push({ key: "coins", value: coins });
    }

    // Layout rows
    let rowIndex = 0;

    // Coins row
    const coinsRow = rows.find((r) => r.key === "coins");
    if (coinsRow) {
      const y = 20 + rowIndex * this.rowH;
      this.coinLabel.setPosition(24, y);
      this.coinValue.setPosition(150, y);
      this.coinValue.setText(String(coinsRow.value));

      this.coinLabel.setVisible(true);
      this.coinValue.setVisible(true);

      rowIndex++;
    } else {
      this.coinLabel.setVisible(false);
      this.coinValue.setVisible(false);
    }

    // Resize popup to fit current rows
    const newH = this.baseH + rowIndex * this.rowH;
    this.popup.resize(this.popupW, newH);
  }

  showPopup() {
    const pad = 8;

    const btnLeft = this.x - this.displayWidth * this.originX;
    const btnTop = this.y - this.displayHeight * this.originY;

    let px = btnLeft + this.displayWidth + pad;
    let py = btnTop + 40; // popup down a bit

    const cam = scene.cameras.main;
    const W = cam.width;
    const H = cam.height;

    px = Phaser.Math.Clamp(px, 0, W - this.popup.w);
    py = Phaser.Math.Clamp(py, 0, H - this.popup.h);

    this.popup.showAt(px, py);
  }
}
