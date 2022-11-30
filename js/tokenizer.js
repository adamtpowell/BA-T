var Tokenizer = new function(){
	var that = this

	this.tokens = []
	this.mode = "newline"
	this.code = Editor.getCode() + "⸪" // Adds the EOF character
	//this.code = this.code.replace(/ /g,"")
	this.pos = 0

	this.keywords = [
		"for",
		"wait",
		"if",
		"then",
		"else",
		"to",
		"next",
		"return",
		"gosub",
		"goto",
		"print",
		"print@",
		"line",
		"rect",
		"frect",
		"fcirc",
		"circ",
		"cls",
		"touch",
		"print",
		"dim",
		"do",
		"step",
		"snd",
		"mask",
		"unmask",
		"chset",
		"chunset",
		"rem",
		"=",
		"<",
		">",
		"^",
		"(",
		")",
		"!",
		"@",
		",",
		":",
		"+",
		"-",
		"/",
		"*",
		"mod",
		"and",
		"or",
		"not",
		"xor"
	]
	this.categories = [
		{keywords:[
				"-",
				"+",
				"*",
				"/",
				"<",
				">",
				"mod",
				"and",
				"or",
				"not",
				"xor",
				"'"
		],type:"operator"},
		{keywords:[
				"!",
				"@",
				"#",
				"$",
				"%",
				"^",
				"&",
				"~",
				"`"
		],type:"puncuation"}
	]

	this.tokenize = function(){
		that.tokens = []
		that.pos = 0
		that.code = Editor.getCode() + "⸪"

		//that.code = that.code.replace(/ /g,"")
		that.mode = "newline";
		//console.log(that.code) 
		while (that.pos <= that.code.length){
			var char = that.getChar()
			if (char != " "){
				if (that.mode == "newline"){
					that.tokenizeNumber("line-number")
				} else if (that.mode == "none"){
					if (that.getChar() == '"'){
						//console.log("string encountered")
						if (that.tokenizeString() == -1){ // String is unclosed
							console.log("fuck this")
							return -1
						}
					} else if (!isNaN(parseInt(char))){
						that.tokenizeNumber("number")
					} else {
						that.tokenizeSequence()
					}
				}
			}
			that.pos ++
		}
		console.log(that.tokens)
		return that.tokens
	}
	this.tokenizeNumber = function(type){
		var curChar = that.getChar()
		var curToken = that.newToken(type)

		while (!isNaN(parseInt(curChar)) || curChar=="."){
			
			var terminatorToken = that.checkForTerminatingCases()
			if (terminatorToken != false){
				curToken.content = tokenContent
				that.addToken(curToken)
				if (terminatorToken != true){
					that.addToken(terminatorToken)				
				}
				return
			}

			curToken.content += curChar
			that.pos ++
			curChar = that.getChar()


		}

		that.addToken(curToken)
		that.mode = "none"
		that.pos --
	}

	/* To avoid the issue

		loop through the end of the current tokenization sequence.
		If the last bit is a keyword, take that token out of the sequence
		add the first part of the sequence to the tokens
		then add the keyword to the tokens.

	*/
	this.tokenizeSequence = function(){
		var curChar = that.getChar()
		var curToken = that.newToken("variable")
		var tokenContinue = true
		var tokenContent = ""

		while (tokenContinue) {
			// Terminating character cases
			var terminatorToken = that.checkForTerminatingCases()
			if (terminatorToken != false){
				curToken.content = tokenContent
				that.addToken(curToken)
				if (terminatorToken != true){
					that.addToken(terminatorToken)
				}
				return
			}

			// Add to token
			if (curChar != " "){
				tokenContent += curChar
			}

			// Check for keywords / functions, then exit the sequence after adding tokens.
			if (that.findKeywords(curToken,tokenContent)){
				return
			}
			
			that.pos ++
			var curChar = that.getChar()
		}
	}

	this.findKeywords = function(curToken,content){
		var keywordToken = that.newToken("keyword")
		for (var i = content.length-1; i >= 0; i --){
			var stringToCheck = content.slice(i)
	 		if (that.keywords.indexOf(stringToCheck) != -1){
	 			// TODO: Edge case for <= / >=
	 			// If the current token is an equals or a less than,
	 			// check if the previus token is a character that would make a double./
	 			// If it is, then add on to the previus tokens content and set keywordToken.content to ''

	 			if ((stringToCheck == "=" || stringToCheck == ">") && 
	 				(that.tokens[that.tokens.length-1].content == ">" || that.tokens[that.tokens.length-1].content == "<")){
	 					that.tokens[that.tokens.length-1].content += stringToCheck
	 					return true
	 			}else {
					keywordToken.content = stringToCheck
					curToken.content = content.slice(0,i)
	 				
	 			}
			}
		}
		if (keywordToken.content != ''){
			that.addToken(curToken)
			that.addToken(keywordToken)
			return true
		}
	}

	this.tokenizeString = function(){
		var stringToken = that.newToken("string")
		that.pos ++ // Move away from the starting qoutes
		var curChar = that.getChar()

		while (curChar != '"'){
			stringToken.content += curChar
			that.pos ++
			curChar = that.getChar()
			if (curChar == '⸪'){ // EOF reached without string termination.
				console.log("eof - fuck this")
				return -1
			}
		}

		// Remove the first character if it is a line break
		if (stringToken.content.charAt(0) == "\n"){
			stringToken.content = stringToken.content.substring(1)
		}
		if (stringToken.content.charAt(stringToken.content.length-1) == "\n"){
			stringToken.content = stringToken.content.substring(0,stringToken.content.length-1)
		}

		that.addToken(stringToken)
		return 0
	}

	this.checkForTerminatingCases = function(){
		var curChar = that.getChar()
		if (curChar == "\n" ){
			that.mode = "newline"
			return true
		}
		if (curChar == " "){
			return false
		}
		if (curChar == "⸪"){
			that.pos += 1000
			var token = that.newToken("eof")
			token.content = curChar
			return token
		}
		return false

	}
	this.newToken = function(type){
		return {
			type:type,
			content:""
		}
	}
	this.getChar = function(){
		//console.log("Char: " + that.code.charAt(that.pos) + ".")
		return  that.code.charAt(that.pos)

	}
	this.addToken = function(token){
		if (token.content != ""){
			that.tokens.push(token)
		}
	}
}