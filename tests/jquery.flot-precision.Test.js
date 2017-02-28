describe("unit tests for the precision of axis", function() {
    var plot;
    var placeholder;
    var sampledata = [[0, 1], [1, 1.1], [2, 1.2]];
    
    beforeEach(function () {
        var fixture = setFixtures('<div id="demo-container" style="width: 800px;height: 600px">').find('#demo-container').get(0);

        placeholder = $('<div id="placeholder" style="width: 100%;height: 100%">');
        placeholder.appendTo(fixture);
    });

    afterEach(function () {
        if (plot) {
            plot.shutdown();
        }
        $('#placeholder').empty();
    });
    
    it('should use the precision given by tickDecimals when specified', function() {
        var options = [];
        
        plot = $.plot("#placeholder", [sampledata], {});

        var testVector = [
            [1, 10, 10, 3, 1],
            [1, 1.01, 10, 2, 2],
            [0.99963, 0.99964, null, 3, 3],
            [1, 1.1, 5, 1, 1],
            [1, 1.00000000000001, 10, 5, 5]
            ];
        
        testVector.forEach(function (t) {
            var min = t[0],
                max = t[1],
                ticks = t[2],
                tickDecimals = t[3],
                expectedValue = t[4];

            var precision = plot.computeValuePrecision(min, max, "x", ticks, tickDecimals);
                
            expect(precision).toEqual(expectedValue);
        });
    });
    
    it('should use the maximum precision when tickDecimals not specified', function() {
        
        plot = $.plot("#placeholder", [sampledata], {});

        var testVector = [
            [1, 10, 10, 1],
            [1, 1.01, 10, 3],
            [1, 1.1, 5, 2],
            [0.99963, 0.99964, null, 6],
            [1, 1.00000000000001, 10, 16]
            ];
        
        testVector.forEach(function (t) {
            var min = t[0],
                max = t[1],
                ticks = t[2],
                expectedValue = t[3];
              
            var precision = plot.computeValuePrecision(min, max, "x", ticks);
                
            expect(precision).toEqual(expectedValue);
        });
    });
    
    it('should increase precision for endpoints', function() {
        var testVector = [
            [1, 10, 10, 'linear', '1.00', '10.00'],
		    [0, 100, 11, 'linear', '0.0', '100.0'],
            [-1, 1, 20, 'linear', '-1.0000', '1.0000'],
            [1, 1.01, 10, 'linear', '1.00000', '1.01000'],
            [99, 99.02, 10, 'linear', '99.000000', '99.020000'],
            [0.99963, 0.99964, null, 'linear', '0.99963000', '0.99964000'],
            [1, 1.00000000001, 100, 'linear', '1.00000000000000', '1.00000000001000'],
	        [1, 10, 10, 'log', '1.0000', '10.000'],
            [0.1, 100, 11, 'log', '0.1000', '100.0'],
            [0.99963, 0.99964, null, 'log', '0.99963000', '0.99964000']
            ];
        
        testVector.forEach(function (t) {
            
            plot = $.plot("#placeholder", [sampledata], {
                xaxes: [{
                    min: t[0],
                    max: t[1],
                    ticks: t[2],
                    showTickLabels : 'endpoints',
                    autoscale: "none",
                    mode: t[3]
                }]
            });
            
            var minExpectedValue = t[4],
                maxExpectedValue = t[5],
                xaxis = plot.getAxes().xaxis;
            
            expect(xaxis.ticks[0].label).toEqual(minExpectedValue);
            expect(xaxis.ticks[xaxis.ticks.length-1].label).toEqual(maxExpectedValue);

        });
    });
});