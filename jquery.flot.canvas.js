/* Flot plugin for drawing all elements of a plot on the canvas.

Copyright (c) 2007-2012 IOLA and Ole Laursen.
Licensed under the MIT license.

Flot normally produces certain elements, like axis labels and the legend, using
HTML elements. This permits greater interactivity and customization, and often
looks better, due to cross-browser canvas text inconsistencies and limitations.

It can also be desirable to render the plot entirely in canvas, particularly
if the goal is to save it as an image, or if Flot is being used in a context
where the HTML DOM does not exist, as is the case within Node.js. This plugin
switches out Flot's standard drawing operations for canvas-only replacements.

Currently the plugin supports only axis labels, but it will eventually allow
every element of the plot to be rendered directly to canvas.

The plugin supports these options:

    canvas: boolean,
    xaxis, yaxis: {
        font: null or font spec object
    }

The top-level "canvas" option controls whether  full canvas drawing is enabled,
making it easy to toggle on and off.

By default the plugin extracts font settings from the same CSS styles that the
default HTML text implementation uses. If *.tickLabel* has a *font-size* of
20px, then the canvas text will be drawn at the same size.

One can also use the "font" option to control these properties directly. The
format of the font spec object is as follows:

    {
        size: 11,
        style: "italic",
        weight: "bold",
        family: "sans-serif",
        variant: "small-caps"
    }

*/

(function($) {

	var options = {
		canvas: true,
		xaxis: {
			font: null
		},
		yaxis: {
			font: null
		}
	};

	function init(plot) {

	}

	$.plot.plugins.push({
		init: init,
		options: options,
		name: "canvas",
		version: "1.0"
	});

})(jQuery);
