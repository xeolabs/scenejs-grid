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

            /* 2. Load modules for managing camera, mouse and earth
             *    which will use resources provided by the scene manager module
             */

            grid.send({
                action: "module.load",
                modules: [
                    "camera/camera",
                    "input/mouse",
                    "objects/planets/earth",
                    "objects/skies/milkyway"
                ]
            },
                    function() {

                        grid.send({
                            action:"camera.set",
                            eye : { x: 0.0, y: 0.0, z: 7 },
                            look : { y:0.0 },
                            up : { y: 1.0 }
                        });

                        /* 3. Wire together various events and actions
                         * defined by the modules
                         */

                        var rotateX = 0;
                        var rotateY = 0;

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

                                        rotateX += params.canvasY - lastY;
                                        rotateY += params.canvasX - lastX;

                                        grid.send({
                                            action:"earth.set",
                                            rotateX: rotateX * 0.3,
                                            rotateY: rotateY * 0.3
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