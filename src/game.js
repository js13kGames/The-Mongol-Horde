import { GameObject, TileEngine, getCanvas } from 'kontra';
import map from './map';
import { Ui } from "./ui";
import { Grid } from './grid';

class Game {
  enemies = [];
  troops = [];
  spawners = [];
  tileEngine = TileEngine(map);
  grid = Grid();
  text = [];
  debug = false;
  ui = new Ui();

  init() {
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
        const tile = this.tileEngine.layers[0].data[(x/8) + (y/8) * this.tileEngine.width];
        const point = this.grid[x/8][y/8];
        if (this.ui.selected && e.button == 0 && (tile < 11 || tile > 20) && !point.collidable && point != this.grid.goal) {
          const troop = Sprite({
            x: x,
            y: y,
            image: spriteImage,
            spriteLocation: selected,
            maxRange: 256,
            attackInterval: 30,
            attackTimer: 30
          });
          tileEngine.add(troop);
          troops.push(troop);
          grid[x/8][y/8].collidable = true;
          updateflowField();
        } else if (e.button == 2) {
          spawnEnemy(x, y);
        }
      }
    });
  }

  createSpawner(x, y) {
    spawners.push();
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
    this.tileEngine.render();
    this.ui.render();
    if (this.debug) {
      this.text.forEach(t => t.render());
    }
  }
}

export const game = new Game();
