import { imageAssets, Sprite, ButtonClass, getCanvas, Grid, getPointer, getContext, GameObject, lerp } from 'kontra';
import { sprites, spriteFilePath } from './sprites';
import { insideCircle, snapToGrid } from './util';
import { game } from './game';
import { troopRange, troopCost, troopDamage } from './troop';
import { getSize, write } from './font';

class ToolbarButton extends ButtonClass {
  constructor(spriteLocation) {
    super({
      text: {
        font: '0px none'
      },
      image: imageAssets[spriteFilePath],
      spriteLocation
    });
    this.tooltip = Sprite({
      x: 4,
      y: -26,
      render() {
        const cost = troopCost[spriteLocation].toString();
        const damage = troopDamage[spriteLocation].toString();
        const range = Math.floor(troopRange[spriteLocation]).toString();
        const textSize = Math.max(getSize(cost).x, getSize(damage).x, getSize(range).x);
        const x = Math.floor(textSize / -2) - 6;
        this.context.fillStyle = 'rgb(70, 70, 70)';
        this.context.fillRect(x, 0, 12 + textSize, 24);
        this.context.drawImage(imageAssets[spriteFilePath], ...sprites.coin, x + 2, 2, 6, 6);
        this.context.drawImage(imageAssets[spriteFilePath], ...sprites.damage, x + 2, 9, 6, 6);
        this.context.drawImage(imageAssets[spriteFilePath], ...sprites.range, x + 2, 16, 6, 6);
        write(cost, x + 10, 2);
        write(damage, x + 10, 9);
        write(range, x + 10, 16);
        // Do cooldown instead of range, clock for icon
        // See how text fits in there too
      }
    });
  }

  onDown() {
    game.ui.selected = this.spriteLocation;
  }

  draw() {
    if (this.hovered) {
      this.context.fillStyle = 'rgba(255, 255, 255, 0.1)';
      this.context.fillRect(-1, -1, this.width + 2, this.height + 2);
      this.tooltip.render();
    }
    if (game.ui.selected == this.spriteLocation) {
      this.context.fillStyle = 'rgba(255, 255, 255, 0.2)';
      this.context.fillRect(-1, -1, this.width + 2, this.height + 2);
    }
    super.draw();
  }
}

class BinButton extends ButtonClass {
  constructor() {
    super({
      text: {
        font: '0px none'
      },
      image: imageAssets[spriteFilePath],
      spriteLocation: sprites.bin
    });
  }

  onDown() {
    game.ui.selected = sprites.bin;
  }

  draw() {
    if (this.hovered) {
      this.context.fillStyle = 'rgba(255, 255, 255, 0.1)';
      this.context.fillRect(-1, -1, this.width + 2, this.height + 2);
    }
    if (game.ui.selected == this.spriteLocation) {
      this.context.fillStyle = 'rgba(255, 255, 255, 0.2)';
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
        getContext().fillStyle = 'rgba(255, 0, 0, 0.3)';
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
    const knightButton = new ToolbarButton(sprites.knight);
    const wallButton = new ToolbarButton(sprites.wall);
    const binButton = new BinButton();

    this.toolbar = Sprite({
      y: getCanvas().height - 8,
      width: getCanvas().width,
      height: 16,
      anchor: { x: 0, y: 0.5 },
      color: 'rgb(60, 60, 60)'
    });

    const troopSelectionGrid = Grid({
      anchor: { x: 0.5, y: 0.5 },
      flow: 'row',
      colGap: 2,
      children: [soldierButton, archerButton, knightButton, wallButton, binButton]
    });
    this.troopSelection = Sprite({
      x: getCanvas().width / 2,
      y: this.toolbar.y,
      width: troopSelectionGrid.width + 4,
      height: 12,
      anchor: { x: 0.5, y: 0.5 },
      color: 'rgb(70, 70, 70)'
    });
    this.troopSelection.addChild(troopSelectionGrid);

    this.treasureHealth = Sprite({
      x: getCanvas().width - 4,
      y: this.toolbar.y,
      width: 36,
      height: 10,
      anchor: { x: 1, y: 0.5 },
      color: 'rgb(70, 70, 70)'
    });
    this.treasureHealth.addChild(
      Sprite({
        x: -34,
        image: imageAssets[spriteFilePath],
        spriteLocation: [1, 1, 6, 6],
        anchor: { x: 0, y: 0.5 }
      }),
      Sprite({
        x: -26,
        width: 24,
        height: 6,
        anchor: { x: 0, y: 0.5 },
        color: 'rgb(65, 65, 65)'
      }),
      Sprite({
        x: -26,
        height: 6,
        anchor: { x: 0, y: 0.5 },
        color: 'rgb(182, 65, 50)'
      }));

    this.resources = Sprite({
      x: 4,
      y: this.toolbar.y,
      width: 36,
      height: 10,
      anchor: { x: 0, y: 0.5 },
      color: 'rgb(70, 70, 70)'
    });
    this.resources.addChild(
      Sprite({
        x: 2,
        image: imageAssets[spriteFilePath],
        spriteLocation: sprites.coin,
        anchor: { x: 0, y: 0.5 }
      })
    );
  }

  render() {
    if (this.selected != null && this.selected != sprites.bin) {
      const pointer = getPointer();
      const [x, y] = snapToGrid(pointer.x, pointer.y);
      this.cursorSprite.x = x;
      this.cursorSprite.y = y;
      this.cursorSprite.spriteLocation = this.selected;
      this.cursorSprite.render();
      this.rangeIndicator.setRadius(troopRange[this.selected]);
    }
    this.toolbar.render();
    this.troopSelection.render();
    this.treasureHealth.children[2].width = lerp(0, 24, game.treasureHealth / game.maxTreasureHealth);
    this.treasureHealth.render();
    this.resources.render();
    write(game.gold.toString(), 14, 141);
  }
}
