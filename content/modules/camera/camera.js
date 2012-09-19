/**
 * Engine module which provides basic camera controls
 *
 */
define(function() {

    return {

        /**
         * Brief description of the module
         */
        description: "Provides basic actions for controlling the camera",

        /**
         * Called by the engine to initialise the module.
         *
         * Via this method, the engine injects itself into the module, along with a map of engine
         * resources that the module may use. The resources contain things like the HTML canvas
         * and certain nodes in the scene graph that the module may graft additional nodes onto.
         *
         * Within this method, the module would typically create on the engine various actions
         * that it handles, as well as declare what events it fires.
         *
        * @param {Engine} engine The engine
         * @param {Object} resources Resources shared among all modules
         * @param {JSON} configs Module configs
         */
        init: function(engine, resources, configs) {

            var lookat = resources.sceneNodes.lookat;  // Get the scene's lookAt node from the engine resources

            /* Define event to notify of camera updates
             */
            engine.createEvent("camera.updated");

            /* Create action to update the camera
             */
            engine.createAction({

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

            /* Create action to reset the camera
             */
            var origEye = lookat.getEye();
            var origLook = lookat.getLook();
            var origUp = lookat.getUp();

            engine.createAction({
                action: "camera.reset",
                fn: function(params, ok) {
                    lookat.setEye(origEye);
                    lookat.setLook(origLook);
                    lookat.setUp(origUp);
                    ok();
                }
            });

        },

        /**
         * Destroys this module, deleting anything that it
         * previously created on the engine via its #init method.
         */
        destroy: function(engine, resources) {

            engine.deleteEvent("camera.updated");

            engine.deleteAction("camera.set");

            engine.deleteAction("camera.reset");
        }
    };
});
