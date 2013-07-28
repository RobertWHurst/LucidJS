
var should = require('should');
var EventEmitter = require('../lib/event-emitter');


describe('eventEmitter', function() {

});

describe('eventEmitter.emit()', function(done) {

  it('emits an event on listeners bound to it', function(done) {
    var eventEmitter = new EventEmitter();
    eventEmitter._listeners.foo = [function() { done(); }]
    eventEmitter.emit('foo');
  });

  it('emits an array of events on listeners bound to each of them', function(done) {
    var eventEmitter = new EventEmitter();
    var fooEvent = false;
    eventEmitter._listeners.foo = [function() { fooEvent = true; }];
    eventEmitter._listeners.bar = [
      function() {
        fooEvent.should.be.true;
        done();
      }
    ];
    eventEmitter.emit(['foo', 'bar']);
  });

  it('passes arguments to event listeners', function(done) {
    var eventEmitter = new EventEmitter();
    var singleArgEvent = false;
    eventEmitter._listeners.foo = [
      function(arg1) {
        arg1.should.equal('bar');
        singleArgEvent = true;
      }
    ];
    eventEmitter.emit('foo', 'bar');

    eventEmitter._listeners.numbers = [
      function(one, two, three, four, five, six, seven, eight) {
        singleArgEvent.should.be.true;
        one.should.equal('one');
        two.should.equal('two');
        three.should.equal('three');
        four.should.equal('four');
        five.should.equal('five');
        six.should.equal('six');
        seven.should.equal('seven');
        eight.should.equal('eight');
        done();
      }
    ];
    eventEmitter.emit('numbers', 'one', 'two', 'three', 'four', 
      'five', 'six', 'seven', 'eight');
  });

  it('expands scoped event and emits each level of it', function(done) {
    var eventEmitter = new EventEmitter();
    var dotEvent = false;
    eventEmitter._listeners['foo.bar'] = [ function() { dotEvent = true; } ];
    eventEmitter._listeners.foo = [ 
      function() {
        dotEvent.should.be.true;
        done();
      }
    ];
    eventEmitter.emit('foo.bar.baz');
  });

  it('sets the .event to the event name', function(done) {
    var eventEmitter = new EventEmitter();
    eventEmitter._listeners.foo = [ 
      function() {
        this.event.should.equal('foo.bar');
        done();
      }
    ];
    eventEmitter.emit('foo.bar');
  });

  it('sets the .source to eventEmitter', function(done) {
    var eventEmitter = new EventEmitter();
    eventEmitter._listeners.foo = [ 
      function() {
        this.source.should.equal(eventEmitter);
        done();
      }
    ];
    eventEmitter.emit('foo.bar');
  });

  it('sets .source and .event to undefined when .emit finishes', function() {
    var eventEmitter = new EventEmitter();
    eventEmitter.emit('foo');
    should.not.exist(eventEmitter.source);
    should.not.exist(eventEmitter.event);
  });

  it('calls .emit on piped emitters', function(done) {
    var eventEmitter = new EventEmitter();
    var pipedEventEmitter = new EventEmitter();
    eventEmitter._eventEmitters.push(pipedEventEmitter);
    pipedEventEmitter._listeners.foo = [ function() { done(); }];
    eventEmitter.emit('foo');
  });

  it('sets .source on piped emitters to the eventEmitter', function(done) {
    var eventEmitter = new EventEmitter();
    var pipedEventEmitter = new EventEmitter();
    eventEmitter._eventEmitters.push(pipedEventEmitter);
    pipedEventEmitter._listeners.foo = [
      function() {
        this.source.should.equal(eventEmitter);
        done();
      }
    ];
    eventEmitter.emit('foo');
  });

  it('saves and restores emit state when listener invokes another event', function(done) {
    var eventEmitter = new EventEmitter();
    eventEmitter._listeners.foo = [function() {
      this.event.should.equal('foo');
      this.cancelBubble = true;
      this.emit('bar');
    }];
    eventEmitter._listeners.bar = [function() {
      this.cancelBubble.should.be.false;
      this.event.should.equal('bar');
      done();
    }];
    eventEmitter.emit('bar');
  });

  it('returns the eventEmitter', function() {
    var eventEmitter = new EventEmitter();
    eventEmitter.emit('foo').should.equal(eventEmitter);
  });
});


