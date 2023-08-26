export function Enemy(x, y) {
  const enemy = Sprite({
    x,
    y,
    image: spriteImage,
    spriteLocation: sprites.wizard,
    health: 10,
    maxHealth: 10,
    moveInterval: 30,
    moveTimer: 30
  });
  enemy.addChild(Sprite({
    y: enemy.height + 1,
    render: function () {
      this.context.fillStyle = 'red';
      this.context.fillRect(1, 0, 6, 1);
      this.context.fillStyle = 'green';
      this.context.fillRect(1, 0, Math.round((this.parent.health / this.parent.maxHealth) * 6), 1);
    }
  }));
  return enemy;
}
