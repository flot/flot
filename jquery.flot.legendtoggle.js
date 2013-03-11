/* Flot plugin for toggling data set display via the legend.  Adds a toggle all option.
 *
 * This plugin supports the following options:
 *
 * chipToggle: true or false (defaults to false)
 * series: {
 *   show: true or false (defaults to true)
 * }
 *
 * As a part of this, you need my modified version of jquery.flot.js as well, as it does two things: 
 *
 * 1) Adds ids to the legend chips so that we can match legend to dataset (perhaps not elegant, but workable)
 * 2) Adds logic for if the series display is set to true it will go through and attempt to draw the appropriate graphs (line, bar, etc).  If it is set to false, it doesn't try.  This way we don't muck up your settings for bar / line / etc
 *
 * Feedback welcomed, breaking it (with bug reports, of course) welcomed as well!

*/

(function ($) {

	function init(plot) {

		function chipToggle(plot, eventHolder) {
				var display_all = '<tr><td id="display_all" class="legendColorBox"><div style="border:1px solid ' + plot.getOptions().legend.labelBoxBorderColor + ';padding:1px"><div style="width:4px;height:0;border:5px solid #CCCCCC;overflow:hidden"></div></div></td>' + '<td class="legendLabel">Toggle All</td></tr>';

				if (plot.getOptions().legend.container == null) {
					$('.legend table').append(display_all);
				} else {
					$(plot.getOptions().legend.container).children('table').append(display_all);
				}

				$('.legendColorBox').click(function(){
					var my_id = $(this).attr('id');
					var pattern = new RegExp('[0-9]+');
					var selected  = pattern.exec(my_id);
					if (my_id === 'display_all') {
						for (var i = 0; i < plot.getData().length; ++i) {
							plot.getData()[i].show = !plot.getData()[i].show;
						}
					} else {
						plot.getData()[selected].show = !plot.getData()[selected].show;
					}
					plot.draw();
				});
		}

		//Not the greatest place but I want to muck as little as possible with the base jquery.
		plot.hooks.bindEvents.push(chipToggle);
	}

	var options = {
		chipToggle: false,
	};

	$.plot.plugins.push({
		init: init,
		options: options,
		name: 'legendtoggle',
		version: '1.0'
	});
})(jQuery);
