import { Sprite, imageAssets } from 'kontra';
import { game } from "./game";
import { pickRandom } from './util';
import { spriteFilePath, sprites } from './sprites';

export function Enemy(x, y) {
  const enemy = Sprite({
    x,
    y,
    image: imageAssets[spriteFilePath],
    spriteLocation: sprites.wizard,
    health: 10,
    maxHealth: 10,
    moveInterval: 30,
    moveTimer: 30,

    update() {
      if (--this.moveTimer <= 0) {
        this.moveTimer = this.moveInterval;
        const point = game.grid[this.x / 8][this.y / 8];
        if (point == game.grid.goal) {
          // Reached the goal
          game.despawn(this);
        } else {
          // Move to next point
          const next = pickRandom(point.bestNeighbours);
          this.x = next.x * 8;
          this.y = next.y * 8;
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
