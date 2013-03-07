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
		state = {
			add: function ( plot, label ) {

				var placeholder = $(plot.getPlaceholder()),
					data = placeholder.data("togglestates");

				if ( !$.isArray(data) ) {

					data = [ ];

				}

				if ( $.inArray(label, data) === -1 ) {

					data.push(label);

				}

				placeholder.data("togglestates", data);

			},
			remove: function ( plot, label ) {

				var placeholder = $(plot.getPlaceholder()),
					data = placeholder.data("togglestates");

				if ( $.isArray(data) ) {

					if ( $.inArray(label, data) > -1 ) {

						data.splice($.inArray(label, data), 1);
						placeholder.data("togglestates", data);

					}

				}

			}
		},
		toggle = function ( el, plot, datasets ) {

			var cell,
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

		},
		setupSwatch = function ( swatch ) {

			swatch.data("flotcolor", swatch.find("div div").css("border-top-color"));

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
					state.add(plot, label);
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
						state.remove(plot, label);
						break;

					}

				}

			}

			datasets.visible = outDataset;

			redraw(plot, datasets);

		},
		init = function ( _plot ) {

			var datasets = { },
				initDraw = false,
				legend;

			_plot.hooks.draw.push(function ( _plot ) {

				var placeholder, toggleStates, lenToggleStates, i;

				if ( !initDraw ) {

					placeholder = $(_plot.getPlaceholder());
					toggleStates = [ ];

					// This stops the calls to draw from creating an infinite loop
					initDraw = true;


					// Look for an existing toggleLegend config
					if ( $.isArray(placeholder.data("togglestates")) ) {

						toggleStates = placeholder.data("togglestates");

						lenToggleStates = toggleStates.length;

						// Initialise the line states
						for ( i = 0; i < lenToggleStates; i++ ) {

							//hideSeries(toggleStates[i], _plot, datasets);
							// Find the corresponding legend entry and click it!
							// (Yucky!)
							toggle(legend.find("td").filter(function ( ) {

								return $(this).text() === toggleStates[i];

							}), _plot, datasets);

						}

					} else {

						placeholder.data("togglestates", toggleStates);

					}

				}

			});

			_plot.hooks.legendInserted.push(function ( _plot, _legend ) {

				var plot = _plot,
					toggleStates = [ ],
					cells = _legend.find("td"),
					entries = [ ];

				datasets = {
					visible: plot.getData(),
					toggle: [ ],
					all: plot.getData().slice()
				};

				legend = _legend;

				// Split into objects containing each legend item's
				// colour box and label.
				for ( var i = 0; i < cells.length; i += 2 ) {

					entries.push({
						swatch: $(cells[i]),
						label: $(cells[i + 1])
					});

				}

				for ( var e in entries ) {

					if ( entries.hasOwnProperty(e) ) {

						setupSwatch(entries[e].swatch);

					}

				}

				legend
					.unbind("click.flot")
					.bind("selectstart", function ( e ) {

						e.preventDefault();

						return false;

					})
					.bind("click.flot", function ( e ) {

						toggle($(e.target), plot, datasets);

					})
					.find("td").css("cursor", "pointer");

			});

		};

	$.plot.plugins.push({
		init: init,
		options: options,
		name: 'toggleLegend',
		version: '0.3'
	});

}(jQuery));
