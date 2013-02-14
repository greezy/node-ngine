ngine.iso = ngine.iso || {};
(function(ns)
{
	ns.TILEMAP_READY_EVENT = "onTilemapReady";

	// Tilemap Class
	var Tilemap = new Class({
		Extends: ngine.manager.SpriteManager,
		
		initialize: function(target, width, height)
		{
			// set width and height of grid (in tiles)
			this.gridHeight = height;
			this.gridWidth = width;
			
			// call SpriteManager constructor
			this.parent(target);
			
			// (re)set default size
			this.size.height = 1000;
			this.size.width = 1000;
			this.setSize();
			
			// create tile grid
			this.map = [];
			this.tiles = [];
			
			// should we render next time?
			this.shouldRender = false;
			
			// tell sprites to ignore offsets b/c they are handled through canvas rendering here
			//this.ignoreOffsets = true;
			
			// set assets
			this.assets = ["assets/tile-grass.png", "assets/tile-grass-tall.png", "assets/tile.png", "assets/tile2.png", "assets/tile3.png", "assets/tile4.png", "assets/hover.png"];
			this.loadedAssets = [];
			
			// load images
			this.load();
		},
		
		// load assets
		load: function()
		{
			var images_loaded = 0;
			var images_total = this.assets.length;
			var scope = this;
			
			for (var i = 0; i < images_total; i++)
			{
				// asset
				var asset_path = this.assets[i];
				
				// image
				var img = new Image();
				img.asset_path = asset_path;
				img.onload = function()
				{	
					scope.loadedAssets.push({
						asset: this.asset_path,
						image: this
					});
					
					console.log("image loaded "+(images_loaded+1)+" path: "+this.asset_path);
					
					images_loaded++;
					if (images_loaded == images_total) 
					{
						console.log("all images loaded! -- drawing");
						scope.draw();
					}
				}
				
				img.src = asset_path;
			}
		},
		
		getLoadedAsset: function(path)
		{
			for (var i = 0; i < this.loadedAssets.length; i++)
			{
				if (this.loadedAssets[i].asset == path)
				{
					return this.loadedAssets[i].image;
				}
			}
			
			return null;
		},
		
		// translate world position to iso position
		getIsoPosition: function(worldX, worldY)
		{	
			var x = worldX - this.renderOffset.x;
			var y = worldY - this.renderOffset.y;
			
			var _x = ((2 * y + x) / 2);
			var _y = ((2 * y - x) / 2);
			
			var tileX = Math.round(_x / ((this.tileHeight + 1) - 1)) - 1;
			var tileY = Math.round(_y / ((this.tileHeight + 1) - 1));
			
			return { x: tileX, y: tileY };
		},
		
		// get position of tile in world space
		getPosition: function(isoX, isoY)
		{
			var coords = { x: 0, y: 0 };
			
			// create coords
			coords.x = (isoX * (this.tileWidth / 2)) - (isoY * (this.tileWidth / 2));
			coords.y = (isoX * (this.tileHeight / 2)) + (isoY * (this.tileHeight / 2));
			
			return coords;
		},
		
		// set the position of the hover tile
		setHoverPosition: function(pos)
		{
			if (this.map[pos.x] != undefined && this.map[pos.x][pos.y] != undefined && this.map[pos.x][pos.y] == 0)
			{
				this.hoverSprite.position = this.getPosition(pos.x, pos.y);
				this.hoverSprite.position.x += this.renderOffset.x;
				this.hoverSprite.position.y += this.renderOffset.y;
				
				this.hoverSprite.visible = true;
			}
			else
			{
				this.hoverSprite.position.x = 999999;
				this.hoverSprite.position.y = 999999;
				this.hoverSprite.visible = false;
			}
		},
		
		createHoverTile: function()
		{
			var hover_image = this.getLoadedAsset("assets/hover.png");
			
			this.hoverSprite = new ngine.sprite.FlatSprite(hover_image);
			this.hoverSprite.depth = 50000;
		},
		
		draw: function()
		{
			var tile_image = this.getLoadedAsset("assets/tile-grass.png");
			var tile_use_image = this.getLoadedAsset("assets/tile-grass-tall.png");
			
			// measurements
			var tileWidth = tile_image.width - 2;
			var tileHeight = tile_image.height - 1;
			
			this.tileWidth = tileWidth;
			this.tileHeight = tileHeight;
			
			for (var x = 0; x < this.gridWidth; x++)
			{
				this.map[x] = [];
				this.tiles[x] = [];
				for (var y = 0; y < this.gridHeight; y++)
				{
					// block tile by default
					this.map[x].push(1);
				
					var spr;
					//if (x % 2 == 1 && y % 2 == 1)
					//{
						spr = new ngine.sprite.FlatSprite(tile_use_image);
				//	}
					//else
				//	{
					//	spr = new ngine.sprite.FlatSprite( this.getLoadedAsset(this.assets[Math.floor(Math.random()*(this.assets.length-1))]) );
					//}
					
					// isometric formula
					var coords = { x: 0, y: 0 };
					
					coords.x = (x * (tileWidth / 2)) - (y * (tileWidth / 2));
					coords.y = (x * (tileHeight / 2)) + (y * (tileHeight / 2));
					
					coords.z = 0;
					
					// modify coords.y by z
					if (coords.z != undefined)
					{
					//	coords.y -= (coords.z * 10);
					//	spr.depth = (coords.z * 10);
					}
					else
					{
						coords.z = 0;
					}
					
					// sprite properties
					spr.depth = coords.y;
					spr.position = coords;
					
			//		if (x % 4 != 1 || y % 4 == 1)
				//	{
					if (x % 5 != 1 && y % 5 != 1 || y % 6 == 1 || x % 6 == 1)
					{
						this.map[x][y] = 0;
						
						// add it to self
						this.tiles[x][y] = spr;
						
						this.addSprite(spr);
					}
					//}
				}
			}
			
			this.shouldRedraw = true;
			this.shouldDepthSort = true;
			
			// create hover tile
			this.createHoverTile();
			
			// initial render
			this.render();
			
			// should be ready to go now so dispatch our ready event
			var evt = new ngine.EngineEvent(ns.TILEMAP_READY_EVENT, this);
			ngine.eventManager.dispatchEvent(evt);
		},
		
		removeTile: function(x, y)
		{
			if (this.tiles[x][y] != undefined)
			{
				this.map[x][y] = 1;
				this.removeSprite(this.tiles[x][y]);
				this.shouldRedraw = true;
			}
		},
		
		render: function()
		{
			if (this.shouldRedraw)
			{
				// call parent
				this.parent();
				
				// flip buffer to context
				this.flipBuffer();
			}
			
		}
	});
	
	ns.Tilemap = Tilemap;
})(ngine.iso);