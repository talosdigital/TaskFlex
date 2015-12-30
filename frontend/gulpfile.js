var gulp    = require('gulp'),
    clean   = require('gulp-clean'),
    connect = require('gulp-connect'),
    express = require('gulp-express'),
    inject  = require('gulp-inject'),
    less    = require('gulp-less'),
    open    = require('gulp-open'),
    path    = require('path'),
    wiredep = require('wiredep').stream;

var config = {
  app: 'app',
  dist: 'dist',
  tmp: '.tmp'
};

gulp.task('less', function () {
  return gulp.src(path.join(config.app, '/assets/less/styles.less'))
    .pipe(less())
    .pipe(gulp.dest(path.join(config.app, '/assets/css')));
});

gulp.task('inject-vendor', function () {
  return gulp.src(path.join(config.app, '/index.html'))
    .pipe(wiredep())
    .pipe(gulp.dest(config.app));
});

gulp.task('inject-custom', ['less'], function () {
  var target = gulp.src(path.join(config.app, '/index.html'));
  var sources = gulp.src([
    path.join('!' + config.app, '/lib/**/*'),
    path.join(config.app, '/**/*.js'),
    path.join(config.app, '/assets/css/**/*.css')
  ], { read: false });
  return target.pipe(inject(sources, { relative: true }))
    .pipe(gulp.dest(config.app));
});

gulp.task('inject', ['inject-vendor', 'inject-custom']);


gulp.task('serve', function () {
  express.run('app.js');
});

gulp.task('open', function () {
  var port = process.env.TASKFLEX_FRONT_END_PORT || 8000;
  var options = {
    uri: 'http://localhost:' + port,
  };
  gulp.src(__filename)
    .pipe(open(options));
});

gulp.task('clean', function() {
  return gulp.src([
    config.dist,
    config.tmp
  ], { read: false })
    .pipe(clean());
})

// gulp.task('reload', function () {
//   gulp.src('./app/**/*.*')
//     .pipe(connect.reload());
// });
//
// gulp.task('watch', function () {
//   gulp.watch(['./app/**/*.html'], ['reload']);
//   gulp.watch(['./app/**/*.js'], ['reload']);
//   gulp.watch(['./app/styles/*.css'], ['reload']);
// });

gulp.task('default', ['inject', 'serve', 'open']);
