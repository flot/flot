(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.getCrossDomainCSSRules = factory();
    }
})(typeof window !== 'undefined' ? window : this, () => {
    /**
     * Detect if document already has a "crossOrigin" link in document, in order to not creating same link multiple times .
     * @param {Object} document means current document element.
     * @param {String} link A href string which not set "crossOrigin" attr and is CORS compared to current domain.
     * @returns {Boolean} A boolean that returns true if the link already set "crossOrigin" attr, or false if not.
     */
    function isCrossOriginEnabledForLink(document, link) {
        for (let i = 0; i < document.styleSheets.length; i++) {
            if (document.styleSheets[i].href === link && document.styleSheets[i].ownerNode.crossOrigin) {
                return true;
            }
        }
        return false;
    }

    /**
     * Delete unused CORS link once the replaced link loads ready.
     * @param {Object} document means current document element.
     * @param {String} link A href string which not set "crossOrigin" attr and is CORS compared to current domain.
     */
    function deleteUnusedLink(document, link) {
        const linkList = document.getElementsByTagName('link');
        for (let i = 0; i < linkList.length; i++) {
            if (linkList[i].href === link && !linkList[i].crossOrigin) {
                linkList[i].remove();
                return;
            }
        }
    }

    const promiseMap = new Map();
    /**
     * Create a new link element which is CORS and set crossOrigin attribute.
     * @param {Object} document which is current document element.
     * @param {String} link A href string which not set "crossOrigin" attr and is CORS compared to current domain.
     * @returns {Promise} A promise that resolves to load a new link element in document.
     */
    function enableCrossOriginOnLinkAsync(document, link) {
        if (!promiseMap.has(link) && !isCrossOriginEnabledForLink(document, link)) {
            const linkPromise = new Promise((resolve) => {
                const newLink = document.createElement('link');
                newLink.rel = 'stylesheet';
                newLink.href = link;
                newLink.crossOrigin = 'anonymous';
                newLink.onload = function() {
                    promiseMap.delete(link);
                    deleteUnusedLink(document, link);
                    resolve();
                };
                document.querySelector('head').appendChild(newLink);
            });
            promiseMap.set(link, linkPromise);
            return linkPromise;
        }
        return promiseMap.get(link);
    }

    const getCrossDomainCSSRules = async function(document) {
        const rulesList = [];
        for (let i = 0; i < document.styleSheets.length; i++) {
            // in Chrome, the external CSS files are empty when the page is directly loaded from disk
            let rules = [];
            try {
                rules = document.styleSheets[i].cssRules;
            } catch (err) {
                await enableCrossOriginOnLinkAsync(document, document.styleSheets[i].href);
                i--;
            }
            for (let j = 0; j < rules.length; j++) {
                const rule = rules[j];
                rulesList.push(rule.cssText);
            }
        }
        return rulesList;
    };

    return getCrossDomainCSSRules;
});
