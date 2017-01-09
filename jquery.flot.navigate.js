/* Flot plugin for adding the ability to pan and zoom the plot.

Copyright (c) 2007-2014 IOLA and Ole Laursen.
Copyright (c) 2016 Ciprian Ceteras.
Licensed under the MIT license.

The default behaviour is scrollwheel up/down to zoom in, drag
to pan. The plugin defines plot.zoom({ center }), plot.zoomOut() and
plot.pan( offset ) so you easily can add custom controls. It also fires
"plotpan" and "plotzoom" events, useful for synchronizing plots.

The plugin supports these options:

	zoom: {
		interactive: false
		amount: 1.5         // 2 = 200% (zoom in), 0.5 = 50% (zoom out)
	}

	pan: {
		interactive: false
		cursor: "move"      // CSS mouse cursor value used when dragging, e.g. "pointer"
		frameRate: 20
        mode: "smart"       // enable smart pan mode
	}

"interactive" enables the built-in drag/click behaviour. If you enable
interactive for pan, then you'll have a basic plot that supports moving
around; the same for zoom.

"amount" specifies the default amount to zoom in (so 1.5 = 150%) relative to
the current viewport.

"cursor" is a standard CSS mouse cursor string used for visual feedback to the
user when dragging.

"frameRate" specifies the maximum number of times per second the plot will
update itself while the user is panning around on it (set to null to disable
intermediate pans, the plot will then not update until the mouse button is
released).

Example API usage:

	plot = $.plot(...);

	// zoom default amount in on the pixel ( 10, 20 )
	plot.zoom({ center: { left: 10, top: 20 } });

	// zoom out again
	plot.zoomOut({ center: { left: 10, top: 20 } });

	// zoom 200% in on the pixel (10, 20)
	plot.zoom({ amount: 2, center: { left: 10, top: 20 } });

	// pan 100 pixels to the left and 20 down
	plot.pan({ left: -100, top: 20 })

Here, "center" specifies where the center of the zooming should happen. Note
that this is defined in pixel space, not the space of the data points (you can
use the p2c helpers on the axes in Flot to help you convert between these).

"amount" is the amount to zoom the viewport relative to the current range, so
1 is 100% (i.e. no change), 1.5 is 150% (zoom in), 0.7 is 70% (zoom out). You
can set the default in the options.

*/

// First two dependencies, jquery.event.drag.js and
// jquery.mousewheel.js, we put them inline here to save people the
// effort of downloading them.

/*
jquery.event.drag.js ~ v1.5 ~ Copyright (c) 2008, Three Dub Media (http://threedubmedia.com)
Licensed under the MIT License ~ http://threedubmedia.googlecode.com/files/MIT-LICENSE.txt
*/
(function(a) {
    function e(h) {
        var k, j = this,
            l = h.data || {};
        if (l.elem) j = h.dragTarget = l.elem, h.dragProxy = d.proxy || j, h.cursorOffsetX = l.pageX - l.left, h.cursorOffsetY = l.pageY - l.top, h.offsetX = h.pageX - h.cursorOffsetX, h.offsetY = h.pageY - h.cursorOffsetY;
        else if (d.dragging || l.which > 0 && h.which != l.which || a(h.target).is(l.not)) return;
        switch (h.type) {
            case "mousedown":
                return a.extend(l, a(j).offset(), {
                    elem: j,
                    target: h.target,
                    pageX: h.pageX,
                    pageY: h.pageY
                }), b.add(document, "mousemove mouseup", e, l), i(j, !1), d.dragging = null, !1;
            case !d.dragging && "mousemove":
                if (g(h.pageX - l.pageX) + g(h.pageY - l.pageY) < l.distance) break;
                h.target = l.target, k = f(h, "dragstart", j), k !== !1 && (d.dragging = j, d.proxy = h.dragProxy = a(k || j)[0]);
            case "mousemove":
                if (d.dragging) {
                    if (k = f(h, "drag", j), c.drop && (c.drop.allowed = k !== !1, c.drop.handler(h)), k !== !1) break;
                    h.type = "mouseup"
                }
            case "mouseup":
                b.remove(document, "mousemove mouseup", e), d.dragging && (c.drop && c.drop.handler(h), f(h, "dragend", j)), i(j, !0), d.dragging = d.proxy = l.elem = !1
        }
        return !0
    }

    function f(b, c, d) {
        b.type = c;
        var e = a.event.dispatch.call(d, b);
        return e === !1 ? !1 : e || b.result
    }

    function g(a) {
        return Math.pow(a, 2)
    }

    function h() {
        return d.dragging === !1
    }

    function i(a, b) {
        a && (a.unselectable = b ? "off" : "on", a.onselectstart = function() {
            return b
        }, a.style && (a.style.MozUserSelect = b ? "" : "none"))
    }
    a.fn.drag = function(a, b, c) {
        return b && this.bind("dragstart", a), c && this.bind("dragend", c), a ? this.bind("drag", b ? b : a) : this.trigger("drag")
    };
    var b = a.event,
        c = b.special,
        d = c.drag = {
            not: ":input",
            distance: 0,
            which: 1,
            dragging: !1,
            setup: function(c) {
                c = a.extend({
                    distance: d.distance,
                    which: d.which,
                    not: d.not
                }, c || {}), c.distance = g(c.distance), b.add(this, "mousedown", e, c), this.attachEvent && this.attachEvent("ondragstart", h)
            },
            teardown: function() {
                b.remove(this, "mousedown", e), this === d.dragging && (d.dragging = d.proxy = !1), i(this, !0), this.detachEvent && this.detachEvent("ondragstart", h)
            }
        };
    c.dragstart = c.dragend = {
        setup: function() {},
        teardown: function() {}
    }
})(jQuery);

