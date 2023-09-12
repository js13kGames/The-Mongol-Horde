import { Button, Grid, Sprite, getCanvas, getPointer, imageAssets, lerp } from 'kontra';
import { Text, write } from './font';
import { game } from './game';
import { RangeIndicator } from './rangeindicator';
import { spriteFilePath, sprites } from './sprites';
import { INTRO, PAUSED, PLAYING } from './state';
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
    this.cursorCross = Sprite({
      image: imageAssets[spriteFilePath],
      spriteLocation: sprites.cross,
      visible: false,
      render() {
        if (this.visible) {
          this.draw();
        }
      }
    });
    this.cursorSprite.addChild(this.cursorCross);

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
        this.context.fillStyle = '#464646';
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
        Text('WAVE 0 FINISHED', 0, 0),
        Text('NEXT WAVE IN 5', 0, 0)
      ],
      update() {
        this.children[0].updateText(`WAVE ${game.waves.waveNumber} FINISHED`);
        this.children[1].updateText(`NEXT WAVE IN ${Math.ceil(this.timer / 60)}`);
      },
      render() {
        this.context.fillStyle = '#464646';
        this.context.fillRect(-4, -4, this.width + 8, this.height + 8);
        this.draw();
      }
    });

    this.loseText = Grid({
      x: getCanvas().width / 2,
      y: getCanvas().height / 2,
      anchor: { x: 0.5, y: 0.5 },
      rowGap: 2,
      justify: 'center',
      children: [
        Text('GAME OVER', 0, 0),
        Text('THE MONGOLS HAVE DEFEATED YOU!', 0, 0),
        Text('1', 0, 0),
        Text('1', 0, 0),
        Text('1', 0, 0)
      ],
      updateText() {
        this.children[2].updateText(`YOU SURVIVED ${game.waves.waveNumber - 1} WAVE${game.waves.waveNumber - 1 == 1 ? '' : 'S'}`);
        this.children[3].updateText(`RECRUITED ${game.troopsHired} TROOPS`);
        // this.children[4].updateText(`LOST ${game.troopsKilled} TROOPS`);
        this.children[4].updateText(`AND KILLED ${game.enemiesKilled} INVADERS`);
      },
      render() {
        this.context.fillStyle = '#464646';
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
        this.context.fillStyle = '#464646';
        this.context.fillRect(-4, -4, this.width + 8, this.height + 8);
        this.draw();
      }
    });

    this.restartButton = Button({
      width: 40,
      height: 10,
      color: '#464646',
      onOver() {
        this.color = '#595959';
      },
      onOut() {
        this.color = '#464646';
      },
      onDown() {
        game.restart();
      },
      render() {
        this.draw();
        write('RESTART', 2, 2);
      }
    });

    this.winScreen = Grid({
      x: getCanvas().width / 2,
      y: getCanvas().height / 2,
      anchor: { x: 0.5, y: 0.5 },
      justify: 'center',
      rowGap: 22,
      children: [this.winText, this.restartButton]
    });

    this.loseScreen = Grid({
      x: getCanvas().width / 2,
      y: getCanvas().height / 2,
      anchor: { x: 0.5, y: 0.5 },
      justify: 'center',
      rowGap: 6,
      children: [this.loseText, this.restartButton]
    });

    this.volumeButton = Button({
      text: {
        font: '0px none'
      },
      x: 190,
      y: 10,
      anchor: { x: 1, y: 0 },
      image: imageAssets[spriteFilePath],
      spriteLocation: sprites.speaker,
      disabled: true,
      onDown() {
        game.ui.volumeControl.hidden = !game.ui.volumeControl.hidden;
        game.state = game.ui.volumeControl.hidden ? PLAYING : PAUSED;
      },
      render() {
        if (this.hovered) {
          this.context.fillStyle = '#595959';
        } else {
          this.context.fillStyle = '#464646';
        }
        this.context.fillRect(-2, -2, this.width + 4, this.height + 4);
        this.draw();
      }
    });

    this.volumeControl = Grid({
      x: getCanvas().width / 2,
      y: getCanvas().height / 2,
      anchor: { x: 0.5, y: 0.5 },
      justify: 'center',
      hidden: true,
      children: [
        Text('VOLUME < 30% >', 0, 0)
      ],
      updateText(volume) {
        this.children[0].updateText(`VOLUME < ${volume * 100}% >`);
        this._d = true;
      },
      render() {
        this.context.fillStyle = '#464646';
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
      const point = game.grid[x / 8][y / 8];
      if (point?.collidable || point?.entity || point == game.grid.goal) {
        this.rangeIndicator.visible = false;
        this.cursorCross.visible = true;
      } else {
        this.rangeIndicator.visible = true;
        this.cursorCross.visible = false;
      }
      this.cursorSprite.x = x;
      this.cursorSprite.y = y;
      this.cursorSprite.spriteLocation = this.selected;
      this.cursorSprite.render();
      this.rangeIndicator.setRadius(troopRange[this.selected]);
    }
    this.toolbar.render();
    this.troopSelection.render();
    this.treasureHealth.children[2].width = Math.max(0, Math.round(lerp(0, 24, game.treasureHealth / game.maxTreasureHealth)));
    this.treasureHealth.render();
    this.resources.render();
    write(game.gold.toString(), 14, 141);

    if (game.state == INTRO) {
      this.startText.render();
    }

    this.bars.forEach(bar => bar.myRender());
    this.volumeButton.render();
    if (!this.volumeControl.hidden) {
      this.volumeControl.render();
    }
  }
}
