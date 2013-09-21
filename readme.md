# LucidJS

[![Build Status](https://travis-ci.org/RobertWHurst/LucidJS.png?branch=master)](https://travis-ci.org/RobertWHurst/LucidJS)
[![NPM version](https://badge.fury.io/js/lucidjs.png)](http://badge.fury.io/js/lucidjs)

[![Endorse](http://api.coderwall.com/robertwhurst/endorsecount.png)](http://coderwall.com/robertwhurst)
[![Flattr This](http://api.flattr.com/button/flattr-badge-large.png)](http://flattr.com/thing/1270541/RobertWHurstLucidJS-on-GitHub)


## Navigation


### Class: LucidJS.EventEmitter

    var eventEmitter = new LucidJS.EventEmitter();

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

    eventEmitter.bind(String event, Function listener([arg[, arg[, ...]])) => EventEmitter eventEmitter
    eventEmitter.bind(Array events, Function listener([arg[, arg[, ...]])) => EventEmitter eventEmitter
    eventEmitter.bind(String event, Array listeners) => EventEmitter eventEmitter
    eventEmitter.bind(Array events, Array listeners) => EventEmitter eventEmitter

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

    eventEmitter.weakBind(String event, Function listener([arg[, arg[, ...]])) => EventEmitter eventEmitter
    eventEmitter.weakBind(Array events, Function listener([arg[, arg[, ...]])) => EventEmitter eventEmitter
    eventEmitter.weakBind(String event, Array listeners) => EventEmitter eventEmitter
    eventEmitter.weakBind(Array events, Array listeners) => EventEmitter eventEmitter

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

    eventEmitter.unbind(String event, Function listener([arg[, arg[, ...]])) => EventEmitter eventEmitter
    eventEmitter.unbind(Array events, Function listener([arg[, arg[, ...]])) => EventEmitter eventEmitter
    eventEmitter.unbind(String event, Array listeners) => EventEmitter eventEmitter
    eventEmitter.unbind(Array events, Array listeners) => EventEmitter eventEmitter

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

    eventEmitter.emit(String event, [* arg[, * arg[, ...]]]) => EventEmitter eventEmitter
    eventEmitter.emit(Array events, [* arg[, * arg[, ...]]]) => EventEmitter eventEmitter

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

eventEmitter.flag(String event, [* arg[, * arg[, ...]]]) => EventEmitter eventEmitter
eventEmitter.flag(Array events, [* arg[, * arg[, ...]]]) => EventEmitter eventEmitter


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

