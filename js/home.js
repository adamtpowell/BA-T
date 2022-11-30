var Home = new function(){
	var that = this
	this.inputString = ""
	this.menu = ["save","load","about"]
	this.menuPos = 0
	this.x = 5
	this.y = 5
	this.state = "menu"

	// Create the event handler for loadfile changing

	var loadFile = document.getElementById("fileinput")
	loadFile.addEventListener("change",function(e){
		var file = loadFile.files[0]
		JSZip.loadAsync(file)
	        .then(function(zip) {
	            zip.file("code").async("string").then(function (data) {
	            	Editor.setCode(data)
	            });
	            zip.file("img").async("blob").then(function(blob){
	            	var imgURL = URL.createObjectURL(blob)
	            	var img = document.createElement('img')

	            	img.onload = function(){
	            		URL.revokeObjectURL(imgURL)
	            		cfg.fontCtx.clearRect(0,0,760,16)
	            		cfg.fontCtx.drawImage(img,0,0)
	            	}

	            	img.src = imgURL
	            })
	        }, function (e) {
	        	console.log("error when loading")
	        });
	},true)
	

	this.loop = function(){
		Screen.printAt(that.x,that.y,Text.makeString("B b⛛a⛛-⛛t⛛ B"))
		for (var i = 0; i < that.menu.length; i ++){
			Screen.printAt(that.x,that.y+i*2+4,Text.makeString((that.menuPos == i ? "B⛛ " : "  ") + that.menu[i]),0)
		}


		if (Input.justPressed.indexOf("z") != -1 && that.state == "menu"){
			that.menuTrigger(that.menu[that.menuPos])
		}

		// Update input
		that.inputString = ""
		that.inputString = Input.applyKeys(that.inputString,0)

		// Reset the screen
		StateMachine.drawMenuBar()
		Screen.outputBuffer()
		Screen.clearBuffer(Text.makeString(" "),1)
	}
	this.menuTrigger = function(action){
		switch (action){
			case "save":
				var zip = new JSZip();
				zip.file("code", Editor.getCode());

				var imageBlob;
				document.getElementById("font-canvas").toBlob(function(blob){
					imageBlob = blob
					zip.file("img", imageBlob)
					zip.generateAsync({type:"blob"})
					.then(function(content) {
					    // see FileSaver.js
					    saveAs(content, "game.batty");
					});
				})
			break;
			case "load":
				// File loading is a hack in input.js onkeydown because
				// browser security related to .click()
			break;
		}
	}
	this.hotKey = function(hotkey){
		console.log("hotkey")
		switch(hotkey){
			case "UP":
				that.menuPos --
				if (that.menuPos < 0){
					that.menuPos = that.menu.length - 1
				}
			break;
			case "DOWN":
				that.menuPos ++
				if (that.menuPos > that.menu.length - 1){
					that.menuPos = 0
				}
			break;
		}
		StateMachine.hotKey(hotkey)
	}
}