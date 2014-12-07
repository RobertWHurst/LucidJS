
/**
 * Creates an eventEmitter object
 *
 * - Emits `emitter.bind` when a listener is bound.
 * - Emits `emitter.unbind` when a listener is
 * unbound.
 * - Emits `emitter.flag` when a flag is set.
 * - Emits `emitter.unflag` when a flag is removed.
 * - Emits `emitter.pipe` when an eventEmitter is
 * piped.
 * - Emits `emitter.unpipe` when an eventEmitter
 * is no longer piped.
 */
function EventEmitter() {

  /**
   * All event listeners are held arrays under
   * ._listeners[eventName].
   * @type {Object}
   */
  this._listeners = {};
  /**
   * All piped eventEmitters are stored in
   * ._pipedEmitters. If the piped eventEmitter
   * is scoped to an event, then it will be in
   * an array under ._pipedEmitters[eventName].
   * @type {Array}
   */
  this._pipedEmitters = [];
  /**
   * All flags are held in ._flags[eventName].
   * These are not arrays so only one flag per
   * event is retained.
   * @type {Object}
   */
  this._flags = {};

  /**
   * During an event call .source is set to the
   * eventEmitter the event originated from.
   * This may not point to the eventEmitter
   * that the listener is bound to because
   * of event piping.
   * @type {Object}
   */
  this.source = null;
  /**
   * During an event call .event is set to the
   * current event name.
   * @type {String}
   */
  this.event = null;

  /**
   * During an event call .cancelBubble is set to
   * false. If a listener sets it to true, or
   * returns false, the event will not be piped
   * into other piped eventEmitters.
   * @type {Boolean}
   */
  this.cancelBubble = false;
}

/**
 * Expands a scoped event name into an array of
 * each dirivitive event name.
 * Ex. 'foo.bar.baz' => ['foo.bar.baz', 'foo.bar',
 * 'foo']
 * @private
 * @param  {String} event An event name
 * @return {Object}       An array with of
 *                        dirivitive event names.
 */
EventEmitter.prototype._expandEvent = function(event) {
  var ec = event.split('.');
  var e = [];
  while (ec.length > 0) {
    e.push(ec.join('.'));
    ec.pop();
  }
  return e;
};

/**
 * Emits an event. Executes all listeners bound
 * to the emitted event on this eventEmitter, and
 * piped eventEmitters. Passes all arguments after
 * the event to each listener.
 * @param  {String|Array} event An event name or
 *                              Array of event
 *                              names.
 * @return {EventEmitter}
 */
EventEmitter.prototype.emit = function(event    ) {

  // several events
  if (
    event !== null &&
    typeof event === 'object' &&
    typeof event.length === 'number'
  ) {
    for (var i = 0; i < event.length; i += 1) {
      switch(arguments.length) {
        case 1:
          this.emit(event[i]);
          break;
        case 2:
          this.emit(event[i], arguments[1]);
          break;
        case 3:
          this.emit(event[i], arguments[1], arguments[2]);
          break;
        default:
          var args = arguments.slice ? arguments.slice(1) : Array.prototype.slice.call(arguments, 1);
          args.unshift(event[i]);
          this.emit.apply(this, args);
      }
    }
    return this;
  }

  // set the event source
  var prevSource = this.source;
  this.source = this._remoteSource || this;
  if (this._remoteSource) { this._remoteSource = null; }

  // fire meta event
  if (event.slice(0, 7) !== 'emitter') {
    // set the current event
    var prevEvent = this.event;
    this.event = event;

    switch(arguments.length) {
      case 1:
        this.emit('emitter.emit', event);
        break;
      case 2:
        this.emit('emitter.emit', event, arguments[1]);
        break;
      case 3:
        this.emit('emitter.emit', event, arguments[1], arguments[2]);
        break;
      default:
        var args = arguments.slice ? arguments.slice(1) : Array.prototype.slice.call(arguments, 1);
        args.unshift('emitter.emit', event);
        this.emit.apply(this, args);
    }
  }

  // set cancelBubble to false.
  // the previous state must be cached in case
  // emitted by a function that was emitted
  // by this emitter. emitter -> func -> emitter
  var prevCancelBubble = this.cancelBubble;
  this.cancelBubble = false;

  // expand the event
  var expandedEvents = this._expandEvent(event);
  for (var i = 0; i < expandedEvents.length; i += 1) {
    var expandedEvent = expandedEvents[i];

    // execute each listener
    if (
      !this._listeners[expandedEvent] ||
      !this._listeners[expandedEvent].length
    ) {
      if (event === 'error') {
        throw arguments[1] || new Error('Unknown emitter error');
      }
      continue;
    }
    var _cancelBubble;
    var listeners = this._listeners[expandedEvent].slice(0);
    for (var j = 0; j < listeners.length; j += 1) {
      switch(arguments.length) {
        case 1:
          _cancelBubble = listeners[j].call(this);
          break;
        case 2:
          _cancelBubble = listeners[j].call(this, arguments[1]);
          break;
        case 3:
          _cancelBubble = listeners[j].call(this, arguments[1], arguments[2]);
          break;
        default:
          var args = arguments.slice ? arguments.slice(1) : Array.prototype.slice.call(arguments, 1);
          _cancelBubble = listeners[j].apply(this, args);
      }
      if (_cancelBubble === false) { this.cancelBubble = false; }
    }
  }

  // restore the previous value of event
  if (event.slice(0, 7) !== 'emitter') { this.event = prevEvent; }

  // if no remote source was set then set source
  // to null
  this.source = prevSource;

  // if cancel bubble is not true then allow
  // emitting on piped eventEmitters
  if (!this.cancelBubble) {

    // fully piped eventEmitters
    for (var i = 0; i < this._pipedEmitters.length; i += 1) {
      var eventEmitter = this._pipedEmitters[i];
      eventEmitter._remoteSource = this;
      eventEmitter.emit.apply(eventEmitter, arguments);
    }

    // selectively piped eventEmitters
    for (var i = 0; i < expandedEvents.length; i += 1) {
      var expandedEvent = expandedEvents[i];

      var eventEmitters = this._pipedEmitters[expandedEvent];
      if (!eventEmitters) { continue; }
      for (var j = 0; j < eventEmitters.length; j += 1) {
        eventEmitter = eventEmitters[i];
        if (!eventEmitter) {
          continue;
        }
        eventEmitter._remoteSource = this;
        eventEmitter.emit.apply(eventEmitter, arguments);
      }
    }
  }

  //restore the previous state of the bubble
  this.cancelBubble = prevCancelBubble;

  return this;
};
EventEmitter.prototype.trigger = EventEmitter.prototype.emit;

