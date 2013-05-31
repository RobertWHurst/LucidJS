var LucidJS;

LucidJS = require('../');

describe('Emitter', function() {
	describe('.pipe()', function() {
		it('should pipe an event from emitter a to emitter b', function(done) {
			var a, b;
			a = LucidJS.emitter();
			b = LucidJS.emitter();
			a.on('foo', done);
			a.pipe('foo', b);
			b.trigger('foo');
		});
		it('should return a `Pipe` object', function(done) {
			var a, b, pipe, i = 0;
			a = LucidJS.emitter();
			b = LucidJS.emitter();
			pipe = a.pipe('foo', b);
			if(typeof pipe === 'object') { i += 1; }
			pipe = a.pipe(['bar', 'baz'], b);
			if(typeof pipe === 'object') { i += 1; }
			if(i === 2) { done(); }
		});
		it('should pipe an array of events from emitter a to emitter b', function(done) {
			var a, b, i = 0;
			a = LucidJS.emitter();
			b = LucidJS.emitter();
			a.on('foo', exec);
			a.pipe(['foo', 'bar'], b);
			b.trigger('foo');
			a.on('bar', exec);
			b.trigger('bar');
			a.on('bar', exec);
			b.on('bar', exec);
			function exec() { i += 1; if(i === 2) { done(); } }
		});
		it('should pipe all events from emitter a to emitter b when no specific events are given', function(done) {
			var a, b, i = 0;
			a = LucidJS.emitter();
			b = LucidJS.emitter();
			a.on('foo', exec);
			a.pipe(b);
			b.trigger('foo');
			a.on('bar', exec);
			b.trigger('bar');
			function exec() { i += 1; if(i === 2) { done(); } }
		});
		it('should pipe a set event from emitter a to emitter b', function(done) {
			var a, b;
			a = LucidJS.emitter();
			b = LucidJS.emitter();
			b.set('foo');
			a.pipe('foo', b);
			a.on('foo', done);
		});
		it('should pipe an array of set events from emitter a to emitter b.', function(done) {
			var a, b, i = 0;
			a = LucidJS.emitter();
			b = LucidJS.emitter();
			b.debug = 'b';
			a.debug = 'b';
			b.set('foo');
			a.on('foo', exec);
			a.pipe(['foo', 'bar'], b);
			b.set('bar');
			a.on('bar', exec);
			function exec() { i += 1; if(i === 2) { done(); } }
		});
		it('should pipe all set events from emitter a to emitter b when no specific events are given', function(done) {
			var a, b, i = 0;
			a = LucidJS.emitter();
			b = LucidJS.emitter();
			a.NAME = 'a';
			b.NAME = 'b';
			b.set('foo');
			a.on('foo', exec);
			a.pipe(b);
			b.set('bar');
			a.on('bar', exec);
			function exec() { i += 1; if(i === 2) { done(); } }
		});
		it('should trigger the subevents only once per emitter', function(done){
    	var a = LucidJS.emitter()
    		, b = LucidJS.emitter()
    		, aCount = 0
    		, bCount = 0

			 a.on('emitter.event', function(name){
			    aCount += 1;
			 })

			 b.on('emitter.event', function(name){
			    bCount += 1
			 })

			 a.pipe(b)
			 b.trigger('foo.bar.baz')
			 setTimeout(function(){
			 	if(aCount == 3 && bCount == 3){
			 		done()
			 	} else {
			 		done(new Error('failed to trigger subevents correctly on parent emitter'))
			 	}
			 }, 0)
		})
	});
});

describe('Pipe', function() {
	describe('.clear()', function() {

	});
});
