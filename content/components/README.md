
Grid Components Directory
=========================

This directory contains modules that implement the components of the grid, along with things like the 3rd-party
libraries and textures they require.

The sub-directories are:

 * modules - the modules, organised in a taxonomy of subdirectories 
 * lib - 3rd-party libraries used by the modules
 * textures - texture files used by the modules


Guidelines
----------

 * Modules encapsulate all dependencies on the 3rd party libraries. Scripts only depend on modules and
   the grid object itself. Think of modules as a facade that expose a logical interface to the scipts.

 * Take a look at the scripts in ./examples for modules which you can use as examples
   to base your modules off.  

 
   