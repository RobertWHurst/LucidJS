
// modules
var test = require('tape');

// libs
var EventEmitter = require('../lib/event-emitter');

// test globals
var eventEmitter;


test('new EventEmitter()', function(t) {
  t.doesNotThrow(function() {
    eventEmitter = new EventEmitter();
  }, 'does not throw on construction');
  t.equal(eventEmitter.source, null, 'has source property');
  t.equal(eventEmitter.event, null, 'has event property');
  t.equal(eventEmitter.cancelBubble, false, 'has cancelBubble property');

  t.end();
});

test('eventEmitter.emit()', function(t) {
  t.equal(typeof eventEmitter.emit, 'function', 'has an emit method');
  t.end();
});

test('eventEmitter.emit() - No Arguments', function(t) {
  eventEmitter._listeners.event = [ function() {
    t.equal(this, eventEmitter, 'listener context is the emitter');
    t.equal(eventEmitter.source, eventEmitter, 'source is set');
    t.equal(eventEmitter.event, 'event', 'event is set');
    t.end();
  } ];
  eventEmitter.emit('event');
});

test('eventEmitter.emit() - 3 Arguments', function(t) {
  eventEmitter._listeners.event = [ function(a1, a2, a3) {
    t.equal(a1, 'a1', 'argument 1 is passed');
    t.equal(a2, 'a2', 'argument 2 is passed');
    t.equal(a3, 'a3', 'argument 3 is passed');
    t.end();
  } ];
  eventEmitter.emit('event', 'a1', 'a2', 'a3');
});

test('eventEmitter.emit() - 4 Arguments', function(t) {
  eventEmitter._listeners.event = [ function(a1, a2, a3, a4) {
    t.equal(a4, 'a4', 'argument 4 is passed');
    t.end();
  } ];
  eventEmitter.emit('event', 'a1', 'a2', 'a3', 'a4');
});

test('eventEmitter.emit() - Multiple Events', function(t) {
  var event1Fired = true;
  eventEmitter._listeners.event1 = [ function() {
    event1Fired = true;
    t.equal(eventEmitter.event, 'event1', 'event is set for the first event');
  } ];
  eventEmitter._listeners.event2 = [ function() {
    t.ok(event1Fired, 'event1 fired');
    t.equal(eventEmitter.event, 'event2', 'event is set for the second event');
    t.end();
  } ];
  eventEmitter.emit([ 'event1', 'event2' ]);
});

test('eventEmitter.emit() - Event Overlap', function(t) {
  var event2Fired = false;
  eventEmitter._listeners.event1 = [ function() {
    t.equal(eventEmitter.event, 'event1', 'event is set for the first event');
    eventEmitter.trigger('event2');
    t.ok(event2Fired, 'event2 fired');
    t.equal(eventEmitter.event, 'event1', 'event is restored');
    t.end();
  } ];
  eventEmitter._listeners.event2 = [ function() {
    t.equal(eventEmitter.event, 'event2', 'event is set for the second event');
    event2Fired = true;
  } ];
  eventEmitter.emit('event1');
});

test('eventEmitter.emit() - Event Mutation', function(t) {
  var firstListenerCalled = false;
  eventEmitter._listeners.event = [ function tmpListener() {
    firstListenerCalled = true;
    eventEmitter._listeners.event.shift();
  }, function() {
    t.ok(firstListenerCalled, 'first listener called');
    t.end();
  } ];
  eventEmitter.emit('event');
});

test('eventEmitter.emit() - Unhandled Error Event', function(t) {
  t.throws(
    function() {
      eventEmitter.emit('error', new Error('error message'));
    },
    /error message/,
    'throws the first argument of an error event if no listeners are bound'
  );
  t.end();
});

test('eventEmitter.emit() - Unhandled Empty Error Event', function(t) {
  t.throws(
    function() {
      eventEmitter.emit('error');
    },
    /Unknown emitter error/,
    'throws an \'unknown\' error if an error object isn\'t passed as the ' +
    'first argument'
  );
  t.end();
});

test('eventEmitter.emit() - Handled Error Event', function(t) {
  eventEmitter._listeners.error = [ function() {
    t.end();
  } ];
  t.doesNotThrow(
    function() {
      eventEmitter.emit('error');
    },
    'does not throw if listeners are bound'
  );
});

