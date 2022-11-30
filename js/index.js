cfg.font = new Image()
cfg.font.src = "../assets/font.png"

cfg.font.onload = function(){
	var fontCtx = document.getElementById("font-canvas").getContext("2d")
	fontCtx.drawImage(cfg.font,0,0)
	cfg.font = fontCtx.canvas
	cfg.fontCtx = fontCtx
	window.requestAnimationFrame(StateMachine.machine)
}
	