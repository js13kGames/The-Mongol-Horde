/* eslint-disable no-sparse-arrays */

import { zzfx, ZZFX } from 'zzfx';

export const volume = 0.4;
ZZFX.volume = volume;

export const sound = {
  footstep: (volume) => zzfx(...[volume, .15, 166, .05, .06, .05, , .7, -1.6, , , , , 3, 2]),
  hit: () => zzfx(...[.2,.5,289,.02,,.07,3,.39,-6.4,,,,,.5,34,.1,.02,.91,.04,.15]),
  gameOver: () => zzfx(...[.3, , 925, .04, .3, .6, 1, .3, , 6.27, -184, .09, .17]),
  gameOver2: () => zzfx(...[.5,0,440,.1,.3,1,1,.6,-0.5,-0.3,,,,.4,7,,,,.1,.2]),
  swing: () => zzfx(...[.3,.5,150,.05,,.05,,1.3,,,,,,3]),
  hit2: () => zzfx(...[.25,.8,400,.02,,.07,,,-6.4,,,,,5,30,,,,.04]),
  waveFinished: () => zzfx(...[.3,,20,.04,,.6,,1.31,,,-990,.06,.17,,,.04,.07])
};

export function hitSound() {
  const r = Math.random();
  if (r < 0.3) {
    sound.hit();
  } else if (r < 0.6) {
    sound.hit2();
  } else {
    sound.swing();
  }
}
