/*!
 * LucidJS
 *
 * Lucid is an easy to use event emitter library. LucidJS allows you to create your own event system and even pipe in
 * events from one emitter to another.
 *
 * Copyright 2012, Robert William Hurst
 * Licenced under the BSD License.
 * See https://raw.github.com/RobertWHurst/LucidJS/master/license.txt
 */
(function(factory) {

	//AMD
	if(typeof define === 'function' && define.amd) {
		define(factory);

	//NODE
	} else if((typeof module == 'object' || typeof module == 'function') && module.exports) {
		module.exports = factory();

	//GLOBAL
	} else {
		window.LucidJS = factory();
	}

})(function() {
	var api;

	//return the api
	api = {
		"emitter": EventEmitter
	};

	//indexOf pollyfill
	[].indexOf||(Array.prototype.indexOf=function(a,b,c){for(c=this.length,b=(c+~~b)%c;b<c&&(!(b in this)||this[b]!==a);b++);return b^c?b:-1;});

	return api;

	/**
	 * Creates a event emitter.
	 */
	function EventEmitter(object) {
		var emitter = object || {}, listeners = {}, setEvents = {}, pipes = [];

		//augment an object if it isn't already an emitter
		if(
			!emitter.on &&
			!emitter.once &&
			!emitter.trigger &&
			!emitter.set &&
			!emitter.pipe &&
			!emitter.listeners
		) {
			emitter.on = on;
			emitter.off = off;
			emitter.once = once;
			emitter.trigger = trigger;
			emitter.set = set;
			emitter.set.clear = clearSet;
			emitter.pipe = pipe;
			emitter.pipe.clear = clearPipes;
			emitter.listeners = getListeners;
			emitter.listeners.clear = clearListeners;
		} else {
			return emitter;
		}

		if(emitter.addEventListener || emitter.attachEvent) {
			handleNode(emitter);
		}

		return emitter;

		/**
		 * Binds listeners to events.
		 * @param event
		 * @return {Object}
		 */
		function on(event     ) {
			var args = Array.prototype.slice.apply(arguments, [1]), binding = {}, aI, sI;

			//recurse over a batch of events
			if(typeof event === 'object' && typeof event.push === 'function') { return batchOn(event, args); }

			//trigger the listener event
			if(event.slice(0, 7) !== 'emitter') {
				trigger('emitter.listener', event, args);
			}

			//create the event
			if(!listeners[event]) { listeners[event] = []; }

			//add each callback
			for(aI = 0; aI < args.length; aI += 1) {
				if(typeof args[aI] !== 'function') { throw new Error('Cannot bind event. All callbacks must be functions.'); }
				listeners[event].push(args[aI]);
			}

			binding.clear = clear;

			return binding;

			function clear() {
				if(!listeners[event]) { return; }
				for(aI = 0; aI < args.length; aI += 1) {
					listeners[event].splice(listeners[event].indexOf(args[aI]), 1);
				}
				if(listeners[event].length < 1) { delete listeners[event]; }
			}

			function batchOn(events, args) {
				var eI, binding = {}, bindings = [];
				for(eI = 0; eI < events.length; eI += 1) {
					args.unshift(events[eI]);
					bindings.push(on.apply(this, args));
					args.shift();
				}

				binding.clear = clear;

				return binding;

				function clear() {
					var bI;
					for(bI = 0; bI < bindings.length; bI += 1) {
						bindings[bI].clear();
					}
				}
			}
		}
		/**
		 * Unbinds listeners to events.
		 * @param event
		 * @return {Object}
		 */
		function off(event     ) {
			var args = Array.prototype.slice.apply(arguments, [1]), aI, sI;

			//recurse over a batch of events
			if(typeof event === 'object' && typeof event.push === 'function') { 
				for(sI = 0; sI < event.length; sI += 1) {
					off.apply(null, [event[sI]].concat(args));
				}
				return;
			}

			if(!listeners[event]) { throw new Error('Tried to remove an event from a non-existant event of type "'+event+'".'); }

			//remove each callback
			for(aI = 0; aI < args.length; aI += 1) {
				if(typeof args[aI] !== 'function') { throw new Error('Tried to remove a non-function.'); }
				var listenerIndex = listeners[event].indexOf(args[aI]);
				listeners[event].splice(listenerIndex, 1);
			}
		}

		/**
		 * Binds listeners to events. Once an event is fired the binding is cleared automatically.
		 * @param event
		 * @return {Object}
		 */
		function once(event     ) {
			var binding, args = Array.prototype.slice.apply(arguments, [1]), result = true;

			binding = on(event, function(    ) {
				var aI, eventArgs = Array.prototype.slice.apply(arguments);
				binding.clear();

				for(aI = 0; aI < args.length; aI += 1) {
					if(args[aI].apply(this, eventArgs) === false) {
						result = false;
					}
				}

				return result;
			});

			return binding;
		}

		/**
		 * Triggers events. Passes listeners any additional arguments.
		 *  Optimized for 4 arguments.
		 * @param event
		 * @return {Boolean}
		 */
		function trigger(event, a1, a2, a3, a4, la) {
			var longArgs, lI, eventListeners, result = true;

			if(typeof la !== 'undefined') {
				longArgs = Array.prototype.slice.apply(arguments, [1]);
			}

			if(typeof event === 'object' && typeof event.push === 'function') {
				if(longArgs) {
					return batchTrigger.apply(null, arguments);
				} else {
					return batchTrigger(event, a1, a2, a3, a4);
				}
			}

			event = event.split('.');
			while(event.length) {
				eventListeners = listeners[event.join('.')];

				if(event[0] !== 'emitter') {
					if(longArgs) {
						trigger.apply(this, [].concat('emitter.event', event.join('.'), longArgs));
					} else {
						trigger('emitter.event', a1, a2, a3, a4);
					}
				}

				if(eventListeners) {
					eventListeners = [].concat(eventListeners);
					for(lI = 0; lI < eventListeners.length; lI += 1) {
						if(longArgs) {
							if(eventListeners[lI].apply(this, longArgs) === false) {
								result = false;
							}
						} else {
							if(eventListeners[lI](a1, a2, a3, a4) === false) {
								result = false;
							}
						}
					}
				}
				event.pop();
			}

			return result;

			function batchTrigger(events, a1, a2, a3, a4, la) {
				var eI, result = true;

				if(typeof la !== 'undefined') {
					longArgs = Array.prototype.slice.apply(arguments, [1]);
				}

				for(eI = 0; eI < events.length; eI += 1) {
					if(longArgs) {
						args.unshift(events[eI]);
						if(trigger.apply(this, args) === false) { result = false; }
						args.shift();
					} else {
						if(trigger(events[eI], a1, a2, a3, a4) === false) { result = false; }
					}

				}
				return result;
			}
		}

		/**
		 * Sets events. Passes listeners any additional arguments.
		 * @param event
		 * @return {*}
		 */
		function set(event, a1, a2, a3, a4, la) {
			var args, binding, _clear;

			if(la) { args = Array.prototype.slice.apply(arguments, [1]); }
			if(la) { trigger.apply(arguments) }
			else { trigger(event, a1, a2, a3, a4); }

			binding = on('emitter.listener', function(_event, listeners) {
				var lI;
				if(event === _event) {
					for(lI = 0; lI < listeners.length; lI += 1) {
						if(args) { listeners[lI].apply(args); }
						else { listeners[lI](a1, a2, a3, a4); }
					}
				}
			});

			if(!setEvents[event]) { setEvents[event] = []; };
			setEvents[event].push(binding);

			_clear = binding.clear;
			binding.clear = clear;

			return binding;

			function clear() {
				setEvents[event].splice(setEvents[event].indexOf(binding), 1);
				_clear();
			}
		}

		/**
		 * Clears a set event, or all set events.
		 * @param event
		 */
		function clearSet(event) {
			var bI;
			if(event) {
				for(bI = 0; bI < setEvents[event].length; bI += 1) {
					setEvents[event][bI].clear();
				}
				delete setEvents[event];
			} else {
				for(event in setEvents) {
					if(!setEvents.hasOwnProperty(event)) { continue; }
					clearSet(event);
				}
			}
		}

		/**
		 * Pipes events from another emitter.
		 * @param event [optional]
		 * @return {Object}
		 */
		function pipe(event    ) {
			var api = {}, args = Array.prototype.slice.apply(arguments), eI, aI, pI, connections = [], connection, bindings = [],
			binding;

			//a batch of events
			if(typeof event === 'object' && typeof event.push === 'function' && typeof event[0] === 'string') {
				for(eI = 0; eI < event.length; eI += 1) {
					bindings.push(pipe.apply(null, [event[eI]].concat(args.slice(1))));
				}

				api.clear = clearBatch;
				return api;
			}

			//a single emitter (all events)
			if(typeof event === 'object') {
				event = false;
			}

			//a specific event
			else {
				args.shift();
			}

			//validate event
			if(event !== false && typeof event !== 'string') { throw new Error('Cannot create pipe. The first argument must be an event string or an emitter.'); }

			for(aI = 0; aI < args.length; aI += 1) {

				//if dom node
				if(args[aI].addEventListener || args[aI].attachEvent) { args[aI] = EventEmitter(args[aI]); }

				//find existing pipe to emitter (if any)
				for(pI = 0; pI < pipes.length; pI += 1) {
					if(pipes[pI].emitter === args[aI]) {
						connection = pipes[pI];
						break;
					}
				}

				//if a pipe was found and its type 2 then skip this emitter (its already piped)
				if(connection && connection.type === 2) { continue; }

				//if no pipe exists then create it for the first time
				if(!connection) {
					connection = {};
					connection.emitter = args[aI];
					connection.bindings = [];
					connection.events = [];
					if(event) {
						connection.type = 1;
					} else {
						connection.type = 2;
					}
				}

				if(connection.events.indexOf(event) !== -1) { continue; }
				connection.events.push(event);

				if(connection.type === 1) {
					binding = captureEvent(args[aI], event);
					binding.event = event;
					connection.bindings.push(binding);
				} else if(connection.type === 2) {
					for(event in listeners) {
						if(!listeners.hasOwnProperty(event)) { continue; }
						binding = args[aI].on(event, captureEvent);
						binding.event = event;
						connection.bindings.push(binding);
						connection.events.push(event);
					}
					captureListener(connection, args[aI]);
				}

				connections.push(connection);
				pipes.push(connection);
			}

			api.clear = clear;
			return api;

			function captureListener(connection, emitter) {
				connection.listenerBinding = on('emitter.listener', function(event) {
					if(connection.events.indexOf(event) === -1) {
						connection.bindings.push(captureEvent(emitter, event));
						connection.events.push(event);
					}
				});
			}

			function captureEvent(emitter, event) {
				return emitter.on(event, function(    ) {
					var args = Array.prototype.slice.apply(arguments);
					args.unshift(event);
					return trigger.apply(this, args);
				});
			}

			function clearBatch() {
				if(bindings.length) {
					while(bindings.length) {
						bindings[0].clear();
						bindings.splice(0, 1);
					}
				}
			}

			function clear() {
				while(connections.length) {
					if(connections[0].listenerBinding) {
						connections[0].listenerBinding.clear();
					}
					while(connections[0].bindings.length) {
						connections[0].bindings[0].clear();
						connections[0].bindings.splice(0, 1);
					}
					pipes.splice(pipes.indexOf(connections[0]), 1);
					connections.splice(0, 1);
				}
			}
		}

		/**
		 * Clears pipes based on the events they transport.
		 * @param event
		 */
		function clearPipes(event) {
			var pI, bI, binding;

			for(pI = 0; pI < pipes.length; pI += 1) {
				if(event) {
					if(pipes[pI].type === 2) { continue; }
					if(pipes[pI].events.indexOf(event) === -1) { continue; }
					pipes[pI].events.splice(pipes[pI].events.indexOf(event), 1);
				}
				if(pipes[pI].type === 2) { pipes[pI].listenerBinding.clear(); }
				for(bI = 0; bI < pipes[pI].bindings.length; bI += 1) {
					if(event && pipes[pI].bindings[bI].event !== event) { continue; }
					pipes[pI].bindings[bI].clear();
					pipes[pI].bindings.splice(bI, 1);
					bI -= 1;
				}
				if(pipes[pI].bindings.length < 1) {
					pipes.splice(pI, 1);
					pI -= 1;
				}
			}
		}

		/**
		 * Gets listeners for events.
		 * @param event
		 * @return {*}
		 */
		function getListeners(event) {
			if(event) {
				return listeners[event];
			} else {
				return listeners;
			}
		}

		/**
		 * Clears listeners by events.
		 * @param event
		 */
		function clearListeners(event) {
			if(event) {
				delete listeners[event];
			} else {
				listeners = {};
			}
		}

		/**
		 * Clears the emitter
		 */
		function clear() {

			trigger('emitter.clear');

			listeners = {};

			clearSet();
			clearPipes();

			delete emitter.on;
			delete emitter.once;
			delete emitter.trigger;
			delete emitter.set;
			delete emitter.pipe;
			delete emitter.listeners;
			delete emitter.clear;
		}

		/**
		 * Binds the emitter's event system to the DOM event system
		 * @param node
		 */
		function handleNode(node) {
			var handledEvents = [], listenerBinding, DOMEventListeners = [];

			listenerBinding = on('emitter.listener', function(event) {
				if(handledEvents.indexOf(event) > -1) { return; }
				handledEvents.push(event);

				try {

					//W3C
					if(node.addEventListener) {
						node.addEventListener(event, nodeListener, false);
						DOMEventListeners.push({
							"event": event,
							"listener": nodeListener
						});
					}

					//MICROSOFT
					else if(node.attachEvent) {
						node.attachEvent('on' + event, nodeListener);
						DOMEventListeners.push({
							"event": event,
							"listener": nodeListener
						});
					}

				} catch(e) {
					console.error(e);
				}

				function nodeListener(eventObj    ) {
					var args = Array.prototype.slice.apply(arguments);
					args.unshift([event, 'dom.' + event]);
					if(trigger.apply(this, args) === false) {
						eventObj.preventDefault();
						eventObj.stopPropagation();
					}
				}
			});

			emitter.clearNodeEmitter = clearNodeEmitter;

			function clearNodeEmitter() {
				var DI;
				for(DI = 0; DI < DOMEventListeners.length; DI += 1) {
					try {

						//W3C
						if(node.removeEventListener) {
							node.removeEventListener(DOMEventListeners[DI].event, DOMEventListeners[DI].listener, false);
						}

						//MICROSOFT
						else if(node.detachEvent) {
							node.detachEvent('on' + DOMEventListeners[DI].event, DOMEventListeners[DI].listener);
						}

					} catch(e) {
						console.error(e);
					}
				}

				handledEvents = [];
				listenerBinding.clear();
			}
		}
	}

});
