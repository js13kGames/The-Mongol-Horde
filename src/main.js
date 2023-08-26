import { init, Sprite, GameLoop, TileEngine, load, dataAssets, imageAssets, keyPressed, initKeys, Text, onKey, initPointer, onPointer, Pool, Grid, Button, ButtonClass, getPointer, GameObjectClass, GameObject, randInt } from 'kontra';
import map from './map';
import tileset from './tileset';
import { game } from './game';

const { canvas, context } = init();
initKeys();
initPointer({
  radius: 1
});

canvas.width = 200;
canvas.height = 152;

// Don't open right click menu
canvas.oncontextmenu = () => false;

function resizeCanvas() {
  const ratioWidth = window.innerWidth / canvas.width;
  const ratioHeight = window.innerHeight / canvas.height;
  let minRatio = Math.min(ratioWidth, ratioHeight);
  if (minRatio > 1) {
    minRatio = Math.floor(minRatio);
  }
  canvas.style.width = `${minRatio * canvas.width}px`;
  canvas.style.height = `${minRatio * canvas.height}px`;
  canvas.scale = minRatio;
}
window.addEventListener('resize', () => resizeCanvas());
resizeCanvas();

const spriteFilePath = 'i.png';
const tilesetFilePath = 'ts';
dataAssets[location.href + tilesetFilePath] = tileset;
load(spriteFilePath).then(() => {
  game.init();



  game.createSpawner(0, 8);
  game.createSpawner(13, 0);
  game.createSpawner(3, 2);

  onKey('d', () => {
    game.debug = !debug;
  });

  onKey('esc', () => {
    game.ui.selected = null;
  });

  onPointer('down', (e, object) => {
    if (!(object instanceof ToolbarButton)) {
      const [x, y] = snapToGrid(e.offsetX / canvas.scale, e.offsetY / canvas.scale);
      const tile = game.tileEngine.layers[0].data[(x/8) + (y/8) * game.tileEngine.width];
      if (game.ui.selected && e.button == 0 && (tile < 11 || tile > 20) && !game.grid[x/8][y/8].collidable && !(x/8 == goal.x && y/8 == goal.y)) {
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



  function getClosestEnemy(troop) {
    let bestDistance = troop.maxRange;
    let closest = null;
    for (const enemy of enemies) {
      const distanceSquared = Math.abs((troop.x - enemy.x) ** 2 + (troop.y - enemy.y) ** 2);
      if (distanceSquared < bestDistance) {
        closest = enemy;
      }
    }
    return closest;
  }

  function attack(troop, enemy) {
    console.log('Attack', troop, enemy);
    enemy.health -= 2;
    pool.get({
      x: enemy.x + enemy.width / 2,
      y: enemy.y + enemy.height / 2,
      // anchor: { x: 0.5, y: 0.5 },
      image: spriteImage,
      spriteLocation: [19, 9, 1, 1],
      ttl: 40,
      update: function (dt) {
        this.advance(dt);
        if (this.ttl == 30) {
          this.spriteLocation = [16, 8, 3, 3];
          this.x--;
          this.y--;
        }
        if (this.ttl == 15) {
          this.spriteLocation = [19, 8, 1, 1];
          this.x++;
          this.y++;
        }
        if (this.ttl == 10) {
          this.spriteLocation = [20, 8, 1, 1];
        }
      }
    })
  }

  const pool = Pool({
    create: Sprite
  })







  const loop = GameLoop({
    update: function () {
      for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        if (--enemy.moveTimer <= 0) {
          enemy.moveTimer = enemy.moveInterval;
          const x = enemy.x / 8;
          const y = enemy.y / 8;

          if (grid[x][y].cost == 0) {
            // Reached the goal
            tileEngine.remove(enemy);
            enemies.splice(i, 1);
          }

          const next = pickRandom(grid[x][y].bestNeighbours);
          enemy.x = next.x * 8;
          enemy.y = next.y * 8;
        }
      }

      // for (const troop of troops) {
      //   if (--troop.attackTimer <= 0) {
      //     troop.attackTimer = troop.attackInterval;
      //     const enemy = getClosestEnemy(troop);
      //     if (enemy) {
      //       attack(troop, enemy);
      //       if (enemy.health <= 0) {
      //         tileEngine.remove(enemy);
      //         const index = enemies.indexOf(enemy);
      //         if (index >= 0) {
      //           enemies.splice(index, 1);
      //         }
      //       }
      //     }
      //   }
      // }

      troops.forEach(troop => troop.weaponTimer--);

      spawners.forEach(spawner => spawner.update());

      pool.update();
    },
    render: function () {
      context.fillStyle = '#7e9432';
      context.fillRect(0, 0, canvas.width, canvas.height);
      tileEngine.render();
      pool.render();
      if (selected != null) {
        const pointer = getPointer();
        const [x, y] = snapToGrid(pointer.x, pointer.y);
        selectedSprite.x = x;
        selectedSprite.y = y;
        selectedSprite.spriteLocation = selected;
        selectedSprite.render();
      }
      toolbarBackground.render();
      toolbar.render();
      if (debug) flowFieldText.forEach(t => t.render());
    }
  });

  loop.start();
});
