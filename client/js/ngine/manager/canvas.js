var ngine = ngine || {};
ngine.manager = ngine.manager || {};
(function(ns)
{
	ns.Canvas = new Class({
	
		// constructor
		initialize: function(canvas)
		{
			// find canvas in element or use canvas sent to constructor
			if (typeof(canvas) == "string")
			{
				this.canvas = document.getElementById(canvas);
			}
			else if (canvas == undefined)
			{
				this.canvas = document.createElement("canvas");
			}
			else
			{
				this.canvas = canvas;
			}
			
			this.context = this.canvas.getContext('2d');
		},
		
		clear: function()
		{
			this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		}
	});
})(ngine.manager);