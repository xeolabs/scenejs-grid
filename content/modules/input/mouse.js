/**
 * Engine module which notifies of basic mouse events on the engine's canvas
 *
 */
define(function() {

    var _engine; // Saves engine from #init method for use in mouse handlers

    function mouseDown(event) {
        _engine.fireEvent("mouse.down", { canvasX: event.clientX, canvasY: event.clientY });
    }

    function mouseMove(event) {
        _engine.fireEvent("mouse.move", { canvasX: event.clientX, canvasY: event.clientY });
    }

    function mouseUp() {
        _engine.fireEvent("mouse.up");
    }

    return {

        /**
         * Brief description of the module
         */
        description: "Notifies of basic mouse events on the canvas",

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

            _engine = engine; // Save engine in closure for use in mouse handlers defined above

            var canvas = resources.canvas;  // Get the canvas from the engine resources

            engine.createEvent("mouse.down");
            engine.createEvent("mouse.move");
            engine.createEvent("mouse.up");

            canvas.addEventListener('mousedown', mouseDown, true);
            canvas.addEventListener('mousemove', mouseMove, true);
            canvas.addEventListener('mouseup', mouseUp, true);
        },

        /**
         * Destroys this module, deleting anything that it
         * previously created on the engine via its #init method.
         */
        destroy: function(engine, resources) {

            var canvas = resources.canvas;

            engine.deleteEvent("mouse.down");
            engine.deleteEvent("mouse.move");
            engine.deleteEvent("mouse.up");

            canvas.removeEventListener('mousedown', mouseDown, true);
            canvas.removeEventListener('mousemove', mouseMove, true);
            canvas.removeEventListener('mouseup', mouseUp, true);
        }
    };
});
