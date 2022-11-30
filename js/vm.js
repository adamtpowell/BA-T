var Vm = new function(){
	var that = this

	this.reset = function(){
		
		Screen.clearBuffer(" ",1)
		Screen.printAt(0,0,Text.makeString("compiling..."),1)
		Screen.outputBuffer()

		// Delay the rest of the code so that "compliling..." can actually show.
		window.setTimeout(()=>{
			var codeString = Editor.getCode()

			// No code to compile
			if (codeString.replace(/ /g,"").length == 0){
				Screen.clearBuffer(" ",1)
				Screen.printWrap(0,Text.makeString("e:empty code"),0)
				Screen.outputBuffer()
				return
			}

			var tokens = Tokenizer.tokenize()

			// Tokenization failed
			if (tokens == -1){
				Screen.clearBuffer(" ",1)
				Screen.printWrap(0,Text.makeString("e:unclosed string"),1)
				Screen.outputBuffer()
				return
			}

			that.code = Compiler.compile(tokens)

			// Compilation failed
			if (that.code == -1){
				return
			}
			
			// Data for the VM
			that.vars = {
				"width":cfg.canvas.w/cfg.chars.w,
				"height":cfg.canvas.h/cfg.chars.h
			}
			that.stack = []
			that.gosubStack = []
			that.forStack = []

			that.pointer = 0

			that.lineNumber = 0

			Screen.clearBuffer(" ",1)
			that.running = true

			console.log("CODE:")
			console.log(that.code)
		},1)
	}
	// All functions, commands, and operators live here
	this.commands = {
		goto:function(){
			var numargs = that.stack.pop()
			if (that.numargError(numargs,1)) return

			var targetLine = that.stack.pop()

			var tempPointer = that.setPointerToLine(targetLine)
			
			return Math.floor(tempPointer / 10) + 1
		},
		gosub:function(){
			var numargs = that.stack.pop()
			if (that.numargError(numargs,1)) return

			var targetLine = that.stack.pop()

			that.gosubStack.push(that.pointer)

			var tempPointer = that.setPointerToLine(targetLine)

			return Math.floor(tempPointer / 10) + 1
		},
		return:function(){
			var numargs = that.stack.pop()
			if (that.numargError(numargs,0)) return

			var location = that.gosubStack.pop()

			that.pointer = location

			return 1
		},
		if:function(){
			var condition = that.stack.pop()
			
			// Condition is true
			if (condition != 0){
				return 1
			}

			// Moves pointer to next line or the next else statement
			while (that.code[that.pointer] != undefined && that.code[that.pointer][0] != "ln" && that.code[that.pointer][0] != "else"){
				that.pointer ++
			}
			that.pointer--

			return 1
		},
		ln:function(){
			that.lineNumber = that.code[that.pointer][1]
			return 0
		},
		numargs:function(arg){
			that.stack.push(arg)
			return 0
		},
		else:function(){
			
			return 0
		},
		log:function(){
			var in1 = that.stack.pop()
			console.log(in1)
			Screen.printAt(0,0,Text.makeString(in1 + "                                      "),2)
			return 1
		},
		push:function(arg){
			if (typeof arg == "string"){
				arg = Text.makeString(arg)
			}
			that.stack.push(arg)
			return 1
		},
		assign:function(arg){
			var in1 = that.stack.pop()
			that.vars[arg] = in1
			return 1
		},
		pushVar:function(arg){
			that.stack.push(that.vars[arg])
			return 1
		},
		"+":function(arg){

			var in1
			var in2

			if (arg == 1){
				var in1 = that.stack.pop()
				var in2 = that.stack.pop()
			}else{
				var in2 = that.stack.pop()
				var in1 = that.stack.pop()
			}

			if (Text.isString(in1) && Text.isString(in2)){
				var str1 = Text.getStringString(in1)
				var str2 = Text.getStringString(in2)
				var strConcat = str1 + str2
				that.stack.push(Text.makeString(strConcat))
				return 2
			}else{
				that.stack.push(in1+in2)
				return 1
			}
		},
		"unary_+":function(){
			var in1 = that.stack.pop()
			that.stack.push(in1)
			return 1
		},
		"unary_-":function(){
			var in1 = that.stack.pop()
			that.stack.push(-in1)
			return 1
		},
		"-":function(arg){
			var in1 = that.stack.pop()
			var in2 = that.stack.pop()
			if (arg == 1){
				that.stack.push(in1-in2)
			}else{
				that.stack.push(in2-in1)
			}
			return 1
		},
		"/":function(arg){
			var in1 = that.stack.pop()
			var in2 = that.stack.pop()
			if (arg == 1){
				that.stack.push(in1/in2)
			}else{
				that.stack.push(in2/in1)
			}
			return 1
		},
		"\\":function(arg){
			var in1 = that.stack.pop()
			var in2 = that.stack.pop()
			if (arg == 1){
				that.stack.push(Math.floor(in1/in2))
			}else{
				that.stack.push(Math.floor(in2/in1))
			}
			return 1
		},
		"*":function(){
			var in1 = that.stack.pop()
			var in2 = that.stack.pop()
			that.stack.push(in1*in2)
			return 1
		},
		"and":function(){
			var in1 = that.stack.pop()
			var in2 = that.stack.pop()
			that.stack.push((in1 != 0 && in2 != 0) ? 1 : 0)
			return 1
		},
		"not":function(){
			var in1 = that.stack.pop()
			that.stack.push((in1 == 0) ? 1 : 0)
			return 1
		},
		"or":function(){
			var in1 = that.stack.pop()
			var in2 = that.stack.pop()
			that.stack.push((in1 != 0 || in2 != 0) ? 1 : 0)
			return 1
		},
		"mod":function(arg){
			var in1 = that.stack.pop()
			var in2 = that.stack.pop()
			if (arg == 1){
				that.stack.push(in1%in2)
			}else{
				that.stack.push(in2%in1)
			}
			return 1
		},
		"<>":function(){
			var in1 = that.stack.pop()
			var in2 = that.stack.pop()
			if (Text.isString(in1)){
				in1 = Text.getStringString(in1)
			}
			if (Text.isString(in2)){
				in2 = Text.getStringString(in2)
			}	
			that.stack.push(in1 != in2 ? 1 : 0)
			return 1
		},
		"=":function(){
			var in1 = that.stack.pop()
			var in2 = that.stack.pop()
			if (Text.isString(in1)){
				in1 = Text.getStringString(in1)
			}
			if (Text.isString(in2)){
				in2 = Text.getStringString(in2)
			}
			that.stack.push(in1 == in2 ? 1 : 0)
			return 1
		},
		"<":function(arg){
			var in1 = that.stack.pop()
			var in2 = that.stack.pop()
			if (arg == 1){
				that.stack.push(in1<in2 ? 1 : 0)
			}else{
				that.stack.push(in2<in1 ? 1 : 0)
			}
			return 1
		},
		">":function(arg){
			var in1 = that.stack.pop()
			var in2 = that.stack.pop()
			if (arg == 1){
				that.stack.push(in1>in2 ? 1 : 0)
			}else{
				that.stack.push(in2>in1 ? 1 : 0)
			}
			return 1
		},
		"<=":function(arg){
			var in1 = that.stack.pop()
			var in2 = that.stack.pop()
			if (arg == 1){
				that.stack.push(in1<=in2 ? 1 : 0)
			}else{
				that.stack.push(in2<=in1 ? 1 : 0)
			}
			return 1
		},
		">=":function(arg){
			var in1 = that.stack.pop()
			var in2 = that.stack.pop()
			if (arg == 1){
				that.stack.push(in1>=in2 ? 1 : 0)
			}else{
				that.stack.push(in2>=in1 ? 1 : 0)
			}
			return 1
		},
		"mod":function(arg){
			var in1 = that.stack.pop()
			var in2 = that.stack.pop()
			if (arg == 1){
				that.stack.push(in1%in2 ? 1 : 0)
			}else{
				that.stack.push(in2%in1 ? 1 : 0)
			}
			return 1
		},
		"^":function(arg){
			var in1 = that.stack.pop()
			var in2 = that.stack.pop()
			if (arg == 1){
				that.stack.push(Math.pow(in1,in2))
			}else{
				that.stack.push(Math.pow(in2,in1))
			}
			return 1
		},
		"for":function(arg){
			var numArgs = that.stack.pop()
			if (that.numargError(numArgs,[2,3])) return

			if (numArgs == 3){
				var step = that.stack.pop()
			}else{
				var step = 1
			}

			var max = that.stack.pop()
			var start = that.stack.pop()

			that.vars[arg] = start

			that.forStack.push({
				var:arg,
				max:max,
				step:step,
				pointer:that.pointer + 1
			})

			return 1
		},
		"next":function(){
			var numArgs = that.stack.pop()

			var forObj = that.forStack[that.forStack.length - 1]

			that.vars[forObj.var] += forObj.step

			// Deals with negative for loops.
			if (forObj.step < 0){	
				var isOverMax = that.vars[forObj.var] < forObj.max
			}else{
				var isOverMax = that.vars[forObj.var] > forObj.max
			}

			if (isOverMax){
				that.forStack.pop()
			}else{
				that.pointer = forObj.pointer
			}

			return 1
		},
		"function":function(arg){
			// console.log("Stack: " +  JSON.stringify(that.stack))
			var numArgs = that.stack.pop()
			var functionName = arg
			switch (functionName){
				case "sin":
					var in1 = that.stack.pop()
					that.stack.push(Math.sin(in1))
					return 2
				break;
				case "cos":
					var in1 = that.stack.pop()
					that.stack.push(Math.cos(in1))
					return 2
				break;
				case "tan":
					var in1 = that.stack.pop()
					that.stack.push(Math.tan(in1))
					return 2
				break;
				case "abs":
					var in1 = that.stack.pop()
					that.stack.push(Math.abs(in1))
					return 2
				break;
				case "atn":
					if (numArgs == 2) {
						var in1 = that.stack.pop()
						var in2 = that.stack.pop()
						that.stack.push(Math.atan2(in2,in1))
						return 2
					} else {
						var in1 = that.stack.pop()
						that.stack.push(Math.atan(in1))
						return 2
					}
				break;
				case "str":
					var in1 = that.stack.pop()
					that.stack.push(Text.makeString(""+in1))
					return 1
				break;
				case "chrat":
					var y = that.stack.pop()
					var x = that.stack.pop()
					console.log([[Screen.getCharacter(x, y)]])
					that.stack.push([[Screen.getCharacter(x, y)]])
					return 1
				case "num":
					var in1 = that.stack.pop()
					that.stack.push(parseFloat(Text.getStringString(in1)))
					return 1
				case "log":
					var in1 = that.stack.pop()
					that.stack.push(Math.log(in1))
					return 2
				break;
				case "logten":
					var in1 = that.stack.pop()
					that.stack.push(Math.log10(in1))
					return 2
				break;
				case "rndi":
					var in1 = that.stack.pop()
					var in2 = that.stack.pop()
					that.stack.push(Math.floor(Math.random() * (in1 - in2) + in2))
					return 2
				break;
				case "rndf":
					var in1 = that.stack.pop()
					var in2 = that.stack.pop()
					that.stack.push(Math.random() * (in1 - in2) + in2)
					return 2
				break;
				case "sgn":
					var in1 = that.stack.pop()
					that.stack.push(Math.sign(in1))
					return 2
				break;
				case "sqr":
					var in1 = that.stack.pop()
					that.stack.push(Math.sqrt(in1))
					return 2
				break;
				case "root":
					var in1 = that.stack.pop()
					var in2 = that.stack.pop()
					that.stack.push(Math.pow(in2,1/in1))
					return 2
				break;
				case "inp":
					var in1 = that.stack.pop()
					that.stack.push(Input.keyBuffer.indexOf(Text.getStringString(in1)) != -1)
					return 1
				break;
				case "inpp":
					var in1 = that.stack.pop()
					that.stack.push(Input.justPressed.indexOf(Text.getStringString(in1)) != -1)
					return 1
				break;
				case "flr":
					var in1 = that.stack.pop()
					that.stack.push(Math.floor(in1))
					return 1
				break;
				case "ceil":
					var in1 = that.stack.pop()
					that.stack.push(Math.ceil(in1))
					return 1
				break;
				case "mkstr":
					var coords = []
					
					// Defaults to full screen with no arguments
					if (numArgs == 0){
						coords = [23,30]
					}else{
						for (var i = 0; i < numArgs; i ++){
							coords.push(Math.floor(that.stack.pop()))
						}
					}


					try {
						that.stack.push(Text.makeStringSize(coords))
					} catch (error) {
						that.throwError("invalid string size")						
					}
					return 1
				break;
				case "chstr":
					// [0][0] gives the first character in the string.
					var dChar = that.stack.pop()[0][0]
					var tChar = that.stack.pop()[0][0]

					var str = Text.makeStringSize([8,8])

					var charIndex = cfg.chars.map.indexOf(tChar.char);

					var imageData = cfg.fontCtx.getImageData(
						charIndex * 8,
						0,
						cfg.chars.w,
						cfg.chars.h
					)

					for (var y = 0; y < 8; y ++){
						for (var x = 0; x < 8; x ++){
							var pix = imageData.data[(y * imageData.width + x) * 4 + 1]
							console.log(pix)
							if (pix == 255){ // if the pixel is white.
								str[y][x] = {
									char: dChar.char,
									accent: dChar.accent
								}
							}
						}
					}

					that.stack.push(str)
					return 1
				break;
				default: // String or array indexing
					// The char to be returned
					var outChar;

					// Get all of the dimension values
					var coords = []
					for (var i = 0; i < numArgs; i ++){
						coords.push(Math.floor(that.stack.pop()))
					}

					// get the value of the variable
					variable = that.vars[functionName]
					
					try{
						// The variable is a string
						if (Text.isString(variable)){
							that.stack.push(Text.getCharAtPosition(variable, coords))
						} else{ // the variable is an array.

							var foundString = false
							// get succesivily further into the array
							while (coords.length > 0){
								if (Text.isString(variable)){
									that.stack.push(Text.getCharAtPosition(variable, coords))
									foundString = true
									break
								}else{
									variable = variable[coords.pop()]
								}
							}

							if (!foundString){
								console.log("Array access got " + JSON.stringify(variable))
								that.stack.push(variable)
							}
						}
					} catch (error) {
						that.throwError("invalid array access")
					}
					
				break;

			}
			return 0
		},
		"chset":function(){
			var numArgs = that.stack.pop()

			var ch = that.stack.pop()[0][0].char
			var x = that.stack.pop()
			var y = that.stack.pop()

			var fontLocation = cfg.chars.map.indexOf(ch)

			cfg.fontCtx.fillStyle = "#FFFFFF"
			cfg.fontCtx.fillRect(x + fontLocation*8,y,1,1)
			cfg.fontCtx.fillStyle = "#FF0000"
			cfg.fontCtx.fillRect(x + fontLocation*8,y+8,1,1)

			Screen.forceUpdate()

			return 1
		},
		"chunset":function(){
			var numArgs = that.stack.pop()

			var ch = that.stack.pop()[0][0].char
			var x = that.stack.pop()
			var y = that.stack.pop()

			var fontLocation = cfg.chars.map.indexOf(ch)
			cfg.fontCtx.fillStyle = "#000000"
			cfg.fontCtx.fillRect(x + fontLocation*8,y,1,1)
			cfg.fontCtx.fillRect(x + fontLocation*8,y+8,1,1)

			Screen.forceUpdate()

			return 1
		},
		"print@":function(){ // TODO: Take arguments until it hits the argument termination token
			var numArgs = that.stack.pop()
			
			console.log("printargs: " + numArgs)
			if (numArgs == 5){
				var targetString = that.stack.pop()
				var target = that.vars[Text.getStringString(targetString)]
			}


			var drawMode = 0
			if (numArgs >= 4){
				var drawMode = that.stack.pop()
			}


			var sprite = that.stack.pop()

			var y = that.stack.pop()
			var x = that.stack.pop()

			Screen.printAt(x,y,sprite,drawMode,target)

			return 1
		},
		"mask":function(){
			var numArgs = that.stack.pop()
			var maskString = that.stack.pop()

			Screen.mask = maskString

			return 1
		},
		"unmask":function(){
			var numArgs = that.stack.pop()

			Screen.mask = null

			return 1
		},
		"snd":function(){
			var numArgs = that.stack.pop()

			var music = that.stack.pop()

			Music.playSequence(music)

			return 1
		},
		"line":function(){ // TODO: Take arguments until it hits the argument termination token
			var numArgs = that.stack.pop()
			var drawMode = 0

			if (numArgs == 7){
				var targetString = that.stack.pop()
				var target = that.vars[Text.getStringString(targetString)]
			}

			if (numArgs >= 6){
				var drawMode = that.stack.pop()
			}

			var sprite = that.stack.pop()
			var y2 = that.stack.pop()
			var x2 = that.stack.pop()
			var y1 = that.stack.pop()
			var x1 = that.stack.pop()
			//console.log("printat: " + x + ", " + y + ", " + sprite)

			Screen.drawLine(x1,y1,x2,y2,sprite,drawMode,target)

			return 1
		},
		"rect":function(){ // TODO: Take arguments until it hits the argument termination token
			var numArgs = that.stack.pop()
			var drawMode = 0
			
			if (numArgs == 7){
				var targetString = that.stack.pop()
				var target = that.vars[Text.getStringString(targetString)]
			}

			if (numArgs >= 6){
				var drawMode = that.stack.pop()
			}

			var sprite = that.stack.pop()
			var y2 = that.stack.pop()
			var x2 = that.stack.pop()
			var y1 = that.stack.pop()
			var x1 = that.stack.pop()
			//console.log("printat: " + x + ", " + y + ", " + sprite)

			Screen.drawRect(x1,y1,x2,y2,sprite,drawMode,target)

			return 1
		},
		"frect":function(){ // TODO: Take arguments until it hits the argument termination token
			var numArgs = that.stack.pop()
			var drawMode = 0
			
			if (numArgs == 7){
				var targetString = that.stack.pop()
				var target = that.vars[Text.getStringString(targetString)]
			}

			if (numArgs >= 6){
				var drawMode = that.stack.pop()
			}


			var sprite = that.stack.pop()
			var y2 = that.stack.pop()
			var x2 = that.stack.pop()
			var y1 = that.stack.pop()
			var x1 = that.stack.pop()


			Screen.drawRectFill(x1,y1,x2,y2,sprite,drawMode,target)

			return 1
		},
		"circ":function(){ // TODO: Take arguments until it hits the argument termination token
			var numArgs = that.stack.pop()
			var drawMode = 0
			
			if (numArgs == 6){
				var targetString = that.stack.pop()
				var target = that.vars[Text.getStringString(targetString)]
			}

			if (numArgs >= 5){
				var drawMode = that.stack.pop()
			}

			var sprite = that.stack.pop()
			var r = that.stack.pop()
			var y1 = that.stack.pop()
			var x1 = that.stack.pop()
			//console.log("printat: " + x + ", " + y + ", " + sprite)

			Screen.drawCirc(x1,y1,r,sprite,drawMode,target)

			return 1
		},
		"fcirc":function(){ // TODO: Take arguments until it hits the argument termination token
			var numArgs = that.stack.pop()
			var drawMode = 0

			if (numArgs == 6){
				var targetString = that.stack.pop()
				var target = that.vars[Text.getStringString(targetString)]
			}

			if (numArgs >= 5){
				var drawMode = that.stack.pop()
			}

			var sprite = that.stack.pop()
			var r = that.stack.pop()
			var y1 = that.stack.pop()
			var x1 = that.stack.pop()
			//console.log("printat: " + x + ", " + y + ", " + sprite)

			Screen.drawCircFill(x1,y1,r,sprite,drawMode,target)

			return 1
		},
		"cls":function(){
			var numArgs = that.stack.pop()
			Screen.clearBuffer(" ",1)

			return 1
		},
		"wait":function(){
			var numArgs = that.stack.pop()
			return "wait"
		},
		"pushArrayReference":function(variable){
			var numArgs = that.stack.pop()
			var coords = []
			for (var i = 0; i < numArgs; i ++){
				coords.push(Math.floor(that.stack.pop()))
			}
			// console.log({
			// 	var:variable,
			// 	coords:coords
			// })
			that.stack.push({
				var:variable,
				coords:coords.reverse()
			})
			return 1
		},
		"arrayAssign":function(){
			console.log("STACK:")
			console.log(JSON.stringify(that.stack))
			var numArgs = that.stack.pop()
			var arg = that.stack.pop()
			var arrRef = that.stack.pop()
			var coords = arrRef.coords
			var variable = arrRef.var

			var variableReference = that.vars[variable]
			
			var isString = Text.isString(variableReference)
			console.log(JSON.stringify(that.vars[variable]))
			console.log(JSON.stringify(coords))
			try{
				for (var i = 0; i < coords.length - 1; i ++){
					variableReference = variableReference[coords[i]]
					console.log(JSON.stringify(variableReference))
				}

				if (isString){
					variableReference[coords[coords.length - 1]] = arg[0][0]
				}else{
					variableReference[coords[coords.length - 1]] = arg
				}
			} catch (error) {
				console.log(error)
				that.throwError("invalid array access")
			}
			

			//console.log("vars: " + JSON.stringify(that.vars))

			return 1
		},
		"dim":function(arg){
			var numArgs = that.stack.pop()
			var variable = arg
			var coords = []
			for (var i = 0; i < numArgs; i ++){
				coords.unshift(that.stack.pop())
			}
			
			try{
				that.vars[variable] = Text.makeArr(coords)
			} catch (error) {
				that.throwError("invalid array size")				
			}
			
		}
	}

	this.executeCommand = function(command){
		try {
			return that.commands[command[0]](command[1])
		} catch (error) {
			console.log("Unknown command error: " + error)
			that.throwError("unknown command:"+command[0])
			return 0
		}
	}

	this.executeProcessorFrame = function(processorSpeed){
		try {
			var ticks = processorSpeed
			while (ticks >= 0){
				var length = that.executeCommand(that.code[that.pointer])
				if (length == "wait"){ // Exit on wait command. If found, move past the wait command
					that.pointer ++
					return
				}
				if (length > 0){ // Subtract the processor time from remaining ticks
					ticks -= length
				}

				// Move the pointer and check for the end of code
				that.pointer ++
				if (that.pointer >= that.code.length){
					that.running = false
					return
				}
			}	
		} catch (error) {
			that.throwError("unhandled exception")
		}
	}

	this.setPointerToLine = function(line){
		var tempPointer = 0
		while (tempPointer < that.code.length && !((that.code[tempPointer][0] == "ln" && that.code[tempPointer][1] == line))){
			tempPointer ++
		}
		that.pointer = tempPointer - 1
		return tempPointer
	}
1
	this.loop = function(){
		if (that.running){
			that.executeProcessorFrame(600)
		}
		Input.applyKeys("")
		Screen.outputBuffer()
	}
	this.throwError = function(errorMessage){
		that.running = false

		Screen.printWrap(0,Text.makeString("e:" + errorMessage + " around " + that.lineNumber),1)
	}
	this.numargError = function(value,goal){
		if (typeof goal == "object"){
			for (var i = 0; i < goal.length; i ++){
				if (value == goal[i]){
					return false
				}
			}
		} else {
			if (value == goal){
				return false
			}
		}

		that.throwError("argument number")
		return true
	}

	this.hotKey = function(hotKey){
		StateMachine.hotKey(hotKey)
	}
}