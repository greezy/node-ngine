ngine.iso = ngine.iso || {};
(function(ns)
{
	var AVATAR_STATES = {
		AVATAR_IDLE: 0,
		AVATAR_WALKING: 1,
		AVATAR_HOLDING: 2
	};

	// Avatar Class
	var Avatar = new Class({
		Extends: ngine.sprite.Sprite,
		
		// constructor
		initialize: function(tile_map, options)
		{
			// call parent constructor
			this.parent();
			
			this.options = options || {};
			
			// create the object we will use to store our avatar frames (loaded from spritesheet definition)
			this.frames = {};
			this.currentFrame = null;
			
			// set local reference to tilemap
			this.tileMap = tile_map;
			
			// set our current state
			this.state = AVATAR_STATES.AVATAR_IDLE;
			
			// set avatar offset
			this.avatarOffset = { x: -20, y: -65 };
			
			// set current iso position
			this.isoPosition = this.options.startPosition || { x: 5, y: 5 };
			
			// load the avatar image
			this.avatarImage = new Image();
			this.avatarImage.onload = this.onLoadEvent.bind(this);
			this.avatarImage.src = "assets/avatar/avatar.png";
		},
		
		// avatar loaded
		onLoadEvent: function()
		{	
			// synchronously load the spritesheet definition file
			var xmlhttp = new XMLHttpRequest();
			xmlhttp.open("GET", "assets/avatar/avatar.txt", false);
			xmlhttp.send(null);
			
			// got spritesheet definition, so parse it.
			var spritesheet_definition = xmlhttp.responseText;
			var lines = spritesheet_definition.split("\n");
			
			for (var i = 0; i < lines.length; i++)
			{
				// parse out name and location/size details
				var frame_parts = lines[i].split(" = ");
				if (frame_parts[1] == undefined) continue;
				
				var frame_name = frame_parts[0];
				var frame_details = frame_parts[1].split(" ");
				
				var frame_number = 0;
				var direction = "";
				if (frame_name.length == 3)
				{
					direction = frame_name[0] + frame_name[1];
					frame_number = parseInt(frame_name[2]);
				}
				
				if (frame_name.length == 2) 
				{
					direction = frame_name[0];
					frame_number = parseInt(frame_name[1]);
				}
				
				// x y width height
			//	console.log(frame_details);
				var frame = {
					name: frame_name,
					direction: direction,
					number: frame_number,
					x: parseInt(frame_details[0]),
					y: parseInt(frame_details[1]),
					width: parseInt(frame_details[2])+5,
					height: parseInt(frame_details[3])
				};
				
				this.frames[frame_name] = frame;
			}
			
			this.currentFrame = this.frames['NW0'];
			this.position = this.tileMap.getPosition(this.isoPosition.x, this.isoPosition.y);
			
			console.log("Avatar Loaded!");
			
			this.stepCount = 0;
			this.stepInterval = window.setInterval(this.step.bind(this), 35);
			
			// do we need to change paths?
			this.changePath = false;
		},
		
		walkTo: function(toX, toY)
		{
			if (this.tileMap.map[toX] != undefined && this.tileMap.map[toX][toY] != undefined && this.tileMap.map[toX][toY] == 0)
			{
				if (this.state != AVATAR_STATES.AVATAR_WALKING || this.state == AVATAR_STATES.AVATAR_HOLDING)
				{
					this.path = [];
					this.find_path_astar(this.isoPosition.x, this.isoPosition.y, toX, toY);
					this.state = AVATAR_STATES.AVATAR_WALKING;
				}
				else
				{
					// put avatar in hold state, so we can stop at next tile.
					this.changePath = true;
					this.walkToNext = { x: toX, y: toY };
				}
			}
		},
		
		find_path_astar: function(from_x, from_y, to_x, to_y)
		{
			this.path = a_star([from_x, from_y], [to_x, to_y], this.tileMap.map, this.tileMap.gridWidth, this.tileMap.gridHeight);
			this.path = this.path.reverse();
		},
		
		// as named -- shitty 'path finding' function.
		shitty_find_path: function(from_x, from_y, to_x, to_y)
		{
			this.path = [];
			
			var done = false;
			var curX = from_x;
			var curY = from_y;
			while (!done)
			{
				var step = this.shitty_find_path_step(curX, curY, to_x ,to_y);
				if (step == null)
				{
					done = true;
					continue;
				}
				
				curX = step.x;
				curY = step.y;
				
				this.path.push(step);
			}
			
			this.path.reverse();
		},
		
		shitty_find_path_step: function(from_x, from_y, to_x, to_y)
		{
			if (from_x < to_x)
				return { x: from_x + 1, y: from_y };
			
			if (from_x > to_x)
				return { x: from_x - 1, y: from_y };
				
			if (from_y < to_y)
				return { x: from_x, y: from_y + 1 };
				
			if (from_y > to_y)
				return { x: from_x, y: from_y - 1 };
				
			return null;
		},
		
		// walking step
		step: function()
		{
			this.stepCount++;
			
			if (this.path == null)
			{
				// make sure our current frame is set to 0
				if (this.currentFrame.number != 0 && this.state != AVATAR_STATES.AVATAR_WALKING)
				{
					this.currentFrame = this.frames[this.currentFrame.direction + 0];
					
					// while we are here, make sure we are in the idle state
					this.state = AVATAR_STATES.AVATAR_IDLE;
					
					// clear temp step interval
				//	clearInterval(this.stepInterval);
				}
				
				// done with step
				return;
			}
			else
			{
				if (this.path.length == 0 && this.state != AVATAR_STATES.AVATAR_WALKING)
				{
					// null path and call step again so we go back to idle state.
					this.path = null;
					this.step();
					
					// we're done here.
					return;
				}
			}
			
			if (this.state == AVATAR_STATES.AVATAR_WALKING)
			{
				// check if we have reached a destination
				if (this.destination != undefined && this.position.x == this.destination.x && this.position.y == this.destination.y)
				{
					//console.log('we have reached our destination!! '+this.destination.tile.x+","+this.destination.tile.y);
					// null out the destination -- go find the next one.
					
					// set isoPosition to new location
					this.isoPosition.x = this.destination.tile.x;
					this.isoPosition.y = this.destination.tile.y;
					
					// set destination to null
					this.destination = null;
					
					// check if we need to change path -- if so, set state to holding and call walk_to
					if (this.changePath)
					{
						this.changePath = false;
						this.state = AVATAR_STATES.AVATAR_HOLDING;
						this.walkTo(this.walkToNext.x, this.walkToNext.y);
					}
				}
				
				if (this.destination == undefined)
				{
					// get next tile
					var nextTile = this.path.pop();
					
					// if we don't have next tile, we're finished walking. go back to idle.
					if (nextTile == undefined)
					{
						// set idle state
						this.state = AVATAR_STATES.AVATAR_IDLE;
						
						this.path = null;
						this.step();
						return;
					}
					
					// okay, set our destination to this tile
					this.destination = this.tileMap.getPosition(nextTile.x, nextTile.y);
					this.destination.tile = nextTile;
				//	console.log('going to: '+nextTile.x+","+nextTile.y+" - loc:"+this.destination.x+","+this.destination.y+" my loc:"+this.position.x+","+this.position.y);
					
					// .. and null out heading so we know to find a new one.
					this.heading = null;
				}
				
				// okay, we should have a destination now
				//console.log('walking to destination: '+this.destination.x+","+this.destination.y);
				
				// do we have a heading?
				if (this.heading == null)
				{
				//	console.log('finding heading..');
					var difference = { x: this.destination.x - this.position.x, y: this.destination.y - this.position.y };
					difference.x = Math.round(difference.x / 10);
					difference.y = Math.round(difference.y / 10);
					
					if (difference.x == 0 && difference.y < 0)
					{
						this.heading = "N";
					}
					
					if (difference.x > 0 && difference.y < 0)
					{
						this.heading = "NE";
					}
					
					if (difference.x > 0 && difference.y == 0)
					{
						this.heading = "E";
					}
					
					if (difference.x > 0 && difference.y > 0)
					{
						this.heading = "SE";
					}
					
					if (difference.x == 0 && difference.y > 0)
					{
						this.heading = "S";
					}
					
					if (difference.x < 0 && difference.y > 0)
					{
						this.heading = "SW";
					}
					
					if (difference.x < 0 && difference.y == 0)
					{
						this.heading = "W";
					}
					
					if (difference.x < 0 && difference.y < 0)
					{
						this.heading = "NW";
					}
				}
				
				// awesome, now step..
				switch(this.heading)
				{
					case 'N':
						this.position.y -= 2;
						break;
						
					case 'S':
						this.position.y += 2;
						break;
						
					case 'E':
						this.position.x += 2;
						break;
						
					case 'W':
						this.position.x -= 2;
						break;
						
					case 'NE':
						this.position.x += 2;
						this.position.y -= 1;
						break;
						
					case 'NW':
						this.position.x -= 2;
						this.position.y -= 1;
						break;
						
					case 'SE':
						this.position.x += 2;
						this.position.y += 1;
						break;
						
					case 'SW':
						this.position.x -= 2;
						this.position.y += 1;
						break;
				}
				
				// lazy -- instead of fixing directions, write code to correct directions
				this.textHeading = this.heading;
				
				if (this.heading == 'NE') this.textHeading = 'NW';
				if (this.heading == 'SE') this.textHeading = 'SW';
				if (this.heading == 'NW') this.textHeading = 'NE';
				if (this.heading == 'SW') this.textHeading = 'SE';
				if (this.heading == 'E') this.textHeading = 'W';
				if (this.heading == 'W') this.textHeading = 'E';
				
				if (this.stepCount % 5 == 1)
				{
					// if we reach frame 5 (doesn't exist) pop back to frame 1
					if (this.animFrame == 4) this.animFrame = 1;
					
					if (this.animFrame == undefined)
					{
						this.animFrame = 1;
					}
					else
					{
						this.animFrame++;
					}
				}
				
				// actual movement is done, now change our facing frame
				this.currentFrame = this.frames[this.textHeading + this.animFrame];
				
				if (this.currentFrame == undefined) this.currentFrame = this.frames.NE0;
				
				// set depth
				this.depth = this.position.y;
				
				// object manager
				if (this.manager != undefined) this.manager.shouldDepthSort = true;
			}
		},
		
		render: function(canvas)
		{
			if (this.avatarImage == undefined) return;
			if (this.currentFrame == null) return;
			if (this.manager != null) this.renderOffset = this.manager.renderOffset;
			
			var actualPosition = { x: this.position.x, y: this.position.y };
			
			// add avatar offset
			actualPosition.x += this.avatarOffset.x;
			actualPosition.y += this.avatarOffset.y;
			
			// add render offset
			actualPosition.x += this.renderOffset.x;
			actualPosition.y += this.renderOffset.y;
			
		//	actualPosition.x += 50;
		//	actualPosition.y += 50;
			
			canvas.context.drawImage(this.avatarImage, this.currentFrame.x, this.currentFrame.y, this.currentFrame.width, this.currentFrame.height, actualPosition.x, actualPosition.y, this.currentFrame.width, this.currentFrame.height);
		}
	});
	
	// expose to namespace
	ns.AVATAR_STATES = AVATAR_STATES;
	ns.Avatar = Avatar;
})(ngine.iso);