/* jquery.flot.touch 3
Plugin for Flot version 0.8.3.
Allows to use touch for pan / zoom and simulate tap, double tap as mouse clicks so other plugins can work as usual with a touch device.

https://github.com/chaveiro/flot.touch

Copyright (c) 2015 Chaveiro - Licensed under the MIT license.

Plugin triggers this events : touchstarted, touchended, tap and dbltap

If option simulClick is true the plugin will generate a simulated Mouse click event to browser on tap or double tap. 
                
Use as follow:
    $("#graph").bind("touchstarted", function (event, pos)
    {
        var x = pos.x; 
        var y = pos.y;
        // add code to act on touched point
    });
    
    $("#graph").bind("touchended", function (event, ranges)
    {
        var xstart = ranges.xaxis.from; 
        var xend = ranges.xaxis.to;
        // add code to get json data then plot again with latest data
    });
    
    $("#graph").bind("tap", function (event, pos)
    {
        var x = pos.x; 
        var y = pos.y;
        // add code to act on tap point
    });
    
    $("#graph").bind("dbltap", function (event, pos)
    {
        var x = pos.x; 
        var y = pos.y;
        // add code to act on double tap point
    });
*/

(function($) {

    function init(plot) {
        // Detect touch support
        $.support.touch = 'ontouchend' in document;
        if (!$.support.touch) {
            return;    // Ignore browsers without touch support
        }

        var isPanning = false;
        var isZooming = false;
        var lastTouchPosition = { x: -1, y: -1 };
        var startTouchPosition = lastTouchPosition;
        var lastTouchDistance = 0;
        var relativeOffset = { x: 0, y: 0};
        var relativeScale = 1.0;
        var scaleOrigin = { x: 50, y: 50 };
        var lastRedraw= new Date().getTime();
        var eventdelayTouchEnded;
        
        var tapNum = 0;
        var tapTimer, tapTimestamp;

        function pan(delta) {
            var placeholder = plot.getPlaceholder();
            var options = plot.getOptions();

            relativeOffset.x -= delta.x;
            relativeOffset.y -= delta.y;

            if (!options.touch.css) {
                return; // no css updates
            }

            switch (options.touch.pan.toLowerCase()) {
                case 'x':
                    placeholder.css('transform', 'translateX(' + relativeOffset.x + 'px)');
                    break;
                case 'y':
                    placeholder.css('transform', 'translateY(' + relativeOffset.y + 'px)');
                    break;
                default:
                    placeholder.css('transform', 'translate(' + relativeOffset.x + 'px,' + relativeOffset.y + 'px)');
                    break;
            }
        }

        function scale(delta) {
            var placeholder = plot.getPlaceholder();
            var options = plot.getOptions();

            relativeScale *= 1 + (delta / 100);

            if (!options.touch.css) {
                return; // no css updates
            }

            switch (options.touch.scale.toLowerCase()) {
                case 'x':
                    placeholder.css('transform', 'scaleX(' + relativeScale + ')');
                    break;
                case 'y':
                    placeholder.css('transform', 'scaleY(' + relativeScale + ')');
                    break;
                default:
                    placeholder.css('transform', 'scale(' + relativeScale + ')');
                    break;
            }
        }

        function processOptions(plot, options) {
            var placeholder = plot.getPlaceholder();
            var options = plot.getOptions();
            
            if (options.touch.autoWidth) {
                placeholder.css('width', '100%');
            }

            if (options.touch.autoHeight) {
                var placeholderParent = placeholder.parent();
                var height = 0;

                placeholderParent.siblings().each(function() {
                    height -= $(this).outerHeight();
                });

                height -= parseInt(placeholderParent.css('padding-top'), 10);
                height -= parseInt(placeholderParent.css('padding-bottom'), 10);
                height += window.innerHeight;

                placeholder.css('height', (height <= 0) ? 100 : height + 'px');
            }
        }

        function getTimestamp() {
            return new Date().getTime();
        }
    
        function bindEvents(plot, eventHolder) {
            var placeholder = plot.getPlaceholder();
            var options = plot.getOptions();
            
            if (options.touch.css) {
                placeholder.parent('div').css({'overflow': 'hidden'});
            }

            placeholder.bind('touchstart', function(evt) {
                clearTimeout(eventdelayTouchEnded); // cancel pending event
                var touches = evt.originalEvent.touches;
                var placeholder = plot.getPlaceholder();
                var options = plot.getOptions();

                // remember initial axis dimensions
                $.each(plot.getAxes(), function(index, axis) {
                    if (axis.direction === options.touch.scale.toLowerCase() || options.touch.scale.toLowerCase() == 'xy') {
                        axis.touch = {
                            min: axis.min,
                            max: axis.max,
                        }
                    }
                });

                tapTimestamp = getTimestamp();
                if (touches.length === 1) {
                    isPanning = true;
                    lastTouchPosition = {
                        x: touches[0].pageX,
                        y: touches[0].pageY
                    };
                    lastTouchDistance = 0;
                    tapNum++;
                }
                else if (touches.length === 2) {
                    isZooming = true;
                    lastTouchPosition = {
                        x: (touches[0].pageX + touches[1].pageX) / 2,
                        y: (touches[0].pageY + touches[1].pageY) / 2
                    };
                    lastTouchDistance = Math.sqrt(Math.pow(touches[1].pageX - touches[0].pageX, 2) + Math.pow(touches[1].pageY - touches[0].pageY, 2));
                }

                var offset = placeholder.offset();
                var rect = {
                    x: offset.left,
                    y: offset.top,
                    width: placeholder.width(),
                    height: placeholder.height()
                };
                startTouchPosition = {
                    x: lastTouchPosition.x,
                    y: lastTouchPosition.y
                };

                if (startTouchPosition.x < rect.x) {
                    startTouchPosition.x = rect.x;
                }
                else if (startTouchPosition.x > rect.x + rect.width) {
                    startTouchPosition.x = rect.x + rect.width;
                }

                if (startTouchPosition.y < rect.y) {
                    startTouchPosition.y = rect.y;
                }
                else if (startTouchPosition.y > rect.y + rect.height) {
                    startTouchPosition.y = rect.y + rect.height;
                }

                scaleOrigin = {
                    x: Math.round((startTouchPosition.x / rect.width) * 100),
                    y: Math.round((startTouchPosition.y / rect.height) * 100)
                };
                
                if (options.touch.css) {
                    placeholder.css('transform-origin', scaleOrigin.x + '% ' + scaleOrigin.y + '%');
                }
                
                placeholder.trigger("touchstarted", [ startTouchPosition ]);
                // return false to prevent touch scrolling.
                return false;
            });

            placeholder.bind('touchmove', function(evt) {
                var options = plot.getOptions();
                var touches = evt.originalEvent.touches;
                var position, distance, delta;

                if (isPanning && touches.length === 1) {
                    position = {
                        x: touches[0].pageX,
                        y: touches[0].pageY
                    };
                    delta = {
                        x: lastTouchPosition.x - position.x,
                        y: lastTouchPosition.y - position.y
                    };

                    // transform via the delta
                    pan(delta);

                    lastTouchPosition = position;
                    lastTouchDistance = 0;
                }
                else if (isZooming && touches.length === 2) {
                    distance = Math.sqrt(Math.pow(touches[1].pageX - touches[0].pageX, 2) + Math.pow(touches[1].pageY - touches[0].pageY, 2));
                    position = {
                        x: (touches[0].pageX + touches[1].pageX) / 2,
                        y: (touches[0].pageY + touches[1].pageY) / 2
                    };
                    delta = distance - lastTouchDistance;

                    // scale via the delta
                    scale(delta);

                    lastTouchPosition = position;
                    lastTouchDistance = distance;
                }
                
                if (!options.touch.css) {  // no css updates
                    var now = new Date().getTime(),
                    framedelay = now - lastRedraw; // ms for each update
                    if (framedelay > 50) {
                        lastRedraw = now;
                        window.requestAnimationFrame(redraw);
                    }
                } 
            });

            placeholder.bind('touchend', function(evt) {
                var placeholder = plot.getPlaceholder();
                var options = plot.getOptions();
                var touches = evt.originalEvent.changedTouches;

                // reset the tap counter
                tapTimer = setTimeout(function() { tapNum = 0; }, options.touch.dbltapThreshold);  
                // check if tap or dbltap
                if (isPanning && touches.length === 1 && (tapTimestamp + options.touch.tapThreshold) - getTimestamp() >= 0 &&
                    startTouchPosition.x >= lastTouchPosition.x - options.touch.tapPrecision &&
                    startTouchPosition.x <= lastTouchPosition.x + options.touch.tapPrecision &&
                    startTouchPosition.y >= lastTouchPosition.y - options.touch.tapPrecision &&
                    startTouchPosition.y <= lastTouchPosition.y + options.touch.tapPrecision)
                {
                    //Fire plugin Tap event
                    if (tapNum === 2) { 
                        placeholder.trigger("dbltap", [ lastTouchPosition ]); 
                    } else { 
                        placeholder.trigger("tap", [ lastTouchPosition ]); 
                    }

                    if (options.touch.simulClick) {
                        // Simulate mouse click event
                        // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/MouseEvent
                        var simulatedEvent = new MouseEvent("click", {
                            bubbles: true,
                            cancelable: true,
                            view: window,
                            detail: tapNum, // num of clicks
                            screenX: touches[0].screenX,
                            screenY: touches[0].screenY,
                            clientX: touches[0].clientX,
                            clientY: touches[0].clientY,
                            button: 0  // left mouse button
                        });
                        touches[0].target.dispatchEvent(simulatedEvent);
                    }
                }
                else 
                {
                    var r = {};
                    c1 = { x: 0, y: 0};
                    c2 = { x: plot.width(), y: plot.height()};
                    $.each(plot.getAxes(), function (name, axis) {
                        if (axis.used) {
                            var p1 = axis.c2p(c1[axis.direction]), p2 = axis.c2p(c2[axis.direction]); 
                            r[name] = { from: Math.min(p1, p2), to: Math.max(p1, p2) };
                        }
                    });

                    eventdelayTouchEnded = setTimeout(function(){ placeholder.trigger("touchended", [ r ]); }, options.touch.delayTouchEnded);
                }
        
                isPanning = false;
                isZooming = false;
                lastTouchPosition = { x: -1, y: -1 };
                startTouchPosition = lastTouchPosition;
                lastTouchDistance = 0;
                relativeOffset = { x: 0, y: 0 };
                relativeScale = 1.0;
                scaleOrigin = { x: 50, y: 50 };
                
                if (options.touch.css) {
                    placeholder.css({
                        'transform': 'translate(' + relativeOffset.x + 'px,' + relativeOffset.y + 'px) scale(' + relativeScale + ')',
                        'transform-origin': scaleOrigin.x + '% ' + scaleOrigin.y + '%'
                    });
                }
                

            });

        }

        function redraw() {
            var options = plot.getOptions();
            updateAxesMinMax();

            if (typeof options.touch.callback == 'function') {
                options.touch.callback();
            }
            else {
                plot.setupGrid();
                plot.draw();
            }
        }


        function updateAxesMinMax() {
            var options = plot.getOptions();

            // Apply the pan.
            if (relativeOffset.x !== 0 || relativeOffset.y !== 0) {
                $.each(plot.getAxes(), function(index, axis) {
                    if (axis.direction === options.touch.pan.toLowerCase() || options.touch.pan.toLowerCase() == 'xy') {
                        var min = axis.c2p(axis.p2c(axis.touch.min) - relativeOffset[axis.direction]);
                        var max = axis.c2p(axis.p2c(axis.touch.max) - relativeOffset[axis.direction]);

                        axis.options.min = min;
                        axis.options.max = max;
                    }
                });
            }

            // Apply the scale.
            if (relativeScale !== 1.0) {
                var width = plot.width();
                var height = plot.height();
                var scaleOriginPixel = {
                        x: Math.round((scaleOrigin.x / 100) * width),
                        y: Math.round((scaleOrigin.y / 100) * height)
                    };
                var range = {
                        x: {
                            min: scaleOriginPixel.x - (scaleOrigin.x / 100) * width / relativeScale,
                            max: scaleOriginPixel.x + (1 - (scaleOrigin.x / 100)) * width / relativeScale
                        },
                        y: {
                            min: scaleOriginPixel.y - (scaleOrigin.y / 100) * height / relativeScale,
                            max: scaleOriginPixel.y + (1 - (scaleOrigin.y / 100)) * height / relativeScale
                        }
                    };

                $.each(plot.getAxes(), function(index, axis) {
                    if (axis.direction === options.touch.scale.toLowerCase() || options.touch.scale.toLowerCase() == 'xy') {
                        var min = axis.c2p(range[axis.direction].min);
                        var max = axis.c2p(range[axis.direction].max);

                        if (min > max) {
                            var temp = min;
                            min = max;
                            max = temp;
                        }

                        axis.options.min = min;
                        axis.options.max = max;
                    }
                });
            }
        }


        
        function processDatapoints(plot, series, datapoints) {
            if (window.devicePixelRatio) {
                var placeholder = plot.getPlaceholder();
                placeholder.children('canvas').each(function(index, canvas) {
                    var context = canvas.getContext('2d');
                    var width = $(canvas).attr('width');
                    var height = $(canvas).attr('height');

                    $(canvas).attr('width', width * window.devicePixelRatio);
                    $(canvas).attr('height', height * window.devicePixelRatio);
                    $(canvas).css('width', width + 'px');
                    $(canvas).css('height', height + 'px');

                    context.scale(window.devicePixelRatio, window.devicePixelRatio);
                });
            }
        }
        
        function shutdown(plot, eventHolder) {
            var placeholder = plot.getPlaceholder();
            placeholder.unbind('touchstart').unbind('touchmove').unbind('touchend');
        }

        plot.hooks.processOptions.push(processOptions);
        plot.hooks.bindEvents.push(bindEvents);
        //plot.hooks.processDatapoints.push(processDatapoints); // For retina, slow on android
        plot.hooks.shutdown.push(shutdown);
    }

    $.plot.plugins.push({
        init: init,
        options: {
            touch: {
                pan: 'xy',              // what axis pan work
                scale: 'xy',            // what axis zoom work
                css: false,             // use css instead of redraw the graph (ugly!)
                autoWidth: false,
                autoHeight: false,
                delayTouchEnded: 500,   // delay in ms before touchended event is fired if no more touches
                callback: null,         // other plot draw callback
                simulClick: true,       // plugin will generate Mouse click event to brwoser on tap or double tap
                tapThreshold:150,       // range of time where a tap event could be detected
                dbltapThreshold:200,    // delay needed to detect a double tap
                tapPrecision:60/2       // tap events boundaries ( 60px square by default )
            }
        },
        name: 'touch',
        version: '3.0'
    });
})(jQuery);
