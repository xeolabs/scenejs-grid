
Grid Game Scripts Directory
===========================

This directory contains the top-level "game scripts" that orchestrate the modules in content/modules.

Guidelines
----------

 * Scripts must not have dependencies on 3rd party libraries - they must only
   depend on the modules and the grid object. The modules should encapsulate
   dependencies on 3rd party libraries.
   