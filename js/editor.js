var Editor = new function(){
	var that = this
	var code = ""
	console.log(code.split("\n"))
	var cursor = {position:0, show:false, code:code}
	var step = 0
	var scroll = 0
	this.hotKey = function(hotkey){
		StateMachine.hotKey(hotkey)
	}
	this.getCode = function(){
		return code
	}
	this.setCode = function(cd){
		code = cd
	}
	this.loop = function(){
		step ++
		code = Input.applyKeys(code,cursor.position,cursor)
		cursor.code = code
		var lines = code.split("\n")
		var lineOffset = 0
		for (var line = 0; line < lines.length; line ++){
			var ln = Text.makeString(lines[line])
			Screen.printWrap(lineOffset+scroll,ln,1)
			lineOffset += 1 + Math.floor(ln[0].length/30)
		}

		if (cursor.position > code.length){
			cursor.position = code.length
		}else if(cursor.position < 0){
			cursor.position = 0
		}

		// Find the cursor x and y based on index in code.
		var cursorLocation = Input.findCursorLocation(cursor.position,code)
		var cursorX = cursorLocation.x
		var cursorY = cursorLocation.y

		if (cursorY + scroll <= 0){
			scroll += 1
		}
		if (cursorY + scroll >= 23){
			scroll -= 1
		}


		if (step % 30 == 0){
			cursor.show = !cursor.show
		}
		if (cursor.show){
			Screen.printAt(cursorX,cursorY+scroll,Text.makeString("_⛛"),1)
		}else{
			Screen.printAt(cursorX,cursorY+scroll,Text.makeString("_⛛"),3)
		}

		StateMachine.drawMenuBar()
		Screen.outputBuffer()
		Screen.clearBuffer(" ",1)
	}



}