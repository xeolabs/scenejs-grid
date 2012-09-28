/**
 * Example module which manages a Newell Teapot model
 *
 */
define([
    "../../../lib/scenejs.teapot",
    "../../../lib/scenejs.box",
    "../../../lib/scenejs.sphere"
],
    function () {

        var containerNode;  // Scene node containing all our prims

        var prims = {};

        return {

            description:"Geometric primitives",

            load:function (grid, context, configs) {

                /**
                 * Container node for primitives
                 */
                containerNode = context.sceneNodes.content.addNode({
                    type:"node"
                });

                /**
                 * Creates a primitive
                 */
                grid.createAction({
                    action:"prims.create",
                    fn:function (params, ok) {

                        var primId = params.primId;

                        if (!primId) {
                            throw "param expected: primId";
                        }

                        if (prims[primId]) {
                            throw "ID used by another prim: " + primId;
                        }

                        var type = params.type;

                        if (!type) {
                            throw "param expected: type";
                        }

                        var rootNode;
                        var buildNode;
                        var posNode;
                        var rotateXNode;
                        var rotateYNode;
                        var rotateNode;
                        var scaleNode;
                        var materialNode;
                        var geoNode;

                        rootNode = buildNode = containerNode.addNode({
                            type:"flags",
                            flags:{
                                enabled:true
                            }
                        });

                        if (params.pos) {

                            var pos = params.pos;

                            buildNode = posNode = buildNode.addNode({
                                type:"translate",
                                x:pos.x || 0,
                                y:pos.y || 0,
                                z:pos.z || 0
                            });
                        }

                        if (params.rotateX != undefined) {
                            buildNode = rotateXNode = buildNode.addNode({
                                type:"rotate",
                                angle:params.rotateX,
                                x:1.0
                            });
                        }

                        if (params.rotateY != undefined) {
                            buildNode = rotateYNode = buildNode.addNode({
                                type:"rotate",
                                angle:params.rotateY,
                                y:1.0
                            });
                        }
//
//                    if (params.rotate) {
//                        buildNode = matrixNode = buildNode.addNode({
//                            type:"matrix",
//                            matrix:params.rotate
//                        });
//                    }

                        if (params.scale) {

                            var scale = params.scale;

                            buildNode = scaleNode = buildNode.addNode({
                                type:"scale",
                                x:scale.x || 1,
                                y:scale.y || 1,
                                z:scale.z || 1
                            });
                        }

                        var material = params.material || {};
                        var baseColor = material.baseColor || {};

                        buildNode = materialNode = buildNode.addNode({
                            type:"material",
                            emit:0,
                            baseColor:baseColor,
                            specularColor:{ r:0.9, g:0.9, b:0.9 },
                            specular:1.0,
                            shine:70.0
                        });

                        try {
                            geoNode = buildNode.addNode({
                                type:"geometry",
                                asset:{
                                    type:type
                                }
                            });
                        } catch (e) {
                            throw e;
                        }

                        var prim = {
                            primId:primId,
                            rootNode:rootNode,
                            posNode:posNode,
                            rotateXNode:rotateXNode,
                            rotateYNode:rotateYNode,
                            rotateNode:rotateNode,
                            scaleNode:scaleNode,
                            materialNode:materialNode,
                            geoNode:geoNode
                        };

                        prims[primId] = prim;

                        setPrimProps(prim, params);

                        ok();
                    }
                });

                /**
                 * Set state of a primitive
                 */
                grid.createAction({
                    action:"prims.set",
                    fn:function (params) {

                        var primId = params.primId;

                        if (!primId) {
                            throw "param expected: primId";
                        }

                        var prim = prims[primId];

                        if (!prim) {
                            throw "prim not found: " + primId;
                        }

                        setPrimProps(prim, params);
                    }
                });

                function setPrimProps(prim, params) {

                    if (params.visible != undefined) {
                        prim.rootNode.setEnabled(!!params.visible); // Set 'enabled' flag
                    }

                    if (params.rotateX != undefined && prim.rotateXNode) {
                        prim.rotateXNode.setAngle(params.rotateX);
                    }

                    if (params.rotateY != undefined && prim.rotateYNode) {
                        prim.rotateYNode.setAngle(params.rotateY);
                    }

                    if (params.pos && prim.posNode) {
                        prim.posNode.setXYZ(params.pos);
                    }

                    if (params.rotate && prim.rotateNode) {
                        prim.rotateNode.setMatrix(params.matrix);
                    }

                    if (params.scale && prim.scaleNode) {
                        prim.scaleNode.setXYZ(params.scale);
                    }

                    var material = params.material;

                    if (material && prim.materialNode) {

                        prim.materialNode.set(material);

                        if (material.baseColor && material.baseColor.a < 1.0) {
                            prim.rootNode.setTransparent(true);
                        } else {
                            prim.rootNode.setTransparent(false);
                        }
                    }
                }

                /**
                 * Deletes a primitive
                 */
                grid.createAction({

                    action:"prims.delete",

                    fn:function (params, ok) {

                        var primId = params.primId;

                        if (!primId) {
                            throw "param expected: primId";
                        }

                        var prim = prims[params.primId];

                        if (!prim) {
                            ok();
                        }

                        prim.rootNode.destroy();

                        delete prims[params.primId];
                    }
                });
            },

            unload:function (grid, context) {

                grid.deleteAction("prims.set");

                containerNode.destroy();
            }
        };
    });
