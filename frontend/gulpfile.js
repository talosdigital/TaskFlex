var gulp           = require('gulp'),
    templateCache  = require('gulp-angular-templatecache');
    clean          = require('gulp-clean'),
    connect        = require('gulp-connect'),
    express        = require('gulp-express'),
    gulpFilter     = require('gulp-filter');
    htmlmin        = require('gulp-htmlmin'),
    gulpIf         = require('gulp-if'),
    inject         = require('gulp-inject'),
    less           = require('gulp-less'),
    minifyCss      = require('gulp-minify-css'),
    ngAnnotate     = require('gulp-ng-annotate'),
    open           = require('gulp-open'),
    rev            = require('gulp-rev'),
    revReplace     = require('gulp-rev-replace'),
    sourcemaps     = require('gulp-sourcemaps'),
    uglify         = require('gulp-uglify'),
    useref         = require('gulp-useref'),
    mainBowerFiles = require('main-bower-files'),
    path           = require('path'),
    wiredep        = require('wiredep').stream;

var config = {
  app: 'app',
  dist: 'dist',
  tmp: '.tmp'
};

// Generates a single .css from .less files located in /assets/less/
gulp.task('less', function () {
  return gulp.src(path.join(config.app, '/assets/less/styles.less'))
    .pipe(less())
    .pipe(gulp.dest(path.join(config.tmp, config.app, '/assets/css')));
});

gulp.task('inject:vendor', ['inject:custom'], function () {
  return gulp.src(path.join(config.tmp, config.app, '/index.html'))
    .pipe(wiredep())
    .pipe(gulp.dest(path.join(config.tmp, config.app)));
});

gulp.task('inject:custom', ['less'], function () {
  var sources = gulp.src([
    path.join('!' + config.app, '/lib/**/*'),
    path.join(config.app, '/**/*.js'),
    path.join(config.tmp, config.app, '/assets/css/**/*.css')
  ], { read: false });
  return gulp.src(path.join(config.app, '/index.html'))
    .pipe(inject(sources, { relative: true }))
    .pipe(gulp.dest(path.join(config.tmp, config.app)));
});

gulp.task('inject', ['inject:vendor']);

gulp.task('partials', function() {
  return gulp.src([
    path.join(config.app, '**/*.html'),
    path.join('!' + config.app, '/index.html'),
    path.join('!' + config.app, '/lib/**/*.html')
  ])
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(templateCache({
      module: 'tf-client'
    }))
    .pipe(gulp.dest(path.join(config.tmp, '/partials')))
});

gulp.task('inject:partials', ['inject', 'partials'], function() {
  var partials = gulp.src(path.join(config.tmp, '/partials/templates.js'), { read: false });
  var options = {
    starttag: '<!-- inject:partials -->',
    ignorePath: path.join(config.tmp, '/partials'),
    addRootSlash: false
  };
  return gulp.src(path.join(config.tmp, config.app, '/index.html'))
    .pipe(inject(partials, options))
    .pipe(gulp.dest(path.join(config.tmp, config.app)));
});

gulp.task('useref', ['inject:partials'], function() {
  var htmlFilter = gulpFilter('*.html', { restore: true });
  var jsFilter = gulpFilter('**/*.js', { restore: true });
  var cssFilter = gulpFilter('**/*.css', { restore: true });
  var assets;
  return gulp.src(path.join(config.tmp, config.app, '/index.html'))
      .pipe(assets = useref())
      .pipe(gulpIf('*.js', ngAnnotate()))
      .pipe(gulpIf('*.js', uglify()))
      .pipe(gulpIf('*.css', minifyCss({ processImport: false })))
      .pipe(gulpIf('!*.html', rev()))
      .pipe(revReplace())
      .pipe(gulpIf('*.html', htmlmin({
        removeAttributeQuotes: true,
        collapseWhitespace: true
      })))
      .pipe(gulp.dest(config.dist));
});

// Only applies for fonts from bower dependencies
// Custom fonts are handled by the "copy" task
// NOTE: An override for font-awesome was added in our bower.json file.
gulp.task('fonts', function () {
  return gulp.src(mainBowerFiles())
    .pipe(gulpFilter('**/*.{eot,svg,ttf,woff,woff2}'))
    .pipe(gulp.dest(path.join(config.dist, '/fonts')));
});

gulp.task('copy', function () {
  var fileFilter = gulpFilter(function (file) {
    return file.stat.isFile();
  });
  return gulp.src([
    path.join(config.app, '/**/*'),
    path.join('!' + config.app, '/**/*.{html,css,js,less}'),
    path.join('!' + config.app, '/lib/**/*')
  ])
    .pipe(fileFilter)
    .pipe(gulp.dest(config.dist));
});

gulp.task('serve', ['useref', 'fonts', 'copy', 'open'], function () {
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
