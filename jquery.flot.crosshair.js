/*
Flot plugin for showing a crosshair, thin lines, when the mouse hovers
over the plot.

  crosshair: {
    mode: null or "x" or "y" or "xy"
    color: color
  }

Set the mode to one of "x", "y" or "xy". The "x" mode enables a
vertical crosshair that lets you trace the values on the x axis, "y"
enables a horizontal crosshair and "xy" enables them both. "color" is
the color of the crosshair (default is "rgba(170, 0, 0, 0.80)")

The plugin also adds two public methods:

  - setCrosshair(pos)

    Set the position of the crosshair. Note that this is cleared if
    the user moves the mouse. "pos" should be on the form { x: xpos,
    y: ypos } (or x2 and y2 if you're using the secondary axes), which
    is coincidentally the same format as what you get from a "plothover"
    event. If "pos" is null, the crosshair is cleared.

  - clearCrosshair()

    Clear the crosshair.

*/

(function ($) {
    var options = {
        crosshair: {
            mode: null, // one of null, "x", "y" or "xy",
            color: "rgba(170, 0, 0, 0.80)"
        }
    };
    
    function init(plot) {
        // position of crosshair in pixels
        var crosshair = { x: -1, y: -1 };

        plot.setCrosshair = function setCrosshair(pos) {
            if (!pos)
                crosshair.x = -1;
            else {
                var axes = plot.getAxes();
                
                crosshair.x = Math.max(0, Math.min(pos.x != null ? axes.xaxis.p2c(pos.x) : axes.x2axis.p2c(pos.x2), plot.width()));
                crosshair.y = Math.max(0, Math.min(pos.y != null ? axes.yaxis.p2c(pos.y) : axes.y2axis.p2c(pos.y2), plot.height()));
            }
            
            plot.triggerRedrawOverlay();
        };
        
        plot.clearCrosshair = plot.setCrosshair; // passes null for pos
        
        plot.hooks.bindEvents.push(function (plot, eventHolder) {
            if (!plot.getOptions().crosshair.mode)
                return;

            eventHolder.mouseout(function () {
                if (crosshair.x != -1) {
                    crosshair.x = -1;
                    plot.triggerRedrawOverlay();
                }
            });
            
            eventHolder.mousemove(function (e) {
                if (!plot.getSelection()) {
                    var offset = plot.offset();
                    crosshair.x = Math.max(0, Math.min(e.pageX - offset.left, plot.width()));
                    crosshair.y = Math.max(0, Math.min(e.pageY - offset.top, plot.height()));
                    plot.triggerRedrawOverlay();
                }
                else
                    crosshair.x = -1; // hide the crosshair while selecting
            });
        });

        plot.hooks.drawOverlay.push(function (plot, ctx) {
            var c = plot.getOptions().crosshair;
            if (!c.mode)
                return;

            var plotOffset = plot.getPlotOffset();
            
            ctx.save();
            ctx.translate(plotOffset.left, plotOffset.top);

            if (crosshair.x != -1) {
                ctx.strokeStyle = c.color;
                ctx.lineWidth = 1;
                ctx.lineJoin = "round";

                ctx.beginPath();
                if (c.mode.indexOf("x") != -1) {
                    ctx.moveTo(crosshair.x, 0);
                    ctx.lineTo(crosshair.x, plot.height());
                }
                if (c.mode.indexOf("y") != -1) {
                    ctx.moveTo(0, crosshair.y);
                    ctx.lineTo(plot.width(), crosshair.y);
                }
                ctx.stroke();
            }
            ctx.restore();
        });
    }
    
    $.plot.plugins.push({
        init: init,
        options: options,
        name: 'crosshair',
        version: '1.0'
    });
})(jQuery);
