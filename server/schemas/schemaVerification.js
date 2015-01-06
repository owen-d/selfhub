var csv = require('csv');
var parser = csv.parse();
var Readable = require('stream').Readable;
var schemaModel = require('./schemaModel');
var Duplex = require('stream').Duplex;
var helpers = require('../config/helpers');
var stringifier = csv.stringify();
var transform = csv.transform;

var queryBuilder = function(array){
  var obj = {};
  for (var i = 0; i < array.length; i++) {
    if (!obj.hasOwnProperty(array[i].toString()) && array[i].length) {
      obj[array[i].toString()] = array[i].toString();
    }
  }
  var result = {};
  for (var prop in obj) {
    result['data.' + prop] = {
      $exists: true
    }
  }
  return result;
};

var handle = function(request, response, buffer) {
  var columns;
  var rs = new Readable({objectMode: true});
  var transformer;
  var storage = {};

  rs._read = function(){
    var _l = 0;
    var data = buffer;
    rs.push(data);
    if (_l = data.length) {
      rs.push('\n');
      rs.push(null);
    }
  };

  transformer = transform(function(data, variable){
    return data;
  });

  parser.on('readable', function(){
      if (!columns) {
        columns = queryBuilder(parser.read());
        schemaModel.findSchema(columns, this, storage);
      }
  });

  parser.once('templated', function(){
    console.log('templated hit, ', storage.template);
    this.pipe(transformer);
  });

  parser.on('noTemplate', function(){
    var error = {message: "Failed to find a matching template"};
    this.end();
    console.log(error.message);
    helpers.errorHandler(error, request, response);
  });


  rs.pipe(parser);
    
};

module.exports = {
  handle: handle
};
