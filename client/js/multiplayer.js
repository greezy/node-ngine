// multiplayer with socket.io
var NGINE_MULTIPLAYER_HOST = "192.168.1.8";

var ngine_multiplayer = (function() {

	var scope = {};
	
	var socket = io.connect('http://' + NGINE_MULTIPLAYER_HOST + ':8081/');
	
	socket.on('connect', function () {

		socket.on('message', function (msg) {
			msg = JSON.parse(msg);
			console.log("message:");
			console.log(msg);
			
			if (msg.type == "joined")
			{
				ngine.eventManager.addEventListener(ngine.room.ROOM_EVENTS.ROOM_READY, function(room) {
					socket.send(JSON.stringify({ type: "roomready" }));
					
					ngine.eventManager.addEventListener(ngine.room.ROOM_EVENTS.HOVERTILE_CLICKED, function(pos) {
						pos.type = "move";
						socket.send(JSON.stringify(pos));
					});
				});
				
				Game.Engine.DisplayRoom();
			}
			else if (msg.type == "avatar")
			{
				if (!socket.rc) socket.rc = Game.Engine.GetRoomController();
				socket.rc.addAvatar(msg.id, msg);
			}
			else if (msg.type == "move")
			{
				socket.rc.getAvatar(msg.id).walkTo(msg.x, msg.y);
			}
		});
		
	});
	
	scope.socket = socket;
	scope.connect = function() { socket.send(JSON.stringify({ type: "sup" })); }
	
	return scope;

})();

window.ngine_multiplayer = ngine_multiplayer;
ngine_multiplayer.connect();

console.log(ngine_multiplayer);