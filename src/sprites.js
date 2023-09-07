function getCoords(index) {
  const x = (index * 8) % 88;
  const y = Math.floor(index / 11) * 8;
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
  badKnight: getCoords(11),
  badArcher: getCoords(12),
  wall: getCoords(28),
  wallTop: getCoords(29),
  chestOpen: getCoords(37),
  coin: [25, 25, 6, 6],
  bin: getCoords(9),
  cross: getCoords(10),
  damage: [41, 25, 6, 6],
  range: [73, 25, 6, 6]
};

export const spriteFilePath = (location.pathname + '/i.png').replace('//', '/');
