import { Sprite, imageAssets } from "kontra";
import { spriteFilePath } from './sprites';

export function Troop(properties) {
  return Sprite({
    image: imageAssets[spriteFilePath],
    maxRange: 256,
    attackInterval: 30,
    attackTimer: 30,
    ...properties
  });
}
