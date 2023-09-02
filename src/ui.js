import { imageAssets, Sprite, ButtonClass, getCanvas, Grid, getPointer, getContext, GameObject, lerp, Text } from 'kontra';
import { sprites, spriteFilePath } from './sprites';
import { insideCircle, snapToGrid } from './util';
import { game } from './game';
import { ranges } from './troop';
import { write } from './font';

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
    const knightButton = new ToolbarButton(sprites.knight);
    const wallButton = new ToolbarButton(sprites.wall);

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
      children: [soldierButton, archerButton, knightButton, wallButton]
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
        spriteLocation: [25, 25, 6, 6],
        anchor: { x: 0, y: 0.5 }
      })
    );
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
    this.toolbar.render();
    this.troopSelection.render();
    this.treasureHealth.children[2].width = lerp(0, 24, game.treasureHealth / game.maxTreasureHealth);
    this.treasureHealth.render();
    this.resources.render();
    write(game.gold.toString(), 14, 141);
  }
}
