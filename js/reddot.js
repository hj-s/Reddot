//arrow functions
const isDefined = (check) => (check !== undefined)
const round = (x) =>  (Math.round(x * 1000) / 1000)
const fuzzCheck = (a,b) => (Math.abs(a - b) <= 0.1)

//variables for canvas && square diameter
const sqfX = 40
const sqfY = 24
const sqfd = 20

const cwidth = sqfX*sqfd
const cheight = sqfY*sqfd
// const cwidth = window.innerWidth
// const cheight = window.innerHeight


const topCanvas = `reddot`
const middleCanvas = `maze`
const backCanvas = `fov`

//start pos for reddot
var startX = 0
var startY = 0

//const for random place borders 
const rPlace = 0.3
const dPlace = 0.7

//variables for  fov
var fovRM = 1
var currentTimer = undefined
var cTimers = undefined
//
//global variables for objects
var maze = undefined
var reddot = undefined
var exit = undefined
var fovEnhArr = undefined

var globalContext = undefined

//variables for draw some stuff
var drawFOVi = true
var drawPath = true

//ns
var debug = true

//movement
var speed = 1

var gmove = false

var moveU = false
var moveD = false
var moveL = false
var moveR = false

var gmoveU = false
var gmoveD = false
var gmoveL = false
var gmoveR = false


/*
	TODO list:
	- add speed events 
		make them diissapear after 10s
		timer does not stack
		and dissapear after new maze is created

*/


/*

	init functions {
*/

	//int
	function init(){
			
		Global.initglobal()

		Global.forDebug()
		
		globalContext = new ContextHandler(cwidth, cheight, backCanvas, middleCanvas, topCanvas)

		//startMaze
		startMaze()

		requestAnimationFrame(drawLoop)
	}

	//create maze & reddot
	function startMaze(){
		if (isDefined(currentTimer)){
			clearTimeout(currentTimer)
		}
		//create new field
		maze = new SqfField(sqfX, sqfY, sqfd)
		//create maze using method
		maze.createMaze(`eller`)
		//create point
		reddot = maze.createReddot()
		startX = reddot.x
		startY = reddot.y
		//clear path
		maze.addPath( new Point( startX, startY ) )
				//create exit
		exit = maze.createExit()
		//create fov enhancement points
		cTimers = 0
		fovEnhArr = new Array(5)
		for (let i = 0; i < fovEnhArr.length; i++){
			fovEnhArr[i] = maze.generatePoint(`fovEnh`)
		}

		draw3(middleCanvas)
	}

	// animation loop
	function drawLoop(){
		requestAnimationFrame(drawLoop)
	  	draw()
	}

/*
}
	additional funcitons {
*/
	//decreaseFov
	function decreaseFovf(){
		if (fovRM > 1){
			fovRM--
			currentTimer = undefined
			if (cTimers > 1){
				currentTimer = setTimeout(decreaseFovf, 10000)
			}
		}
	}
	//degradation of fov
	function fovDeg(){
		let timerID = setTimeout(decreaseFovf, 10000)
		cTimers++
		//for stacking fov
		if (isDefined(currentTimer)){
			clearTimeout(currentTimer)
		}
		return timerID
	}

/*
}
	special cheecks{
*/
	//check if reddot in fovEnh
	function checkFovEnh(){
		if (isDefined(reddot) && isDefined(fovEnhArr)){
			for (let i = 0; i < fovEnhArr.length; i++){
				if (reddot.is(fovEnhArr[i])){
					fovRM++
					fovEnhArr.splice( i, 1)
					currentTimer = fovDeg()
				}
			}
		}else {
			console.log(`reddot/fovEnhArr is not defined`)
			return false			
		}
	}
