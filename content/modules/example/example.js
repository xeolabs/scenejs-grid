/**
 *  An example module - use this as a template for your own modules
 *
 */
define(function() {

    return {

        /**
         * Brief description of the module
         */
        description: "Describe your module here",

        /**
         * This method is called by the engine (specifically by 'module.js') to initialise the module.
         *
         * Via this method, the engine injects itself into the module, along with a map of global
         * resources that the module may use. The resources might contain things like the HTML canvas,
         * certain scene graph nodes etc.
         *
         * Within this method, the module would typically create on the engine various actions
         * that it handles, as well as declare what events it fires.
         *
         * @param {Engine} engine The engine
         * @param {Object} resources Resources shared among all modules
         * @param {JSON} configs Module configs
         */
        init: function(engine, resources, configs) {

            /* Use any configurations provided for this module (specified on the
             * "module.load" action invokation that loaded it):
             */
            var exampleConfig = configs.exampleConfig;

            /* Read global properies created by other modules:
             */
            var exampleResource = resources.exampleResource;

            /* Declare events this module will fire:
             */
            engine.createEvent("example.myevent");

            /* Handle events, which are usually fired by other modules:
             */
            engine.onEvent("someevent", // This event is not defined anywhere, so this will throw an exception
                    function(params) {
                        var someParam = params.someParam;
                        var otherParam = params.otherParam;
                        //...
                    });

            /* Create actions this module executes:
             */
            engine.createAction({

                action: "example.myaction",

                fn: function(params, ok, error) {

                    engine.fireEvent("example.myevent", {  // Actions normally fire events
                        bar: exampleConfig,
                        baz: exampleResource,
                        foo: params.someParam,
                        faz: "some value"
                    });

                    //...

                    var result = { foo: "bar" };

                    ok(result);
                }
            });

            /* Fire actions created by other modules:
             */
            engine.send({
                action: "othermodule.someaction",  // This action is not defined anywhere, so this will throw an exception
                params: {
                    someParam: "someValue",
                    otherParam: "otherValue"
                }
            },
                // Success callback
                    function (result) {
                        alert("Success: " + JSON.stringify(result)); // Whatever the action returns, if anything
                    },

                // Error callback
                    function(result) {
                        var errorMsg = result.error;
                        alert("Error: " + errorMsg);
                    });

            /* Export global properties for use by other modules:
             */
            resources.newExampleResource = "someValue";
        },

        /**
         * Destroys this module, deleting anything that it
         * previously created on the engine via its #init method.
         */
        destroy: function(engine, resources) {

            /* Undeclare any events we declared:
             */

            engine.deleteEvent("example.myevent");

            /* Destroy any actions we created:
             */

            engine.deleteAction("example.myaction");
        }
    };
});
