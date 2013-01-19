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

{
    canvas: boolean
}

The "canvas" option controls whether full canvas drawing is enabled, making it
possible to toggle on and off. This is useful when a plot uses HTML text in the
browser, but needs to redraw with canvas text when exporting as an image.

*/

(function($) {

	var options = {
		canvas: true
	};

	function init(plot, classes) {

		var Canvas = classes.Canvas,
			getTextInfo = Canvas.prototype.getTextInfo,
			drawText = Canvas.prototype.drawText;

		// Creates (if necessary) and returns a text info object.
		//
		// When the canvas option is set, this override returns an object
		// that looks like this:
		//
		// {
		//     lines: {
		//         height: Height of each line in the text.
		//         widths: List of widths for each line in the text.
		//         texts: List of lines in the text.
		//     },
		//     font: {
		//         definition: Canvas font property string.
		//         color: Color of the text.
		//     },
		//     dimensions: {
		//         width: Width of the text's bounding box.
		//         height: Height of the text's bounding box.
		//     }
		// }

		Canvas.prototype.getTextInfo = function(text, font, angle) {
			if (plot.getOptions().canvas) {

				var textStyle, cacheKey, info;

				// Cast the value to a string, in case we were given a number

				text = "" + text;

				// If the font is a font-spec object, generate a CSS definition

				if (typeof font === "object") {
					textStyle = font.style + " " + font.variant + " " + font.weight + " " + font.size + "px " + font.family;
				} else {
					textStyle = font;
				}

				// The text + style + angle uniquely identify the text's
				// dimensions and content; we'll use them to build this entry's
				// text cache key.

				cacheKey = text + "-" + textStyle + "-" + angle;

				info = this._textCache[cacheKey] || this._activeTextCache[cacheKey];

				if (info == null) {

					var context = this.context;

					// If the font was provided as CSS, create a div with those
					// classes and examine it to generate a canvas font spec.

					if (typeof font !== "object") {

						var element;
						if (typeof font === "string") {
							element = $("<div class='" + font + "'>" + text + "</div>")
								.appendTo(this.container);
						} else {
							element = $("<div>" + text + "</div>")
								.appendTo(this.container);
						}

						font = {
							style: element.css("font-style"),
							variant: element.css("font-variant"),
							weight: element.css("font-weight"),
							size: parseInt(element.css("font-size")),
							family: element.css("font-family"),
							color: element.css("color")
						};

						textStyle = font.style + " " + font.variant + " " + font.weight + " " + font.size + "px " + font.family;

						element.remove();
					}

					// Create a new info object, initializing the dimensions to
					// zero so we can count them up line-by-line.

					info = {
						lines: [],
						font: {
							definition: textStyle,
							color: font.color
						},
						dimensions: {
							width: 0,
							height: 0
						}
					};

					context.save();
					context.font = textStyle;

					// Canvas can't handle multi-line strings; break on various
					// newlines, including HTML brs, to build a list of lines.
					// Note that we could split directly on regexps, but IE < 9
					// is broken; revisit when we drop IE 7/8 support.

					var lines = (text + "").replace(/<br ?\/?>|\r\n|\r/g, "\n").split("\n");

					for (var i = 0; i < lines.length; ++i) {

						var lineText = lines[i],
							measured = context.measureText(lineText),
							lineWidth, lineHeight;

						lineWidth = measured.width;

						// Height might not be defined; not in the standard yet

						lineHeight = measured.height || font.size;

						// Add a bit of margin since font rendering is not
						// pixel perfect and cut off letters look bad.  This
						// also doubles as spacing between lines.

						lineHeight += Math.round(font.size * 0.15);

						info.dimensions.width = Math.max(lineWidth, info.dimensions.width);
						info.dimensions.height += lineHeight;

						info.lines.push({
							text: lineText,
							width: lineWidth,
							height: lineHeight
						});
					}

					context.restore;
				}

				// Save the entry to the 'hot' text cache, marking it as active
				// and preserving it for the next render pass.

				this._activeTextCache[cacheKey] = info;

				return info;

			} else {
				return getTextInfo.call(this, text, font, angle);
			}
		}

		// Draws a text string onto the canvas.
		//
		// When the canvas option is set, this override draws directly to the
		// canvas using fillText.

		Canvas.prototype.drawText = function(x, y, text, font, angle, halign, valign) {
			if (plot.getOptions().canvas) {

				var info = this.getTextInfo(text, font, angle),
					dimensions = info.dimensions,
					context = this.context,
					lines = info.lines;

				// Apply alignment to the vertical position of the entire text

				if (valign == "middle") {
					y -= dimensions.height / 2;
				} else if (valign == "bottom") {
					y -= dimensions.height;
				}

				context.save();

				context.fillStyle = info.font.color;
				context.font = info.font.definition;

				// TODO: Comments in Ole's implementation indicate that some
				// browsers differ in their interpretation of 'top'; so far I
				// don't see this, but it requires more testing.  We'll stick
				// with top until this can be verified.  Original comment was:

				// Top alignment would be more natural, but browsers can differ
				// a pixel or two in where they consider the top to be, so
				// instead we middle align to minimize variation between
				// browsers and compensate when calculating the coordinates.

				context.textBaseline = "top";

				for (var i = 0; i < lines.length; ++i) {

					var line = lines[i],
						linex = x;

					// Apply alignment to the horizontal position per-line

					if (halign == "center") {
						linex -= line.width / 2;
					} else if (halign == "right") {
						linex -= line.width;
					}

					// FIXME: LEGACY BROWSER FIX
					// AFFECTS: Opera < 12.00

					// Round the coordinates, since Opera otherwise
					// switches to more ugly rendering (probably
					// non-hinted) and offset the y coordinates since
					// it seems to be off pretty consistently compared
					// to the other browsers

					if (!!(window.opera && window.opera.version().split(".")[0] < 12)) {
						linex = Math.floor(linex);
						y = Math.ceil(y - 2);
					}

					context.fillText(line.text, linex, y);
					y += line.height;
				}

				context.restore();

			} else {
				drawText.call(this, x, y, text, font, angle, halign, valign);
			}
		}
	}

	$.plot.plugins.push({
		init: init,
		options: options,
		name: "canvas",
		version: "1.0"
	});

})(jQuery);
