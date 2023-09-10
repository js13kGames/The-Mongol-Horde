import { GameObject } from 'kontra';
import { game } from './game';

export function HealthBar(updateFunction, properties) {
  const healthBar =  GameObject({
    x: 1,
    y: 9,
    current: properties.max,
    max: properties.max,
    backgroundColour: 'red',
    foregroundColour: 'green',
    ...properties,
    myRender() {
      const current = updateFunction();
      if (current > 0 && current < this.max) {
        const { x, y } = this.world;
        this.context.fillStyle = this.backgroundColour;
        this.context.fillRect(x, y, 6, 1);
        this.context.fillStyle = this.foregroundColour;
        this.context.fillRect(x, y, Math.round((current / this.max) * 6), 1);
      }
    }
  });
  game.ui.bars.push(healthBar);
  return healthBar;
}
