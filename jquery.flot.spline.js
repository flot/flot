/**
 * Flot plugin that provides spline interpolation for line graphs
 *
 * Params spline may be intager (count of points that will be added)
 * or boolean (in case of true points count will be 250)
 */
(function ($) {
    function processRawData(plot, series, datapoints) {
        var default_poinst = 250;
        var s = series.lines.spline || false;

        var use_spline = ((s === true) || (parseInt(s) > 0));
        if (use_spline) {
            var points_count = (s === true ? default_poinst : parseInt(s));
            
            series.datapoints.points = (function(data, num) {
                var xdata = [];
                var ydata = [];

                for (var i = 0; i < data.length; i+= 2) {
                    xdata.push(data[i]);
                    ydata.push(data[i + 1]);
                }

                var n = xdata.length;
                if (n != ydata.length || n > num) {
                    throw "Not valid incoming data in spline function";
                }

                var y2 = [],
                    delta = [];

                y2[0] = 0;
                y2[n - 1] = 0;
                delta[0] = 0;

                for (var i = 1; i < n - 1; ++i) {
                    var d = (xdata[i + 1] - xdata[i - 1]);
                    if (d == 0) {
                        throw "Not valid graph diff points in spline function";
                    }

                    var s = (xdata[i] - xdata[i - 1]) / d,
                        p = s * y2[i - 1] + 2;
                    y2[i] = (s - 1) / p;
                    delta[i] = (ydata[i + 1] - ydata[i]) / (xdata[i + 1] - xdata[i]);
                    delta[i]-= (ydata[i] - ydata[i - 1]) / (xdata[i] - xdata[i - 1]);
                    delta[i] = (6 * delta[i] / (xdata[i + 1] - xdata[i - 1]) - s * delta[i - 1]) / p;
                }

                for (var j = n - 2; j >= 0; --j) {
                    y2[j] = y2[j] * y2[j + 1] + delta[j];
                }

                var step = (xdata[n - 1] - xdata[0]) / (num - 1),
                    xnew = [],
                    ynew = [],
                    result = [];

                xnew[0] = 0;
                ynew[0] = 0;

                for (j = 0; j < num; ++j) {
                    xnew[j] = xnew[0] + j * step;

                    var max = n - 1,
                        min = 0;

                    while(max - min > 1) {
                        var k = Math.round((max + min) / 2);
                        if(xdata[k] > xnew[j]) {
                            max = k;
                        } else {
                            min = k;
                        }
                    }

                    var h = (xdata[max] - xdata[min]);

                    if (h == 0) {
                        throw "Not valid graph diff points in spline function";
                    }

                    var a = (xdata[max] - xnew[j]) / h,
                        b = (xnew[j] - xdata[min]) / h;
                    ynew[j] = a * ydata[min];
                    ynew[j]+= b * ydata[max];
                    ynew[j]+= ((a * a * a - a) * y2[min] + (b * b * b - b) * y2[max]) * (h * h) / 6;

                    result.push(xnew[j]);
                    result.push(ynew[j]);
                }

                return result;
            })(series.datapoints.points, points_count);
        }
    }

    $.plot.plugins.push({
        init: function(plot) {
            plot.hooks.processDatapoints.push(processRawData);
        },
        options: {
            series: {
                lines: {
                    spline: false
                }
            }
        },
        name: 'spline',
        version: '0.2'
    });
})(jQuery);
