import { Sprite, imageAssets } from 'kontra';
import { game } from './game';
import { pickRandom } from './util';
import { spriteFilePath } from './sprites';
import { gold } from './particles';

export function Enemy(spriteLocation, x, y) {
  const enemy = Sprite({
    x,
    y,
    image: imageAssets[spriteFilePath],
    spriteLocation,
    health: 10,
    maxHealth: 10,
    moveInterval: 30,
    moveTimer: 30,
    attackInterval: 60,
    attackTimer: 0,

    update() {
      const point = game.grid[this.x / 8][this.y / 8];
      const next = pickRandom(point.bestNeighbours);
      if (--this.moveTimer <= 0) {
        this.moveTimer = this.moveInterval;
        if (next != game.grid.goal) {
          // Move to next point
          this.x = next.x * 8;
          this.y = next.y * 8;
        }
      }
      if (next == game.grid.goal) {
        // Attack the treasure
        if (--this.attackTimer <= 0) {
          this.attackTimer = this.attackInterval;
          game.treasureHealth--;
          gold(next.x * 8 + 4, next.y * 8 + 4);
        }
      }
    }
  });
  enemy.addChild(Sprite({
    y: enemy.height + 1,
    render: function () {
      this.context.fillStyle = 'red';
      this.context.fillRect(1, 0, 6, 1);
      this.context.fillStyle = 'green';
      this.context.fillRect(1, 0, Math.round((this.parent.health / this.parent.maxHealth) * 6), 1);
    }
  }));
  return enemy;
}
