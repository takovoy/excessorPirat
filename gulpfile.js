var gulp = require('gulp');
var jsImport = require('gulp-js-import');
var minify = require('gulp-minify');
var rename = require('gulp-rename');

gulp.task('compare',function () {
    gulp.src('src/index.js')
        .pipe(jsImport())
        .pipe(rename('excessorPirat.js'))
        .pipe(minify())
        .pipe(gulp.dest('dest/'));
});

gulp.task('default', ['compare']);