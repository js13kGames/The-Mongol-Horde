import { randInt } from 'kontra';
import { Enemy } from './enemy';
import { game } from './game';
import { sprites } from './sprites';
import { pickRandom, removeFrom } from './util';

class Wave {
  constructor(spawnList) {
    this.spawnList = spawnList;
    this.spawnLocations = [
      [0 * 8, 8 * 8],
      [13 * 8, 0 * 8],
      [3 * 8, 2 * 8]
    ];
    this.spawnInterval = [120, 300];
    this.spawnTimer = 60;
  }

  update() {
    if (!this.isFinished() && --this.spawnTimer <= 0) {
      this.spawnTimer = randInt(...this.spawnInterval);
      const spawnable = pickRandom(this.spawnList);
      game.spawnEnemy(Enemy(spawnable.type, ...pickRandom(this.spawnLocations)));
      if (--spawnable.count <= 0) {
        removeFrom(this.spawnList, spawnable);
      }
    }
  }

  isFinished() {
    return !this.spawnList.length;
  }
}

const waves = [
  new Wave([
    { type: sprites.archer, count: 1 },
    { type: sprites.soldier, count: 2 }
  ]),
  new Wave([
    { type: sprites.knight, count: 4 }
  ])
];

export function nextWave() {
  return waves.shift();
}
