var gulp = require('gulp');

gulp.task('build', function () {
    'use strict';

    var uglify = require('gulp-uglifyjs'),
        uglifyOptions = {
            outSourceMap: true
        };

    return gulp.src('jquery.dynamicPreview.js')
        .pipe(uglify('jquery.dynamicPreview.min.js', uglifyOptions))
        .pipe(gulp.dest('./'));
});
