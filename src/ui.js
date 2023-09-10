import { Grid, Sprite, getCanvas, getPointer, imageAssets, lerp } from 'kontra';
import { Text, write } from './font';
import { game } from './game';
import { RangeIndicator } from './rangeindicator';
import { spriteFilePath, sprites } from './sprites';
import { INTRO } from './state';
import { BinButton, ToolbarButton } from './toolbarButton';
import { troopRange } from './troop';
import { snapToGrid } from './util';

export class Ui {
  selected = null;
  bars = [];

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

    this.startText = Grid({
      x: getCanvas().width / 2,
      y: getCanvas().height / 2,
      anchor: { x: 0.5, y: 0.5 },
      lines: [
        'THE YEAR IS 1258',
        'THE MONGOL EMPIRE IS RAPIDLY\nEXPANDING WEST',
        'AN ATTACK IS IMMINENT',
        'WE MUST PROTECT THE TREASURE!',
        'CLICK TO BEGIN'
      ],
      timer: 240,
      next() {
        this.removeChild(this.children[0]);
        const line = this.lines.shift();
        this.addChild(Text(line, 0, 0));
        this.timer = this.lines.length ? 240 : Infinity;
      },
      render() {
        this.context.fillStyle = 'rgba(60, 60, 60, 0.8)';
        this.context.fillRect(-4, -4, this.width + 8, this.height + 8);
        this.draw();
      }
    });
    this.startText.next();

    this.waveText = Grid({
      x: getCanvas().width / 2,
      y: getCanvas().height / 2,
      anchor: { x: 0.5, y: 0.5 },
      timer: 300,
      rowGap: 2,
      justify: 'center',
      children: [
        Text('WAVE FINISHED', 0, 0),
        Text('NEXT WAVE IN 5', 0, 0)
      ],
      update() {
        const text = `NEXT WAVE IN ${Math.ceil(this.timer / 60)}`;
        this.children[1].updateText(text);
      },
      render() {
        this.context.fillStyle = 'rgba(60, 60, 60, 0.8)';
        this.context.fillRect(-4, -4, this.width + 8, this.height + 8);
        this.draw();
      }
    });

    this.gameOverText = Grid({
      x: getCanvas().width / 2,
      y: getCanvas().height / 2,
      anchor: { x: 0.5, y: 0.5 },
      rowGap: 2,
      justify: 'center',
      children: [
        Text('GAME OVER', 0, 0),
        Text('THE TREASURE HAS BEEN STOLEN!', 0, 0)
      ],
      render() {
        this.context.fillStyle = 'rgba(60, 60, 60, 0.8)';
        this.context.fillRect(-4, -4, this.width + 8, this.height + 8);
        this.draw();
      }
    });

    this.winText = Grid({
      x: getCanvas().width / 2,
      y: getCanvas().height / 2,
      anchor: { x: 0.5, y: 0.5 },
      rowGap: 2,
      justify: 'center',
      children: [
        Text('YOU WIN!', 0, 0),
        Text('WE HAVE DEFENDED AGAINST THE MONGOLS', 0, 0),
        Text('THE TREASURE IS SAFE FOR NOW', 0, 0),
        Text('1', 0, 0)
      ],
      updateText() {
        this.children[3].updateText(`YOU KILLED ${game.enemiesKilled} INVADERS`);
        this._d = true;
      },
      render() {
        this.context.fillStyle = 'rgba(60, 60, 60, 0.8)';
        this.context.fillRect(-4, -4, this.width + 8, this.height + 8);
        this.draw();
      }
    });
  }

  update() {
    if (game.state == INTRO) {
      if (--this.startText.timer < 0) {
        this.startText.next();
      }
    }
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
    this.treasureHealth.children[2].width = Math.round(lerp(0, 24, game.treasureHealth / game.maxTreasureHealth));
    this.treasureHealth.render();
    this.resources.render();
    write(game.gold.toString(), 14, 141);

    if (game.state == INTRO) {
      this.startText.render();
    }

    this.bars.forEach(bar => bar.myRender());
  }
}
