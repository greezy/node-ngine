var ngine = ngine || {};
ngine.sprite = ngine.sprite || {};
(function(ns)
{
	// ngine.sprite.Sprite: Base sprite class
	ns.FlatSprite = new Class({
		Extends: ns.Sprite,
		
		// creates a basic sprite, given an image
		initialize: function(image)
		{
			// set local reference to image
			this.image = image;
			
			// call parent constructor
			this.parent();
			
			// set local size
			this.size = { width: image.width, height: image.height };
			
			// default render offset
			this.renderOffset = { x: 0, y: 0 };
		},
		
		render: function(canvas)
		{
			if (this.manager != null && this.manager.ignoreOffsets != true) this.renderOffset = this.manager.renderOffset;
			canvas.context.drawImage(this.image, (this.renderOffset.x+this.position.x), (this.renderOffset.y+this.position.y));
		}
	});
	
})(ngine.sprite);