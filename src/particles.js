import { imageAssets } from 'kontra';
import { game } from './game';
import { spriteFilePath, sprites } from './sprites';
import { random } from './util';

export function blood(x, y) {
  for (let i = 0; i < 10; i++) {
    game.pool.get({
      x,
      y,
      floor: y + 4,
      width: 1,
      height: 1,
      color: '#b74132',
      dx: random(-0.3, 0.3),
      dy: random(-0.5, 0.1),
      ddy: 0.02,
      ttl: random(5, 30),
      update() {
        this.advance();
        if (this.y > this.floor) {
          this.y = this.floor;
          this.dy = 0;
          this.ddy = 0;
        }
      }
    });
  }
}

export function stone(x, y) {
  for (let i = 0; i < 10; i++) {
    game.pool.get({
      x,
      y,
      floor: y + 4,
      width: 1,
      height: 1,
      color: '#6f6e72',
      dx: random(-0.3, 0.3),
      dy: random(-0.5, 0.1),
      ddy: 0.02,
      ttl: random(5, 30),
      update() {
        this.advance();
        if (this.y > this.floor) {
          this.y = this.floor;
          this.dy = 0;
          this.ddy = 0;
        }
      }
    });
  }
}

export function gold(x, y) {
  for (let i = 0; i < 10; i++) {
    game.pool.get({
      x,
      y,
      floor: y + 4,
      width: 2,
      height: 2,
      color: '#ebb85b',
      dx: random(-0.3, 0.3),
      dy: random(-0.5, 0.1),
      ddy: 0.02,
      ttl: random(20, 40),
      update() {
        this.advance();
        if (this.y > this.floor) {
          this.y = this.floor;
          this.dy = 0;
          this.ddy = 0;
        }
      }
    });
  }
}

export function bigGold(x, y) {
  for (let i = 0; i < 60; i++) {
    game.pool.get({
      x,
      y,
      floor: y + 4,
      onFloor: false,
      width: 2,
      height: 2,
      color: '#ebb85b',
      dx: random(-0.4, 0.4),
      dy: random(-0.8, 0.1),
      ddy: 0.01,
      ttl: Infinity,
      update() {
        if (!this.onFloor) {
          this.ddx = this.dx * -0.01;
        } else {
          this.ddx = this.dx * -0.1;
        }
        if (this.dx != 0 && Math.abs(this.dx) < 0.01) {
          this.dx = 0;
          this.ddx = 0;
        }
        this.advance();
        if (this.y > this.floor) {
          this.onFloor = true;
          this.y = this.floor;
          this.dy = 0;
          this.ddy = 0;
          this.ttl = random(60, 120);
        }
      }
    });
  }
}

export function ghost(x, y) {
  game.pool.get({
    x,
    y,
    image: imageAssets[spriteFilePath],
    spriteLocation: sprites.ghost,
    ttl: 60,
    dy: -0.1,
    opacity: 0.2,
    color: null,
    update() {
      this.advance();
      this.opacity -= 0.003;
    },
    render() {
      // Translate to nearest integer y
      this.context.translate(0, Math.round(this.y) - this.y);
      this.draw();
    }
  });
}
