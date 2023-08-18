/* eslint-disable */
/* global $, describe, it, xit, xdescribe, after, afterEach, expect*/

describe("flot legend plugin", function() {
    let placeholder, plot;
    let options, legendContainer, legendSettings

    beforeEach(function() {
        let legendSettings = {
                position: "nw",
                show: true,
                container: null
            };

        options = {
            legend: legendSettings,
            series: {
                shadowSize: 0, // don't draw shadows
            }
        };

        placeholder = setFixtures('<div id="test-container" style="width: 600px;height: 400px">')
            .find('#test-container');
    });

    let positions = ['nw', 'ne', 'sw', 'se'];
    positions.forEach(function (pos) {
        it ('shold draw a legend over graph at cardinal position: ' + pos + ', if a container is not provided', function () {
            options.legend.position = pos;
            plot = $.plot(placeholder, [[1, 3, 5, 6]], options);

            let legend = document.getElementsByClassName('legend')[0];

            expect(legend.style.position).toBe('absolute');
            switch (pos) {
                case "nw":
                    expect(legend.style.top).toContain('px')
                    expect(legend.style.bottom).toBe('');
                    expect(legend.style.left).toContain('px')
                    expect(legend.style.right).toBe('');
                    break;
                case "ne":
                    expect(legend.style.top).toContain('px')
                    expect(legend.style.bottom).toBe('');
                    expect(legend.style.left).toBe('');
                    expect(legend.style.right).toContain('px')
                    break;
                case "sw":
                    expect(legend.style.top).toBe('');
                    expect(legend.style.bottom).toContain('px')
                    expect(legend.style.left).toContain('px')
                    expect(legend.style.right).toBe('');
                    break;
                case "se":
                    expect(legend.style.top).toBe('');
                    expect(legend.style.bottom).toContain('px')
                    expect(legend.style.left).toBe('');
                    expect(legend.style.right).toContain('px')
                    break;
            }
        });
    });

    it('should draw the legend inside the container if one is provided', function(){
        let legendContainer = document.createElement("div");
        document.body.appendChild(legendContainer);

        options.legend.container = legendContainer;
        plot = $.plot(placeholder, [[1, 3, 5, 6]], options);

        expect(legendContainer.style.width).toContain('px');
        expect(legendContainer.style.height).toContain('em');
        document.body.removeChild(legendContainer);
    });

    it('should assign a default plot label if none is provided', function(){
        plot = $.plot(placeholder, [[1, 3, 5, 6]], options);

        let legendSvg = document.getElementsByClassName('legendLayer')[0];
        let firstLegendEntry = legendSvg.getElementsByTagNameNS('http://www.w3.org/2000/svg', 'g')[0];
        let entryLabel = firstLegendEntry.getElementsByTagNameNS('http://www.w3.org/2000/svg', 'text')[0];

        expect(entryLabel.textContent).toBe('Plot 1');
    });

    it('should display the plot label', function(){
        let label = 'custom label';
        options.series.label = label;
        plot = $.plot(placeholder, [[1, 3, 5, 6]], options);

        let legendSvg = document.getElementsByClassName('legendLayer')[0];
        let firstLegendEntry = legendSvg.getElementsByTagNameNS('http://www.w3.org/2000/svg', 'g')[0];
        let entryLabel =  firstLegendEntry.getElementsByTagNameNS('http://www.w3.org/2000/svg', 'text')[0];

        expect(entryLabel.textContent).toBe(label);
    });

    it('should display the plot icon', function(){
        let label = 'custom label';
        options.series.label = label;
        plot = $.plot(placeholder, [[1, 3, 5, 6]], options);

        let legendSvg = document.getElementsByClassName('legendLayer')[0];
        let firstLegendEntry = legendSvg.getElementsByTagNameNS('http://www.w3.org/2000/svg', 'g')[0];
        let entryHTML =  firstLegendEntry.innerHTML;

        expect(entryHTML.includes('#line')).toBe(true);
    });

    it('should take into account the show option', function() {
        options.legend.show = false;
        plot = $.plot(placeholder, [[1, 3, 5, 6]], options);

        let legendSvg = document.getElementsByClassName('legendLayer')[0];

        expect(legendSvg).toBe(undefined);
    });
    it('should take into account the noColumns option value of 2', function() {
        options.legend.noColumns = 2;
        plot = $.plot(placeholder, [[1, 3, 5, 6], [2, 4, 6, 7],[3, 5, 7, 8]], options);

        let legendSvg = document.getElementsByClassName('legendLayer')[0];
        let firstLegendEntry = legendSvg.getElementsByTagNameNS('http://www.w3.org/2000/svg', 'g')[0];
        let secondLegendEntry = legendSvg.getElementsByTagNameNS('http://www.w3.org/2000/svg', 'g')[1];
        let thirdLegendEntry = legendSvg.getElementsByTagNameNS('http://www.w3.org/2000/svg', 'g')[2];
        expect(firstLegendEntry.childNodes[0].x.baseVal.value < secondLegendEntry.childNodes[0].x.baseVal.value).toBe(true);
        expect(secondLegendEntry.childNodes[0].x.baseVal.value > thirdLegendEntry.childNodes[0].x.baseVal.value).toBe(true);
    });
    it('should take into account the noColumns option value of 3', function() {
        options.legend.noColumns = 3;
        plot = $.plot(placeholder, [[1, 3, 5, 6], [2, 4, 6, 7],[3, 5, 7, 8]], options);

        let legendSvg = document.getElementsByClassName('legendLayer')[0];
        let firstLegendEntry = legendSvg.getElementsByTagNameNS('http://www.w3.org/2000/svg', 'g')[0];
        let secondLegendEntry = legendSvg.getElementsByTagNameNS('http://www.w3.org/2000/svg', 'g')[1];
        let thirdLegendEntry = legendSvg.getElementsByTagNameNS('http://www.w3.org/2000/svg', 'g')[2];
        expect(firstLegendEntry.childNodes[0].x.baseVal.value < secondLegendEntry.childNodes[0].x.baseVal.value).toBe(true);
        expect(secondLegendEntry.childNodes[0].x.baseVal.value < thirdLegendEntry.childNodes[0].x.baseVal.value).toBe(true);
    });
});

