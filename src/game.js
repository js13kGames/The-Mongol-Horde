import { TileEngine, getCanvas, getContext, onKey, onPointer } from 'kontra';
import map from './map';
import { ToolbarButton, Ui } from "./ui";
import { Grid } from './grid';
import { snapToGrid } from './util';
import { Spawner } from './spawner';
import { sprites } from './sprites';
import { Soldier, Archer, Wall } from './troop';

class Game {
  constructor() {
    this.enemies = [];
    this.troops = [];
    this.spawners = [];
    this.text = [];
    this.debug = false;
    this.ui = new Ui();
  }

  init() {
    this.tileEngine = TileEngine(map);
    this.grid = new Grid(this.tileEngine);
    this.grid.init();
    this.ui.init();

    this.createSpawner(0, 8);
    this.createSpawner(13, 0);
    this.createSpawner(3, 2);

    onKey('d', () => {
      this.debug = !this.debug;
    });

    onKey('esc', () => {
      this.ui.selected = null;
    });

    onPointer('down', (e, object) => {
      if (!(object instanceof ToolbarButton)) {
        const [x, y] = snapToGrid(e.offsetX / getCanvas().scale, e.offsetY / getCanvas().scale);
        const tile = this.tileEngine.layers[0].data[(x / 8) + (y / 8) * this.tileEngine.width];
        const point = this.grid[x / 8][y / 8];
        if (this.ui.selected && e.button == 0 && (tile < 11 || tile > 20) && !point.collidable && point != this.grid.goal) {
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

  createSpawner(x, y) {
    this.spawners.push(Spawner(x, y));
  };

  spawnEnemy(enemy) {
    this.enemies.push(enemy);
    this.tileEngine.add(enemy);
  };

  spawnTroop(troop) {
    this.troops.push(troop);
    this.tileEngine.add(troop);
  };

  despawn(object) {
    let index = this.enemies.indexOf(object);
    if (index >= 0) {
      this.enemies.splice(index, 1);
    }
    index = this.troops.indexOf(object);
    if (index >= 0) {
      this.troops.splice(index, 1);
    }
    this.tileEngine.remove(object);
  };

  update() {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      this.enemies[i].update();
    }
    for (let i = this.troops.length - 1; i >= 0; i--) {
      this.troops[i].update();
    }
    this.spawners.forEach(spawner => spawner.update());
  };

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
