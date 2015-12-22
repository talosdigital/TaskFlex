var gulp      = require('gulp'),
    connect   = require('gulp-connect'),
    less      = require('gulp-less'),
    Server    = require('karma').Server;
    minifyCss = require('gulp-minify-css');

gulp.task('test', function (done) {
  new Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done).start();
});

gulp.task('less', function () {
  return gulp.src('./app/assets/less/styles.less')
    .pipe(less())
    .pipe(gulp.dest('./app/assets/css'));
});

gulp.task('min', function() {
  return gulp.src('./app/assets/css/styles.css')
    .pipe(minifyCss({ compatibility: 'ie8' }))
    .pipe(gulp.dest('dist'));
});

gulp.task('connect', function() {
  var port = process.env.TASKFLEX_FRONT_END_PORT || 8000;
  connect.server({
    root: 'app',
    port: port
  });
});

gulp.task('default', ['less', 'connect']);
