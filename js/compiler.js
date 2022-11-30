

var Compiler = new function(){
	var that = this
	this.code = []

	this.tokens = []
	this.pointer = -1

	this.done = false

	this.err = false

	this.line_number = 0

	this.error = function(message){
		Screen.printWrap(0,Text.makeString("e:" + message.toLowerCase() + " at line " + that.line_number),1)
			// TODO: Make this print the line number
		that.err = true
		that.pointer = that.tokens.length-1
	}

	this.pushCommand = function(command,args){
		that.code.push([command,args])
	}
	this.pushCommands = function(commands){
		that.code = that.code.concat(commands)
	}
	this.test = function(type,content){
		return that.curToken.type == type &&
			   (content == undefined || that.curToken.content == content)
	}
	this.assert = function(message,type,content){
		if (!that.test(type,content)){
			this.error(message)

			that.pointer = that.tokens.length-1
			
		}
	}
	this.finishCompilation = function(){
		that.done = true
	}
	this.nextToken = function(){
		that.pointer ++
		if (that.pointer >= that.tokens.length){
			that.finishCompilation()
			that.pointer -- // Stay on the eof character
		}

		that.curToken = that.tokens[that.pointer]
		
		//console.log("Curtoken:" + that.curToken)
	}
	this.lastToken = function(){
		that.pointer --
		that.curToken = that.tokens[that.pointer]
		//console.log(that.curToken)
	}

	this.compile = function(tokens){
		console.log("=========== Start Compilation =============")

		that.err = false

		that.done = false
		that.tokens = tokens
		that.code = []
		that.pointer = -1

		that.nextToken()
		while (that.curToken.type != "eof"){
			that.expect.line()
		}
		console.log("Error true?: " + that.err)
		if (!that.err){
			return that.code
		}else{
			return -1
		}
	}

	this.expect = {}

	this.expect.line = function(){
		that.expect.lineNumber()
		that.expect.commands()
	}
	this.expect.lineNumber = function(){
		that.assert("line number expected","line-number")
		that.line_number = parseInt(that.curToken.content)
		that.pushCommand("ln",parseInt(that.curToken.content))
	}
	this.expect.commands = function(){
		that.expect.command()
		that.nextToken()
		while (that.curToken.content == ":" || that.curToken.content == "else" ||
				that.curToken.content == "then"){
			if (that.curToken.content == "else"){
				that.pushCommand("else")
			}
			that.expect.command()
			that.nextToken()
		}
	}
	this.expect.command = function(){
		that.nextToken()
		if (that.curToken.content == "'" || that.curToken.content == "rem"){ // Full line comments
				console.log("This is a comment")
				that.expect.comment()
		} else if (that.curToken.type == "variable" && that.tokens[that.pointer+1].content == "="){
			that.expect.declaration()
		} else if (that.curToken.type == "variable" && that.tokens[that.pointer+1].content == "("){
			that.expect.arrayDeclaration()
		} else if (that.curToken.type == "keyword" && that.curToken.content == "if"){
			that.expect.if()
		} else if (that.curToken.content == "next"){
			that.expect.next()
		} else if (that.curToken.content == "for"){
			that.expect.for()
		} else if (that.curToken.content == "dim"){
			that.expect.dim()
		} else if (that.curToken.type == "keyword"){
			that.expect.sub()
		} else{
			that.expect.expression()
		}
	}
	this.expect.comment = function(){
		while (that.curToken.type != "line-number" && !that.done){
			that.nextToken()
		}
		that.lastToken()
	}
	this.expect.dim = function(){
		that.nextToken() // Variable
		that.assert("Missing variable in dim","variable")
		var variable = that.curToken.content

		that.nextToken() // "("
		that.assert("Missing '(' in dim","keyword","(")

		that.expect.arguments()

		that.nextToken() // ")"
		that.assert("Missing ')' in dim","keyword",")")

		that.pushCommand("dim",variable)
	}
	this.expect.arrayDeclaration = function(){
		var variable = that.curToken.content

		that.nextToken() // "("
		that.assert("missing '(' in array assignment","keyword","(")

		that.expect.arguments()

		that.nextToken() // ")"
		that.assert("Missing ')' in array assignment","keyword",")")

		that.pushCommand("pushArrayReference",variable)

		that.nextToken() // "="
		that.assert("missing '=' in array assignment","keyword","=")

		that.expect.arguments()

		that.pushCommand("arrayAssign",undefined)
	}
	this.expect.for = function(){

		var numArgs = 2

		that.nextToken() // Varialle
		that.assert("Missing varialble in for loop","variable")
		var variable = that.curToken.content
		
		that.nextToken() // =
		that.assert("Missing = in for loop","keyword","=")
		
		that.nextToken()
		that.expect.expression() // Start expression
		
		that.nextToken() // TO
		that.assert("Missing 'to' in for loop","keyword","to")
		
		that.nextToken()
		that.expect.expression() // End expression

		that.nextToken()
		if (that.curToken.content == "step"){
			that.nextToken()
			that.expect.expression()
			numArgs ++
			that.nextToken()
			if (that.curToken.content != "do"){
				that.lastToken()
			}
		}else{
			that.lastToken()
		}

		that.pushCommand("numargs",numArgs)
		that.pushCommand("for",variable)
	}
	this.expect.next = function(){
		that.nextToken()
		if (that.curToken.type != "variable"){
			that.lastToken()
		}
		that.pushCommand("next")
	}
	this.expect.sub = function(){
		var functionName = that.curToken.content
		// The edge case for PRINT@ sharing a start with print.
		if (functionName == "print"){
			that.nextToken()
			if (that.curToken.content == "@"){
				functionName = "print@"
			}else{
				that.lastToken()
			}
		}
		that.expect.arguments()
		that.pushCommand(functionName)
	}
	this.expect.arguments = function(){
		var numArgs = 0
		that.nextToken()
		while (that.curToken.type != "line-number" 
				&& that.curToken.content != ")"
				&& that.curToken.content != ":"
				&& that.curToken.content != "else"
				&& that.curToken.type != "eof"){

			console.log("Expect Arguments token: " + that.curToken.content)
			if (numArgs > 0){ // If it is past the first argument
				that.assert("Incorrect character between arguments at argument " + numArgs + " character " + JSON.stringify(that.curToken),"keyword",",")
				that.nextToken() // Move onto the next argument
			}
			that.expect.expression()
			numArgs ++
			that.nextToken() // Move onto comma
		}
		that.lastToken()
		that.pushCommand("numargs",numArgs)
	}
	this.expect.declaration = function(){
		var variableName = that.curToken.content
		that.nextToken() 
		if (that.curToken.content == "="){
			that.nextToken()
			that.expect.expression()
		}
		that.pushCommand("assign",variableName)
	}
	this.expect.if = function(){
		that.nextToken()
		that.expect.expression()
		that.pushCommand("if")
		//that.nextToken()
		//that.expect.commands()
	}
	this.expect.expression = function(){
		var expressionError = false
		var operators = [
			"-",
			"+",
			"*",
			"/",
			"^",
			"<",
			">",
			"=",
			"<=",
			">=",
			"<>",
			"mod",
			"and",
			"or",
			"not",
			"xor"
		]
		var specialChars = [
			"(",
			")",
			","
		]
		var isExpressionToken = function(token){
			return ((token.type == "keyword" && (operators.indexOf(token.content) != -1
						|| specialChars.indexOf(token.content) != -1)) ||
				 	token.type == "number" ||
				 	token.type == "variable" || token.type == "string")
		}
		var isOperator = function(token){
			return operators.indexOf(token.content) != -1
		}
		var getExpressionContent = function(){
			var expressionContent = []
			var parenCount = 0
			while (isExpressionToken(that.curToken)){
				// TODO: End on commas not in functions
				// Need to add a flag for being in a function
				// Paren count
				// Needed for commands working
				if (that.curToken.content == "("){
					parenCount ++
				} else if (that.curToken.content == ")"){
					parenCount --
					if (parenCount == -1){
						break
					}
				}
				if (that.curToken.content == "," && parenCount == 0){
					// that.nextToken() // Moves to token after comma
					// that.nextToken() // Moves to the next token for that.lastToken()
					break
				}
				expressionContent.push(that.curToken)
				that.nextToken()
			}
			that.lastToken()

			console.log("Expression Content: " + JSON.stringify(expressionContent))

			return expressionContent
		}
		var expressionMain = function(){
			var content = getExpressionContent()
			var code = codify(content)

			return code
		}

		// Returns code
		var functionParse = function(tokens, point){
			var pointer = point
			var chunks = []
			var functionTokens = []

			var functionName = tokens[pointer].content

			code = []

			// Find the function content
			pointer ++
			var parenLevel = 1
			while (parenLevel != 0){
				pointer ++

				if (pointer >= tokens.length){
					Compiler.error("Unclosed function!")
					parenLevel = 0
					break
				}
				if (tokens[pointer].content == "("){
					parenLevel ++
				}
				if (tokens[pointer].content == ")"){
					parenLevel --
				}

				if (parenLevel != 0){
					functionTokens.push({
						type: tokens[pointer].type,
						content: tokens[pointer].content
					})	
				}
			}

			//console.log("Function tokens for " + functionName + ": " + JSON.stringify(functionTokens))

			//var functionChunks = chunk(functionTokens, 0)

			//functionChunks.push([["numargs", "ph"],["function",functionName]])

			//console.log("Function chunks: " + JSON.stringify(functionChunks))


			// Get a chunk for every argument


			var args = [[]]
			var argIndex = 0
			var funcPoint = 0

			// Get the tokens seperated by commas
			// TODO: Add functionality to skip functions when they are encounted
			while (funcPoint < functionTokens.length){
				if (functionTokens[funcPoint].type == "variable" && 
					functionTokens[funcPoint + 1] != undefined &&
					functionTokens[funcPoint + 1].content == "("){

					args[argIndex].push(functionTokens[funcPoint])

					funcPoint ++

					while (functionTokens[funcPoint].content != ")"){
						args[argIndex].push(functionTokens[funcPoint])
						funcPoint ++
					}

					args[argIndex].push(functionTokens[funcPoint])

				} else if (functionTokens[funcPoint].content == ","){
					argIndex ++
					args.push([])
				}else{
					args[argIndex].push(functionTokens[funcPoint])
				}
				funcPoint ++
			}

			// Convert that into an array of chunks
			var argChunks = []
			for (var i = 0; i < args.length; i ++){
				argChunks[i] = chunk(args[i],0)
				argChunks[i] = combine(argChunks[i])
			}
			var code = combine(argChunks)

			// argChunks[0].length == 0 means that there are no arguments
			if (argChunks[0].length > 0){
				var numArgs = argChunks.length
			}else{
				var numArgs = 0
			}

			code = code.concat([["numargs",numArgs],["function",functionName]])

			console.log("Function code: " + JSON.stringify(code))
		
			// While not at end of function arguments
			// 		get tokens between commas
			//		call chunk on those
			//		Call combine on those and add them to chunks
			//	Add [[numargs],[func]] to chunks

			//var code = combine(chunks)

			

			return {
				code: code,
				pointer: pointer
			}
		}
		var combine = function(chunks){
			// Check if an operator exists
			var operator = false
			for (var i = 0; i < chunks.length; i ++){
				if (typeof chunks[i] == "string"){
					operator = true
				}
			}

			if (operator){ // operator found
				console.log("Operators in progress")
				console.log(chunks)

				var depth = 0


				// Execute each list in depth sorted order.
				var oplist = [
					[[],[],[],[],[],[],[],[],[],[],[],[]]
				]

				for (var i = 0; i < chunks.length; i += 1){
					
					if (chunks[i] == "("){
						depth ++
						// remove this now useless chunk
						chunks.splice(i,1)
						i --
						if (depth >= oplist.length){
							oplist.push([[],[],[],[],[],[],[],[],[],[],[],[]])
						}
					}else if (chunks[i] == ")"){
						depth --
						// remove this now useless chunk
						chunks.splice(i,1)
						i --
						if (depth < 0){
							// TODO: Call error on extra ) in expression
						}
					}else{ // There is an operator
				/* order of ops:
					parens
					^
					+,- unary
					*, /
					mod
					+,-
					relational
					not
					and
					or
					xor
					eqv
					imp


				*/
						var precedence
						var found = true;
						switch (chunks[i]){
							case "imp":
								precedence = 0
							break;
							case "eqv":
								precedence = 1
							break;
							case "xor":
								precedence = 2
							break;
							case "or":
								precedence = 3
							break;
							case "and":
								precedence = 4
							break;
							case "not":
								precedence = 5
							break;
							case "<=": case ">=": case ">": case "<": case "<>": case "=":
								precedence = 6
							break;
							case "+": case "-":
								precedence = 7
								var last = chunks[i - 1]
								if (last != undefined) console.log("type: " + typeof last)
								if ((last == undefined || last.nullTime != undefined) || (typeof last != "object")){
									console.log("Unary " + chunks[i] + " at index " + i)
									precedence = 10
									chunks[i] = "unary_" + chunks[i]
								}
							break;
							case "mod":
								precedence = 8
							break;
							case "*": case "/":
								precedence = 9
							break;
							case "^":
								precedence = 11
							break;
							default:
								found = false
							break;
						}
						if (found){
							console.log(chunks[i])
							oplist[depth][precedence].push([chunks[i],i])
						}
					}
					
					
				}

				// Create stack
				var res = []
				var nullIndex = 0;

				for (var layer = oplist.length - 1; layer >= 0; layer --){ // Operation layers
					for (var optype = oplist[layer].length - 1; optype >= 0 ; optype --){ // Operator type
						for (var op = 0; op < oplist[layer][optype].length; op ++){ // specific operator
							var type = oplist[layer][optype][op][0]
							var index = oplist[layer][optype][op][1]
	
							// Unary types
							if (type == "unary_-" || type == "unary_+" || type == "not"){
								nullIndex ++
								if (chunks[index + 1] != undefined && chunks[index + 1].nullTime == undefined){
									if (typeof chunks[index + 1] == "string"){
										expressionError = true
									}
									res = res.concat(chunks[index + 1])
									console.log("Added chunk as unary operand: " + chunks[index + 1])

									chunks[index + 1] = {nullTime: nullIndex}
								}else{
									// TODO: Throw error
								}
								chunks[index] = {nullTime: nullIndex}
								res.push([type,undefined])
							}

							// Operators that do not care about order
							if (type == "*" || type == "and" || type == "<>" || type == "=" || type == "or"){
								nullIndex ++
								if (chunks[index - 1] != undefined && chunks[index - 1].nullTime == undefined){
									res = res.concat(chunks[index - 1])
									chunks[index - 1] = {nullTime: nullIndex}
								}
								if (chunks[index + 1] != undefined && chunks[index + 1].nullTime == undefined){
									res = res.concat(chunks[index + 1])
									chunks[index + 1] = {nullTime: nullIndex}
								}
								chunks[index] = {nullTime: nullIndex}
								res.push([type,undefined]) // TODO: May need to be null instead of undefined
							}
							// Operators that care about order
							if (type == "-" || type == "/" || type == "<" || type == ">" ||
								type == ">=" || type == "<=" || type == "^" || type == "%" || type == "mod" || type == "+"){
								nullIndex ++
								nullSides = [true, true]
								if (chunks[index - 1] != undefined && chunks[index - 1].nullTime == undefined){
									res = res.concat(chunks[index - 1])
									chunks[index - 1] = {nullTime: nullIndex}
									nullSides[0] = false
								}
								if (chunks[index + 1] != undefined && chunks[index + 1].nullTime == undefined){
									res = res.concat(chunks[index + 1])
									chunks[index + 1] = {nullTime: nullIndex}
									nullSides[1] = false
								}

								// Choose which type of function to use
								if (nullSides[0] && !nullSides[1]){ // The left is null
									res.push([type,0])
								}else if (nullSides[1] && !nullSides[0]){ // The right is null
									res.push([type,1])
								}else if (nullSides[0] && nullSides[1]){ // Both sides are null
									if (chunks[index - 1].nullTime < chunks[index + 1].nullTime){ // Left is on stack first
										res.push([type,0])
									}else{ // Right is on the stack first
										res.push([type,1])
									}
								}else{ // Both sides are not null
									res.push([type,0]) // Push a normal operation
								}
								chunks[index] = {nullTime: nullIndex}
							}

							// todo: Unary operators
						}
					}
				}
				console.log(res)
				return res

			}else{ // Operator not found. It makes the chunks into one array.
				var res = []
				for (var i = 0; i < chunks.length; i ++){
					res = res.concat(chunks[i])
				}
				return res
			}
		}

		var codify = function(tokens){
			// Creates an array of chunks
			var chunks = chunk(tokens, 0)

			// Combines the chunks into code
			var code = combine(chunks)
		
			console.log("Final code: " + JSON.stringify(code))

			// Returns the array of chunks
			return code
		}

		var chunk = function(tokens, point){
			var pointer = point
			var chunks = []

			while (pointer < tokens.length){
				// Token is a number
				if (tokens[pointer].type == "number"){
					// For 10 should give [['push',10]]
					chunks.push([['push',parseFloat(tokens[pointer].content)]])
				}
				if (tokens[pointer].type == "string"){
					chunks.push([['push',tokens[pointer].content]])
				}
				if (tokens[pointer].type == "keyword" && isOperator(tokens[pointer])){
					// For * should give '*'
					chunks.push(tokens[pointer].content)
				}
				if (tokens[pointer].content == "(" || tokens[pointer].content == ")"){
					chunks.push(tokens[pointer].content)
				}
				if (tokens[pointer].type == "variable" && tokens[pointer + 1] != undefined && tokens[pointer+1].content == "("){
					console.log('Function Parsing!')
					var res = functionParse(tokens, pointer)
					pointer = res.pointer
					code = res.code
					console.log("After function parse, at token: " + JSON.stringify(tokens[pointer]))

					// For test(10) should give 
					// [['push',10],['numargs',1],['function','test']]
					chunks.push(code)
				}else if (tokens[pointer].type == "variable"){
					chunks.push([['pushVar',tokens[pointer].content]])
				}
				
				pointer ++
			}
			console.log("Chunk call done:" + JSON.stringify(chunks))
			// Returns the array of chunks
			return chunks
		}

		var expressionCode = expressionMain()

		if (expressionError){
			that.error("invalid expression")
		}

		that.pushCommands(expressionCode)
	

		// 0. codify(content) is called
		// 1. chunker() puts every block of code into an array, and returns 
		// 		10 would be 
		//			[['push',10]]
		//      If a function is encountered, call functionParse on it
		//			Finds the end of the function and calls codify
		//			Returns [code,lengthOfTokens]
		//			The codify code is used as the chunk code.
		//			lengthOfTokens is used to move the codify pointer
		// 		test(10) would be 
		//          [['push',10],['numargs',1],['function','test']]
		// 		Operators would be 
		//			'*'
		//		Does this by calling chunk()
		//
		// 2. Combiner concatonates the chunk
		// 3. Codify returns code
	}
}

// TODO: Numargs increasing on a plus operator. Needs to check for commas to correct this!!!
// TODO; Infiinite looop with multiple args