var Runner = new function(){
	var step = 0
	var stepAmount = 0.01
	var chars = [
		Text.makeString("W"),
		Text.makeString("x"),
		Text.makeString("Y"),
		Text.makeString("x"),
		Text.makeString("X"),
		Text.makeString("x"),
		Text.makeString("W"),
		Text.makeString("x"),
		Text.makeString("Y"),
		Text.makeString("x"),
		Text.makeString("X"),
		Text.makeString("x")
	]
	var inputString = ""
	this.loop = function(){
		step += stepAmount
		for (var r = 0; r < 10; r += 1){
			Screen.drawCirc(15,11,Math.sin(step-stepAmount) * r * 2,Text.makeString(" "),2)
			Screen.drawCirc(15,11,Math.sin(step) * r * 2,chars[r],0)
		}
		var lineStep = step * 2.5
		var lineStepAmount = stepAmount * 2.5
		for (var angle = 0.0; angle < 6.28/8; angle += 0.01){
			Screen.drawLine(15,11,15 + Math.cos(lineStep+angle) * 40,11+Math.sin(lineStep+angle) * 40,Text.makeString("X⛛"),4)
			Screen.drawLine(15,11,15 + Math.cos(-lineStep-angle) * 40,11+Math.sin(-lineStep-angle) * 40,Text.makeString("X⛛"),4)
		}
		Screen.drawRect(0,0,29,22,Text.makeString("a⛛"))
		Screen.printAt(0,0,Text.makeString(inputString))
		
		inputString = Input.applyKeys(inputString)
		Screen.outputBuffer()
		Screen.clearBuffer(" ",0)
	}
	this.hotKey = function(hotKey){
		StateMachine.hotKey(hotKey)
	}
}