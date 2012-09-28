/**
 * Engine module which provides actions for accessing the URL the grid is loaded on
 */
define(

    function () {

        return {

            /**
             * Brief description of the module
             */
            description:"Queries URL parameters",

            /**
             * Called by the grid to initialise the module.
             *
             * Via this method, the grid injects itself into the module, along with a map of grid
             * resources that the module may use. The resources contain things like the HTML canvas
             * and certain nodes in the scene graph that the module may graft additional nodes onto.
             *
             * Within this method, the module would typically create on the grid various actions
             * that it handles, as well as declare what events it fires.
             *
             * @param {Grid} grid The grid
             * @param {Object} context Resources shared among all modules
             * @param {JSON} configs Module configs
             */
            load:function (grid, context, configs) {

                /* Get the URL parameters
                 * http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values
                 */
                var qs = (function (a) {

                    if (a == "") {
                        return {};
                    }

                    var b = {};
                    var p;

                    for (var i = 0; i < a.length; ++i) {

                        p = a[i].split('=');

                        if (p.length != 2) {
                            continue;
                        }

                        b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
                    }

                    return b;

                })(window.location.search.substr(1).split('&'));

                /* Create action to query the URL parameters
                 */
                grid.createAction({
                    action:"url.getParams",
                    fn:function (params, ok) {
                        ok(qs);
                    }
                });

                /* Create action to query the URL parameters after the hash
                 * http://stackoverflow.com/questions/4197591/parsing-url-hash-fragment-identifier-with-javascript
                 */
                grid.createAction({
                    action:"url.getHashParams",
                    fn:function (params, ok) {

                        var hashParams = {};

                        var e;
                        var a = /\+/g;  // Regex for replacing addition symbol with a space
                        var r = /([^&;=]+)=?([^&;]*)/g;
                        var d = function (s) {
                            return decodeURIComponent(s.replace(a, " "));
                        };
                        var q = window.location.hash.substring(1);

                        while (e = r.exec(q)) {
                            hashParams[d(e[1])] = d(e[2]);
                        }

                        ok(hashParams);
                    }
                });
            },

            /**
             * Destroys this module, deleting anything that it
             * previously created on the grid via its #load method.
             */
            unload:function (grid, context) {

                grid.deleteAction("url.get");
            }
        };
    });
