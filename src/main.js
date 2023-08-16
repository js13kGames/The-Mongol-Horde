
import greeter from './other';
import { init, Sprite, GameLoop } from 'kontra';

function doSomething(thing) {
  console.log(thing);
}

doSomething(greeter('Reece'));

const { canvas } = init();

const sprite = Sprite({
  x: 100,
  y: 80,
  color: 'red',
  width: 20,
  height: 40,
  dx: 2
});

const loop = GameLoop({
  update: function() {
    sprite.update();

    if (sprite.x > canvas.width) {
      sprite.x = -sprite.width;
    }
  },
  render: function() {
    sprite.render();
  }
});

loop.start();
