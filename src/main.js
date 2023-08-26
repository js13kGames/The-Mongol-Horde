import { init, Sprite, GameLoop, TileEngine, load, dataAssets, imageAssets, keyPressed, initKeys, Text, onKey, initPointer, onPointer, Pool, Grid, Button, ButtonClass, getPointer, GameObjectClass, GameObject, randInt } from 'kontra';
import map from './map';
import tileset from './tileset';

const { canvas, context } = init();
initKeys();
initPointer({
  radius: 1
});

canvas.width = 200;
canvas.height = 152;

// Don't open right click menu
canvas.oncontextmenu = () => false;



function resizeCanvas() {
  const ratioWidth = window.innerWidth / canvas.width;
  const ratioHeight = window.innerHeight / canvas.height;
  let minRatio = Math.min(ratioWidth, ratioHeight);
  if (minRatio > 1) {
    minRatio = Math.floor(minRatio);
  }
  canvas.style.width = `${minRatio * canvas.width}px`;
  canvas.style.height = `${minRatio * canvas.height}px`;
  canvas.scale = minRatio;
}
window.addEventListener('resize', () => resizeCanvas());
resizeCanvas();


const spriteFilePath = 'i.png';
const tilesetFilePath = 'ts';
dataAssets[location.href + tilesetFilePath] = tileset;
load(spriteFilePath).then(() => {
  const spriteImage = imageAssets[spriteFilePath];
  const tileEngine = TileEngine(map);

  const sprites = {
    soldier: [0, 0, 8, 8],
    farmer: [8, 0, 8, 8],
    wizard: [16, 0, 8, 8],
    archer: [24, 0, 8, 8],
    knight: [32, 0, 8, 8],
    wall: [32, 16, 8, 8]
  }

  const enemies = [];

  const spawners = [];
  function createSpawner(x, y) {
    const spawner = GameObject({
      x: x * 8,
      y: y * 8,
      spawnInterval: [200, 400],
      spawnTimer: 0,
      update: function () {
        this.advance();
        if (--this.spawnTimer <= 0) {
          this.spawnTimer = randInt(...this.spawnInterval);
          spawnEnemy(this.x, this.y);
        }
      }
    });
    spawners.push(spawner);
  }

  createSpawner(0, 8);
  createSpawner(13, 0);
  createSpawner(3, 2);

  function spawnEnemy(x, y) {
    const enemy = Sprite({
      x,
      y,
      image: spriteImage,
      spriteLocation: sprites.wizard,
      health: 10,
      maxHealth: 10,
      moveInterval: 30,
      moveTimer: 30
    });
    enemy.addChild(Sprite({
      y: enemy.height + 1,
      render: function () {
        this.context.fillStyle = 'red';
        this.context.fillRect(1, 0, 6, 1);
        this.context.fillStyle = 'green';
        this.context.fillRect(1, 0, Math.round((this.parent.health / this.parent.maxHealth) * 6), 1);
      }
    }));
    tileEngine.add(enemy);
    enemies.push(enemy);
    return enemy;
  }

  // Initialise grid
  const grid = [...Array(tileEngine.width).keys()].map(i => []);
  for (let x = 0; x < tileEngine.width; x++) {
    for (let y = 0; y < tileEngine.height; y++) {
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
      point.neighbours.push(grid[point.x][point.y-1]);
    }
    if (point.x < tileEngine.width - 1) {
      point.neighbours.push(grid[point.x+1][point.y]);
    }
    if (point.y < tileEngine.height - 1) {
      point.neighbours.push(grid[point.x][point.y+1]);
    }
    if (point.x > 0) {
      point.neighbours.push(grid[point.x-1][point.y]);
    }
  }));

  // Set collidable flag from tileset objects
  for (const [i, v] of tileEngine.layers[0].data.entries()) {
    const x = i % tileEngine.width;
    const y = Math.floor(i / tileEngine.width);
    if (v > 20) {
      grid[x][y].collidable = true;
    }
  }

  const goal = grid[20][13];
  let flowFieldText = [];
  function updateflowField() {
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
    flowFieldText = [];
    for (const point of reached) {
      flowFieldText.push(Text({
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

  updateflowField();



  let debug = false;
  onKey('d', () => {
    debug = !debug;
  });

  onKey('esc', () => {
    selected = null;
  });

  function snapToGrid(x, y) {
    return [
      Math.floor(x / 8) * 8,
      Math.floor(y / 8) * 8
    ]
  }

  const troops = []
  onPointer('down', (e, object) => {
    if (!(object instanceof ToolbarButton)) {
      const [x, y] = snapToGrid(e.offsetX / canvas.scale, e.offsetY / canvas.scale);
      const tile = tileEngine.layers[0].data[(x/8) + (y/8) * tileEngine.width];
      if (selected && e.button == 0 && (tile < 11 || tile > 20) && !grid[x/8][y/8].collidable && !(x/8 == goal.x && y/8 == goal.y)) {
        const troop = Sprite({
          x: x,
          y: y,
          image: spriteImage,
          spriteLocation: selected,
          maxRange: 256,
          attackInterval: 30,
          attackTimer: 30
        });
        tileEngine.add(troop);
        troops.push(troop);
        grid[x/8][y/8].collidable = true;
        updateflowField();
      } else if (e.button == 2) {
        spawnEnemy(x, y);
      }
    }
  });



  function getClosestEnemy(troop) {
    let bestDistance = troop.maxRange;
    let closest = null;
    for (const enemy of enemies) {
      const distanceSquared = Math.abs((troop.x - enemy.x) ** 2 + (troop.y - enemy.y) ** 2);
      if (distanceSquared < bestDistance) {
        closest = enemy;
      }
    }
    return closest;
  }

  function attack(troop, enemy) {
    console.log('Attack', troop, enemy);
    enemy.health -= 2;
    pool.get({
      x: enemy.x + enemy.width / 2,
      y: enemy.y + enemy.height / 2,
      // anchor: { x: 0.5, y: 0.5 },
      image: spriteImage,
      spriteLocation: [19, 9, 1, 1],
      ttl: 40,
      update: function (dt) {
        this.advance(dt);
        if (this.ttl == 30) {
          this.spriteLocation = [16, 8, 3, 3];
          this.x--;
          this.y--;
        }
        if (this.ttl == 15) {
          this.spriteLocation = [19, 8, 1, 1];
          this.x++;
          this.y++;
        }
        if (this.ttl == 10) {
          this.spriteLocation = [20, 8, 1, 1];
        }
      }
    })
  }

  const pool = Pool({
    create: Sprite
  })

  class ToolbarButton extends ButtonClass {
    constructor(properties) {
      properties.text = {
        font: '0px none'
      }
      super(properties);
    }

    draw() {
      if (this.hovered) {
        this.context.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.context.fillRect(-1, -1, this.width + 2, this.height + 2);
      }
      super.draw();
    }
  }

  let selected = null;
  let selectedSprite = Sprite({
    image: spriteImage,
    spriteLocation: sprites.soldier
  })
  const soldierButton = new ToolbarButton({
    image: spriteImage,
    spriteLocation: sprites.soldier,
    onDown() {
      selected = sprites.soldier;
    }
  });
  const archerButton = new ToolbarButton({
    image: spriteImage,
    spriteLocation: sprites.archer,
    onDown() {
      selected = sprites.archer;
    }
  });
  const wallButton = new ToolbarButton({
    image: spriteImage,
    spriteLocation: sprites.wall,
    onDown() {
      selected = sprites.wall;
    }
  });
  const toolbar = Grid({
    x: canvas.width / 2,
    y: canvas.height - 8,
    anchor: { x: 0.5, y: 0.5 },
    flow: 'row',
    colGap: 2,
    children: [soldierButton, archerButton, wallButton]
  });
  const toolbarBackground = Sprite({
    x: toolbar.x,
    y: toolbar.y,
    width: toolbar.width + 4,
    height: toolbar.height + 4,
    anchor: { x: 0.5, y: 0.5 },
    color: 'rgba(0, 0, 0, 0.3)'
  });

  function pickRandom(array) {
    return array[randInt(0, array.length - 1)];
  }

  const loop = GameLoop({
    update: function () {
      for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        if (--enemy.moveTimer <= 0) {
          enemy.moveTimer = enemy.moveInterval;
          const x = enemy.x / 8;
          const y = enemy.y / 8;

          if (grid[x][y].cost == 0) {
            // Reached the goal
            tileEngine.remove(enemy);
            enemies.splice(i, 1);
          }

          const next = pickRandom(grid[x][y].bestNeighbours);
          enemy.x = next.x * 8;
          enemy.y = next.y * 8;
        }
      }

      // for (const troop of troops) {
      //   if (--troop.attackTimer <= 0) {
      //     troop.attackTimer = troop.attackInterval;
      //     const enemy = getClosestEnemy(troop);
      //     if (enemy) {
      //       attack(troop, enemy);
      //       if (enemy.health <= 0) {
      //         tileEngine.remove(enemy);
      //         const index = enemies.indexOf(enemy);
      //         if (index >= 0) {
      //           enemies.splice(index, 1);
      //         }
      //       }
      //     }
      //   }
      // }

      troops.forEach(troop => troop.weaponTimer--);

      spawners.forEach(spawner => spawner.update());

      pool.update();
    },
    render: function () {
      context.fillStyle = '#7e9432';
      context.fillRect(0, 0, canvas.width, canvas.height);
      tileEngine.render();
      pool.render();
      if (selected != null) {
        const pointer = getPointer();
        const [x, y] = snapToGrid(pointer.x, pointer.y);
        selectedSprite.x = x;
        selectedSprite.y = y;
        selectedSprite.spriteLocation = selected;
        selectedSprite.render();
      }
      toolbarBackground.render();
      toolbar.render();
      if (debug) flowFieldText.forEach(t => t.render());
    }
  });

  loop.start();
});
