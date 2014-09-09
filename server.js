var express = require('express');
var app = express();
//var cors = require('cors');
var port = Number(process.env.PORT) || 80;

//app.use(cors());
app.use(express.static(__dirname + '/client'));

app.listen(port, function () {
    console.log('CommitStream Web Server listening on port ' + port);
});
