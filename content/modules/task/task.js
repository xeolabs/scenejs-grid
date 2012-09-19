/**
 * Task indicator module
 *
 */
define(function() {

    return {

        description: "Task indicator",

        init: function(engine, resources, configs) {

            engine.onEvent("taskstarted",
                    function(params) {

                    });

            engine.onEvent("taskdone",
                    function(params) {

                    });
        },

        destroy: function(engine, resources) {


        }
    };
});
