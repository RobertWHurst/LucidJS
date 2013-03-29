var LucidJS, e;

LucidJS = require('../');

describe('Emitter', function() {

	beforeEach(function() {
		e = LucidJS.emitter();
	});

	it('should have a `set` method', function(done) {
		if(typeof e.set === 'function') { done(); }
		else { done(new Error('`set` method is missing')); }
	});

	describe('.set()', function() {
		beforeEach(newEmitter);

		it('should accept an event and trigger listeners bound to it even after `set()` has been called', function(done) {
			var i = 0;
			e.on('foo', exec);
			e.set('foo');
			e.on('foo', exec);
			function exec() { i += 1; if(i === 2) { done(); } }
		});
		it('should accept an array of events and trigger listeners bound to each of them', function(done) {
			var i = 0;
			e.on('foo', exec);
			e.on('bar', exec);
			e.set(['foo', 'bar']);
			e.on('foo', exec);
			e.on('bar', exec);
			function exec() { i += 1; if(i === 4) { done(); } }
		});
		it('should pass all arugments, except for the event name, to the listeners bound to the event', function(done) {
			e.set('foo', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20);
			e.on('foo', function(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, a17, a18, a19, a20) {
				if(
					a1 === 1 && a2 === 2 && a3 === 3 && a4 === 4 && a5 === 5 &&
					a6 === 6 && a7 === 7 && a8 === 8 && a9 === 9 && a10 === 10 &&
					a11 === 11 && a12 === 12 && a13 === 13 && a14 === 14 &&
					a15 === 15 && a16 === 16 && a17 === 17 && a18 === 18 &&
					a19 === 19 && a20 === 20
				) { done(); }
				else { done(new Error('failed to pass correct arguments')); }
			});
		});
	});
});

function newEmitter() {
	e = LucidJS.emitter();
}