test('eventEmitter.emit() - Event Namespacing', function(t) {
  var eventFired = false;
  var ns2Fired = false;
  eventEmitter._listeners['ns1.ns2.event'] = [ function() {
    eventFired = true;
  } ];
  eventEmitter._listeners['ns1.ns2'] = [ function() {
    ns2Fired = true;
  } ];
  eventEmitter._listeners['ns1'] = [ function() {
    t.ok(eventFired, 'ns1.ns2.event event fired');
    t.ok(ns2Fired, 'ns1.ns2 event fired');
    t.end();
  } ];
  eventEmitter.emit('ns1.ns2.event');
});

test('eventEmitter.emit() - Meta Event', function(t) {
  eventEmitter._listeners = {};
  eventEmitter._listeners['emitter.emit'] = [ function() {
    t.equal(this.event, 'event', 'event is set');
    t.end();
  } ];
  eventEmitter.emit('event');
});

test('eventEmitter.trigger()', function(t) {
  t.equal(eventEmitter.trigger, eventEmitter.emit, 'aliases emit()');
  t.end();
});

test('eventEmitter.bind() - Single Listener', function(t) {
  t.equal(typeof eventEmitter.bind, 'function', 'has bind method');
  var listener = function() {};
  eventEmitter._listeners = {};
  eventEmitter.bind('event', listener);
  t.equal(eventEmitter._listeners.event[0], listener, 'saves listener');
  t.end();
});

test('eventEmitter.bind() - Multiple Listeners', function(t) {
  var listener1 = function() {};
  var listener2 = function() {};
  eventEmitter._listeners = {};
  eventEmitter.bind('event', [ listener1, listener2 ]);
  t.equal(eventEmitter._listeners.event[0], listener1, 'saves listener1');
  t.equal(eventEmitter._listeners.event[1], listener2, 'saves listener2');
  t.end();
});

test('eventEmitter.bind() - Multiple Events', function(t) {
  var listener = function() {};
  eventEmitter._listeners = {};
  eventEmitter.bind([ 'event1', 'event2' ], listener);
  t.equal(
    eventEmitter._listeners.event1[0],
    listener,
    'saves listener to event1'
  );
  t.equal(
    eventEmitter._listeners.event2[0],
    listener,
    'saves listener to event2'
  );
  t.end();
});

test('eventEmitter.bind() - Meta Event', function(t) {
  var listener = function() {};
  eventEmitter._listeners['emitter.bind'] = [ function(_listener) {
    t.equal(this.event, 'event', 'event is set');
    t.equal(_listener, listener, 'listener is passed in');
    t.end();
  } ];
  eventEmitter.bind('event', listener);
});

test('eventEmitter.bind() - Flagged Event Without Arguments', function(t) {
  eventEmitter._listeners = {};
  eventEmitter._flags.event = [ 'a1', 'a2', 'a3' ];
  eventEmitter.bind('event', function() {
    t.end();
  });
});

test('eventEmitter.bind() - Flag Listeners With Arguments', function(t) {
  eventEmitter._flags.event = [ 'a1', 'a2', 'a3' ];
  eventEmitter.bind('event', function(a1, a2, a3) {
    t.equal(a1, 'a1', 'argument 1 is passed');
    t.equal(a2, 'a2', 'argument 2 is passed');
    t.equal(a3, 'a3', 'argument 3 is passed');
    t.end();
  });
});

test('eventEmitter.addListener()', function(t) {
  t.equal(eventEmitter.addListener, eventEmitter.bind, 'aliases bind');
  t.end();
});

test('eventEmitter.on()', function(t) {
  t.equal(eventEmitter.on, eventEmitter.bind, 'aliases bind');
  t.end();
});

test('eventEmitter.weakBind()', function(t) {
  t.equal(typeof eventEmitter.weakBind, 'function', 'has weakBind method');
  var listenerCalled = false;
  var listener = function() {
    listenerCalled = true;
  };
  eventEmitter._flags = {};
  eventEmitter._listeners = {};
  eventEmitter.weakBind('event', listener);
  t.equal(eventEmitter._listeners.event[0], listener, 'saves listener');
  eventEmitter.emit('event');
  t.ok(listenerCalled, 'listener called');
  t.equal(eventEmitter._listeners.event[0], undefined);
  t.end();
});

test('eventEmitter.once()', function(t) {
  t.equal(eventEmitter.once, eventEmitter.weakBind, 'aliases weakBind');
  t.end();
});

test('eventEmitter.unbind() - Single Listener', function(t) {
  var listener = function() {};
  eventEmitter._listeners.event = [listener];
  eventEmitter.unbind('event', listener);
  t.equal(eventEmitter._listeners.event[0], undefined, 'removes listener');
  t.end();
});

