var FontEditor = new function(){
	var that = this
	this.inputString = ""
	this.currentChar = "a"
	this.cursorX = 4
	this.cursorY = 4

	this.keyboardLayout = [
		['`',"1","2","3","4","5",'6','7','8','9','0','-','='],
		['q','w','e','r','t','y','u','i','o','p','[',']','\\'],
		['a','s','d','f','g','h','j','k','l',';',"'"],
		['z','x','c','v','b','n','m',',','.','/']
	]
	this.shiftedLayout = [
		['~','!','@','#','$','%','^','&','*','(',')','_','+'],
		['Q','W','E','R','T','Y','U','I','O','P','{','}','|'],
		['A','S','D','F','G','H','J','K','L',':','"'],
		['Z','X','C','V','B','N','M','<','>','?']

	]

	this.loop = function(){
		
		// Draw the keyboard grid
		var startX = 1
		var startY = 18

		for (var row = 0; row < that.keyboardLayout.length; row++){
			for (var col = 0; col < that.keyboardLayout[row].length; col++){
				var string = that.keyboardLayout[row][col]
				if (that.currentChar == string){
					string += "⛛"
				}
				Screen.printAt(startX+col,startY+row,Text.makeString(string))
			}
		}

		// Draw the shifted keyboard grid
		var startX = 16
		var startY = 18

		for (var row = 0; row < that.shiftedLayout.length; row++){
			for (var col = 0; col < that.shiftedLayout[row].length; col++){
				var string = that.shiftedLayout[row][col]
				if (that.currentChar == string){
					string += "⛛"
				}
				Screen.printAt(startX+col,startY+row,Text.makeString(string))
			}
		}


		// Find the character position
		//console.log(cfg.chars.map.indexOf(that.currentChar))
		var imageData = cfg.fontCtx.getImageData(cfg.chars.map.indexOf(that.currentChar)*8,0,8,8)
		//console.log(JSON.stringify(imageData.data))
		var startX = 12
		var startY = 5
		var arrayPos = 0
		for (var row = 0; row < 8; row ++){
			for (var col = 0; col < 8; col++){
				//console.log(imageData.data[arrayPos])
				if (imageData.data[arrayPos] != 0){
					var string = "P"
					if (row == that.cursorY && col == that.cursorX){
						string = "P⛛"
					}
					Screen.printAt(startX+col,startY+row,Text.makeString(string))
				}else{
					var string = "Q"
					if (row == that.cursorY && col == that.cursorX){
						string = "Q⛛"
					}
					Screen.printAt(startX+col,startY+row,Text.makeString(string),1)
				}
				arrayPos += 4
			}
		}


		// Update input
		that.inputString = ""
		that.inputString = Input.applyKeys(that.inputString,0)
		if (that.inputString.length == 1){
			if (that.inputString.charAt(0) != " "){
				that.currentChar = that.inputString.charAt(0)
			}else{
				var imageData = cfg.fontCtx.getImageData(cfg.chars.map.indexOf(that.currentChar)*8,0,8,8)
				if (imageData.data[that.cursorX * 4 + (that.cursorY * 4 * 8)] == 0){
					cfg.fontCtx.fillStyle = "#FFFFFF"
					cfg.fontCtx.fillRect(that.cursorX + cfg.chars.map.indexOf(that.currentChar)*8,that.cursorY,1,1)
					cfg.fontCtx.fillStyle = "#FF0000"
					cfg.fontCtx.fillRect(that.cursorX + cfg.chars.map.indexOf(that.currentChar)*8,that.cursorY+8,1,1)
				}else{
					cfg.fontCtx.fillStyle = "#000000"
					cfg.fontCtx.fillRect(that.cursorX + cfg.chars.map.indexOf(that.currentChar)*8,that.cursorY,1,1)
					cfg.fontCtx.fillRect(that.cursorX + cfg.chars.map.indexOf(that.currentChar)*8,that.cursorY+8,1,1)
				}
				Screen.forceUpdate()
			}
		}

		// Reset the screen
		StateMachine.drawMenuBar()
		Screen.outputBuffer()
		Screen.clearBuffer(Text.makeString(" "),1)
	}
	this.hotKey = function(hotKey){
		StateMachine.hotKey(hotKey)
		if (hotKey == "UP"){
			that.cursorY --
			if (that.cursorY < 0){
				that.cursorY = 7
			}
		}
		if (hotKey == "DOWN"){
			that.cursorY ++
			if (that.cursorY > 7){
				that.cursorY = 0
			}
		}
		if (hotKey == "LEFT"){
			that.cursorX --
			if (that.cursorX < 0){
				that.cursorX = 7
			}
		}
		if (hotKey == "RIGHT"){
			that.cursorX ++
			if (that.cursorX > 7){
				that.cursorX = 0
			}
		}

	}
}