/*-----------------------------------------------------------------------------------------------------
 * The modules container
 *
 * API documentation is on the wiki:
 * https://github.com/xeolabs/scenejs-grid/wiki/Modules
 *----------------------------------------------------------------------------------------------------*/

define(["app/grid"],
        function (grid) {

            var BASE_PATH = "../../content/components/modules/";

            var loadedModulesInfo = {}; // Info on modules that are currently loaded, minus methods, for querying
            var loadedModules = {};     // Modules that are currently loaded

            /* Map of resources that will be shared among all modules. Some modules will
             * create resources, while others will use them. For example, a module that
             * defines a scene graph will put particular scene nodes on this map, while
             * another module that manipulates the scene graph would update those nodes.
             */
            var resources = {};

            var docLocation = document.location.href;
            var moduleBaseURL = docLocation.substring(0, docLocation.lastIndexOf("/"));

            /**
             * Action to load one or more modules
             */
            grid.createAction({

                action: "module.load",

                fn: function(params, ok, error) {

                    var moduleIds = params.modules;

                    if (!moduleIds) {
                        throw "param expected: modules \nhttps://github.com/xeolabs/scenejs-grid/wiki/module.load";
                    }

                    var moduleConfigs = params.configs || {};

                    nextLoad(moduleIds, 0, moduleConfigs, ok, error);
                }
            });

            function nextLoad(moduleIds, moduleIdx, moduleConfigs, ok, error) {

                if (moduleIdx == moduleIds.length) {
                    ok();
                    return;
                }

                var moduleId = moduleIds[moduleIdx];
                var modulePath = BASE_PATH + moduleId;

                if (!!loadedModules[moduleId]) {

                    var err = "module already loaded: " + moduleId
                            + "\nhttps://github.com/xeolabs/scenejs-grid/wiki/Modules";

                    grid.fireEvent("error", {
                        error: err
                    });

                    error(err);

                    return;
                }

                grid.fireEvent("task.started", {
                    taskId: moduleId,
                    description: "Loading module " + moduleId
                });

                require([modulePath],
                        function(module) {

                            if (!module) {

                                var err = "module failed to load: " + moduleId
                                        + ".init \nhttps://github.com/xeolabs/scenejs-grid/wiki/Modules";

                                grid.fireEvent("task.failed", {
                                    taskId: moduleId,
                                    error: err
                                });

                                grid.fireEvent("error", {
                                    error: err
                                });

                                error(err);

                                return;
                            }


                            /* Check for init method
                             */
                            if (!module.init) {

                                var err = "module method missing: " + moduleId
                                        + ".init \nhttps://github.com/xeolabs/scenejs-grid/wiki/Modules";

                                grid.fireEvent("task.failed", {
                                    taskId: moduleId,
                                    error: err
                                });

                                grid.fireEvent("error", {
                                    error: err
                                });

                                error(err);

                                return;
                            }

                            /* Check for destroy method
                             */
                            if (!module.destroy) {

                                var err = "module method missing: "
                                        + moduleId + ".destroy \nhttps://github.com/xeolabs/scenejs-grid/wiki/Modules";

                                grid.fireEvent("task.failed", {
                                    taskId: moduleId,
                                    error: err
                                });

                                grid.fireEvent("error", {
                                    error: err
                                });

                                error(err);

                                return;
                            }

                            /* Initialise
                             */
                            try {

                                module.init(grid, resources, moduleConfigs); // Initialise the module

                            } catch (e) {

                                var err = "module init failed - " + moduleId + ".init threw an exception: "
                                        + (e.message || e) + "\nhttps://github.com/xeolabs/scenejs-grid/wiki/Modules";

                                grid.fireEvent("task.failed", {
                                    taskId: moduleId,
                                    error:err
                                });

                                grid.fireEvent("error", {
                                    error: err
                                });

                                error(err);

                                return;
                            }

                            /* Register module info
                             */
                            var moduleInfo = {
                                description: module.description || "no description",
                                src: moduleBaseURL + "/content/components/modules/" + modulePath + ".js"
                            };

                            loadedModulesInfo[moduleId] = moduleInfo;

                            loadedModules[moduleId] = module;

                            /* Notify success
                             */
                            grid.fireEvent("task.finished", {
                                taskId: moduleId,
                                description: "Loading module " + moduleId
                            });

                            nextLoad(moduleIds, moduleIdx + 1, moduleConfigs, ok, error);
                        },

                        function (err) {

                            grid.fireEvent("task.failed", {
                                taskId: moduleId,
                                message: "module load timed out"
                            });

                            var err = "module load failed - " + moduleId + ": \nhttps://github.com/xeolabs/scenejs-grid/wiki/Modules";

                            grid.fireEvent("error", {
                                error: err
                            });

                            error(err);

                            return;
                        });
            }

            /**
             * Queries what modules are currently loaded on the grid
             */
            grid.createAction({

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

            /**
             * Unloads modules
             */
            grid.createAction({

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

                            try { // TODO: Support asynch module destroy?

                                module.destroy(grid, resources);

                            } catch (e) {

                                var errorMsg = "module unload failed - " + moduleId + ".destroy threw an exception: "
                                        + (e.message || e) + "\nhttps://github.com/xeolabs/scenejs-grid/wiki/Modules";

                                grid.fireEvent("error", {
                                    error: errorMsg
                                });

                                throw errorMsg;
                            }
                        }
                    }

                    ok();
                }
            });

            /**
             * Unload all modules on grid reset
             */
            grid.onEvent(
                    "reset",
                    function() {

                    });
        });
