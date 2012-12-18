
#LucidJS

##Decouple components, make them lucid.

LucidJS is an event emitter library  offering several unique features such as set events, emitter piping, DOM node Augmentation, sub events, along with the usual event triggering and binding. LucidJS emitters also feature meta events that allow listening for event binding and event triggering.

It works with AMD loaders, on NodeJS, and with the good old script tag.

###Set Events

LucidJS emitters have a method called `.set()`. Set allows you to bind to an event even after it has happened.

	var emitter = LucidJS.emitter();
	emitter.set('ready');
	console.log('fired ready event');
	setTimeout(function() {
		emitter.on('ready', function() {
			console.log('listener bound and executed after ready event');
		});
	}, 2000);
	
	>>> fired ready event
	>>> listener bound and executed after ready event
	
Set is extremely useful for events that only happen once and indicate state. Its the perfect solution for `load`, `complete` or `ready` events.

###Emitter Piping

Sometimes its nice to have a collection of emitters and a central emitter to aggregate them. This is possible with LucidJS emitters.

	var centralEmitter = LucidJS.emitter();
	var emitterA = LucidJS.emitter();
	var emitterB = LucidJS.emitter();
	var emitterC = LucidJS.emitter();
	
	//pipe the foo event from emitter A
	centralEmitter.pipe('foo', emitterA);
	
	//pipe the bar and baz event from emitter B
	centralEmitter.pipe(['bar', 'baz'], emitterB);
	
	//pipe all events from emitter C
	centralEmitter.pipe(emitterC);
	
###DOM Node Augmentation

In the browser you may listen to the events emitted by DOM nodes using LucidJS's emitter API.

	var button = document.getElementByID('button');
	LucidJS.emitter(button);
	button.on('click', function(event) {
		console.log('the button was clicked');
		event.preventDefault();
	});

As a side note any object or array can be augmented by passing it into `LucidJS.emitter()`, the emitter constructor. DOM node event capture is just an added bonus.

###Sub Events

Ever wish you could have events with sub events? LucidJS makes this possible. Trigger an event called `foo.bar.baz` will trigger `foo.bar.baz`, `foo.bar`, and `foo`.

	var emitter = LucidJS.emitter();
	emitter.on('foo.bar', function() {
		console.log('foo.bar');
	});
	emitter.on('foo', function() {
		console.log('foo');
	});
	emitter.trigger('foo.bar.baz');

	>>> 'foo.bar'
	>>> 'foo'
	
###Simple Events

Along with all the tasty bits above LucidJS emitters are also very good at good old regular event passing.

	var emitter = LucidJS.emitter();
	emitter.on('foo', function(arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
		console.log([arg1, arg2, arg3, arg4, arg5, arg6, arg7].join(' '));
	});
	emitter.trigger('foo', 'any', 'number', 'of', 'arguments', 'can', 'be', 'passed');
	
	>>> 'any number of arguments can be passed'
	
###Meta Events

LucidJS each emitter also emits a set of meta events that let you listen for new listeners on an emitter.

	var emitter = LucidJS.emitter();
	emitter.on('emitter.listener', function(event, listeners) {
		console.log('captured listeners', listeners, 'on event ' + event);
	});
	emitter.on('foo', function() { console.log('bar'); });
	
	>>> 'captured listeners' [
			function() { console.log('bar'); }
		] 'on event foo'

You can event listen to all of the events emitted by an emitter.

	var emitter = LucidJS.emitter();
	emitter.on('emitter.event', function(event) {
		console.log('captured event ' + event);
	});
	emitter.trigger('foo');
	
	>>> 'captured event foo'
	

##Documentation

### LucidJS.emitter()

	
Creates an event emitter and returns it. If an object is passed in the object is augmented with emitter methods. If a DOM node is passed in it will also be augmented, however any DOM events emitted by the node will also be emitted by the emitter.

#### Arguments

	LucidJS.emitter([object object]) => object emitter

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

	LucidJS.emitter([object node]) => object emitter

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
			<td>node</td>
			<td>Optional. Any DOM node you wish to turn into an emitter.</td>
			<td>object</td>
		</tr>
	</tbody>
</table>


### emitter{}

	emitter
		on()
		once()
		trigger()
		set()
		pipe()
			clear()
		listeners()
			clear()

The emitter object is produced `LucidJS.emitter`. Any objects passed into `LucidJS.emitter` will have all of the above methods attached. The emitter object contains the API for interacting with the emitter.


### binding{}

	binding
		clear()

The binding object is returned by `emitter.on`, `emitter.once`, `emitter.set`, and `emitter.pipe`. Executing `binding.clear()` will destroy the event binding or pipe that the binding was returned from.


### emitter.on()
	
Binds any number of listener callbacks to an event or an array of events. Whenever the given event or events are triggered or set on emitter, the listener callbacks will be executed. Any arguments passed to `trigger()` after the event will be passed into the listener callbacks on execution.

If any of the listener callbacks return `false`, the `emitter.trigger` or `emitter.set` that fired the event will return false.
If the event was from a DOM node and `false` is returned both `event.stopPropigation` and `event.preventDefault` will be called.

`emitter.on` returns a `binding` object that can be used to modify the event binding.

#### Arguments

	emitter.on(string event, function listener[, ...]) => object binding

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
			<td>The name of the event that the listener will be bound to.</td>
			<td>string</td>
		</tr>
		<tr>
			<td>listener</td>
			<td>A callback function that will be executed whenever the event given is triggered.</td>
			<td>function</td>
		</tr>
	</tbody>