/* jquery.mousewheel.min.js
 * Copyright (c) 2011 Brandon Aaron (http://brandonaaron.net)
 * Licensed under the MIT License (LICENSE.txt).
 * Thanks to: http://adomas.org/javascript-mouse-wheel/ for some pointers.
 * Thanks to: Mathias Bank(http://www.mathias-bank.de) for a scope bug fix.
 * Thanks to: Seamus Leahy for adding deltaX and deltaY
 *
 * Version: 3.0.6
 *
 * Requires: 1.2.2+
 */
(function(d) {
    function e(a) {
        var b = a || window.event,
            c = [].slice.call(arguments, 1),
            f = 0,
            e = 0,
            g = 0,
            a = d.event.fix(b);
        a.type = "mousewheel";
        b.wheelDelta && (f = b.wheelDelta / 120);
        b.detail && (f = -b.detail / 3);
        g = f;
        void 0 !== b.axis && b.axis === b.HORIZONTAL_AXIS && (g = 0, e = -1 * f);
        void 0 !== b.wheelDeltaY && (g = b.wheelDeltaY / 120);
        void 0 !== b.wheelDeltaX && (e = -1 * b.wheelDeltaX / 120);
        c.unshift(a, f, e, g);
        return (d.event.dispatch || d.event.handle).apply(this, c)
    }
    var c = ["DOMMouseScroll", "mousewheel"];
    if (d.event.fixHooks)
        for (var h = c.length; h;) d.event.fixHooks[c[--h]] = d.event.mouseHooks;
    d.event.special.mousewheel = {
        setup: function() {
            if (this.addEventListener)
                for (var a = c.length; a;) this.addEventListener(c[--a], e, !1);
            else this.onmousewheel = e
        },
        teardown: function() {
            if (this.removeEventListener)
                for (var a = c.length; a;) this.removeEventListener(c[--a], e, !1);
            else this.onmousewheel = null
        }
    };
    d.fn.extend({
        mousewheel: function(a) {
            return a ? this.bind("mousewheel", a) : this.trigger("mousewheel")
        },
        unmousewheel: function(a) {
            return this.unbind("mousewheel", a)
        }
    })
})(jQuery);

