/* eslint-disable no-sparse-arrays */

import { zzfx, ZZFX } from 'zzfx';

ZZFX.volume = 0.3;

export const sound = {
  footstep: () => zzfx(...[.1, .15, 166, .05, .06, .05, , .7, -1.6, , , , , 3, 2]),
  hit: () => zzfx(...[.3,.5,289,.02,,.07,3,.39,-6.4,,,,,.5,34,.1,.02,.91,.04,.15]),
  gameOver: () => zzfx(...[.3, , 925, .04, .3, .6, 1, .3, , 6.27, -184, .09, .17]),
  gameOver2: () => zzfx(...[.5,0,440,.1,.3,1,1,.6,-0.5,-0.3,,,,.4,7,,,,.1,.2])
};
