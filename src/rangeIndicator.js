import { GameObject, getCanvas, getContext } from 'kontra';
import { insideCircle, snapToGrid } from './util';

export function RangeIndicator() {
  return GameObject({
    squares: [],
    visible: true,

    setRadius(radius) {
      this.squares = [];
      if (radius == 0) return;
      const top = Math.ceil(-radius);
      const bottom = Math.floor(radius);
      const left = Math.ceil(-radius);
      const right = Math.floor(radius);
      for (let x = left; x <= right; x++) {
        for (let y = top; y <= bottom; y++) {
          if (insideCircle(this.position, { x, y }, radius)) {
            this.squares.push({ x, y });
          }
        }
      }
    },

    render() {
      if (this.visible && this.parent.y < getCanvas().height - 16) {
        getContext().fillStyle = 'rgba(255, 0, 0, 0.3)';
        this.squares.forEach(({ x, y }) => {
          getContext().fillRect(...snapToGrid(x * 8, y * 8), 8, 8);
        });
      }
    }
  });
}
