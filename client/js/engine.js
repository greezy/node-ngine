var Game = Game || {};
Game.Engine = Game.Engine || {};
Game.Config = Game.Config || GameConfig || {};

(function(){
    
    var engine_ready = false;
    var room_controller = null;
    
    // load the engine files
    Game.Engine.Load = function(callback)
    {
         if (engine_ready) return;
         
         $script(['ngine/iso/tilemap', 'a_star', 'ngine/iso/avatar', 'ngine/iso/furniture', 'ngine/room/roomcontroller'], function() {
             engine_ready = true;
             if (callback != null) callback();
         });
    }
    
    Game.Engine.Start = function()
    {
        // engine load must be called before this
        if (!engine_ready) throw new Error("Engine must be loaded before Start is called!");
    }
	
	Game.Engine.DisplayRoom = function()
	{
		room_controller = new ngine.room.RoomController(canvas_manager);
        Game.Engine.RegisterHandlers();
        
        // Handle initial sizing
        Game.Engine.HandleResize();
	}
	
	Game.Engine.GetRoomController = function() { return room_controller; }
    
    Game.Engine.HandleResize = function()
    {
        if (room_controller == null) return;
        room_controller.setSize({
            width: document.width,
            height: document.height
        });
    }
    
    // register event handlers
    Game.Engine.RegisterHandlers = function()
    {
        if (room_controller == null) return;
        
        window.onresize = function() {
            Game.Engine.HandleResize();
        }
    
        Game.Engine.UpdateInterval = window.setInterval(function() {
            if (room_controller == null) return;
            room_controller.render();
        }, (1 / Game.Config.FPS_TARGET) * 1000);
        
		/*
        // ngine events
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
		*/
    }
    
    Game.Engine.IsReady = function()
    {
        return engine_ready;
    }
    
})();