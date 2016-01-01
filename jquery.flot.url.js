/* Flot plugin for specifying data by URL

Copyright (c) 2016 Matwey V. Kornilov
Licensed under the MIT license.

Plugin to fetch the data using AJAX. The following plot options are supported:

    url {
        ajax: { ... }
    }

Where url.ajax is default AJAX options.
Refer http://api.jquery.com/jquery.ajax/#jQuery-ajax-settings for details.

The series are specified as the following:

    { ...,
        url: {
            ajax: {
                url: "http://example.com/data.json",
                ...
            },
            decode: function(data) { ... },
        },
        data: null
    }

Where url.ajax is AJAX options.
Refer http://api.jquery.com/jquery.ajax/#jQuery-ajax-settings for details.
The single one exception here is that url.ajax.url can also be a function:

    url: function(plot) { ... }

An idea behind is that user may calculate URL considering plot options which are subject to change.

url.decode is a function converting received object to the Flot format: [ [x1,y1], [x2,y2], ... ]
If the option is ommited then the data are passed as is.

*/

(function ($) {
    var options = {
        url: {
            ajax: {
                type: "GET",
                dataType: "json",
            },
        },
        series: {
            url: {
                XHR: null,
                fetched_url: null,
            },
        },
    };

    function evalUrl(url, plot) {
        if (typeof url === "function")
            return url(plot);
        return url;
    };

    function processRawData(plot, series, data, datapoints) {
        var x = data;
        if (!x.url) { return; }
        
        var ajax = $.extend(true, plot.getOptions().url.ajax, x.url.ajax);
        ajax.url = evalUrl(ajax.url, plot);

        if (series.url.fetched_url == ajax.url)
            return ;
        if (series.url.XHR) {
            series.url.XHR.abort();
            series.url.XHR = null;
        }

        series.url.fetched_url = ajax.url;
        series.url.XHR = $.ajax(ajax).done(function(data, textStatus, jqXHR) {
            var series = plot.getData();
            for (x in series)
                if (series[x].url.fetched_url == ajax.url) {
                    var decoder = series[x].data.url.decode;
                    series[x] = $.extend(true, series[x], series[x].data);
                    series[x].data = decoder ? decoder(data) : data;
                    series[x].url.XHR = null;
                }
            plot.setData(series);
            plot.setupGrid();
            plot.draw();
        });
    };

    function shutdown (plot, eventHolder) {
        var series = plot.getData();
        for (x in series)
            if (series[x].url.XHR)
                series[x].url.XHR.abort();
    };

    function init(plot) {
        plot.hooks.processRawData.push(processRawData);
        plot.hooks.shutdown.push(shutdown);
    };
    
    $.plot.plugins.push({
        init: init,
        options: options,
        name: 'url',
        version: '0.9'
    });
})(jQuery);
