define(["./_tankFactory"],

    function (tankFactory) {

        /** The set of currently existing tanks
         */
        var activeTanks = {};

        /** Reuse pool of destroyed tanks
         */
        var freeTanks = {};

        /** Container node in scene graph where tank nodes will be added
         */
        var containerNode;

        /**
         * Public module members
         */
        return {

            displayName:"Tron tank objects",

            description:"The Tank is one of many vehicles in the computer world. The tank is mainly used by " +
                "military-security programs and hacker programs. Its main weapon (if not its only weapon) " +
                "is a large cannon mounted on top of the tank that can rotate 360°. Each tank holds one operator " +
                "who acts as driver, gun operator, and radioman. Normally however, three programs are needed to " +
                "operate a tank (especially for military operations), however one operator is enough, especially " +
                "for hacking purposes.",

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

                /* Create scene node that will contain our tanks
                 */
                containerNode = context.sceneNodes.content.addNode({

                    type:"shader",
                    id:"tank-shader",

                    shaders:[
                        {
                            stage:"vertex",

                            /* A GLSL snippet containing a custom function.
                             *
                             * The snippet can be given as either a string or an array
                             * of strings.
                             */
                            code:[
                                "uniform float time;",

                                "vec4 myModelPosFunc(vec4 pos){",
                                "   pos.x+=sin(pos.x*5.0+time+10.0)*150.0;",
                                "   pos.y+=sin(pos.y*5.0+time+10.0)*150.0;",
                                "   pos.z+=sin(pos.z*5.0+time+10.0)*150.0;",
                                "   return pos;",
                                "}"],

                            /* Bind our custom function to a SceneJS vertex shader hook
                             */
                            hooks:{
                                //      modelPos: "myModelPosFunc"
                            }
                        },

                        {
                            stage:"fragment",
                            code:[

                                "uniform vec4 colorScale;",

                                "vec4 tweakPixelColor(vec4 color) {",
                                "   color *= colorScale;",
                                "   return color; ",
                                "}"
                            ],

                            hooks:{
                                pixelColor:"tweakPixelColor"
                            }
                        }
                    ],

                    params:{
                        colorScale:[1.0, 1.0, 1.0, 1.0],
                        time:10
                    }
                });

                //
                //                    grid.onEvent(
                //                            "reset",
                //                            function() {
                //                                destroyAllTanks();
                //                            });

                /**
                 * Create action to create a tank
                 */
                grid.createAction({
                    action:"tank.create",
                    fn:function (params) {
                        createTank(grid, params);
                    }
                });

                /**
                 * Create action to update the state of a tank
                 */
                grid.createAction({
                    action:"tank.set",
                    fn:function (params) {

                        var tankId = params.tankId;
                        if (!tankId) {
                            throw "param expected: tankId";
                        }

                        var tank = activeTanks[tankId];

                        if (tank) {

                            if (params.pos) {
                                tank.setPos(params.pos);
                            }

                            if (params.dir) {
                                tank.setDir(params.dir);
                            }

                            if (params.gunDir) {
                                tank.setGunDir(params.gunDir);
                            }

                            var visible = params.visible;

                            if (visible != undefined && visible != null) {
                                tank.setVisible(visible);
                            }
                        }
                    }
                });

                /**
                 * Create action to destroy a tank
                 */
                grid.createAction({
                    action:"tank.destroy",
                    fn:function (params) {

                        if (!params.tankId) {
                            throw "param expected: tankId";
                        }

                        destroyTank(params.tankId);
                    }
                });

            },

            /**
             * Destroys this module, deleting anything that it previously
             * created on the grid and scene graph via the #load method.
             */
            unload:function (grid, context) {

                containerNode.destroy();  // Destroy container scene node

                grid.deleteAction("tank.create");

                grid.deleteAction("tank.set");

                grid.deleteAction("tank.destroy");
            }
        };

        /**
         * Creates a tank, recycling one from the destroyed tank pool if possible
         */
        function createTank(grid, params) {

            params = params || {};

            var tank = getFreeTank();

            if (tank) {
                activeTanks[tank.id] = tank;
            }

            if (!tank) {

                var i = 0;
                var id;

                while (true) {
                    id = "tank" + i;
                    if (!activeTanks[id]) {
                        tank = activeTanks[id] = tankFactory.newTank(
                            grid,
                            containerNode,
                            id);
                        break;
                    }
                    i++;
                }
            }

            var pos = params.pos || {};

            tank.setPos({x:pos.x || 0, y:pos.y || 0, z:pos.z || 0 });
            tank.setDir(params.dir || 0);
            tank.setGunDir(params.gunDir || 0);

            var visible = params.visible;

            if (visible != undefined && visible != null) {
                tank.setVisible(visible);
            }

            return tank;
        }

        /**
         * Tries to get a tank from the destroyed tank pool
         */
        function getFreeTank() {
            for (var id in freeTanks) {
                if (freeTanks.hasOwnProperty(id)) {
                    var tank = freeTanks[id];
                    delete freeTanks[id];
                    return tank;
                }
            }
            return null;
        }

        /**
         * Destroys a tank, putting it in the destroyed tanks pool for reuse
         */
        function destroyTank(tankId) {
            var tank = activeTanks[tankId];
            if (!tank) {
                return;
            }
            tank.setVisible(false);
            delete activeTanks[tankId];
            freeTanks[tankId] = tank;
        }

        /**
         * Destroys all tanks, putting them in the destroyed tanks pool for reuse
         */
        function destroyAllTanks() {
            for (var tankId in activeTanks) {
                if (activeTanks.hasOwnProperty(tankId)) {
                    destroyTank(tankId);
                }
            }
        }
    });
