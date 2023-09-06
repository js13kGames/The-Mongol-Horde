import { game } from './game';
import { random } from './util';

export function blood(x, y) {
  for (let i = 0; i < 10; i++) {
    game.pool.get({
      x,
      y,
      floor: y + 4,
      width: 1,
      height: 1,
      color: 'red',
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