describe('eventEmitter.bind()', function() {

  it('binds a listener to an event', function() {
      var eventEmitter = new EventEmitter();
      var foo = function() {};
      eventEmitter.bind('foo', foo);
      eventEmitter._listeners.foo[0].should.equal(foo);
  });

  it('binds a listener to an array of events', function() {
      var eventEmitter = new EventEmitter();
      var fooAndBar = function() {};
      eventEmitter.bind(['foo', 'bar'], fooAndBar);
      eventEmitter._listeners.foo[0].should.equal(fooAndBar);
      eventEmitter._listeners.bar[0].should.equal(fooAndBar);
  });

  it('binds a array of listeners to an event', function() {
      var eventEmitter = new EventEmitter();
      var foo = function() {};
      var bar = function() {};
      eventEmitter.bind('fooAndBar', [foo, bar]);
      eventEmitter._listeners.fooAndBar[0].should.equal(foo);
      eventEmitter._listeners.fooAndBar[1].should.equal(bar);
  });

  it('calls listeners bound to a flag', function(done) {
      var eventEmitter = new EventEmitter();
      eventEmitter._flags.foo = [];
      eventEmitter.bind('foo', function() { done(); });
  });

  it('passes all flag arguments', function(done) {
      var eventEmitter = new EventEmitter();
      eventEmitter._flags.foo = ['one', 'two', 'three'];
      eventEmitter.bind('foo', function(one, two, three) {
        one.should.equal('one');
        two.should.equal('two');
        three.should.equal('three');
        done();
      });
  });

  it('sets .event when calling listeners bound to a flag', function(done) {
      var eventEmitter = new EventEmitter();
      eventEmitter._flags.foo = [];
      eventEmitter.bind('foo', function() {
        this.event.should.equal('foo');
        done();
      });
  });

  it('sets .source when calling listeners bound to a flag', function(done) {
      var eventEmitter = new EventEmitter();
      eventEmitter._flags.foo = [];
      eventEmitter.bind('foo', function() {
        this.source.should.equal(this);
        done();
      });
  });

  it('calls listeners on bound to a flag from piped eventEmitter', function(done) {
      var eventEmitter = new EventEmitter();
      var pipedEventEmitter = new EventEmitter();
      eventEmitter._eventEmitters = [pipedEventEmitter];
      pipedEventEmitter._flags.foo = [];
      eventEmitter.bind('foo', function() {
        this.source.should.equal(this);
        done();
      });
  });

  it('returns the eventEmitter', function() {
    var eventEmitter = new EventEmitter();
    eventEmitter.bind('foo', function() {}).should.equal(eventEmitter);
  });
});


describe('eventEmitter.addEventListener()', function() {

  it('is an alias for eventEmitter.bind()', function() {
    var eventEmitter = new EventEmitter();
    eventEmitter.addEventListener.should.equal(eventEmitter.bind);
  });
});

describe('eventEmitter.on()', function() {

  it('is an alias for eventEmitter.bind()', function() {
    var eventEmitter = new EventEmitter();
    eventEmitter.on.should.equal(eventEmitter.bind);
  });
});

