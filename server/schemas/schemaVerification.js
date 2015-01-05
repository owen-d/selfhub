var csv = require('csv');
var parser = csv.parse();
var stringifier = csv.stringify();
var transform = csv.transform;
var columns = [];
var Readable = require('stream').Readable;

var handle = function(request, response, buffer) {
  columns = [];
  var Readable = require('stream').Readable;

  var rs = new Readable({objectMode: true});

  rs._read = function(){
    var l = 0;
    var data = buffer;
    // var data = JSON.stringify(Object.keys(request.body)[0]);
    rs.push(data);
    if (l = data.length) {
      rs.push('\n');
      rs.push(null);
    }
  };

  var transformify = function(data, callback) {
    if (Array.isArray(data)) {
      data.push("appended!");
    }
    callback(null, data);
  };
  var transformer = transform(transformify);


  rs.pipe(parser).pipe(transformer).pipe(stringifier).pipe(response);
    
};











// process.stdin.setEncoding('utf8');
// process.stdin.on('data', function(data) {
//   parser.write(data);
// });

// parser.on('readable', function(){
//   while(data = parser.read()){
//     if (!columns.length) {
//       columns.push(data);
//     }
//     stringifier.write(data);
//   }
// });


//BOTH OF THESE WORK with cat <file> | node <thisFile>

// stringifier.on('readable', function(){
//   while(data = stringifier.read()){
//     process.stdout.write(data);
//   }
// });
stringifier.pipe(process.stdout);


module.exports = {
  handle: handle
};
