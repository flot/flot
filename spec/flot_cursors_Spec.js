/* global $, describe, it, xit, after, afterEach, expect */
/* jshint browser: true*/

describe("Flot cursors", function () {
    var sampledata = [[0, 1], [1, 1.1], [2, 1.2], [3, 1.3], [4, 1.4], [5, 1.5], [6, 1.6], [7, 1.7], [8, 1.8], [9, 1.9], [10, 2]];
    var sampledata2 = [[0, 2], [1, 2.1], [2, 2.2], [3, 2.3], [4, 2.4], [5, 2.5], [6, 2.6], [7, 2.7], [8, 2.8], [9, 2.9], [10, 3]];

    var plot;

    afterEach(function () {
        $('#placeholder').empty();
        plot.shutdown();
    });

    it('should be possible to specify a cursor when creating the plot', function () {
        plot = $.plot("#placeholder", [sampledata2], {
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

    it('should be possible to specify zero cursors when creating the plot', function () {
        plot = $.plot("#placeholder", [sampledata], {
            cursors: [
            ],
            interaction: {
                redrawOverlayInterval: 0
            }
        });

        var cursors = plot.getCursors();
        expect(cursors.length).toBe(0);
    });

    it('should be possible to specify multiple cursors when creating the plot', function () {
        plot = $.plot("#placeholder", [sampledata], {
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

    it('should be possible to create a cursor programatically', function () {
        plot = $.plot("#placeholder", [sampledata], {
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

    it('should be possible to remove a cursor programatically', function () {
        plot = $.plot("#placeholder", [sampledata], {
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

        plot.removeCursor(cursors[0]);

        cursors = plot.getCursors();
        expect(cursors.length).toBe(0);
    });

    it('should be possible to change cursor properties programatically', function () {
        plot = $.plot("#placeholder", [sampledata], {
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

        plot.setCursor(cursors[0], {
            name: 'Red Cursor',
            mode: 'x'
        });

        cursors = plot.getCursors();
        expect(cursors.length).toBe(1);

        expect(cursors[0].name).toBe('Red Cursor');
        expect(cursors[0].mode).toBe('x');
        expect(cursors[0].x).toBe(3);
    });

    it('should be possible to specify the cursor shape');
    it('should display the cursor label when told so');
    it('should be highlighted on mouse over');
    it('should change the mouse cursor on mouse over');
    it('should change the mouse cursor on drag');

    describe('Intersections', function () {
        xit('should find intersections with a plot', function (done) {
            plot = $.plot("#placeholder", [sampledata], {
                cursors: [
                    {
                        name: 'Blue cursor',
                        mode: 'xy',
                        color: 'blue',
                        x: 1,
                        y: 0
                    }
                ],
                interaction: {
                    redrawOverlayInterval: 0
                }
            });

            setTimeout(function () {
                var cursors = plot.getCursors();
                var intersections = plot.getIntersections(cursors[0]);

                expect(intersections.points.length).toBe(1);
                expect(intersections.points[0].x).toBe(1);
                expect(intersections.points[0].y).toBe(sampledata[1]);
                done();
            }, 0);
        });

        xit('should find intersections with multiple plots', function (done) {
            plot = $.plot("#placeholder", [sampledata], {
                cursors: [
                    {
                        name: 'Blue cursor',
                        mode: 'xy',
                        color: 'blue',
                        x: 1,
                        y: 0
                    }
                ],
                interaction: {
                    redrawOverlayInterval: 0
                }
            });

            setTimeout(function () {
                var cursors = plot.getCursors();
                var intersections = plot.getIntersections(cursors[0]);

                expect(intersections.points.length).toBe(1);
                expect(intersections.points[0].x).toBe(1);
                expect(intersections.points[0].y).toBe(sampledata[1]);
                done();
            }, 0);
        });
        it('should interpolate the intersections properly with linear scales');
        it('should interpolate the intersections properly with log scales');
        it('should interpolate the intersections properly with mixed scales');
        it('should recompute intersections on data update');
    });

    describe('Positioning', function () {
        it('should be possible to position the cursor relative to the canvas');
        it('should be possible to position the cursor relative to the axes');
        it('should be possible to position the cursor relative to any of the axes when having multiple ones');
        it('should be possible to drag cursors with the mouse');
        it('should be possible to drag cursors with the mouse while the chart updates');
    });

    describe('Snapping', function () {});
});