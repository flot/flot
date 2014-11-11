/* global $, describe, it, xit, after, afterEach, expect */
/* jshint browser: true*/

describe("Flot cursors", function () {
    var sampledata = [[0, 1], [1, 1.1], [2, 1.2], [3, 1.3], [4, 1.4], [5, 1.5], [6, 1.6], [7, 1.7], [8, 1.8], [9, 1.9], [10, 2]];
    var sampledata2 = [[0, 2], [1, 2.1], [2, 2.2], [3, 2.3], [4, 2.4], [5, 2.5], [6, 2.6], [7, 2.7], [8, 2.8], [9, 2.9], [10, 3]];
    var sampledata3 = [[0, 20], [10, 19], [20, 18], [30, 17], [40, 16], [50, 5], [60, 14], [70, 13], [80, 12], [90, 11], [100, 10]];

    var plot;

    afterEach(function () {
        plot.shutdown();
        $('#placeholder').empty();
    });

    it('should be possible to specify a cursor when creating the plot', function () {
        plot = $.plot("#placeholder", [sampledata2], {
            cursors: [
                {
                    name: 'Blue cursor',
                    mode: 'xy',
                    color: 'blue',
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
                },
                {
                    name: 'Red cursor',
                    mode: 'xy',
                    color: 'red',
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

        plot.addCursor('Blue cursor', 'xy', 'blue', {
            relativeX: 7,
            relativeY: 7
        });

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
    });

    it('should be possible to specify the cursor shape');
    it('should display the cursor label when told so');
    xit('should be highlighted on mouse over', function () {

    });

    it('should change the mouse cursor on mouse over');
    it('should change the mouse cursor on drag');

    describe('Intersections', function () {
        it('should find intersections with a plot', function (done) {
            plot = $.plot("#placeholder", [sampledata], {
                cursors: [
                    {
                        name: 'Blue cursor',
                        mode: 'xy',
                        color: 'blue',
                        position: {
                            x: 1,
                            y: 0
                        }
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
                expect(intersections.points[0].y).toBe(sampledata[1][1]);
                done();
            }, 0);
        });

        it('should find intersections with multiple plots', function (done) {
            plot = $.plot("#placeholder", [sampledata, sampledata2], {
                cursors: [
                    {
                        name: 'Blue cursor',
                        mode: 'xy',
                        color: 'blue',
                        position: {
                            x: 1,
                            y: 0
                        }
                    }
                ],
                interaction: {
                    redrawOverlayInterval: 0
                }
            });

            setTimeout(function () {
                var cursors = plot.getCursors();
                var intersections = plot.getIntersections(cursors[0]);

                expect(intersections.points.length).toBe(2);
                expect(intersections.points[0].x).toBe(1);
                expect(intersections.points[0].y).toBe(sampledata[1][1]);
                expect(intersections.points[1].x).toBe(1);
                expect(intersections.points[1].y).toBe(sampledata2[1][1]);
                done();
            }, 0);
        });

        it('should interpolate the intersections properly with linear scales', function (done) {
            plot = $.plot("#placeholder", [sampledata], {
                cursors: [
                    {
                        name: 'Blue cursor',
                        mode: 'xy',
                        color: 'blue',
                        position: {
                            x: 0.5,
                            y: 0
                        }
                    }
                ],
                interaction: {
                    redrawOverlayInterval: 0
                }
            });

            setTimeout(function () {
                var cursors = plot.getCursors();
                var intersections = plot.getIntersections(cursors[0]);
                var expectedY = sampledata[0][1] + (sampledata[1][1] - sampledata[0][1]) / 2;

                expect(intersections.points[0].x).toBe(0.5);
                expect(intersections.points[0].y).toBe(expectedY);
                done();
            }, 0);
        });

        it('should interpolate the intersections properly with log scales');
        it('should interpolate the intersections properly with mixed scales');

        it('should recompute intersections on data update', function (done) {
            plot = $.plot("#placeholder", [[[0, 1], [1, 5]]], {
                cursors: [
                    {
                        name: 'Blue cursor',
                        mode: 'xy',
                        color: 'blue',
                        position: {
                            x: 0.5,
                            y: 0
                        }
                    }
                ],
                interaction: {
                    redrawOverlayInterval: 0
                }
            });

            var updateChart = function () {
                plot.setData([[[0, 1], [1, 7]]]);
                plot.setupGrid();
                plot.draw();
            };

            var verifyIntersections = function () {
                var cursors = plot.getCursors();
                var intersections = plot.getIntersections(cursors[0]);

                expect(intersections.points[0].x).toBe(0.5);
                expect(intersections.points[0].y).toBe(4);
                done();
            };

            setTimeout(function () {
                var cursors = plot.getCursors();
                var intersections = plot.getIntersections(cursors[0]);

                expect(intersections.points[0].x).toBe(0.5);
                expect(intersections.points[0].y).toBe(3);
                updateChart();
                setTimeout(function () {
                    verifyIntersections();
                }, 0);
            }, 0);
        });
    });

    describe('Positioning', function () {
        it('should be possible to position the cursor relative to the canvas', function (done) {
            plot = $.plot("#placeholder", [sampledata2], {
                cursors: [
                    {
                        name: 'Blue cursor',
                        mode: 'xy',
                        color: 'blue',
                        position: {
                            relativeX: 3,
                            relativeY: 1.5
                        }
                    }
                ],
                interaction: {
                    redrawOverlayInterval: 0
                }
            });

            setTimeout(function () {
                var cursors = plot.getCursors();
                expect(cursors.length).toBe(1);
                expect(cursors[0].x).toBe(3);
                expect(cursors[0].y).toBe(1.5);
                done();
            }, 0);
        });

        it('Cursors positioned relative to the canvas should be constrained by the canvas size', function (done) {
            plot = $.plot("#placeholder", [sampledata2], {
                cursors: [
                    {
                        name: 'Blue cursor',
                        mode: 'xy',
                        color: 'blue',
                        position: {
                            relativeX: -30,
                            relativeY: -40
                        }
                    }
                ],
                interaction: {
                    redrawOverlayInterval: 0
                }
            });

            setTimeout(function () {
                var cursors = plot.getCursors();
                expect(cursors.length).toBe(1);
                expect(cursors[0].x).toBe(0);
                expect(cursors[0].y).toBe(0);
                done();
            }, 0);
        });

        it('should be possible to position the cursor relative to the axes', function (done) {
            plot = $.plot("#placeholder", [sampledata2], {
                cursors: [
                    {
                        name: 'Blue cursor',
                        mode: 'xy',
                        color: 'blue',
                        position: {
                            x: 1,
                            y: 2
                        }
                    }
                ],
                interaction: {
                    redrawOverlayInterval: 0
                }
            });

            setTimeout(function () {
                var pos = plot.p2c({
                    x: 1,
                    y: 2
                });
                var expectedX = pos.left;
                var expectedY = pos.top;
                var cursors = plot.getCursors();
                expect(cursors.length).toBe(1);
                expect(cursors[0].x).toBe(expectedX);
                expect(cursors[0].y).toBe(expectedY);
                done();
            }, 0);
        });

        it('should be possible to position the cursor relative to any of the axes when having multiple ones', function (done) {
            plot = $.plot("#placeholder", [{
                data: sampledata,
                xaxis: 1,
                yaxis: 1
            }, {
                data: sampledata3,
                xaxis: 2,
                yaxis: 2
            }], {
                cursors: [
                    {
                        name: 'Blue cursor',
                        mode: 'xy',
                        color: 'blue',
                        position: {
                            x: 1,
                            y: 2
                        }
                    },
                    {
                        name: 'Red cursor',
                        mode: 'xy',
                        color: 'red',
                        position: {
                            x2: 40,
                            y2: 12
                        }
                    }
                ],
                interaction: {
                    redrawOverlayInterval: 0
                },
                xaxes: [
                    {
                        position: 'bottom'
                    },
                    {
                        position: 'top'
                    }
                ],
                yaxes: [
                    {
                        position: 'left'
                    },
                    {
                        position: 'right'
                    }
                ]
            });

            setTimeout(function () {
                var pos1 = plot.p2c({
                    x: 1,
                    y: 2
                });

                var pos2 = plot.p2c({
                    x2: 40,
                    y2: 12
                });

                var expectedX1 = pos1.left;
                var expectedY1 = pos1.top;
                var expectedX2 = pos2.left;
                var expectedY2 = pos2.top;
                var cursors = plot.getCursors();
                expect(cursors.length).toBe(2);
                expect(cursors[0].x).toBe(expectedX1);
                expect(cursors[0].y).toBe(expectedY1);
                expect(cursors[1].x).toBe(expectedX2);
                expect(cursors[1].y).toBe(expectedY2);
                done();
            }, 0);
        });

        it('should be possible to drag cursors with the mouse');
        it('should be possible to drag cursors with the mouse while the chart updates');
    });

    describe('Snapping', function () {});
});