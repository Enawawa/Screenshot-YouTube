// chrome.webNavigation.onHistoryStateUpdated.addListener(function(data) {
// 	chrome.tabs.get(data.tabId, function(tab) {
// 		chrome.tabs.executeScript(data.tabId, {code: 'if (typeof AddScreenshotButton !== "undefined") { AddScreenshotButton(); }', runAt: 'document_start'});
// 	});
// }, {url: [{hostSuffix: '.youtube.com'}]});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status == 'loading' && tab.url.includes('.youtube.com')) {
        fetch(chrome.runtime.getURL('icon.svg'))
            .then(response => response.text())
            .then(data => {
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    function: function(svgData) {
                        if (window.AddScreenshotButton) {
                            AddScreenshotButton(svgData);
                        }
                    },
                    args: [data]
                });
            });
    }
});