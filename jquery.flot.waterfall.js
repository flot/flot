(function ($) {
    var options = {
        series: {
            waterfall: {
                on: false, // boolean
                totalx: 0,   // 0 = no totals colum. !0 = x-value at which to draw totals bar = right-most column with height = [0 : base]
                positiveColor: "#00BB00",
                negativeColor: "#BB0000",
                totalColor: "#0000BB"
            }
        }
    };

    function init(plot) {
        function waterfall_processDatapoints(plot, s, datapoints) {
            if (s.waterfall.on === false)
                return;

            var ps = datapoints.pointsize,
                points = datapoints.points,
                newpoints = [],
                withlines = s.lines.show,
                horizontal = s.bars.horizontal,
                withbottom = ps > 2 && (horizontal ? datapoints.format[2].x : datapoints.format[2].y),
                withsteps = withlines && s.lines.steps,
                keyOffset = horizontal ? 1 : 0,
                accumulateOffset = horizontal ? 0 : 1,
                base = 0, i = 0, j = -1, l;

            if (points.length == 0)
                return;

            while (true) {
                if (i >= points.length)
                    break;

                l = newpoints.length;
                
                if (points[i] == null) {
                    // gap
                    for (m = 0; m < ps; ++m)
                        newpoints.push(null);
                } else {
                    for (m = 0; m < ps; ++m)
                        newpoints.push(points[i + m]);

                    newpoints[l + accumulateOffset] += base;

                    if (l != newpoints.length && withbottom)
                        newpoints[l + 2] += base;

                    base += points[i + accumulateOffset];
                }

                i += ps;
                j += ps;

                // maintain the line steps invariant
                if (withsteps && l != newpoints.length && l > 0
                    && newpoints[l] != null
                    && newpoints[l] != newpoints[l - ps]
                    && newpoints[l + 1] != newpoints[l - ps + 1]) {
                    for (m = 0; m < ps; ++m)
                        newpoints[l + ps + m] = newpoints[l + m];
                    newpoints[l + 1] = newpoints[l - ps + 1];
                }
            }

            if (s.waterfall.totalx !== 0) {
                newpoints[l + ps] = s.waterfall.totalx;     // x
                newpoints[l + ps + 1] = newpoints[l + 1];   // y
                if (withbottom) {
                    newpoints[l + ps + 2] = 0;              // bottom
                }
            }

            datapoints.points = newpoints;
        }

        function drawBar(x, y, b, barLeft, barRight, offset, fillStyleCallback, axisx, axisy, c, horizontal, lineWidth, isTotalBar) {
            var left, right, bottom, top,
                drawLeft, drawRight, drawTop, drawBottom,
                tmp,
                positiveNegative;

            // in horizontal mode, we start the bar from the left
            // instead of from the bottom so it appears to be
            // horizontal rather than vertical
            if (horizontal) {
                drawBottom = drawRight = drawTop = true;
                drawLeft = false;
                left = b;
                right = x;
                top = y + barLeft;
                bottom = y + barRight;

                // account for negative bars
                if (right < left) {
                    tmp = right;
                    right = left;
                    left = tmp;
                    drawLeft = true;
                    drawRight = false;
                    positiveNegative = 1;    // Negative
                } else {
                    positiveNegative = 0;    // Positive
                }
            }
            else {
                drawLeft = drawRight = drawTop = true;
                drawBottom = true;  // ICHACK
                left = x + barLeft;
                right = x + barRight;
                bottom = b;
                top = y;

                // account for negative bars
                if (top < bottom) {
                    tmp = top;
                    top = bottom;
                    bottom = tmp;
                    drawBottom = true;
                    drawTop = true;  // ICHACK
                    positiveNegative = 1;    // Negative
                } else {
                    positiveNegative = 0;    // Positive
                }
            }

            // clip
            if (right < axisx.min || left > axisx.max ||
                top < axisy.min || bottom > axisy.max)
                return;

            if (left < axisx.min) {
                left = axisx.min;
                drawLeft = false;
            }

            if (right > axisx.max) {
                right = axisx.max;
                drawRight = false;
            }

            if (bottom < axisy.min) {
                bottom = axisy.min;
                drawBottom = false;
            }

            if (top > axisy.max) {
                top = axisy.max;
                drawTop = false;
            }

            left = axisx.p2c(left);
            bottom = axisy.p2c(bottom);
            right = axisx.p2c(right);
            top = axisy.p2c(top);

            // fill the bar
            if (fillStyleCallback) {
                c.beginPath();
                c.moveTo(left, bottom);
                c.lineTo(left, top);
                c.lineTo(right, top);
                c.lineTo(right, bottom);
                c.fillStyle = fillStyleCallback(bottom, top, isTotalBar ? 3 : positiveNegative);
                c.fill();
            }

            // draw outline
            if (lineWidth > 0 && (drawLeft || drawRight || drawTop || drawBottom)) {
                c.beginPath();

                // FIXME: inline moveTo is buggy with excanvas
                c.moveTo(left, bottom + offset);
                if (drawLeft)
                    c.lineTo(left, top + offset);
                else
                    c.moveTo(left, top + offset);
                if (drawTop)
                    c.lineTo(right, top + offset);
                else
                    c.moveTo(right, top + offset);
                if (drawRight)
                    c.lineTo(right, bottom + offset);
                else
                    c.moveTo(right, bottom + offset);
                if (drawBottom)
                    c.lineTo(left, bottom + offset);
                else
                    c.moveTo(left, bottom + offset);
                c.stroke();
            }
        }

        function drawSeriesBars(series, ctx, plotOffset) {
            function plotBars(datapoints, barLeft, barRight, offset, fillStyleCallback, axisx, axisy, hasTotal) {
                var points = datapoints.points,
                    ps = datapoints.pointsize,
                    end = (hasTotal) ? points.length - ps : points.length;

                for (var i = 0; i < end; i += ps) {
                    if (points[i] == null)
                        continue;
                    drawBar(points[i], points[i + 1], points[i + 2], barLeft, barRight, offset, fillStyleCallback, axisx, axisy, ctx, series.bars.horizontal, series.bars.lineWidth, false);
                }
                if (hasTotal) {
                    drawBar(points[i], points[i + 1], points[i + 2], barLeft, barRight, offset, fillStyleCallback, axisx, axisy, ctx, series.bars.horizontal, series.bars.lineWidth, true);
                }
            }

            ctx.save();
            ctx.translate(plotOffset.left, plotOffset.top);

            // FIXME: figure out a way to add shadows (for instance along the right edge)
            ctx.lineWidth = series.bars.lineWidth;
            ctx.strokeStyle = series.color;
            var barLeft = series.bars.align == "left" ? 0 : -series.bars.barWidth / 2;
            var fillStyleCallback = function (bottom, top, positiveNegativeOrTotal) { return getFillStyle(series.waterfall, bottom, top, positiveNegativeOrTotal); };
            plotBars(series.datapoints, barLeft, barLeft + series.bars.barWidth, 0, fillStyleCallback, series.xaxis, series.yaxis, series.waterfall.totalx != 0);
            ctx.restore();
        }

        function getFillStyle(waterfalloptions, bottom, top, positiveNegativeOrTotal) {
            switch (positiveNegativeOrTotal) {
                case 0:
                    return waterfalloptions.positiveColor;
                case 1:
                    return waterfalloptions.negativeColor;
                default:
                    return waterfalloptions.totalColor;
            }
        }

        function waterfall_draw(plot, ctx, series) {
            if (series.waterfall.on === false)
                return;

            drawSeriesBars(series, ctx, plot.getPlotOffset());
        }

        plot.hooks.processDatapoints.push(waterfall_processDatapoints);
        plot.hooks.drawSeries.push(waterfall_draw);
    }

    $.plot.plugins.push({
        init: init,
        options: options,
        name: "waterfall",
        version: "0.1"
    });
})(jQuery);
