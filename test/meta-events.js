var LucidJS;

LucidJS = require('../');

describe('Emitter', function() {
	var e;

	beforeEach(function() {
		e = LucidJS.emitter();
	});

	it('should emit `emitter.event` whenever an event is emitted by the emitter that does not start with `emitter.`', function(done) {
		e.on('emitter.event', function() { done(); });
		e.trigger('foo');
	});

	it('should pass all arguments passed to trigger, including the event name, to listeners bound to `emitter.event`', function(done) {
		e.on('emitter.event', function(event, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19, a20) {
			if(
				a1 === 1 && a2 === 2 && a3 === 3 && a4 === 4 && a5 === 5 &&
				a6 === 6 && a7 === 7 && a8 === 8 && a9 === 9 && a10 === 10 &&
				a11 === 11 && a12 === 12 && a13 === 13 && a14 === 14 &&
				a15 === 15 && a16 === 16 && a17 === 17 && a18 === 18 &&
				a19 === 19 && a20 === 20 && event === 'foo'
			) { done(); }
			else { done(new Error('failed to pass correct arguments')); }
		});
		e.trigger('foo', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20);
	});

	it('should emit `emitter.listener` whenever a listener is bound to any event that does not start with `emitter.`', function(done) {
		e.on('emitter.listener', function() { done(); });
		e.on('foo', function() {});
	});

	it('should pass event name and listeners to listeners bound to `emitter.listener` whenever a listener is bound to any event that does not start with `emitter.`', function(done) {
		var i = 0;
		e.on('emitter.listener', function(event, l) {
			l(); if(event === 'foo' && i === 11111) { done(); }
		});
		e.on('foo', l1, l2, l3, l4, l5);
		function l1() { i += 1; }
		function l2() { i += 10; }
		function l3() { i += 100; }
		function l4() { i += 1000; }
		function l5() { i += 10000; }
	});
});
