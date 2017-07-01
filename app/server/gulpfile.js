/**
 * Created by asem on 06/06/17.
 */
'use strict';
var gulp = require('gulp'),
    del = require('del'),
    tsc = require('gulp-typescript'),
    tsServerProject = tsc.createProject('tsconfig.json'),
    sourcemaps = require('gulp-sourcemaps')
;


gulp.task('ts', function () {
    return tsServerProject.src()
        .pipe(tsServerProject())
        .js.pipe(gulp.dest("../build"));
});

gulp.task('clean', function (cb) {
    return del(['../build/models'], {force: true}, cb),
        del(['../build/routes'], {force: true}, cb),
        del(['../build/app.js'], {force: true}, cb);
});

gulp.task('copy', function(){
    gulp.src('models/*.json')
        .pipe(gulp.dest('../build/models'));
});

gulp.task('default', ['clean'],function () {
    gulp.start('ts','copy');
});
