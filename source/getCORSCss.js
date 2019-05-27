(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(factory);
    } else if (typeof exports === "object") {
        module.exports = factory();
    } else {
        root.getCrossDomainCSSRules = factory();
    }
}(typeof window !== 'undefined' ? window : this, function () {
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

    function isCrossOriginEnabledForLink(document, link) {
        for (let i = 0; i < document.styleSheets.length; i++) {
            if (document.styleSheets[i].href === link && document.styleSheets[i].ownerNode.crossOrigin) {
                return true;
            }
        }
        return false;
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
