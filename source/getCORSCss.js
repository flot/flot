import "regenerator-runtime/runtime";
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
 * Get origin CORS link and its parent.
 * @param {Object} document means current document element.
 * @param {String} link A href string which not set "crossOrigin" attr and is CORS compared to current domain.
 * @returns {Object} A object that returns origin link and its parent
 */
function getCrossOriginLinkAndParent(document, link) {
    const linkList = document.getElementsByTagName('link');

    for (let i = 0; i < linkList.length; i++) {
        if (linkList[i].href === link && !linkList[i].crossOrigin) {
            return {
                parentNode: linkList[i].parentElement,
                node: linkList[i],
            };
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
            const linkBundle = getCrossOriginLinkAndParent(document, link);
            newLink.onload = function() {
                promiseMap.delete(link);
                linkBundle.node.remove();
                resolve();
            };
            linkBundle.parentNode.insertBefore(newLink, linkBundle.node);
        });
        promiseMap.set(link, linkPromise);
        return linkPromise;
    }
    return promiseMap.get(link);
}

/**
 * Create a new link element which is CORS and set crossOrigin attribute on Safari.
 * Safari will create the new link and load ready synchronously.
 * @param {Object} document which is current document element.
 * @param {String} link A href string which not set "crossOrigin" attr and is CORS compared to current domain.
 */
function enableSafariCrossOriginOnLinkAsync(document, link) {
    if (!isCrossOriginEnabledForLink(document, link)) {
        const newLink = document.createElement('link');
        newLink.rel = 'stylesheet';
        newLink.href = link;
        newLink.crossOrigin = 'anonymous';
        const linkBundle = getCrossOriginLinkAndParent(document, link);
        linkBundle.parentNode.insertBefore(newLink, linkBundle.node);
        linkBundle.node.remove();
    }
}

export const getCrossDomainCSSRules = async function(document) {
    const rulesList = [];
    for (let i = 0; i < document.styleSheets.length; i++) {
        // in Chrome, the external CSS files are empty when the page is directly loaded from disk
        let rules = [];
        let isSafari = false;
        try {
            rules = document.styleSheets[i].cssRules;
            if (rules === null
                && document.styleSheets[i].href
                && !document.styleSheets[i].href.includes(document.styleSheets[i].ownerNode.baseURI)
                && !document.styleSheets[i].ownerNode.crossOrigin) {
                rules = [];
                isSafari = true;
                throw new TypeError('on Safari, the CORS cssRule Exception will be ignored and return null, which should be an error');
            }
        } catch (err) {
            if (isSafari) {
                enableSafariCrossOriginOnLinkAsync(document, document.styleSheets[i].href);
            } else {
                await enableCrossOriginOnLinkAsync(document, document.styleSheets[i].href);
            }
            i--;
        }
        for (let j = 0; j < rules.length; j++) {
            const rule = rules[j];
            rulesList.push(rule.cssText);
        }
    }
    return rulesList;
};