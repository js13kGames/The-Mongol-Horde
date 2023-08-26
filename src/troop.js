import { imageAssets } from "kontra";

function Troop(properties) {
  const troop = Sprite({
    x: x,
    y: y,
    image: imageAssets['i.png'],
    spriteLocation: selected,
    maxRange: 256,
    attackInterval: 30,
    attackTimer: 30,
    ...properties
  });
}
