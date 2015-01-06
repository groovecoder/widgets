var gulp = require('gulp');
var gutil = require('gulp-util');
var coffee = require('gulp-coffee');
var watch = require('gulp-watch')
var sourcemaps = require('gulp-sourcemaps');
var stripDebug = require('gulp-strip-debug');
var merge = require('merge-stream');
var zip = require('gulp-zip');
var jeditor = require("gulp-json-editor");

gulp.task('coffee', function() {
  gulp.src('src/*.coffee')
    .pipe(coffee({bare: true}).on('error', gutil.log))
    .pipe(gulp.dest('js/'))
});

gulp.task('watch', function() {
  gulp.watch('./src/*.coffee',['coffee'])
});

gulp.task('prod_manifest',function () {
  return gulp.src([
       'manifest.json'
        ], { cwd : "./prod"})
})

gulp.task('dev-start', function() {
  manifest = require('./prod/manifest.json')
  dev_domain  = "127.0.0.1:8443"
  permissions = manifest.permissions || []
  content_scripts = manifest.content_scripts || []
  permissions.push("https://" + dev_domain +"/")
  content_scripts[1].matches.push("*://"+dev_domain+"/*")
  
  gulp.src("./prod/manifest.json")
    .pipe(jeditor({
      'bid_domain': dev_domain
    }))
    .pipe(jeditor({
      'permissions': permissions
    }))
    .pipe(jeditor({
      'content_scripts': content_scripts
    }))
    .pipe(gulp.dest("./"));
});

gulp.task('dev-stop',function () {
  gulp.src([
         'manifest.json'
          ], { cwd : "./prod"})
      .pipe(gulp.dest("./"))
})

gulp.task('strip_debug',function () {
  gulp.src('js/*.js')
    .pipe(stripDebug())
    .pipe(gulp.dest('js/'))
})

gulp.task('zip_extension', function () { 
  manifest = gulp.src([
       'manifest.json'
        ], { cwd : "./prod"})
     
  others = gulp.src([
       'css/*',
       'img/*',
       'js/*.js',
       'options.html',
      ], { base : "."})
      
    merge (manifest,others)  
    .pipe(zip('codesy.zip'))
    .pipe(gulp.dest('prod'));
});

gulp.task('publish',['coffee','strip_debug','zip_extension'])