var ngine = ngine || {};
ngine.sprite = ngine.sprite || {};
(function(ns)
{
	// ngine.sprite.Sprite: Base sprite class
	ns.Sprite = new Class({
		
		// constructor
		initialize: function()
		{
			// manager
			this.manager = null;
			
			// position - specified in X,Y cordinates
			this.position = { x: 0, y: 0 };
			
			// depth - depth (relative to sprite manager)
			this.depth = 0;
			
			// size - width and height of this sprite
			this.size = { width: 0, height: 0 };
			
			// visibility
			this.visible = true;
		},
		
		update : function()
		{
		},
		
		render : function(canvas)
		{
		}
		
	});
})(ngine.sprite);