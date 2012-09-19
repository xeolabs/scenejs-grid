/**
 * Engine module which provides actions for accessing the URL the engine is loaded on
 */
define(function() {

    return {

        /**
         * Display name for the module, intended for showing in menu widgets
         */
        displayName: "Access to the request URL",

        /**
         * Brief description of the module
         */
        description: "Provides actions for accessing the URL the engine is loaded with",

        /**
         * Called by the engine to initialise the module.
         *
         * Via this method, the engine injects itself into the module, along with a map of engine
         * resources that the module may use. The resources contain things like the HTML canvas
         * and certain nodes in the scene graph that the module may graft additional nodes onto.
         *
         * Within this method, the module would typically create on the engine various actions
         * that it handles, as well as declare what events it fires.
         *
         * @param {Engine} engine The engine
         * @param {Object} resources Resources shared among all modules
         * @param {JSON} configs Module configs
         */
        init: function(engine, resources, configs) {

            /* Get the URL parameters
             * http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values
             */
            var qs = (function(a) {
                if (a == "") return {};
                var b = {};
                for (var i = 0; i < a.length; ++i)
                {
                    var p = a[i].split('=');
                    if (p.length != 2) continue;
                    b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
                }
                return b;
            })(window.location.search.substr(1).split('&'));

            /* Create action to query the URL parameters
             */
            engine.createAction({
                action: "url.get",
                fn: function(params, ok) {
                    ok(qs);
                }
            });
        },

        /**
         * Destroys this module, deleting anything that it
         * previously created on the engine via its #init method.
         */
        destroy: function(engine, resources) {

            engine.deleteAction("url.get");
        }
    };
});
