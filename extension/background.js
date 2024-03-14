chrome.webNavigation.onHistoryStateUpdated.addListener(function(data) {
	chrome.tabs.get(data.tabId, function(tab) {
		chrome.tabs.executeScript(data.tabId, {file: 'page.js', code: 'if (typeof AddScreenshotButton !== "undefined") { AddScreenshotButton(); }', runAt: 'document_start'});
	});
}, {url: [{hostSuffix: '.youtube.com'}]});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete') {
        fetch(chrome.runtime.getURL('icon.svg'))
            .then(response => response.text())
            .then(data => {
                chrome.tabs.sendMessage(tabId, {svg: data});
            });
    }
});