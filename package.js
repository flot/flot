Package.describe({
  name: 'flot:flot',
  version: '0.8.3',
  summary: 'A meteor package for jQuery flot.',
  git: 'https://github.com/dotansimha/flot.git',
  documentation: null
});

Package.onUse(function(api) {
    api.versionsFrom('METEOR@0.9.0.1');
    api.use('urigo:angular@0.8.4', 'client');
    api.use('jquery', 'client');

    api.add_files(['jquery.flot.js'], 'client');
    api.add_files(['jquery.flot.canvas.js'], 'client');
    api.add_files(['jquery.flot.categories.js'], 'client');
    api.add_files(['jquery.flot.crosshair.js'], 'client');
    api.add_files(['jquery.flot.errorbars.js'], 'client');
    api.add_files(['jquery.flot.fillbetween.js'], 'client');
    api.add_files(['jquery.flot.image.js'], 'client');
    api.add_files(['jquery.flot.navigate.js'], 'client');
    api.add_files(['jquery.flot.pie.js'], 'client');
    api.add_files(['jquery.flot.resize.js'], 'client');
    api.add_files(['jquery.flot.selection.js'], 'client');
    api.add_files(['jquery.flot.stack.js'], 'client');
    api.add_files(['jquery.flot.symbol.js'], 'client');
    api.add_files(['jquery.flot.threshold.js'], 'client');
    api.add_files(['jquery.flot.time.js'], 'client');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('flot:flot');
});
