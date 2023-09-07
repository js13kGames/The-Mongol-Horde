function getCoords(index) {
  const x = (index * 8) % 64;
  const y = Math.floor(index / 8) * 8;
  return [x, y, 8, 8];
}

export const sprites = {
  chest: getCoords(0),
  soldier: getCoords(1),
  farmer: getCoords(2),
  wizard: getCoords(3),
  archer: getCoords(4),
  knight: getCoords(5),
  wolf: getCoords(6),
  badSoldier: getCoords(7),
  badKnight: getCoords(8),
  badArcher: getCoords(9),
  wall: getCoords(22),
  wallTop: getCoords(23),
  chestOpen: getCoords(28),
  coin: [25, 25, 6, 6],
  bin: [65, 1, 6, 6]
};

export const spriteFilePath = (location.pathname + '/i.png').replace('//', '/');
