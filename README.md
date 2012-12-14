scenejs-grid
=======================

SceneJS-Grid is an experimental world engine built on top of (the as yet unreleased) [SceneJS v3.0](https://github.com/xeolabs/scenejs), the
WebGL-based 3D rendering engine.

Grid in 30 Seconds
------------------------

Briefly, the grid consists of modules (like game engine "actor components") which are orchestrated by scripts.
Modules create actions on the grid (the "stage"), through which they may be commanded to do stuff. They also fire events
to notify of their state changes. Scripts are loaded when the grid boots up. Their job is to wire modules together,
firing their actions and responding to their events. A human can also do all this via an interactive JavaScript terminal
that's built into the grid.

A grid is served right out of this GitHub repository. That means that you can fork this repo, add modules
and scripts, then when we pull in those contributions they instantly become part of this grid.

Read the [Grid Wiki](https://github.com/xeolabs/scenejs-grid/wiki) for more info.

Examples
-------------------------

Got WebGL? Try the grid out some demo scripts:

 * [Teapot](http://htmlpreview.github.com/?https://raw.github.com/xeolabs/scenejs-grid/master/index.html#script=examples/teapot&splash=false) - loads the boot script in [content/scripts/examples/teapot.js](https://github.com/xeolabs/scenejs-grid/blob/master/content/scripts/examples/teapot.js)
 * [Tanks](http://htmlpreview.github.com/?https://raw.github.com/xeolabs/scenejs-grid/master/index.html#script=examples/tanks&splash=false) - loads the boot script in [content/scripts/examples/tanks.js](https://github.com/xeolabs/scenejs-grid/blob/master/content/scripts/examples/tanks.js)
 * [Physics](http://htmlpreview.github.com/?https://raw.github.com/xeolabs/scenejs-grid/master/index.html#script=examples/physics/jiglibjs&splash=false) - loads the boot script in [content/scripts/examples/physics/jiglibjs.js](https://github.com/xeolabs/scenejs-grid/blob/master/content/scripts/examples/physics/jiglibjs.js)

 **Note:** hit reload if loading fails - the [HTML Preview](http://htmlpreview.github.com/) service we're serving the repo through
  seems to have problems serving the larger assets on the first visit, then works fine on later visits.
