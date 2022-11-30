var Text = new function(){
	var that = this
	this.makeString = function(inString){
		var i = 0;
		var outString = [[]]
		var depth = 0
		while (i < inString.length){
			var char = inString.charAt(i)
			var accent = inString.charAt(i+1)
			if (char == "\n"){
				outString.push([])
				depth ++
			}else{
				outString[depth].push(this.makeChar(char,(accent=="⛛")))
			}
			if (accent=="⛛"){
				i ++
			}
			i++
		}
		return outString
	}
	this.makeStringSize = function(coords){
		var array = that.makeArr(coords)
		for (var row = 0; row < array.length; row ++){
			for (var col = 0; col < array[0].length; col ++){
				array[row][col] = this.makeChar(" ")
			}
		}

		return array
	}
	this.makeArr = function(coords){
		var arr = Array(coords[0])
		for (var i = 0; i < coords[0]; i ++){
			if (coords.length > 1){
				arr[i] = that.makeArr(coords.slice(1))
			}else{
				arr[i] = undefined
			}
		}
		return arr
	}
	this.makeChar = function(char,accent,invert){
		if (accent == undefined){
			accent = false
		}
		if (invert == undefined){
			invert = false
		}
		return {
			char: char,
			accent: accent,
			invert: invert
		}
	}
	this.getCharString = function(char){
		accent = char.accent ? "⛛" : ""
		return char.char + accent
	}
	this.getStringString = function(string){
		var ret = ""
		for (var i = 0; i < string.length; i ++){
			for (var j = 0; j < string[i].length; j ++){
				ret += this.getCharString(string[i][j])
			}
			// If not the final character line, add a line break
			if (i != string.length - 1){
				ret += "\n"
			}
		}
		return ret
	}
	this.isString = function(variable){
		return (variable != undefined && variable[0] != undefined && variable[0][0] != undefined &&
			variable[0][0].char != undefined)
	}
	this.sameChar = function(char1,char2){
		return char1.char == char2.char && char1.accent == char2.accent
	}
	this.getCharAtPosition = function(variable, coords){

		// Invalid number of arguments
		if (coords.length > 2){
			console.log("string search arguments too long")
			// TODO: return error
		}
		// One dimensional edge case, adds second argument for the y axis.
		if (coords.length == 1){
			coords.unshift(0)
		}
		// Push a string consisting of the desired character onto the stack, if in bounds.
		if (variable[coords[0]] != undefined && variable[coords[0]][coords[1]] != undefined){
			return [[variable[coords[0]][coords[1]]]]
		} else{
			console.log("string search failed")
		}
	}
}