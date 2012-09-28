define(

    function () {

        return {

            /**
             * Brief description of the module
             */
            description:"Camera control",

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
             * @param {Object} context Resources shared among all modules
             * @param {JSON} configs Module configs
             */
            load:function (grid, context, configs) {

                var lookat = context.sceneNodes.lookat;  // Get the scene's lookAt node from the grid context

                /* Sets the state of the camera
                 */
                grid.createAction({

                    action:"camera.set",

                    fn:function (params, ok) {

                        if (params.eye) {
                            lookat.setEye(params.eye);
                        }

                        if (params.look) {
                            lookat.setLook(params.look);
                        }

                        if (params.up) {
                            lookat.setUp(params.up);
                        }

//                        if (params.orbit) {
//
//                            var orbit = params.orbit;
//
//
//                            var y = orbit.y;
//                            var x = orbit.x;
//                            var z = orbit.z;
//
//                            if (x == 0 & y == 0 & z == 0) {
//                                throw "camera.set illegal param: orbit x, y, and z are a zero vector";
//                            }
//
//                            var angle = orbit.a;
//
//                            var mat = Tron_math_rotationMat4v(angle * 0.0174532925, [x || 0, y || 0, z || 0]);
//
//                            var eye = lookat.getEye();
//                            eye = [eye.x, eye.y, eye.z, 1];
//
//                            var look = lookat.getEye();
//                            look = [look.x, look.y, look.z, 1];
//
//                            var vec = Tron_math_subVec4(eye, look);
//
//                            var vec2 = Tron_math_mulMat4v4(mat, vec);
//                            var eye2 = Tron_math_addVec4(look, vec2);
//
//                            lookat.setEye({
//                                x:eye2[0],
//                                y:eye2[1],
//                                z:eye2[2]
//                            });
//                        }

                        ok();
                    }
                });

                /* Gets the state of the camera
                 */
                grid.createAction({

                    action:"camera.get",

                    fn:function (params, ok) {

                        // Safest to store state in the camera node
                        // because other modules may modify it also

                        ok({
                            eye:lookat.getEye(),
                            look:lookat.getLook(),
                            up:lookat.getUp()
                        });
                    }
                });
            },

            /**
             * Destroys this module, deleting anything that it
             * previously created on the grid via its #load method.
             */
            unload:function (grid, context) {

                grid.deleteAction("camera.set");

                grid.deleteAction("camera.get");
            }
        };
    });
