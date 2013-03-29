var LucidJS, e, b;

LucidJS = require('../');

describe('LucidJS', function() {
	describe('.emitter()', function() {
		it('should return an emitter object', function(done) {
			e = LucidJS.emitter();
			if(typeof e === 'object') { done(); }
			else { done(new Error('failed to return new emitter object')); }
		});
		it('should accept an object and augment it to be an emitter', function(done) {
			var obj = {};
			e = LucidJS.emitter(obj);
			if(e === obj) { done(); }
			else { done(new Error('failed to augment existing object with emitter')); }
		});
		it('should accept an array and augment it to be an emitter', function(done) {
			var obj = [];
			e = LucidJS.emitter(obj);
			if(e === obj) { done(); }
			else { done(new Error('failed to augment existing array with emitter')); }
		});
	});
});

describe('Emitter', function() {

	beforeEach(newEmitter);

	it('should have a `trigger` method', function(done) {
		if(typeof e.trigger === 'function') { done(); }
		else { done(new Error('`trigger` method is missing')); }
	});

	it('should have a `on` method', function(done) {
		if(typeof e.on === 'function') { done(); }
		else { done(new Error('`on` method is missing')); }
	});

	it('should have a `once` method', function(done) {
		if(typeof e.once === 'function') { done(); }
		else { done(new Error('`once` method is missing')); }
	});

	describe('.trigger()', function() {

		beforeEach(newEmitter);

		it('should accept an event and trigger listeners bound to it', function(done) {
			e.on('foo', done);
			e.trigger('foo');
		});
		it('should accept an array of events and trigger listeners bound to each of them', function(done) {
			var i = 0;
			e.on('foo', exec);
			e.on('bar', exec);
			e.trigger(['foo', 'bar']);
			function exec() { i += 1; if(i === 2) { done(); } }
		});
		it('should pass all arugments, except for the event name, to the listeners bound to the event', function(done) {
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
			e.trigger('foo', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20);
		});
		it('should return false if one or more listeners return false', function(done) {
			e.on('foo', function() {});
			e.on('foo', function() { return false; });
			e.on('foo', function() {});
			if(e.trigger('foo') === false) { done(); }
			else { done(new Error('failed to return false when a bound listener had returned false')); }
		});
	});

	describe('.on()', function() {

		beforeEach(newEmitter);

		it('should accept any number of listeners', function(done) {
			var i = 0;
			e.on('foo',
				function() { exec(1); },
				function() { exec(10); },
				function() { exec(100); },
				function() { exec(1000); },
				function() { exec(10000); },
				function() { exec(100000); },
				function() { exec(1000000); },
				function() { exec(10000000); },
				function() { exec(100000000); },
				function() { exec(1000000000); }
			);
			e.trigger('foo');
			function exec(num) { i += num; if(i === 1111111111) { done(); } }
		});
		it('should accept an array of events and a listener. The listener should be executed when the one of the events bound is triggered', function(done) {
			var i = 0;
			e.on(['foo', 'bar'], exec);
			e.trigger('foo');
			e.trigger('bar');
			function exec() { i += 1; if(i === 2) { done(); } }
		});
		it('should return a `Binding` object.', function(done) {
			newBinding();
			if(typeof b === 'object') { done(); }
			else { done(new Error('failed to return binding object')); }
		});
	});

	describe('.once()', function() {

		beforeEach(newEmitter);

		it('should accept an event and a listener. The listener should be cleared automatically once executed', function(done) {
			var i, ii;
			i = ii = 0;
			e.once('foo', function() { i += 1; });
			e.on('foo', function() { ii += 1; if(ii === 2 && i === 1) { done(); } });
			e.trigger('foo');
			e.trigger('foo');
		});

		it('should accept any number of listeners', function(done) {
			var i = 0;
			e.once('foo',
				function() { exec(1); },
				function() { exec(10); },
				function() { exec(100); },
				function() { exec(1000); },
				function() { exec(10000); },
				function() { exec(100000); },
				function() { exec(1000000); },
				function() { exec(10000000); },
				function() { exec(100000000); },
				function() { exec(1000000000); }
			);
			e.trigger('foo');
			function exec(num) { i += num; if(i === 1111111111) { done(); } }
		});
		it('should accept an array of events and a listener. The listener should be executed then cleared once any event bound is triggered', function(done) {
			var i = 0;
			e.once(['foo', 'bar'], exec);
			e.trigger('foo');
			e.trigger('bar');
			function exec() { i += 1; if(i === 1) { done(); } }
		});
		it('should return a `Binding` object.', function(done) {
			b = e.once('foo', function() {});
			if(typeof b === 'object') { done(); }
			else { done(new Error('failed to return binding object')); }
		});
	});
});

describe('Binding', function() {

	beforeEach(function() {
		newEmitter();
		newBinding();
	});

	it('should have a `clear` method', function(done) {
		if(typeof b.clear === 'function') { done(); }
		else { done(new Error('`clear` method is missing')); }
	});
});

function newEmitter() {
	e = LucidJS.emitter();
}

function newBinding() {
	b = e.on('foo', function() {});
}
