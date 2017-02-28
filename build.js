var fs = require('fs');
var concat = require('concat-files');

var distDir = './dist';
var distFile = 'jquery.flot.js';

if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir)
}

concat([
        './jquery.colorhelpers.js',
        './jquery.canvaswrapper.js',
        './jquery.flot.js',
        './jquery.flot.drawSeries.js',
        './jquery.flot.uiConstants.js'
    ], distDir + '/' + distFile, function(err) {
        if (err) {
            throw err;
        }
    });
