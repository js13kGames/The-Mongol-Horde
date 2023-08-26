import { Game } from './game';
import { Enemy } from './enemy';

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
        Game.spawnEnemy(Enemy(this.x, this.y));
      }
    }
  })
}
