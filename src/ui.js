import { imageAssets, Sprite, ButtonClass, getCanvas, Grid } from "kontra";
import { sprites, spriteImage } from "./sprites";

class ToolbarButton extends ButtonClass {
  constructor(spriteLocation) {
    super({
      text: {
        font: '0px none'
      },
      image: spriteImage,
      spriteLocation
    });
  }

  onDown() {
    ui.selected = this.spriteLocation;
  }

  draw() {
    if (this.hovered) {
      this.context.fillStyle = 'rgba(255, 255, 255, 0.1)';
      this.context.fillRect(-1, -1, this.width + 2, this.height + 2);
    }
    super.draw();
  }
}

const soldierButton = new ToolbarButton(sprites.soldier);
const archerButton = new ToolbarButton(sprites.archer);
const wallButton = new ToolbarButton(sprites.wall);

const toolbar = Grid({
  x: getCanvas().width / 2,
  y: getCanvas().height - 8,
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

export class Ui {
  selected = null;
  cursorSprite = Sprite({
    image: imageAssets['i.png'],
    spriteLocation: sprites.soldier
  });

  render() {
    toolbarBackground.render();
    toolbar.render();
  }
}
