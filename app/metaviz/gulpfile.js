/**
 * Created by asem on 06/06/17.
 */
'use strict';
var gulp = require('gulp'),
    gutil = require('gulp-util'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    uglify = require('gulp-uglify'),
    usemin = require('gulp-usemin'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    changed = require('gulp-changed'),
    rev = require('gulp-rev'),
    browserSync = require('browser-sync'),
    ngannotate = require('gulp-ng-annotate'),
    del = require('del'),
    tsc = require('gulp-typescript'),
    tsMetavizProject = tsc.createProject('tsconfig.json'),
    sourcemaps = require('gulp-sourcemaps');


gulp.task('jshint', function () {
    return gulp.src('scripts/**.js')
        .pipe(jshint())
        .pipe(jshint.reporter(stylish));
});


gulp.task('usemin', ['ts', 'jshint'], function () {
    return gulp.src('**/*.html')
        .pipe(usemin({
            css: [minifycss(), rev()],
            js: [
                // ngannotate(),
                // uglify().on('error', function(err) {gutil.log(gutil.colors.red('[Error]'), err.toString());this.emit('end');}),
                // rev()
            ]
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('ts', function () {
    var tsResults = tsMetavizProject.src()
        .pipe(tsMetavizProject());
    return tsResults.js.pipe(gulp.dest(".")),
        tsResults.dts.pipe(gulp.dest("definitions"));
});


// Images
gulp.task('imagemin', function () {
    return del(['dist/images']), gulp.src('images/**/*')
        .pipe(cache(imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('dist/images'))
        .pipe(notify({
            message: 'Images task complete'
        }));
});

gulp.task('copyfonts', function () {
    return gulp.src('../../node_modules/font-awesome/fonts/**/*.{ttf,woff,eof,svg}*')
        .pipe(gulp.dest('dist/fonts')),
        gulp.src('../../node_modules/bootstrap/dist/fonts/**/*.{ttf,woff,eof,svg}*')
        .pipe(gulp.dest('dist/fonts'));
});

gulp.task('clean', function (cb) {
    return del(['dist'], {
        force: true
    }, cb);
});

gulp.task('default', ['clean'], function () {
    gulp.start('ts', 'usemin', 'imagemin', 'copyfonts');
});