define(function() {

    var node; // Sky subgraph, created in #init and destroyed in #destroy

    return {

        description: "Sky with a hazy horizon line",

        init: function(engine, resources, configs) {

            engine.createAction({
                action: "sky.show",
                fn: function(params) {
                    node.setEnabled(true); // Set 'enabled' flag
                }
            });

            engine.createAction({
                action: "sky.hide",
                fn: function(params) {
                    node.setEnabled(false); // Unset 'enabled' flag
                }
            });

            node = resources.sceneNodes.sky.addNode({

                type: "flags",  // Flags allow us to show/hide the sky
                id: "sky-root",

                flags: {
                    enabled: true
                },

                nodes: [
                    {
                        type: "scale",

                        x: 1000,
                        y: 1000,
                        z: 1000,

                        nodes: [
                            {
                                type: "material",

                                baseColor: { r: .3, g: .3, b: 1.0 },
                                emit: 0.3,

                                nodes: [ // TODO: wrap in texture
                                    {
                                        type: "geometry",
                                        asset: {
                                            type: "sphere"
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });
        },

        destroy: function(engine, resources) {

            engine.deleteAction("sky.show");

            engine.deleteAction("sky.hide");

            node.destroy();
        }
    };
});
