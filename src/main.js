import { init, GameLoop, load, dataAssets, initKeys, initPointer } from 'kontra';
import tileset from './tileset';
import { game } from './game';
import { spriteFilePath } from './sprites';

const { canvas } = init();
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
    minRatio = Math.min(Math.floor(minRatio), 6);
  }
  canvas.style.width = `${minRatio * canvas.width}px`;
  canvas.style.height = `${minRatio * canvas.height}px`;
  canvas.scale = minRatio;
}
window.addEventListener('resize', () => resizeCanvas());
resizeCanvas();

dataAssets[(location.href + '/ts').replace('//ts', '/ts')] = tileset;
load(spriteFilePath).then(() => {
  game.init();

  const loop = GameLoop({
    update: function () {
      game.update();
    },
    render: function () {
      game.render();
    }
  });

  loop.start();
});
