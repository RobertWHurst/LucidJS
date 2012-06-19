/*!
 * LucidJS
 *
 * Lucid is an uber simple and easy to use event emitter library. Lucid allows you to
 * create your own event system and even pipe in events from any number of DOM elements.
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
	} else if(typeof module === 'object' && module.exports) {
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

	return api;

	/**
	 * Creates a event emitter
	 */
	function EventEmitter(object) {
		var api, callbacks, pipedEmitters, setEvents;

		if(object && (object === null || typeof object !== 'object')) { throw new Error('Cannot augment object with emitter. The object must be an object.'); }

		//polyfills for ms's piece o' shit browsers
		[].indexOf||(Array.prototype.indexOf=function(a,b,c){for(c=this.length,b=(c+~~b)%c;b<c&&(!(b in this)||this[b]!==a);b++);return b^c?b:-1;});

		//vars
		api = object || {};
		api.on = on;
		api.once = once;
		api.trigger = trigger;
		api.set = set;
		api.pipe = pipe;
		api.listeners = getListeners;
		api.listeners.clear = clearListeners;

		callbacks = {};
		pipedEmitters = [];
		setEvents = [];

		//return the api
		return api;

		/**
		 * Binds functions to events
		 * @param event
		 * @param callback
		 */
		function on(event, callback) {
			var api, pEI, sEI;

			if(typeof event !== 'string') { throw new Error('Cannot bind to event emitter. The passed event is not a string.'); }
			if(typeof callback !== 'function') { throw new Error('Cannot bind to event emitter. The passed callback is not a function.'); }

			//return the api
			api = {
				"clear": clear
			};

			//create the event namespace if it doesn't exist
			if(!callbacks[event]) { callbacks[event] = []; }

			//save the callback
			callbacks[event].push(callback);

			//bind to piped emitters
			for(pEI = 0; pEI < pipedEmitters.length; pEI += 1) {
				pipedEmitters[pEI].add(event);
			}

			//trigger set events next tick
			if(setEvents[event]) {

				//execute each argument set
				for(sEI = 0; sEI < setEvents[event].length; sEI += 1) {

					//trigger the set event
					trigger.apply(this, setEvents[event][sEI]);
					clearListeners(event);
				}
			}

			//trigger the handler event
			trigger('handler', event, callback);

			//return the api
			return api;

			/**
			 * Unbinds the handler
			 */
			function clear() {
				var i;
				if(callbacks[event]) {
					i = callbacks[event].indexOf(callback);
					callbacks[event].splice(i, 1);

					if(callbacks[event].length < 1) {
						delete callbacks[event];
					}

					return true;
				}
				return false;
			}
		}

		/**
		 * Binds a callback to an event. Will only execute once.
		 * @param event
		 * @param callback
		 */
		function once(event, callback) {
			var handler, completed;

			if(typeof event !== 'string') { throw new Error('Cannot bind to event emitter. The passed event is not a string.'); }
			if(typeof callback !== 'function') { throw new Error('Cannot bind to event emitter. The passed callback is not a function.'); }

			handler = on(event, function(    ) {

				//if the handler has already fired then exit
				if(!completed) {
					//set completed
					completed = true;

					//fire the callback
					callback.apply(this, arguments);

					//clear the handler. Use setTimeout just in case the handler is called before the
					// handler api is returned.
					setTimeout(function() {
						handler.clear();
					}, 0);
				}
			});

			return true;
		}

		/**
		 * Triggers a given event and optionally passes its handlers all additional parameters
		 * @param event
		 */
		function trigger(event    ) {
			var args, cI, eI, blockEventBubble;

			//validate the event
			if(typeof event !== 'string' && typeof event !== "object" && typeof event.push !== 'function') { throw new Error('Cannot trigger event. The passed event is not a string or an array.'); }

			//get the arguments
			args = Array.prototype.slice.apply(arguments).splice(1);

			//handle event arrays
			if(typeof event === 'object' && typeof event.push === 'function') {

				//for each event in the event array self invoke passing the arguments array
				for(eI = 0; eI < event.length; eI += 1) {

					//add the event name to the beginning of the arguments array
					args.unshift(event[eI]);

					//trigger the event
					if(trigger.apply(this, args) === false) {
						blockEventBubble = true;
					}

					//shift off the event name
					args.shift();
				}

				return !blockEventBubble;
			}

			//if the event has callbacks then execute them
			if(callbacks[event]) {

				//fire the callbacks
				for(cI = 0; callbacks[event] && cI < callbacks[event].length; cI += 1) {
					if(callbacks[event][cI].apply(this, args) === false) {
						blockEventBubble = true;
					}
				}
			}

			return !blockEventBubble;
		}

		/**
		 * Gets event listeners
		 * @param event
		 */
		function getListeners(event) {
			if(event && typeof event !== 'string') { throw new Error('Cannot retrieve listeners. If given the event must be a string.'); }

			//return the listeners
			if(event) {
				return callbacks[event];
			} else {
				return callbacks;
			}
		}

		/**
		 * Clears the listeners
		 * @param event
		 */
		function clearListeners(event) {
			if(event && typeof event !== 'string') { throw new Error('Cannot clear listeners. If given the event must be a string.'); }

			//return the listeners
			if(event) {
				callbacks[event] = [];
			} else {
				callbacks = {};
			}
		}

		/**
		 * Sets an event on the emitter
		 * @param event
		 */
		function set(event    ) {
			var api;

			//validate
			if(typeof event !== 'string') { throw new Error('Cannot set event. the event must be a string.')}

			//trigger the event and clear existing listeners
			trigger.apply(this, arguments);
			clearListeners(event);

			api = {
				"clear": clear
			};

			//trigger all future binds
			if(!setEvents[event]) { setEvents[event] = []; }
			setEvents[event].push(Array.prototype.slice.apply(arguments));

			return api;

			/**
			 * Clears the event
			 */
			function clear() {
				setEvents[event].splice(setEvents[event].indexOf(arguments), 1);
				if(setEvents[event].length < 1) { delete setEvents[event]; }
			}
		}

		/**
		 * Pipes in the events from another emitter including DOM objects
		 * @param emitter
		 */
		function pipe(emitter) {
			var pipe, pipeBindings, event, eI, pipedEmitter, pipedEvents;

			//validate the element
			if(!emitter || typeof emitter !== 'object' || typeof emitter.on !== 'function' && typeof emitter.addEventListener !== 'function' && typeof emitter.attachEvent !== 'function') {
				throw new Error('Cannot pipe events. A vaild DOM object must be provided.');
			}

			pipeBindings = [];
			pipedEvents = [];

			//check to make sure were not pipeing the same emitter twice
			for(eI = 0; eI < pipedEmitters.length; eI += 1) {
				pipedEmitter = pipedEmitters[eI];

				if(pipedEmitter.emitter === emitter) {
					return true;
				}
			}

			//create the pipe
			pipe = {
				"emitter": emitter,
				"add": addEventToPipe
			};

			//add the emitter to the piped array
			pipedEmitters.push(pipe);

			//bind existing events
			for(event in callbacks) {
				if(!callbacks.hasOwnProperty(event)) { continue; }
				addEventToPipe(event);
			}

			return {
				"clear": clear
			};

			/**
			 * Takes an event type and binds to that event (if possible) on the piped emitter
			 * If the event fires it will be piped to this emitter.
			 * @param event
			 */
			function addEventToPipe(event) {
				var pipeBinding = {};

				//check to make sure the event has not been added
				if(pipedEvents.indexOf(event) >= 0) { return; }

				try {
					if(emitter.on) {
						pipeBinding = emitter.on(event, handler);

						//fix for jquery
						if(emitter.jquery && emitter.off) {
							pipeBinding.clear = function() {
								emitter.off(event, handler);
							};
						}
					} else if(emitter.addEventListener) {
						emitter.addEventListener(event, domHandler, false);

						pipeBinding.clear = function() {
							emitter.removeEventListener(event, domHandler, false);
						};
					} else if(emitter.attachEvent){
						emitter.attachEvent('on' + event, domHandler);

						pipeBinding.clear = function() {
							emitter.detachEvent('on' + event, domHandler);
						};
					}
				} catch(e) {}

				pipeBindings.push(pipeBinding);
				pipedEvents.push(event);

				/**
				 * A universal handler to capture an event and relay it to the emitter
				 */
				function handler(    ) {
					var args;

					args = Array.prototype.slice.call(arguments);
					args.unshift(event);

					return trigger.apply(this, args);
				}

				/**
				 * A dom event handler to capture an event and relay it to the emitter
				 */
				function domHandler(eventObj    ) {
					var args;

					args = Array.prototype.slice.call(arguments);
					args.unshift(event);

					if(!trigger.apply(this, args)) {

						//modern browsers
						eventObj.stopPropagation && eventObj.stopPropagation();
						eventObj.preventDefault && eventObj.preventDefault();

						//legacy browsers
						typeof eventObj.cancelBubble !== 'undefined' && (eventObj.cancelBubble = true);
						typeof eventObj.returnValue !== 'undefined' && (eventObj.returnValue = false);
					}
				}
			}

			/**
			 * Clears the pipe so the emitter is no longer captured
			 */
			function clear() {
				var pI;
				pipedEmitters.splice(pipedEmitters.indexOf(emitter), 1);

				for(pI = 0; pI < pipeBindings.length; pI += 1) {
					pipeBindings[pI].clear();
				}
			}
		}
	}
});