test('eventEmitter.unbind() - Multiple Listener', function(t) {
  var listener1 = function() {};
  var listener2 = function() {};
  eventEmitter._listeners.event = [ listener1, listener2 ];
  eventEmitter.unbind('event', [ listener1, listener2 ]);
  t.equal(eventEmitter._listeners.event[0], undefined, 'removes listener1');
  t.equal(eventEmitter._listeners.event[1], undefined, 'removes listener2');
  t.end();
});

test('eventEmitter.unbind() - Multiple Events', function(t) {
  var listener = function() {};
  eventEmitter._listeners.event1 = [ listener ];
  eventEmitter._listeners.event2 = [ listener ];
  eventEmitter.unbind([ 'event1', 'event2' ], listener);
  t.equal(eventEmitter._listeners.event1[0], undefined, 'removes listener from event1');
  t.equal(eventEmitter._listeners.event2[0], undefined, 'removes listener from event2');
  t.end();
});

test('eventEmitter.unbind() - Meta Event', function(t) {
  var listener = function() {};
  eventEmitter._listeners.event = [ listener ];
  eventEmitter._listeners['emitter.unbind'] = [ function() {
    t.equal(this.event, 'event', 'event is set');
    t.end();
  } ];
  eventEmitter.unbind('event', listener);
});

test('eventEmitter.removeListener()', function(t) {
  t.equal(eventEmitter.removeListener, eventEmitter.unbind, 'aliases unbind');
  t.end();
});

test('eventEmitter.off()', function(t) {
  t.equal(eventEmitter.off, eventEmitter.unbind, 'aliases unbind');
  t.end();
});

test('eventEmitter.unbindAll() - All Events', function(t) {
  var listener1 = function() {};
  var listener2 = function() {};
  eventEmitter._listeners = {};
  eventEmitter._listeners.event1 = [ listener1 ];
  eventEmitter._listeners.event2 = [ listener2 ];
  eventEmitter.unbindAll();
  t.equal(eventEmitter._listeners.event1[0], undefined, 'removes listener1');
  t.equal(eventEmitter._listeners.event2[0], undefined, 'removes listener2');
  t.end();
});

test('eventEmitter.unbindAll() - Single Event', function(t) {
  var listener1 = function() {};
  var listener2 = function() {};
  eventEmitter._listeners.event1 = [ listener1 ];
  eventEmitter._listeners.event2 = [ listener2 ];
  eventEmitter.unbindAll('event1');
  t.equal(eventEmitter._listeners.event1[0], undefined, 'removes listener1');
  t.equal(typeof eventEmitter._listeners.event2[0], 'function', 'leaves listener2');
  t.end();
});

test('eventEmitter.removeAllListeners()', function(t) {
  t.equal(eventEmitter.removeAllListeners, eventEmitter.unbindAll, 'aliases unbindAll');
  t.end();
});

test('eventEmitter.flag() - Single Flag No Arguments', function(t) {
  eventEmitter.flag('event');
  eventEmitter.bind('event', function() {
    t.pass('event fired');
    t.end();
  });
});

test('eventEmitter.flag() - Single Flag 3 Arguments', function(t) {
  eventEmitter._listeners = {};
  eventEmitter.flag('event', 'a1', 'a2', 'a3');
  eventEmitter.bind('event', function(a1, a2, a3) {
    t.equal(a1, 'a1', 'argument 1 is passed');
    t.equal(a2, 'a2', 'argument 2 is passed');
    t.equal(a3, 'a3', 'argument 3 is passed');
    t.end();
  });
});

test('eventEmitter.flag() - Multiple Flags', function(t) {
  eventEmitter.flag([ 'event1', 'event2' ]);
  var event1Fired = false;
  eventEmitter.bind('event', function() {
    event1Fired = true;
  });
  eventEmitter.bind('event', function() {
    t.ok(event1Fired, 'event1 fired');
    t.end();
  });
});

test('eventEmitter.flag() - Prebound Listeners', function(t) {
  var event1Fired = 0;
  eventEmitter._listeners.event = [ function() {
    event1Fired += 1;
  } ];
  eventEmitter.flag('event');
  eventEmitter.bind('event', function() {
    t.equal(event1Fired, 1, 'event1 fired once');
    t.end();
  });
});

test('eventEmitter.flag() - Multiple Flags with Mixed Binding', function(t) {
  var event1Fired = false;
  eventEmitter.bind('event1:prebound', function() {
    event1Fired = true;
  });
  
  eventEmitter.flag([ 'event1:prebound', 'event2:postbound' ]);

  eventEmitter.bind('event2:postbound', function() {
    t.ok(event1Fired, 'event1:prebound fired');
    t.end();
  });
});

