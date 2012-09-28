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

        /* 2. Load modules for managing tanks, mouse input and camera,
         *    which will use resources provided by the scene manager module
         */

        grid.send({
                action:"module.load",
                modules:[
                    "objects/vehicles/tank/tank",
                    "objects/skies/clouds",
                    "objects/floors/grid",
                    "input/mouse",
                    "camera/camera"
                ]
            },
            function () {

                /* 3. Create some tanks via action defined by
                 * the tank management module
                 */

                for (var x = -200; x <= 200; x += 50) {
                    for (var z = -200; z <= 200; z += 50) {
                        grid.send({
                            action:"tank.create",
                            pos:{ x:x, y:0, z:z },
                            visible:true,
                            dir:Math.random() * 360,
                            gunDir:Math.random() * 360
                        });
                    }
                }

                /*------------------------------------------------------------------------
                 * Crude canvas pan control
                 *----------------------------------------------------------------------*/

                var x = 0;
                var y = 10;

                var lastX;
                var lastY;

                var dragging = false;

                /* Set initial camera state
                 */
                grid.send({
                    action:"camera.set",
                    eye:{ x:x, y:y, z:25 },
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

                            if (y < 10) {
                                y = 10;
                            }

                            grid.send({
                                action:"camera.set",
                                eye:{
                                    x:x * 0.5,
                                    y:y * 0.5
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