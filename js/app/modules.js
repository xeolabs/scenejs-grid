/**
 * Modules container
 */
define(["module"], // RequireJS native module
        function (module) {

            /* Although not part of the RequireJS API, 'module' is a special dependency
             * that is processed by the RequireJS core, from which we can get the current
             * module fileName and path. This is not part of the RequireJS API however.
             *
             * http://www.angrycoding.com/2011/09/managing-dependencies-with-requirejs.html
             */
            var uri = module.uri;
            var basePath = uri.substring(0, uri.lastIndexOf("/"));

            var loadedModulesInfo = {}; // Info on modules that are currently loaded, for querying
            var loadedModules = {};     // Modules that are currently loaded

            var _engine;
            var _resources;

            return {

                init: function(engine, resources) {

                    _engine = engine;
                    _resources = resources;


                    /*---------------------------------------------------------------------------------
                     * Module loading
                     *-------------------------------------------------------------------------------*/

                    var actionsCreated = {};

                    engine.onEvent("action.created",
                            function(params) {
                                actionsCreated[params.action] = {};
                            });

                    engine.createEvent("module.loaded");

                    engine.createAction({

                        action: "module.load",

                        fn: function(params, ok, error) {

                            var modules = params.modules;

                            if (!modules) {
                                throw "param required: modules";
                            }

                            var modulePaths = [];

                            for (var i = 0, len = modules.length; i < len; i++) {
                                modulePaths.push("../../content/modules/" + modules[i]);
                            }

                            var moduleConfigs = params.configs || {};

                            engine.fireEvent("taskstarted", {
                                taskId: "module.loading",
                                description: "Loading modules"
                            });

                            require(modulePaths, // Load the modules

                                    function() {

                                        var module;
                                        var moduleId;

                                        for (var i = 0, len = modules.length; i < len; i++) {

                                            module = arguments[i];

                                            if (!module.init) {
                                                error("can't load module - it does not have this mandatory method: " + moduleId + ".init");
                                                return;
                                            }

                                            if (!module.destroy) {
                                                error("can't load module - it does not have this mandatory method: " + moduleId + ".destroy");
                                                return;
                                            }

                                            actionsCreated = {};

                                            module.init(engine, resources, moduleConfigs); // Initialise the module

                                            engine.fireEvent("taskdone", {
                                                taskId: "module.loading"
                                            });

                                            moduleId = modules[i];

                                            var moduleInfo = {
                                                description: module.description || "no description",
                                                events: [],
                                                actions: actionsCreated
                                            };

                                            loadedModulesInfo[moduleId] = moduleInfo;

                                            loadedModules[moduleId] = module;
                                            
                                            engine.fireEvent("module.loaded", moduleInfo); // Notify that the module is loaded
                                        }

                                        ok();
                                    });
                        }
                    });


                    /*---------------------------------------------------------------------------------
                     * Module querying
                     *-------------------------------------------------------------------------------*/

                    engine.createAction({

                        action: "module.get",

                        fn: function(params, ok) {

                            var moduleId = params.moduleId;

                            if (moduleId) {

                                var moduleInfo = loadedModulesInfo[moduleId];

                                if (moduleInfo) {
                                    var data = {};
                                    data[moduleId] = moduleInfo;
                                    ok(data);
                                }
                            } else {
                                ok(loadedModulesInfo);
                            }
                        }
                    });


                    /*---------------------------------------------------------------------------------
                     * Module unloading
                     *-------------------------------------------------------------------------------*/

                    engine.createEvent("module.unloaded");

                    engine.createAction({

                        action: "module.unload",

                        fn: function(params, ok, error) {

                            var modules = params.modules;
                            var moduleId;
                            var moduleInfo;
                            var module;

                            if (!modules) {

                                /* Unloading all modules
                                 */
                                modules = [];

                                for (moduleId in loadedModules) {
                                    if (loadedModules.hasOwnProperty(moduleId)) {
                                        modules.push(moduleId);
                                    }
                                }
                            }

                            /* Unload the module(s)
                             */
                            for (var i = 0, len = modules.length; i < len; i++) {

                                moduleId = modules[i];

                                moduleInfo = loadedModulesInfo[moduleId];

                                if (moduleInfo) { // Silently ignore absent modules

                                    module = loadedModules[moduleId];

                                    delete loadedModulesInfo[moduleId];
                                    delete loadedModules[moduleId];

                                    module.destroy(_engine, _resources);

                                    engine.fireEvent("module.unloaded", moduleInfo); // Notify that each module is unloaded
                                }
                            }

                            ok();
                        }
                    });

                    engine.onEvent(
                            "reset",
                            function() {

                            });
                }
            };
        });
