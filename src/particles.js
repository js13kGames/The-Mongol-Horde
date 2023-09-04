import { game } from './game';
import { random } from './util';

export function blood(x, y) {
  for (let i = 0; i < 10; i++) {
    game.pool.get({
      x,
      y,
      width: 1,
      height: 1,
      color: 'red',
      dx: random(-0.3, 0.3),
      dy: random(-0.5, 0.1),
      ddy: 0.02,
      ttl: random(5, 30)
    });
  }
}

export function gold(x, y) {
  for (let i = 0; i < 10; i++) {
    game.pool.get({
      x,
      y,
      width: 2,
      height: 2,
      color: '#ebb85b',
      dx: random(-0.3, 0.3),
      dy: random(-0.5, 0.1),
      ddy: 0.02,
      ttl: random(5, 30)
    });
  }
}

export function bigGold(x, y) {
  for (let i = 0; i < 60; i++) {
    game.pool.get({
      x,
      y,
      width: 2,
      height: 2,
      color: '#ebb85b',
      dx: random(-0.5, 0.5),
      dy: random(-0.8, 0.1),
      ddy: 0.01,
      ttl: random(40, 100)
    });
  }
}
