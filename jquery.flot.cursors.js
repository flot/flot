/* Flot plugin for adding cursors to the plot.

Copyright (c) cipix2000@gmail.com.
Copyright (c) 2007-2014 IOLA and Ole Laursen.
Licensed under the MIT license.

The plugin supports these options:

cursors: [
    {
        mode: null or "x" or "y" or "xy",
        color: color,
        lineWidth: number,
        position: {...}
    },
    {
        mode: null or "x" or "y" or "xy",
        color: color,
        lineWidth: number,
        position: {...}
    }
]

Set the mode to one of "x", "y" or "xy". The "x" mode enables a vertical
crosshair that lets you trace the values on the x axis, "y" enables a
horizontal crosshair and "xy" enables them both. "color" is the color of the
crosshair (default is "rgba(170, 0, 0, 0.80)"), "lineWidth" is the width of
the drawn lines (default is 1).

The plugin also adds some public methods:

    addCursor( name, pos, options )

        add a new cursor named 'name' at the position pos with default options
        specified in options. "pos" is in coordinates of the plot and should be
        on the form { x: xpos, y: ypos } (you can use  x2/x3/... if you're using
        multiple axes), which is coincidentally the same format as what you get
        from a "plothover" event.

    removeCursor( name )

        remove the cursor named 'name'.

    moveCursor( name , pos)

        Causes the cursor with the name 'name' to move to 'pos'

    Example usage:

	var myFlot = $.plot( $("#graph"), ...,
    {
        cursors: [
            { name: 'Green cursor', mode: "xy", color: 'green' },
            { name: 'Red cursor', mode: "xy", color: 'red' }
        ]
    });
*/

/*global jQuery*/

