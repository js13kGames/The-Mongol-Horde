import { Sprite, imageAssets, track } from 'kontra';
import { spriteFilePath, sprites } from './sprites';
import { game } from './game';
import { RangeIndicator } from './ui';

function Troop(properties) {
  const troop = Sprite({
    image: imageAssets[spriteFilePath],
    maxRange: ranges[properties.spriteLocation],
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
      let bestDistance = (this.maxRange * 8) ** 2;
      let closest = null;
      for (const enemy of game.enemies) {
        const distanceSquared = Math.abs((this.x - enemy.x) ** 2 + (this.y - enemy.y) ** 2);
        if (distanceSquared < bestDistance) {
          closest = enemy;
        }
      }
      return closest;
    },

    onOver() {
      rangeIndicator.visible = true;
    },

    onOut() {
      rangeIndicator.visible = false;
    }
  });
  track(troop);
  const rangeIndicator = RangeIndicator();
  rangeIndicator.setRadius(troop.maxRange);
  rangeIndicator.visible = false;
  troop.addChild(rangeIndicator);
  return troop;
}

export function Soldier(properties) {
  return Troop({
    spriteLocation: sprites.soldier,
    attackInterval: 20,
    damage: 2,
    ...properties
  });
}

export function Archer(properties) {
  return Troop({
    spriteLocation: sprites.archer,
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

export const ranges = {
  [sprites.soldier]: 1.5,
  [sprites.archer]: 3.5,
  [sprites.wall]: 0
};
