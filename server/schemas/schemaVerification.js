var csv = require('csv');
var parser = csv.parse();
var stringifier = csv.stringify();
var columns = [];

process.stdin.setEncoding('utf8');
process.stdin.on('data', function(data) {
  parser.write(data);
});

parser.on('readable', function(){
  while(data = parser.read()){
    if (columns.length) {
      
    } else {
      columns.push(data);
      console.log(columns);
    }
  }
});
