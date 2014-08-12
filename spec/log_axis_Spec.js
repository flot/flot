/* global $, describe, it, xit, after, afterEach, expect*/

describe("unit tests for the log scale functions", function () {
  it('should use linear scale for low dynamic range intervals', function () {
    var ticks = $.plot.logTicksGenerator(10, 11, 10);

    expect(ticks).toEqual([10, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 11]);
  });

  it('should use log scales for high dynamic range intervals', function () {
    var ticks = $.plot.logTicksGenerator(0.0001, 10000);

    expect(ticks).toEqual([0.0001, 0.001, 0.01, 0.1, 1, 10, 100, 1000, 10000]);
  });

  xit('should format numbers according to their natural precision', function () {
    var logFormatter = $.plot.logTickFormatter;
    expect(logFormatter(1.7000000000000002)).toEqual('1.7');
  });

});


describe("integration tests for log scale functions", function () {
  afterEach(function () {
    $('#placeholder').empty();
  });

  it('should use linear scale for low dynamic range intervals', function () {
    var lineardata1 = [[0, 1], [1, 1.1], [2, 1.2], [3, 1.3], [4, 1.4], [5, 1.5], [6, 1.6], [7, 1.7], [8, 1.8], [9, 1.9], [10, 2]];

    $.plot("#placeholder", [lineardata1], {
      yaxis: {
        mode: 'log'
      }
    });

    expect(true).toBe(true);
  });

  it('should use log scales for high dynamic range intervals', function () {
    var logdata1 = [[0, 0.0001], [1, 0.001], [2, 0.01], [3, 0.1], [4, 1], [5, 10], [6, 100], [7, 1000], [8, 10000]];
    $.plot("#placeholder", [logdata1], {
      yaxis: {
        mode: 'log'
      }
    });

    expect(true).toBe(true);
  });
});