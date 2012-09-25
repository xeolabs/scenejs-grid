define(function() {

    var node; // Sky subgraph, created in #init and destroyed in #destroy

    return {

        description: "Milky Way sky sphere",

        init: function(grid, resources, configs) {

            grid.createAction({
                action: "milkyway.show",
                fn: function(params) {
                    node.setEnabled(true); // Set 'enabled' flag
                }
            });

            grid.createAction({
                action: "milkyway.hide",
                fn: function(params) {
                    node.setEnabled(false); // Unset 'enabled' flag
                }
            });

            node = resources.sceneNodes.sky.addNode({

                type: "flags",  // Flags allow us to show/hide the sky

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

                                baseColor: { r: 1, g: 1, b: 1 },
                                emit: 1.0,

                                nodes: [
                                    {
                                        type: "texture",
                                        layers: [
                                            {
                                                src: "content/components/textures/milky-way.gif",
                                                applyTo:"baseColor",
                                                blendMode: "multiply",
                                                flipY: false,
                                                scale: {
                                                    x: 1.5,
                                                    y: 1.0
                                                }
                                            }
                                        ],

                                        nodes: [
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
                    }
                ]
            });
        },

        destroy: function(grid, resources) {

            grid.deleteAction("milkyway.show");

            grid.deleteAction("milkyway.hide");

            node.destroy();
        }
    };
});
