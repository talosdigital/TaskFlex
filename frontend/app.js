var express = require('express');
var app = express();

app.use(express.static('app'));

var port = process.env.TASKFLEX_FRONT_END_PORT || 8000;

var server = app.listen(port, function () {
  console.log('TaskFlex application listening at port %s', port);
});
