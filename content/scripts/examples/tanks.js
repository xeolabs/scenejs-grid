/* 1. Load the scene graph manager module into the grid
 */

grid.send({
    action: "module.load",
    modules: ["scenes/scene"],
    configs: {
        canvasId: "theCanvas"
    }
},
        function() {

            /* 2. Load modules for managing tanks, mouse input and camera,
             *    which will use resources provided by the scene manager module
             */

            grid.send({
                action: "module.load",
                modules: [
                    "objects/vehicles/tank/tank",
                    "objects/skies/milkyway",
                    "objects/floors/grid",
                    "input/mouse",
                    "camera/camera"
                ]
            },
                    function() {

                        /* 3. Create some tanks via action defined by
                         * the tank management module
                         */

                        for (var x = -200; x <= 200; x += 50) {
                            for (var z = -200; z <= 200; z += 50) {
                                grid.send({
                                    action:"tank.create",
                                    pos: { x: x, y: 0, z: z },
                                    visible: true,
                                    dir: Math.random() * 360,
                                    gunDir: Math.random() * 360
                                });
                            }
                        }

                        /* 4. Wire together various events and actions
                         * defined by the modules
                         */

                        var lastX;
                        var lastY;
                        var dragging = false;

                        grid.onEvent(
                                "mouse.down",
                                function(params) {
                                    lastX = params.canvasX;
                                    lastY = params.canvasY;
                                    dragging = true;
                                });

                        grid.onEvent(
                                "mouse.move",
                                function(params) {

                                    if (dragging) { // A ridiculously crude drag-pan control

                                        grid.send({
                                            action:"camera.set",
                                            eye: {
                                                x: params.canvasX * 0.1,
                                                y: 50,
                                                z: params.canvasY * 0.1
                                            }
                                        });
                                    }

                                    lastX = params.canvasX;
                                    lastY = params.canvasY;
                                });

                        grid.onEvent(
                                "mouse.up",
                                function(params) {
                                    dragging = false;
                                });
                    });
        });