
//event triggering pollyfill
function trigger(eventName, element) {var a;if(document.createEvent){a=document.createEvent("HTMLEvents");a.initEvent(eventName,true,true);}else{a=document.createEventObject();a.eventType=eventName;}if(document.createEvent){element.dispatchEvent(a);}else{element.fireEvent(a.eventType,a);}}

test('emitter', function() {
	var emitter, element = document.createElement('div'), clicked = false;

	equal(typeof LucidJS.emitter, 'function', 'LucidJS.emitter should be a function.');

	emitter = LucidJS.emitter();
	equal(typeof emitter, 'object', 'LucidJS.emitter() should return an emitter object.');

	emitter = LucidJS.emitter({"a": 1});
	ok(emitter.a === 1, 'Passing an object into LucidJS.emitter(object) should return the same object augmented with the emitter methods.');

	emitter = LucidJS.emitter(element);
	emitter.on('mouseup', function(event) {
		clicked = true;
	});
	trigger('mouseup', element);
	ok(clicked, 'If emitter augments a node it should emit all the nodes DOM events.');
});

test('emitter.on', function() {
	var emitter = LucidJS.emitter(), fired = false, args = [];

	equal(typeof emitter.on, 'function', 'emitter.on should be a function.');

	emitter.on('exec', function() { fired = true; }, function(    ){ args = Array.prototype.slice.apply(arguments) });
	emitter.trigger('exec', 1, 2, 3);

	ok(fired, 'emitter.on should fire its callback(s) when the event bound is fired.');
	ok(args[0] === 1 && args[1] === 2 && args[2] === 3, 'Any arguments passed into trigger should be passed into the callback(s).');
});

test('emitter.once', function() {
	var emitter = LucidJS.emitter(), fired;

	equal(typeof emitter.once, 'function', 'emitter.once should be a function.');

	emitter.once('exec', function() { fired = true; });
	emitter.trigger('exec');
	if(fired) { fired = 2; }
	emitter.trigger('exec');

	ok(fired === 2, 'emitter.once should only fire once. It should delete itself after fired.');
});

test('emitter.trigger', function() {
	var emitter = LucidJS.emitter(), results = [];

	equal(typeof emitter.trigger, 'function', 'emitter.trigger should be a function.');

	emitter.on('red', function(red) {
		results.push(red);
	});
	emitter.on('blue', function(red, blue) {
		results.push(blue);
	});
	emitter.on('green', function(red, blue, green) {
		results.push(green);
	});
	emitter.on('green', function() {
		results.pop();
	}).clear();

	emitter.trigger(['red', 'blue', 'green'], 'red', 'blue', 'green');

	equal(results.toString(), ['red', 'blue', 'green'].toString(), "When multiple events are triggered, they should be fired in the correct order.");
});

test('emitter.set', function() {
	var emitter = LucidJS.emitter(), result = '';

	equal(typeof emitter.set, 'function', 'emitter.set should be a function.');
	equal(typeof emitter.set.clear, 'function', 'emitter.set.clear should be a function.');

	emitter.on('event', function() { result += 'Black'; });
	emitter.set('event');
	emitter.on('event', function() { result += 'White'; });

	equal(result, 'BlackWhite', "When multiple events are triggered, they should be fired in the correct order.");

});

test('emitter.pipe', function() {
	var emitterA = LucidJS.emitter(), emitterB = LucidJS.emitter(), emitterC = LucidJS.emitter(), results = [];

	equal(typeof emitterA.pipe, 'function', 'emitter.pipe should be a function.');
	equal(typeof emitterA.pipe.clear, 'function', 'emitter.pipe.clear should be a function.');

	emitterA.pipe(emitterB);
	emitterA.pipe('event', emitterC);

	emitterA.on('one', function() {
		results.push('one');
	});
	emitterA.on('two', function() {
		results.push('two');
	});
	emitterA.on('three', function() {
		results.push('three');
	});
	emitterA.on('event', function() {
		results.push('event');
	});

	emitterB.trigger(['one', 'two', 'three']);
	emitterC.trigger(['event', 'one', 'two', 'three']);

	equal(results.toString(), ['one', 'two', 'three', 'event'].toString(), "Pipe should echo the events emitted by any emitters passed into it.");
});

test('emitter.listeners', function() {
	var emitter = LucidJS.emitter();

	equal(typeof emitter.listeners, 'function', 'emitter.listeners should be a function.');
	equal(typeof emitter.listeners.clear, 'function', 'emitter.listeners.clear should be a function.');
});
