/**
 * Engine module which creates and manages a basic scene graph skeleton
 *
 */
define(function() {

    return {

        /**
         * Brief description of the module
         */
        description: "Sets up a skeleton scene graph, exports nodes for " +
                     "other modules to control and create content on",

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

            /*------------------------------------------------------------------------
             * Define the events fired by this module
             *----------------------------------------------------------------------*/

            grid.createEvent("tick");     // Fired on each render loop iteration, the heartbeat of the grid
            grid.createEvent("pickhit");  // Fired when "pick" action hits a named object in the scene
            grid.createEvent("pickmiss"); // Fired when "pick" action misses all named objects in the scene

            /*------------------------------------------------------------------------
             * Create the scene graph skeleton
             *----------------------------------------------------------------------*/

            var scene = SceneJS.createScene({

                type: "scene",

                id: "theScene",
                canvasId: configs.canvasId,

                nodes: [

                    /**
                     * View transform - we've given it a globally-unique ID
                     * so we can look it up and update it's properties from
                     * mouse input.
                     */
                    {
                        type: "lookAt",
                        id: "theLookAt",

                        eye : { x: 0, y: 10, z: -400 },
                        look :  { x: 0, y: 0, z: 0 },
                        up : { x: 0, y: 1, z: .0 },

                        nodes: [
                            {
                                type: "camera",
                                id: "theCamera",

                                optics: {
                                    type: "perspective",
                                    fovy : 40.0,
                                    aspect : 1.47,
                                    near : 0.10,
                                    far : 7000.0
                                },

                                nodes: [

                                    /* Container for the sky, which will remain stationary in the
                                     * background, yet will will rotate about the viewpoint as the
                                     * lookAt transform moves around. Modules can create things like
                                     * sky spheres here.
                                     */
                                    {
                                        type: "shader",

                                        id: "theSky",

                                        shaders: [

                                            /* Vertex shader with a custom function to intercept the matrix
                                             * and remove translations in order to zero the position of
                                             * whatever implements the sky
                                             */
                                            {
                                                stage:  "vertex",
                                                code: [

                                                    "mat4 myViewMatrix(mat4 m) {",
                                                    "   m[3][0] =m[3][1] = m[3][2] = 0.0;" +
                                                    "   return m; ",
                                                    "}"
                                                ],

                                                hooks: {
                                                    viewMatrix: "myViewMatrix"  // Bind our custom function to hook
                                                }
                                            }
                                        ]
                                    },

                                    /* The scene lights. Modules can create, update and remove light sources here.
                                     */

                                    {
                                        type: "lights",
                                        id: "theLights",

                                        lights: [
                                            {
                                                mode:                   "dir",
                                                color:                  { r: 1.0, g: 1.0, b: 1.0 },
                                                diffuse:                true,
                                                specular:               true,
                                                dir:                    { x: 1.0, y: -0.5, z: -1.0 } ,
                                                space:                  "view"
                                            },

                                            {
                                                mode:                   "dir",
                                                color:                  { r: 1.0, g: 1.0, b: 0.8 },
                                                diffuse:                true,
                                                specular:               false,
                                                dir:                    { x: 0.0, y: -0.5, z: -1.0 },
                                                space:                  "view"
                                            }
                                        ],

                                        nodes: [

                                            /* Container for scene content. Modules can put objects here that
                                             * will move around the scene.
                                             */
                                            {
                                                type: "node",
                                                id: "contentContainer"
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });


            /*------------------------------------------------------------------------
             * Create a "pick" action, which fires a "pickhit" event for any hit on
             * a named object in the scene, or a "pickmiss" if nothing hit
             *
             * Params:
             *      {Number} canvasX    Canvas X-coordinate
             *      {Number} canvasY    Canvas Y-coordinate
             *      {Boolean} rayPick   Optional flag to do ray-pick
             *----------------------------------------------------------------------*/

            grid.createAction({

                action: "pick",

                fn: function(params, ok, error) {

                    var canvasX = params.canvasX;
                    var canvasY = params.canvasY;

                    if (canvasX == undefined || canvasX == null) {
                        error("param expected: canvasX");
                        return;
                    }

                    if (canvasY == undefined || canvasY == null) {
                        error("param expected: canvasY");
                        return;
                    }

                    var hit = scene.pick(canvasX, canvasY, params);

                    // HACK: Fixes black flicker after picking
                    //scene.renderFrame({ force: true });

                    if (hit) {
                        grid.fireEvent("pickhit", hit);

                    } else {
                        grid.fireEvent("pickmiss", params);
                    }
                }
            });

            /*------------------------------------------------------------------------
             * Publish scene resources for other modules
             *----------------------------------------------------------------------*/

            resources.canvas = scene.getCanvas();

            resources.sceneNodes = {
                scene : scene,
                lookat : scene.getNode("theLookAt"),
                camera : scene.getNode("theCamera"),
                lights : scene.getNode("theLights"),
                sky : scene.getNode("theSky"),
                content : scene.getNode("contentContainer")
            };

            /*------------------------------------------------------------------------
             * Fire a "tick" event on each render loop iteration
             *----------------------------------------------------------------------*/

            var startTime = (new Date()).getTime();

            scene.onEvent("idle",
                    function() {
                        grid.fireEvent("tick", {
                            timeElapsed: (new Date()).getTime() - startTime
                        });
                    });

            /*------------------------------------------------------------------------
             * Start the render loop
             *----------------------------------------------------------------------*/

            scene.start();
        },

        /**
         * Destroys this module, deleting resources and anything that it
         * previously created on the grid via its #init method.
         */
        destroy: function(grid, resources) {

            /* Destroy scene graph
             */
            resources.scene.destroy();

            /* Unpublish resources
             */
            delete resources.canvas;
            delete resources.sceneNodes;
        }
    };

});