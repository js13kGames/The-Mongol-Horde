import { Sprite, imageAssets } from "kontra";
import { spriteFilePath, sprites } from './sprites';
import { game } from './game';

function Troop(properties) {
  return Sprite({
    image: imageAssets[spriteFilePath],
    maxRange: 256,
    attackTimer: properties.attackInterval,
    ...properties,

    update() {
      if (--this.attackTimer <= 0) {
        this.attackTimer = this.attackInterval;
        const enemy = this.getClosestEnemy(this);
        if (enemy) {
          // console.log('Attack', this, enemy);
          enemy.health -= this.damage;
          if (enemy.health <= 0) {
            game.despawn(enemy);
          }
        }
      }
    },

    getClosestEnemy() {
      let bestDistance = this.maxRange;
      let closest = null;
      for (const enemy of game.enemies) {
        const distanceSquared = Math.abs((this.x - enemy.x) ** 2 + (this.y - enemy.y) ** 2);
        if (distanceSquared < bestDistance) {
          closest = enemy;
        }
      }
      return closest;
    }
  });
}

export function Soldier(properties) {
  return Troop({
    spriteLocation: sprites.soldier,
    maxRange: 256,
    attackInterval: 20,
    damage: 2,
    ...properties
  });
}

export function Archer(properties) {
  return Troop({
    spriteLocation: sprites.archer,
    maxRange: 512,
    attackInterval: 60,
    damage: 2,
    ...properties
  });
}

export function Wall(properties) {
  return Troop({
    spriteLocation: sprites.wall,
    attackInterval: Infinity,
    ...properties
  });
}
