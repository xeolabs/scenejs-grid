define(["../../../lib/scenejs.box"],

    function () {

        var node; // Grid floor subgraph, created in #load and destroyed in #unload

        return {

            description:"Grid floor like in Tron",

            load:function (grid, context, configs) {

                grid.createAction({
                    action:"floor.show",
                    fn:function (params) {

                        node.setEnabled(true); // Set 'enabled' flag
                    }
                });

                grid.createAction({
                    action:"floor.hide",
                    fn:function (params) {

                        node.setEnabled(false); // Unset 'enabled' flag
                    }
                });

                node = context.sceneNodes.content.addNode({

                    type:"flags",
                    id:"floor-root",

                    flags:{
                        enabled:true
                    },

                    nodes:[
                        {

                            type:"material",

                            id:"grid-floor",

                            baseColor:{ r:1.0, g:1.0, b:1.0 },
                            specularColor:{ r:0.0, g:0.0, b:0.0 },
                            specular:0.2,
                            shine:2.0,

                            nodes:[

                                /* Texture URIs are relative to the location of index.html
                                 */
                                {
                                    type:"texture",

                                    layers:[
                                        {
                                            uri:"content/components/textures/grid.jpg",
                                            minFilter:"linearMipMapLinear",
                                            magFilter:"linear",
                                            wrapS:"repeat",
                                            wrapT:"repeat",
                                            isDepth:false,
                                            depthMode:"luminance",
                                            depthCompareMode:"compareRToTexture",
                                            depthCompareFunc:"lequal",
                                            flipY:false,
                                            width:1,
                                            height:1,
                                            internalFormat:"lequal",
                                            sourceFormat:"alpha",
                                            sourceType:"unsignedByte",
                                            applyTo:"baseColor",
                                            blendMode:"multiply",
                                            scale:{ x:300, y:300, z:1.0 }
                                        }
                                    ],
                                    nodes:[
                                        {
                                            type:"scale",

                                            x:6400,
                                            y:.5,
                                            z:4800,

                                            nodes:[
                                                {
                                                    type:"geometry",

                                                    asset:{
                                                        type:"box"
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                });
            },

            unload:function (grid, context) {

                grid.deleteAction("floor.show");

                grid.deleteAction("floor.hide");

                node.destroy();
            }
        };
    });