(function ($) {
    'use strict';

    var options = {
        cursors: [
        ]
    };

    function init(plot) {
        var cursors = [];
        var update = [];

        var mixin = function (source, destination) {
            Object.keys(source).forEach(function (key) {
                destination[key] = source[key];
            });
        };

        var setPosition = function (cursor, pos) {
            if (!pos)
                return;

            if (pos.relativeX && pos.relativeY) {
                cursor.x = Math.max(0, Math.min(pos.relativeX, plot.width()));
                cursor.y = Math.max(0, Math.min(pos.relativeY, plot.height()));
            } else {
                var o = plot.p2c(pos);
                cursor.x = Math.max(0, Math.min(o.left, plot.width()));
                cursor.y = Math.max(0, Math.min(o.top, plot.height()));
            }
        };

        plot.hooks.processOptions.push(function (plot) {
            plot.getOptions().cursors.forEach(function (cursor) {
                var currentCursor = {
                    x: 0,
                    y: 0,
                    locked: true,
                    highlighted: false,
                    mode: 'xy',
                    position: cursor.position
                };

                setPosition(currentCursor, cursor.position);

                currentCursor.name = cursor.name || ('unnamed ' + cursors.length);
                cursors.push(currentCursor);
            });
        });

        plot.getCursors = function () {
            return cursors;
        };

        plot.addCursor = function addCursor(name, mode, color, pos) {
            var currentCursor = {
                x: 0,
                y: 0,
                locked: true,
                highlighted: false,
                mode: mode,
                color: color,
                position: pos
            };

            currentCursor.name = name || ('unnamed ' + cursors.length);
            setPosition(currentCursor, pos);
            cursors.push(currentCursor);

            plot.triggerRedrawOverlay();
        };

        plot.removeCursor = function removeCursor(cursor) {
            var index = cursors.indexOf(cursor);

            if (index !== -1) {
                cursors.splice(index, 1);
            }

            plot.triggerRedrawOverlay();
        };

        plot.setCursor = function setCursor(cursor, options) {
            var index = cursors.indexOf(cursor);

            if (index !== -1) {
                mixin(options, cursors[index]);
                setPosition(cursors[index], cursors[index].position);
                plot.triggerRedrawOverlay();
            }
        };

        plot.getIntersections = function getIntersections(cursor) {
            var index = cursors.indexOf(cursor);

            if (index !== -1) {
                return cursors[index].intersections;
            }

            return [];
        };

        function onMouseOut(e) {
            /*
                stop drag
            */
        }

        function onMouseDown(e) {
            var offset = plot.offset();
            var mouseX = Math.max(0, Math.min(e.pageX - offset.left, plot.width()));
            var mouseY = Math.max(0, Math.min(e.pageY - offset.top, plot.height()));
            var freeCursor = null;

            cursors.forEach(function (cursor) {
                if (!cursor.locked) {
                    if (!freeCursor)
                        freeCursor = cursor;
                }
            });

            if (freeCursor) {
                // lock the free cursor to current position
                freeCursor.locked = true;
                freeCursor.x = mouseX;
                freeCursor.y = mouseY;
                plot.triggerRedrawOverlay();
            } else {
                // find nearby cursor and unlock it
                cursors.forEach(function (cursor) {
                    if (cursor.locked) {
                        if ((mouseX > cursor.x - 4) && (mouseX < cursor.x + 4) && (mouseY > cursor.y - 4) && (mouseY < cursor.y + 4)) {
                            if (!freeCursor) {
                                freeCursor = cursor;
                            }
                        }
                    }
                });

                if (freeCursor) {
                    freeCursor.locked = false;
                }
            }
        }

        function onMouseUp(e) {
            var offset = plot.offset();
            var mouseX = Math.max(0, Math.min(e.pageX - offset.left, plot.width()));
            var mouseY = Math.max(0, Math.min(e.pageY - offset.top, plot.height()));
            var freeCursor = null;

            cursors.forEach(function (cursor) {
                if (!cursor.locked) {
                    if (!freeCursor)
                        freeCursor = cursor;
                }
            });

            if (freeCursor) {
                // lock the free cursor to current position
                freeCursor.locked = true;
                freeCursor.x = mouseX;
                freeCursor.y = mouseY;
                plot.triggerRedrawOverlay();
            }
        }

        function onMouseMove(e) {
            var offset = plot.offset();
            var mouseX = Math.max(0, Math.min(e.pageX - offset.left, plot.width()));
            var mouseY = Math.max(0, Math.min(e.pageY - offset.top, plot.height()));
            var freeCursor = null;

            cursors.forEach(function (cursor) {
                if (cursor.locked) {
                    if ((mouseX > cursor.x - 4) && (mouseX < cursor.x + 4) && (mouseY > cursor.y - 4) && (mouseY < cursor.y + 4)) {
                        if (!cursor.highlighted) {
                            cursor.highlighted = true;
                            plot.triggerRedrawOverlay();
                        }
                    } else {
                        if (cursor.highlighted) {
                            cursor.highlighted = false;
                            plot.triggerRedrawOverlay();
                        }
                    }
                } else {
                    if (!freeCursor)
                        freeCursor = cursor;
                }
            });

            if (freeCursor) {
                freeCursor.x = freeCursor.position.relativeX = Math.max(0, Math.min(e.pageX - offset.left, plot.width()));
                freeCursor.y = freeCursor.position.relativeY = Math.max(0, Math.min(e.pageY - offset.top, plot.height()));

                plot.triggerRedrawOverlay();
            }
        }

        plot.hooks.bindEvents.push(function (plot, eventHolder) {
            eventHolder.mousedown(onMouseDown);
            eventHolder.mouseup(onMouseUp);
            eventHolder.mouseout(onMouseOut);
            eventHolder.mousemove(onMouseMove);
        });

        function drawIntersections(plot, ctx, cursor) {
            var pos = plot.c2p({
                left: cursor.x,
                top: cursor.y
            });
            var intersections = {
                cursor: cursor.name,
                points: []
            };

            var axes = plot.getAxes();
            if (pos.x < axes.xaxis.min || pos.x > axes.xaxis.max ||
                pos.y < axes.yaxis.min || pos.y > axes.yaxis.max) {
                return;
            }

            var i, j, dataset = plot.getData();
            for (i = 0; i < dataset.length; ++i) {

                var series = dataset[i];

                // Find the nearest points, x-wise
                for (j = 0; j < series.data.length; ++j) {
                    if (series.data[j][0] > pos.x) {
                        break;
                    }
                }

                // Now Interpolate
                var y,
                    p1 = series.data[j - 1],
                    p2 = series.data[j];

                if (p1 === null) {
                    y = p2[1];
                } else if (p2 === null) {
                    y = p1[1];
                } else {
                    y = p1[1] + (p2[1] - p1[1]) * (pos.x - p1[0]) / (p2[0] - p1[0]);
                }
                pos.y = y;
                pos.y1 = y;
                intersections.points.push({
                    x: pos.x,
                    y: pos.y
                });
                var coord = plot.p2c(pos);
                ctx.fillStyle = 'darkgray';
                ctx.fillRect(Math.floor(coord.left) - 4, Math.floor(coord.top) - 4, 8, 8);
                ctx.fillText(y.toFixed(2), coord.left + 8, coord.top + 8);
            }
            cursor.intersections = intersections;
            update.push(intersections);
        }

        plot.hooks.drawOverlay.push(function (plot, ctx) {
            var i = 0;
            update = [];
            cursors.forEach(function (cursor) {
                var c = plot.getOptions().cursors[i];

                if (!c) {
                    c = cursor;
                }

                if (!c.mode)
                    return;

                var plotOffset = plot.getPlotOffset();

                ctx.save();
                ctx.translate(plotOffset.left, plotOffset.top);

                setPosition(cursor, cursor.position);

                if (cursor.x != -1) {
                    var adj = c.lineWidth % 2 ? 0.5 : 0;

                    ctx.strokeStyle = c.color;
                    ctx.lineWidth = c.lineWidth;
                    ctx.lineJoin = "round";

                    ctx.beginPath();
                    if (c.mode.indexOf("x") != -1) {
                        var drawX = Math.floor(cursor.x) + adj;
                        ctx.moveTo(drawX, 0);
                        ctx.lineTo(drawX, plot.height());
                    }
                    if (c.mode.indexOf("y") != -1) {
                        var drawY = Math.floor(cursor.y) + adj;
                        ctx.moveTo(0, drawY);
                        ctx.lineTo(plot.width(), drawY);
                    }
                    if (cursor.locked) {
                        if (cursor.highlighted) ctx.fillStyle = 'orange';
                        else ctx.fillStyle = c.color;
                        ctx.fillRect(Math.floor(cursor.x) + adj - 4, Math.floor(cursor.y) + adj - 4, 8, 8);
                    }
                    drawIntersections(plot, ctx, cursor);
                    ctx.stroke();
                }
                ctx.restore();
                i++;
            });
            plot.getPlaceholder().trigger('cursorupdates', [update]);
        });

        plot.hooks.shutdown.push(function (plot, eventHolder) {
            eventHolder.unbind("mousedown", onMouseDown);
            eventHolder.unbind("mouseup", onMouseUp);
            eventHolder.unbind("mouseout", onMouseOut);
            eventHolder.unbind("mousemove", onMouseMove);
            eventHolder.unbind("cursorupdates");
        });
    }

    $.plot.plugins.push({
        init: init,
        options: options,
        name: 'cursors',
        version: '0.1'
    });
})(jQuery);