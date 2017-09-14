//Declare deps for gulp
const gulp = require("gulp");
const sass = require('gulp-sass');
const useref = require('gulp-useref');
const uglify = require('gulp-uglify');
const gulpIf = require('gulp-if');
const del = require('del');
const runSequence = require('run-sequence');
const browserSync = require('browser-sync').create();

//Root Variables
const source = {
    rootLocation: "./",
    dist: "./dist",
    distCss: "./dist/css",
    css: "./css",
    sass: "./scss/**/*.scss"
}

//browserSync task, init server on bs.init
gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: source.rootLocation
    },
  })
})


//sass task compress code and output to relevant folders
gulp.task('sass', function(){
  return gulp.src(source.sass)
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError)) // Using gulp-sass
    .pipe(gulp.dest(source.css))
    .pipe(gulp.dest(source.distCss))
    .pipe(browserSync.reload({
        stream: true
    }))
})

// Optimization Tasks 
// ------------------

// Optimizing JavaScript 

//minify js files into 1 file and uglify
gulp.task('useref', function(){
    return gulp.src("./*.html")
    .pipe(useref())
    //minify if only js files
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulp.dest(source.dist))
})

// Cleaning
//delete the `dist` folder for you whenever gulp clean:clean is run. 
gulp.task('clean', function() {
  return del.sync(source.dist).then(function(cb) {
    return cache.clearAll(cb);
  });
})

// Watch task
gulp.task('watch', function() {
  gulp.watch(source.sass, ['sass']);
  gulp.watch('./*html', browserSync.reload);
  gulp.watch('./js/**/*.js', browserSync.reload);
})


// Build Sequences
// ---------------

gulp.task('dev', function(callback) {
  runSequence(['sass', 'browserSync'], 'watch',
    callback
  )
})

gulp.task('production', function(callback) {
  runSequence(
    'clean:dist',
    'sass',
    //add in images, fonts here into array
    ['useref'],
    callback
  )
})