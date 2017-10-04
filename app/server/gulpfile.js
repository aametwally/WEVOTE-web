/**
 * Created by asem on 06/06/17.
 */
'use strict';
var gulp = require('gulp'),
    del = require('del'),
    tsc = require('gulp-typescript'),
    tsServerProject = tsc.createProject('tsconfig.json'),
    sourcemaps = require('gulp-sourcemaps');


gulp.task('common', function () {
    return gulp.src('../common/*ts')
        .pipe(gulp.dest('common'));
});

gulp.task('ts', ['common'], function () {
    var tsResults = tsServerProject.src()
        .pipe(tsServerProject());
    return tsResults.js.pipe(gulp.dest("../build")),
        gulp.src('bin/*').pipe(gulp.dest('../build/bin'));
});

gulp.task('clean', function (cb) {
    return del(['../build/models'], {
        force: true
    }, cb),
        del(['../build/routes'], {
            force: true
        }, cb),
        del(['../build/app.js', 'common'], {
            force: true
        }, cb);
});

gulp.task('copy', function () {
    gulp.src('models/*.{json,csv}*')
        .pipe(gulp.dest('../build/models'));
});

gulp.task('default', ['clean'], function () {
    gulp.start('ts', 'copy');
});