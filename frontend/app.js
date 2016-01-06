var express = require('express'),
    path    = require('path'),
    app     = express(),
    conf    = require(path.join(__dirname, 'gulp/conf.js'));

app.use(require('connect-livereload')());

var env = process.env.EXPRESS_ENV || 'develop';

if (env === 'develop') {
  app.use(express.static(path.join(__dirname, conf.paths.tmp, conf.paths.app)));
  app.use(express.static(path.join(__dirname, conf.paths.tmp, conf.paths.partials)));
  app.use(express.static(path.join(__dirname, conf.paths.app)));
}
else {
  app.use(express.static(path.join(__dirname, conf.paths.dist)));
}

var port = process.env.TASKFLEX_FRONT_END_PORT || 8000;

var server = app.listen(port, function () {
  console.log('TaskFlex application listening at port %s', port);
});
