(function () {
    function getRandomInt(max) {
        return Math.floor(Math.random() * (max));
    }

    function log(msg) {
        console.log(`[chickenify.js] ${msg}`);
    }

    function prettyChicken(text) {
        let textTrimLength = text.replace(/\s+/," ").length;
        let chicken = "Chicken ";
        let countChickens = textTrimLength / chicken.length;
        if (countChickens < 1) {
            return chicken.substr(0, Math.ceil(countChickens * chicken.length));
        } else {
            return chicken.repeat(Math.floor(countChickens)).trim();
        }
    }

    function chickenifyNode(path, node, params) {
        //log(path);
        try {
            if (node.nodeType === 3) {
                if (!node.data.match(/^\s+$/)) {
                    //log(`chickenified: ${node.data.replace(/\s+/," ").substring(0, Math.max(node.data.length, 60))}`);
                    node.data = prettyChicken(node.data);
                }
            } else if (node.nodeType === 8) { // ignore comments
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
                    node.style.backgroundSize = "contain"; // contain or cover
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
            throw e;
        }
    }

    function chickenify(chickenURLs) {
        chickenifyNode("/body", document.body, {chickenURLs: chickenURLs});
    }

    browser.runtime.onMessage.addListener((message) => {
        return new Promise((resolve, reject) => {
            if (message.command === "chickenify") {
                try {
                    chickenify(message.chickenURLs);
                    resolve("Chickenify worked");
                } catch (e) {
                    reject(e);
                }
            } else {
                reject(Error("bad message"));
            }
        });
    });

})();