var express = require('express');
var path = require('path');
var app = express();

var env =  process.env.NODE_ENV || 'development';

if (env === 'development') {
  app.use(express.static(path.join(__dirname, '.tmp', 'app')));
  app.use(express.static(path.join(__dirname, '.tmp', 'partials')));
  app.use(express.static(path.join(__dirname, 'app')));
}
else {
  app.use(express.static(path.join(__dirname, 'dist')));
}

var port = process.env.TASKFLEX_FRONT_END_PORT || 8000;

var server = app.listen(port, function () {
  console.log('TaskFlex application listening at port %s', port);
});
