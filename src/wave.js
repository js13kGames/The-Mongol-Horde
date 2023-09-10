import { randInt } from 'kontra';
import { Enemy } from './enemy';
import { game } from './game';
import { sprites } from './sprites';
import { pickRandom, removeFrom } from './util';

class Wave {
  constructor(spawnInterval, spawnList) {
    this.spawnList = spawnList;
    this.spawnLocations = [
      [0 * 8, 9 * 8],
      [13 * 8, 0 * 8],
      [3 * 8, 2 * 8]
    ];
    this.spawnInterval = spawnInterval;
    this.spawnTimer = 0;
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
export class Waves {
  constructor() {
    this.list = [
      new Wave([180, 180], [
        { type: sprites.badSoldier, count: 2 }
      ]),
      // new Wave([120, 240], [
      //   { type: sprites.badSoldier, count: 4 },
      //   { type: sprites.badArcher, count: 1 }
      // ]),
      // new Wave([60, 120], [
      //   { type: sprites.wolf, count: 6 }
      // ]),
      // new Wave([30, 30], [
      //   { type: sprites.badKnight, count: 2 }
      // ]),
      // new Wave([120, 180], [
      //   { type: sprites.badSoldier, count: 4 },
      //   { type: sprites.badKnight, count: 2 }
      // ]),
      // new Wave([60, 120], [
      //   { type: sprites.wolf, count: 6 },
      //   { type: sprites.badSoldier, count: 4 }
      // ])
    ];
  }

  next() {
    return this.list.shift();
  }

  isFinished() {
    return this.list.length == 0;
  }
}
