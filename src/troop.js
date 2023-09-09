import { Sprite, imageAssets, track } from 'kontra';
import { spriteFilePath, sprites } from './sprites';
import { game } from './game';
import { RangeIndicator } from './ui';
import { blood } from './particles';

export function Troop(spriteLocation, x, y) {
  const troop = Sprite({
    x,
    y,
    image: imageAssets[spriteFilePath],
    spriteLocation,
    maxRange: troopRange[spriteLocation],
    attackTimer: 0,
    attackInterval: troopAttackSpeed[spriteLocation],
    cost: troopCost[spriteLocation],
    health: troopHealth[spriteLocation],
    maxHealth: troopHealth[spriteLocation],
    isTroop: true,
    damage: troopDamage[spriteLocation],

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
            game.enemiesKilled++;
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
  [sprites.soldier]: 10,
  [sprites.knight]: 20,
  [sprites.archer]: 8,
  [sprites.wall]: 20
};

export const troopDamage = {
  [sprites.soldier]: 2,
  [sprites.knight]: 4,
  [sprites.archer]: 2,
  [sprites.wall]: 0
};

export const troopAttackSpeed = {
  [sprites.soldier]: 30,
  [sprites.knight]: 60,
  [sprites.archer]: 60,
  [sprites.wall]: Infinity
};
