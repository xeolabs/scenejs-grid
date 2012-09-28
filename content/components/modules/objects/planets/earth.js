/**
 * Example module which integrates the Earth
 *
 */
define(["../../../lib/scenejs.sphere"],

    function () {

        var rootNode;           // Root of subgraph containing the Earth, created in #load and destroyed in #unload
        var earthRotateNode;
        var cloudsRotateNode;
        var earthRotateXNode;
        var earthRotateYNode;

        return {

            description:"The Earth with color, specular and emission maps, with cloud layer using an alpha map",

            load:function (grid, context, configs) {

                /**
                 * Define action to update teapot state
                 */
                grid.createAction({
                    action:"earth.set",
                    fn:function (params) {

                        if (params.visible != undefined) {
                            rootNode.setEnabled(!!params.visible); // Set 'enabled' flag
                        }

                        if (params.rotateX) {
                            earthRotateXNode.setAngle(params.rotateX);
                        }

                        if (params.rotateY) {
                            earthRotateYNode.setAngle(params.rotateY);
                        }
                    }
                });

                /**
                 * Create the teapot in the scene graph
                 */
                rootNode = context.sceneNodes.content.addNode({
                    type:"flags",
                    flags:{
                        enabled:true
                    },
                    nodes:[
                        {
                            type:"rotate",
                            id:"earth.pitch",
                            x:1,
                            nodes:[
                                {
                                    type:"rotate",
                                    id:"earth.yaw",
                                    y:1,
                                    nodes:[
                                        {
                                            type:"rotate",
                                            z:1,
                                            angle:195,
                                            nodes:[
                                                {
                                                    type:"rotate",
                                                    y:1,
                                                    id:"earth.spin",

                                                    nodes:[

                                                        /*--------------------------------------------------------------
                                                         * Layer 0: Earth's surface with color, specular
                                                         * and emissive maps
                                                         *------------------------------------------------------------*/

                                                        {
                                                            type:"layer",
                                                            priority:0,

                                                            nodes:[
                                                                {
                                                                    type:"scale",
                                                                    x:2,
                                                                    y:2,
                                                                    z:2,

                                                                    nodes:[

                                                                        {
                                                                            type:"texture",
                                                                            layers:[

                                                                                /*---------------------------------------------------------
                                                                                 * Underlying texture layer applied to the Earth material's
                                                                                 * baseColor to render the continents, oceans etc.
                                                                                 *--------------------------------------------------------*/
                                                                                {
                                                                                    src:"content/components/textures/earth.jpg",
                                                                                    applyTo:"baseColor",
                                                                                    blendMode:"multiply",
                                                                                    flipY:false
                                                                                },

                                                                                /*---------------------------------------------------------
                                                                                 * Second texture layer applied to the Earth material's
                                                                                 * specular component to make the ocean shiney.
                                                                                 *--------------------------------------------------------*/
                                                                                {
                                                                                    src:"content/components/textures/earth-specular.gif",
                                                                                    applyTo:"specular",
                                                                                    blendMode:"multiply",
                                                                                    flipY:false
                                                                                } ,
                                                                                //

                                                                                /*---------------------------------------------------------
                                                                                 * Second texture layer applied to the Earth material's
                                                                                 * emission component to show lights on the dark side.
                                                                                 *--------------------------------------------------------*/
                                                                                {
                                                                                    src:"content/components/textures/earth-lights.gif",
                                                                                    applyTo:"emit",
                                                                                    blendMode:"add",
                                                                                    flipY:false
                                                                                }
                                                                            ],

                                                                            /*---------------------------------------------------------
                                                                             * Sphere with some material
                                                                             *--------------------------------------------------------*/
                                                                            nodes:[

                                                                                {
                                                                                    type:"material",
                                                                                    specular:5,
                                                                                    shine:100,
                                                                                    emit:0.0,
                                                                                    baseColor:{r:1, g:1, b:1},
                                                                                    nodes:[
                                                                                        {
                                                                                            type:"geometry",
                                                                                            asset:{
                                                                                                type:"sphere"
                                                                                            }
                                                                                        }
                                                                                    ]
                                                                                }
                                                                            ]
                                                                        }
                                                                    ]
                                                                }
                                                            ]
                                                        },

                                                        /*--------------------------------------------------------------
                                                         * Layer 1: Cloud layer with alpha map
                                                         *------------------------------------------------------------*/

                                                        {
                                                            type:"layer",
                                                            priority:1,

                                                            nodes:[

                                                                {
                                                                    type:"flags",


                                                                    flags:{
                                                                        transparent:true,
                                                                        specular:false,
                                                                        blendFunc:{
                                                                            sfactor:"srcAlpha",
                                                                            dfactor:"one"
                                                                        },
                                                                        backfaces:true  // TODO: Sphere backfaces seem to be reversed if this is needed
                                                                    },

                                                                    nodes:[
                                                                        {
                                                                            type:"scale",
                                                                            x:2.05,
                                                                            y:2.05,
                                                                            z:2.05,

                                                                            nodes:[

                                                                                /*------------------------------------------------------------------
                                                                                 *
                                                                                 *----------------------------------------------------------------*/

                                                                                {
                                                                                    type:"texture",
                                                                                    layers:[

                                                                                        /*---------------------------------------------------------
                                                                                         *  Alpha map
                                                                                         *
                                                                                         *--------------------------------------------------------*/

                                                                                        {
                                                                                            src:"content/components/textures/earthclouds.jpg",
                                                                                            applyTo:"alpha",
                                                                                            blendMode:"multiply",
                                                                                            flipY:false
                                                                                        }

                                                                                    ],

                                                                                    /*---------------------------------------------------------
                                                                                     * Sphere with some material
                                                                                     *--------------------------------------------------------*/

                                                                                    nodes:[
                                                                                        {
                                                                                            type:"node",
                                                                                            z:1,
                                                                                            angle:195,
                                                                                            nodes:[
                                                                                                {
                                                                                                    type:"rotate",
                                                                                                    y:1,
                                                                                                    id:"earth.clouds.spin",
                                                                                                    nodes:[
                                                                                                        {
                                                                                                            type:"material",
                                                                                                            specular:0,
                                                                                                            shine:0.0001,
                                                                                                            emit:0.0,
                                                                                                            alpha:1.0,
                                                                                                            baseColor:{
                                                                                                                r:1, g:1, b:1
                                                                                                            },
                                                                                                            nodes:[
                                                                                                                {
                                                                                                                    type:"geometry",
                                                                                                                    asset:{
                                                                                                                        type:"sphere"
                                                                                                                    }
                                                                                                                }
                                                                                                            ]

                                                                                                        }
                                                                                                    ]
                                                                                                }
                                                                                            ]
                                                                                        }
                                                                                    ]
                                                                                }
                                                                            ]
                                                                        }
                                                                    ]
                                                                }
                                                            ]
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                });

                /* Get references to nodes we want to update
                 */
                var scene = rootNode.getScene();

                earthRotateNode = scene.getNode("earth.spin");
                cloudsRotateNode = scene.getNode("earth.clouds.spin");
                earthRotateXNode = scene.getNode("earth.pitch");
                earthRotateYNode = scene.getNode("earth.yaw");

                var earthRotate = 0;
                var cloudsRotate = 0;

                grid.onEvent(
                    "tick",
                    function () {
                        earthRotateNode.setAngle(earthRotate);
                        cloudsRotateNode.setAngle(cloudsRotate);

                        earthRotate -= 0.02;
                        cloudsRotate -= 0.06;
                    });
            },

            unload:function (grid, context) {

                grid.deleteAction("earth.set");

                rootNode.destroy();
            }
        };
    });
