import { getContext, imageAssets } from 'kontra';
import { spriteFilePath } from './sprites';

const xOffset = 0;
const yOffset = 32;
const glyphWidth = 5;
const glyphHeight = 6;
const lineHeight = 7;
const glyphWidthOverrides = {
  'MNWTVY': 6,
  'I1L': 4,
  '!': 2
};
const metrics = {};
for (let k in glyphWidthOverrides) {
  for (let c of k) {
    metrics[c] = glyphWidthOverrides[k];
  }
}

function getIndex(char) {
  if (char == '!') return 0;
  let index = char.charCodeAt(0) - 47; // Numbers
  if (index > 17) index -= 7; // Letters
  return index;
}

// Adapted from https://github.com/danprince/norman-the-necromancer/blob/main/src/engine.ts#L106
export function write(text, x, y) {
  let textX = x;
  let textY = y;
  for (let i = 0; i < text.length; i++) {
    let char = text[i];
    if (char === '\n') {
      textX = x;
      textY += lineHeight;
    } else if (char == ' ') {
      textX += 2;
    } else {
      let index = getIndex(char);
      let sx = (index % 19) * glyphWidth + xOffset;
      let sy = (index / 19 | 0) * glyphHeight + yOffset;
      let dx = textX;
      let dy = textY;
      getContext().drawImage(imageAssets[spriteFilePath], sx, sy, glyphWidth, glyphHeight, dx, dy, glyphWidth, glyphHeight);
      textX += metrics[char] ?? glyphWidth;
    }
  }
}
