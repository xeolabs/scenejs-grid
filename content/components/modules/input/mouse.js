/**
 * Engine module which notifies of basic mouse events on the grid's canvas
 *
 */
define(function() {

    var _grid; // Saves grid from #init method for use in mouse handlers

    function mouseDown(event) {
        _grid.fireEvent("mouse.down", { canvasX: event.clientX, canvasY: event.clientY });
    }

    function mouseMove(event) {
        _grid.fireEvent("mouse.move", { canvasX: event.clientX, canvasY: event.clientY });
    }

    function mouseUp() {
        _grid.fireEvent("mouse.up");
    }

    function mouseWheel(event) {

        var delta = 0;

        if (!event) {
            event = window.event;
        }

        if (event.wheelDelta) {

            delta = event.wheelDelta / 120;

            if (window.opera) {
                delta = -delta;
            }

        } else if (event.detail) {
            delta = -event.detail / 3;
        }

        if (event.preventDefault)
            event.preventDefault();

        event.returnValue = false;

        _grid.fireEvent("mouse.wheel", { delta: delta });
    }

    return {

        /**
         * Brief description of the module
         */
        description: "Fires canvas mouse events",

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
         * @param {Object} resources Resources shared among all modules
         * @param {JSON} configs Module configs
         */
        init: function(grid, resources, configs) {

            _grid = grid; // Save grid in closure for use in mouse handlers defined above

            var canvas = resources.canvas;  // Get the canvas from the grid resources

            grid.createEvent("mouse.down");
            grid.createEvent("mouse.move");
            grid.createEvent("mouse.up");
            grid.createEvent("mouse.wheel");

            canvas.addEventListener('mousedown', mouseDown, true);
            canvas.addEventListener('mousemove', mouseMove, true);
            canvas.addEventListener('mouseup', mouseUp, true);
            canvas.addEventListener('mousewheel', mouseWheel, true);
        },

        /**
         * Destroys this module, deleting anything that it
         * previously created on the grid via its #init method.
         */
        destroy: function(grid, resources) {

            var canvas = resources.canvas;

            grid.deleteEvent("mouse.down");
            grid.deleteEvent("mouse.move");
            grid.deleteEvent("mouse.up");
            grid.deleteEvent("mouse.wheel");

            canvas.removeEventListener('mousedown', mouseDown, true);
            canvas.removeEventListener('mousemove', mouseMove, true);
            canvas.removeEventListener('mouseup', mouseUp, true);
            canvas.removeEventListener('mousewheel', mouseWheel, true);
        }
    };
});
