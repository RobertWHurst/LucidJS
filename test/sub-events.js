var LucidJS, e;

LucidJS = require('../');

describe('Emitter', function() {

	beforeEach(function() {
		e = LucidJS.emitter();
	});

	it('should emit an event with `.` delimiators as several sub events, each time slicing of the last most `.` deliminated chunk. It should stop when it runs out of chunks', function(done) {
		var test = [false, false, false];

		e.on('foo.bar.baz', function() { exec(0); });
		e.on('foo.bar', function() { exec(1); });
		e.on('foo', function() { exec(2); });
		e.trigger('foo.bar.baz');

		function exec(index) {
			test[index] = true;
			if(test[0] && test[1] && test[2]) { done(); }
		}
	});
});
