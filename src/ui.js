import { imageAssets, Sprite, ButtonClass, getCanvas, Grid, getPointer } from "kontra";
import { sprites, spriteFilePath } from "./sprites";
import { snapToGrid } from './util';
import { game } from './game';

export class ToolbarButton extends ButtonClass {
  constructor(spriteLocation) {
    super({
      text: {
        font: '0px none'
      },
      image: imageAssets[spriteFilePath],
      spriteLocation
    });
  }

  onDown() {
    game.ui.selected = this.spriteLocation;
  }

  draw() {
    if (this.hovered) {
      this.context.fillStyle = 'rgba(255, 255, 255, 0.1)';
      this.context.fillRect(-1, -1, this.width + 2, this.height + 2);
    }
    super.draw();
  }
}

export class Ui {
  selected = null;

  init() {
    this.cursorSprite = Sprite({
      image: imageAssets[spriteFilePath],
      spriteLocation: sprites.soldier
    });

    const soldierButton = new ToolbarButton(sprites.soldier);
    const archerButton = new ToolbarButton(sprites.archer);
    const wallButton = new ToolbarButton(sprites.wall);

    this.toolbar = Grid({
      x: getCanvas().width / 2,
      y: getCanvas().height - 8,
      anchor: { x: 0.5, y: 0.5 },
      flow: 'row',
      colGap: 2,
      children: [soldierButton, archerButton, wallButton]
    });

    this.toolbarBackground = Sprite({
      x: this.toolbar.x,
      y: this.toolbar.y,
      width: this.toolbar.width + 4,
      height: this.toolbar.height + 4,
      anchor: { x: 0.5, y: 0.5 },
      color: 'rgba(0, 0, 0, 0.3)'
    });
  }

  render() {
    if (this.selected != null) {
      const pointer = getPointer();
      const [x, y] = snapToGrid(pointer.x, pointer.y);
      this.cursorSprite.x = x;
      this.cursorSprite.y = y;
      this.cursorSprite.spriteLocation = this.selected;
      this.cursorSprite.render();
    }
    this.toolbarBackground.render();
    this.toolbar.render();
  }
}
