import { GameObject, getContext, imageAssets } from 'kontra';
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
  for (const char of text) {
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

export function getSize(text) {
  let textX = 0;
  let textY = lineHeight;
  let maxX = 0;
  let maxY = 0;
  for (const char of text) {
    if (char === '\n') {
      textX = 0;
      textY += lineHeight;
    } else if (char == ' ') {
      textX += 2;
    } else {
      textX += metrics[char] ?? glyphWidth;
    }
    maxX = Math.max(maxX, textX);
    maxY = Math.max(maxY, textY);
  }
  return {
    x: maxX - 1,
    y: maxY - 1
  };
}

export function Text(text, x, y) {
  const size = getSize(text);
  return GameObject({
    text,
    x,
    y,
    width: size.x % 2 ? size.x + 1 : size.x,
    height: size.y % 2 ? size.y + 1 : size.y,
    updateText(newText) {
      this.text = newText;
      const size = getSize(newText);
      this.width = size.x % 2 ? size.x + 1 : size.x;
      this.height = size.y % 2 ? size.y + 1 : size.y;
    },
    render() {
      write(this.text, x, y);
    }
  });
}