/*
}
	handlers {
*/

	function handleKeys(){
		if (isDefined(reddot) && isDefined(maze)){
			let move = false
			if (gmoveU || gmoveR || gmoveD || gmoveL){
				//continue to move
				if (gmoveU && gmoveR){
					reddot.view.x += speed
					reddot.view.y -= speed
					if (fuzzCheck(reddot.view.y/reddot.d, reddot.y -1) && fuzzCheck(reddot.view.x/reddot.d, reddot.x + 1)){
						reddot.view.x = (reddot.x + 1)*reddot.d
						reddot.view.y = (reddot.y - 1)*reddot.d
						move = true
						moveU = true
						moveR = true
						gmoveU = false
						gmoveR = false
					}

				}else if (gmoveR && gmoveD) {
					reddot.view.x += speed
					reddot.view.y += speed
					if (fuzzCheck(reddot.view.x/reddot.d, reddot.x + 1) && fuzzCheck( reddot.view.y/reddot.d, reddot.y + 1)){
						reddot.view.x = (reddot.x + 1)*reddot.d
						reddot.view.y = (reddot.y + 1)*reddot.d
						move = true
						moveR = true
						moveD = true
						gmove = false
						gmoveR = false
						gmoveD = false
					}
					
				}else if (gmoveD && gmoveL) {
					reddot.view.x -= speed
					reddot.view.y += speed
					if (fuzzCheck( reddot.view.y/reddot.d, reddot.y + 1) && fuzzCheck(reddot.view.x/reddot.d, reddot.x -1)) {
						reddot.view.x = (reddot.x -1)*reddot.d
						reddot.view.y = (reddot.y + 1)*reddot.d
						move = true
						moveD = true
						moveL = true
						gmoveD = false
						gmoveL = false
					}
					
				}else if (gmoveL && gmoveU) {
					reddot.view.x -= speed
					reddot.view.y -= speed
					if (fuzzCheck(reddot.view.x/reddot.d, reddot.x -1) && fuzzCheck(reddot.view.y/reddot.d, reddot.y -1)){
						reddot.view.x = (reddot.x -1)*reddot.d
						reddot.view.y = (reddot.y - 1)*reddot.d
						move = true
						moveL = true
						moveU = true
						gmoveL = false
						gmoveU = true
					}
				}else if (gmoveU) {
					reddot.view.y -= speed
					if (fuzzCheck(reddot.view.y/reddot.d, reddot.y -1)){
						reddot.view.y = (reddot.y - 1)*reddot.d
						move = true
						moveU = true
						gmoveU = false
					}
					
				}else if (gmoveR) {
					reddot.view.x += speed
					if (fuzzCheck(reddot.view.x/reddot.d, reddot.x + 1)){
						reddot.view.x = (reddot.x + 1)*reddot.d
						move = true
						moveR = true
						gmoveR = false
					}
				}else if (gmoveD) {
					reddot.view.y += speed
					if (fuzzCheck( reddot.view.y/reddot.d, reddot.y + 1)) {
						reddot.view.y = (reddot.y + 1)*reddot.d
						move = true
						moveD = true
						gmoveD = false
					}
				}else if (gmoveL) {
					reddot.view.x -= speed
					if (fuzzCheck(reddot.view.x/reddot.d, reddot.x -1)){
						reddot.view.x = (reddot.x -1)*reddot.d
						move = true
						moveL = true
						gmoveL = false
					}
				}
			}else{
				//start new move
				if (Global.upM && Global.rightM){
					if (!maze.checkWall(reddot.x, reddot.y, reddot.x+1, reddot.y-1)){
						gmoveU = gmoveR = true
					}
				}else if (Global.rightM && Global.downM) {
					if (!maze.checkWall(reddot.x, reddot.y, reddot.x+1, reddot.y+1)){
						gmoveR = gmoveD = true
					}
					
				}else if (Global.downM && Global.leftM) {
					if (!maze.checkWall(reddot.x, reddot.y, reddot.x-1, reddot.y+1)){
						gmoveD = gmoveL = true
					}
					
				}else if (Global.leftM && Global.upM) {
					if (!maze.checkWall(reddot.x, reddot.y, reddot.x-1, reddot.y-1)){
						gmoveL = gmoveU = true
					}
				}else if (Global.upM) {
					if (!maze.checkWall(reddot.x, reddot.y, reddot.x, reddot.y-1)){
						gmoveU = true
					}
				}else if (Global.rightM) {
					if (!maze.checkWall(reddot.x, reddot.y, reddot.x+1, reddot.y)){
						gmoveR = true
					}
				}else if (Global.downM) {
					if (!maze.checkWall(reddot.x, reddot.y, reddot.x, reddot.y+1)){
						gmoveD = true
					}
				}else if (Global.leftM) {
					if (!maze.checkWall(reddot.x, reddot.y, reddot.x-1, reddot.y)){
						gmoveL = true
					}
				}
			}
			if (move){
				if(moveU && moveR){
					reddot.y -= 1
					moveU = false
					gmoveU = false

					reddot.x += 1
					moveR = false	
					gmoveR = false
				}else if (moveR && moveD) {
					reddot.x += 1
					moveR = false	
					gmoveR = false

					reddot.y +=1
					moveD = false
					gmoveD = false
					
				}else if (moveD && moveL) {
					reddot.y +=1
					moveD = false
					gmoveD = false

					reddot.x -= 1
					moveL = false
					gmoveL = false
					
				}else if (moveL && moveU) {
					reddot.x -= 1
					moveL = false
					gmoveL = false

					reddot.y -= 1
					moveU = false
					gmoveU = false
					
				}else if (moveU) {
					reddot.y -= 1
					moveU = false
					gmoveU = false
					
				}else if (moveR) {
					reddot.x += 1
					moveR = false	
					gmoveR = false
				}else if (moveD) {
					reddot.y +=1
					moveD = false
					gmoveD = false
					
				}else if (moveL) {
					reddot.x -= 1
					moveL = false
					gmoveL = false
				}
				//add point to path
				if (isDefined(maze)){
					maze.addPath(reddot)
				}
				//check if fovEnh
				checkFovEnh()
				if (reddot.is(exit)){
					startMaze()
				}

			}
		}

	}

