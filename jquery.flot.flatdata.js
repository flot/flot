/* Support flat 1D data.

Set series.flatdata to true to enable.
*/

/* global jQuery*/

(function ($) {
    function process1DRawData(plot, series, data, datapoints) {
        if (series.flatdata === true) {
            var start = series.start || 0;
            var step = series.step || 1;
            datapoints.pointsize = 2;
            for (var i = 0, j=0; i < data.length; i++, j+=2) {
                datapoints.points[j] = start + (i * step);
                datapoints.points[j + 1] = data[i];
            }
            datapoints.points.length = data.length * 2;
        }
    }

    $.plot.plugins.push({
        init: function(plot) {
            plot.hooks.processRawData.push(process1DRawData);
        },
        name: 'flatdata',
        version: '0.0.1'
    });
})(jQuery);
