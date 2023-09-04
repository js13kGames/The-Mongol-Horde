import { TileEngine, getCanvas, getContext, onKey, onPointer, untrack } from 'kontra';
import map from './map';
import { ToolbarButton, Ui } from './ui';
import { Grid } from './grid';
import { removeFrom, snapToGrid } from './util';
import { sprites } from './sprites';
import { Soldier, Archer, Wall, Knight } from './troop';
import { nextWave } from './wave';
import { LOSE, PLAYING, WIN } from './state';
import { write } from './font';

class Game {
  constructor() {
    this.enemies = [];
    this.troops = [];
    this.spawners = [];
    this.text = [];
    this.debug = false;
    this.ui = new Ui();
    this.waveLeft = 10;
    this.state = PLAYING;
    this.treasureHealth = 4;
    this.maxTreasureHealth = 4;
    this.gold = 10;
  }

  init() {
    this.tileEngine = TileEngine(map);
    this.grid = new Grid(this.tileEngine);
    this.grid.init();
    this.ui.init();
    this.wave = nextWave();

    onKey('d', () => {
      this.debug = !this.debug;
    });

    onKey('esc', () => {
      this.ui.selected = null;
    });

    const checkWallJoin = (x, y) => {
      const wallAbove = this.troops.find(troop => troop.x == x && troop.y == y - 8);
      if (wallAbove) {
        wallAbove.spriteLocation = sprites.wallTop;
      }
      if (this.troops.find(troop => troop.x == x && troop.y == y + 8)) {
        this.troops[this.troops.length - 1].spriteLocation = sprites.wallTop;
      }
    };

    onPointer('down', (e, object) => {
      if (!(object instanceof ToolbarButton)) {
        const [x, y] = snapToGrid(e.offsetX / getCanvas().scale, e.offsetY / getCanvas().scale);
        const point = this.grid[x / 8][y / 8];
        if (this.ui.selected && e.button == 0 && point && !point.isPath && !point.collidable && point != this.grid.goal) {
          const properties = { x, y };
          switch (this.ui.selected) {
            case sprites.soldier:
              this.spawnTroop(Soldier(properties));
              break;
            case sprites.archer:
              this.spawnTroop(Archer(properties));
              break;
            case sprites.wall:
              this.spawnTroop(Wall(properties));
              checkWallJoin(x, y);
              break;
            case sprites.knight:
              this.spawnTroop(Knight(properties));
              break;
          }
          point.collidable = true;
          this.grid.updateFlowField();
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
  }

  spawnTroop(troop) {
    if (this.gold >= troop.cost) {
      this.gold -= troop.cost;
      this.troops.push(troop);
      this.tileEngine.add(troop);
    }
  }

  despawn(object) {
    untrack(object);
    removeFrom(this.enemies, object);
    removeFrom(this.troops, object);
    this.tileEngine.remove(object);
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
      }
      if (this.wave.isFinished() && !this.enemies.length) {
        console.log('Wave finished!');
        this.wave = nextWave();
        if (!this.wave) {
          this.state = WIN;
        }
      }
    }
  }

  render() {
    getContext().fillStyle = '#7e9432';
    getContext().fillRect(0, 0, getCanvas().width, getCanvas().height);
    this.tileEngine.render();
    this.ui.render();
    if (this.debug) {
      this.text.forEach(t => t.render());
    }
    if (this.state == WIN) {
      write('THE GOLD IS SAFE!', (200 / 2) - (72 / 2), 152 / 4);
    } else if (this.state == LOSE) {
      write('GAME OVER!', (200 / 2) - (46 / 2), 152 / 4);
    }
  }
}

export const game = new Game();
