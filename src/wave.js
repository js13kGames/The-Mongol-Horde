import { randInt } from 'kontra';
import { Enemy } from './enemy';
import { game } from './game';
import { spriteNames, sprites } from './sprites';
import { pickRandom, removeFrom } from './util';

const spawnLocations = [
  [0 * 8, 9 * 8],
  [13 * 8, 0 * 8],
  [3 * 8, 2 * 8]
];

const spawnCost = [
  { type: sprites.badSoldier, cost: 2 },
  { type: sprites.badRouge, cost: 3 },
  { type: sprites.badKnight, cost: 5 },
  { type: sprites.wolf, cost: 1 }
];

const intervalCost = [
  { type: [100, 180], cost: 1 },
  { type: [60, 160], cost: 2 },
  { type: [40, 100], cost: 5 },
  { type: [30, 60], cost: 10 }
];

class Wave {
  constructor(spawnInterval, spawnList) {
    this.spawnList = spawnList;
    this.spawnInterval = spawnInterval;
    this.spawnTimer = 0;
  }

  update() {
    if (!this.isFinished() && --this.spawnTimer <= 0) {
      this.spawnTimer = randInt(...this.spawnInterval);
      const spawnable = pickRandom(this.spawnList);
      game.spawnEnemy(Enemy(spawnable.type, ...pickRandom(spawnLocations)));
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
    this.waveNumber = 0;
    this.list = [
      new Wave([180, 180], [
        { type: sprites.badSoldier, count: 2 } // 4
      ]),
      new Wave([120, 240], [
        { type: sprites.badSoldier, count: 3 }, // 6
        { type: sprites.badRouge, count: 2 } // 6 = 12
      ]),
      new Wave([60, 120], [
        { type: sprites.wolf, count: 8 } // 6
      ]),
      new Wave([30, 30], [
        { type: sprites.badKnight, count: 2 } // 10
      ]),
      new Wave([120, 180], [
        { type: sprites.badSoldier, count: 4 }, // 8
        { type: sprites.badKnight, count: 2 } // 10 = 18
      ]),
      new Wave([60, 120], [
        { type: sprites.wolf, count: 6 }, // 6
        { type: sprites.badSoldier, count: 4 }, // 8
        { type: sprites.badRouge, count: 2 } // 6 = 20
      ])
    ];
  }

  next() {
    this.waveNumber++;

    if (this.list.length) {
      return this.list.shift();
    }

    let allowance = 32 * Math.E ** (0.1 * this.waveNumber) - 38;
    console.log(allowance);
    const interval = pickRandom(intervalCost);
    allowance -= interval.cost;
    const spawnList = [];
    while (allowance > 0) {
      const enemy = pickRandom(spawnCost);
      allowance -= enemy.cost;
      const listItem = spawnList.find(item => item.type == enemy.type);
      if (listItem) {
        listItem.count++;
      } else {
        spawnList.push({
          type: enemy.type,
          count: 1
        });
      }
    }
    console.log(`[${interval.type[0]}, ${interval.type[1]}] ${spawnList.map(item => `${spriteNames[item.type]}: ${item.count}`).join(', ')}`);
    return new Wave(interval.type, spawnList);
  }

  isFinished() {
    return this.list.length == 0;
  }
}
