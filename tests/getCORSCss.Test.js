/* eslint-disable */
import {getCrossDomainCSSRules} from '../source/getCORSCss.js';
describe("getCrossDomainCSSRules", function() {
    it('should getCrossDomainCSSRules set new CORS link correctly', async function () {
        // document.styleSheets[2] href based on http://localhost:9876/base/tests/corscss.css?
        spyOnProperty(document.styleSheets[2], 'cssRules').and.callFake(() => {
            throw new DOMException("Failed to read the 'cssRules' property from 'CSSStyleSheet': Cannot access rules", 'SecurityError');
        });
        expect(() => {document.styleSheets[2].cssRules;}).toThrow(new DOMException("Failed to read the 'cssRules' property from 'CSSStyleSheet': Cannot access rules", 'SecurityError'));
        await getCrossDomainCSSRules(document);
        expect(document.styleSheets[2].ownerNode.crossOrigin).toBe('anonymous');
        expect(document.styleSheets[1].ownerNode.crossOrigin).toBeNull();

    });
});
