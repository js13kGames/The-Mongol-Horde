import { TileEngine, getCanvas, getContext, onKey, onPointer, untrack } from 'kontra';
import map from './map';
import { ToolbarButton, Ui } from './ui';
import { Grid } from './grid';
import { removeFrom, snapToGrid } from './util';
import { sprites } from './sprites';
import { Soldier, Archer, Wall } from './troop';
import { nextWave } from './wave';
import { LOSE, PLAYING, WIN } from './state';

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
    this.treasureHealth = 2;
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

    onPointer('down', (e, object) => {
      if (!(object instanceof ToolbarButton)) {
        const [x, y] = snapToGrid(e.offsetX / getCanvas().scale, e.offsetY / getCanvas().scale);
        const point = this.grid[x / 8][y / 8];
        if (this.ui.selected && e.button == 0 && !point.isPath && !point.collidable && point != this.grid.goal) {
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
              break;
          }
          point.collidable = true;
          this.grid.updateFlowField();
        } else if (e.button == 2) {
          this.spawnEnemy(x, y);
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
    this.troops.push(troop);
    this.tileEngine.add(troop);
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
    } else if (this.state == WIN) {
      console.log('Win!');
    } else if (this.state == LOSE) {
      console.log('Game over');
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
  }
}

export const game = new Game();
