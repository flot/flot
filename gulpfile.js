var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var babel = require('gulp-babel');
var filesExist = require('files-exist');
var maps = require('gulp-sourcemaps');
var babelify = require("babelify");
var browserify = require('browserify');
var gulpSequence = require('gulp-sequence');
var source = require('vinyl-source-stream');
var fs = require('fs');


var files = [
    './source/getCORSCss.js',
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
    './source/jquery.flot.categories.js',
    './source/jquery.flot.stack.js',
    './source/jquery.flot.touchNavigate.js',
    './source/jquery.flot.hover.js',
    './source/jquery.flot.touch.js',
    './source/jquery.flot.time.js',
    './source/jquery.flot.axislabels.js',
    './source/jquery.flot.selection.js',
    './source/jquery.flot.composeImages.js',
    './source/jquery.flot.legend.js'
];

gulp.task('modify jquery.flot.composeImages.js first', async function() {
    fs.readFile('./source/jquery.flot.composeImages.js', (err, data) => {
        if (err) {
            return console.log(err);
        }
        var content = data.toString();
        var new_content = content.replace(`import {getCrossDomainCSSRules} from "./getCORSCss";`,`//import {getCrossDomainCSSRules} from "./getCORSCss";`);
        fs.writeFile('./source/jquery.flot.composeImages.js', new_content, (err) => {
            if (err) {
                return console.error(err);
            }
        })
    });
});

gulp.task('build_flot_source', function() {
    return gulp.src(filesExist(files, { exceptionMessage: 'Missing file' }))
        .pipe(concat('jquery.flot.js'))
        .pipe(gulp.dest('dist/source'));
});

gulp.task('build_flot_minified_start', function() {
    return gulp.src(filesExist(files, { exceptionMessage: 'Missing file' }))
        .pipe(concat('jquery.flot.js'))
        .pipe(gulp.dest('dist/es5'));
});

gulp.task('browserify_flot', function() {
    var b = browserify({
        entries: "dist/es5/jquery.flot.js"
    });
    return b.transform(babelify, {presets: ["@babel/preset-env"]})
        .bundle()
        .pipe(source("jquery.flot.js"))
        .pipe(gulp.dest("dist/es5"));
});

gulp.task('build_flot_minified_end', function() {
    return gulp.src(filesExist("dist/es5/jquery.flot.js", { exceptionMessage: 'Missing file' }))
        .pipe(maps.init())
        .pipe(uglify())
        .pipe(maps.write('./'))
        .pipe(gulp.dest('dist/es5'));
});

gulp.task('modify jquery.flot.composeImages.js in the end', async function() {
    fs.readFile('./source/jquery.flot.composeImages.js', (err, data) => {
        if (err) {
            return console.log(err);
        }
        var content = data.toString();
        var new_content = content.replace(`//import {getCrossDomainCSSRules} from "./getCORSCss";`,`import {getCrossDomainCSSRules} from "./getCORSCss";`);
        fs.writeFile('./source/jquery.flot.composeImages.js', new_content, (err) => {
            if (err) {
                return console.error(err);
            }
        })
    });
});

gulp.task('build', gulp.series('modify jquery.flot.composeImages.js first', 'build_flot_source', 'build_flot_minified_start', 'browserify_flot', 'build_flot_minified_end', 'modify jquery.flot.composeImages.js in the end'));