describe('eventEmitter.unbind()', function() {

  it('unbinds a listener from an event', function() {
    var eventEmitter = new EventEmitter();
    var foo = function() {};
    eventEmitter._listeners.foo = [foo];
    eventEmitter.unbind('foo', foo);
    eventEmitter._listeners.foo.length.should.equal(0);
  });

  it('unbinds a listener from an array of events', function() {
    var eventEmitter = new EventEmitter();
    var fooAndBar = function() {};
    eventEmitter._listeners.foo = [fooAndBar];
    eventEmitter._listeners.bar = [fooAndBar];
    eventEmitter.unbind(['foo', 'bar'], fooAndBar);
    eventEmitter._listeners.foo.length.should.equal(0);
    eventEmitter._listeners.bar.length.should.equal(0);
  });

  it('unbinds an array of listeners from an event', function() {
    var eventEmitter = new EventEmitter();
    var foo = function() {};
    var bar = function() {};
    eventEmitter._listeners.fooAndBar = [foo, bar];
    eventEmitter.unbind('fooAndBar', [foo, bar]);
    eventEmitter._listeners.fooAndBar.length.should.equal(0);
  });
});

describe('eventEmitter.removeEventListener()', function() {

  it('is an alias for eventEmitter.unbind()', function() {
    var eventEmitter = new EventEmitter();
    eventEmitter.removeEventListener.should.equal(eventEmitter.unbind);
  });
});

describe('eventEmitter.off()', function() {

  it('is an alias for eventEmitter.unbind()', function() {
    var eventEmitter = new EventEmitter();
    eventEmitter.off.should.equal(eventEmitter.unbind);
  });
});

describe('eventEmitter.flag()', function() {

  it('flags an event', function() {
    var eventEmitter = new EventEmitter();
    eventEmitter.flag('foo');
    eventEmitter._flags.foo.should.be.ok;
  });

  it('flags an array of events', function() {
    var eventEmitter = new EventEmitter();
    eventEmitter.flag(['foo', 'bar']);
    eventEmitter._flags.foo.should.be.ok;
    eventEmitter._flags.bar.should.be.ok;
  });

  it('retains flag arguments', function() {
    var eventEmitter = new EventEmitter();
    eventEmitter.flag('numbers', 'one', 'two', 'three');
    eventEmitter._flags.numbers[0].should.equal('one');
    eventEmitter._flags.numbers[1].should.equal('two');
    eventEmitter._flags.numbers[2].should.equal('three');
  });

  it('returns the eventEmitter', function() {
    var eventEmitter = new EventEmitter();
    eventEmitter.flag('foo', 'bar').should.equal(eventEmitter);
  });
});

describe('eventEmitter.unFlag()', function() {

  it('unflags an event', function() {
    var eventEmitter = new EventEmitter();
    eventEmitter._flags.foo = [];
    eventEmitter.unflag('foo');
    should.not.exist(eventEmitter._flags.foo);
  });

  it('unflags an array of events', function() {
    var eventEmitter = new EventEmitter();
    eventEmitter._flags.foo = [];
    eventEmitter._flags.bar = [];
    eventEmitter.unflag(['foo', 'bar']);
    should.not.exist(eventEmitter._flags.foo);
    should.not.exist(eventEmitter._flags.bar);
  });

  it('returns the eventEmitter', function() {
    var eventEmitter = new EventEmitter();
    eventEmitter.unflag('foo').should.equal(eventEmitter);
  });
});

describe('`emitter.event`', function() {

  it('caused by emiting events', function(done) {
    var eventEmitter = new EventEmitter();
    eventEmitter._listeners['emitter.event'] = [function() { done(); }];
    eventEmitter.emit('foo');
  });

  it('sets .event to the source event', function(done) {
    var eventEmitter = new EventEmitter();
    eventEmitter._listeners['emitter.event'] = [function() {
      this.event.should.equal('foo');
      done();
    }];
    eventEmitter.emit('foo');
  });

  it('passes listeners arguements from the source event', function(done) {
    var eventEmitter = new EventEmitter();
    eventEmitter._listeners['emitter.event'] = [function(bar) {
      bar.should.equal('bar');
      done();
    }];
    eventEmitter.emit('foo', 'bar');
  });
});
