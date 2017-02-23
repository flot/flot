/* global $, describe, it, xit, xdescribe, after, afterEach, expect*/

describe('flot', function() {

    describe('computeRangeForDataSeries', function() {

        var placeholder, plot;

        var options = {
            series: {
                shadowSize: 0, // don't draw shadows
                lines: { show: false},
                points: { show: true, fill: false, symbol: 'circle' }
            }
        };

        beforeEach(function() {
            placeholder = setFixtures('<div id="test-container" style="width: 600px;height: 400px">')
                .find('#test-container');
        });

        it('should return Infinity and -Infinity for the minimum and the maximum respectively of x and y for an empty series', function () {
            plot = $.plot(placeholder, [[]], options);

            var series = plot.getData();
            var limits = plot.computeRangeForDataSeries(series[0]);

            expect(limits.xmin).toBe(Infinity);
            expect(limits.xmax).toBe(-Infinity);
            expect(limits.ymin).toBe(Infinity);
            expect(limits.ymax).toBe(-Infinity);
        });

        it('should return the minimum and the maximum of x and y for a series', function () {
            plot = $.plot(placeholder, [[[0, 1], [1, 2], [2, 3]]], options);

            var series = plot.getData();
            var limits = plot.computeRangeForDataSeries(series[0]);

            expect(limits.xmin).toBe(0);
            expect(limits.xmax).toBe(2);
            expect(limits.ymin).toBe(1);
            expect(limits.ymax).toBe(3);
        });

        it('should return the minimum and the maximum of x and y for an xy series', function () {
            plot = $.plot(placeholder, [[[10, 1], [11, 2], [12, 3]]], options);

            var series = plot.getData();
            var limits = plot.computeRangeForDataSeries(series[0]);

            expect(limits.xmin).toBe(10);
            expect(limits.xmax).toBe(12);
            expect(limits.ymin).toBe(1);
            expect(limits.ymax).toBe(3);
        });

        it('should not compute the minimum and the maximum when autoscale="none"', function () {
            options.xaxis = {autoscale: 'none'};
            options.yaxis = {autoscale: 'none'};
            plot = $.plot(placeholder, [[[0, 1], [1, 2], [2, 3]]], options);

            var series = plot.getData();
            var limits = plot.computeRangeForDataSeries(series[0]);

            expect(limits.xmin).toBe(Infinity);
            expect(limits.xmax).toBe(-Infinity);
            expect(limits.ymin).toBe(Infinity);
            expect(limits.ymax).toBe(-Infinity);
        });

        it('should compute the minimum and the maximum when autoscale="none" and force=true', function () {
            options.xaxis = {autoscale: 'none'};
            options.yaxis = {autoscale: 'none'};
            plot = $.plot(placeholder, [[[0, 1], [1, 2], [2, 3]]], options);

            var series = plot.getData();
            var limits = plot.computeRangeForDataSeries(series[0], true);

            expect(limits.xmin).toBe(0);
            expect(limits.xmax).toBe(2);
            expect(limits.ymin).toBe(1);
            expect(limits.ymax).toBe(3);
        });

    });


    describe('adjustSeriesDataRange', function() {

        var placeholder, plot;

        beforeEach(function() {
            placeholder = setFixtures('<div id="test-container" style="width: 600px;height: 400px">')
                .find('#test-container');
            plot = $.plot(placeholder, [[]], {});
        });

        it('should set the minimum to zero if needed when {lines|bars}.show=true and {lines|bars}.zero=true', function () {
            [true, false].forEach(function(show) {
                var series = {
                        lines: { show: show, zero: show },
                        bars: { show: !show, zero: !show },
                        datapoints: { pointsize: 1 }
                    },
                    limits = {xmin: 10, ymin: 11, xmax: 12, ymax: 13};

                var limits = plot.adjustSeriesDataRange(series, limits);

                expect(limits.ymin).toBe(0);
                expect(limits.ymax).toBe(13);
            });
        });

        it('should set the maximum to zero if needed when {lines|bars}.show=true and {lines|bars}.zero=true', function () {
            [true, false].forEach(function(show) {
                var series = {
                        lines: { show: show, zero: show },
                        bars: { show: !show, zero: !show },
                        datapoints: { pointsize: 1 }
                    },
                    limits = {xmin: 10, ymin: -11, xmax: 12, ymax: -9};

                var limits = plot.adjustSeriesDataRange(series, limits);

                expect(limits.ymin).toBe(-11);
                expect(limits.ymax).toBe(0);
            });
        });

        it('should not change the limits of the y when {lines|bars}.show=true, {lines|bars}.zero=true, but datapoints.pointsize>2', function () {
            [true, false].forEach(function(show) {
                var series = {
                        lines: { show: show, zero: show },
                        bars: { show: !show, zero: !show },
                        datapoints: { pointsize: 3 }
                    },
                    limits = {xmin: 10, ymin: -11, xmax: 12, ymax: -9};

                var limits = plot.adjustSeriesDataRange(series, limits);

                expect(limits.ymin).toBe(-11);
                expect(limits.ymax).toBe(-9);
            });
        });

        it('should change the limits of x to fit the width of the bars', function () {
            var series = {
                    lines: { show: false },
                    bars: { show: true, align: 'center', barWidth: 6 }
                },
                limits = {xmin: 10, ymin: 11, xmax: 12, ymax: 13};

            var limits = plot.adjustSeriesDataRange(series, limits);

            expect(limits.xmin).toBe(10 - 6/2);
            expect(limits.xmax).toBe(12 + 6/2);
        });

    });

});
