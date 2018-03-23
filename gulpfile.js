var gulp = require('gulp');
var jsImport = require('gulp-js-import');
var minify = require('gulp-minify');

gulp.task('compare',function () {
    gulp.src('src/index.js')
        .pipe(jsImport())
        .pipe(minify())
        .pipe(gulp.dest('dest/'));
});

gulp.task('default', ['compare']);