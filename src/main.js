import { init, Sprite, GameLoop, TileEngine, load, dataAssets, imageAssets, keyPressed, initKeys, Text, onKey, initPointer, onPointer, Pool, Grid, Button, ButtonClass, getPointer } from 'kontra';

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



await load('assets/sprites.png', 'assets/tileset.tsj', 'assets/map1.tmj');
const spriteImage = imageAssets['assets/sprites.png'];
const tileEngine = TileEngine(dataAssets['assets/map1.tmj']);

const sprites = {
  soldier: [0, 0, 8, 8],
  farmer: [8, 0, 8, 8],
  wizard: [16, 0, 8, 8],
  archer: [24, 0, 8, 8],
  knight: [32, 0, 8, 8],
  wall: [40, 0, 8, 8]
}

const enemies = [];

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
    render: function() {
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
    neighbors.push([x - 1, y]);
  }
  if (y > 0) {
    neighbors.push([x, y - 1]);
  }
  if (x < tileEngine.width - 1) {
    neighbors.push([x + 1, y]);
  }
  if (y < tileEngine.height - 1) {
    neighbors.push([x, y + 1]);
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

let pathfind = false;
let counter = 10;
let debug = false;

onKey('space', () => {
  pathfind = !pathfind;
});

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
    if (selected && e.button == 0) {
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
    } else if (e.button == 2) {
      spawnEnemy(x, y);
    }
  }
});



function getClosestEnemy(troop) {
  let bestDistance = troop.maxRange;
  let closest = null;
  for (const enemy of enemies) {
    const distanceSquared = Math.abs((troop.x - enemy.x)**2 + (troop.y - enemy.y)**2);
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
    update: function(dt) {
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

const loop = GameLoop({
  update: function () {
    for (let i = enemies.length - 1; i >= 0; i--) {
      const enemy = enemies[i];
      if (--enemy.moveTimer <= 0) {
        enemy.moveTimer = enemy.moveInterval;
        const x = enemy.x / 8;
        const y = enemy.y / 8;
        let neighbors = getNeighbours(x, y);
        neighbors = neighbors.map(n => reached[n]).filter(n => !!n)
        let best = neighbors.pop();
        for (const n of neighbors) {
          if (n.cost < best.cost) {
            best = n;
          }
        }
        if (best.cost == 0) {
          tileEngine.remove(enemy);
          enemies.splice(i, 1);
        }
        enemy.x = best.position[0] * 8;
        enemy.y = best.position[1] * 8;
      }
    }

    for (const troop of troops) {
      if (--troop.attackTimer <= 0) {
        troop.attackTimer = troop.attackInterval;
        const enemy = getClosestEnemy(troop);
        if (enemy) {
          attack(troop, enemy);
          if (enemy.health <= 0) {
            tileEngine.remove(enemy);
            const index = enemies.indexOf(enemy);
            if (index >= 0) {
              enemies.splice(index, 1);
            }
          }
        }
      }
    }

    troops.forEach(troop => troop.weaponTimer--);

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
    if (debug) text.forEach(t => t.render());
  }
});

loop.start();
