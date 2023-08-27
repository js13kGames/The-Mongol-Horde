import { init, GameLoop, load, dataAssets, initKeys, initPointer } from 'kontra';
import tileset from './tileset';
import { game } from './game';
import { spriteFilePath } from './sprites';

const { canvas } = init();
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

const tilesetFilePath = 'ts';
dataAssets[location.href + tilesetFilePath] = tileset;
load(spriteFilePath).then(() => {
  game.init();

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

  // const pool = Pool({
  //   create: Sprite
  // });

  const loop = GameLoop({
    update: function () {
      game.update();

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

      // troops.forEach(troop => troop.weaponTimer--);

      // pool.update();
    },
    render: function () {
      // pool.render();
      game.render();
    }
  });

  loop.start();
});
