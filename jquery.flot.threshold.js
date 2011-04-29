/*
Flot plugin for thresholding data. Controlled through the option
"threshold" in either the global series options

  series: {
    threshold: {
      below: number
      color: colorspec
      lines: lines options
      bars: bars options
      points: points options
    }
  }

or in a specific series

  $.plot($("#placeholder"), [{ data: [ ... ], threshold: { ... }, lines: { ... }, bars: { ... }, points { ... }}])

The data points below "below" are drawn with the specified color. This
makes it easy to mark points below 0, e.g. for budget data.

Internally, the plugin works by splitting the data into two series,
above and below the threshold. The extra series below the threshold
will have its label cleared and the special "originSeries" attribute
set to the original series. You may need to check for this in hover
events.
*/

(function ($) {
    var options = {
        series: {
            threshold: null
        } // or { below: number, color: color spec, ...}
    };

    function init(plot) {
        function thresholdData(plot, s, datapoints) {
            if (!s.threshold) {
                return;
            }

            var ps = datapoints.pointsize,
                i,
                x, y,
                pval,
                p, prevp,
                thresholded = $.extend({}, s), // note: shallow copy
                below = s.threshold.below,
                origpoints = datapoints.points,
                addCrossingPoints = s.lines.show,
                threspoints = [],
                newpoints = [],
                push = Array.prototype.push;

            thresholded.datapoints = {
                points: [],
                pointsize: ps
            };
            thresholded.label = null;
            thresholded.color = s.threshold.color;
            thresholded.threshold = null;
            thresholded.originSeries = s;
            thresholded.data = [];

            $.extend(thresholded.lines = $.extend({}, s.lines), s.threshold.lines);
            $.extend(thresholded.bars = $.extend({}, s.bars), s.threshold.bars);
            $.extend(thresholded.points = $.extend({}, s.points), s.threshold.points);

            for (i = 0; i < origpoints.length; i += ps) {
                x = origpoints[i];
                y = origpoints[i + 1];
                pval = origpoints.slice(i + 2, i + ps);

                prevp = p;
                if (y < below) {
                    p = threspoints;
                } else {
                    p = newpoints;
                }

                if (addCrossingPoints && prevp !== p && x !== null && i > 0 && origpoints[i - ps] !== null) {
                    var interx = (x - origpoints[i - ps]) / (y - origpoints[i - ps + 1]) * (below - y) + x;

                    prevp.push(interx);
                    prevp.push(below);
                    push.apply(prevp, pval);

                    p.push(null); // start new segment
                    p.push(null);
                    push.apply(p, pval);

                    p.push(interx);
                    p.push(below);
                    push.apply(p, pval);
                }

                p.push(x);
                p.push(y);
                push.apply(p, pval);
            }

            datapoints.points = newpoints;
            thresholded.datapoints.points = threspoints;

            if (thresholded.datapoints.points.length > 0) {
                plot.getData().push(thresholded);
            }

            // FIXME: there are probably some edge cases left in bars
        }

        plot.hooks.processDatapoints.push(thresholdData);
    }

    $.plot.plugins.push({
        init: init,
        options: options,
        name: 'threshold',
        version: '1.1'
    });
})(jQuery);