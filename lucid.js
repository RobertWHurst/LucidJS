/*!
 * LucidJS - Because fuck the DOM
 *
 * Copyright 2012, Robert William Hurst
 * Licenced under the BSD License.
 * See license.txt
 */
(function(factory) {

	if(typeof define === 'function' && define.amd) {
		define(factory);
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
	function EventEmitter() {
		var api, callbacks, pipedEmitters;

		//polyfills for ms's piece o' shit browsers
		[].indexOf||(Array.prototype.indexOf=function(a,b,c){for(c=this.length,b=(c+~~b)%c;b<c&&(!(b in this)||this[b]!==a);b++);return b^c?b:-1;});
		[].forEach||(Array.prototype.forEach=function(a){var b;if(typeof a!=='function'){throw new Error(a+' is not a function.')}for(b=0;b<this.length;b+=1){a(this[b], a, this)}});
		Array.isArray||(Array.isArray=function(object){return typeof object === 'object'&&typeof object.push==='function'});

		//vars
		api = {
			"on": on,
			"trigger": trigger,
			"pipe": pipe
		};
		callbacks = {};
		pipedEmitters = [];

		//return the api
		return api;

		/**
		 * Binds functions to events
		 * @param event
		 * @param callback
		 */
		function on(event, callback) {
			var api;

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
			pipedEmitters.forEach(function(emitter) {
				emitter.pipe(event);
			});

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
		 * Triggers a given event and optionally passes its handlers all additional parameters
		 * @param event
		 */
		function trigger(event    ) {
			var args;

			//validate the event
			if(typeof event !== 'string' && !Array.isArray(event)) { throw new Error('Cannot bind to event emitter. The passed event is not a string or an array.'); }

			//get the arguments
			args = Array.prototype.slice.apply(arguments).splice(1);

			//handle event arrays
			if(Array.isArray(event)) {

				//for each event in the event array self invoke passing the arguments array
				event.forEach(function(event) {

					//add the event name to the begining of the arguments array
					args.unshift(event);

					//trigger the event
					trigger.apply(this, args);

					//shift off the event name
					args.shift();

				});

				return;
			}

			//if the event has callbacks then execute them
			if(callbacks[event]) {

				//fire the callbacks
				callbacks[event].forEach(function(callback) { callback.apply(this, args); });
			}

		}

		/**
		 * Pipes in the events from another emitter including DOM objects
		 * @param emitter
		 */
		function pipe(emitter) {
			var pipe, pipeBindings, event;

			//validate the element
			if(typeof emitter !== 'object' || typeof emitter.on !== 'function' && typeof emitter.addEventListener !== 'function' && typeof emitter.attachEvent !== 'function') {
				throw new Error('Cannot pipe events. A vaild DOM object must be provided.');
			}

			pipeBindings = [];

			//create the pipe
			pipe = {
				"emitter": emitter,
				"pipe": pipeEmitter
			};

			//add the emitter to the piped array
			pipedEmitters.push(pipe);

			//bind existing events
			for(event in callbacks) {
				if(!callbacks.hasOwnProperty(event)) { continue; }
				pipe.pipe(event);
			}

			return {
				"clear": clear
			};

			/**
			 * Takes an event type and binds to that event (if possible) on the piped emitter
			 * If the event fires it will be piped to this emitter.
			 * @param event
			 */
			function pipeEmitter(event) {
				var pipeBinding = {};

				try {
					if(emitter.on) {
						pipeBinding = emitter.on(event, handler);

						//fix for jquery
						if(emitter.jquery && emitter.off) {
							pipeBinding.clear = function() {
								emitter.off(event, handler);
							};
						}
					}
					if(emitter.addEventListener) {
						emitter.addEventListener(event, handler, true);

						pipeBinding.clear = function() {
							emitter.removeEventListener(event, handler, true);
						};
					}
					if(emitter.attachEvent){
						emitter.attachEvent(event, handler);

						pipeBinding.clear = function() {
							emitter.detachEvent(event, handler);
						};

					}
				} catch(e) {}

				pipeBindings.push(pipeBinding);

				/**
				 * A universal hander to capure an event and relay it to the emitter
				 */
				function handler(    ) {
					var args;

					args = Array.prototype.slice.call(arguments);
					args.unshift(event);

					trigger.apply(this, args);
				}
			}

			/**
			 * Clears the pipe so the emitter is no longer captured
			 */
			function clear() {
				pipedEmitters.splice(pipedEmitters.indexOf(emitter), 1);

				pipeBindings.forEach(function(pipeBinding) {
					pipeBinding.clear();
				});
			}
		}
	}
});