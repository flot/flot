/*
Flot plugin for grouping data sets in bar charts, i.e. putting them next to
each other.

The plugin assumes the data is sorted on x (or y if stacking
horizontally). 

Two or more series are grouped when their "group" attribute is set to
the same key (which can be any number or string or just "true"). To
specify the default stack, you can set

  series: {
    group: null or true or key (number/string)
  }

or specify it for a specific series

  $.plot($("#placeholder"), [{ data: [ ... ], group: true }])
  
The grouping order is determined by the order of the data series in
the array (later series end up after the previous).

Internally, the plugin modifies the datapoints in each series, adding
an offset to the x value.
*/

(function ($) {
  var options = {
    series: { group: null } // or number/string
  };

  function init(plot) {
    function findSerieOffset(s, allSeries) {
      var i, current, offset = 0;
      for (i = 0; i < allSeries.length; ++i) {
        current = allSeries[i];
        if (s.bars.group && s.bars.group === current.bars.group) {
          return offset;
        }
        if (current.bars.group) {
          offset += current.bars.barWidth;
        }
      }
    }

    function getGroupsSize(allSeries) {
      var currentSeries,
          added = {},
          groupCount = 0,
          groupWidth = 0,
          s, sl;

      for (s = 0, sl = allSeries.length; s < sl; s++) {
        currentSeries = allSeries[s];
        if (!currentSeries.dynamic && currentSeries.bars && currentSeries.bars.show && currentSeries.bars.group && !added[currentSeries.bars.group]) {
          groupWidth += currentSeries.bars.barWidth;
          groupCount++;
        }
      }
      return {width: groupWidth, count: groupCount};
    }

    function scaleTicks(ticks, series, allSeries, groupCount, groupWidth) {
      var currentSeries,
          added = {},
          offset = 0,
          s, sl,
          t, tl;
      
      offset = groupWidth / 2 - (groupWidth / groupCount / 2);
      for (t = 0, tl = ticks.length; t < tl; t++) {
        ticks[t][0] += (t * groupWidth);
        if (series.bars.align === 'center') {
          ticks[t][0] += offset;
        }
      }
      plot._groupTicksScaled = true;
    }

    function processOptions(plot, options) {
      plot._groupTicksScaled = undefined;
    }

    function processDatapoints(plot, series, datapoints) {
      if (series.dynamic || !series.bars || !series.bars.show || !series.bars.group) {
        return;
      }

      var allSeries = plot.getData(),
          groupsSize = getGroupsSize(allSeries),
          groupWidth = groupsSize.width,
          groupCount = groupsSize.count,
          offset = findSerieOffset(series, allSeries),
          points = datapoints.points,
          ps = datapoints.pointsize,
          p, po, pl,
          ticks = series.bars.horizontal ? series.yaxis.options.ticks : series.xaxis.options.ticks;

      if (ticks && !plot._groupTicksScaled) {
        scaleTicks(ticks, series, allSeries, groupCount, groupWidth);
        plot._groupTicksScaled = true;
      }

      for (p = series.bars.horizontal ? 1 : 0, po = 0, pl = points.length; p < pl; p += ps, po++) {
        points[p] += offset + (po * groupWidth);
      }
    }

    plot.hooks.processOptions.push(processOptions);
    plot.hooks.processDatapoints.push(processDatapoints);
  }

  $.plot.plugins.push({
    init: init,
    options: options,
    name: 'group',
    version: '0.1'
  });
})(jQuery);