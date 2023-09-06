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
      if (next == game.grid.goal) {
        // Attack the treasure
        if (--this.attackTimer <= 0) {
          this.attackTimer = this.attackInterval;
          game.treasureHealth--;
          gold(next.x * 8 + 4, next.y * 8 + 4);
        }
      } else if (next.entity?.isTroop) {
        // Attack the troop
        if (--this.attackTimer <= 0) {
          this.attackTimer = this.attackInterval;
          next.entity.health--;
          if (next.entity.health <= 0) {
            game.despawn(next.entity);
          }
        }
      } else if (--this.moveTimer <= 0) {
        // Try to move
        if (!next.entity) {
          // Move to next point
          this.moveTimer = this.moveInterval;
          this.x = next.x * 8;
          this.y = next.y * 8;
          point.entity = null;
          next.entity = this;
        }
      }
    },

    render() {
      this.draw();

      if (this.health < this.maxHealth) {
        this.context.fillStyle = 'red';
        this.context.fillRect(1, this.height + 1, 6, 1);
        this.context.fillStyle = 'green';
        this.context.fillRect(1, this.height + 1, Math.round((this.health / this.maxHealth) * 6), 1);
      }
    }
  });
  return enemy;
}
