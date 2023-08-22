import { init, Sprite, GameLoop, TileEngine, load, dataAssets, imageAssets, keyPressed, initKeys, Text, onKey } from 'kontra';

const { canvas, context } = init();
initKeys();

canvas.width = 200;
canvas.height = 152;



function resizeCanvas() {
  const ratioWidth = window.innerWidth / canvas.width;
  const ratioHeight = window.innerHeight / canvas.height;
  let minRatio = Math.min(ratioWidth, ratioHeight);
  if (minRatio > 1) {
    minRatio = Math.floor(minRatio);
  }
  canvas.style.width = `${minRatio * canvas.width}px`;
  canvas.style.height = `${minRatio * canvas.height}px`;
}
window.addEventListener('resize', () => resizeCanvas());
resizeCanvas();



load('assets/sprites.png', 'assets/tileset.tsj', 'assets/map1.tmj').then(assets => {
  const tileEngine = TileEngine(dataAssets['assets/map1.tmj']);

  const soldier = Sprite({
    x: 64,
    y: 64,
    image: imageAssets['assets/sprites.png'],
    spriteLocation: [16, 0, 8, 8]
  });

  tileEngine.add(soldier);

  const collidable = {};
  for (const [i, v] of tileEngine.layers[1].data.entries()) {
    const x = i % tileEngine.width;
    const y = Math.floor(i / tileEngine.width);
    if (v > 0) {
      collidable[[x, y]] = true;
    }
  }

  const goal = {
    position: [19, 14],
    cost: 0,
    previous: null
  };
  const frontier = [goal];
  const reached = {};
  reached[goal.position] = goal;

  function getNeighbours(x, y) {
    const neighbors = []
    if (x > 0) {
      neighbors.push([x-1, y]);
    }
    if (y > 0) {
      neighbors.push([x, y-1]);
    }
    if (x < tileEngine.width - 1) {
      neighbors.push([x+1, y]);
    }
    if (y < tileEngine.height - 1) {
      neighbors.push([x, y+1]);
    }
    return neighbors;
  }

  while (frontier.length) {
    const current = frontier.shift();
    const [cx, cy] = current.position;
    console.log(`At ${cx},${cy}`);
    const neighbors = getNeighbours(cx, cy);
    console.log(`Has neighbours ${neighbors}`);
    for (const next of neighbors) {
      if (!(next in reached) && !collidable[next]) {
        console.log(`Reached ${next}`);
        const nextPoint = {
          position: next,
          cost: current.cost + 1,
          previous: current
        }
        frontier.push(nextPoint);
        reached[next] = nextPoint;
      }
    }
  }

  const text = [];
  for (const point of Object.values(reached)) {
    text.push(Text({
      text: point.cost,
      font: '6px Arial',
      color: 'white',
      x: point.position[0] * 8 + 4,
      y: point.position[1] * 8 + 4,
      anchor: { x: 0.5, y: 0.5 },
      textAlign: 'center'
    }));
  }

  let pathfind = true;
  let counter = 10;
  let debug = false;

  onKey('space', () => {
    pathfind = !pathfind;
  });

  onKey('d', () => {
    debug = !debug;
  });

  let moveCounter = 10;
  const loop = GameLoop({
    update: function() {
      moveCounter--;
      if (moveCounter < 1) {
        if (keyPressed('arrowup')) {
          soldier.y -= 8;
        }
        if (keyPressed('arrowdown')) {
          soldier.y += 8;
        }
        if (keyPressed('arrowleft')) {
          soldier.x -= 8;
        }
        if (keyPressed('arrowright')) {
          soldier.x += 8;
        }
        if (keyPressed(['arrowup', 'arrowdown', 'arrowleft', 'arrowright'])) {
          console.log(`x: ${soldier.x}, y: ${soldier.y}`);
          moveCounter = 10;
        }
      }

      if (pathfind) {
        counter--;
        if (counter == 0) {
          const x = soldier.x / 8;
          const y = soldier.y / 8;
          let neighbors = getNeighbours(x, y);
          neighbors = neighbors.map(n => reached[n]).filter(n => !!n)
          let best = neighbors.pop();
          for (const n of neighbors) {
            if (n.cost < best.cost) {
              best = n;
            }
          }
          if (best.cost == 0) {
            pathfind = false;
          }
          soldier.x = best.position[0] * 8;
          soldier.y = best.position[1] * 8;
          counter = 10;
        }
      }
    },
    render: function() {
      context.fillStyle = '#7e9432';
      context.fillRect(0, 0, canvas.width, canvas.height);
      tileEngine.render();
      if (debug) text.forEach(t => t.render());
    }
  });

  loop.start();
});
