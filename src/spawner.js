import { game } from './game';
import { Enemy } from './enemy';
import { GameObject, randInt } from 'kontra';

export function Spawner(x, y) {
  return GameObject({
    x: x * 8,
    y: y * 8,
    spawnInterval: [200, 400],
    spawnTimer: 0,
    update: function () {
      this.advance();
      if (--this.spawnTimer <= 0) {
        this.spawnTimer = randInt(...this.spawnInterval);
        game.spawnEnemy(Enemy(this.x, this.y));
      }
    }
  })
}
