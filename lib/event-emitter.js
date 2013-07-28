

function EventEmitter(eventSource) {
  this._listeners = {};
  this._eventEmitters = [];
  this._flags = {};

  // When an event is being emitted .event will
  // be set the event name and .source will be
  // the emitter the event originated from.
  this.source = undefined;
  this.event = undefined;

  // cancelBubble is for use inside of listener
  this.cancelBubble = false;
}

EventEmitter.prototype._expandEvent = function(event) {
  var ec = event.split('.');
  var e = [];
  while(ec[0] != undefined) {
    e.push(ec.join('.'));
    ec.length -= 1;
  }
  return e;
};

EventEmitter.prototype.emit = function(event    ) {

  // several events
  if(typeof event == 'object' && typeof event.push == 'function') {
    var args;
    for(var i = 0; i < event.length; i += 1) {
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
  if(this._remoteSource) { this._remoteSource = undefined; }

  // fire meta event
  if(event.slice(0, 7) != 'emitter') {

    // set the current event
    var prevEvent = this.event;
    this.event = event;

    switch(arguments.length) {
      case 1:
        this.emit('emitter.event');
        break;
      case 2:
        this.emit('emitter.event', arguments[1]);
        break;
      case 3:
        this.emit('emitter.event', arguments[1], arguments[2]);
        break;
      default:
        var args = arguments.slice ? arguments.slice(1) : Array.prototype.slice.call(arguments, 1);
        args.unshift('emitter.event');
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
  for(var i = 0; i < expandedEvents.length; i += 1) {
    var expandedEvent = expandedEvents[i];

    // execute each listener
    var _cancelBubble;
    var listeners = this._listeners[expandedEvent];
    if(!listeners) { continue; }
    for(var j = 0; j < listeners.length; j += 1) {
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
      if(_cancelBubble === false) { this.cancelBubble = false; }
    }
  }

  // restore the previous value of event
  if(event.slice(0, 7) != 'emitter') { this.event = prevEvent; }

  // if no remote source was set then set source
  // to undefined
  this.source = prevSource;

  // if cancel bubble is not true then allow
  // emitting on piped eventEmitters
  if(!this.cancelBubble) {

    // fully piped eventEmitters
    for(var i = 0; i < this._eventEmitters.length; i += 1) {
      var eventEmitter = this._eventEmitters[i];
      eventEmitter._remoteSource = this;
      eventEmitter.emit.apply(eventEmitter, arguments);
    }

    // selectively piped eventEmitters
    for(var i = 0; i < expandedEvents.length; i += 1) {
      var expandedEvent = expandedEvents[i];

      var eventEmitters = this._eventEmitters[expandedEvent];
      if(!eventEmitters) { continue; }
      for(var i = 0; i < eventEmitters.length; i += 1) {
        eventEmitter = eventEmitters[i];
        eventEmitter._remoteSource = this;
        eventEmitter.emit.apply(eventEmitter, arguments);
      }
    }
  }
  
  //restore the previous state of the bubble
  this.cancelBubble = prevCancelBubble;

  return this;
};

EventEmitter.prototype.bind = function(event, listener) {

  if(typeof event == 'object' && typeof event.push == 'function') {
    for(var i = 0; i < event.length; i += 1) {
      this.bind(event[i], listener);
    }
    return this;
  }

  if(!this._listeners[event]) { this._listeners[event] = []; };
  
  if(typeof listener == 'function') { 
    this._listeners[event].push(listener);
  } else if(typeof listener == 'object') {
    for(var i = 0; i < listener.length; i += 1) {
      this._listeners[event].push(listener[i]);
    }
  }

  this._executeFlag(event, listener);

  for(var i = 0; i < this._eventEmitters.length; i += 1) {
    var eventEmitter = this._eventEmitters[i];
    eventEmitter._executeFlag(event, listener);
  }

  if(this._eventEmitters[event]) {
    for(var i = 0; i < this._eventEmitters[event].length; i += 1) {
      var eventEmitter = this._eventEmitters[i];
      eventEmitter._executeFlag(event, listener);
    }
  }

  return this;
};

EventEmitter.prototype.addEventListener = EventEmitter.prototype.bind;
EventEmitter.prototype.on = EventEmitter.prototype.bind;

EventEmitter.prototype._executeFlag = function(event, listener) {
  if(this._flags[event]) {
    var prevSource = this.source;
    var prevEvent = this.event;
    this.source = this;
    this.event = event;
    if(typeof listener == 'function') { 
      listener.apply(this, this._flags[event]);
    } else if(typeof listener == 'object') {
      for(var i = 0; i < listener.length; i += 1) {
        listener[i].apply(this, this._flags[event]);
      }
    }
    this.source = prevSource;
    this.event = prevEvent;
  }
};

EventEmitter.prototype.unbind = function(event, listener) {
  if(typeof event == 'object' && typeof event.push == 'function') {
    for(var i = 0; i < event.length; i += 1) {
      this.unbind(event[i], listener);
    }
  }
  if(this._listeners[event]) {
    var listeners = this._listeners[event];
    if(typeof listener == 'object') {
      for(var i = 0; i < listener.length; i += 1) {
        listeners.splice(listeners.indexOf(listener[i]), 1);
      }
    } else if(typeof listener == 'function') {
      listeners.splice(listeners.indexOf(listener), 1);
    }
  }
};

EventEmitter.prototype.removeEventListener = EventEmitter.prototype.unbind;
EventEmitter.prototype.off = EventEmitter.prototype.unbind;

EventEmitter.prototype.flag = function(event    ) {
  if(typeof event == 'object' && typeof event.push == 'function') {
    for(var i = 0; i < event.length; i += 1) {
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

  this._flags[event] = arguments.slice ? arguments.slice(1) : Array.prototype.slice.call(arguments, 1);

  return this;
};

EventEmitter.prototype.unflag = function(event) {

  if(typeof event == 'object' && typeof event.push == 'function') {
    for(var i = 0; i < event.length; i += 1) {
      this.unflag(event[i]);
    }
    return this;
  }

  if(this._flags[event]) { delete this._flags[event]; }

  return this;
};

EventEmitter.prototype.pipe = function(event, eventSource) {

};

EventEmitter.prototype.unpipe = function(event, eventSource) {

};


module.exports = EventEmitter;
