
//event triggering pollyfill
function trigger(eventName, element) {var a;if(document.createEvent){a=document.createEvent("HTMLEvents");a.initEvent(eventName,true,true);}else{a=document.createEventObject();a.eventType=eventName;}if(document.createEvent){element.dispatchEvent(a);}else{element.fireEvent(a.eventType,a);}}

module('LucidJS');

test('API', function() {
	var emitter;

	equal(typeof LucidJS, 'object', 'LucidJS should be an object.');
	equal(typeof LucidJS.emitter, 'function', 'LucidJS.on should be a function.');

	emitter = LucidJS.emitter();

	equal(typeof emitter.on, 'function', 'emitter.on should be a function.');
	equal(typeof emitter.trigger, 'function', 'emitter.trigger should be a function.');
	equal(typeof emitter.pipe, 'function', 'emitter.pipe should be a function.');

});

test('emitter.on() and emitter.trigger()', function() {
	var emitter, test1, test2;

	emitter = LucidJS.emitter();

	raises(function() {
		emitter.on();
	}, 'Executing on with no arguments should throw an error.');

	raises(function() {
		emitter.trigger();
	}, 'Executing trigger with no arguments should throw an error.');

	emitter.on('testEvent1', function() {
		test1 = true;
	});

	emitter.trigger('testEvent1');

	ok(test1 === true, 'on method should catch triggered events.');

	emitter.on('testEvent2', function() {
		test2 = true;
	}).clear();

	ok(test2 !== true, 'Calling the clear method returned by on should unbind the callback.');

});

test('emitter.pipe()', function() {
	var emitter1, emitter2, emitter3, DOMnode, test1, test2, test3;


	DOMnode = document.createElement('div');

	raises(function() {
		emitter1.pipe();
	}, 'Executing pipe with no arguments should throw an error.');


	emitter1 = LucidJS.emitter();
	emitter2 = LucidJS.emitter();
	emitter1.pipe(emitter2);
	emitter1.on('testEvent1', function() {
		test1 = true;
	});
	emitter2.trigger('testEvent1');

	ok(test1 === true, 'Events triggered on emitter2 should be piped to emtter1.');


	emitter1.on('testEvent2', function() {
		test2 = true;
	});
	emitter1.pipe(DOMnode);
	trigger('testEvent2', DOMnode);

	ok(test2 === true, 'Events triggered on the DOM node should be piped to emtter1.');


	emitter3 = LucidJS.emitter();
	emitter1.on('testEvent3', function() {
		test3 = true;
	});
	emitter1.pipe(emitter3).clear();
	emitter3.trigger('testEvent3');

	ok(test3 !== true, 'Calling the clear method returned by pipe should unbind the event pipe.');

});