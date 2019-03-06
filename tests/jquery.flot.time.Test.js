/* global describe, it, beforeEach, afterEach, expect, setFixtures */
/* jshint browser: true*/

describe('A Flot chart with absolute time axes', function () {
    'use strict';

    var plot;
    var placeholder;

    beforeEach(function () {
        var fixture = setFixtures('<div id="demo-container" style="width: 800px;height: 600px">').find('#demo-container').get(0);

        placeholder = $('<div id="placeholder" style="width: 100%;height: 100%">');
        placeholder.appendTo(fixture);
    });

    afterEach(function () {
        if (plot) {
            plot.shutdown();
        }
    });

    var firstAndLast = function (arr) {
        return [arr[0], arr[arr.length - 1]];
    };

    var createPlotWithAbsoluteTimeAxis = function (placeholder, data, formatString, base) {
        return $.plot(placeholder, data, {
            xaxis: {
                mode: 'time',
                timeformat: formatString,
                timeBase: base,
                showTickLabels: 'all'
            },
            yaxis: {}
        });
    };

    var validateTickLabelFormat = function (ticks, regexFormat) {
        var isFormatCorrect = true;
        ticks.forEach(function (t) {
            if (!t.label.match(regexFormat)) {
                isFormatCorrect = false;
            }
        });
        return isFormatCorrect;
    };

    it('shows time ticks', function () {
        plot = createPlotWithAbsoluteTimeAxis(placeholder, [[[0, 1], [1000, 2]]], '%Y/%m/%d %M:%S', 'milliseconds');

        expect(firstAndLast(plot.getAxes().xaxis.ticks)).toEqual([
            {v: 0, label: '1970/01/01 00:00'},
            {v: 1000, label: '1970/01/01 00:01'}
        ]);
    });

    describe('date generator', function () {
        it('clamps values greater than Date() range to the limit of Date()', function () {
            var dateGenerator = $.plot.dateGenerator;

            expect(dateGenerator(8640000000000001, {}).date).toEqual(new Date(8640000000000000));
            expect(dateGenerator(8640000000000002, {}).date).toEqual(new Date(8640000000000000));
            expect(dateGenerator(-8640000000000001, {}).date).toEqual(new Date(-8640000000000000));
            expect(dateGenerator(-9640000000000000, {}).date).toEqual(new Date(-8640000000000000));
        });
    });

    describe('timebase in microseconds', function () {
        it('supports timestamps given in microseconds', function () {
            plot = createPlotWithAbsoluteTimeAxis(placeholder, [[[0, 1], [1000000, 2]]], '%Y/%m/%d %M:%S', 'microseconds');

            expect(firstAndLast(plot.getAxes().xaxis.ticks)).toEqual([
                {v: 0, label: '1970/01/01 00:00'},
                {v: 1000000, label: '1970/01/01 00:01'}
            ]);
        });
    });

    describe('sub-second ticks', function () {
        it('formats ticks to microsecond accuracy', function () {
            plot = createPlotWithAbsoluteTimeAxis(placeholder, [[[0, 1], [1000125, 2]]], '%H:%M:%S.%s', 'microseconds');

            expect(validateTickLabelFormat(plot.getAxes().xaxis.ticks), /00:00:0\d\.\d{6}/).toEqual(true);
            expect(firstAndLast(plot.getAxes().xaxis.ticks)).toEqual([
                {v: 0, label: '00:00:00.000000'},
                {v: 1000125, label: '00:00:01.000125'}
            ]);
        });
        it('supports tick formatted to millisecond (3 decimals) accuracy', function () {
            plot = createPlotWithAbsoluteTimeAxis(placeholder, [[[0, 1], [1002000, 2]]], '%H:%M:%S.%3s', 'microseconds');

            expect(validateTickLabelFormat(plot.getAxes().xaxis.ticks), /00:00:0\d\.\d{3}/).toEqual(true);
            expect(firstAndLast(plot.getAxes().xaxis.ticks)).toEqual([
                {v: 0, label: '00:00:00.000'},
                {v: 1002000, label: '00:00:01.002'}
            ]);
        });
    });
});
