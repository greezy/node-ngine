var Game = Game || {};
Game.Config = GameConfig;

Game.Run = function()
{	
    // Load room and initialize
    $script(['ngine/iso/tilemap', 'a_star', 'ngine/iso/avatar', 'ngine/iso/furniture', 'ngine/room/roomcontroller'], function() {
        var room_controller = new ngine.room.RoomController(canvas_manager);
        room_controller.setSize({
            width: document.width,
            height: document.height
        });
    
        window.is_editing = false;
    
        var avatar = null;
        ngine.eventManager.addEventListener(ngine.room.ROOM_EVENTS.ROOM_READY, function(room) {
            room.addAvatar("test", {
                x: 5,
                y: 5
            });
            avatar = room.getAvatar("test");
        });
    
        ngine.eventManager.addEventListener(ngine.room.ROOM_EVENTS.HOVERTILE_CLICKED, function(pos) {
            if (!window.is_editing) {
                if (avatar != null) avatar.walkTo(pos.x, pos.y);
            }
            else {
                room_controller.tilemap_manager.removeTile(pos.x, pos.y);
            }
        });
    
        window.onresize = function() {
            room_controller.setSize({
                width: document.width,
                height: document.height
            });
        }
    
        window.setInterval(function() {
            room_controller.render();
        }, (1 / Game.Config.FPS_TARGET) * 1000);
    });
}