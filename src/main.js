import { init, Sprite, GameLoop, TileEngine, load, dataAssets, imageAssets, keyPressed, initKeys } from 'kontra';

const { canvas, context } = init();
initKeys();

canvas.width = 200;
canvas.height = 150;



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
    spriteLocation: [8, 0, 8, 8]
  });

  tileEngine.add(soldier);

  const loop = GameLoop({
    update: function() {
      if (keyPressed('arrowup')) {
        soldier.y--;
      }
      if (keyPressed('arrowdown')) {
        soldier.y++;
      }
      if (keyPressed('arrowleft')) {
        soldier.x--;
      }
      if (keyPressed('arrowright')) {
        soldier.x += 0.1;
      }
    },
    render: function() {
      context.fillStyle = '#7e9432';
      context.fillRect(0, 0, canvas.width, canvas.height);
      tileEngine.render();
    }
  });

  loop.start();
});
