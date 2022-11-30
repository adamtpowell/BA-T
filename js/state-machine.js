
var StateMachine = new function(){
	this.state = 0
	this.states = ["home","editor","font","basic"]
	this.currentScreen = Home
	that = this
	this.machine = function(){
		switch (that.states[that.state]){
			case "home":
				that.currentScreen = Home
			break;
			case "editor":
				that.currentScreen = Editor
			break;
			case "basic":
				if (that.currentScreen != Vm){
					Vm.reset()
				}
				that.currentScreen = Vm
			break;
			case "font":
				that.currentScreen = FontEditor
			break;
		}
		that.currentScreen.loop()
		window.requestAnimationFrame(StateMachine.machine)
	}
	this.setState = function(newState){
		that.state = newState
	}
	this.getState = function(){
		return that.state
	}
	this.drawMenuBar = function(){
		var menuBar = "                          "
		if (this.state == 0){
			menuBar += "E⛛"
		}else{
			menuBar += "E"
		}
		if (this.state == 1){
			menuBar += "C⛛"
		}else{
			menuBar += "C"
		}
		if (this.state == 2){
			menuBar += "B⛛"
		}else{
			menuBar += "B"
		}
		if (this.state == 3){
			menuBar += "E⛛"
		}else{
			menuBar += "E"
		}
		Screen.printAt(0,0,Text.makeString(menuBar),1)
	}
	this.hotKey = function(hotKey){
		switch(hotKey){
			case "RIGHT":
				if (KeyCode.is_code_down(17)){
					that.state ++
					if (that.state > that.states.length-1){
						that.state = 0
					}
				}
			break;
			case "LEFT":
				if (KeyCode.is_code_down(17)){
					that.state --
					if (that.state < 0){
						that.state = that.states.length-1
					}
				}
			break;
		}
	}
}

