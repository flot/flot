(function($) {

	function init(plot) {
		plot.hooks.processOptions.push(addFirstdrawBackground);
	}

	function addFirstdrawBackground(plot) {
		plot.hooks.drawBackground.push(fillBackground);
	}

	// draws the legend on the canvas, using the HTML added by flot as a guide
	function fillBackground(plot, ctx) {
		var options = plot.getOptions();
		if(!options.fillbackground) return;
		
		var canvasWidth = ctx.canvas.width;
		var canvasHeight = ctx.canvas.height;
		
		ctx.save();

		ctx.fillStyle = getColorOrGradient(options.grid.backgroundColor, canvasHeight, 0, "rgba(255, 255, 255, 0)");
		ctx.fillRect(0, 0, canvasWidth, canvasHeight);
		ctx.restore();
	}

	// Jacked from jquery.flot.js as needed to follow gradients if used.
	function getColorOrGradient(spec, bottom, top, defaultColor) {
		if (typeof spec == "string")
			return spec;
		else {
			// assume this is a gradient spec; IE currently only
			// supports a simple vertical gradient properly, so that's
			// what we support too
			var gradient = ctx.createLinearGradient(0, top, 0, bottom);

			for (var i = 0, l = spec.colors.length; i < l; ++i) {
				var c = spec.colors[i];
				if (typeof c != "string") {
					var co = $.color.parse(defaultColor);
					if (c.brightness != null)
						co = co.scale('rgb', c.brightness);
					if (c.opacity != null)
						co.a *= c.opacity;
					c = co.toString();
				}
				gradient.addColorStop(i / (l - 1), c);
			}

			return gradient;
		}
	}

	$.plot.plugins.push({
		init: init,
		options: {},
		name: 'fillcanvascolor',
		version: '1.0'
	});
})(jQuery);
