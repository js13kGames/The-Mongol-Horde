import { Pool, Sprite, TileEngine, getCanvas, getContext, imageAssets, onKey, onPointer, untrack } from 'kontra';
import { Grid } from './grid';
import map from './map';
import { bigGold, ghost } from './particles';
import { spriteFilePath, sprites } from './sprites';
import { INTRO, LOSE, PAUSED, PLAYING, WIN } from './state';
import { Troop, troopCost } from './troop';
import { Ui } from './ui';
import { removeFrom, snapToGrid } from './util';
import { Waves } from './wave';
import { sound } from './sound';
import { ZZFX } from 'zzfx';

class Game {
  constructor() {
    this.enemies = [];
    this.troops = [];
    this.text = [];
    this.debug = false;
    this.ui = new Ui();
    this.state = INTRO;
    this.oldState = INTRO;
    this.treasureHealth = 20;
    this.maxTreasureHealth = 20;
    this.gold = 6;
    this.enemiesKilled = 0;
    this.troopsHired = 0;
    this.troopsKilled = 0;
  }

  init() {
    this.tileEngine = TileEngine(map);
    this.grid = new Grid(this.tileEngine);
    this.grid.init();
    this.ui.init();
    this.waves = new Waves();
    this.wave = this.waves.next();
    this.pool = Pool({
      create: Sprite
    });
    this.chest = Sprite({
      x: this.grid.goal.x * 8,
      y: this.grid.goal.y * 8,
      image: imageAssets[spriteFilePath],
      spriteLocation: sprites.chest
    });
    this.tileEngine.add(this.chest);

    onKey('d', () => {
      this.debug = !this.debug;
    });

    onKey('esc', () => {
      if (this.state == PLAYING) {
        this.ui.selected = null;
      } else if (this.state == PAUSED) {
        this.ui.volumeControl.hidden = !this.ui.volumeControl.hidden;
        this.state = this.ui.volumeControl.hidden ? PLAYING : PAUSED;
      }
    });

    onKey('arrowleft', () => {
      if (this.state == PAUSED) {
        ZZFX.volume = Math.round(Math.max(0, ZZFX.volume - 0.1) * 10) / 10;
        this.ui.volumeControl.updateText(ZZFX.volume);
      }
    });

    onKey('arrowright', () => {
      if (this.state == PAUSED) {
        ZZFX.volume = Math.round(Math.min(1, ZZFX.volume + 0.1) * 10) / 10;
        this.ui.volumeControl.updateText(ZZFX.volume);
      }
    });

    const checkWallJoin = (x, y) => {
      const entityAbove = this.grid[x / 8][(y / 8) - 1].entity;
      if (entityAbove?.spriteLocation == sprites.wall) {
        entityAbove.spriteLocation = sprites.wallTop;
      }
      const entityBelow = this.grid[x / 8][(y / 8) + 1].entity;
      if (entityBelow?.spriteLocation == sprites.wall || entityBelow?.spriteLocation == sprites.wallTop) {
        this.troops[this.troops.length - 1].spriteLocation = sprites.wallTop;
      }
    };

    onPointer('down', (e) => {
      if (this.state == INTRO) {
        ZZFX.x.resume();
        if (!this.ui.startText.lines.length) {
          this.state = PLAYING;
        } else {
          this.ui.startText.next();
        }
      } else if (this.state == PLAYING) {
        const [x, y] = snapToGrid(e.offsetX / getCanvas().scale, e.offsetY / getCanvas().scale);
        const point = this.grid[x / 8][y / 8];
        if (this.ui.selected && e.button == 0 && point && !point.collidable && point != this.grid.goal) {
          if (this.ui.selected == sprites.bin && point.entity?.isTroop) {
            this.despawn(point.entity);
            // Refund some gold (just one?)
            this.gold++;
          } else if (!point.entity) {
            if (this.ui.selected == sprites.wall) {
              if (this.spawnTroop(this.ui.selected, x, y)) {
                checkWallJoin(x, y);
              }
            } else {
              this.spawnTroop(this.ui.selected, x, y);
            }
          }
        } else if (e.button == 2) {
          this.ui.selected = null;
        }
      }
    });
  }

