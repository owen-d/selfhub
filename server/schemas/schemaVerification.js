var csv = require('csv');
var parser = csv.parse();
var stringifier = csv.stringify();
var transform = csv.transform;
var Readable = require('stream').Readable;
var schemaModel = require('./schemaModel');

var queryBuilder = function(array){
  var obj = {};
  for (var i = 0; i < array.length; i++) {
    if (!obj.hasOwnProperty(array[i].toString())) {
      obj[array[i].toString()] = array[i].toString();
    }
  }

  var result = {};

  for (var prop in obj) {
    result['data.' + prop] = {
      $exists: true
    }
  }

  console.log(result);
  return result;

};

var transformify = function(data, callback) {
  callback(null, data);
};

var handle = function(request, response, buffer) {
  var columns;
  var Readable = require('stream').Readable;
  var rs = new Readable({objectMode: true});
  var transformer;
  var template;

  rs._read = function(){
    var _l = 0;
    var data = buffer;
    rs.push(data);
    if (_l = data.length) {
      rs.push('\n');
      rs.push(null);
    }
  };

  transformer = transform(transformify);

  parser.on('readable', function(){
    while(data = parser.read()){
      if (!columns) {
        columns = queryBuilder(data);
        template = schemaModel.findSchema(request, response, columns);
      }
      // stringifier.write(data);
    }
  });


  rs.pipe(parser).pipe(transformer).pipe(stringifier).pipe(response);
    
};


// process.stdin.setEncoding('utf8');
// process.stdin.on('data', function(data) {
//   parser.write(data);
// });

// parser.on('readable', function(){
//   while(data = parser.read()){
//     if (!columns) {
//       columns = data;
//       console.log(columns);
//     }
//     // stringifier.write(data);
//   }
// });


//BOTH OF THESE WORK with cat <file> | node <thisFile>

// stringifier.on('readable', function(){
//   while(data = stringifier.read()){
//     process.stdout.write(data);
//   }
// });
// stringifier.pipe(process.stdout);


module.exports = {
  handle: handle
};
