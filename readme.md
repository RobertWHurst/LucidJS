# LucidJS

[![Build Status](https://travis-ci.org/RobertWHurst/LucidJS.png?branch=master)](https://travis-ci.org/RobertWHurst/LucidJS)
[![NPM version](https://badge.fury.io/js/lucidjs.png)](http://badge.fury.io/js/lucidjs)

[![Endorse](http://api.coderwall.com/robertwhurst/endorsecount.png)](http://coderwall.com/robertwhurst)
[![Flattr This](http://api.flattr.com/button/flattr-badge-large.png)](http://flattr.com/thing/1270541/RobertWHurstLucidJS-on-GitHub)

__NOTE:__ This is release marks a very large
change to LucidJS, becoming fully prototypal,
aswell as matching node's EventEmitter api. Don't
worry, all of the functionallity of the 2.x.x
releases can be found in this release aswell. The
benifits of this release is that the emitter can
now be inherited from, and you can use it in
projects that currently use node's emitter by
simply changing your require statement.


##Decouple components, make them lucid.

LucidJS is an event emitter library offering
several unique features such as set events,
emitter piping, sub events, along with the 
usual event triggering and binding. LucidJS 
emitters also feature meta events that  allow 
listening for event binding and event  triggering.

It works with AMD loaders, on NodeJS, and with
the good old script tag.


###Set Events

LucidJS emitters have a method called `.set()`.
Set allows you to bind to an event even after it
has happened.
```javascript
var emitter = new lucidjs.EventEmitter();
emitter.flag('ready');
console.log('fired ready event');
setTimeout(function() {
	emitter.bind('ready', function() {
		console.log('listener bound and executed after ready event');
	});
}, 2000);

>>> fired ready event
>>> listener bound and executed after ready event
```
Set is extremely useful for events that only happen
once and indicate state. Its the perfect solution
for `load`, `complete` or `ready` events.


###Emitter Piping

Sometimes its nice to have a collection of emitters
and a central emitter to aggregate them. This is
possible with LucidJS emitters.
```javascript
var centralEmitter = new lucidjs.EventEmitter();
var emitterA = new lucidjs.EventEmitter();
var emitterB = new lucidjs.EventEmitter();
var emitterC = new lucidjs.EventEmitter();

//pipe the foo event from emitter A
emitterA.pipe('foo', centralEmitter);

//pipe the bar and baz event from emitter B
emitterB.pipe(['bar', 'baz'], centralEmitter);

//pipe all events from emitter C
emitterC.pipe(centralEmitter);
```


###Sub Events

Ever wish you could have events with sub events? 
LucidJS makes this possible. Trigger an event called
`foo.bar.baz` will trigger `foo.bar.baz`, `foo.bar`,
and `foo`.
```javascript
var emitter = new lucidjs.EventEmitter();
emitter.bind('foo.bar', function() {
	console.log('foo.bar');
});
emitter.bind('foo', function() {
	console.log('foo');
});
emitter.emit('foo.bar.baz');

>>> 'foo.bar'
>>> 'foo'
```


###Simple Events

Along with all the tasty bits above LucidJS
emitters are also very good at good old regular
event passing.
```javascript
var emitter = new lucidjs.EventEmitter();
emitter.bind('foo', function(arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
	console.log([arg1, arg2, arg3, arg4, arg5, arg6, arg7].join(' '));
});
emitter.emit('foo', 'any', 'number', 'of', 'arguments', 'can', 'be', 'passed');

>>> 'any number of arguments can be passed'
```


###Meta Events

LucidJS each emitter also emits a set of meta
events that let you listen for new listeners on
an emitter.
```javascript
var emitter = new lucidjs.EventEmitter();
emitter.bind('emitter.listener', function(listener) {
	console.log('captured listener', listener, 'on event ' + this.event);
});
emitter.bind('foo', function() { console.log('bar'); });

>>> 'captured listeners' function() { console.log('bar'); } 'on event foo'
```

You can event listen to all of the events emitted 
by an emitter.
```javascript
var emitter = new lucidjs.EventEmitter();
emitter.on('emitter.event', function(event) {
	console.log('captured event ' + event);
});
emitter.emit('foo');

>>> 'captured event foo'
```


### Class: LucidJS.EventEmitter

```
var eventEmitter = new LucidJS.EventEmitter();
```
EventEmitter is a drop in replacement for node's
event emitter. An event emitter can be created by
simply using the `new` keyword.


### eventEmitter.bind(event, listener)

To bind to an event you can use `bind()`, or its
aliases `addListener()` and `addListener()`.
It accepts two arguments; An event, or array
of events, and a callback, or an array of
callbacks. Listeners are always triggered in the
order they are registered. The eventEmitter is
returned.

#### Aliases

- eventEmitter.addListener
- eventEmitter.on

#### Arguments

```
eventEmitter.bind(String event, Function listener([arg[, arg[, ...]])) => EventEmitter eventEmitter
eventEmitter.bind(Array events, Function listener([arg[, arg[, ...]])) => EventEmitter eventEmitter
eventEmitter.bind(String event, Array listeners) => EventEmitter eventEmitter
eventEmitter.bind(Array events, Array listeners) => EventEmitter eventEmitter
```

Argument Name | Allowed Types | Description
--- | --- | ---
event | String | An event name to bind too.
listener | String | A function to call when the event(s) are dispatched.
events | Array | An array of event names to bind to.
listeners | Array | An array of functions to call when the event(s) are dispatched.


### eventEmitter.weakBind(event, listener)

Similar to `bind()`, `weekBind()` binds a listener
to an event, however, `weekBind()` automatically
unbinds its listener after its event is fired just
once. Listeners are always triggered in the order
they are registered. The eventEmitter is returned.

#### Aliases

- eventEmitter.once

#### Arguments

```
eventEmitter.weakBind(String event, Function listener([arg[, arg[, ...]])) => EventEmitter eventEmitter
eventEmitter.weakBind(Array events, Function listener([arg[, arg[, ...]])) => EventEmitter eventEmitter
eventEmitter.weakBind(String event, Array listeners) => EventEmitter eventEmitter
eventEmitter.weakBind(Array events, Array listeners) => EventEmitter eventEmitter
```

Argument Name | Allowed Types | Description
--- | --- | ---
event | String | An event name to bind too.
listener | String | A function to call when the event(s) are dispatched.
events | Array | An array of event names to listen for.
listeners | Array | An array of functions to call when the event(s) are dispatched.


### eventEmitter.unbind(event, listener)

Unbinds a listener, or an array of listeners from
an event, or events. Once a listener is unbound
from an event, it will no longer fire when the
event is dispatched. The eventEmitter is
returned.

#### Aliases

- eventEmitter.removeListener
- eventEmitter.off

#### Arguments

```
eventEmitter.unbind(String event, Function listener([arg[, arg[, ...]])) => EventEmitter eventEmitter
eventEmitter.unbind(Array events, Function listener([arg[, arg[, ...]])) => EventEmitter eventEmitter
eventEmitter.unbind(String event, Array listeners) => EventEmitter eventEmitter
eventEmitter.unbind(Array events, Array listeners) => EventEmitter eventEmitter
```

Argument Name | Allowed Types | Description
--- | --- | ---
event | String | An event the listener is bound to.
listener | String | A listener to unbind from the event.
events | Array | An array of events the listener is bound to.
listeners | Array | An array of functions to unbind from the event.


### eventEmitter.emit(event, [arg[, arg[, ...]]])

Dispatching events is done with `emit()`, or its
alias `trigger()`. Any listeners bound to the
event passed will be triggered immediately. Any
additional arguments are passed to the listeners.
Listeners are always triggered in the order they
are registered. The eventEmitter is returned.

#### Aliases

- eventEmitter.trigger

#### Arguments

```
eventEmitter.emit(String event, [* arg[, * arg[, ...]]]) => EventEmitter eventEmitter
eventEmitter.emit(Array events, [* arg[, * arg[, ...]]]) => EventEmitter eventEmitter
```

Argument Name | Allowed Types | Description
--- | --- | ---
event | String | An event to trigger.
events | Array | An array of events to trigger.
arg | * | Any argument to be passed to all bound event listeners.


### eventEmitter.flag(event, [arg[, arg[, ...]]])

Flags an event on an emitter. A setting a flag
will immediately trigger any event listeners bound
prior to calling `flag`. Any listeners bound after
the flag is set will be triggered immediately
after they are bound. Any additional arguments are
passed to the listeners. The eventEmitter is
returned.

#### Arguments

```
eventEmitter.flag(String event, [* arg[, * arg[, ...]]]) => EventEmitter eventEmitter
eventEmitter.flag(Array events, [* arg[, * arg[, ...]]]) => EventEmitter eventEmitter
```

Argument Name | Allowed Types | Description
--- | --- | ---
event | String | An event the flag is bound to.
events | Array | An array of events the flag is bound to.
arg | * | Any argument to be passed to bound or future listeners.


### eventEmitter.unflag(event)

#### Arguments

Argument Name | Allowed Types | Description
--- | --- | ---


### eventEmitter.pipe([event], eventEmitter)

#### Arguments

Argument Name | Allowed Types | Description
--- | --- | ---


### eventEmitter.unpipe([event], eventEmitter)

#### Arguments

Argument Name | Allowed Types | Description
--- | --- | ---


### eventEmitter.listeners([event])

#### Arguments

Argument Name | Allowed Types | Description
--- | --- | ---


### eventEmitter.unbindAll([event])

#### Aliases

- eventEmitter.removeAllListeners

#### Arguments

Argument Name | Allowed Types | Description
--- | --- | ---



## A Foot Note

If you like my library feel free to use it however you want. If you wish to contribute to LucidJS please feel free to send me a pull request or make your own fork. Commentary is welcome on any of my projects.

Cheers and happy coding.

