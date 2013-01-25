ngine.room = ngine.room || {};
(function(ns)
{	

	ns.ROOM_EVENTS = {
		ROOM_READY: "roomReady",
		HOVERTILE_CLICKED: "hoverClick"
	};

	var RoomController = new Class({
	
		// room controller init
		initialize: function(canvas_manager, options)//, options)
		{
			// set our local copy of options
			this.options = options || {
				
				gridWidth: 5,
				gridHeight: 5,
				size: { width: 800, height: 600 }
				
			};
			
			// size
			this.size = this.options.size;
			
			// set local reference to our canvas manager
			this.canvas_manager = canvas_manager;
			
			// create our sprite manager
			this.sprite_manager = new ngine.manager.SpriteManager(this.canvas_manager);
			
			// resize sprite manager
			this.sprite_manager.size = this.options.size;
			this.sprite_manager.setSize();
			
			// set height and width of canvas manager
			this.canvas_manager.canvas.width = this.sprite_manager.size.width;
			this.canvas_manager.canvas.height = this.sprite_manager.size.height;
			
			// create tilemap
			this.createTileMap();
			
			// set cursor
			this.canvas_manager.canvas.style.cursor = "pointer";
			
			// add drag handlers
			this.addDragHandlers();
			
			// create object layer
			this.object_manager = new ngine.manager.SpriteManager(this.sprite_manager);
			this.object_manager.size = this.tilemap_manager.size;
			this.object_manager.setSize();
			
			// always redraw object layer
			this.object_manager.alwaysRedraw = true;
			
			// create avatar array
			this.avatars = [];
			
			// add event listener for our tilemap's ready
			ngine.eventManager.addEventListener(ngine.iso.TILEMAP_READY_EVENT, this.onTileMapReady.bind(this));
		},
		
		// public
		render: function()
		{
			// set render offset
			this.object_manager.renderOffset = this.tilemap_manager.renderOffset;
		
			// clear layers that need to be cleared
			this.canvas_manager.clear();
			this.sprite_manager.clear();
			
			// draw tile & object layer
			this.tilemap_manager.render();
			
			if(this.tilemap_manager.hoverSprite != undefined && this.tilemap_manager.hoverSprite.visible) this.tilemap_manager.hoverSprite.render(this.sprite_manager.canvas);
			this.object_manager.render();
			
			// flip buffer
			this.sprite_manager.flipBuffer();
		},
		
		setSize: function(new_size)
		{
			this.sprite_manager.size.width = new_size.width;
			this.sprite_manager.size.height = new_size.height;
			this.sprite_manager.setSize();
			
			this.canvas_manager.canvas.width = this.sprite_manager.size.width;
			this.canvas_manager.canvas.height = this.sprite_manager.size.height;
			
			this.tilemap_manager.size = this.sprite_manager.size;
			this.tilemap_manager.setSize();
			this.tilemap_manager.shouldRedraw = true;
			
			this.object_manager.size = this.tilemap_manager.size;
			this.object_manager.setSize();
		},
		
		// public avatar functions
		addAvatar: function(id, position)
		{
			var av = new ngine.iso.Avatar(this.tilemap_manager, {
				id: id,
				startPosition: position
			});
			
			this.object_manager.addSprite(av);
			this.avatars.push(av);
		},
		
		getAvatar: function(id)
		{
			for (var i = 0; i < this.avatars.length; i++)
			{
				if (this.avatars[i].options.id == id) return this.avatars[i];
			}
			return null;
		},
		
		removeAvatar: function(id)
		{
			for (var i = 0; i < this.avatars.length; i++)
			{
				if ( this.avatars[i].options.id == id )
				{
					var avatar = this.avatars[i];
					this.avatars.splice(i, 1);
					this.object_manager.removeSprite(avatar);
				}
			}
		},
		
		// event handlers
		onTileMapReady: function()
		{
			// fire our ready event
			ngine.eventManager.dispatchEvent(new ngine.EngineEvent(ngine.room.ROOM_EVENTS.ROOM_READY, this));
		},
		
		// protected functions
		addDragHandlers: function()
		{
			this.start_dragging = false;
			
			// add dragging
			this.canvas_manager.canvas.onmousedown = function(evt)
			{
				this.start_dragging = true;
				this.start_position = { x: evt.offsetX, y: evt.offsetY };
			}.bind(this);
			
			canvas_manager.canvas.onmousemove = function(evt)
			{
				if (this.start_dragging)
				{
					var current_position = { x: evt.offsetX, y: evt.offsetY };
					if (this.__num_diff(current_position.x, this.start_position.x) || this.__num_diff(current_position.y, this.start_position.y))
					{
						this.start_dragging = false;
						this.is_dragging = true;
						this.start_position = { x: evt.offsetX, y: evt.offsetY };
					}
				}
				
				if (this.is_dragging)
				{
					var end_position = { x: evt.offsetX, y: evt.offsetY };
					var newOffset = { x: (end_position.x - this.start_position.x), y: (end_position.y - this.start_position.y) };
					this.start_position = end_position;
					
					this.tilemap_manager.renderOffset.x += newOffset.x;
					this.tilemap_manager.renderOffset.y += newOffset.y;
					
					this.tilemap_manager.shouldRedraw = true;
					this.tilemap_manager.hoverSprite.visible=false;
				}
				
				// set hover position
				this.tilemap_manager.setHoverPosition(this.tilemap_manager.getIsoPosition(evt.offsetX, evt.offsetY));
			}.bind(this);
			
			canvas_manager.canvas.onmouseup = function(evt)
			{
				if (!this.is_dragging)
				{
					// move test avatar
					var pos = this.tilemap_manager.getIsoPosition(evt.offsetX, evt.offsetY);
					//console.log('clicked on tile: '+pos.x+","+pos.y);
					//test_avatar.walkTo(pos.x, pos.y);
					ngine.eventManager.dispatchEvent(new ngine.EngineEvent(ngine.room.ROOM_EVENTS.HOVERTILE_CLICKED, pos));
				}
				
				this.start_dragging = false;
				
				if (this.is_dragging)
				{
					var end_position = { x: evt.offsetX, y: evt.offsetY };
					
					var newOffset = { x: (end_position.x - this.start_position.x), y: (end_position.y - this.start_position.y) };
					
					this.tilemap_manager.renderOffset.x += newOffset.x;
					this.tilemap_manager.renderOffset.y += newOffset.y;
					
					// should render
					this.tilemap_manager.shouldRedraw = true;
					
					this.is_dragging = false;
				}
			}.bind(this);
		},
		
		createTileMap: function()
		{
			this.tilemap_manager = new ngine.iso.Tilemap(this.sprite_manager, this.options.gridWidth, this.options.gridHeight);
			this.tilemap_manager.size = this.sprite_manager.size;
			this.tilemap_manager.setSize();
		},
		
		__num_diff: function(x, y)
		{
			if (x < (y - 5)) return true;
			if (x > (y + 5)) return true;
			return false;
		}
		
	});
	
	ns.RoomController = RoomController;
})(ngine.room);