/**
 * Created by asem on 06/06/17.
 */
var gulp = require('gulp'),
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
    del = require('del');


gulp.task('jshint', function () {
    return gulp.src('app/public/scripts/**.js')
        .pipe(jshint())
        .pipe(jshint.reporter(stylish));
});

gulp.task('usemin', ['jshint'], function () {
    return gulp.src('./app/public/**/*.html')
        .pipe(usemin({
            css: [minifycss(), rev()],
            js: [ngannotate(),uglify(), rev()]
        }))
        .pipe(gulp.dest('app/dist/'));
});

// Images
gulp.task('imagemin', function () {
    return del(['app/dist/images']), gulp.src('app/public/images/**/*')
        .pipe(cache(imagemin({optimizationLevel: 3, progressive: true, interlaced: true})))
        .pipe(gulp.dest('app/dist/images'))
        .pipe(notify({message: 'Images task complete'}));
});

gulp.task('copyfonts', ['clean'], function () {
    gulp.src('./bower_components/font-awesome/fonts/**/*.{ttf,woff,eof,svg}*')
        .pipe(gulp.dest('./app/dist/fonts'));
    gulp.src('./bower_components/bootstrap/dist/fonts/**/*.{ttf,woff,eof,svg}*')
        .pipe(gulp.dest('./app/dist/fonts'));
});

gulp.task('clean', function () {
    return del['app/dist'];
});


gulp.task('default', ['clean'], function () {
    gulp.start('usemin', 'imagemin', 'copyfonts');
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
        'app/dist/**/*'
    ];

    browserSync.init(files, {
        server: {
            baseDir: "app/dist",
            index: "index.html"
        }
    });
    // Watch any files in app/dist/, reload on change
    gulp.watch(['app/dist/**']).on('change', browserSync.reload);
});