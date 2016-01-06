var gulp           = require('gulp'),
    path           = require('path'),
    conf           = require(path.join(__dirname, 'gulp/conf.js')),
    pipes          = require(path.join(__dirname, 'gulp/pipes.js'));

var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'main-bower-files', 'run-sequence'],
  rename: {
    'gulp-angular-templatecache': 'templateCache'
  }
});

$.wiredep = require('wiredep').stream;
$.Karma   = require('karma').Server;

// === Tasks ===
/*
 * Generates a single .css from .less files located in /assets/less/
 */
gulp.task('less', function () {
  return gulp.src(path.join(conf.paths.app, '/assets/less/styles.less'))
    .pipe($.less())
    .pipe(gulp.dest(path.join(conf.paths.tmp, conf.paths.app, '/assets/css')));
});

/*
 * Injects both vendor and customs scripts and styles into the index.html file.
 * Leaves the output file in the '.tmp' folder.
 */
gulp.task('inject', ['less'], function () {
  return gulp.src(path.join(conf.paths.app, '/index.html'))
    .pipe(pipes.injectCustom())
    .pipe(pipes.injectVendor())
    .pipe(gulp.dest(path.join(conf.paths.tmp, conf.paths.app)));
});

/*
 * Generates AngularJS templateCache for each .html file specified.
 * The output file contains a task that would run in the main module.
 */
gulp.task('partials', function() {
  return gulp.src([
    path.join(conf.paths.app, '**/*.html'),
    path.join('!' + conf.paths.app, '/index.html'),
    path.join('!' + conf.paths.app, '/lib/**/*.html')
  ])
    .pipe($.htmlmin({ collapseWhitespace: true }))
    .pipe($.templateCache({
      module: 'tf-client'
    }))
    .pipe(gulp.dest(path.join(conf.paths.tmp, conf.paths.partials)))
});

/*
 * Injects the generated file by 'partials' task into the index.html
 */
gulp.task('inject:partials', ['inject', 'partials'], function() {
  var partials = gulp.src(path.join(conf.paths.tmp,
                                    conf.paths.partials,
                                    'templates.js'), { read: false });
  var options = {
    starttag: '<!-- inject:partials -->',
    ignorePath: path.join(conf.paths.tmp, conf.paths.partials),
    addRootSlash: false
  };
  return gulp.src(path.join(conf.paths.tmp, conf.paths.app, '/index.html'))
    .pipe($.inject(partials, options))
    .pipe(gulp.dest(path.join(conf.paths.tmp, conf.paths.app)));
});

/*
 * This guy does magic, it takes the the content that is inside the blocks
 * like '<-- build:js -->' and generates a single file including all.
 * So, here we are concatenating, annotating, minifying and versioning all
 * the scripts, styles and index files.
 */
gulp.task('useref', ['inject:partials'], function() {
  return gulp.src(path.join(conf.paths.tmp, conf.paths.app, '/index.html'))
      .pipe($.useref())
      .pipe($.if('*.js', $.ngAnnotate()))
      .pipe($.if('*.js', $.uglify()))
      .pipe($.if('*.css', $.minifyCss({ processImport: false })))
      .pipe($.if('!*.html', $.rev()))
      .pipe($.revReplace())
      .pipe($.if('*.html', $.htmlmin({
        removeAttributeQuotes: true,
        collapseWhitespace: true
      })))
      .pipe(gulp.dest(conf.paths.dist));
});

/*
 * Copies the fonts from bower dependencies into the dist folder.
 * Custom fonts are handled by the 'copy' task
 * NOTE: An override for font-awesome was added in our bower.json file.
 */
gulp.task('fonts', function () {
  return gulp.src($.mainBowerFiles())
    .pipe($.filter('**/*.{eot,svg,ttf,woff,woff2}'))
    .pipe(gulp.dest(path.join(conf.paths.dist, '/fonts')));
});

/*
 * Copies the fonts, images and other files from the source to the dist folder.
 */
gulp.task('copy', function () {
  var fileFilter = $.filter(function (file) {
    return file.stat.isFile();
  });
  return gulp.src([
    path.join(conf.paths.app, '/**/*'),
    path.join('!' + conf.paths.app, '/**/*.{html,css,js,less}'),
    path.join('!' + conf.paths.app, '/lib/**/*')
  ])
    .pipe(fileFilter)
    .pipe(gulp.dest(conf.paths.dist));
});

/*
 * Runs all required tasks to build a dist version of the project.
 */
gulp.task('build', function (callback) {
  $.runSequence('clean', ['useref', 'fonts', 'copy'], function() {
    callback();
  });
});

/*
 * Runs all required tasks to build a development version of the project.
 */
gulp.task('build:dev', function (callback) {
  $.runSequence('clean', 'inject:partials', function() {
    callback();
  });
});

/*
 * Runs the development version of the project.
 */
gulp.task('serve', function (callback) {
  $.runSequence('build:dev', 'open', function () {
    $.env({
      vars: {
        EXPRESS_ENV: 'develop'
      }
    })
    $.express.run(['app.js']);
    gulp.start('watch');
    callback();
  });
});

/*
 * Runs the distribution version of the project.
 */
gulp.task('serve:dist', function(callback) {
  $.runSequence('build', 'open', function() {
    $.env({
      vars: {
        EXPRESS_ENV: 'production'
      }
    })
    $.express.run('app.js');
    callback();
  });
});

/*
 * Builds the source files to be run in development.
 * This function is used by the 'watch' functions. When a change
 * is detected, the watch will call this function, which is
 * going to build the source files and notifies the express to
 * reload the browser page using livereload.
 */
var buildAndReload = function(event) {
  $.runSequence('build:dev', function() {
    $.express.notify(event);
  });
};

/*
 * Watches the source files and executes the builder once there is a change.
 */
gulp.task('watch', function() {
  gulp.watch([path.join(conf.paths.app, 'assets/less/*.less')], buildAndReload);
  gulp.watch([path.join(conf.paths.app, '**/*.js')], buildAndReload);
  gulp.watch([path.join(conf.paths.app, '**/*.html')], buildAndReload);
});

/*
 * Opens a browser tab with the localhost running server.
 */
gulp.task('open', function () {
  var port = process.env.TASKFLEX_FRONT_END_PORT || 8000;
  var options = {
    uri: 'http://localhost:' + port,
  };
  gulp.src(__filename)
    .pipe($.open(options));
});

/*
 * Cleans the temporal and distribution folders.
 */
gulp.task('clean', function() {
  return gulp.src([
    conf.paths.dist,
    conf.paths.tmp
  ], { read: false })
    .pipe($.clean());
});

/*
 * Run unit tests using the Karma configuration.
 */
gulp.task('test', function (done) {
  new $.Karma({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done).start();
});

/*
 * Default task, serve in development mode.
 */
gulp.task('default', ['serve']);
