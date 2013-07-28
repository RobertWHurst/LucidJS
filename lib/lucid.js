(function() {
  if(typeof define == 'object' && module.amd) {
    define(factory);
  } else if(typeof module == 'object' && module.exports) {
    module.exports = factory();
  } else if(typeof window == 'object') {
    window.LucidJS = factory();
  }
})(function() {
  var api;
  api.EventEmitter = require('./event-emitter');
  return api;
});
