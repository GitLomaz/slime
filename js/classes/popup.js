// Popup.js
class Popup extends Phaser.GameObjects.Container {
  constructor(x, y, w, h) {
    super(scene, x, y);

    this.w = w;
    this.h = h;

    this.BG = scene.add.rectangle(0, 0, w, h, 0xe4a672).setOrigin(0);
    this.BG.setInteractive(); // blocks input behind
    this.add(this.BG);

    this.N = scene.add.tileSprite(0, 0, w, 24, "basicFrame").setOrigin(0).setFrame(1);
    this.E = scene.add.tileSprite(w, 0, 24, h, "basicFrame").setOrigin(1, 0).setFrame(5);
    this.S = scene.add.tileSprite(0, h, w, 24, "basicFrame").setOrigin(0, 1).setFrame(7);
    this.W = scene.add.tileSprite(0, 0, 24, h, "basicFrame").setOrigin(0).setFrame(3);
    this.add([this.N, this.E, this.S, this.W]);

    this.NW = scene.add.sprite(0, 0, "basicFrame").setOrigin(0);
    this.NE = scene.add.sprite(w, 0, "basicFrame").setOrigin(1, 0).setFrame(2);
    this.SW = scene.add.sprite(0, h, "basicFrame").setOrigin(0, 1).setFrame(6);
    this.SE = scene.add.sprite(w, h, "basicFrame").setOrigin(1).setFrame(8);
    this.add([this.NW, this.NE, this.SW, this.SE]);

    this.setScrollFactor(0);
    this.setDepth(200);
    this.setVisible(false);
    this.active = false;

    scene.add.existing(this);
  }

  resize(w, h) {
    this.w = w;
    this.h = h;

    // BG
    this.BG.width = w;
    this.BG.height = h;

    // Update interactive hit area (important)
    if (this.BG.input?.hitArea) {
      this.BG.input.hitArea.width = w;
      this.BG.input.hitArea.height = h;
    }

    // Sides
    this.N.setSize(w, 24);
    this.S.setSize(w, 24);
    this.E.setSize(24, h);
    this.W.setSize(24, h);

    // Reposition sides (because origins)
    this.E.setPosition(w, 0); // origin(1,0)
    this.S.setPosition(0, h); // origin(0,1)

    // Corners
    this.NE.setPosition(w, 0);
    this.SW.setPosition(0, h);
    this.SE.setPosition(w, h);
  }

  showAt(x, y) {
    this.setPosition(x, y);
    this.setVisible(true);
    this.active = true;
  }

  hide() {
    this.setVisible(false);
    this.active = false;
  }
}
