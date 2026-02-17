class Popup extends Phaser.GameObjects.Container {
  constructor(x, y, w, h) {
    super(scene, x, y);
    this.w = w;
    this.h = h;

    this.BG = scene.add.rectangle(0, 0, w, h, 0xe4a672).setOrigin(0);
    this.BG.setInteractive(); // blocks input behind
    this.add(this.BG);

    this.N = scene.add.tileSprite(0, 0, w, 12, "basicFrame").setOrigin(0).setFrame(1);
    this.E = scene.add.tileSprite(w, 0, 12, h, "basicFrame").setOrigin(1, 0).setFrame(5);
    this.S = scene.add.tileSprite(0, h, w, 12, "basicFrame").setOrigin(0, 1).setFrame(7);
    this.W = scene.add.tileSprite(0, 0, 12, h, "basicFrame").setOrigin(0).setFrame(3);
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