var ngine = ngine || {};
ngine.manager = ngine.manager || {};
(function(ns)
{
	// sprite manager class
	ns.SpriteManager = new Class({
		Extends: ngine.sprite.Sprite,
		
		// constructor
		initialize: function(target)
		{
			// call parent constructor
			this.parent();
			
			// set local type
			this.__type = "SpriteManager";
			
			// store local reference to our (target) canvas.
			this.target = target;
			
			// default render offset
			this.renderOffset = { x: 0, y: 0 };
			
			// default width and height
			this.size = { height: 400, width: 400 };
			
			// create array of sprites we will manage
			this.sprites = [];
			
			// create our new canvas
			this.canvas = new ngine.manager.Canvas();
			
			// create our context
			this.context = this.canvas.context;
			
			// depth sort
			this.shouldDepthSort = false;
			
			// always redraw?
			this.alwaysRedraw = false;
			
			// buffer to render around (default: 100px)
			this.bufferSpace = 100;
			
			// set default size
			this.setSize();
		},
		
		setSize: function()
		{
			this.canvas.canvas.width = this.size.width;
			this.canvas.canvas.height = this.size.height;
		},
		
		clear: function()
		{
			this.canvas.context.clearRect(0, 0, this.size.width, this.size.height);
		},
		
		// todo - removeSprite
		addSprite: function(spr)
		{
			// call depth sort and redraw next render.
			this.shouldDepthSort = true;
			
			spr.manager = this;
			this.sprites.push(spr);
		},
		
		removeSprite: function(spr)
		{
			for (var i = 0; i < this.sprites.length; i++)
			{
				if (this.sprites[i] == spr)
				{
					// remove from array
					this.sprites.splice(i, 1);
					return;
				}
			}
		},
		
		// update function - calls update(); for all sprites.
		update: function()
		{
			for (var i = 0; i < this.sprites.length; i++)
			{
				this.sprites[i].update();
			}
		},
		
		sort: function()
		{
			this.sprites.sort(function(a, b){
				return a.depth - b.depth;
			});
		},
		
		// render function - render the sprites contained here to the canvas
		render: function()
		{
			if (this.shouldDepthSort == true)
			{
				// reset
				this.shouldDepthSort = false;
				
				// set redraw
				this.shouldRedraw = true;
				
				// call sort
				this.sort();
			}
		
			if (this.shouldRedraw || this.alwaysRedraw)
			{
				this.shouldRedraw = false;
				this.clear();
				for (var i = 0; i < this.sprites.length; i++)
				{
					// check bounds
					this.sprites[i].render(this.canvas);
				}
			}
			
			//this.target.clear();
			//
			
			this.flipBuffer();
		},
		
		// flip buffer
		flipBuffer: function()
		{
			this.target.context.drawImage(this.canvas.canvas, this.position.x, this.position.y);
		}
	});
})(ngine.manager);