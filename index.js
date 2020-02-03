const jsQR = require("jsqr");
var express = require('express');
/* var socket = require('socket.io'); */
var atob = require('atob');
var jpeg = require('jpeg-js');
const WebSocket = require('ws');
var objects = {
    "sphere": false,
    "pyramid": false,
    "cube": false
};

var lastObjects = {
    "sphere": false,
    "pyramid": false,
    "cube": false
};

const wss = new WebSocket.Server({
    port: 3000
});

// App setup
var app = express();
var clients = [];

// Static files
app.use(express.static('coda-extensions/public'));
app.listen(3030, function () {
    console.log('Example app listening on port 3030!')
})
app.listen(3031, function () {
    console.log('Example app listening on port 3031!')
})

// Socket setup & pass server 
wss.on('connection', function connection(ws) {
    console.log('made socket connection' + ws);
    clients.push(ws);
    ws.on('message', function incoming(msg) {
        let data = msg;
        var jpegBase64 = data.replace('data:image/jpeg;base64,', '');

        var decodedPNG = _base64ToArrayBuffer(jpegBase64);
        var rawImageData = jpeg.decode(decodedPNG, true);

        var codeChecked = jsQR(rawImageData.data, 320, 240)

        if (codeChecked) {
            console.log(codeChecked.location.topLeftCorner)
            switch (codeChecked.data) {
                case 'SPHERE':
                    console.log('SPHERE recognized');
                    objects.sphere = true;
                    objects.cube = false;
                    objects.pyramid = false;
                    break;
                case 'PYRAMID':
                    console.log('PYRAMID recognized');
                    objects.sphere = false;
                    objects.cube = false;
                    objects.pyramid = true;
                case 'CUBE':
                    console.log('CUBE recognized');
                    objects.sphere = false;
                    objects.cube = true;
                    objects.pyramid = false;
                    break;

            }

            ws.send(codeChecked.data);

        } else {
            objects.sphere = false;
            objects.cube = false;
            objects.pyramid = false;
        }

        let objectHasChanged = false;
        for (let key of Object.keys(objects)) {
            if (objects[key] !== lastObjects[key]) {
                objectHasChanged = true;
                objects = lastObjects;   
            }
        }

        if (objectHasChanged) {
            clients.forEach(function (client) {
                client.send(JSON.stringify(lastObjects));
            });
        }
    });

});

function _base64ToArrayBuffer(base64) {
    var binary_string = atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}
