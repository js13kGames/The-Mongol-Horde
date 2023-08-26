import { game } from "./game";

export function Grid() {
  // Initialise grid
  const grid = [...Array(tileEngine.width).keys()].map(i => []);

  for (let x = 0; x < game.tileEngine.width; x++) {
    for (let y = 0; y < game.tileEngine.height; y++) {
      grid[x][y] = {
        x,
        y,
        neighbours: [],
        collidable: false,
        cost: Infinity,
        bestNeighbours: []
      }
    }
  }

  // Create grid neighbours
  grid.forEach(gridList => gridList.forEach(point => {
    if (point.y > 0) {
      point.neighbours.push(grid[point.x][point.y - 1]);
    }
    if (point.x < tileEngine.width - 1) {
      point.neighbours.push(grid[point.x + 1][point.y]);
    }
    if (point.y < tileEngine.height - 1) {
      point.neighbours.push(grid[point.x][point.y + 1]);
    }
    if (point.x > 0) {
      point.neighbours.push(grid[point.x - 1][point.y]);
    }
  }));

  // Set collidable flag from tileset objects
  for (const [i, v] of game.tileEngine.layers[0].data.entries()) {
    const x = i % game.tileEngine.width;
    const y = Math.floor(i / game.tileEngine.width);
    if (v > 20) {
      grid[x][y].collidable = true;
    }
  }

  grid.goal = grid[20][13];

  grid.prototype.updateFlowField = function () {
    // Reset costs
    grid.forEach(gridList => gridList.forEach(point => {
      point.cost = Infinity;
    }));
    goal.cost = 0;

    const frontier = [goal];
    const reached = [goal];
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
    grid.forEach(gridList => gridList.forEach(point => {
      const bestCost = Math.min(...point.neighbours.map(n => n.cost));
      point.bestNeighbours = point.neighbours.filter(n => n.cost == bestCost);
    }));

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

  grid.updateflowField();
}
