/*
 * Simple grid physics example
 *
 */
grid.send({
        action:"module.load",
        modules:["scenes/scene"],
        configs:{
            canvasId:"theCanvas"
        }
    },
    function () {

        grid.send({
                action:"module.load",
                modules:[
                    "camera/camera",
                    "input/mouse",
                    "objects/floors/grid",
                    "physics/jiglib/physics",
                    "objects/prims/prims"
                ]
            },
            function () {

                /*-------------------------------------------------------------------------
                 * Create blocks
                 *-----------------------------------------------------------------------*/

                var objectId;
                var i = 0;
                var y = 0;

                for (var x = -2; x < 2; x += .7) {
                    for (var z = -2; z < 2; z += .7) {
                        objectId = "box." + i++;
                        createBox(objectId, { x:0, y:(Math.random() * 250) + 10, z:0 });
                    }
                }

                /** Creates a box primitive with a physics body

                 */
                function createBox(objectId, pos) {

                    /* Create cube primitive
                     */
                    grid.send({
                        action:"prims.create",
                        type:"sphere",
                        primId:objectId,
                        // radius: 1.0,
                        pos:pos,
                        rotate:[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],

                        material:{
                            baseColor:{
                                r:Math.random(),
                                g:Math.random(),
                                b:Math.random()
                            }
                        }
                    });

                    /* Create physics body
                     */
                    grid.send({
                        action:"physics.create",
                        type:"sphere",
                        bodyId:objectId,
                        radius:0.9,
                        restitution:1000000,
                        velocity:{
                            x:(Math.random() * 2) - 1,
                            y:(Math.random() * -15) - 5,
                            z:(Math.random() * 2) - 1

                        },
                        mass:(Math.random() * 50) + 10,
                        pos:pos,
                        movable:true,
                        friction:0.0000
                    });

                    /* Bind box pos and orientation to updates from the physics body
                     */
                    grid.onEvent(
                        "physics.update." + objectId,

                        function (params) {

                            var pos = params.pos; // New position
                            var dir = params.dir; // New rotation matrix

                            /* Update box primitive
                             */
                            grid.send({
                                action:"prims.set",
                                primId:objectId,
                                pos:pos,
                                rotate:dir
                            });
                        });
                }

                /*-------------------------------------------------------------------------
                 * Ground plane
                 *
                 * Using the "objects/floors/grid" module to render the ground plane
                 *-----------------------------------------------------------------------*/

                /* Create ground plane physics body
                 */
                grid.send({
                    action:"physics.create",
                    type:"plane",
                    bodyId:"myPlane",
                    dir:{
                        y:1
                    },
                    pos:{
                        y:.5
                    },
                    friction:10
                });


                /*------------------------------------------------------------------------
                 * Crude canvas pan control
                 *----------------------------------------------------------------------*/

                var x = 20;
                var y = 20;

                var lastX;
                var lastY;

                var dragging = false;

                /* Set initial camera state
                 */
                grid.send({
                    action:"camera.set",
                    eye:{ x:x, y:y, z:40 },
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