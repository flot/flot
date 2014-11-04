/* global $, describe, it, xit, after, afterEach, expect */
/* jshint browser: true*/

describe("unit tests for the cursors", function () {
    var sampledata = [[0, 1], [1, 1.1], [2, 1.2], [3, 1.3], [4, 1.4], [5, 1.5], [6, 1.6], [7, 1.7], [8, 1.8], [9, 1.9], [10, 2]];

    afterEach(function () {
        $('#placeholder').empty();
    });

    it('should be able to specify a cursor when creating the plot', function () {
        var plot = $.plot("#placeholder", [sampledata], {
            cursors: [
                {
                    name: 'Blue cursor',
                    mode: 'xy',
                    color: 'blue',
                    x: 3,
                    y: 1.5
                }
            ],
            interaction: {
                redrawOverlayInterval: 0
            }
        });

        var cursors = plot.getCursors();
        expect(cursors.length).toBe(1);
        expect(cursors[0].name).toBe('Blue cursor');
    });

    it('should be able to specify zero cursors when creating the plot', function () {
        var plot = $.plot("#placeholder", [sampledata], {
            cursors: [
            ],
            interaction: {
                redrawOverlayInterval: 0
            }
        });

        var cursors = plot.getCursors();
        expect(cursors.length).toBe(0);
    });

    it('should be able to specify multiple cursors when creating the plot', function () {
        var plot = $.plot("#placeholder", [sampledata], {
            cursors: [
                {
                    name: 'Blue cursor',
                    mode: 'xy',
                    color: 'blue',
                    x: 3,
                    y: 1.5
                },
                {
                    name: 'Red cursor',
                    mode: 'xy',
                    color: 'red',
                    x: 150,
                    y: 0
                }
            ],
            interaction: {
                redrawOverlayInterval: 0
            }
        });

        var cursors = plot.getCursors();
        expect(cursors.length).toBe(2);
        expect(cursors[0].name).toBe('Blue cursor');
        expect(cursors[1].name).toBe('Red cursor');
    });

    it('should be able to create a cursor programatically', function () {
        var plot = $.plot("#placeholder", [sampledata], {
            cursors: [
            ],
            interaction: {
                redrawOverlayInterval: 0
            }
        });

        var cursors = plot.getCursors();
        expect(cursors.length).toBe(0);

        plot.addCursor(7, 5, 'xy', 'Blue cursor', 'blue');

        cursors = plot.getCursors();
        expect(cursors.length).toBe(1);

        expect(cursors[0].name).toBe('Blue cursor');
    });

    it('should interpolate the values properly with linear scales');
    it('should interpolate the values properly with log scales');
    it('should interpolate the values properly with mixed scales');
});