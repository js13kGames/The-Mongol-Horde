import { Text } from 'kontra';
import { game } from "./game";

export class Grid {
  constructor(tileEngine) {
    this.width = tileEngine.width;
    this.height = tileEngine.height;
    this.points = [];
    for (let x = 0; x < this.width; x++) {
      this[x] = [];
      for (let y = 0; y < this.height; y++) {
        const point = {
          x,
          y,
          neighbours: [],
          collidable: false,
          cost: Infinity,
          bestNeighbours: []
        };
        this[x][y] = point;
        this.points.push(point);
      }
    }
    this.goal = this[20][13];
  }

  init() {
    // Create grid neighbours
    this.points.forEach(point => {
      if (point.y > 0) {
        point.neighbours.push(this[point.x][point.y - 1]);
      }
      if (point.x < this.width - 1) {
        point.neighbours.push(this[point.x + 1][point.y]);
      }
      if (point.y < this.height - 1) {
        point.neighbours.push(this[point.x][point.y + 1]);
      }
      if (point.x > 0) {
        point.neighbours.push(this[point.x - 1][point.y]);
      }
    });

    // Set collidable flag from tileset objects
    for (const [i, v] of game.tileEngine.layers[0].data.entries()) {
      const x = i % this.width;
      const y = Math.floor(i / this.width);
      if (v > 20) {
        this[x][y].collidable = true;
      }
    }

    this.updateFlowField();
  }

  updateFlowField() {
    // Reset costs
    this.points.forEach(point => {
      point.cost = Infinity;
    });
    this.goal.cost = 0;

    const frontier = [this.goal];
    const reached = [this.goal];
    while (frontier.length) {
      const current = frontier.shift();
      // console.log(`At ${current.x},${current.y}`);
      // console.log(`Has neighbours ${current.neighbours.map(n => `(${n.x},${n.y})`)}`);
      for (const next of current.neighbours) {
        if (!reached.includes(next) && !next.collidable) {
          // console.log(`Reached ${next.x},${next.y}`);
          next.cost = current.cost + 1;
          frontier.push(next);
          reached.push(next);
        }
      }
    }

    // Compute possible movement paths from each point to goal
    this.points.forEach(point => {
      const bestCost = Math.min(...point.neighbours.map(n => n.cost));
      point.bestNeighbours = point.neighbours.filter(n => n.cost == bestCost);
    });

    // Update debug text
    game.text = [];
    for (const point of reached) {
      game.text.push(Text({
        text: point.cost,
        font: '6px Arial',
        color: 'white',
        x: point.x * 8 + 4,
        y: point.y * 8 + 4,
        anchor: { x: 0.5, y: 0.5 },
        textAlign: 'center'
      }));
    }
  }
}