/**
 * Binds an event listener to an event.
 * @alias
 * @param  {String|Array}   event     An event
 *                                    name or an
 *                                    array of
 *                                    event names.
 * @param  {Function|Object} listener A listener
 *                                    or an array
 *                                    of
 *                                    listeners.
 * @return {EventEmitter}
 */
EventEmitter.prototype.bind = function(event, listener) {

  if (
    event !== null &&
    typeof event === 'object' &&
    typeof event.length === 'number'
  ) {
    for (var i = 0; i < event.length; i += 1) {
      this.bind(event[i], listener);
    }
    return this;
  }

  var prevEvent = this.event;
  var prevSource = this.source;
  this.event = event;
  this.source = this;
  this.emit('emitter.bind', listener);
  this.event = prevEvent;
  this.source = prevSource;

  if (!this._listeners[event]) { this._listeners[event] = []; };

  if (typeof listener === 'function') {
    this._listeners[event].push(listener);
  } else if (
    listener !== null &&
    typeof listener === 'object' &&
    typeof listener.length === 'number'
  ) {
    for (var i = 0; i < listener.length; i += 1) {
      this._listeners[event].push(listener[i]);
    }
  }

  this._executeFlag(event, listener);

  for (var i = 0; i < this._pipedEmitters.length; i += 1) {
    var eventEmitter = this._pipedEmitters[i];
    eventEmitter._executeFlag(event, listener);
  }

  if (this._pipedEmitters[event]) {
    for (var i = 0; i < this._pipedEmitters[event].length; i += 1) {
      var eventEmitter = this._pipedEmitters[event][i];
      eventEmitter._executeFlag(event, listener);
    }
  }

  return this;
};
EventEmitter.prototype.addListener = EventEmitter.prototype.bind;
EventEmitter.prototype.on = EventEmitter.prototype.bind;

/**
 * Executes a listener using an event that has
 * been flagged.
 * @private
 * @param  {String}   event    an event name.
 * @param  {Function} listener a listener.
 */
EventEmitter.prototype._executeFlag = function(event, listener) {
  if (this._flags[event]) {
    var prevSource = this.source;
    var prevEvent = this.event;
    this.source = this;
    this.event = event;
    if (typeof listener === 'function') {
      listener.apply(this, this._flags[event]);
    } else if (
      listener !== null &&
      typeof listener === 'object' &&
      typeof listener.length === 'number'
    ) {
      for (var i = 0; i < listener.length; i += 1) {
        listener[i].apply(this, this._flags[event]);
      }
    }
    this.source = prevSource;
    this.event = prevEvent;
  }
};