  restart() {
    this.treasureHealth = 20;
    this.gold = 6;
    this.enemiesKilled = 0;
    this.waves = new Waves();
    this.wave = this.waves.next();
    this.state = PLAYING;
    this.chest.spriteLocation = sprites.chest;
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      this.despawn(this.enemies[i]);
    }
    for (let i = this.troops.length - 1; i >= 0; i--) {
      this.despawn(this.troops[i]);
    }
  }

  spawnEnemy(enemy) {
    this.enemies.push(enemy);
    this.tileEngine.add(enemy);
    const [x, y] = snapToGrid(enemy.x, enemy.y);
    this.grid[x / 8][y / 8].entity = enemy;
  }

  spawnTroop(type, x, y) {
    if (this.gold >= troopCost[type]) {
      const troop = Troop(type, x, y);
      this.gold -= troop.cost;
      this.troops.push(troop);
      this.tileEngine.add(troop);
      const [gridX, gridY] = snapToGrid(x, y);
      this.grid[gridX / 8][gridY / 8].entity = troop;
      this.troopsHired++;
      return true;
    }
    return false;
  }

  despawn(object) {
    untrack(object);
    removeFrom(this.enemies, object);
    removeFrom(this.troops, object);
    this.tileEngine.remove(object);
    const [x, y] = snapToGrid(object.x, object.y);
    this.grid[x / 8][y / 8].entity = null;
    if (object.spriteLocation == sprites.wall || object.spriteLocation == sprites.wallTop) {
      const aboveObject = this.grid[x / 8][(y / 8) - 1].entity;
      if (aboveObject?.spriteLocation == sprites.wallTop) {
        aboveObject.spriteLocation = sprites.wall;
      }
    }
    for (let i = this.ui.bars.length - 1; i >= 0; i--) {
      if (this.ui.bars[i].parent == object) {
        this.ui.bars.splice(i, 1);
      }
    }
    if ([sprites.soldier, sprites.archer, sprites.knight].includes(object.spriteLocation)) {
      ghost(object.x + 1, object.y + 1);
    }
  }

  update() {
    if (this.state == PLAYING) {
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        this.enemies[i].update();
      }
      for (let i = this.troops.length - 1; i >= 0; i--) {
        this.troops[i].update();
      }
      this.wave.update();
      if (this.treasureHealth <= 0) {
        this.state = LOSE;
        bigGold(this.grid.goal.x * 8 + 4, this.grid.goal.y * 8 + 4);
        this.chest.spriteLocation = sprites.chestOpen;
      }
      if (this.wave.isFinished() && !this.enemies.length) {
        // if (this.waves.isFinished()) {
        //   this.state = WIN;
        //   this.ui.winText.updateText();
        // } else {
        if (this.ui.waveText.timer == 300) {
          sound.waveFinished();
        }
        this.ui.waveText.update();
        if (--this.ui.waveText.timer < 0) {
          this.wave = this.waves.next();
          this.ui.waveText.timer = 300;
        }
        // }
      }
    }
    this.pool.update();
    this.ui.update();

    // Handle state transitions
    if (this.state != this.oldState) {
      if (this.state == PLAYING) {
        this.ui.troopSelection.children[0].children.forEach(button => button.disabled = false);
        this.ui.volumeButton.disabled = false;
      }
      if (this.state == LOSE) {
        sound.gameOver2();
        this.ui.selected = null;
        this.ui.troopSelection.children[0].children.forEach(button => button.disabled = true);
        this.ui.loseText.updateText();
      }
    }
    this.oldState = this.state;
  }

  render() {
    getContext().fillStyle = '#7e9432';
    getContext().fillRect(0, 0, getCanvas().width, getCanvas().height);
    this.tileEngine.render();
    this.pool.render();
    this.ui.render();
    if (this.debug) {
      this.text.forEach(t => t.render());
    }
    if (this.state == PLAYING) {
      if (this.wave.isFinished() && !this.enemies.length) {
        this.ui.waveText.render();
      }
    } else if (this.state == WIN) {
      this.ui.winScreen.render();
    } else if (this.state == LOSE) {
      this.ui.loseScreen.render();
    }
  }
}

export const game = new Game();
