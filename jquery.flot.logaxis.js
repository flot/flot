/* Pretty handling of log axes.

Copyright (c) 2007-2014 IOLA and Ole Laursen.
Licensed under the MIT license.

Set axis.mode to "log" to enable. 
*/

/* global jQuery*/

(function ($) {

  var options = {
    xaxis: {}
  };

  var PREFERRED_LOG_TICK_VALUES = function () {
    var vals = [];
    for (var power = -39; power <= 39; power++) {
      var range = Math.pow(10, power);
      for (var mult = 1; mult <= 9; mult++) {
        var val = range * mult;
        vals.push(val);
      }
    }
    return vals;
  }();

  var logTransform = function (v) {
    if (v < PREFERRED_LOG_TICK_VALUES[0]) {
      v = PREFERRED_LOG_TICK_VALUES[0];
    }
    return Math.log(v);
  };

  var logInverseTransform = function (v) {
    return Math.exp(v);
  };

  var logTickGenerator = function (min, max) {
    var nTicks = 12; //Math.floor(pixels / pixels_per_tick);

    var ticks = [];
    var minIdx = -1;
    var maxIdx = -1;

    if (min <= 0) {
      min = PREFERRED_LOG_TICK_VALUES[0];
    }

    PREFERRED_LOG_TICK_VALUES.some(function (val, i) {
      if (val >= min) {
        minIdx = i;
        return true;
      } else {
        return false;
      }
    });

    PREFERRED_LOG_TICK_VALUES.some(function (val, i) {
      if (val >= max) {
        maxIdx = i;
        return true;
      } else {
        return false;
      }
    });

    if (minIdx == -1) {
      minIdx = 0;
    }
    if (maxIdx == -1) {
      maxIdx = PREFERRED_LOG_TICK_VALUES.length - 1;
    }

    // Count the number of tick values would appear, if we can get at least
    // nTicks / 4 accept them.
    var lastDisplayed = null;
    if (maxIdx - minIdx >= nTicks / 4) {
      for (var idx = maxIdx; idx >= minIdx; idx--) {
        var tickValue = PREFERRED_LOG_TICK_VALUES[idx];
        var pixel_coord = Math.log(tickValue / min) / Math.log(max / min) * 10;
        var tick = tickValue;

        if (lastDisplayed === null) {
          lastDisplayed = {
            tickValue: tickValue,
            pixel_coord: pixel_coord
          };
        } else {
          if (Math.abs(pixel_coord - lastDisplayed.pixel_coord) >= 1) {
            lastDisplayed = {
              tickValue: tickValue,
              pixel_coord: pixel_coord
            };
          } else {
            tick = null;
          }
        }
        if (tick) ticks.push(tick);
      }
      // Since we went in backwards order.
      ticks.reverse();
    }

    return ticks;
  };

  var logTickFormatter = function (value) {
    var tenExponent = Math.floor(Math.log(value) / Math.LN10);
    var round_with = Math.pow(10, tenExponent);
    var x = Math.round(value / round_with);
    if ((tenExponent >= -4) && (tenExponent <= 4)) {
      return value.toString();
    } else {
      return x.toFixed(0) + "e" + tenExponent;
    }
  };

  function init(plot) {
    plot.hooks.processOptions.push(function (plot, options) {
      $.each(plot.getAxes(), function (axisName, axis) {
        var opts = axis.options;
        if (opts.mode == "log") {
          axis.tickGenerator = function (axis) {
            return logTickGenerator(axis.datamin, axis.datamax);
          };
          axis.tickFormatter = logTickFormatter;
          axis.options.transform = logTransform;
          axis.options.inverseTransform = logInverseTransform;
          axis.options.autoscaleMargin = 0;
        }
      });
    });
  }

  $.plot.plugins.push({
    init: init,
    options: options,
    name: 'log',
    version: '0.1'
  });

  $.plot.logTicksGenerator = logTickGenerator;
  $.plot.logTickFormatter = logTickFormatter;

})(jQuery);