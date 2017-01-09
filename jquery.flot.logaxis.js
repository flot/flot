/* Pretty handling of log axes.

Copyright (c) 2007-2014 IOLA and Ole Laursen.
Copyright (c) 2015 Ciprian Ceteras cipix2000@gmail.com.
Licensed under the MIT license.

Set axis.mode to "log" to enable.
*/

/* global jQuery*/

(function ($) {
    'use strict';

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

    var linearTickGenerator = function (min, max, noTicks) {

        var delta = (max - min) / noTicks,
            dec = -Math.floor(Math.log(delta) / Math.LN10);

        var magn = Math.pow(10, -dec),
            norm = delta / magn, // norm is between 1.0 and 10.0
            size;

        if (norm < 1.5) {
            size = 1;
        } else if (norm < 3) {
            size = 2;
            // special case for 2.5, requires an extra decimal
            if (norm > 2.25) {
                size = 2.5;
                ++dec;
            }
        } else if (norm < 7.5) {
            size = 5;
        } else {
            size = 10;
        }

        size *= magn;
        var ticks = [],
            start = floorInBase(min, size),
            i = 0,
            v = Number.NaN,
            prev;

        do {
            prev = v;
            v = start + i * size;
            ticks.push(v);
            ++i;
        } while (v < max && v !== prev);
        return ticks;
    };

    var logTickGenerator = function (min, max, noTicks) {
        var ticks = [];
        var minIdx = -1;
        var maxIdx = -1;

        if (!noTicks) {
            noTicks = 10;
        }

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

        if (minIdx === -1) {
            minIdx = 0;
        }

        if (maxIdx === -1) {
            maxIdx = PREFERRED_LOG_TICK_VALUES.length - 1;
        }

        // Count the number of tick values would appear, if we can get at least
        // nTicks / 4 accept them.
        var lastDisplayed = null;
        var inverseNoTicks = 1 / noTicks;
        if (maxIdx - minIdx >= noTicks / 4) {
            for (var idx = maxIdx; idx >= minIdx; idx--) {
                var tickValue = PREFERRED_LOG_TICK_VALUES[idx];
                var pixel_coord = Math.log(tickValue / min) / Math.log(max / min);
                var tick = tickValue;

                if (lastDisplayed === null) {
                    lastDisplayed = {
                        tickValue: tickValue,
                        pixel_coord: pixel_coord,
                        ideal_pixel_coord: pixel_coord
                    };
                } else {
                    //          if (Math.abs(pixel_coord - lastDisplayed.ideal_pixel_coord) >= inverseNoTicks) {
                    if (Math.abs(pixel_coord - lastDisplayed.pixel_coord) >= inverseNoTicks) {
                        lastDisplayed = {
                            tickValue: tickValue,
                            pixel_coord: pixel_coord,
                            ideal_pixel_coord: lastDisplayed.ideal_pixel_coord - inverseNoTicks
                        };
                    } else {
                        tick = null;
                    }
                }

                if (tick) ticks.push(tick);
            }
            // Since we went in backwards order.
            ticks.reverse();
        } else {
            ticks = linearTickGenerator(min, max, noTicks);
        }

        return ticks;
    };

    var logTickFormatter = function (value) {
        var tenExponent = Math.floor(Math.log(value) / Math.LN10);
        var round_with = Math.pow(10, tenExponent);
        var x = Math.round(value / round_with);
        if ((tenExponent >= -4) && (tenExponent <= 4)) {
            //if we have float numbers, return a limited length string(ex: 0.0009 is represented as 0.000900001)
            return tenExponent <= 0 ? value.toFixed(-tenExponent) : value.toString();
        } else {
            return x.toFixed(0) + 'e' + tenExponent;
        }
    };

    // round to nearby lower multiple of base
    function floorInBase(n, base) {
        return base * Math.floor(n / base);
    }

    function init(plot) {
        plot.hooks.processOptions.push(function (plot) {
            $.each(plot.getAxes(), function (axisName, axis) {
                var opts = axis.options;
                if (opts.mode === 'log') {
                    axis.tickGenerator = function (axis) {
                        var noTicks = 11;
                        return logTickGenerator(axis.min, axis.max, noTicks);
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
