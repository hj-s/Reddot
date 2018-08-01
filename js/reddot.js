//arrow functions
const isDefined = (check) => (check !== undefined)
const round = (x) =>  (Math.round(x * 1000) / 1000)

//variables for canvas && square diameter
const sqfX = 40
const sqfY = 24
const sqfd = 20

const cwidth = sqfX*sqfd
const cheight = sqfY*sqfd

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
var path = undefined
var fovEnhArr = undefined
//var pointArray = undefined
var reddotView = undefined

//variables for draw some stuff
var drawFOV = true
var drawPath = true

//ns
var debug = true

var leftM = false
var rightM = false
var upM = false
var downM = false
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

*/

/*
	test functions{
	
	
*/


/*
}
*/


/*

	init functions {
*/

	//int
	function init(){
		initCanvas(`field2`)
		
		initCanvas(`field`)
			
		initListeners()

		forDebug()
		
		createAnimFrame()
			
		//startMaze
		startMaze()

		drawLoop()
	}
	function initCanvas(canvasID){
		let canvas = document.getElementById(canvasID)
		if (canvas.getContext) {
			//set canvase size
			canvas.height = cheight
			canvas.width = cwidth
		} else {
			alert(`Your browser does not support canvas`)
		}
	}
	function initListeners(){
		//add keypress listener
		if (isDefined(document)) {
			document.addEventListener(`keydown`, handleKeysDown)
			document.addEventListener(`keyup`, handleKeysUp)
		}
	}
	function createAnimFrame(){
		if (isDefined(window)){
			window.requestAnimFrame = (
					function(){
						return  window.requestAnimationFrame       ||
								window.webkitRequestAnimationFrame ||
								window.mozRequestAnimationFrame    ||
								function( callback ){
									window.setTimeout(callback, 1000 / 60);
								};
			})();
		}
	}
	function forDebug(){
		if (debug){
			if (isDefined(document)) {
				let controlBox = document.getElementById(`controls`)
				if (isDefined(controlBox)) { controlBox.style.visibility = `visible` }
				let pathCb = document.getElementById(`path`)
				if (isDefined(pathCb)){
					//add listener
					pathCb.addEventListener(`change`, handlePathCb)
				}

				let fovCb = document.getElementById(`fov`)
				if (isDefined(fovCb)){
					fovCb.addEventListener(`change`, handleFovCb)
					fovCb.style.visibility = `visible`
				}
			}
		}
	}
	//create maze & reddot
	function startMaze(){
		if (isDefined(currentTimer)){
			clearTimeout(currentTimer)
		}
		//create new field
		maze = new SqfField(sqfX, sqfY)
		//create maze using method
		maze.createMaze(`eller`)
		//create point
		reddot = createReddot()
		startX = reddot.x
		startY = reddot.y
		reddotView = new Point(startX*sqfd,startY*sqfd,`reddot`)
		//clear path
		path = undefined
		addPointToPath(new Point(startX,startY,`path`))
		//create exit
		exit = createExit()
		//create fov enhancement points
		cTimers = 0
		fovEnhArr = new Array(5)
		for (let i = 0; i < fovEnhArr.length; i++){
			fovEnhArr[i] = generatePoint(`fovEnh`)
		}

		drawStatic(`field2`)
	}

	// animation loop
	function drawLoop(){
		draw();
		requestAnimFrame(drawLoop);
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

	//add point to path
	function addPointToPath(point){
		if (isDefined(point)){
			if (!isDefined(path)){
				path = new Array()
			}
			path.push(new Point(point.x, point.y, `path`))
		}else {
			console.log(`point is not defined`)
		}
	}
/*
}
	generate game objecs{
*/
	//generate random point on the wall
	function generatePointAtWall(type = undefined){
		let walls = [`up`,`right`,`down`,`left`]
		//choose wall
		let randomItem = walls[Math.floor(Math.random()*walls.length)]
		//shose position on the wall
		if (randomItem == `up`){
			return new Point(Math.floor(Math.random()*sqfX), 0, type)
		}else if (randomItem == `right`) {
			return new Point(sqfX - 1, Math.floor(Math.random()*sqfY), type)
		}else if (randomItem == `down`) {
			return new Point(Math.floor(Math.random()*sqfX), sqfY - 1, type)
		}else if (randomItem ==`left` ) {
			return new Point(0 ,Math.floor(Math.random()*sqfY), type)
		}else {
			console.log(`unknown wall`)
			return generatePoint(type)
		}
	}
	//generate random point
	function generatePoint(type = undefined){
		let point = new Point( Math.floor(Math.random()*sqfX), Math.floor(Math.random()*sqfY), type)
		if (isDefined(reddot)){
			if (point.is(reddot)) { 
				return generatePoint(type)
			}
		}
		if (isDefined(exit)){
			if  (point.is(exit)){
				return generatePoint(type)
			}
		}
		return point
	}
	//function createReddot
	function  createReddot(){
		return generatePointAtWall(`reddot`)
	}
	//create exit
	function createExit() {
		if (isDefined(maze)){
			let cexit = generatePointAtWall(`exit`)
			if (isDefined(reddot)){
				return (cexit.is(reddot) ? createExit() : cexit )
			}else {
				return cexit
			} 
		}
	}
/*
}
	special cheecks{
*/
	//check if can move from x,y to x1y1
	function checkWall(xf, yf, xt, yt){
		//TODO: check  sides of fiels
		if (isDefined(maze)){
			if(  xt < 0 || yt < 0 || xt > maze.width - 1 || yt > maze.height - 1){
				return true
			}
			let diffX = xf - xt
			let diffY = yf - yt
			if (Math.abs(diffX) != 0  && Math.abs(diffY) != 0){
				//to corner
				if (diffX > 0 && diffY > 0){
					//up-left
					return maze.field[yt][xt].down && maze.field[yt][xt].right 
						|| maze.field[yf][xf].up && maze.field[yf][xf].left 
						|| maze.field[yf][xf].up && maze.field[yt][xt].down 
						|| maze.field[yf][xf].left && maze.field[yt][xt].right
				}else if (diffX < 0 && diffY < 0) {
					//down-right
					return maze.field[yt][xt].up && maze.field[yt][xt].left 
						|| maze.field[yf][xf].down && maze.field[yf][xf].right 
						|| maze.field[yf][xf].down && maze.field[yt][xt].up 
						|| maze.field[yf][xf].right && maze.field[yt][xt].left
				}else if (diffX > 0 && diffY < 0) {
					//down-left
					return maze.field[yt][xt].up && maze.field[yt][xt].right 
						|| maze.field[yf][xf].down && maze.field[yf][xf].left 
						|| maze.field[yf][xf].down && maze.field[yt][xt].up 
						|| maze.field[yf][xf].left && maze.field[yt][xt].right
				}else if (diffX < 0 && diffY > 0) {
					//up-right
					return maze.field[yt][xt].down && maze.field[yt][xt].left 
						|| maze.field[yf][xf].up && maze.field[yf][xf].right 
						|| maze.field[yf][xf].up && maze.field[yt][xt].down 
						|| maze.field[yf][xf].right && maze.field[yt][xt].left
				}

			}else if (Math.abs(diffX) != 0 && Math.abs(diffY) == 0 ) {
				//horizontal
				if (diffX > 0){
					return maze.field[yf][xf].left
				}else {
					return maze.field[yf][xf].right
				}
			}else if (Math.abs(diffX) == 0 && Math.abs(diffY) != 0) {
				//vertical
				if (diffY > 0){
					return maze.field[yf][xf].up
				}else {
					return maze.field[yf][xf].down
				}
			}else {
				return false
			}
		}else {
			console.log(`maze is not defined`)
			return false
		}
	}
	//check if reddot in fovEnh
	function checkFovEnh(){
		if (isDefined(reddot) && isDefined(fovEnhArr)){
			for (let i = 0; i < fovEnhArr.length; i++){
				if (checkPoint(fovEnhArr[i])){
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
	//check if point is in allPoints array
	// function checkPointArray(point){
	// 	if (isDefined(point) && isDefined(pointArray)){
	// 		for (let i = 0; i < pointArray.length; i++){
	// 			if (point.is(pointArray[i])){
	// 				return false
	// 			}
	// 		}
	// 		return true
	// 	}else {
	// 		console.log(`point/points is not defined`)
	// 		return true
	// 	}
	// }
	//check if reddot in point
	function checkPoint(point){
		if (isDefined(reddot) && isDefined(point)){
			return reddot.is(point)
		}else {
			console.log(`reddot/point is not defined`)
			return false
		}
	}
	//check if reddot in exit
	function checkExit(){
		if (isDefined(reddot) && isDefined(exit)){
			return reddot.is(exit)
		}else {
			console.log(`reddot/exit is not defined`)
			return false
		}
	}
	//fuzz check for fuzz placement
	function fuzzCheck(one, two){
		let delta = 0.1
		let diff = Math.abs(one - two)
		return (diff <= delta)
	}
	//function for check reddot in event
	// function checkReddotEvents(){
	// 	if (isDefined(reddot)){
	// 		if (checkExit()){

	// 		}
	// 		if (checkFovEnh()){

	// 		}
	// 	}else {
	// 		console.log(`reddot isa not defined`)
	// 		return false
	// 	}
	// }


/*
}
	handlers {
*/

	//handle path checkbox
	function handlePathCb(event){
		if (isDefined(event)){
			if (drawPath != event.target.checked){
				drawPath = event.target.checked
				draw()
			}
		}
	}
	//handle fov checkbox
	function handleFovCb(event){
		if (isDefined(event)){
			if (drawFOV != event.target.checked){
				drawFOV = event.target.checked
				draw()
			}
		}
	}
	//handle keys
	function handleKeysDown(event){
		//check what keys are down
		if (event.key == `W` || event.key == `w` || event.keyCode == 119 || event.keyCode == 1094 || event.keyCode == 38) { //w
			upM = true
		}
		if (event.key == `S` || event.key == `s` || event.keyCode == 115 || event.keyCode == 1099 || event.keyCode == 40) { //s
			downM = true
		}
		if (event.key == `A` || event.key == `a` || event.keyCode == 97 || event.keyCode == 1092 || event.keyCode == 37) { //a
			leftM = true
		}
		if (event.key == `D` || event.key == `d` || event.keyCode == 100 || event.keyCode == 1074 || event.keyCode == 39) { //d
			rightM = true
		}
	}
	//handle keys
	function handleKeysUp(event){
		//checm what keys are UP
			if (event.key == `W` || event.key == `w` || event.keyCode == 119 || event.keyCode == 1094 || event.keyCode == 38) { //w
				upM =  false
			}
			if (event.key == `S` || event.key == `s` || event.keyCode == 115 || event.keyCode == 1099 || event.keyCode == 40) { //s
				downM = false
			}
			if (event.key == `A` || event.key == `a` || event.keyCode == 97 || event.keyCode == 1092 || event.keyCode == 37) { //a
				leftM = false
			}
			if (event.key == `D` || event.key == `d` || event.keyCode == 100 || event.keyCode == 1074 || event.keyCode == 39) { //d
				rightM = false
			}
	}
	function handleKeys(){
		if (isDefined(reddot)){
			let move = false
			if (gmoveU || gmoveR || gmoveD || gmoveL){
				//continue to move
				if (gmoveU && gmoveR){
					reddotView.x += 1
					reddotView.y -= 1
					if (fuzzCheck(reddotView.y/sqfd, reddot.y -1) && fuzzCheck(reddotView.x/sqfd, reddot.x + 1)){
						reddotView.x = (reddot.x + 1)*sqfd
						reddotView.y = (reddot.y - 1)*sqfd
						move = true
						moveU = true
						moveR = true
						gmoveU = false
						gmoveR = false
					}

				}else if (gmoveR && gmoveD) {
					reddotView.x += 1
					reddotView.y += 1
					if (fuzzCheck(reddotView.x/sqfd, reddot.x + 1) && fuzzCheck( reddotView.y/sqfd, reddot.y + 1)){
						reddotView.x = (reddot.x + 1)*sqfd
						reddotView.y = (reddot.y + 1)*sqfd
						move = true
						moveR = true
						moveD = true
						gmove = false
						gmoveR = false
						gmoveD = false
					}
					
				}else if (gmoveD && gmoveL) {
					reddotView.x -= 1
					reddotView.y += 1
					if (fuzzCheck( reddotView.y/sqfd, reddot.y + 1) && fuzzCheck(reddotView.x/sqfd, reddot.x -1)) {
						reddotView.x = (reddot.x -1)*sqfd
						reddotView.y = (reddot.y + 1)*sqfd
						move = true
						moveD = true
						moveL = true
						gmoveD = false
						gmoveL = false
					}
					
				}else if (gmoveL && gmoveU) {
					reddotView.x -= 1
					reddotView.y -= 1
					if (fuzzCheck(reddotView.x/sqfd, reddot.x -1) && fuzzCheck(reddotView.y/sqfd, reddot.y -1)){
						reddotView.x = (reddot.x -1)*sqfd
						reddotView.y = (reddot.y - 1)*sqfd
						move = true
						moveL = true
						moveU = true
						gmoveL = false
						gmoveU = true
					}
				}else if (gmoveU) {
					reddotView.y -= 1
					if (fuzzCheck(reddotView.y/sqfd, reddot.y -1)){
						reddotView.y = (reddot.y - 1)*sqfd
						move = true
						moveU = true
						gmoveU = false
					}
					
				}else if (gmoveR) {
					reddotView.x += 1
					if (fuzzCheck(reddotView.x/sqfd, reddot.x + 1)){
						reddotView.x = (reddot.x + 1)*sqfd
						move = true
						moveR = true
						gmoveR = false
					}
				}else if (gmoveD) {
					reddotView.y += 1
					if (fuzzCheck( reddotView.y/sqfd, reddot.y + 1)) {
						reddotView.y = (reddot.y + 1)*sqfd
						move = true
						moveD = true
						gmoveD = false
					}
				}else if (gmoveL) {
					reddotView.x -= 1
					if (fuzzCheck(reddotView.x/sqfd, reddot.x -1)){
						reddotView.x = (reddot.x -1)*sqfd
						move = true
						moveL = true
						gmoveL = false
					}
				}
			}else{
				//start new move
				if (upM && rightM){
					if (!checkWall(reddot.x, reddot.y, reddot.x+1, reddot.y-1)){
						gmoveU = gmoveR = true
					}

				}else if (rightM && downM) {
					if (!checkWall(reddot.x, reddot.y, reddot.x+1, reddot.y+1)){
						gmoveR = gmoveD = true
					}
					
				}else if (downM && leftM) {
					if (!checkWall(reddot.x, reddot.y, reddot.x-1, reddot.y+1)){
						gmoveD = gmoveL = true
					}
					
				}else if (leftM && upM) {
					if (!checkWall(reddot.x, reddot.y, reddot.x-1, reddot.y-1)){
						gmoveL = gmoveU = true
					}
					
				}else if (upM) {
					if (!checkWall(reddot.x, reddot.y, reddot.x, reddot.y-1)){
						gmoveU = true
					}
				}else if (rightM) {
					if (!checkWall(reddot.x, reddot.y, reddot.x+1, reddot.y)){
						gmoveR = true
					}
				}else if (downM) {
					if (!checkWall(reddot.x, reddot.y, reddot.x, reddot.y+1)){
						gmoveD = true
					}
				}else if (leftM) {
					if (!checkWall(reddot.x, reddot.y, reddot.x-1, reddot.y)){
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
				addPointToPath(reddot)
				//check if fovEnh
				checkFovEnh()
				if (checkExit()){
					startMaze()
				}

			}
		}

	}

/*
}
	functions with canvas {
*/

	function getCtx(id){
		let canvas = document.getElementById(id)
		if (isDefined(canvas)){
			if (canvas.getContext){
				let ctx  = canvas.getContext(`2d`, { alpha: false })//alfa: false for optimization
				ctx.restore()
				return ctx
			}else {
				console.log(`canvas.getContext is not defined`)
				return undefined
			}	
		}else {
			console.log(`canvas is not defined`)
			return undefined
		}
	}
	//clear canvas for new draw
	function clearCanvas(canvasID){
		let ctx = getCtx(canvasID)
		if (isDefined(ctx)){
			let canvas = document.getElementById(canvasID)
			//some odd way to clear canvas
			ctx.clearRect(0, 0, canvas.width, canvas.height) 
			ctx.save()
		}else {
			console.log(`ctx is not defined`)
		}
	}

/*
}
	draw game elements {
*/

	//main draw
	function draw(test = false){
		let canvasID = `field`
		let time
		if (test){
			time = isDefined(performance) ? performance.now() : 0
		}
		//clear canvas
		clearCanvas(canvasID)
		handleKeys()
		//draw exit
		if (isDefined(exit)){
			drawExit(canvasID)
		}
		for (let i = 0; i < fovEnhArr.length; i++){
			drawFovEnh(fovEnhArr[i], canvasID)
		}
		//draw gradient
		if (isDefined(reddot) && drawFOV){
			drawFov(canvasID)
		}
		//draw path
		if (isDefined(path) && drawPath){
			drawPathLine(canvasID)
		}
		//redraw reddot
		if (isDefined(reddotView)){
			drawreddotView(canvasID)
		}
		if (test){
			time = isDefined(performance) ? performance.now() - time : 0
			console.log(` time: ${round(time)}`)
		}
	}
	function drawStatic(canvasID){
		clearCanvas(canvasID)

		//redraw maze
		if (isDefined(maze)){
			drawMaze(canvasID)
		}
	}
	//draw line for path, path is array of points
	function drawPathLine(canvasID){
		let ctx = getCtx(canvasID)
		if (isDefined(ctx)){
			if (isDefined(path) && drawPath){
				ctx.beginPath()
				ctx.strokeStyle = `purple`
				ctx.globalCompositeOperation = `source-over`
				ctx.moveTo(startX*sqfd + sqfd/2, startY*sqfd + sqfd/2)
				for( let i = 0; i < path.length; i++){ //add line to path view
					ctx.lineTo(path[i].x*sqfd + sqfd/2, path[i].y*sqfd + sqfd/2)	
				}
				ctx.stroke()
				ctx.closePath()
				ctx.save()
			}
		}else {
			console.log(`ctx is not defined`)
		}
	}
	//draw square for exit
	function drawExit(canvasID){
		if (isDefined(exit)){
			let ctx = getCtx(canvasID)
			if (isDefined(ctx)){
				ctx.strokeStyle = `red`
				ctx.globalCompositeOperation = `source-over`
				ctx.strokeRect(exit.x*sqfd + sqfd/4, exit.y*sqfd + sqfd/4 ,sqfd/2,sqfd/2)
				ctx.save()
			}else {
				console.log(`ctx is not defined`)
			}
		}else {
			console.log(`exit is not defined`)
		}
	}
	//draw green square for fovEnh
	function drawFovEnh(point, canvasID){
		if (isDefined(point)){
			let ctx = getCtx(canvasID)
			if (isDefined(ctx)){
				ctx.strokeStyle = `green`
				ctx.globalCompositeOperation = `source-over`
				ctx.strokeRect(point.x*sqfd + sqfd/4, point.y*sqfd + sqfd/4 ,sqfd/2,sqfd/2)
				ctx.save()
			}else {
				console.log(`ctx is not defined`)
			}
		}else {
			console.log(`point is not defined`)
		}
	}
	//draw foel of view based on reddot smooth view
	function drawFov(canvasID){
		if (isDefined(reddotView)){
			drawGradient2(reddotView, canvasID)
		}else {
			console.log(`reddotView is not defiend`)
		}
	}
	//draw all maze
	function drawMaze(canvasID){
		if (isDefined(maze)){
			let ctx = getCtx(canvasID)
			ctx.strokeStyle = `black`
			if (isDefined(ctx)){
				let lstartX = 0
				let lstartY = 0
				//test
				ctx.beginPath()
				ctx.strokeStyle = `black`
				ctx.globalCompositeOperation = `source-over`
				for (let i = 0; i < maze.height; i++){
					for (let j = 0; j < maze.width; j++){
						//we can remove some draws of lines due to i's right = i+1's left
						//someday...
						if (maze.field[i][j].up){
							ctx.moveTo(lstartX, lstartY)
							ctx.lineTo(lstartX + sqfd, lstartY)
						}
						if (maze.field[i][j].right){
							ctx.moveTo(lstartX + sqfd, lstartY)
							ctx.lineTo(lstartX + sqfd, lstartY + sqfd)
						}
						// if (maze.field[i][j].down){
						// 	ctx.moveTo(lstartX, lstartY + sqfd)
						// 	ctx.lineTo(lstartX + sqfd, lstartY + sqfd)
						// }
						// if (maze.field[i][j].left){
						// 	ctx.moveTo(lstartX, lstartY)
						// 	ctx.lineTo(lstartX, lstartY + sqfd)
						// }
						//show index for debug
						// if (debug && false){ 
						// 	drawText(lstartX + sqfd/8 , lstartY + sqfd/2, maze.field[i][j].index)
						// }
						lstartX += sqfd
					}
					lstartX = 0
					lstartY += sqfd
				}
				ctx.closePath()
				ctx.stroke()
				ctx.save()
			}else {
				console.log(`ctx is not defined`)
			}
		}else {
			console.log(`maze is not defined`)
		}
	}
	//draw reddot
	function drawReddot(canvasID){
		if (isDefined(reddot)){
			drawCircle(sqfd*reddot.x + sqfd/2, sqfd*reddot.y + sqfd/2 , (sqfd-5)/2, true, canvasID)
		}else {
			console.log(`reddot is not defined`)
		}
	}
	//draw reddot smooth view
	function drawreddotView(canvasID){
		if (isDefined(reddotView)){
			drawCircle(reddotView.x + sqfd/2, reddotView.y + sqfd/2 , (sqfd-5)/2, true, canvasID)
		}else {
			console.log(`redot is not defined`)
		}
	}

/*
}
	simple functions to draw primitives {
*/

	//draw text from left-up corner
	function drawText( lstartX = 0, lstartY = 0,  text, canvasID){
		let ctx = getCtx(canvasID)
		if (isDefined(ctx)){
			ctx.font = `6px`
			ctx.fillStyle = `black`
			ctx.fillText(text, lstartX, lstartY)
			ctx.save()
		}else {
			console.log(`ctx is not defined`)
		}
	}
	//draw simple line
	function drawLine(lstartX = 0, lstartY = 0, endX, endY, canvasID){
		let ctx = getCtx(canvasID)
		if (isDefined(ctx)){
			ctx.beginPath()
			ctx.strokeStyle = `black`
			ctx.moveTo(lstartX, lstartY)
			ctx.lineTo(endX, endY)
			ctx.closePath()
			ctx.stroke()
			ctx.save()
		}else {
			console.log(`ctx is not defined`)
		}
	}
	//draw radial gradient based on canvas position
	function drawGradient2(point, canvasID){
		let ctx = getCtx(canvasID)
		if (isDefined(ctx))	{
			let gradient = undefined
			// centerx inner, centery inner, radius inner, centerx outer, centery outer, radius outer
			ctx.globalCompositeOperation = 'darken';
			gradient = ctx.createRadialGradient(point.x + sqfd/2, point.y + sqfd/2, sqfd*fovRM, point.x + sqfd/2, point.y + sqfd/2, sqfd*(fovRM*2))
			gradient.addColorStop(0, `white`) //from
			gradient.addColorStop(1, `black`) //to
			ctx.fillStyle = gradient
			ctx.fillRect(0, 0, cwidth, cheight)
			ctx.save()
		}else {
			console.log(`ctx is not defined`)
		}	
	}

	//draw circle, has option for reddot
	function drawCircle(centerX, centerY, radius, reddot = false, canvasID){
		let ctx = getCtx(canvasID)
		if (isDefined(ctx)){
			ctx.beginPath()
			ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
			if (reddot) { 
				ctx.fillStyle = `red` 
			} else{
				ctx.fillStyle = `green` 
			}
			ctx.closePath()
			ctx.fill()
			ctx.save()
		}else {
			console.log(`ctx is not defined`)
		}
	}

/*
}
	classes {
*/

	//classes
	class Point {
		constructor(x, y, type = undefined){
			this.x = x
			this.y = y
			this.type = type
		}
		is(point){
			return (this.x == point.x && this.y == point.y)
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
		constructor(width, height){
			this.width = width
			this.height = height
			this.field = new Array(height)
			for(let i = 0; i < height; i++){
				this.field[i] = new Array(width)
				for (let j = 0; j < width; j++){
					this.field[i][j] = new Sqf()
				}
			}
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
	}

/*
}

*/