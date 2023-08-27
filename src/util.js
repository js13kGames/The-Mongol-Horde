import { randInt } from "kontra";

export function pickRandom(array) {
  return array[randInt(0, array.length - 1)];
}

export function snapToGrid(x, y) {
  return [
    Math.floor(x / 8) * 8,
    Math.floor(y / 8) * 8
  ]
}

export function removeFrom(array, item) {
  const index = array.indexOf(item);
  if (index >= 0) {
    array.splice(index, 1);
  }
}
