/* global $, describe, it, xit, xdescribe, after, afterEach, expect*/

describe("unit tests for the log scale functions", function() {
    it('should use linear scale for low dynamic range intervals', function() {
        var ticks = $.plot.logTicksGenerator(10, 11, 10);

        expect(ticks).toEqual([10, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 11]);
    });

    xit('should use mixed scale for medium dynamic range intervals', function() {
        var ticks = $.plot.logTicksGenerator(0.2, 8, 10);

        expect(ticks).toEqual([0.2, 0.4, 0.6, 1, 2, 3, 5, 8 ]);
    });


    it('should use log scales for high dynamic range intervals', function() {
        var ticks = $.plot.logTicksGenerator(0.0001, 10000, 10);

        expect(ticks).toEqual([0.0001, 0.001, 0.01, 0.1, 1, 10, 100, 1000, 10000]);
    });

    it('should format numbers according to their natural precision', function() {
        var logFormatter = $.plot.logTickFormatter;
        var testVector = [
            [1.7000000000000002, '1.7'],
            [17.000000000000002, '17'],
            [172, '172'],
            [1.000, '1'],
            [0.0004, '0.0004'],
            [0.00004, '4e-5'],
            [3.1623E-21, '3e-21']
            ];
        
        testVector.forEach(function (t) {
            var inputValue = t[0],
                expectedValue = t[1];
                
            expect(logFormatter(inputValue)).toBe(expectedValue);
        });
    });
	
    it('should use a desired precision when specified', function(){
        var logFormatter = $.plot.logTickFormatter,
            axis = [],
            precision = 3,
            testVector = [
            [1.7000000000000002, '1.700'],
            [17.000000000000002, '17.000'],
            [172, '172.000'],
            [1.000, '1.000'],
            [0.00004, '4.000e-5'],
            [3.1623E-21, '3.162e-21']
            ];		

        testVector.forEach(function (t) {
            var inputValue = t[0],
                expectedValue = t[1];
                
            expect(logFormatter(inputValue, axis, precision)).toBe(expectedValue);
        });
    });

});

describe("integration tests for log scale functions", function() {
    var placeholder;

    var queryPlotForYTicks = function() {
        var actualTicks = [];

        var yAxisDivs = $('.yAxis');
        expect(yAxisDivs.length).toBe(1);
        var childDivs = yAxisDivs.find('.tickLabel');
        childDivs.each(function(i, e) {
            actualTicks.push(e.innerText);
        });

        return actualTicks.sort();
    };

    beforeEach(function() {
        placeholder = setFixtures('<div id="test-container" style="width: 600px;height: 400px">')
            .find('#test-container');
    });

    it('should use linear scale for low dynamic range intervals', function() {
        var lineardata1 = [
            [0, 1],
            [1, 1.1],
            [2, 1.2],
            [3, 1.3],
            [4, 1.4],
            [5, 1.5],
            [6, 1.6],
            [7, 1.7],
            [8, 1.8],
            [9, 1.9],
            [10, 2]
        ];

        $.plot(placeholder, [lineardata1], {
            yaxis: {
                mode: 'log',
                autoscale: 'exact'
            }
        });

        expect(queryPlotForYTicks()).toEqual(['1', '1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '1.8', '1.9', '2']);
    });

    it('should use log scales for high dynamic range intervals', function() {
        var logdata1 = [
            [0, 0.0001],
            [1, 0.001],
            [2, 0.01],
            [3, 0.1],
            [4, 1],
            [5, 10],
            [6, 100],
            [7, 1000],
            [8, 10000]
        ];

        $.plot(placeholder, [logdata1], {
            yaxis: {
                mode: 'log',
                autoscale: 'exact'
            }
        });

        expect(queryPlotForYTicks()).toEqual(['0.0001', '0.001', '0.01', '0.1', '1', '10', '100', '1000', '10000']);
    });
});
