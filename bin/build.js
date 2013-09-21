#! /usr/local/bin/node

// modules
var path = require('path');
var fs = require('fs');

// libs
var package = require('../package.json');

// create a browserify compiler.
var compiler = require('browserify')();

// add lucidJS's main file.
compiler.add(path.resolve(__dirname, '../', package.main));

// compile the bundle as a stand alone package
// using the name 'LucidJS'.
compiler.bundle({
  standalone: 'LucidJS'
}, function(err, src) {
  if(err) { throw err; }

  // calculate the output path
  var out = path.resolve(__dirname, '../dist/', path.basename(package.main));
  
  // write the compiled source to the output
  // path.
  fs.writeFile(out, src, function(err) {
    if(err) { throw err; }
    console.log();
    console.log('Build complete.');
    console.log();
  });
});