test('eventEmitter.flag() - Meta Event', function(t) {
  eventEmitter._listeners = {};
  eventEmitter._listeners['emitter.flag'] = [ function() {
    t.equal(this.event, 'event', 'event is set');
    t.end();
  } ];
  eventEmitter.flag('event');
});

test('eventEmitter.unflag() - Single Event', function(t) {
  eventEmitter._flags.event = [];
  eventEmitter.unflag('event');
  t.equal(eventEmitter._flags.event, undefined, 'removes event flag');
  t.end();
});

test('eventEmitter.unflag() - Multiple Event', function(t) {
  eventEmitter._flags.event1 = [];
  eventEmitter._flags.event2 = [];
  eventEmitter.unflag([ 'event1', 'event2' ]);
  t.equal(eventEmitter._flags.event1, undefined, 'removes event1 flag');
  t.equal(eventEmitter._flags.event2, undefined, 'removes event2 flag');
  t.end();
});

test('eventEmitter.unflag() - Meta Event', function(t) {
  eventEmitter._flags.event = [];
  eventEmitter._listeners['emitter.unflag'] = [ function() {
    t.equal(this.event, 'event', 'event is set');
    t.end();
  } ];
  eventEmitter.unflag('event');
});

test('eventEmitter.pipe() - Single Event', function(t) {
  var otherEmitter = new EventEmitter();
  eventEmitter.pipe('event', otherEmitter);
  otherEmitter.bind('event', function() {
    t.equal(this.source, eventEmitter, 'source is set correctly');
    t.end();
  });
  eventEmitter.emit('event');
});

test('eventEmitter.pipe() - Multiple Event', function(t) {
  var otherEmitter = new EventEmitter();
  eventEmitter._pipedEmitters = [];
  eventEmitter.pipe([ 'event1', 'event2' ], otherEmitter);
  var event1Fired = false;
  otherEmitter.bind('event1', function() {
    event1Fired = true;
  });
  otherEmitter.bind('event2', function() {
    t.ok(event1Fired, 'event1 fired');
    t.pass('event2 fired');
    t.end();
  });
  eventEmitter.emit('event1');
  eventEmitter.emit('event2');
});

test('eventEmitter.pipe() - All Events', function(t) {
  var otherEmitter = new EventEmitter();
  eventEmitter._pipedEmitters = [];
  eventEmitter.pipe(otherEmitter);
  var event1Fired = false;
  otherEmitter.bind('event1', function() {
    event1Fired = true;
  });
  otherEmitter.bind('event2', function() {
    t.ok(event1Fired, 'event1 fired');
    t.pass('event2 fired');
    t.end();
  });
  eventEmitter.emit('event1');
  eventEmitter.emit('event2');
});

test('eventEmitter.pipe() - Meta Event', function(t) {
  var otherEmitter = new EventEmitter();
  eventEmitter._listeners['emitter.pipe'] = [ function() {
    t.equal(this.event, 'event', 'event is set');
    t.end();
  } ];
  eventEmitter.pipe('event', otherEmitter);
});

test('eventEmitter.unpipe() - Remove Scoped Pipe', function(t) {
  var otherEmitter = new EventEmitter();
  eventEmitter._pipedEmitters.event = [ otherEmitter ];
  eventEmitter.unpipe('event', otherEmitter);
  t.equal(eventEmitter._pipedEmitters.event[0], undefined, 'removes piped emitter');
  t.end();
});

test('eventEmitter.unpipe() - Remove Full Pipe', function(t) {
  var otherEmitter = new EventEmitter();
  eventEmitter._pipedEmitters = [ otherEmitter ];
  eventEmitter.unpipe(otherEmitter);
  t.equal(eventEmitter._pipedEmitters[0], undefined, 'removes piped emitter');
  t.end();
});

test('eventEmitter.unpipe() - Meta Event', function(t) {
  var otherEmitter = new EventEmitter();
  eventEmitter._pipedEmitters = [ otherEmitter ];
  eventEmitter._listeners['emitter.unpipe'] = [ function() {
    t.equal(this.event, null, 'event is set');
    t.end();
  } ];
  eventEmitter.unpipe(otherEmitter);
});

test('eventEmitter.listeners() - All listeners', function(t) {
  t.equal(eventEmitter.listeners(), eventEmitter._listeners, 'returns all listeners');
  t.end();
});

test('eventEmitter.listeners() - All listeners', function(t) {
  eventEmitter._listeners.event = [];
  t.equal(eventEmitter.listeners('event'), eventEmitter._listeners.event, 'returns event listeners');
  t.end();
});
