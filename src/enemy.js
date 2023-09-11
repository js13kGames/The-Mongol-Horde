import { Sprite, imageAssets } from 'kontra';
import { game } from './game';
import { pickRandom } from './util';
import { spriteFilePath, sprites } from './sprites';
import { blood, gold, stone } from './particles';
import { HealthBar } from './healthBar';

export function Enemy(spriteLocation, x, y) {
  const enemy = Sprite({
    x,
    y,
    image: imageAssets[spriteFilePath],
    spriteLocation,
    health: enemyHealth[spriteLocation],
    maxHealth: enemyHealth[spriteLocation],
    moveInterval: enemySpeed[spriteLocation],
    moveTimer: enemySpeed[spriteLocation],
    attackInterval: enemyAttackSpeed[spriteLocation],
    attackTimer: 0,
    damage: enemyDamage[spriteLocation],

    update() {
      const point = game.grid[this.x / 8][this.y / 8];
      const next = pickRandom(point.bestNeighbours);
      if (next == game.grid.goal) {
        // Attack the treasure
        if (--this.attackTimer <= 0) {
          this.attackTimer = this.attackInterval;
          game.treasureHealth -= this.damage;
          gold(next.x * 8 + 4, next.y * 8 + 4);
        }
      } else if (next.entity?.isTroop) {
        // Attack the troop
        if (--this.attackTimer <= 0) {
          this.attackTimer = this.attackInterval;
          next.entity.health -= this.damage;
          if (next.entity.spriteLocation == sprites.wall) {
            stone(next.entity.x + 4, next.entity.y + 4);
          } else {
            blood(next.entity.x + 4, next.entity.y + 4);
          }
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
    }
  });
  enemy.addChild(HealthBar(() => enemy.health, { max: enemy.maxHealth }));
  enemy.addChild(HealthBar(() => enemy.attackTimer, {
    y: 8,
    max: enemy.attackInterval,
    backgroundColour: 'transparent',
    foregroundColour: 'white'
  }));
  return enemy;
}

export const enemyHealth = {
  [sprites.wolf]: 5,
  [sprites.badSoldier]: 10,
  [sprites.badRouge]: 8,
  [sprites.badKnight]: 20
};

export const enemySpeed = {
  [sprites.wolf]: 20,
  [sprites.badSoldier]: 50,
  [sprites.badRouge]: 30,
  [sprites.badKnight]: 80
};

export const enemyDamage = {
  [sprites.wolf]: 1,
  [sprites.badSoldier]: 3,
  [sprites.badRouge]: 2,
  [sprites.badKnight]: 5
};

export const enemyAttackSpeed = {
  [sprites.wolf]: 40,
  [sprites.badSoldier]: 35,
  [sprites.badRouge]: 25,
  [sprites.badKnight]: 60
};
