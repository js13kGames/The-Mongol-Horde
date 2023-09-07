import { Sprite, imageAssets, track } from 'kontra';
import { spriteFilePath, sprites } from './sprites';
import { game } from './game';
import { RangeIndicator } from './ui';
import { blood } from './particles';

function Troop(properties) {
  const troop = Sprite({
    image: imageAssets[spriteFilePath],
    maxRange: troopRange[properties.spriteLocation],
    attackTimer: 0,
    cost: troopCost[properties.spriteLocation],
    health: troopHealth[properties.spriteLocation],
    maxHealth: troopHealth[properties.spriteLocation],
    isTroop: true,
    damage: troopDamage[properties.spriteLocation],
    ...properties,

    update() {
      if (--this.attackTimer <= 0) {
        const enemy = this.getClosestEnemy(this);
        if (enemy) {
          this.attackTimer = this.attackInterval;
          // console.log('Attack', this, enemy);
          enemy.health -= this.damage;
          blood(enemy.x + 4, enemy.y + 4);
          if (enemy.health <= 0) {
            game.despawn(enemy);
            game.gold += 1;
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
      this.hovered = true;
    },

    onOut() {
      rangeIndicator.visible = false;
      this.hovered = false;
    },

    render() {
      this.draw();

      if (this.attackTimer > 0) {
        this.context.fillStyle = 'white';
        this.context.fillRect(1, this.height, Math.round((this.attackTimer / this.attackInterval) * 6), 1);
      }

      if (this.health < this.maxHealth) {
        this.context.fillStyle = 'red';
        this.context.fillRect(1, this.height + 1, 6, 1);
        this.context.fillStyle = 'green';
        this.context.fillRect(1, this.height + 1, Math.round((this.health / this.maxHealth) * 6), 1);
      }

      if (this.hovered && game.ui.selected == sprites.bin) {
        this.context.drawImage(imageAssets[spriteFilePath], ...sprites.cross, 0, 0, sprites.cross[2], sprites.cross[3]);
      }
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
    ...properties
  });
}

export function Archer(properties) {
  return Troop({
    spriteLocation: sprites.archer,
    attackInterval: 60,
    ...properties
  });
}

export function Knight(properties) {
  return Troop({
    spriteLocation: sprites.knight,
    attackInterval: 40,
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

export const troopRange = {
  [sprites.soldier]: 1.5,
  [sprites.knight]: 2.5,
  [sprites.archer]: 3.5,
  [sprites.wall]: 0
};

export const troopCost = {
  [sprites.soldier]: 2,
  [sprites.knight]: 5,
  [sprites.archer]: 3,
  [sprites.wall]: 1
};

export const troopHealth = {
  [sprites.soldier]: 6,
  [sprites.knight]: 10,
  [sprites.archer]: 4,
  [sprites.wall]: 10
};

export const troopDamage = {
  [sprites.soldier]: 2,
  [sprites.knight]: 4,
  [sprites.archer]: 2,
  [sprites.wall]: 0
};
