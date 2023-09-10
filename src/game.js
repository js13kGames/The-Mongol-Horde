import { Pool, Sprite, TileEngine, getCanvas, getContext, imageAssets, onKey, onPointer, untrack } from 'kontra';
import map from './map';
import { Ui } from './ui';
import { Grid } from './grid';
import { removeFrom, snapToGrid } from './util';
import { spriteFilePath, sprites } from './sprites';
import { Troop } from './troop';
import { done, nextWave } from './wave';
import { INTRO, LOSE, PLAYING, WIN } from './state';
import { bigGold } from './particles';

class Game {
  constructor() {
    this.enemies = [];
    this.troops = [];
    this.spawners = [];
    this.text = [];
    this.debug = false;
    this.ui = new Ui();
    this.waveLeft = 10;
    this.state = INTRO;
    this.treasureHealth = 20;
    this.maxTreasureHealth = 20;
    this.gold = 6;
    this.enemiesKilled = 0;
  }

  init() {
    this.tileEngine = TileEngine(map);
    this.grid = new Grid(this.tileEngine);
    this.grid.init();
    this.ui.init();
    this.wave = nextWave();
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
      this.ui.selected = null;
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
        if (!this.ui.startText.lines.length) {
          this.state = PLAYING;
        } else {
          this.ui.startText.next();
        }
      } else if (this.state == PLAYING) {
        const [x, y] = snapToGrid(e.offsetX / getCanvas().scale, e.offsetY / getCanvas().scale);
        const point = this.grid[x / 8][y / 8];
        if (this.ui.selected && e.button == 0 && point /*&& !point.isPath*/ && !point.collidable && point != this.grid.goal) {
          if (this.ui.selected == sprites.wall) {
            if (this.spawnTroop(Troop(this.ui.selected, x, y))) {
              checkWallJoin(x, y);
            }
          } else if (this.ui.selected == sprites.bin) {
            if (point.entity?.isTroop) {
              this.despawn(point.entity);
              // Refund some gold (just one?)
              this.gold++;
            }
          } else {
            this.spawnTroop(Troop(this.ui.selected, x, y));
          }
        } else if (e.button == 2) {
          this.ui.selected = null;
        }
      }
    });
  }

  spawnEnemy(enemy) {
    this.waveLeft--;
    this.enemies.push(enemy);
    this.tileEngine.add(enemy);
    const [x, y] = snapToGrid(enemy.x, enemy.y);
    this.grid[x / 8][y / 8].entity = enemy;
  }

  spawnTroop(troop) {
    if (this.gold >= troop.cost) {
      this.gold -= troop.cost;
      this.troops.push(troop);
      this.tileEngine.add(troop);
      const [x, y] = snapToGrid(troop.x, troop.y);
      this.grid[x / 8][y / 8].entity = troop;
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
  }

  update() {
    if (this.state == PLAYING) {
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        this.enemies[i].update();
      }
      for (let i = this.troops.length - 1; i >= 0; i--) {
        this.troops[i].update();
      }
      this.spawners.forEach(spawner => spawner.update());
      this.wave.update();
      if (this.treasureHealth <= 0) {
        this.state = LOSE;
        bigGold(this.grid.goal.x * 8 + 4, this.grid.goal.y * 8 + 4);
        this.chest.spriteLocation = sprites.chestOpen;
      }
      if (this.wave.isFinished() && !this.enemies.length) {
        if (done()) {
          this.state = WIN;
          this.ui.winText.updateText();
        } else {
          this.ui.waveText.update();
          if (--this.ui.waveText.timer < 0) {
            this.wave = nextWave();
            this.ui.waveText.timer = 300;
          }
        }
      }
    }
    this.pool.update();
    this.ui.update();
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
      this.ui.winText.render();
    } else if (this.state == LOSE) {
      this.ui.gameOverText.render();
    }
  }
}

export const game = new Game();