/*
}

	draw {
*/

	//main draw
	function draw(){
		let canvasID = backCanvas

		globalContext.clearCtx(canvasID)
		handleKeys()
		//draw exit
		if (isDefined(exit)){
			exit.render(globalContext.getCtx(canvasID))
		}
		for (let i = 0; i < fovEnhArr.length; i++){
			fovEnhArr[i].render(globalContext.getCtx(canvasID))
		}
		//draw fov
		if (isDefined(reddot) && drawFOVi){
			reddot.renderFov(globalContext.getCtx(canvasID))
		}

		canvasID = topCanvas
		globalContext.clearCtx(canvasID)
		//draw path
		if (isDefined(maze) && drawPath){
			maze.renderPath(globalContext.getCtx(canvasID))
		}
		//redraw reddot
		if (isDefined(reddot)){
			reddot.render(globalContext.getCtx(canvasID))
		}
		// if (isDefined(global.evil)){
		// 	//global.evil.move()
		// 	global.evil.render(globalContext.getCtx(canvasID))
		// }
	}
	function draw3(canvasID){
		globalContext.clearCtx(canvasID)

		//redraw maze
		if (isDefined(maze)){
			maze.render(globalContext.getCtx(canvasID))
		}
	}


//}
//	classes {
	class Global {
		constructor(){}
		static initglobal(){
			
			Global.initListeners()

			this.upM = false
			this.downM = false
			this.rightM = false
			this.leftM = false
		}
		static initListeners(){
			if (isDefined(document)) {
				document.addEventListener(`keydown`, this.handleKeysDown)
				document.addEventListener(`keyup`, this.handleKeysUp)
			}
		}

		//handle keys
		static handleKeysDown(event){
			//check what keys are down
			if (event.key == `W` || event.key == `w` || event.keyCode == 119 || event.keyCode == 87 || event.keyCode == 38) { //w
				Global.upM = true
			}
			if (event.key == `S` || event.key == `s` || event.keyCode == 115 || event.keyCode == 83 || event.keyCode == 40) { //s
				Global.downM = true
			}
			if (event.key == `A` || event.key == `a` || event.keyCode == 97 || event.keyCode == 65 || event.keyCode == 37) { //a
				Global.leftM = true
			}
			if (event.key == `D` || event.key == `d` || event.keyCode == 100 || event.keyCode == 68 || event.keyCode == 39) { //d
				Global.rightM = true
			}
		}
		//handle keys
		static handleKeysUp(event){
			//checm what keys are UP
			if (event.key == `W` || event.key == `w` || event.keyCode == 119 || event.keyCode == 87 || event.keyCode == 38) { //w
				Global.upM =  false
			}
			if (event.key == `S` || event.key == `s` || event.keyCode == 115 || event.keyCode == 83 || event.keyCode == 40) { //s
				Global.downM = false
			}
			if (event.key == `A` || event.key == `a` || event.keyCode == 97 || event.keyCode == 65 || event.keyCode == 37) { //a
				Global.leftM = false
			}
			if (event.key == `D` || event.key == `d` || event.keyCode == 100 || event.keyCode == 68 || event.keyCode == 39) { //d
				Global.rightM = false
			}
		}
		static forDebug(){
			if (debug){
				if (isDefined(document)) {
					let controlBox = document.getElementById(`controls`)
					if (isDefined(controlBox)) { controlBox.style.visibility = `visible` }
					let pathCb = document.getElementById(`path`)
					if (isDefined(pathCb)){
						//add listener
						pathCb.addEventListener(`change`, this.handlePathCb)
					}

					let fovCb = document.getElementById(`fovcb`)
					if (isDefined(fovCb)){
						fovCb.addEventListener(`change`, this.handleFovCb)
						fovCb.style.visibility = `visible`
					}
				}
			}
		}
		//handle path checkbox
		static handlePathCb(event){
			if (isDefined(event)){				
				drawPath = event.target.checked
			}
		}
		//handle fov checkbox
		static handleFovCb(event){
			if (isDefined(event)){
				drawFOVi = event.target.checked
			}
		}
		static createEvli(){
			if (isDefined(maze)){
				this.evil = maze.generatePoint(`exit`)

				//ai for evil
				this.evil.move = function(){
					if (!maze.checkWall(Global.evil.x, Global.evil.y, Global.evil.x + 1, Global.evil.y)){
						Global.evil.x++
					}else if (!maze.checkWall(Global.evil.x, Global.evil.y, Global.evil.x - 1, Global.evil.y)) {
						Global.evil.x--
					}
				}	

			}
		}
	}

	//context handler for using contexts of canvas
	//works with any amount of canvases
	//just put id of canvases to  funciton
	class ContextHandler {
		constructor(width, height, ...rest){	
			for (let i = 0; i < rest.length; i++){
				this[rest[i]] = this.initCtx(rest[i], width, height)
				if (!isDefined(this[rest[i]])){
					this[rest[i]].restore()
				}
			}
		}
		initCtx(id, width, height){
			let canvas = document.getElementById(id)
			if (isDefined(canvas)){
				canvas.height = height
				canvas.width = width
				if (canvas.getContext){
					let ctx  = canvas.getContext(`2d`, { alpha: false })
					ctx.beginPath()
					ctx.globalAlpha = 1
					ctx.lineCap = `round`
					ctx.lineJoin = `round`
					ctx.lineWidth = 2
					ctx.globalCompositeOperation = `source-over`
					ctx.save()				
					return ctx
				}else{
					return undefined
				}
			}else {
				return undefined
			}		
		}
		getCtx(id){
			if (isDefined(this[id])){
				this[id].restore()
				this[id].beginPath()
			}
			return this[id]
		}
		clearCtx(id){
			let ctx = this[id]
			if (isDefined(ctx)){
				ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height) 
				ctx.closePath()
			}			
		}
	}
	class Point {
		constructor(x = 0 , y = 0, d = 0, type = undefined){
			this.x = x
			this.y = y
			this.d = d
			this.type = type
			this.view = {}
			this.view.x = x * d
			this.view.y = y * d
		}
		is(point){
			return (this.x == point.x && this.y == point.y)
		}
		render(ctx){
			if (isDefined(ctx)){
				switch (this.type) {
					case `reddot`:
						this.renderReddotView(ctx)
						break
					case `exit`:
						this.renderExitView(ctx)
						break
					case `fovEnh`:
						this.renderFovEnhView(ctx)
						break
					default:
						break
				}
			}
		}
		renderReddotView(ctx){
			ctx.fillStyle = `red` 
			ctx.arc(this.view.x + this.d/2 , this.view.y + this.d/2, (this.d-5)/2 , 0, 2 * Math.PI)
			ctx.closePath()
			ctx.fill()
		}
		renderExit(ctx){
			ctx.strokeStyle = `red`
			ctx.globalCompositeOperation = `source-over`
			ctx.strokeRect(this.x * this.d + this.d/4, this.y * this.d + this.d/4 , this.d/2, this.d/2)
			ctx.closePath()
		}
		renderExitView(ctx){
			ctx.strokeStyle = `red`
			ctx.globalCompositeOperation = `source-over`
			ctx.strokeRect(this.view.x + this.d/4, this.view.y + this.d/4 , this.d/2, this.d/2)
			ctx.closePath()
		}
		renderFovEnhView(ctx){
			ctx.strokeStyle = `blue`
			ctx.globalCompositeOperation = `source-over`
			ctx.strokeRect(this.view.x + this.d/4, this.view.y + this.d/4 , this.d/2, this.d/2)
			ctx.closePath()
		}
		renderFov(ctx){
			ctx.globalCompositeOperation = `darken`
			let gradient = ctx.createRadialGradient(this.view.x + this.d/2, this.view.y + this.d/2, this.d * fovRM, this.view.x + this.d/2, this.view.y + this.d/2, this.d * (fovRM * 2))
			gradient.addColorStop(0, `white`) //from
			gradient.addColorStop(1, `black`) //to
			ctx.fillStyle = gradient
			ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
			ctx.closePath()
		}
	}
	//square to fill maze
	class Sqf {
		constructor(up = false, right = false, down = false, left = false){
			this.up = up
			this.right = right
			this.down = down
			this.left = left
			this.index = 0
		}
		setAsSqf(sqf){
			this.up = sqf.up
			this.right = sqf.right
			this.down = sqf.down
			this.left = sqf.left
			this.index = sqf.index
		}
	}
	//field of sqfs 
	class SqfField {
		constructor(width, height, d){
			this.width = width
			this.height = height
			this.d = d
			this.field = new Array(height)
			for(let i = 0; i < height; i++){
				this.field[i] = new Array(width)
				for (let j = 0; j < width; j++){
					this.field[i][j] = new Sqf()
				}
			}
			this.path = undefined
		}
		createMaze(type){
			//for performance testing
			let time = isDefined(performance) ? performance.now() : 0
	  		switch (type) {
	  			case `eller`:
	  				this.eller()
	  				break
	  			default:
	  				console.log(`Not supproted`)
	  				break
	  		}
		  	time = isDefined(performance) ? performance.now() - time : 0
			console.log(type + ` time: ${round(time)}`)
	  		//borders are the same
	  		//fill borders horizontal
			for (let i = 0; i < this.height; i++){
				this.field[i][0].left = true
				this.field[i][this.width-1].right = true
			}
			//fill borders vertical
			for (let i = 0; i < this.width; i++){
				this.field[0][i].up = true
				this.field[this.height-1][i].down = true
			}
			//fill.corners
			this.field[0][0].left = true
			this.field[0][0].up = true
			this.field[0][this.width-1].up = true
			this.field[0][this.width-1].right = true
			this.field[this.height-1][0].down = true
			this.field[this.height-1][0].left = true
			this.field[this.height-1][this.width-1].right = true
			this.field[this.height-1][this.width-1].down = true
		}
		eller(){
			for (let j = 0; j < this.width; j++) {
				this.field[0][j].index = j
			}
			for (let i = 0; i < this.height; i++) {
				if (i != this.height - 1){ //not last line
					//set right
					for (let j = 0; j < this.width - 1; j++) {
						//place right
						if (this.field[i][j].index == this.field[i][j+1].index){
							this.field[i][j].right = true //place right to this box
							this.field[i][j+1].left = true //and to right for easy check of path
						}else{
							if (Math.random() < rPlace) { 
								this.field[i][j].right = true //place right to this box
								this.field[i][j+1].left = true //and to right for easy check of path
							}else {
								this.field[i][j+1].index = this.field[i][j].index
							}
						}
					}
					//place down
					let downWay = false
					let cindex = 0
					let maxindex = 0
					for (let j = 0; j < this.width; j++) {
						if ( cindex != this.field[i][j].index) { 
							downWay = false 
						}
						if (Math.random() < dPlace){
							if (j != this.width-1) {
								if (this.field[i][j].index == this.field[i][j+1].index || downWay){
									this.field[i][j].down = true
								}else{
									downWay = true
								}
							}else if (downWay) {
								this.field[i][j].down = true
							}else {
								downWay = true
							}
						}else{
							downWay = true
						}	
						cindex = this.field[i][j].index
						maxindex = (cindex > maxindex) ? cindex : maxindex
					}
					maxindex++
					//copy to next line
					let line =  new Array(this.width)
					for (let j = 0; j < this.width; j++){
						line[j] = new Sqf()
						line[j].setAsSqf(this.field[i][j])
					}
					//delete all right 
					for (let j = 0; j < this.width; j++) {
						if (line[j].right) {
							line[j].right = false
						}
						if (line[j].left){
							line[j].left = false
						}
						//remove all ups because we must match current line downs to next line ups
						if (line[j].up){
							line[j].up = false
						}
						if (line[j].down){
							line[j].index = maxindex++
							line[j].down = false
							//match downs and ups
							line[j].up = true
						}
					}
					//place nextline
					this.field[i+1] = line
				}else{
					//last line
					for (let j = 0; j < this.width; j++) {
						//place right
						if (j != this.width-1){
							if (this.field[i][j].index == this.field[i][j+1].index){
								this.field[i][j].right = true
								this.field[i][j+1].left = true
							}
						}
					}
				}
			}
		}
		render(ctx){
			let lstartX = 0
			let lstartY = 0
			ctx.strokeStyle = `black`
			for (let i = 0; i < this.height; i++){
				for (let j = 0; j < this.width; j++){
					if (this.field[i][j].up){
						ctx.moveTo(lstartX, lstartY)
						ctx.lineTo(lstartX + this.d, lstartY)
					}
					if (this.field[i][j].right){
						ctx.moveTo(lstartX + this.d, lstartY)
						ctx.lineTo(lstartX + this.d, lstartY + this.d)
					}
					if (this.field[i][j].down && i == this.height - 1 ){
						ctx.moveTo(lstartX, lstartY + this.d)
						ctx.lineTo(lstartX + this.d, lstartY + this.d)
					}
					if (this.field[i][j].left && j == 0){
						ctx.moveTo(lstartX, lstartY)
						ctx.lineTo(lstartX, lstartY + this.d)
					}
					lstartX += this.d
				}
				lstartX = 0
				lstartY += this.d
			}
			ctx.closePath()
			ctx.stroke()
		}
		addPath(point){
			if (!isDefined(this.path)) { this.path = new Array() }
			this.path.push( new Point( point.x, point.y ) )
		}
		renderPath(ctx){
			if (isDefined(this.path)){
				if (this.path.length > 1){
					ctx.strokeStyle = `purple`
					ctx.globalCompositeOperation = `source-over`
					for( let i = 1; i < this.path.length; i++){ 
						ctx.moveTo(this.path[i-1].x * this.d + this.d/2, this.path[i-1].y * this.d +  this.d/2)
						ctx.lineTo( this.path[i].x* this.d + this.d/2, this.path[i].y* this.d +  this.d/2)	
					}
					ctx.closePath()
					ctx.stroke()
				}
			}
		}
		checkWall(xf, yf, xt, yt){
			if(  xt < 0 || yt < 0 || xt > this.width - 1 || yt > this.height - 1){
				return true
			}
			let diffX = xf - xt
			let diffY = yf - yt
			if (Math.abs(diffX) != 0  && Math.abs(diffY) != 0){
				//to corner
				if (diffX > 0 && diffY > 0){
					//up-left
					return this.field[yt][xt].down && this.field[yt][xt].right 
						|| this.field[yf][xf].up && this.field[yf][xf].left 
						|| this.field[yf][xf].up && this.field[yt][xt].down 
						|| this.field[yf][xf].left && this.field[yt][xt].right
				}else if (diffX < 0 && diffY < 0) {
					//down-right
					return this.field[yt][xt].up && this.field[yt][xt].left 
						|| this.field[yf][xf].down && this.field[yf][xf].right 
						|| this.field[yf][xf].down && this.field[yt][xt].up 
						|| this.field[yf][xf].right && this.field[yt][xt].left
				}else if (diffX > 0 && diffY < 0) {
					//down-left
					return this.field[yt][xt].up && this.field[yt][xt].right 
						|| this.field[yf][xf].down && this.field[yf][xf].left 
						|| this.field[yf][xf].down && this.field[yt][xt].up 
						|| this.field[yf][xf].left && this.field[yt][xt].right
				}else if (diffX < 0 && diffY > 0) {
					//up-right
					return this.field[yt][xt].down && this.field[yt][xt].left 
						|| this.field[yf][xf].up && this.field[yf][xf].right 
						|| this.field[yf][xf].up && this.field[yt][xt].down 
						|| this.field[yf][xf].right && this.field[yt][xt].left
				}

			}else if (Math.abs(diffX) != 0 && Math.abs(diffY) == 0 ) {
				//horizontal
				if (diffX > 0){
					return this.field[yf][xf].left
				}else {
					return this.field[yf][xf].right
				}
			}else if (Math.abs(diffX) == 0 && Math.abs(diffY) != 0) {
				//vertical
				if (diffY > 0){
					return this.field[yf][xf].up
				}else {
					return this.field[yf][xf].down
				}
			}else {
				return false
			}
		}
		generatePoint(type){
			let point = new Point( Math.floor( Math.random() * this.width), Math.floor( Math.random() * this.height), this.d, type)
			if (isDefined(reddot)){
				if (point.is(reddot)) { 
					return this.generatePoint(type)
				}
			}
			if (isDefined(exit)){
				if  (point.is(exit)){
					return gthis.eneratePoint(type)
				}
			}
			return point
		}
		generatePointAtWall(type){
			let walls = [`up`,`right`,`down`,`left`]
			//choose wall
			let randomItem = walls[Math.floor(Math.random()*walls.length)]
			//shose position on the wall
			if (randomItem == `up`){
				return new Point(Math.floor(Math.random() * this.width), 0, this.d,  type)
			}else if (randomItem == `right`) {
				return new Point( this.width - 1, Math.floor( Math.random() * this.height), this.d, type)
			}else if (randomItem == `down`) {
				return new Point(Math.floor(Math.random() * this.width),  this.height - 1, this.d, type)
			}else if (randomItem ==`left` ) {
				return new Point(0 ,Math.floor( Math.random() * this.height), this.d, type)
			}else {
				console.log(`unknown wall`)
				return this.generatePoint(type)
			}
		}
			//function createReddot
		createReddot(){
			return this.generatePointAtWall(`reddot`)	
		}
		//create exit
		createExit() {
			let cexit = this.generatePointAtWall(`exit`)
			if (isDefined(reddot)){
				return (cexit.is(reddot) ? this.createExit() : cexit )
			}else {
				return cexit
			} 
		}
	}

//}
