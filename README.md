scenejs-grid
=======================

SceneJS-Grid is a modular world engine built on top of [SceneJS v3.0](https://github.com/xeolabs/scenejs), the
WebGL-based 3D rendering engine.

Briefly, the grid consists of modules (sort of like game actor objects) which are orchestrated by scripts.
Modules export command objects (called "actions") into the grid, through which they may be told to do things.
They also fire events to notify of changes to their state. Pretty simple: actions in, events out.

Scripts are loaded when the grid boots up. Their job is to fire actions and respond to events, effectively glueing
the modules together. You can also fire actions and subscribe to events via the grid shell, which is great for
developing scripts with.

A grid is served right out of this GitHub repository. That means that you can fork this repo, add modules
and scripts, then when we pull in those contributions they instantly become part of this grid.

It's super simple, scales up quickly, and is rather addictive!

Modules
-------------------------

The [content/components](https://github.com/xeolabs/scenejs-grid/blob/master/content/components) directory contains
modules that implement the components of the grid, along with their dependencies, such as 3rd-party libraries and
textures they require.

Its sub-directories are:

 * [modules](https://github.com/xeolabs/scenejs-grid/blob/master/content/components/modules) - the modules, organised in a taxonomy of subdirectories
 * [lib](https://github.com/xeolabs/scenejs-grid/blob/master/content/components/lib) - 3rd-party libraries used by the modules
 * [textures](https://github.com/xeolabs/scenejs-grid/blob/master/content/components/textures) - texture files used by the modules

Modules encapsulate all dependencies on the 3rd party libraries. Scripts only depend on modules and the grid object
itself. Think of modules as a facade that expose a logical interface to the scipts.

Take a look at [modules/examples](https://github.com/xeolabs/scenejs-grid/blob/master/content/components/modules/examples)
for example modules which you can base your own modules off.

Scripts
-------------------------

The [content/scripts](https://github.com/xeolabs/scenejs-grid/blob/master/content/scripts) directory contains
top-level "game scripts" that orchestrate the modules.

Scripts must not have dependencies on 3rd party libraries - their only dependencies should be on modules and the
grid object. The modules should encapsulate dependencies on 3rd party libraries.

Take a look at [scripts/examples](https://github.com/xeolabs/scenejs-grid/blob/master/content/scripts/examples)
for example scripts which you can base your own scripts off.

Examples
-------------------------

Try out some demo scripts:

 * [Teapot](http://htmlpreview.github.com/?https://raw.github.com/xeolabs/scenejs-grid/master/index.html#script=examples/teapot) - loads the boot script in [content/scripts/examples/teapot.js](https://github.com/xeolabs/scenejs-grid/blob/master/content/scripts/examples/teapot.js)
 * [Tanks](http://htmlpreview.github.com/?https://raw.github.com/xeolabs/scenejs-grid/master/index.html#script=examples/tanks) - loads the boot script in [content/scripts/examples/tanks.js](https://github.com/xeolabs/scenejs-grid/blob/master/content/scripts/examples/tanks.js)