#LucidJS

##Decouple components, make them lucid.

LucidJS is a small library that allows you to make your own event emitters with ease.
Its fully featured and works with a plain old script tag, AMD module loaders, and nodeJS.

LucidJS is simple and easy to use. Its also remarkably useful and carries an 'ace' called
`pipe`.


##Hello World

	var emitter = LucidJS.emitter();

	emitter.on('helloWorld', function() {
		alert('Hello World!');
	}

	emitter.trigger('helloWorld');

In this simple example we create an emitter with `LucidJS.emitter` then bind to an event
called `'helloWorld'`. Our event handler fires and alert with the string `'Hello World!'`.

This is uber simple and doesn't show off all of the fexablity of LucidJS. Its just ment to
showcase the simplicity.


##Message Passing

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


##The Ace

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


##Set an event in stone

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


##Get all of the listeners

	var emitter = LucidJS.emitter();
	
	emitter.on('cake', function() { alert('CAKE!!!'); });
	
	var cakeListeners = emitter.listeners('cake');
	// cakeListeners >>> [ function() { alert('CAKE!!!'); } ]
	
	var allListeners = emitter.listeners();
	// allListeners >>> {"cake": [ function() { alert('CAKE!!!'); } ] }
	
If you ever want to get all of the listeners on an event or event the hole emitter you can do so with `emitter.listeners()`. Editing the arrays returned will allow you to directly edit the emitter.


##Cleaning up

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

And you can also clear all listener callbacks on a single event or the hole emitter in one clean swoop as above.


##Whats the point?

	function Dog(name) {
		var dog;
		
		//create the dog api
		 dog = {
			"bark": bark,
			"rollOver": rollOver,
			"walk": walk
		};
		
		//attach the emitter
		LucidJS.emitter(dog);
		
		return dog;
		
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
returned dog object contains the api for the dog instance. Its then passed to `LucidJS.emitter()` and turned into an emitter  allowing external code to listen for the dog's 'walk', 'rollOver', and 'bark' events.


##Method documentation


### LucidJS.emitter()

	LucidJS.emitter([object object]) => object emitter
	
Creates an event emitter and returns it. If an object is passed in the object is augmented with emitter methods.

#### Arguments

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Description</th>
			<th>Allowed Types</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>object</td>
			<td>Optional. Any object or array you wish to turn into an emitter.</td>
			<td>object</td>
		</tr>
	</tbody>
</table>


### emitter{}

	emitter => {
		"on": on()
		"once": once()
		"trigger": trigger()
		"set": set()
		"pipe": pipe()
		"listeners": listeners() => {
			"clear": clear()
		}
	}

The emitter object is produced `LucidJS.emitter`. Any objects passed into `LucidJS.emitter` will have all of the above methods attached. The emitter object contains the API for interacting with the emitter.


### emitter.on()

	emitter.on(string event, function handler) => object binding
	
Binds a handler to an event. Whenever the given event is triggered or set on emitter, the handler will be executed. Any additional arguments passed to `trigger()` will be passed into the handler on execution.

If the handler returns `false`, it will cause the source of the event; `emitter.trigger` or `emitter.set` to return false.

`emitter.on` returns a `binding` object that can be used to modify the event binding.

#### Arguments

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Description</th>
			<th>Allowed Types</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>event</td>
			<td>The name of the event that the handler will be bound to.</td>
			<td>string</td>
		</tr>
		<tr>
			<td>handler</td>
			<td>The function that will be executed whenever the event given is triggered.</td>
			<td>function</td>
		</tr>
	</tbody>
</table>


### emitter.once()

	emitter.once(string event, function handler) => object binding

Binds a handler to an event. Acts exactly like `emitter.on` with the execption that once the given event is triggered the binding is automatically cleared. Because of this any handlers bound with `emitter.once` will once fire once.

If the handler returns `false`, it will cause the source of the event; `emitter.trigger` or `emitter.set` to return false.

`emitter.once` returns a `binding` object that can be used to modify the event binding.

#### Arguments

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Description</th>
			<th>Allowed Types</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>event</td>
			<td>The name of the event that the handler will be bound to.</td>
			<td>string</td>
		</tr>
		<tr>
			<td>handler</td>
			<td>The function that will be executed whenever the event given is triggered.</td>
			<td>function</td>
		</tr>
	</tbody>
</table>


### emitter.trigger()

	emitter.trigger(string event, * args...) => bool successful

Triggers an event on the emitter. Any handlers bound with `emitter.on` or `emitter.once` will be executed. Any additional arguments passed into `emitter.trigger` excluding the first argument; the event, will be passed to any and all handlers bound to the emitter.

If any of the handlers returned `false	` then `emitter.trigger` will return false. Otherwise it will return true.

#### Arguments

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Description</th>
			<th>Allowed Types</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>event</td>
			<td>The name of the event that will be triggered.</td>
			<td>string</td>
		</tr>
		<tr>
			<td>...args</td>
			<td>Any additional arguments that will be passed to the handers of the event.</td>
			<td>*</td>
		</tr>
	</tbody>
</table>


### emitter.set()

	emitter.set(string event, * args...) => bool successful

Triggers an event on the emitter. Useful for flagging, `emitter.set` acts like `emitter.trigger` but instead of just executing bound handlers, it executes both bound handlers and all future handlers. Adittionally, all handlers bound to a set event are cleared after they are executed to prevent them from executing again.

If any of the handlers returned `false	` then `emitter.set` will return false. Otherwise it will return true.

#### Arguments

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Description</th>
			<th>Allowed Types</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>event</td>
			<td>The name of the event that will be set.</td>
			<td>string</td>
		</tr>
		<tr>
			<td>...args</td>
			<td>Any additional arguments that will be passed to the handers of the event.</td>
			<td>*</td>
		</tr>
	</tbody>
</table>


### emitter.pipe()

	emitter.pipe(object emitter) => object pipe
	
Pipes all events from a source emitter into the emitter. Any events triggered or set on the source emitter will be triggered or set on the piping emitter aswell.

Returns a pipe object that can be used to modify the pipe.

#### Arguments

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Description</th>
			<th>Allowed Types</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>emitter</td>
			<td>The emitter that events will be piped from.</td>
			<td>object</td>
		</tr>
	</tbody>
</table>


### emitter.listeners()

	emitter.listeners([string event]) => object eventHandlers
	
Allows access to the emitter's bound event handlers.

If an event name is given, the array of handlers bound to the named event will be returned. If no event name is given then the events will be returned. The events object contains all event arrays.

Directly editting the handlers array is not recommended, however it may be nessisary to achieve curtain types of functionally in specific cases.

#### Arguments

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Description</th>
			<th>Allowed Types</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>event</td>
			<td>Optional. The name of the event to expose. The handlers bound the the event will be returned.</td>
			<td>string</td>
		</tr>
	</tbody>
</table>


### emitter.listeners.clear()

	emitter.listeners.clear([string event])
	
Clears handlers bound to the emitter. If an event name is given, only handlers bound to that event will be cleared. If no event name is given all bound handlers will be cleared.

#### Arguments

<table>
	<thead>
		<tr>
			<th>Name</th>
			<th>Description</th>
			<th>Allowed Types</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>event</td>
			<td>Optional. The name of the event to clear handlers from.</td>
			<td>string</td>
		</tr>
	</tbody>
</table>


##A Foot Note
If you like my library feel free to use it however you want. If you wish to contribute to LucidJS please feel free to send me a pull request or make your own fork. Commentary is welcome on any of my projects.

Cheers and happy coding.

