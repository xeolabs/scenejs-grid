/*-----------------------------------------------------------------------------------------------------
 * The grid
 *
 * https://github.com/xeolabs/scenejs-grid/wiki/Grid
 *----------------------------------------------------------------------------------------------------*/

define(["map"], // Map with automatic IDs

        function(map) {

            var grid = new (function() {

                /* Holds for each type of event originating within this grid
                 * a map containing a handler for each subscriber to the event.
                 *
                 * Event types are defined with #createEvent and fired with #fireEvent.
                 */
                this._eventSubs = {};

                /* Pool of reusable IDs for event subscription handles
                 */
                this._handlePool = new Map();

                /* Actions supported by this grid.
                 * Actions are defined with #defineAction and executed with #send.
                 */
                this._actions = {};

                var self = this;


                /*-----------------------------------------------------------------------------------------------------
                 * Events
                 *
                 * https://github.com/xeolabs/scenejs-grid/wiki/Events
                 *----------------------------------------------------------------------------------------------------*/

                /**
                 * Define an event on the grid
                 */
                this.createEvent = function(type) {

                    if (!type) {
                        throw "grid.createEvent: argument expected: type \nhttps://github.com/xeolabs/scenejs-grid/wiki/Events";
                    }

                    if (this._eventSubs[type]) {        // Event type already defined
                        return;
                    }

                    this._eventSubs[type] = {           // Subscriptions for this event type
                        handlers: {},                   // Handler function for each subscriber
                        numSubs: 0                      // Count of subscribers for the event type
                    };
                };

                /**
                 * Subscribe to an event on the grid
                 */
                this.onEvent = function(type, handler) {

                    if (!type || typeof type != "string") {
                        throw "grid.onEvent: illegal arguments: \nhttps://github.com/xeolabs/scenejs-grid/wiki/Events";
                    }

                    if (!handler || typeof handler != "function") {
                        throw "grid.onEvent: illegal arguments: \nhttps://github.com/xeolabs/scenejs-grid/wiki/Events";
                    }

                    var subs = this._eventSubs[type];

                    if (!subs) {
                        throw "grid.onEvent: event not supported: '" + type + "'\nhttps://github.com/xeolabs/scenejs-grid/wiki/Events";
                    }

                    var handle = this._handlePool.addItem(type);

                    subs.handlers[handle] = handler;    // Register handler
                    subs.numSubs++;                     // Bump count of subscribers to the event

                    return handle;
                };

                /**
                 * Fire an event at the grid
                 */
                this.fireEvent = function(type, params) {

                    if (!type) {
                        throw "grid.fireEvent: argument expected: type \nhttps://github.com/xeolabs/scenejs-grid/wiki/Events";
                    }

                    var subs = this._eventSubs[type];

                    if (!subs) {
                        throw "grid.fireEvent: event not supported: '" + type + "'\nhttps://github.com/xeolabs/scenejs-grid/wiki/Events";
                    }

                    if (subs.numSubs > 0) {             // Don't handle if no subscribers

                        var handlers = subs.handlers;

                        params = params || {};

                        for (var handle in handlers) {
                            if (handlers.hasOwnProperty(handle)) {
                                handlers[handle](params);
                            }
                        }
                    }
                };

                /**
                 * Undo an event subscription on the grid
                 *
                 * @param {String} handle Subscription handle
                 */
                this.unEvent = function(handle) {

                    if (!type) {
                        throw "grid.unEvent: argument expected: handle \nhttps://github.com/xeolabs/scenejs-grid/wiki/Events";
                    }

                    var type = this._handlePool.items[handle];

                    if (!type) { // No subscription exists
                        return;
                    }

                    this._handlePool.removeItem(handle);

                    var subs = this._eventSubs[type];

                    if (!subs) { // No subscriptions
                        return;
                    }

                    delete subs.handlers[handle];

                    subs.numSubs--;
                };

                /**
                 * Undefine an event on the grid
                 */
                this.deleteEvent = function(type) {
                    delete this._eventSubs[type];
                };


                /*-----------------------------------------------------------------------------------------------------
                 * ACTIONS
                 *
                 * https://github.com/xeolabs/scenejs-grid/wiki/Actions
                 *----------------------------------------------------------------------------------------------------*/

                /**
                 * Create an action on the grid
                 */
                this.createAction = function(action) {

                    var actionId = action.action;

                    if (!actionId) {
                        throw "grid.createAction: argument expected: action \nhttps://github.com/xeolabs/scenejs-grid/wiki/Actions";
                    }

                    if (this._actions[actionId]) {
                        throw "grid.createAction: action already exists: " + actionId + " \nhttps://github.com/xeolabs/scenejs-grid/wiki/Actions";
                    }

                    if (!action.fn) {
                        throw "grid.createAction: param expected: fn \nhttps://github.com/xeolabs/scenejs-grid/wiki/Actions";
                    }

                    this._actions[actionId] = action;

                    this.fireEvent("action.created", { action:action });

                    return action;
                };

                /**
                 * Fire an action on the grid
                 */
                this.send = function(message, ok, error) {

                    ok = ok || this._noop;
                    error = error || this._noop;

                    var actionId = message.action;

                    if (!actionId) {
                        throw "grid.send: param expected: action \nhttps://github.com/xeolabs/scenejs-grid/wiki/Actions";
                    }

                    var action = this._actions[actionId];

                    if (!action) {
                        throw "grid.send: action not supported: '" + actionId + "'\nhttps://github.com/xeolabs/scenejs-grid/Actions";
                    }

                    action.fn(message, ok, error);
                };


                this._noop = function() {
                };

                /**
                 * Delete an action on the grid
                 */
                this.deleteAction = function(actionId) {

                    delete this._actions[actionId];

                    this.fireEvent("action.deleted", { action: actionId });
                };


                /*----------------------------------------------------------------------
                 * Native events and actions
                 *---------------------------------------------------------------------*/

                /* Create event to notify of action results
                 */
                this.createEvent("data");

                /* Create event to notify of error
                 */
                this.createEvent("error");

                /* Create event to notify of task starting. The grid is "busy" while
                 * "taskstarted" events outnumber "taskdone" events. 
                 */
                this.createEvent("taskstarted");

                /* Create event to notify of task finishing
                 */
                this.createEvent("taskdone");

                /* Create event to notify of action creations
                 */
                this.createEvent("action.created");

                /* Create event to notify of general grid reset
                 */
                this.createEvent("reset");

                this.createAction({
                    action: "action.get",
                    fn: function(params, ok) {

                        var data = {
                            actions: []
                        };

                        for (var actionId in grid._actions) {
                            if (self._actions.hasOwnProperty(actionId)) {
                                data.actions.push(actionId);
                            }
                        }

                        ok(data);
                    }
                });

                /* Action to perform general grid reset
                 */
                this.createAction({
                    action: "reset",
                    fn: function(params, ok) {
                        self.fireEvent("reset");
                        ok();
                    }
                });
            })();

            return grid;
        });