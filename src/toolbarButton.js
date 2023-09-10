import { ButtonClass, Sprite, imageAssets } from 'kontra';
import { getSize, write } from './font';
import { game } from './game';
import { spriteFilePath, sprites } from './sprites';
import { troopAttackSpeed, troopCost, troopDamage, troopHealth, troopRange } from './troop';

export class ToolbarButton extends ButtonClass {
  constructor(spriteLocation) {
    super({
      text: {
        font: '0px none'
      },
      image: imageAssets[spriteFilePath],
      spriteLocation
    });
    this.tooltip = Sprite({
      x: 4,
      y: spriteLocation == sprites.wall ? -18 : -39,
      render() {
        const cost = troopCost[spriteLocation].toString();
        const health = troopHealth[spriteLocation].toString();
        const damage = troopDamage[spriteLocation].toString();
        const range = Math.floor(troopRange[spriteLocation]).toString();
        const attackSpeed = (troopAttackSpeed[spriteLocation] / 10).toString();
        const textSize = spriteLocation == sprites.wall
          ? Math.max(getSize(cost).x, getSize(health).x)
          : Math.max(getSize(cost).x, getSize(health).x, getSize(damage).x, getSize(range).x, getSize(attackSpeed).x);
        const x = Math.floor(textSize / -2) - 6;
        this.context.fillStyle = 'rgb(70, 70, 70)';
        this.context.fillRect(x, 0, 12 + textSize, spriteLocation == sprites.wall ? 16 : 37);
        this.context.drawImage(imageAssets[spriteFilePath], ...sprites.coin, x + 2, 2, 6, 6);
        this.context.drawImage(imageAssets[spriteFilePath], ...sprites.heart, x+2, 9, 6, 6);
        write(cost, x + 10, 2);
        write(health, x + 10, 9);
        if (spriteLocation != sprites.wall) {
          this.context.drawImage(imageAssets[spriteFilePath], ...sprites.damage, x + 2, 16, 6, 6);
          this.context.drawImage(imageAssets[spriteFilePath], ...sprites.range, x + 2, 23, 6, 6);
          this.context.drawImage(imageAssets[spriteFilePath], ...sprites.cooldown, x + 2, 30, 6, 6);
          write(damage, x + 10, 16);
          write(range, x + 10, 23);
          write(attackSpeed, x + 10, 30);
        }
      }
    });
  }

  onDown() {
    game.ui.selected = this.spriteLocation;
  }

  draw() {
    if (this.hovered) {
      this.context.fillStyle = 'rgba(255, 255, 255, 0.1)';
      this.context.fillRect(-1, -1, this.width + 2, this.height + 2);
      this.tooltip.render();
    }
    if (game.ui.selected == this.spriteLocation) {
      this.context.fillStyle = 'rgba(255, 255, 255, 0.2)';
      this.context.fillRect(-1, -1, this.width + 2, this.height + 2);
    }
    super.draw();
  }
}

export class BinButton extends ButtonClass {
  constructor() {
    super({
      text: {
        font: '0px none'
      },
      image: imageAssets[spriteFilePath],
      spriteLocation: sprites.bin
    });
  }

  onDown() {
    game.ui.selected = sprites.bin;
  }

  draw() {
    if (this.hovered) {
      this.context.fillStyle = 'rgba(255, 255, 255, 0.1)';
      this.context.fillRect(-1, -1, this.width + 2, this.height + 2);
    }
    if (game.ui.selected == this.spriteLocation) {
      this.context.fillStyle = 'rgba(255, 255, 255, 0.2)';
      this.context.fillRect(-1, -1, this.width + 2, this.height + 2);
    }
    super.draw();
  }
}
