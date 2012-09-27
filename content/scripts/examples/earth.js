/* 1. Load the scene graph manager module into the grid
 */
grid.send({
        action:"module.load",
        modules:["scenes/scene"],
        configs:{
            canvasId:"theCanvas"
        }
    },
    function () {

        /* 2. Load modules for managing camera, mouse and earth
         *    which will use resources provided by the scene manager module
         */

        grid.send({
                action:"module.load",
                modules:[
                    "camera/camera",
                    "input/mouse",
                    "objects/planets/earth",
                    "objects/skies/milkyway"
                ]
            },
            function () {

                /*------------------------------------------------------------------------
                 * Crude canvas pan control
                 *----------------------------------------------------------------------*/

                var x = 0;
                var y = 0;

                var lastX;
                var lastY;

                var dragging = false;

                /* Set initial camera state
                 */
                grid.send({
                    action:"camera.set",
                    eye:{ x:x, y:y, z:5 },
                    look:{ y:0.0 },
                    up:{ y:1.0 }
                });

                /* Mouse handlers
                 */
                grid.onEvent(
                    "mouse.down",
                    function (params) {
                        dragging = true;
                    });

                grid.onEvent(
                    "mouse.move",
                    function (params) {

                        if (dragging && lastX != null) {

                            x += params.canvasX - lastX;
                            y += params.canvasY - lastY;

                            grid.send({
                                action:"camera.set",
                                eye:{
                                    x:x * 0.1,
                                    y:y * 0.1
                                }
                            });
                        }

                        lastX = params.canvasX;
                        lastY = params.canvasY;
                    });

                grid.onEvent(
                    "mouse.up",
                    function (params) {
                        dragging = false;
                        lastX = null;
                    });
            });
    });