</table>

	emitter.on(array events, function listener[, ...]) => object binding

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
			<td>events</td>
			<td>An array of event names the listener will be bound to.</td>
			<td>array</td>
		</tr>
		<tr>
			<td>listener</td>
			<td>A callback function that will be executed whenever the event given is triggered.</td>
			<td>function</td>
		</tr>
	</tbody>
</table>


### emitter.once()

Binds a listener to an event. Acts exactly like `emitter.on` with the exception that once the given event is triggered the binding is automatically cleared. Because of this any listeners bound with `emitter.once` will once fire once.

`emitter.once` returns a `binding` object that can be used to modify the event binding.

#### Arguments

	emitter.once(string event, function listener[, …]) => object binding

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
			<td>The name of the event that the listener will be bound to.</td>
			<td>string</td>
		</tr>
		<tr>
			<td>listener</td>
			<td>A callback function that will be executed whenever the event given is triggered.</td>
			<td>function</td>
		</tr>
	</tbody>
</table>

	emitter.once(array events, function listener[, …]) => object binding

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
			<td>events</td>
			<td>An array of event names the listener will be bound to.</td>
			<td>array</td>
		</tr>
		<tr>
			<td>listener</td>
			<td>A callback function that will be executed whenever the event given is triggered.</td>
			<td>function</td>
		</tr>
	</tbody>
</table>


### emitter.trigger()

Triggers an event or an array of events on the emitter. Any listeners bound with `emitter.on` or `emitter.once` will be executed. Any additional arguments passed into `emitter.trigger` excluding the first argument; the event, will be passed to any and all listeners bound to the emitter.

If any listeners triggered explicitly return `false` then `emitter.trigger` will return false as well.

#### Arguments

	emitter.trigger(string event, * arg[, ...]) => bool successful

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
			<td>arg</td>
			<td>Any argument to be passed into listeners of the event.</td>
			<td>*</td>
		</tr>
	</tbody>
</table>

	emitter.trigger(array events, * arg[, ...]) => bool successful

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
			<td>events</td>
			<td>An array of event names that will be triggered.</td>
			<td>array</td>
		</tr>
		<tr>
			<td>arg</td>
			<td>Any argument to be passed into listeners of the event.</td>
			<td>*</td>
		</tr>
	</tbody>
</table>


### emitter.set()

Works like trigger except that any listeners bound to the event or events after `emitter.set` is called will be fired as soon as they are bound. This is great of events that only happen once such as a `load` event. It prevents your listeners from missing an event because it has already fired prior to binding them.

#### Arguments

	emitter.set(string event, * arg[, ...]) => bool successful

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
			<td>arg</td>
			<td>Any argument to be passed into listeners of the event.</td>
			<td>*</td>
		</tr>
	</tbody>
</table>

	emitter.set(array events, * arg[, ...]) => bool successful
	
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
			<td>events</td>
			<td>An array of event names that will be set.</td>
			<td>array</td>
		</tr>
		<tr>
			<td>arg</td>
			<td>Any argument to be passed into listeners of the event.</td>
			<td>*</td>
		</tr>
	</tbody>
</table>


### emitter.pipe()
	
Pipes all events or select events from one or more emitters, into another. Any events emitted by the piped emitters will also be emitted by the emitter pipe was called on. This is extremely powerful and allows you to chain your emitters.

Returns a pipe object that can be used to clear the pipe.

#### Arguments

	emitter.pipe(object emitter[, ...]) => object pipe

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

	emitter.pipe(string event, object emitter[, ...]) => object pipe

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
			<td>The name of the event that will be piped.</td>
			<td>string</td>
		</tr>
		<tr>
			<td>emitter</td>
			<td>The emitter that events will be piped from.</td>
			<td>object</td>
		</tr>
	</tbody>
</table>

	emitter.pipe(array events, object emitter[, ...]) => object pipe

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
			<td>events</td>
			<td>An array of event names that will be piped.</td>
			<td>array</td>
		</tr>
		<tr>
			<td>emitter</td>
			<td>The emitter that events will be piped from.</td>
			<td>object</td>
		</tr>
	</tbody>
</table>


### emitter.pipe.clear()

	emitter.pipe.clear([string event])
	
Allows clearing all pipes, or pipes that transport select events. If an event name is given, only listeners bound to that event will be cleared. If no event name is given all bound listeners will be cleared.

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
			<td>Optional. If any pipes are transporting this event they will be cleared.</td>
			<td>string</td>
		</tr>
	</tbody>
</table>


### emitter.listeners()

	emitter.listeners([string event]) => object eventlisteners
	
Allows access to the emitter's bound event listeners.

If an event name is given, the array of listeners bound to the named event will be returned. If no event name is given then the events will be returned. The events object contains all event arrays.

Directly editing the listeners array is not recommended, however it may be necessary to achieve certain types of functionally in specific cases.

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
			<td>Optional. The name of the event to expose. The listeners bound the the event will be returned.</td>
			<td>string</td>
		</tr>
	</tbody>
</table>


### emitter.listeners.clear()

	emitter.listeners.clear([string event])
	
Clears listeners bound to the emitter. If an event name is given, only listeners bound to that event will be cleared. If no event name is given all bound listeners will be cleared.

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
			<td>Optional. The name of the event to clear listeners from.</td>
			<td>string</td>
		</tr>
	</tbody>
</table>


##A Foot Note

If you like my library feel free to use it however you want. If you wish to contribute to LucidJS please feel free to send me a pull request or make your own fork. Commentary is welcome on any of my projects.

Cheers and happy coding.


