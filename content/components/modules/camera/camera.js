/**
 * Module providing basic camera controls
 *
 */
define(function() {

    return {

        /**
         * Brief description of the module
         */
        description: "Controls the camera",

        /**
         * Called by the grid to initialise the module.
         *
         * Via this method, the grid injects itself into the module, along with a map of grid
         * resources that the module may use. The resources contain things like the HTML canvas
         * and certain nodes in the scene graph that the module may graft additional nodes onto.
         *
         * Within this method, the module would typically create on the grid various actions
         * that it handles, as well as declare what events it fires.
         *
        * @param {Grid} grid The grid
         * @param {Object} resources Resources shared among all modules
         * @param {JSON} configs Module configs
         */
        init: function(grid, resources, configs) {

            var lookat = resources.sceneNodes.lookat;  // Get the scene's lookAt node from the grid resources

            /* Sets the state of the camera
             */
            grid.createAction({

                action: "camera.set",

                fn: function(params, ok) {
                    if (params.eye) {
                        lookat.setEye(params.eye);
                    }
                    if (params.look) {
                        lookat.setLook(params.look);
                    }
                    if (params.up) {
                        lookat.setUp(params.up);
                    }
                    ok();
                }
            });

             /* Gets the state of the camera
             */
            grid.createAction({

                action: "camera.get",

                fn: function(params, ok) {

                    // Safest to store state in the camera node
                    // because other modules may modify it also

                    ok({
                        eye: lookat.getEye(),
                        look: lookat.getLook(),
                        up: lookat.getUp()
                    });
                }
            });
        },

        /**
         * Destroys this module, deleting anything that it
         * previously created on the grid via its #init method.
         */
        destroy: function(grid, resources) {

            grid.deleteAction("camera.set");

            grid.deleteAction("camera.get");
        }
    };
});
