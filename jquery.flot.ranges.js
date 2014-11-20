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
    var inf = Number.MAX_VALUE;

    function mutateInfinity (value) {
        value = +value;
        if (value == Infinity)
            return inf;
        else if (value == -Infinity)
            return -inf;
        else
            return value;
    }

    function processRawData (plot, series, data, datapoints)
    {
        if (!series.ranges.show)
            return;

        var formats = [];

        datapoints.pointsize = 4;
        datapoints.points = [];
        datapoints.format = [
            {x: true, number: true, required: true},
            {y: true, number: true, required: true},
            {x: true, number: true, required: true},
            {y: true, number: true, required: true}
        ];

        for (var i=0; i<data.length; i++) {
            var from_point = data[i][0];
            var to_point = data[i][1];

            var from_x = mutateInfinity (from_point[0]);
            var from_y = mutateInfinity (from_point[1]);
            var to_x = mutateInfinity (to_point[0]);
            var to_y = mutateInfinity (to_point[1]);

            datapoints.points.push (from_x, from_y, to_x, to_y);
        }
    }

    function drawSeries (plot, ctx, series)
    {
        if (!series.ranges.show)
            return;

        var plot_offset = plot.getPlotOffset ();
        var color = $.color.parse (series.color);

        var axesinfo = {xaxis: series.xaxis,
                        yaxis: series.yaxis};

        ctx.save ();
        ctx.beginPath ();
        ctx.rect (plot_offset.left, plot_offset.top,
                  plot.width (), plot.height ());
        ctx.closePath ();
        ctx.clip ();
        ctx.strokeStyle = color.toString ();
        ctx.lineWidth = series.lineWidth;
        ctx.lineJoin = "round";

        if (series.ranges.fill)
            ctx.fillStyle = color.scale ('a',
                                         series.ranges.opacity).toString ();
        else
            ctx.fillStyle = "none";

        var points = series.datapoints.points;
        for (var i=0; i<points.length; i+=series.datapoints.pointsize) {
            var range = {
                from: {x: points[i], y: points[i+1]},
                to: {x: points[i+2], y:points[i+3]},
                axes: axesinfo
            };

            drawRange (plot, ctx, range);
        }

        ctx.restore ();
    }

    function drawRange (plot, ctx, range)
    {
        var from = $.extend ({}, range.from, range.axes);
        var to = $.extend ({}, range.to, range.axes);
        var plot_offset = plot.getPlotOffset ();

        // Get top/left coords for these points
        $.extend (from, plot.pointOffset (from));
        $.extend (to, plot.pointOffset (to));

        // Fix up top/left coords for infinity points
        var points = [from, to];
        for (var i=0; i<points.length; i++) {
            if (points[i].x == inf)
                points[i].left = plot_offset.left;
            else if (points[i].x == -inf)
                points[i].left = plot_offset.left + plot.width ();

            if (points[i].y == inf)
                points[i].top = plot_offset.top;
            else if (points[i].y == -inf)
                points[i].top = plot_offset.top + plot.height ();
        }

        var x = Math.min (from.left, to.left);
        var y = Math.min (from.top, to.top);
        var w = Math.abs (from.left - to.left);
        var h = Math.abs (from.top - to.top);

        if (w == 0 || h == 0) {
            // line mode
            ctx.beginPath ();
            ctx.moveTo (x, y);
            ctx.lineTo (x + w, y + h);
            ctx.closePath ();
            ctx.stroke ();
        } else {
            // rect mode
            ctx.fillRect (x, y, w, h);
            ctx.strokeRect (x, y, w, h);
        }
    }

    function point2RangeDistance (point, range, xaxis, yaxis)
    {
        var left = Math.min (range[0], range[2]);
        var bottom = Math.min (range[1], range[3]);
        var right = Math.max (range[0], range[2]);
        var top = Math.max (range[1], range[3]);

        var offsetx = xaxis.p2c (point.x);
        var offsety = xaxis.p2c (point.y);

        var offsetleft = xaxis.p2c (left);
        var offsetright = xaxis.p2c (right);
        var offsettop = xaxis.p2c (top);
        var offsetbottom = xaxis.p2c (bottom);

        var xdist = Math.min (Math.abs (offsetx - offsetleft),
                              Math.abs (offsetx - offsetright));
        var ydist = Math.min (Math.abs (offsety - offsetbottom),
                              Math.abs (offsety - offsettop));

        if (left <= point.x && point.x <= right) {
            if (bottom <= point.y && point.y <= top)
                return 0;
            else
                return ydist;
        } else {
            if (bottom <= point.y && point.y <= top)
                return xdist;
            else {
                // Neither x nor y within range, so find distance to nearest
                // corner
                return Math.sqrt (xdist * xdist + ydist * ydist);
            }
        }
    }

    function init (plot)
    {
        plot.hooks.processRawData.push (processRawData);
        plot.hooks.drawSeries.push (drawSeries);
        plot.findRanges = function (point)
        {
            var series_list = plot.getData ();

            var retval = [];

            for (var i=0; i<series_list.length; i++) {
                var series = series_list[i];

                if (!series.ranges.show)
                    continue;

                var datapoints = series.datapoints;
                var distance = inf;
                var found_range = null;
                for (var j=0; j<datapoints.points.length;
                     j+=datapoints.pointsize) {
                    var range = [datapoints.points[j],
                                 datapoints.points[j+1],
                                 datapoints.points[j+2],
                                 datapoints.points[j+3]];
                    var radius = plot.getOptions ().grid.mouseActiveRadius;


                    var xaxis = series.xaxis;
                    var yaxis = series.yaxis;

                    var newdistance = point2RangeDistance (point, range,
                                                           xaxis, yaxis);
                    if (newdistance < distance && newdistance <= radius) {
                        distance = newdistance;
                        found_range = {datapoint: range,
                                       dataIndex: j / datapoints.pointsize,
                                       series: series,
                                       seriesIndex: i};
                    }
                }

                if (found_range != null)
                    retval.push (found_range);
            }

            return retval;
        };
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
