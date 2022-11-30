var Screen = new function(){
	var that = this

	this.buffer = new Array(cfg.canvas.h/cfg.chars.h);
	this.savedBuffer = new Array(cfg.canvas.h/cfg.chars.h)

	this.updateForced = false

	this.context = document.getElementById("screen-canvas").getContext("2d");

	this.mask = null

	var that = this
	for (var y = 0; y < this.buffer.length; y++){
		this.buffer[y] = new Array(cfg.canvas.w/cfg.chars.w)
		this.savedBuffer[y] = new Array(cfg.canvas.w/cfg.chars.w)
	}
	for (var y = 0; y < this.buffer.length; y++){
		for (var x = 0; x < this.buffer[y].length; x++){
			this.buffer[y][x] = Text.makeChar(' ')
			this.savedBuffer[y][x] = Text.makeChar(' ')
		}
	}
	this.forceUpdate = function(){
		that.updateForced = true
	}
	this.setCharacter = function(x, y, char, drawmode, target){
		if (target == undefined){
			target = this.buffer
		}

		if (target[y] == undefined || target[y][x] == undefined){
			return
		}

		// Mask is a BA-T string. Don't draw if its first character
		// is not the destination character
		if (that.mask != null && !Text.sameChar(target[y][x],that.mask[0][0])){
			return
		}

		if (drawmode == undefined || drawmode == 0){ // Alpha mode
			if (char.char != " "){
				target[y][x] = char			
			}
		}else if (drawmode == 1){ // Replace mode
			target[y][x] = char
		}else if (drawmode == 2){ // Accent alpha mode
			target[y][x] = {
				char: target[y][x].char,
				accent: char.accent || target[y][x].accent
			}
		}else if (drawmode == 3){ // Accent replace mode
			target[y][x] = {
				char: target[y][x].char,
				accent: char.accent
			}
		}else if (drawmode == 4){ // Accent flip mode
			if (char.accent){
				target[y][x].accent = !target[y][x].accent
			}
		}
	}
	// Returns a COPY of the object. Avoids altering the buffer accidentally.
	this.getCharacter = function(x, y){
		return {
			char: this.buffer[y][x].char,
			accent: this.buffer[y][x].accent
		}
	}
	this.outputBuffer = function(){
		var font = cfg.font
		var savedDraws = 0
		for (var y = 0; y < this.buffer.length; y ++){
			for (var x = 0; x < this.buffer[y].length; x ++){
				var savedChar = this.savedBuffer[y][x]
				if (savedChar.char != this.buffer[y][x].char || 
					savedChar.accent != this.buffer[y][x].accent || this.updateForced){
					this.outputChar(x,y,font)
				}else{
					savedDraws += 1
				}
				this.savedBuffer[y][x] = this.getCharacter(x, y)
			}
		}
		this.updateForced = false
	}
	// Prints one character from the buffer
	this.outputChar = function(x,y,font){
		var curCell = this.buffer[y][x]
		var charIndex = cfg.chars.map.indexOf(curCell.char);
		
		var canX = x * cfg.chars.w
		var canY = y * cfg.chars.h

		
		// TODO: Save a buffer with the different characters 
		// (need to reload this buffer on the change of the font)
		Screen.context.drawImage(
			font,
			charIndex * 8,
			curCell.accent ? 8 : 0,
			cfg.chars.w,
			cfg.chars.h,
			x*cfg.chars.w,
			y*cfg.chars.h,
			cfg.chars.w,
			cfg.chars.h
		)
	}
	// String is an array of char objects, not a javascript string.
	this.printAt = function(x,y,string,drawmode,target){
		if (target == undefined){
			target = this.buffer
		}

		y = Math.floor(y)
		x = Math.floor(x)
		// console.log(JSON.stringify(string))
		for (var row = 0; row < string.length; row ++){
			for (var col = 0; col < string[row].length; col ++){
				this.setCharacter(col + x,row + y,string[row][col],drawmode,target)
			}
		}
	}
	this.printWrap = function(y,string,drawmode,target){
		if (target == undefined){
			target = this.buffer
		}

		var x = 0
		var y = Math.floor(y)
		for (var row = 0; row < string.length; row ++){
			x = 0
			for (var col = 0; col < string[0].length; col ++){
				this.setCharacter(x,row + y,string[row][col],drawmode,target)
				x ++
				if (x > 29){
					x = 0
					y ++
				}
			}
			y  ++
		}
		
	}
	this.drawLine = function(x1,y1,x2,y2,string,drawmode,target){
		if (target == undefined){
			target = this.buffer
		}
		// Ensures drawing of the endpoints, in case of rounding errors.
		this.printAt(Math.round(x1),Math.round(y1),string,drawmode,target)
		this.printAt(Math.round(x2),Math.round(y2),string,drawmode,target)

		var dx = x2-x1
		var dy = y2-y1

		var steps = Math.abs(dx) > Math.abs(dy) ? Math.abs(dx) : Math.abs(dy)

		var xInc = dx / steps
		var yInc = dy / steps

		var x = x1
		var y = y1
		for (var i=0; i < steps; i++){
			this.printAt(Math.round(x),Math.round(y),string,drawmode,target)
			x += xInc
			y += yInc
		}
	}
	this.drawRect = function(x1,y1,x2,y2,string,drawmode,target){
		if (target == undefined){
			target = this.buffer
		}

		this.drawLine(x1,y1,x2,y1,string,drawmode,target) // Top
		this.drawLine(x2,y1,x2,y2,string,drawmode,target) // Right
		this.drawLine(x1,y2,x2,y2,string,drawmode,target) // Bottom
		this.drawLine(x1,y1,x1,y2,string,drawmode,target) // Left
	}
	this.drawRectFill = function(x1,y1,x2,y2,string,drawmode,target){
		if (target == undefined){
			target = this.buffer
		}

		// Draw a horizontal line for every y position in the rect		
		if (y1 < y2){
			for (var y = y1; y <= y2; y ++){
				this.drawLine(x1,y,x2,y,string,drawmode,target)
			}
		} else {
			for (var y = y1; y >= y2; y --){
				this.drawLine(x1,y,x2,y,string,drawmode,target)
			}
		}
	}
	this.drawCirc = function(x,y,r,string,drawmode,target){
		if (target == undefined){
			target = this.buffer
		}

		lastX = x + r
		lastY = y
		for (var angle = 0; angle < (Math.PI * 2); angle += 0.01){
			curX = Math.round(x + (Math.cos(angle) * r))
			curY = Math.round(y + (Math.sin(angle) * r))
			this.drawLine(lastX,lastY,curX,curY,string,drawmode,target)
			lastX = curX
			lastY = curY
		}
	}
	this.drawCircFill = function(x,y,r,string,drawmode,target){
		if (target == undefined){
			target = this.buffer
		}

		for (var angle = 0; angle < (Math.PI); angle += 0.01){
			curX = Math.round(x + (Math.cos(angle) * r))
			curY = Math.round(y + (Math.sin(angle) * r))
			ncurX = Math.round(x + (Math.cos(- angle) * r))
			ncurY = Math.round(y + (Math.sin(- angle) * r))
			this.drawLine(ncurX,ncurY,curX,curY,string,drawmode,target)
		}
	}
	var clearBufferString = Text.makeString("                                    ")
	this.clearBuffer = function(string,drawmode,target){
		if (target == undefined){
			target = this.buffer
		}
		
		for (var y = 0; y < this.buffer.length; y ++){
			// (var x = 0; x < this.buffer[y].length; x ++){
				this.printAt(0,y,clearBufferString,drawmode,target)
			//}
		}
	}
}