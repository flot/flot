/**
 * Flot plugin that provides spline interpolation for line graphs
 * author: Alex Bardas < alex.bardas@gmail.com >
 * based on the spline interpolation described at:
 * 		http://scaledinnovation.com/analytics/splines/aboutSplines.html
 *
 * Example usage: (add in plot options series object)
 *		for linespline:
 *			series: {
 *				...
 *				lines: {
 *					show: false
 *				},
 *				splines: {
 *					show: true,
 *					tension: x, (float between 0 and 1, defaults to 0.5),
 *					lineWidth: y (number, defaults to 2)
 *				},
 *				...
 *			}
 *		areaspline:
 *			series: {
 *				...
 *				lines: {
 *					show: true,
 *					lineWidth: 0, // line drawing will not execute
 *					fill: x, // float between 0 .. 1, as in flot documentation
 *					...
 *				},
 *				splines: {
 *					show: true,
 *					tension: 0.5, (float between 0 and 1)
 *				},
 *				...
 *			}
 *
 */

(function ($) {
	'use strict'

	/**
	 * @param {Number} x0, y0, x1, y1: coordinates of the end (knot) points of the segment
	 * @param {Number} x2, y2: the next knot (not connected, but needed to calculate p2)
	 * @param {Number} tension: control how far the control points spread
	 * @return {Array}: p1 -> control point, from x1 back toward x0
	 *					p2 -> the next control point, returned to become the next segment's p1
	 *
	 * @api private
	 */
	function getControlPoints(x0, y0, x1, y1, x2, y2, tension) {

	    var pow = Math.pow, sqrt = Math.sqrt, d01, d12, fa, fb, p1x, p1y, p2x, p2y;

	    //  Scaling factors: distances from this knot to the previous and following knots.

	    d01 = sqrt(pow(x1 - x0, 2) + pow(y1 - y0, 2));
	    d12 = sqrt(pow(x2 - x1, 2) + pow(y2 - y1, 2));

	    fa = tension * d01 / (d01 + d12);
	    fb = tension - fa;

	    p1x = x1 + fa * (x0 - x2);
	    p1y = y1 + fa * (y0 - y2);

	    p2x = x1 - fb * (x0 - x2);
	    p2y = y1 - fb * (y0 - y2);

	    return [p1x, p1y, p2x, p2y];
	}

	/**
	 * @param {Object} ctx: canvas context
	 * @param {String} type: accepted strings: 'bezier' or 'quadratic' (defaults to quadratic)
	 * @param {Array} points: 2 points for which to draw the interpolation
	 * @param {Array} cpoints: control points for those segment points
	 *
	 * @api private
	 */
	function draw(ctx, type, points, cpoints) {
		// if type is undefined or bad, it defaults to 'quadratic'
		if (type === void 0 || (type !== 'bezier' && type !== 'quadratic')) {
			type = 'quadratic';
		}
		type = type + 'CurveTo';

		ctx.beginPath();
		// move to first point position
		ctx.moveTo(points[0], points[1]);
		// draw a bezier curve from the first point to the second point,
		// using the given set of control points
		ctx[type].apply(ctx, cpoints.concat(points.slice(2)));
		ctx.stroke();
		ctx.closePath();

	}

	/**
	 * @param {Object} plot
	 * @param {Object} ctx: canvas context
	 * @param {Object} series
	 *
	 * @api private
	 */

	function drawSpline(plot, ctx, series) {
		// Not interested if spline is not requested
		if (series.splines.show !== true) {
			return;
		}

	    var cp = [],   // array of control points
	    	tension = series.splines.tension || 0.5,
	    	idx,
	    	x,
	    	y,
	    	points = series.datapoints.points,
	    	ps = series.datapoints.pointsize,
	    	plotOffset = plot.getPlotOffset(),
	    	len = points.length,
	    	pts = [];

	    // Cannot display a linespline/areaspline if there are less than 3 points
	    if (len / ps < 4) {
	    	$.extend(series.lines, series.splines);
	    	return;
	    }

        for (idx = 0; idx < len; idx += ps) {
            x = points[idx];
            y = points[idx + 1];
            if (x == null || x < series.xaxis.min || x > series.xaxis.max ||
            	y < series.yaxis.min || y > series.yaxis.max) {
                continue;
       		}

       		pts.push(series.xaxis.p2c(x), series.yaxis.p2c(y));
        }

        len = pts.length;

	    // Draw an open curve, not connected at the ends
	    for (idx = 0; idx < len - 4; idx += 2) {
	        cp = cp.concat(getControlPoints.apply(this, pts.slice(idx, idx + 6).concat([tension])));
	    }

	    ctx.save();
    	ctx.translate(plotOffset.left, plotOffset.top);
    	ctx.strokeStyle = series.color;
    	ctx.lineWidth = series.splines.lineWidth;

	    for (idx = 2; idx < len - 5; idx += 2) {
	    	draw(ctx, 'bezier', pts.slice(idx, idx + 4), cp.slice(2 * idx - 2, 2 * idx + 2));
	    }

	    //  For open curves the first and last arcs are simple quadratics
	    draw(ctx, 'quadratic', pts.slice(0, 4), cp.slice(0, 2));
	    draw(ctx, 'quadratic', pts.slice(len - 2, len), [cp[2 * len - 10], cp[2 * len - 9], pts[len -4], pts[len - 3]]);

		ctx.restore();
	}

    $.plot.plugins.push({
        init: function(plot) {
            plot.hooks.drawSeries.push(drawSpline);
        },
        options: {
            series: {
                splines: {
                    show: false,
                    lineWidth: 2,
                    tension: 0.5
                }
            }
        },
        name: 'spline',
        version: '0.8.1'
    });
})(jQuery);