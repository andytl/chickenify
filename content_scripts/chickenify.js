(function () {
    /**
     * Check and set a global guard variable.
     * If this content script is injected into the same page again,
     * it will do nothing next time.
     */
    if (window.hasRun) {
        return;
    }
    window.hasRun = true;
/*
    let supportedTags = new Set(["div", "body", "span", "nav", "ul", "li",
        "ol", "header", "a", "p", "main", "footer", "section", "strong",
        "table", "tr", "td", "th", "thead", "tbody", "h1", "h2", "h3", "h4",
        "link", "label", "form", "input", "button", "textarea"]);
*/
    function getRandomInt(max) {
        return Math.floor(Math.random() * (max));
    }

    function log(msg) {
        console.log(`[chickenify.js] ${msg}`);
    }

    function prettyChicken(text) {
        let chicken = "Chicken";
        let countChickens = text.length / chicken.length;
        if (countChickens < 1) {
            return chicken.substr(0, Math.ceil(countChickens * chicken.length));
        } else {
            return (chicken + " ").repeat(Math.floor(countChickens)).trim();
        }
    }

    /**
     * Remove every beast from the page.
     */
    function chickenifyNode(path, node, params) {
        //log(path);
        try {
            if (node.nodeType === 3) {
                if (!node.data.match(/^\s+$/)) {
                    //log(`chickenified: ${node.data.replace(/\s+/," ").substring(0, Math.max(node.data.length, 60))}`);
                    node.data = prettyChicken(node.data);
                }
            } else if (node.nodeType === 1) {
                //log("at " + path);
                let randomIdx = getRandomInt(params.chickenURLs.length);
                let nodeStyle = window.getComputedStyle(node);
                if (nodeStyle &&
                        nodeStyle.backgroundImage !== "" &&
                        nodeStyle.backgroundImage !== "none") {
                    //log(`at ${path}, replacing bg image, image was ${nodeStyle.backgroundImage}`);
                    let imgH = nodeStyle.height, imgW = nodeStyle.width;
                    node.style.backgroundImage = `url("${params.chickenURLs[randomIdx]}")`;
                    node.height = imgH;
                    node.width = imgW;
                }
                if ("childNodes" in node && node.childNodes.length > 0) {
                    for (let child of node.childNodes) {
                        var newPath = `${path}/${child.nodeName.toLowerCase()}`;
                        chickenifyNode(newPath, child, params);
                    }
                } else if (node.nodeName.toLowerCase() === "img") {
                    let imgH = node.height, imgW = node.width;
                    node.src = params.chickenURLs[randomIdx];
                    if (node.srcset !== undefined && node.srcset !== "") {
                        node.srcset = params.chickenURLs[randomIdx];
                    }
                    node.height = imgH;
                    node.width = imgW;
                } else if (node.innerText) { // if we have text, replace it.
                    //log(`chickenified: ${node.innerText.replace(/\s+/," ").substring(0, Math.max(node.innerText.length, 60))}`);
                    node.innerText = prettyChicken(node.innerText);
                }
            } else {
                log(`unknown node! ${path} - ${node.name}, ${node.nodeType}`)
            }
        } catch (e) {
            log(`Exception at  ${path} - ${node.name}, ${e}`);
        }
    }

    function chickenify(chickenURLs) {
        chickenifyNode("/body", document.body, {chickenURLs: chickenURLs});
    }

    browser.runtime.onMessage.addListener((message) => {
        //TODO can we return something?
        if (message.command === "chickenify") {
            chickenify(message.chickenURLs);
        } else {
            log("bad message");
        }
    });

})();