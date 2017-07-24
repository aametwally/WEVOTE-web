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
    tsClientProject = tsc.createProject('tsconfig.json'),
    sourcemaps = require('gulp-sourcemaps')
;


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
                rev()]
        }))
        .pipe(gulp.dest('../build/public'));
});

gulp.task('ts', function () {
    return tsClientProject.src()
        .pipe(tsClientProject())
        .js.pipe(gulp.dest("../build/public"));
});


// Images
gulp.task('imagemin', function () {
    return del(['../build/public/images']), gulp.src('images/**/*')
        .pipe(cache(imagemin({optimizationLevel: 3, progressive: true, interlaced: true})))
        .pipe(gulp.dest('../build/public/images'))
        .pipe(notify({message: 'Images task complete'}));
});

gulp.task('copyfonts', function () {
    return gulp.src('../../bower_components/font-awesome/fonts/**/*.{ttf,woff,eof,svg}*')
        .pipe(gulp.dest('../build/public/fonts')),
        gulp.src('../../bower_components/bootstrap/dist/fonts/**/*.{ttf,woff,eof,svg}*')
            .pipe(gulp.dest('../build/public/fonts'));
});

gulp.task('clean', function (cb) {
    return del(['../build/public'],{force:true},cb);
});

gulp.task('default', ['clean'], function () {
    gulp.start('ts', 'usemin', 'imagemin', 'copyfonts');
});

// Watch
gulp.task('watch', ['browser-sync'], function () {
    // Watch .js files
    gulp.watch('{scripts/**/*.js,styles/**/*.css,**/*.html}', ['usemin']);
    // Watch image files
    gulp.watch('images/**/*', ['imagemin']);

});

gulp.task('browser-sync', ['default'], function () {
    var files = [
        '**/*.html',
        'styles/**/*.css',
        'images/**/*.png',
        'scripts/**/*.js',
        'scripts/**/*.ts',
        '../build/public/**/*',
    ];

    browserSync.init(files, {
        server: {
            baseDir: '../build/public',
            index: 'index.html'
        }
    });
    // Watch any files in app/dist/, reload on change
    gulp.watch(['../build/public/**']).on('change', browserSync.reload);
});
