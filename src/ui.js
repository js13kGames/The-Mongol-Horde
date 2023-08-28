import { imageAssets, Sprite, ButtonClass, getCanvas, Grid, getPointer, getContext, GameObject } from 'kontra';
import { sprites, spriteFilePath } from './sprites';
import { insideCircle, snapToGrid } from './util';
import { game } from './game';
import { ranges } from './troop';

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

export function RangeIndicator() {
  return GameObject({
    squares: [],
    visible: true,

    setRadius(radius) {
      this.squares = [];
      if (radius == 0) return;
      const top = Math.ceil(-radius);
      const bottom = Math.floor(radius);
      const left = Math.ceil(-radius);
      const right = Math.floor(radius);
      for (let x = left; x <= right; x++) {
        for (let y = top; y <= bottom; y++) {
          if (insideCircle(this.position, { x, y }, radius)) {
            this.squares.push({ x, y });
          }
        }
      }
    },

    render() {
      if (this.visible) {
        getContext().fillStyle = 'rgba(255, 0, 0, 0.4)';
        this.squares.forEach(({ x, y }) => {
          getContext().fillRect(...snapToGrid(x * 8, y * 8), 8, 8);
        });
      }
    }
  });
}

export class Ui {
  selected = null;

  init() {
    this.cursorSprite = Sprite({
      image: imageAssets[spriteFilePath],
      spriteLocation: sprites.soldier
    });
    this.rangeIndicator = RangeIndicator();
    this.cursorSprite.addChild(this.rangeIndicator);

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
      this.rangeIndicator.setRadius(ranges[this.selected]);
    }
    this.toolbarBackground.render();
    this.toolbar.render();
  }
}
