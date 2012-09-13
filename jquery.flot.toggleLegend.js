/*

	Allows series to be toggled using their entries in the chart legend.
	Supports series groups.

	Usage:


 */

(function ( $ ) {

	var options = {
			series: {
				toggle: {
					enabled: true,
					visual: true
				}
			}
		},
		setupSwatch = function ( swatch ) {

			swatch.data("flotcolor", swatch.find("div div").css("border-color"));

			console.log(swatch.data("flotcolor"));

		},
		toggleSwatch = function ( swatch, show ) {

			if ( show ) {

				swatch.find("div div").css("border-color", swatch.data("flotcolor"));

			} else {

				swatch.find("div div").css("border-color", "transparent");

			}

		},
		init = function ( plot ) {

			plot.hooks.legendInserted.push(function ( plot, legend ) {

				// Get all the legend cells
				var cells = legend.find("td"),
					entries = [];

				// Split into objects containing each legend item's
				// colour box and label.
				for ( var i = 0; i < cells.length; i+=2 ) {
					entries.push({
						swatch: $(cells[i]),
						label: $(cells[i+1])
					});
				}

				for ( var e in entries ) {

					setupSwatch(entries[e].swatch);

				}

				legend
					.unbind("click.flot")
					.bind("selectstart", function ( e ) {

						e.preventDefault();

						return false;

					})
					.bind("click.flot", function ( e ) {

						var el = $(e.target),
							cell,
							label,
							swatch,
							isCell = el.is("td");

						if ( isCell || (el.parents("td").length) ) {

							cell = ( isCell ? el : el.parents("td") );

							// Acquire the label and colour swatch of whatever
							// legend item the user just clicked.
							if ( cell.hasClass("legendLabel") ) {

								label = cell;
								swatch = cell.prev(".legendColorBox");

							} else {

								label = cell.next(".legendLabel");
								swatch = cell;

							}

						}

						if ( label.hasClass("flotSeriesHidden") ) {

							label.removeClass("flotSeriesHidden");
							toggleSwatch(swatch, true);

						} else {

							label.addClass("flotSeriesHidden");
							toggleSwatch(swatch);

						}

					})
					.find("td").css("cursor", "pointer");

			});

		};

	$.plot.plugins.push({
		init: init,
		options: options,
		name: 'toggleLegend',
		version: '1.0'
	});

}(jQuery));