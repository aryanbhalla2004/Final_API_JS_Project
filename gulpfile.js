const gulp = require('gulp');
const cleanCSS = require('gulp-clean-css');
const uglifyJS = require('gulp-uglify');
const browserSync = require('browser-sync').create();

function sync(){
  browserSync.init({
    server: {
      baseDir: './dist'
    }
  })
}

function minifyJS(){
  return gulp.src('src/js/*.js')
    .pipe(uglifyJS())
    .pipe(gulp.dest('dist/js'));
}

function minifyCss(){
  return gulp.src('src/css/*.css')
    .pipe(cleanCSS())
    .pipe(gulp.dest('dist/css'));
}

function copyHTML() {
  return gulp.src('src/*.html')
    .pipe(gulp.dest('dist'));
}

function watch(){
  gulp.watch('src/css/*.css', minifyCss).on('change', browserSync.reload);
  gulp.watch('src/js/*.js', minifyJS).on('change', browserSync.reload);
  gulp.watch('src/*.html', copyHTML).on('change', browserSync.reload);
}

exports.default = gulp.series(
  gulp.parallel(
    copyHTML, 
    minifyCss, 
    minifyJS, 
  ), 
  gulp.parallel(
    sync, 
    watch
  )
);