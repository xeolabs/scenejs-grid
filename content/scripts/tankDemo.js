/* 1. Load the scene graph manager module into the engine
 */

engine.send({
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

            engine.send({
                action: "module.load",
                modules: [
                    "vehicles/tank/tank",
                    "skies/sky",
                    "floors/grid",
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
                                engine.send({
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

                        engine.onEvent(
                                "mouse.down",
                                function(params) {
                                    lastX = params.canvasX;
                                    lastY = params.canvasY;
                                    dragging = true;
                                });

                        engine.onEvent(
                                "mouse.move",
                                function(params) {

                                    if (dragging) { // A ridiculously crude drag-pan control

                                        engine.send({
                                            action:"camera.set",
                                            eye: {
                                                x: params.canvasX * 0.1,
                                                z: params.canvasY * 0.1
                                            }
                                        });
                                    }

                                    lastX = params.canvasX;
                                    lastY = params.canvasY;
                                });

                        engine.onEvent(
                                "mouse.up",
                                function(params) {
                                    dragging = false;
                                });
                    });
        });