(function($) {
    var options = {
        zoom: {
            interactive: false,
            amount: 1.5 // how much to zoom relative to current position, 2 = 200% (zoom in), 0.5 = 50% (zoom out)
        },
        pan: {
            interactive: false,
            cursor: "move",
            frameRate: 60
        }
    };

    function init(plot) {
        function onZoomClick(e, zoomOut) {
            var c = plot.offset();
            c.left = e.pageX - c.left;
            c.top = e.pageY - c.top;
            if (zoomOut)
                plot.zoomOut({
                    center: c
                });
            else
                plot.zoom({
                    center: c
                });
        }
																				 
        var SNAPPING_CONSTANT = $.plot.uiConstants.SNAPPING_CONSTANT;
        var XMARK_LENGTH_CONSTANT = $.plot.uiConstants.XMARK_LENGTH_CONSTANT;
        var PANHINT_LENGTH_CONSTANT = $.plot.uiConstants.PANHINT_LENGTH_CONSTANT;

        function onMouseWheel(e, delta) {
            e.preventDefault();
            onZoomClick(e, delta < 0);
            return false;
        }

        var prevCursor = 'default',
            prevPageX = 0,
            prevPageY = 0,
            startPageX = 0,
            startPageY = 0,
            panHint = null,
            panTimeout = null;

        function onDragStart(e) {
            if (e.which != 1) // only accept left-click
                return false;
            var c = plot.getPlaceholder().css('cursor');
            if (c)
                prevCursor = c;
            plot.getPlaceholder().css('cursor', plot.getOptions().pan.cursor);
            prevPageX = e.pageX;
            prevPageY = e.pageY;
            startPageX = e.pageX;
            startPageY = e.pageY;
            $.each(plot.getAxes(), function(_, axis) {
                var opts = axis.options;

                opts.savedMin = opts.min;
                opts.savedMax = opts.max;
                axis.savedMin = axis.min;
                axis.savedMax = axis.max;
            });
        }

        function onDrag(e) {
            var frameRate = plot.getOptions().pan.frameRate;
            if (panTimeout || !frameRate)
                return;

            panTimeout = setTimeout(function() {
                plot.absPan({
                    left: startPageX - e.pageX,
                    top: startPageY - e.pageY
                });

                panTimeout = null;
            }, 1 / frameRate * 1000);
        }

        function onDragEnd(e) {
            if (panTimeout) {
                clearTimeout(panTimeout);
                panTimeout = null;
            }

            plot.getPlaceholder().css('cursor', prevCursor);
            plot.absPan({
                left: startPageX - e.pageX,
                top: startPageY - e.pageY
            });
            panHint = null;
        }

        function onDblClick(e) {
            plot.getPlaceholder().trigger("re-center", e);
        }

        function bindEvents(plot, eventHolder) {
            var o = plot.getOptions();
            if (o.zoom.interactive) {
                eventHolder.mousewheel(onMouseWheel);
            }

            if (o.pan.interactive) {
                eventHolder.bind("dragstart", {
                    distance: 10
                }, onDragStart);
                eventHolder.bind("drag", onDrag);
                eventHolder.bind("dragend", onDragEnd);
                eventHolder.dblclick(onDblClick);
            }
        }

        plot.zoomOut = function(args) {
            if (!args)
                args = {};

            if (!args.amount)
                args.amount = plot.getOptions().zoom.amount;

            args.amount = 1 / args.amount;
            plot.zoom(args);
        };

        plot.zoom = function(args) {
            if (!args)
                args = {};

            var c = args.center,
                amount = args.amount || plot.getOptions().zoom.amount,
                w = plot.width(),
                h = plot.height();

            if (!c)
                c = {
                    left: w / 2,
                    top: h / 2
                };

            var xf = c.left / w,
                yf = c.top / h,
                minmax = {
                    x: {
                        min: c.left - xf * w / amount,
                        max: c.left + (1 - xf) * w / amount
                    },
                    y: {
                        min: c.top - yf * h / amount,
                        max: c.top + (1 - yf) * h / amount
                    }
                };

            $.each(plot.getAxes(), function(_, axis) {
                var opts = axis.options,
                    min = minmax[axis.direction].min,
                    max = minmax[axis.direction].max;

                if (opts.disableZoom) {
                    return;
                }

                min = axis.c2p(min);
                max = axis.c2p(max);
                if (min > max) {
                    // make sure min < max
                    var tmp = min;
                    min = max;
                    max = tmp;
                }

                var range = max - min;

                // Convert range to transformed coordinates
                if (opts.transform) {
                    range = opts.transform(max) - opts.transform(min);
                }

                opts.min = min;
                opts.max = max;
            });

            plot.setupGrid();
            plot.draw();

            if (!args.preventEvent)
                plot.getPlaceholder().trigger("plotzoom", [plot, args]);
        };

        plot.pan = function(args) {
            var delta = {
                x: +args.left,
                y: +args.top
            };

            if (isNaN(delta.x))
                delta.x = 0;
            if (isNaN(delta.y))
                delta.y = 0;

            $.each(plot.getAxes(), function(_, axis) {
                var opts = axis.options,
                    min, max, d = delta[axis.direction];

                if (d !== 0) {
                    min = axis.c2p(axis.p2c(axis.min) + d);
                    max = axis.c2p(axis.p2c(axis.max) + d);
                    opts.min = min;
                    opts.max = max;
                }
            });

            plot.setupGrid();
            plot.draw();

            if (!args.preventEvent)
                plot.getPlaceholder().trigger("plotpan", [plot, args]);
        };

        var getSnap = function(delta) {
            var snap;

            if (Math.abs(delta.y) < SNAPPING_CONSTANT && Math.abs(delta.x) < SNAPPING_CONSTANT) {
                snap = false;
            } else if (Math.abs(delta.x) < SNAPPING_CONSTANT) {
                delta.x = 0;
                snap = true;
            } else if (Math.abs(delta.y) < SNAPPING_CONSTANT) {
                delta.y = 0;
                snap = true;
            }

            return snap;
        }

        plot.absPan = function(args) {
            var delta = {
                    x: +args.left,
                    y: +args.top
                },
                snap = getSnap(delta);

            if (snap) {
                panHint = {
                    start: {
                        x: startPageX - plot.offset().left + plot.getPlotOffset().left,
                        y: startPageY - plot.offset().top + plot.getPlotOffset().top,
                    },
                    end: {
                        x: startPageX - delta.x - plot.offset().left + plot.getPlotOffset().left,
                        y: startPageY - delta.y - plot.offset().top + plot.getPlotOffset().top,
                    }
                }
            } else {
                panHint = {
                    start: {
                        x: startPageX - plot.offset().left + plot.getPlotOffset().left,
                        y: startPageY - plot.offset().top + plot.getPlotOffset().top,
                    },
                    end: false
                }
            }

            if (isNaN(delta.x))
                delta.x = 0;
            if (isNaN(delta.y))
                delta.y = 0;

            $.each(plot.getAxes(), function(_, axis) {
                var opts = axis.options,
                    min, max, d = delta[axis.direction];

                if (d !== 0) {
                    min = axis.c2p(axis.p2c(axis.savedMin) + d);
                    max = axis.c2p(axis.p2c(axis.savedMax) + d);
                    opts.min = min;
                    opts.max = max;
                } else {
                    opts.min = opts.savedMin;
                    opts.max = opts.savedMax;
                }
            });

            plot.setupGrid();
            plot.draw();

            if (!args.preventEvent)
                plot.getPlaceholder().trigger("plotpan", [plot, args]);
        };

        function shutdown(plot, eventHolder) {
            eventHolder.unbind(plot.getOptions().zoom.trigger, onZoomClick);
            eventHolder.unbind("mousewheel", onMouseWheel);
            eventHolder.unbind("dragstart", onDragStart);
            eventHolder.unbind("drag", onDrag);
            eventHolder.unbind("dragend", onDragEnd);
            if (panTimeout)
                clearTimeout(panTimeout);
        }

        function drawOverlay(plot, ctx) {
            if (panHint) {
                ctx.strokeStyle = '#60a0d0';
                ctx.lineWidth = 1;
                ctx.lineJoin = "round";

                ctx.beginPath();

                if (panHint.end === false) {

                    ctx.moveTo(panHint.start.x - XMARK_LENGTH_CONSTANT, panHint.start.y - XMARK_LENGTH_CONSTANT);
                    ctx.lineTo(panHint.start.x + XMARK_LENGTH_CONSTANT, panHint.start.y + XMARK_LENGTH_CONSTANT);

                    ctx.moveTo(panHint.start.x + XMARK_LENGTH_CONSTANT, panHint.start.y - XMARK_LENGTH_CONSTANT);
                    ctx.lineTo(panHint.start.x - XMARK_LENGTH_CONSTANT, panHint.start.y + XMARK_LENGTH_CONSTANT);
                } else {

                    var dirX = panHint.start.y === panHint.end.y;

                    ctx.moveTo(panHint.start.x - (dirX ? 0 : PANHINT_LENGTH_CONSTANT), panHint.start.y - (dirX ? PANHINT_LENGTH_CONSTANT : 0));
                    ctx.lineTo(panHint.start.x + (dirX ? 0 : PANHINT_LENGTH_CONSTANT), panHint.start.y + (dirX ? PANHINT_LENGTH_CONSTANT : 0));

                    ctx.moveTo(panHint.start.x, panHint.start.y);
                    ctx.lineTo(panHint.end.x, panHint.end.y);

                    ctx.moveTo(panHint.end.x - (dirX ? 0 : PANHINT_LENGTH_CONSTANT), panHint.end.y - (dirX ? PANHINT_LENGTH_CONSTANT : 0));
                    ctx.lineTo(panHint.end.x + (dirX ? 0 : PANHINT_LENGTH_CONSTANT), panHint.end.y + (dirX ? PANHINT_LENGTH_CONSTANT : 0));

                }

                ctx.stroke();
            }
        }

        plot.hooks.drawOverlay.push(drawOverlay);
        plot.hooks.bindEvents.push(bindEvents);
        plot.hooks.shutdown.push(shutdown);
    }

    $.plot.plugins.push({
        init: init,
        options: options,
        name: 'navigate',
        version: '1.3'
    });
})(jQuery);
