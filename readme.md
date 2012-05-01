LucidJS
=======

Decouple components, make them lucid.
-------------------------------------

LucidJS is a small library that allows you to make your own event emitters with ease.
Its fully featured and works with a plain old script tag, AMD module loaders, and nodeJS.

LucidJS is simple and easy to use. Its also remarkably useful and carries an 'ace' called
`pipe`.

Hello World
-----------

	var emitter = LucidJS.emitter();

	emitter.on('helloWorld', function() {
		alert('Hello World!');
	}

	emitter.trigger('helloWorld');

In this simple example we create an emitter with `LucidJS.emitter` then bind to an event
called `'helloWorld'`. Our event handler fires and alert with the string `'Hello World!'`.

This is uber simple and doesn't show off all of the fexablity of LucidJS. Its just ment to
showcase the simplicity.

Message Passing
---------------

	var emitter = LucidJS.emitter();

	emitter.on('message', function(message) {
		alert(message);
	}

	emitter.trigger('message', 'Hi there, this is a message.');

In this example you can see that `trigger` accepts both the event type and a message. Actually
Trigger will take anything and any number of arguments after the event name and pass them to the
bound handlers.

You can do crazy things like this:

	var emitter = LucidJS.emitter();

	emitter.on('message', function(hander, message, times) {
		hander(message, times);
	}

	emitter.trigger('message', function(message, times) {
		for(var i = 0; i < times; i += 1) {
			alert(message + ' ' + (i + 1) + '.');
		}
	}, 'Hi there, this is message', 100);

	//There that will teach you to copy and paste!

As you can see LucidJS emitters are very flexible and will get right out of your way (unlike alert boxes...).

The Ace
-------

	var emitter = LucidJS.emitter();

	var otherEmitter = LucidJS.emitter();
	var domNode = document.createElement('div');
	var jQueryElement = $('<div></div>');

	emitter.pipe(otherEmitter);
	emitter.pipe(domNode);

	emitter.on('click', function() {
		alert("a 'click' event from 'otherEmitter', 'domNode', 'jQueryElement' can trigger this message.");
	});

	//even jQuery wrapped elements
	emitter.pipe(jQueryElement);

In the Intro I told you LucidJS carried and 'ace' called `pipe`. Above you can see what I mean. You can pipe events in from any other event emitter object supported. Currently `pipe` supports other LucidJS emitters, DOM objects (addEventListener or attachEvent), and even jQuery elements.

Set an event in stone
---------------------

	var emitter = LucidJS.emitter();
	
	emitter.on('ready', function() {
		//will fire
	});
	
	emitter.set('ready');
	
	setTimeout(function() {
		emitter.on('ready', function() {
			//will fire instantly after 2000ms
		});
	}, 2000);
	
In some cases you only want to trigger an event once but you may want anything bound to the event later to be triggered automatically. This is what `emitter.set` does.

Get all of the listeners
------------------------

	var emitter = LucidJS.emitter();
	
	emitter.on('cake', function() { alert('CAKE!!!'); });
	
	var cakeListeners = emitter.listeners('cake');
	// cakeListeners >>> [ function() { alert('CAKE!!!'); } ]
	
	var allListeners = emitter.listeners();
	// allListeners >>> {"cake": [ function() { alert('CAKE!!!'); } ] }
	
If you ever want to get all of the listeners on an event or event the hole emitter you can do so with `emitter.listeners()`. Editing the arrays returned will allow you to directly edit the emitter.

Cleaning up
-----------

	var emitter = LucidJS.emitter();
	var otherEmitter = LucidJS.emitter();

	var pipe = emitter.pipe(otherEmitter);

	emitter.on('pipedEvent', function() {
		alert('I will never be fired');
	});
	var bind = emitter.on('triggeredEvent', function() {
		alert('I also will never be fired');
	});

	pipe.clear();
	bind.clear();

	otherEmitter.trigger('pipedEvent');
	emitter.trigger('triggeredEvent');

All of this is great but eventually you may want to stop listening to an event, or stop piping events from another emitter
This can be done very easily as you can see above.

	//clears everything
	emitter.listeners.clear();
	
	//clears just the listeners on the 'cake' event
	emitter.listeners.clear('cake');

And you can also clear all listener callbacks on a single event	or the hole emitter in one clean swoop as above.

Whats the point?
----------------

	function Dog(name) {
		var emitter = LucidJS.emitter();
		
		return {
			"on": emitter.on,
			"bark": bark,
			"rollOver": rollOver,
			"walk": walk
		}
		
		function bark() {
			var message = 'Woof! Woof!';
			emitter.trigger(message);
			alert(message);
		}
		function rollOver() {
			var message = name + ' rolled over!';
			emitter.trigger('rollOver', message);
			alert(message);
		}
		function walk() {
			var message = name + ' went for a walk';
			emitter.trigger('walk', message);
			alert(message);
		}
	}

This example of a 'Dog' class shows one way to use LucidJS as a event emitter for your own objects. In this case the
returned dog object has a `on` method to allow external code to listen for the dog's 'walk', 'rollOver', and 'bark'
events.