// serve the client on port 8080 through the simple server
var static = require('node-static');
var fileServer = new static.Server('../client', { cache: false });

var io = require('socket.io').listen(8081);
var active_clients = [];

require('http').createServer(function (request, response) {
    request.addListener('end', function () {
        fileServer.serve(request, response);
    });
}).listen(8080);

io.sockets.on('connection', function (socket) {
  
  var new_client = {
	socket: socket,
	name: "guest"
  };
  
  active_clients.push(new_client);
  
  socket.on('message', function (msg) 
  {
	var packet = JSON.parse(msg);
	
	if (packet.type == "sup")
	{
		new_client.x = 0;
		new_client.y = 0;
	}
	
	if (packet.type == "move")
	{
		new_client.x = packet.x;
		new_client.y = packet.y;
		console.log('client ' + new_client.name + ' moving to ' + new_client.x + ":" + new_client.y);
	}
	
	if (packet.type == "refresh")
	{
		var result = { avatars : [] };
		for (var i = 0; i < active_clients.length; i++)
		{
			var client = active_clients[i];
			result.avatars.push({ });
		}
	}
  });
  
  socket.on('disconnect', function () 
  {
	var disconnected_client;
	for (var i = 0; i < active_clients.length; i++)
	{
		if (active_clients[i] != undefined && active_clients[i].socket == socket) disconnected_client = active_clients.splice(i, 0);
	}
	
	console.log('client disconnected. ' + active_clients.length + ' remaining.');
  });
});