#! /usr/local/bin/node

var path = require('path');
var fs = require('fs');
var package = require('../package.json');

var compiler = require('browserify')();

compiler.add(path.resolve(__dirname, '../', package.main));
compiler.bundle(function(err, src) {
  if(err) { throw err; }
  var out = path.resolve(__dirname, '../dist/', path.basename(package.main));
  fs.writeFile(out, src, function(err) {
    if(err) { throw err; }
    console.log();
    console.log('Build complete.');
    console.log();
  });
});
