var ngine = ngine || {};
ngine.manager = ngine.manager || {};
(function(ns)
{
	// event class
	var EngineEvent = new Class({
		initialize: function(type, data)
		{
			this.type = type;
			this.data = data;
		}
	});
	
	// sprite manager class
	var EventManager = new Class({
	
		// constructor
		initialize: function()
		{
			this.listeners = [];
		},
		
		addEventListener: function(event_type, event_listener)
		{
			this.listeners.push({ type: event_type, callback: event_listener });
		},
		
		removeEventListener: function(listener)
		{
			// todo..
		},
		
		dispatchEvent: function(event)
		{
			for (var i=0; i < this.listeners.length; i++)
			{
				if (this.listeners[i].type == event.type)
				{
					if (this.listeners[i].callback != undefined) this.listeners[i].callback(event.data);
				}
			}
		}
		
	});
	
	// expose
	ns.manager.EventManager = EventManager;
	ns.EngineEvent = EngineEvent;
	
	// add global event manager
	ns.eventManager = new EventManager();
})(ngine);