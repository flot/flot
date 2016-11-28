/* Support flat 1D data.

Set series.flatdata to true to enable.
*/

/* global jQuery*/

(function ($) {
    function process1DRawData(plot, series, data, datapoints) {
        if (series.flatdata === true) {
            datapoints.pointsize = 2;
            datapoints.points.length = data.length * 2;
            for (var i = 0 ; i < data.length; i++) {
                datapoints.points[i*2] = i;
                datapoints.points[i*2 + 1] = data[i];
            }
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
