var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var babel = require('gulp-babel');
var maps = require('gulp-sourcemaps');
var gulpSequence = require('gulp-sequence');

gulp.task('build', gulpSequence('build_engineering_flot'));

gulp.task('build_engineering_flot', function() {
    return gulp.src([
        './source/jquery.canvaswrapper.js',
        './source/jquery.colorhelpers.js',
        './source/jquery.flot.js',
        './source/jquery.flot.saturated.js',
        './source/jquery.flot.browser.js',
        './source/jquery.flot.drawSeries.js',
        './source/jquery.flot.errorbars.js',
        './source/jquery.flot.uiConstants.js',
        './source/jquery.flot.logaxis.js',
        './source/jquery.flot.symbol.js',
        './source/jquery.flot.flatdata.js',
        './source/jquery.flot.navigate.js',
        './source/jquery.flot.fillbetween.js',
        './source/jquery.flot.stack.js',
        './source/jquery.flot.touchNavigate.js',
        './source/jquery.flot.hover.js',
        './source/jquery.flot.touch.js',
        './source/jquery.flot.time.js',
        './source/jquery.flot.axislabels.js',
        './source/jquery.flot.selection.js',
        './source/jquery.flot.composeImages.js',
        './source/jquery.flot.legend.js'
        ])
        .pipe(maps.init())
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(concat('jquery.flot.js'))
        .pipe(uglify())
        .pipe(maps.write('./'))
        .pipe(gulp.dest('dist/es5'));
});