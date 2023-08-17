import greeter from './other';
import { init, Sprite, GameLoop } from 'kontra';

function doSomething(thing) {
  console.log(thing);
}

doSomething(greeter('Reece'));

const { canvas, context } = init();

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

const sprite = Sprite({
  x: 100,
  y: 80,
  color: 'red',
  width: 20,
  height: 20,
  dx: 2
});

let characters;

const image = new Image();
image.src = 'assets/characters.png';
image.onload = function() {
  characters = Sprite({
    x: 50,
    y: 50,
    image: image,
    spriteLocation: [8, 0, 8, 8]
  });
  loop.start();
}

const loop = GameLoop({
  update: function() {
    sprite.update();

    if (sprite.x > canvas.width) {
      sprite.x = -sprite.width;
    }
  },
  render: function() {
    context.fillStyle = '#7e9432';
    context.fillRect(0, 0, canvas.width, canvas.height);
    sprite.render();
    characters.render();
  }
});
