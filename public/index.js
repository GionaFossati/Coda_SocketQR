/* var socket = io.connect("http://localhost:4000") */
var socket = new WebSocket('ws://localhost:3000');

Webcam.set({
    width: 320,
    height: 240,
    image_format: 'jpeg',
});
Webcam.attach('#my_camera');


setTimeout(snapAndSend, 5000);

function snapAndSend() {
    setInterval(() => {

        Webcam.snap((data_uri) => {

            socket.send(data_uri);

        })
    }, 100)
};
socket.addEventListener('message', (msg) => {
    var color = random_rgba();
    console.log(color)
    output.innerHTML = '<p style=\'color:' + color + ';\'>' + msg.data + '</p></n>';
});

function random_rgba() {
    var o = Math.round,
        r = Math.random,
        s = 255;
    return 'rgba(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ',1)';
}