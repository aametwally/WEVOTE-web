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
    tsClientProject = tsc.createProject('app/public/tsconfig.json', {
        noImplicitAny: true,
        allowJs: true
    }),
    sourcemaps = require('gulp-sourcemaps')
;


gulp.task('jshint', function () {
    return gulp.src('app/public/scripts/**.js')
        .pipe(jshint())
        .pipe(jshint.reporter(stylish));
});


gulp.task('usemin', ['ts', 'cpmaps' ,'jshint'], function () {
    return gulp.src('./app/public/**/*.html')
        .pipe(usemin({
            css: [minifycss(), rev()],
            js: [
                // ngannotate(),
                // uglify().on('error', function(err) {gutil.log(gutil.colors.red('[Error]'), err.toString());this.emit('end');}),
                rev()]
        }))
        .pipe(gulp.dest('app/dist'));
});

gulp.task('ts', function () {
    var tsResults =
        gulp.src('app/public/scripts/**.ts')
            .pipe(sourcemaps.init())
            .pipe(tsClientProject());

    return  tsResults.js
        .pipe(sourcemaps.write("maps/"))
        .pipe(gulp.dest('app/public/scripts/'));
});

gulp.task('cpmaps',['ts'],function(){
    return gulp.src('app/public/scripts/maps/*.map')
        .pipe(gulp.dest('app/dist/scripts/maps'));
});


// Images
gulp.task('imagemin', function () {
    return del(['app/dist/images']), gulp.src('app/public/images/**/*')
        .pipe(cache(imagemin({optimizationLevel: 3, progressive: true, interlaced: true})))
        .pipe(gulp.dest('app/dist/images'))
        .pipe(notify({message: 'Images task complete'}));
});

gulp.task('copyfonts', function () {
    gulp.src('./bower_components/font-awesome/fonts/**/*.{ttf,woff,eof,svg}*')
        .pipe(gulp.dest('./app/dist/fonts'));
    gulp.src('./bower_components/bootstrap/dist/fonts/**/*.{ttf,woff,eof,svg}*')
        .pipe(gulp.dest('./app/dist/fonts'));
});

gulp.task('clean', function (cb) {
    return del(['./app/dist/'],cb);
});

gulp.task('default', ['clean'], function () {
    gulp.start('ts', 'usemin', 'imagemin', 'copyfonts');
});


// Watch
gulp.task('watch', ['browser-sync'], function () {
    // Watch .js files
    gulp.watch('{app/public/scripts/**/*.js,app/public/styles/**/*.css,app/public/**/*.html}', ['usemin']);
    // Watch image files
    gulp.watch('app/public/images/**/*', ['imagemin']);

});

gulp.task('browser-sync', ['default'], function () {
    var files = [
        'app/public/**/*.html',
        'app/public/styles/**/*.css',
        'app/public/images/**/*.png',
        'app/public/scripts/**/*.js',
        'app/public/scripts/**/*.ts',
        'app/dist/**/*',
    ];

    browserSync.init(files, {
        server: {
            baseDir: 'app/dist',
            index: 'index.html',
        },
    });
    // Watch any files in app/dist/, reload on change
    gulp.watch(['app/dist/**']).on('change', browserSync.reload);
});