/**
 * Similar to bind, binds a listener to an event,
 * execept that once the event is fired, the bind
 * is undone. Listeners bound with weakBind will
 * only fire once.
 * @param  {String} event      An event name, or
 *                             an array of event
 *                             names.
 * @param  {Function} listener A listener, or
 *                             array of listeners
 * @return {EventEmitter}
 */
EventEmitter.prototype.weakBind = function(event, listener) {
  if (
    event !== null &&
    typeof event === 'object' &&
    typeof event.length === 'number'
  ) {
    for (var i = 0; i < event.length; i += 1) {
      this.weakBind(event[i], listener);
    }
    return this;
  }

  if (!this._listeners[event]) { this._listeners[event] = []; };

  if (typeof listener === 'function') {
    this._listeners[event].push(listener);
  } else if (
    listener !== null &&
    typeof listener === 'object' &&
    typeof listener.length === 'number'
  ) {
    for (var i = 0; i < listener.length; i += 1) {
      this._listeners[event].push(listener[i]);
    }
  }

  this._listeners[event].push(function unbindHandler() {
    if (typeof listener === 'function') {
      var i = this._listeners[event].indexOf(listener);
      if (i > -1) {
        this._listeners[event].splice(i, 1);
      }
    } else if (
      listener !== null &&
      typeof listener === 'object' &&
      typeof listener.length === 'number'
    ) {
      for (var i = 0; i < listener.length; i += 1) {
        var j = this._listeners[event].indexOf(listener[i]);
        if (j > -1) {
          this._listeners[event].splice(j, 1);
          i -= 1;
        }
      }
    }
    var i = this._listeners[event].indexOf(unbindHandler);
    if (i > -1) {
      this._listeners[event].splice(i, 1);
    }
  });

  this._executeFlag(event, listener);

  for (var i = 0; i < this._pipedEmitters.length; i += 1) {
    var eventEmitter = this._pipedEmitters[i];
    eventEmitter._executeFlag(event, listener);
  }

  if (this._pipedEmitters[event]) {
    for (var i = 0; i < this._pipedEmitters[event].length; i += 1) {
      var eventEmitter = this._pipedEmitters[i];
      eventEmitter._executeFlag(event, listener);
    }
  }

  return this;
};
EventEmitter.prototype.once = EventEmitter.prototype.weakBind;

/**
 * Unbinds a listener from an event.
 * @param  {String|Array} event       An event
 *                                    name or
 *                                    array of
 *                                    event
 *                                    names.
 * @param  {Function|Array} listnener A listener,
 *                                    or an array
 *                                    of
 *                                    listeners.
 * @return {EventEmitter}
 */
EventEmitter.prototype.unbind = function(event, listener) {

  if (
    event !== null &&
    typeof event === 'object' &&
    typeof event.length === 'number'
  ) {
    for (var i = 0; i < event.length; i += 1) {
      this.unbind(event[i], listener);
    }
    return this;
  }

  if (this._listeners[event]) {
    var prevEvent = this.event;
    var prevSource = this.source;
    this.event = event;
    this.source = this;
    var listeners = this._listeners[event];
    if (
      listener !== null &&
      typeof listener === 'object' &&
      typeof listener.length === 'number'
    ) {
      for (var i = 0; i < listener.length; i += 1) {
        var j = listeners.indexOf(listener[i]);
        if (j > -1) {
          this.emit('emitter.unbind', listener[i]);
          listeners.splice(j, 1);
          i -= 1;
        }
      }
    } else if (typeof listener === 'function') {
      var j = listeners.indexOf(listener);
      if (j > -1) {
        this.emit('emitter.unbind', listener);
        listeners.splice(j, 1);
      }
    }
    this.event = prevEvent;
    this.source = prevSource;
  }

  return this;
};

EventEmitter.prototype.removeListener = EventEmitter.prototype.unbind;
EventEmitter.prototype.off = EventEmitter.prototype.unbind;

EventEmitter.prototype.unbindAll = function(event) {

  if (
    event !== null &&
    typeof event === 'object' &&
    typeof event.length === 'number'
  ) {
    for (var i = 0; i < event.length; i += 1) {
      this.unbindAll(event[i]);
    }
    return this;
  }

  if (typeof event === 'string' && this._listeners[event]) {
    for (var i = 0; i < this._listeners[event].length; i += 1) {
      this.unbind(event, this._listeners[event][i]);
    }
    return this;
  }

  for (var event in this._listeners) {
    for (var i = 0; i < this._listeners[event].length; i += 1) {
      this.unbind(event, this._listeners[event][i]);
    }
  }
  return this;
};

