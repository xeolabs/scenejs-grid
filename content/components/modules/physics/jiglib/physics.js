/**
 * Module that integrates the JigLibJS physics engine into the grid
 *
 */
define(["../../../lib/jiglib.all.min"],

    function () {

        var bodies = {};
        var system;
        var _grid;

        return {

            description:"Physics system using JigLibJS",

            load:function (grid, context, configs) {

                _grid = grid;

                /*--------------------------------------------------------------------------------------------------
                 * Set up JigLibJS
                 *------------------------------------------------------------------------------------------------*/

                system = jigLib.PhysicsSystem.getInstance();

                system.setGravity(configs.gravity || [0, -9.8, 0, 0]); //-120
                system.setSolverType(configs.solver || 'ACCUMULATED'); //FAST, NORMAL, ACCUMULATED

                /*--------------------------------------------------------------------------------------------------
                 * Create actions
                 *------------------------------------------------------------------------------------------------*/

                /* Creates an body in the physics system
                 */
                grid.createAction({

                    action:"physics.create",

                    fn:function (params, ok) {

                        var bodyId = params.bodyId;

                        if (!bodyId) {
                            throw "param expected: bodyId";
                        }

                        if (bodies[bodyId]) {
                            throw "body already exists: " + bodyId;
                        }

                        var b;

                        switch (params.type) {

                            case "plane":
                                var dir = params.dir;
                                b = new jigLib.JPlane(null, [dir.x || 0, dir.y || 0, dir.z || 0, 0]);
                                break;

                            case "box":
                                b = new jigLib.JBox(null, params.width || 1.0, params.depth || 1.0, params.height || 1.0);
                                break;

                            case "sphere":
                                b = new jigLib.JSphere(null, params.radius || 1.0);
                                break;


                            default:
                                throw "body type not supported: " + params.type;
                        }

                        system.addBody(b);

                        if (params.movable != undefined) {
                            b.set_movable(!!params.movable);
                        }

                        if (params.pos) {
                            var p = params.pos;
                            b.moveTo([p.x || 0, p.y || 0, p.z || 0, 0]);
                        }

                        if (params.mass != undefined) {
                            b.set_mass(params.mass);
                        }

                        if (params.restitution != undefined) {
                            b.set_restitution(params.restitution);
                        }

                        if (params.friction != undefined) {
                            b.set_friction(params.friction);
                        }

                        if (params.velocity != undefined) {
                            var v = params.velocity;
                            b.setVelocity([v.x || 0, v.y || 0, v.z || 0, 0]);
                        }

                        bodies[bodyId] = {
                            type:params.type,
                            body:b
                        };

                        /* Notifies client when state of an body in the physics
                         * system has updated (eg. changed position)
                         */
                        grid.createEvent("physics.update." + bodyId);

                        ok();
                    }
                });

                /* Deletes a body in the physics system
                 */
                grid.createAction({

                    action:"physics.delete",

                    fn:function (params, ok) {

                        var bodyId = params.bodyId;

                        if (!bodyId) {
                            deleteAllBodies();
                            ok();
                        }

                        if (!bodies[bodyId]) {
                            ok();
                            return;
                        }

                        system.removeBody(bodies[bodyId].body);

                        delete bodies[bodyId];

                        grid.deleteEvent("physics.update." + bodyId);

                        ok();
                    }
                });

                /*--------------------------------------------------------------------------------------------------
                 * Integrate the physics system on each tick
                 *------------------------------------------------------------------------------------------------*/

                var then;

                grid.onEvent(
                    "tick",
                    function (params) {

                        var now = (new Date()).getTime();

                        var secs = (now - then) / 1000;

                        system.integrate(secs);

                        then = now;

                        var body;
                        var physBody;
                        var pos;
                        var dir;

                        for (var bodyId in bodies) {
                            if (bodies.hasOwnProperty(bodyId)) {

                                body = bodies[bodyId];
                                physBody = body.body;

                                pos = physBody.get_currentState().position;
                                dir = physBody.get_currentState().get_orientation().glmatrix;

                                grid.fireEvent("physics.update." + bodyId, {
                                    pos:{ x:pos[0], y:pos[1], z:pos[2] },
                                    dir:dir
                                });
                            }
                        }
                    });
            },

            unload:function (grid, context) {

                grid.deleteAction("physics.create");

                grid.deleteAction("physics.delete");

                deleteAllBodies();
            }
        };

        function deleteAllBodies() {

            for (var bodyId in bodies) {
                if (bodies.hasOwnProperty(bodyId)) {

                    system.removeBody(bodies[bodyId].body);

                    delete bodies[bodyId];

                    _grid.deleteEvent("physics.update." + bodyId);
                }
            }
        }
    });
