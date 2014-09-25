
// modules
var test = require('tape');

// libs
var lucidJS = require('../');
var EventEmitter = require('../lib/event-emitter');


test('lucidJS.EventEmitter', function(t) {
  t.equal(
    typeof lucidJS.EventEmitter,
    'function',
    'must have EventEmitter constructor attached'
  );
  t.end()
});
