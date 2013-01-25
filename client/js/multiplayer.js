// multiplayer with socket.io
var NGINE_MULTIPLAYER_HOST = "localhost";
var socket = io.connect('http://' + NGINE_MULTIPLAYER_HOST + ':8081/');

socket.on('connect', function () {
	socket.send(JSON.stringify({ type: "sup" }));

	socket.on('message', function (msg) {
	  // my msg
	});
});