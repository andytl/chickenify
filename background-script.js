(function () {
    function log(msg) {
        console.log(`[background-script.js] ${msg}`);
    }

    function onError(error) {
        log(`onError: ${error}`);
    }

    function onSuccess(success) {
        log(`onSuccess: ${success}`);
    }

    function sendChickenNotification(tabId) {
        return browser.tabs.sendMessage(tabId, {
            command: "chickenify",
            chickenURLs: [
                //browser.extension.getURL("images/chicken.png"),
                browser.extension.getURL("images/chicken2.png"),
                browser.extension.getURL("images/chicken3.png"),
                browser.extension.getURL("images/chicken4.png"),
                browser.extension.getURL("images/chicken5.png")
            ]
        });
    }

    function handleClick(tab) {
        log("Calling chickenify.js now")
        browser.tabs.executeScript(tab.id, {
            allFrames: true,
            file: "/content_scripts/chickenify.js"
        })
            .then(sendChickenNotification.bind(null, tab.id))
            .then(onSuccess)
            .catch(onError);
    }

    browser.browserAction.onClicked.addListener(handleClick);
})();