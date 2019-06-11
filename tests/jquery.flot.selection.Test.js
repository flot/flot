/* eslint-disable */
/* global $, describe, it, xit, xdescribe, after, afterEach, expect*/

describe("flot selection plugin", function() {
    var placeholder, offset, options;
    var minFrameDuration = 1 / 60 * 1000;
    var mouseStart = { x: 100, y: 100 };

    beforeEach(function() {

        options = {
            selection: {
                mode: 'smart',
                minSize: 30,
            }
        };

        placeholder = setFixtures('<div id="test-container" style="width: 600px;height: 400px">')
            .find('#test-container');

        jasmine.clock().install();
    });

    afterEach(function() {
        jasmine.clock().uninstall();
    });


    function doDragStart(el, m) {
        var c = getClientXY(el, m);

        simulate.mouseDown(el, c.x, c.y);
        simulate.mouseMove(el, c.x, c.y);
        jasmine.clock().tick(minFrameDuration);
    }

    function doDrag(el, m) {
        var c = getClientXY(el, m);

        simulate.mouseMove(el, c.x, c.y);
        jasmine.clock().tick(minFrameDuration);
    }

    function doDragEnd(el, m) {
        var c = getClientXY(el, m);

        simulate.mouseUp(el, c.x, c.y);
        simulate.click(el, c.x, c.y);
        jasmine.clock().tick(minFrameDuration);
    }

    function getClientXY(el, m){
        var bBox = el.getBoundingClientRect();

        return {
            x: Math.floor(bBox.left + m.x),
            y: Math.floor(bBox.top + m.y)};
    }

    it('should draw the selection rectangle with "fill" option', function(){

        options.selection.visualization = "fill";

        var plot = $.plot(placeholder, [[]], options);
        var eventHolder = plot.getEventHolder();
        var ctx = eventHolder.getContext('2d');
        var mouseEnd = { x: mouseStart.x + 100, y: mouseStart.y + 100 };

        spyOn(ctx, 'strokeRect').and.callThrough();
        spyOn(ctx, 'closePath').and.callThrough();

        doDragStart(eventHolder, mouseStart);
        doDrag(eventHolder, mouseEnd);
        doDragEnd(eventHolder, mouseEnd);

        expect(ctx.strokeRect).toHaveBeenCalled();
        expect(ctx.closePath).not.toHaveBeenCalled();
    });

    it('should draw the focusing selection window by default', function(){

        var plot = $.plot(placeholder, [[]], options);
        var eventHolder = plot.getEventHolder();
        var ctx = eventHolder.getContext('2d');
        var mouseEnd = { x: mouseStart.x + 100, y: mouseStart.y + 100 };

        spyOn(ctx, 'strokeRect').and.callThrough();
        spyOn(ctx, 'closePath').and.callThrough();

        doDragStart(eventHolder, mouseStart);
        doDrag(eventHolder, mouseEnd);
        doDragEnd(eventHolder, mouseEnd);

        expect(ctx.strokeRect).not.toHaveBeenCalled();
        expect(ctx.closePath).toHaveBeenCalled();
    });

    it('should not draw anything if selection range is less than the minimum set in options', function(){

        var plot = $.plot(placeholder, [[]], options);
        var eventHolder = plot.getEventHolder();
        var ctx = eventHolder.getContext('2d');
        var delta = options.selection.minSize - 1;
        var mouseEnd = { x: mouseStart.x + delta, y: mouseStart.y + delta };

        spyOn(ctx, 'strokeRect').and.callThrough();
        spyOn(ctx, 'closePath').and.callThrough();

        doDragStart(eventHolder, mouseStart);
        doDrag(eventHolder, mouseEnd);
        doDragEnd(eventHolder, mouseEnd);

        expect(ctx.strokeRect).not.toHaveBeenCalled();
        expect(ctx.closePath).not.toHaveBeenCalled();
    });
});

