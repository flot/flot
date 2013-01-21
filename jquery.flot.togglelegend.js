/*

	Allows series to be toggled using their entries in the chart legend.
	Supports series groups.

	TODO:
	 * Allow toggling to be disabled for individual series
	 * Disable visual feedback (usually so dev can implement their own)


 */

(function ( $ ) {

	var options = {
			series: {
				toggle: {
					enabled: true
				}
			}
		},
		setupSwatch = function ( swatch ) {

			swatch.data("flotcolor", swatch.find("div div").css("border-color"));

		},
		toggleSwatch = function ( swatch, show ) {

			if ( show ) {

				swatch.find("div div").css("border-color", swatch.data("flotcolor"));

			} else {

				swatch.find("div div").css("border-color", "transparent");

			}

		},
		redraw = function ( plot, datasets ) {

			plot.setData(datasets.visible);
			plot.draw();

		},
		getSeries = function ( label, datasets ) {

			for ( var i = 0; i < datasets.all.length; i++ ) {

				if ( datasets.all[i].label === label ) {

					return datasets.all[i];

				}

			}

		},
		hideSeries = function ( label, plot, datasets ) {

			for ( var i = 0; i < datasets.visible.length; i++ ) {

				if ( datasets.visible[i].label === label ) {
	
					// Hide this series
					datasets.visible.splice(i, 1);
					break;

				}

			}

			redraw(plot, datasets);

		},
		showAll = function ( ) {
			plot.setData(datasets.all);
		},
		showSeries = function ( label, plot, datasets ) {

			var i, j,
				outDataset = [];

			// Find the series we want to show
			for ( var i = 0; i < datasets.all.length; i++ ) {

				if ( datasets.all[i].label === label ) {

					datasets.visible.push(datasets.all[i]);

				}

			}

			// Sometimes the order of items in the datasets array is important
			// (especially when lines or areas overlap one another)
			for ( i = 0; i < datasets.all.length; i++ ) {

				for ( j = 0; j < datasets.visible.length; j++ ) {

					if ( datasets.all[i].label === datasets.visible[j].label ) {

						outDataset.push(datasets.all[i]);
						break;

					}

				}

			}

			datasets.visible = outDataset;

			redraw(plot, datasets);

		},
		init = function ( _plot ) {

			_plot.hooks.legendInserted.push(function ( _plot, legend ) {

				// Get all the legend cells
				var cells = legend.find("td"),
					entries = [],
					datasets;

				var plot = _plot;

				var datasets = {
					visible: plot.getData(),
					toggle: [],
					all: plot.getData().slice()
				};

				// Split into objects containing each legend item's
				// colour box and label.
				for ( var i = 0; i < cells.length; i += 2 ) {
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

							var series = getSeries(label.text(), datasets);

							if ( series.toggle.enabled ) {

								if ( label.hasClass("flotSeriesHidden") ) {

									label.removeClass("flotSeriesHidden");
									toggleSwatch(swatch, true);
									showSeries(label.text(), plot, datasets);

								} else {

									label.addClass("flotSeriesHidden");
									toggleSwatch(swatch);
									hideSeries(label.text(), plot, datasets);

								}

							}

						}

					})
					.find("td").css("cursor", "pointer");

			});

		};

	$.plot.plugins.push({
		init: init,
		options: options,
		name: 'toggleLegend',
		version: '0.1'
	});

}(jQuery));