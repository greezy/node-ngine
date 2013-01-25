ngine.iso = ngine.iso || {};
(function(ns)
{
	var Furniture = new Class({
		Extends: ngine.sprite.Sprite,
		
		// constructor
		initialize: function(tile_map, furniture_options)
		{
			window['FURNI_DEBUG'] = this;
			// call parent constructor
			this.parent();
			
			// set local reference to tilemap
			this.tileMap = tile_map;
			
			// set options (& defaults)
			this.options = furniture_options || { x: 8, y: 8, offset: { x: 0, y: 0 }, path: null };
			
			// set current iso position
			this.isoPosition = { x: this.options.x, y: this.options.y };
			
			// set current positon
			this.position = tile_map.getPosition(this.isoPosition.x, this.isoPosition.y);
			
			// if we have an offset, set it or default
			if (this.options.offset != null)
			{
				this.furnitureOffset = this.options.offset;
			}
			else
			{
				this.furnitureOffset = { x: 0, y: 0 };
			}
			
			if (this.options.image != undefined)
			{
				this.image = this.options.image;
			}
			else
			{
				if (this.options.path != null)
				{
					// load the furniture
					this.image_loader = new Image();
					this.image_loader.onload = this.onLoadEvent.bind(this);
					this.image_loader.src = this.options.path;
				}
			}
			
			this.depth = this.position.y;
			
			// object manager
			if (this.manager != undefined) this.manager.shouldDepthSort = true;
		},
		
		onLoadEvent: function()
		{
			// image loaded
			this.image = this.image_loader;
		},
		
		render: function(canvas)
		{
			if (this.image == null) return;
			if (this.manager != null) this.renderOffset = this.manager.renderOffset;
			
			var actualPosition = { x: this.position.x, y: this.position.y };
			
			// add furniture
			actualPosition.x += this.furnitureOffset.x;
			actualPosition.y += this.furnitureOffset.y;
			
			// add render offset
			actualPosition.x += this.renderOffset.x;
			actualPosition.y += this.renderOffset.y;
			
			canvas.context.drawImage(this.image, actualPosition.x, actualPosition.y);
		}
	});
	
	ngine.iso.Furniture = Furniture;
})(ngine.iso);