var Input = new function(){
	this.keyBuffer = []
	// The array which INPUT statements use to read from.
	// Values are popped from it when input must be taken.
	this.justPressed = []
	var that = this

	this.buffer_key_at = function(key, i){
		var keyName = KeyCode.get_name(key)
		return that.keyBuffer[i] == keyName || 
		(that.keyBuffer[i].charAt(1) == "⛛" && that.keyBuffer[i].charAt(0) == keyName) ||
		that.keyBuffer[i] == KeyCode.get_shifted_name(key) ||
		(that.keyBuffer[i].charAt(1) == "⛛" && that.keyBuffer[i].charAt(0) == KeyCode.get_shifted_name(key));
	}
	this.buffer_contains = function(keyName){
		for (var i = 0; i < that.keyBuffer.length; i ++){
			if (that.buffer_key_at(keyName,i)){
				return true
			}
		}
		return false
	}

	document.onkeydown = function(e){
		var e = e || window.event
		KeyCode.key_down(e)
		if (e.keyCode != 123){
			e.preventDefault()
		}

		if (e.keyCode == 90 && StateMachine.state == 0 && Home.menu[Home.menuPos] == "load"){
			document.getElementById("loadfile").click()
		}

		var key = KeyCode.translate_event(e)
		var bufferString = ""
		if (KeyCode.get_name(key) != "SHIFT" && 
			KeyCode.get_name(key) != "CTRL" && 
			KeyCode.get_name(key) != "ALT" &&
			KeyCode.get_name(key) != "TAB"){

			if (KeyCode.is_code_down(16)){ // If shift is down
				bufferString = KeyCode.get_shifted_name(key)
			}else{
				bufferString = KeyCode.get_name(key)
			}

			if (KeyCode.is_code_down(9)){ // If Tab is down
				if (bufferString.length == 1){
					bufferString += "⛛"
				}
			}
			if (!that.buffer_contains(key)){
				that.keyBuffer.push(bufferString)
				that.justPressed.push(bufferString)
			}
		}

		

		return false
	}
	document.onkeyup = function(e){
		var e = e || window.event
		KeyCode.key_up(e)
		if (e.keyCode != 123){
			e.preventDefault()
		}

		var key = KeyCode.translate_event(e)

		for (var i = 0; i < that.keyBuffer.length; i ++){
			// If the keyBuffer name at i is keyName or it is 2 characters and the first character matches
			if (that.buffer_key_at(key, i)){
					that.keyBuffer.splice(i,1)
			}
		}
		return false
	}	

	document.onblur = function(e){
		that.keyBuffer = []
	}
	this.stringInsert = function(substring,string,pos){
		return string.substring(0,pos) + substring + string.substring(pos)
	}
	this.stringRemove = function(string,pos,numChars){
		if (numChars > 0){
			return string.substring(0,pos) + string.substring(pos+numChars)
		}else{ // numChars <= 0
			return string.substring(0,pos+numChars) + string.substring(pos)
		}
	}
	this.applyKeys = function(inputString,pos,cursor){
		var newInput = Input.justPressed.pop()
		if (newInput != undefined){
			if (newInput == "BACKSPACE"){
				if (inputString.charAt(pos-1) == "⛛"){
					inputString = that.stringRemove(inputString,pos,-2)
					if (cursor != undefined){
						cursor.position -= 2
					}
				}else{
					inputString = that.stringRemove(inputString,pos,-1)
					if (cursor != undefined){
						cursor.position -= 1
					}
				}
			}else if (newInput == "SPACE"){
				inputString = that.stringInsert(" ",inputString,pos)
				if (cursor != undefined){
					cursor.position ++
				}
			}else if (newInput == "ENTER"){
				inputString = that.stringInsert("\n",inputString,pos)
				if (cursor != undefined){
					cursor.position ++
				}
			}else if (newInput == "DELETE"){
				if (inputString.charAt(pos+1) == "⛛"){
					inputString = that.stringRemove(inputString,pos,2)
				}else{
					inputString = that.stringRemove(inputString,pos,1)
				}
			}else if (newInput == "CAPS_LOCK"){
			}else if (newInput == "LEFT"){
				if (cursor != undefined){
					cursor.position --
					if (inputString.charAt(cursor.position) == "⛛"){
						cursor.position --
					}
					cursor.show = true
				}
				
				StateMachine.currentScreen.hotKey("LEFT")
				
			}else if (newInput == "RIGHT"){
				if (cursor != undefined){
					cursor.position ++
					if (inputString.charAt(cursor.position) == "⛛"){
						cursor.position ++
					}
					cursor.show = true
				}
				StateMachine.currentScreen.hotKey("RIGHT")
			}else if (newInput == "UP"){
				if (cursor != undefined){
					var location = that.findCursorLocation(cursor.position,cursor.code)
					cursor.position = that.findClosestPosition(location.x,location.y-1,cursor.position,cursor.code)
				}
				StateMachine.currentScreen.hotKey("UP")
			}else if (newInput == "DOWN"){
				if (cursor != undefined){
					var location = that.findCursorLocation(cursor.position,cursor.code)
					cursor.position = that.findClosestPosition(location.x,location.y+1,cursor.position,cursor.code)
				}
				StateMachine.currentScreen.hotKey("DOWN")
			}else{
				inputString = that.stringInsert(newInput,inputString,pos)
				if (cursor != undefined){
					if (newInput.charAt(1) == "⛛"){
						cursor.position += 2
					}else{
						cursor.position ++
					}
				}
			}
		}
		//console.log(inputString)

		return inputString
	}
	this.findCursorLocation = function(curPos,code){
		var cursorX = 0
		var cursorY = 0
		for (var pos = 0; pos < curPos; pos ++){
			cursorX ++
			if (code.charAt(pos) == "\n"){
				cursorX = 0
				cursorY ++
			}
			if (code.charAt(pos) == "⛛"){
				cursorX --
			}
			if (cursorX >= 30 && code.charAt(pos) != "\n"){
				cursorY ++
				cursorX = 0
			}
			
		}
		return {
			x:cursorX,
			y:cursorY
		}
	}
	this.findClosestPosition = function(goalX,goalY,curPos,code){
		var closestX = -1
		var closestPos = -1
			console.log(goalY)
		for(var pos = curPos - 40; pos < curPos + 40; pos ++){
			var location = that.findCursorLocation(pos,code)
			if (location.y == goalY){
				if (Math.abs(location.x-goalX) < Math.abs(closestX-goalX)){
					closestX = location.x
					if (closestX == goalX){
						console.log("short")
						return pos
					}
					closestPos = pos
				}
			}
		}
		console.log(closestPos)
		return closestPos
	}
}
