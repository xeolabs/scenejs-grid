define([
    "map", // Map with automatic IDs
    "app/modules" // Scene management
],
        function(map, modules) {

            var engine = new (function() {

                /* Holds for each type of event originating within this engine
                 * a map containing a handler for each subscriber to the event.
                 *
                 * Event types are defined with #createEvent and fired with #fireEvent.
                 */
                this._eventSubs = {};

                /* Pool of reusable IDs for event subscription handles
                 */
                this._handlePool = new Map();

                /* Actions supported by this engine.
                 * Actions are defined with #defineAction and executed with #send.
                 */
                this._actions = {};

                var self = this;

                this.createEvent = function(type) {

                    if (this._eventSubs[type]) {        // Event type already defined
                        return;
                    }

                    this._eventSubs[type] = {           // Subscriptions for this event type
                        handlers: {},                   // Handler function for each subscriber
                        numSubs: 0                      // Count of subscribers for the event type
                    };
                };

                this.onEvent = function(type, handler) {

                    var subs = this._eventSubs[type];

                    if (!subs) {
                        throw "event type not supported: '" + type + "'";
                    }

                    var handle = this._handlePool.addItem(type);

                    subs.handlers[handle] = handler;    // Register handler
                    subs.numSubs++;                     // Bump count of subscribers to the event

                    return handle;
                };

                this.fireEvent = function(type, params) {

                    var subs = this._eventSubs[type];

                    if (!subs) {
                        throw "event not supported: '" + type + "'";
                    }

                    if (subs.numSubs > 0) {             // Don't handle if no subscribers

                        var handlers = subs.handlers;

                        for (var handle in handlers) {
                            if (handlers.hasOwnProperty(handle)) {
                                handlers[handle](params);
                            }
                        }
                    }
                };

                /**
                 * Unsubscribes to an event previously subscribed to
                 *
                 * @param {String} handle Subscription handle
                 */
                this.unEvent = function(handle) {

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

                this.deleteEvent = function(type) {
                    delete this._eventSubs[type];
                };

                /**
                 *
                 */
                this.createAction = function(action) {

                    var actionId = action.action;

                    if (!actionId) {
                        throw "param expected: action.action";
                    }

                    if (this._actions[actionId]) {
                        throw "action already exists: " + actionId;
                    }

                    if (!action.fn) {
                        throw "param expected: action.fn";
                    }

                    this._actions[actionId] = action;

                    this.fireEvent("action.created", { action:action });

                    return action;
                };

                this.send = function(message, ok, error) {

                    ok = ok || this._noop;
                    error = error || this._noop;

                    if (message.action) {
                        this._doAction(
                                false,
                                message,

                            /* ok
                             */
                                function(data) {

                                    if (data) {
                                        self.fireEvent("data", {
                                            data: data
                                        });
                                    }

                                    ok(data);
                                },

                            /* error
                             */
                                function(error) {

                                    if (error) {
                                        self.fireEvent("error", {
                                            error: error
                                        });
                                    }

                                    ok(error);
                                });

                    } else {
                        ok();
                    }
                };

                this._doAction = function(insideRightFringe, message, ok, error) {

                    var actionId = message.action;

                    ok = ok || this._noop;

                    error = error || this._noop;

                    if (!actionId) {
                        throw "action property missing: 'action'";
                    }

                    var action = this._actions[actionId];

                    if (!action) {
                        throw "action not supported: '" + actionId + "'";
                    }

                    var childActions = message.actions;
                    var self = this;

                    if (childActions && childActions.length > 0) {

                        action.fn(
                                message,

                                function() {

                                    var childaction;

                                    for (var i = 0, len = childActions.length; i < len; i++) {

                                        childaction = childActions[i];

                                        if (!childaction) {
                                            throw "action '" + actionId + "' has extra comma in child action list";

                                        } else {

                                            self._doAction(
                                                    insideRightFringe || (i < len - 1),
                                                    childaction,
                                                    ok,
                                                    error);
                                        }
                                    }
                                },
                                error);
                    } else {

                        action.fn(
                                message,
                                function(data) {
                                    if (!insideRightFringe) {
                                        ok(data);
                                    }
                                },
                                error);
                    }
                };

                this._noop = function() {
                };

                /**
                 *
                 */
                this.deleteAction = function(actionId) {

                    delete this._actions[actionId];

                    this.fireEvent("action.deleted", { action: actionId });
                };


                /*----------------------------------------------------------------------
                 * Create native events and actions
                 *---------------------------------------------------------------------*/

                /* Create event to notify of action results
                 */
                this.createEvent("data");

                /* Create event to notify of error
                 */
                this.createEvent("error");

                /* Create event to notify of task starting. The engine is "busy" while
                 * "taskstarted" events outnumber "taskdone" events. 
                 */
                this.createEvent("taskstarted");

                /* Create event to notify of task finishing
                 */
                this.createEvent("taskdone");

                /* Create event to notify of action creations
                 */
                this.createEvent("action.created");

                /* Create event to notify of general engine reset
                 */
                this.createEvent("reset");

                this.createAction({
                    action: "action.get",
                    fn: function(params, ok) {

                        var data = {
                            actions: []
                        };

                        for (var actionId in engine._actions) {
                            if (self._actions.hasOwnProperty(actionId)) {
                                data.actions.push(actionId);
                            }
                        }

                        ok(data);
                    }
                });

                /* Action to perform general engine reset
                 */
                this.createAction({
                    action: "reset",
                    fn: function(params, ok) {
                        self.fireEvent("reset");
                        ok();
                    }
                });


            })();


            /*------------------------------------------------------------------------
             * Initialise the modules container
             *----------------------------------------------------------------------*/

            /* Map of resources that will be shared among all modules. Some modules will
             * create resources, while others will use them. For example, a module that
             * defines a scene graph will put particular scene nodes on this map, while
             * another module that manipulates the scene graph would update those nodes.
             */
            var resources = {};

            modules.init(engine, resources);

            return engine;
        });