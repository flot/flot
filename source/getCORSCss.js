(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(factory);
    } else if (typeof exports === "object") {
        module.exports = factory();
    } else {
        root.getCrossDomainCSSRules = factory();
    }
}(typeof window !== 'undefined' ? window : this, function () {
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
     * Create a new link element which is CORS and set crossOrigin attribute.
     * @param {Object} document which is current document element.
     * @param {String} link A href string which not set "crossOrigin" attr and is CORS compared to current domain.
     * @returns {Promise} A promise that resolves to load a new link element in document.
     */
    function enableCrossOriginOnLinkAsync(document, link) {
        if (!isCrossOriginEnabledForLink(document, link)) {
            return new Promise((resolve) => {
                let newLink = document.createElement('link');
                newLink.rel = 'stylesheet';
                newLink.href = link;
                newLink.crossOrigin = "anonymous";
                newLink.onload = function() {
                    console.log(link + ' updated');
                    resolve();
                };
                document.querySelector('head').appendChild(newLink);
            });
        }
    }

    const getCrossDomainCSSRules = async function(document) {
        let rulesList = [];
        for (let i = 0; i < document.styleSheets.length; i++) {
            // in Chrome, the external CSS files are empty when the page is directly loaded from disk
            let rules = [];
            try {
                rules = document.styleSheets[i].cssRules;
            }catch (e) {
                console.log(e);
                await enableCrossOriginOnLinkAsync(document, document.styleSheets[i].href);
            }
            for (let j = 0; j < rules.length; j++) {
                let rule = rules[j];
                rulesList.push(rule.cssText);
            }
        }
        return [...new Set(rulesList)];
    }

    return getCrossDomainCSSRules;
}));
