/**
 * Task indicator module
 *
 */
define(function() {

    return {

        description: "Task indicator",

        init: function(grid, resources, configs) {

            grid.onEvent("taskstarted",
                    function(params) {

                    });

            grid.onEvent("taskdone",
                    function(params) {

                    });
        },

        destroy: function(grid, resources) {


        }
    };
});
