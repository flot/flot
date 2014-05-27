/* Flot plugin for showing crosshairs when the mouse hovers over the plot.

Copyright (c) 2007-2014 IOLA and Ole Laursen.
Licensed under the MIT license.

The plugin supports these options:

	crosshairs: [
    {
		mode: null or "x" or "y" or "xy"
		color: color
		lineWidth: number
	},
    {
        mode: null or "x" or "y" or "xy"
        color: color
        lineWidth: number
    }
    ]

Set the mode to one of "x", "y" or "xy". The "x" mode enables a vertical
crosshair that lets you trace the values on the x axis, "y" enables a
horizontal crosshair and "xy" enables them both. "color" is the color of the
crosshair (default is "rgba(170, 0, 0, 0.80)"), "lineWidth" is the width of
the drawn lines (default is 1).

The plugin also adds four public methods:

  - setCrosshairs( index, pos )

    Set the position of the crosshair. Note that this is cleared if the user
    moves the mouse. "pos" is in coordinates of the plot and should be on the
    form { x: xpos, y: ypos } (you can use x2/x3/... if you're using multiple
    axes), which is coincidentally the same format as what you get from a
    "plothover" event. If "pos" is null, the crosshair is cleared.

  - clearCrosshairs( index)

    Clear the crosshair.

  - lockCrosshairs(index, pos)

    Cause the crosshair to lock to the current location, no longer updating if
    the user moves the mouse. Optionally supply a position (passed on to
    setCrosshair()) to move it to.

    Example usage:

	var myFlot = $.plot( $("#graph"), ..., { crosshair: { mode: "x" } } };
	$("#graph").bind( "plothover", function ( evt, position, item ) {
		if ( item ) {
			// Lock the crosshair to the data point being hovered
			myFlot.lockCrosshair({
				x: item.datapoint[ 0 ],
				y: item.datapoint[ 1 ]
			});
		} else {
			// Return normal crosshair operation
			myFlot.unlockCrosshair();
		}
	});

  - unlockCrosshair()

    Free the crosshair to move again after locking it.
*/

(function ($) {
    var options = {
        cursors: [
        {
            mode: null, // one of null, "x", "y" or "xy",
            color: "rgba(170, 0, 0, 0.80)",
            lineWidth: 1,
            x: -1,
            y: -1
        }
        ]
    };

    function init(plot) {
        var cursors = [];
    
        plot.hooks.processOptions.push(function (plot) {
            plot.getOptions().cursors.forEach(function(cursor) {
                var currentCursor = { x: -1, y: -1, locked: true, highlighted: false};

                currentCursor.x = cursor.x;
                currentCursor.y = cursor.y;

                cursors.push(currentCursor);
            });
        });

        plot.setCursor = function setCursor(index, pos) {
            if (!pos)
                cursors[index].x = -1;
            else {
                var o = plot.p2c(pos);
                cursors[index].x = Math.max(0, Math.min(o.left, plot.width()));
                cursors[index].y = Math.max(0, Math.min(o.top, plot.height()));
            }
            
            plot.triggerRedrawOverlay();
        };
        
        plot.clearCursor = plot.setCrosshair; // passes null for pos
        
        plot.lockCursor = function lockCursor(index, pos) {
            if (pos)
                plot.setCursor(index, pos);
            cursors[index].locked = true;
        };

        plot.unlockCursor = function unlockCursor(index) {
            cursors[index].locked = false;
        };

        function onMouseOut(e) {
            /*
            if (crosshair.locked)
                return;

            if (crosshair.x != -1) {
                crosshair.x = -1;
                plot.triggerRedrawOverlay();
            }
            */
        }

        function onMouseMove(e) {
            var offset = plot.offset();
            var mouseX = Math.max(0, Math.min(e.pageX - offset.left, plot.width()));
            var mouseY = Math.max(0, Math.min(e.pageY - offset.top, plot.height()));

            cursors.forEach(function(cursor) {
                if (cursor.locked) {
                    if ((mouseX > cursor.x-4) && (mouseX < cursor.x+4) && (mouseY > cursor.y-4) && (mouseY < cursor.y+4)) {
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
                }
            });

            /**                
            crosshair.x = Math.max(0, Math.min(e.pageX - offset.left, plot.width()));
            crosshair.y = Math.max(0, Math.min(e.pageY - offset.top, plot.height()));
            plot.triggerRedrawOverlay();
            */
        }
        
        plot.hooks.bindEvents.push(function (plot, eventHolder) {
            if (!plot.getOptions().cursors[0].mode)
                return;

            eventHolder.mouseout(onMouseOut);
            eventHolder.mousemove(onMouseMove);
        });

        plot.hooks.drawOverlay.push(function (plot, ctx) {
          var i = 0;
          cursors.forEach(function(cursor) {
            var c =  plot.getOptions().cursors[i];
            if (!c.mode)
                return;

            var plotOffset = plot.getPlotOffset();
            
            ctx.save();
            ctx.translate(plotOffset.left, plotOffset.top);

            if (cursor.x != -1) {
                var adj = plot.getOptions().cursors[i].lineWidth % 2 ? 0.5 : 0;

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
                    ctx.fillRect( Math.floor(cursor.x) + adj - 4,  Math.floor(cursor.y) + adj - 4, 8, 8);
                }
                ctx.stroke();
            }
            ctx.restore();
            i++;
          });
        });

        plot.hooks.shutdown.push(function (plot, eventHolder) {
            eventHolder.unbind("mouseout", onMouseOut);
            eventHolder.unbind("mousemove", onMouseMove);
        });
    }
    
    $.plot.plugins.push({
        init: init,
        options: options,
        name: 'cursors',
        version: '0.1'
    });
})(jQuery);
