/*
Flot plugin for showing crosshairs, thin lines, when the mouse hovers
over the plot.

  crosshair: {
    mode: null or "x" or "y" or "xy"
    color: color
    lineWidth: number
    lineStyle : "solid" or "dashed"
  }

Set the mode to one of "x", "y" or "xy". The "x" mode enables a
vertical crosshair that lets you trace the values on the x axis, "y"
enables a horizontal crosshair and "xy" enables them both. "color" is
the color of the crosshair (default is "rgba(170, 0, 0, 0.80)"),
"lineWidth" is the width of the drawn lines (default is 1).
"lineStyle" is to choose a solid line or a dashed line
The plugin also adds four public methods:

  - setCrosshair(pos)

    Set the position of the crosshair. Note that this is cleared if
    the user moves the mouse. "pos" is in coordinates of the plot and
    should be on the form { x: xpos, y: ypos } (you can use x2/x3/...
    if you're using multiple axes), which is coincidentally the same
    format as what you get from a "plothover" event. If "pos" is null,
    the crosshair is cleared.

  - clearCrosshair()

    Clear the crosshair.

  - lockCrosshair(pos)

    Cause the crosshair to lock to the current location, no longer
    updating if the user moves the mouse. Optionally supply a position
    (passed on to setCrosshair()) to move it to.

    Example usage:
      var myFlot = $.plot( $("#graph"), ..., { crosshair: { mode: "x" } } };
      $("#graph").bind("plothover", function (evt, position, item) {
        if (item) {
          // Lock the crosshair to the data point being hovered
          myFlot.lockCrosshair({ x: item.datapoint[0], y: item.datapoint[1] });
        }
        else {
          // Return normal crosshair operation
          myFlot.unlockCrosshair();
        }
      });

  - unlockCrosshair()

    Free the crosshair to move again after locking it.
*/

(function ($) {
    var options = {
        crosshair: {
            mode: null, // one of null, "x", "y" or "xy",
            color: "rgba(170, 0, 0, 0.80)",
            lineWidth: 1,
            lineStyle : "solid"
        }
    };
    
    function init(plot) {
        // position of crosshair in pixels
        var crosshair = { x: -1, y: -1, locked: false };

        plot.setCrosshair = function setCrosshair(pos) {
            if (!pos)
                crosshair.x = -1;
            else {
                var o = plot.p2c(pos);
                crosshair.x = Math.max(0, Math.min(o.left, plot.width()));
                crosshair.y = Math.max(0, Math.min(o.top, plot.height()));
            }
            
            plot.triggerRedrawOverlay();
        };
        
        plot.clearCrosshair = plot.setCrosshair; // passes null for pos
        
        plot.lockCrosshair = function lockCrosshair(pos) {
            if (pos)
                plot.setCrosshair(pos);
            crosshair.locked = true;
        }

        plot.unlockCrosshair = function unlockCrosshair() {
            crosshair.locked = false;
        }

        function onMouseOut(e) {
            if (crosshair.locked)
                return;

            if (crosshair.x != -1) {
                crosshair.x = -1;
                plot.triggerRedrawOverlay();
            }
        }

        function onMouseMove(e) {
            if (crosshair.locked)
                return;
                
            if (plot.getSelection && plot.getSelection()) {
                crosshair.x = -1; // hide the crosshair while selecting
                return;
            }
                
            var offset = plot.offset();
            crosshair.x = Math.max(0, Math.min(e.pageX - offset.left, plot.width()));
            crosshair.y = Math.max(0, Math.min(e.pageY - offset.top, plot.height()));
            plot.triggerRedrawOverlay();
        }
        
        plot.hooks.bindEvents.push(function (plot, eventHolder) {
            if (!plot.getOptions().crosshair.mode)
                return;

            eventHolder.mouseout(onMouseOut);
            eventHolder.mousemove(onMouseMove);
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
                ctx.lineJoin = "round";
                ctx.lineWidth = c.lineWidth;


                ctx.beginPath();
                if (c.mode.indexOf("x") != -1) {

                    //dashed
                    if(c.lineStyle=="dashed"){
                        var n=0;
                        ctx.moveTo(crosshair.x, 0);
                        while(n<plot.height()){
                            ctx.lineTo(crosshair.x, 10+n*10);
                            ctx.moveTo(crosshair.x, 20+n*10);
                            n+=2;
                        }
                    }

                    //plain
                    if(c.lineStyle=="solid"){
                      ctx.moveTo(crosshair.x, 0);
                      ctx.lineTo(crosshair.x, plot.height());
                    }
                }
                if (c.mode.indexOf("y") != -1) {

                    //dashed
                    if(c.lineStyle=="dashed"){
                        var n=0;
                        ctx.moveTo(0, crosshair.y);
                        while(n<plot.width()){
                            ctx.lineTo(10+n*10, crosshair.y);
                            ctx.moveTo(20+n*10, crosshair.y);
                            n+=2;
                        }
                    }

                    //plain
                    if(c.lineStyle=="solid"){
                        ctx.moveTo(0, crosshair.y);
                        ctx.lineTo(plot.width(), crosshair.y);
                    }
                }
                ctx.stroke();
            }
            ctx.restore();
        });

        plot.hooks.shutdown.push(function (plot, eventHolder) {
            eventHolder.unbind("mouseout", onMouseOut);
            eventHolder.unbind("mousemove", onMouseMove);
        });
    }
    
    $.plot.plugins.push({
        init: init,
        options: options,
        name: 'crosshair',
        version: '1.1'
    });
})(jQuery);