EventEmitter.prototype.removeAllListeners = EventEmitter.prototype.unbindAll;

EventEmitter.prototype.flag = function(event    ) {
  if (
    event !== null &&
    typeof event === 'object' &&
    typeof event.length === 'number'
  ) {
    for (var i = 0; i < event.length; i += 1) {
      switch(arguments.length) {
        case 1:
          this.flag(event[i]);
          break;
        case 2:
          this.flag(event[i], arguments[1]);
          break;
        case 3:
          this.flag(event[i], arguments[1], arguments[2]);
          break;
        default:
          var args = arguments.slice ? arguments.slice(1) : Array.prototype.slice.call(arguments, 1);
          args.unshift(event[i]);
          this.flag.apply(this, args);
      }
    }
    return this;
  }

  var prevEvent = this.event;
  var prevSource = this.source;
  this.event = event;
  this.source = this;
  switch(arguments.length) {
    case 1:
      this.emit('emitter.flag', event);
      break;
    case 2:
      this.emit('emitter.flag', event, arguments[1]);
      break;
    case 3:
      this.emit('emitter.flag', event, arguments[1], arguments[2]);
      break;
    default:
      var args = arguments.slice ? arguments.slice(1) : Array.prototype.slice.call(arguments, 1);
      args.unshift('emitter.flag', event);
      this.emit.apply(this, args);
  }
  this.event = prevEvent;
  this.source = prevSource;

  this._flags[event] = arguments.slice ? arguments.slice(1) : Array.prototype.slice.call(arguments, 1);

  if (this._listeners[event]) {
    var listeners = this._listeners[event].splice(0);
    for (var i = 0; i < listeners.length; i += 1) {
      this._executeFlag(event, listeners[i]);
    }
  }

  return this;
};

EventEmitter.prototype.unflag = function(event) {

  if (
    event !== null &&
    typeof event === 'object' &&
    typeof event.length === 'number'
  ) {
    for (var i = 0; i < event.length; i += 1) {
      this.unflag(event[i]);
    }
    return this;
  }

  if (this._flags[event]) {

    var prevEvent = this.event;
    var prevSource = this.source;
    this.event = event;
    this.source = this;
    this.emit('emitter.unflag', event);
    this.event = prevEvent;
    this.source = prevSource;

    delete this._flags[event];
  }

  return this;
};

EventEmitter.prototype.pipe = function(event, targetEmitter) {

  if (
    event !== null &&
    typeof event === 'object' &&
    targetEmitter === undefined
  ) {
    targetEmitter = event;
    event = null;
  }

  if (
    event !== null &&
    typeof event === 'object' &&
    typeof event.length === 'number'
  ) {
    for (var i = 0; i < event.length; i += 1) {
      this.pipe(event[i], targetEmitter);
    }
    return this;
  }

  var prevSource = this.source;
  this.source = this;
  var prevEvent = this.event;
  this.event = event;
  this.emit('emitter.pipe', targetEmitter, event);
  this.event = prevEvent;
  this.source = prevSource;

  if (event === null) {
    this._pipedEmitters.push(targetEmitter);
  } else {
    if (!this._pipedEmitters[event]) {
      this._pipedEmitters[event] = [];
    }
    this._pipedEmitters[event].push(targetEmitter);
  }

  return this;
};

EventEmitter.prototype.unpipe = function(event, targetEmitter) {

  if (
    event !== null &&
    typeof event === 'object' &&
    targetEmitter === undefined
  ) {
    targetEmitter = event;
    event = null;
  }

  if (
    event !== null &&
    typeof event === 'object' &&
    typeof event.length === 'number'
  ) {
    for (var i = 0; i < event.length; i += 1) {
      this.unpipe(event[i], targetEmitter);
    }
    return this;
  }

  var prevSource = this.source;
  this.source = this;
  var prevEvent = this.event;
  this.event = event;
  if (event === null) {
    var j = this._pipedEmitters.indexOf(targetEmitter);
    if (j > -1) {
      this.emit('emitter.unpipe', this._pipedEmitters[j]);
      this._pipedEmitters.splice(j, 1);
    }
  } else {
    if (!this._pipedEmitters[event]) { return this; }
    var j = this._pipedEmitters[event].indexOf(targetEmitter);
    if (j > -1) {
      this.emit('emitter.unpipe', this._pipedEmitters[event][j], event);
      this._pipedEmitters[event].splice(j, 1);
    }
  }
  this.event = prevEvent;
  this.source = prevSource;

  return this;
};


EventEmitter.prototype.listeners = function(event) {
  if (event) {
    return this._listeners[event];
  }
  return this._listeners;
};


module.exports = EventEmitter;
