// Copyright © 2012 Red Hat Inc.
//
// Author: Chow Loong Jin <lchow@redhat.com>
//
// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation
// files (the "Software"), to deal in the Software without
// restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following
// conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
// OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
// WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
// OTHER DEALINGS IN THE SOFTWARE.
//
// This file contains the 'ranges' plugin which allows one to hand flot a set of
// ranges to highlight as a series.
//
// USAGE:
// This plugin accepts ranges in the form of pairs of points passed in as a
// series.
//
// $.plot ($("#placeholder"), [{data: [[[from_x1, from_y1], [to_x1, to_y1]],
//                                     [[from_x2, from_y2], [to_x2, to_y2]]],
//                             ranges: {show: true}}],
//         options);
//
// To enable this plugin for a series, just set ranges.show=true for the series
// in question, as shown above. Other supported options inside series.ranges
// are:
//  - fill: boolean (to fill the range or not tro fill the range)
//  - lineWidth: width of border or line
//  - opacity: Opacity of fill colour respective to series.color

(function ($) {
    function init (plot)
    {
        function drawSeries (plot, ctx, series)
        {
            if (!series.ranges.show)
                return;

            var plot_offset = plot.getPlotOffset ();
            var color = $.color.parse (series.color);

            var axesinfo = {xaxis: series.xaxis,
                            yaxis: series.yaxis};
            var datapoints = series.data;

            ctx.save ();

            // Set up styling for drawing the selection
            ctx.strokeStyle = color.toString ();
            ctx.lineWidth = series.lineWidth;
            ctx.lineJoin = "round";
            if (series.ranges.fill)
                ctx.fillStyle = color.scale ('a',
                                             series.ranges.opacity).toString ();
            else
                ctx.fillStyle = 'none';

            for (var i=0; i<datapoints.length; i++) {
                var offsets = getOffsets (datapoints[i], axesinfo);
                drawRange (ctx, offsets[0], offsets[1]);
            }

             ctx.restore ();
        }

        plot.hooks.drawSeries.push (drawSeries)

        function getOffsets (points, axesinfo)
        {
            var offsets = [];

            for (var i=0; i<points.length; i++) {
                var point = $.extend ({x: points[i][0],
                                       y: points[i][1]}, axesinfo);
                offsets[i] = plot.pointOffset (point);
            }

            var plot_offset = plot.getPlotOffset ();

            // detect -1 coordinates
            if (points[0][0] === null || points[1][0] === null) {
                offsets[0].left = plot_offset.left;
                offsets[1].left = plot_offset.left + plot.width ()
            }

            if (points[0][1] === null || points[1][1] === null) {
                offsets[0].top = plot_offset.top + plot.height ();
                offsets[1].top = plot_offset.top;
            }

            return offsets;
        }

        function drawRange (ctx, from, to)
        {
            var x = Math.min (from.left, to.left);
            var y = Math.min (from.top, to.top);
            var w = Math.abs (from.left - to.left);
            var h = Math.abs (from.top - to.top);

            if (w == 0 || h == 0) {
                // line mode
                ctx.save ();

                ctx.beginPath ();
                ctx.moveTo (x, y);
                ctx.lineTo (x + w, y + h);
                ctx.stroke ();

                ctx.restore ();
            } else {
                // rect mode
                ctx.fillRect (x, y, w, h);
                ctx.strokeRect (x, y, w, h);
            }
        }
    }

    $.plot.plugins.push ({
        init: init,
        options: {
            series: {
                ranges: {
                    show: false,
                    fill: true,
                    opacity: 0.4,
                    lineWidth: 2, // in pixels
                }
            }
        },
        name: 'ranges',
        version: '0.1'
    })
}) (jQuery)
