//arrow functions
const isDefined = (check) => (check !== undefined)

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


//global variables for objects
var maze = undefined
var reddot = undefined
var exit = undefined
var path = undefined

//variables for draw some stuff
var drawFOV = true
var drawExitC = true
var drawPath = true

//ns
var debug = true

//int
function init(){
	var canvas = document.getElementById(`field`)
	if (canvas.getContext) {
		
		//set canvase size
		canvas.height = cheight
		canvas.width = cwidth

		//get context
		let ctx = canvas.getContext(`2d`)
		ctx.save()
		
		//add keypress listener
		let d = document
		d.addEventListener(`keypress`, handleKeys)

		if (debug){
			let controlBox = d.getElementById(`controls`)
			if (isDefined(controlBox)) { controlBox.style.visibility = `visible` }
			let pathCb = d.getElementById(`path`)
			if (isDefined(pathCb)){
				//add listener
				pathCb.addEventListener(`change`, handlePathCb)
			}

			let fovCb = d.getElementById(`fov`)
			if (isDefined(fovCb)){
				fovCb.addEventListener(`change`, handleFovCb)
				fovCb.style.visibility = `visible`
			}
		}
		
		//startMaze
		startMaze()

	} else {
		alert(`Your browser does not support canvas`)
	}
}

//create maze & reddot
function startMaze(){
	//create new field
	maze = new SqfField(cwidth/sqfd, cheight/sqfd)
	//create maze using method
	maze.createMaze(`eller`)
	//create point
	//reddot = new Point(startX, startY)
	reddot = generatePoint()
	startX = reddot.X
	startY = reddot.Y
	//clear path
	path = undefined
	addPointToPath()
	//create exit
	exit = createExit()

	//clear all before start new
	clearCanvas()
	//draw field of view
	if (isDefined(reddot) && drawFOV){
		drawGradient()
	}
	//draw maze
	if (isDefined(maze)){
		drawMaze()
	}
	//draw reddot
	if (isDefined(reddot)){
		drawReddot()
	}
	//draw exit
	if (isDefined(exit)){
		drawExit()
	}
}

//create exit
function createExit() {
	if (isDefined(maze)){
		let cexit = generatePoint()
		if (isDefined(reddot)){
			return (cexit.is(reddot) ? createExit() : cexit )
		}else {
			return cexit
		} 
	}
}
//generate random point on the wall
function generatePoint(){
	let walls = [`up`,`right`,`down`,`left`]
	//choose wall
	let randomItem = walls[Math.floor(Math.random()*walls.length)]
	//shose position on the wall
	if (randomItem == `up`){
		return new Point(Math.floor(Math.random()*cwidth/sqfd), 0)
	}else if (randomItem == `right`) {
		return new Point(cwidth/sqfd - 1, Math.floor(Math.random()*cheight/sqfd))
	}else if (randomItem == `down`) {
		return new Point(Math.floor(Math.random()*cwidth/sqfd), cheight/sqfd - 1)
	}else if (randomItem ==`left` ) {
		return new Point(0 ,Math.floor(Math.random()*cheight/sqfd))
	}else {
		console.log(`unknown wall`)
		return undefined
	}
}
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
function handleKeys(event){
	//????
	if (event.defaultPrevented) {
		return
	}
	if (isDefined(reddot)) {
		let move = false
		console.log(event.key + event.keyCode)
		if (event.key == `W` || event.key == `w` || event.keyCode == 119 || event.keyCode == 1094) { //w
			//check if can
			if (!checkWall(reddot.x, reddot.y, reddot.x, reddot.y-1)){
				reddot.y -= 1
				move = true
			}
		}
		if (event.key == `S` || event.key == `s` || event.keyCode == 115 || event.keyCode == 1099) { //s
			//check if can
			if (!checkWall(reddot.x, reddot.y, reddot.x, reddot.y+1)){
				reddot.y += 1
				move = true
			}
		}
		if (event.key == `A` || event.key == `a` || event.keyCode == 97 || event.keyCode == 1092) { //a
			//check if can
			if (!checkWall(reddot.x, reddot.y, reddot.x-1, reddot.y)){
				reddot.x -= 1
				move = true
			}
		}
		if (event.key == `D` || event.key == `d` || event.keyCode == 100 || event.keyCode == 1074) { //d
			//check if can
			if (!checkWall(reddot.x, reddot.y, reddot.x+1, reddot.y)){
				reddot.x += 1
				move = true
			}
		}
		if (move){
			//add point to path
			addPointToPath()
			//draw stuff
			draw()
			//check if exit
			if (checkExit()){
				startMaze()
			}
		}
	}
}
//check if can move from x,y to x1y1
function checkWall(xf, yf, xt, yt){
	if (isDefined(maze)){
		if (xf-xt > 0){ //move left
			return maze.field[yf][xf].left
		}else if (xf-xt < 0) { //move right
			return maze.field[yf][xf].right
		}
		if (yf-yt > 0){ //move up
			return maze.field[yf][xf].up
		}else if (yf-yt < 0) { //move down
			return maze.field[yf][xf].down
		}
	}else {
		console.log(`maze is not defined`)
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
//add point to path
function addPointToPath(){
	if (isDefined(reddot)){
		if (!isDefined(path)){
			path = new Array()
		}
		path.push(new Point(reddot.x, reddot.y))
	}else {
		console.log(`reddot is not defined`)
	}
}

//functions to draw stuff
//get canvas context to draw
function getCtx(){
	let canvas = document.getElementById(`field`)
	if (isDefined(canvas)){
		if (canvas.getContext){
			let ctx = canvas.getContext(`2d`)
			ctx.restore()
			return ctx
		}else {
			console.log(`canvas.getContext is not defined`)
			return undefined
		}	
	}else {
		console.log(`canvas is not defined`)
	}
}
//clear canvas for new draw
function clearCanvas(){
	let ctx = getCtx()
	if (isDefined(ctx)){
		let canvas = document.getElementById(`field`)
		//some odd way to clear canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height) 
		ctx.save()
	}else {
		console.log(`ctx is not defined`)
	}
}
//main draw
function draw(){
	//clear canvas
	clearCanvas()
	//draw gradient
	if (isDefined(reddot) && drawFOV){
		drawGradient()
	}
	//redraw maze
	if (isDefined(maze)){
		drawMaze()
	}
	//draw exti
	if (isDefined(exit) && drawExitC){
		drawExit()
	}
	if (isDefined(path) && drawPath){
		drawPathLine()
	}
	//redraw reddot
	if (isDefined(reddot)){
		drawReddot()
	}
}
function drawPathLine(){
	let ctx = getCtx()
	if (isDefined(ctx)){
		if (isDefined(path) && drawPath){
			ctx.beginPath()
			ctx.strokeStyle = `purple`
			ctx.moveTo(startX + sqfd/2, startY + sqfd/2)
			for( let i = 0; i < path.length; i++){ //add line to path view
				ctx.lineTo(path[i].x*sqfd + sqfd/2, path[i].y*sqfd + sqfd/2)	
			}
			ctx.stroke()
			ctx.save()
		}
	}else {
		console.log(`ctx is not defined`)
	}
}
function drawExit(){
	if (isDefined(exit)){
		let ctx = getCtx()
		if (isDefined(ctx)){
			ctx.beginPath()
			ctx.strokeStyle = `red`
			ctx.strokeRect(exit.x*sqfd + sqfd/4, exit.y*sqfd + sqfd/4 ,sqfd/2,sqfd/2)
			ctx.save()
		}else {
			console.log(`ctx is not defined`)
		}
	}else {
		console.log(`exit is not defined`)
	}
}
function drawGradient(){
	if (isDefined(reddot)){
		let ctx = getCtx()
		if (isDefined(ctx))	{
			// ctx.beginPath() // centerx inner, centery inner, radius inner, centerx outer, centery outer, radius outer
			// let gradient = ctx.createRadialGradient(sqfd*reddot.x + sqfd/2, sqfd*reddot.y + sqfd/2, 50, sqfd*reddot.x + sqfd/2, sqfd*reddot.y + sqfd/2, 100)
			// gradient.addColorStop(0, `white`) //from
			// gradient.addColorStop(1, `black`) //to
			// ctx.fillStyle = gradient
			// ctx.fillRect(0, 0, cwidth, cheight);
			ctx.beginPath() 
			let gradient = undefined

			// centerx inner, centery inner, radius inner, centerx outer, centery outer, radius outer
			gradient = ctx.createRadialGradient(sqfd*reddot.x + sqfd/2, sqfd*reddot.y + sqfd/2, 50, sqfd*reddot.x + sqfd/2, sqfd*reddot.y + sqfd/2, 200)
			gradient.addColorStop(0, `white`) //from
			gradient.addColorStop(1, `black`) //to
			ctx.fillStyle = gradient
			ctx.globalAlpha = 1
			ctx.fillRect(0, 0, cwidth, cheight)

			gradient = ctx.createRadialGradient(sqfd*reddot.x + sqfd/2, sqfd*reddot.y + sqfd/2,  (sqfd-5)/2, sqfd*reddot.x + sqfd/2, sqfd*reddot.y + sqfd/2, 100)
			gradient.addColorStop(0, `white`) //from
			gradient.addColorStop(1, `black`) //to
			ctx.fillStyle = gradient
			ctx.globalAlpha = 0.8
			ctx.fillRect(0, 0, cwidth, cheight)

			ctx.globalAlpha = 1
			ctx.save()
		}else {
			console.log(`ctx is not defined`)
		}
	}else {
		console.log(`reddot is not defined`)
	}
}
function drawMaze(){
	if (isDefined(maze)){
		let ctx = getCtx()
		ctx.strokeStyle = `black`
		if (isDefined(ctx)){
			let lstartX = 0
			let lstartY = 0
			for (let i = 0; i < maze.height; i++){
				for (let j = 0; j < maze.width; j++){
					//we can remove some draws of lines due to i's right = i+1's left
					//someday...
					if (maze.field[i][j].up){
						drawLine(lstartX, lstartY, lstartX + sqfd, lstartY)
					}
					if (maze.field[i][j].right){
						drawLine(lstartX + sqfd, lstartY, lstartX + sqfd, lstartY + sqfd)
					}
					if (maze.field[i][j].down){
						drawLine(lstartX, lstartY + sqfd, lstartX + sqfd, lstartY + sqfd)
					}
					if (maze.field[i][j].left){
						drawLine(lstartX, lstartY, lstartX, lstartY + sqfd)
					}
					//show index for debug
					if (debug && false){
						drawText(lstartX + sqfd/8 , lstartY + sqfd/2, maze.field[i][j].index)
					}
					lstartX += sqfd
				}
				lstartX = 0
				lstartY += sqfd
			}
			ctx.save()
		}else {
			console.log(`ctx is not defined`)
		}
	}else {
		console.log(`maze is not defined`)
	}
}
function drawText(lstartX, lstartY, text){
	let ctx = getCtx()
	if (isDefined(ctx)){
		ctx.beginPath()
		ctx.font = `6px`
		ctx.fillStyle = `black`
		ctx.fillText(text, lstartX, lstartY)
		ctx.save()
	}else {
		console.log(`ctx is not defined`)
	}
}
function drawLine(lstartX, lstartY, endX, endY){
	let ctx = getCtx()
	if (isDefined(ctx)){
		ctx.beginPath()
		ctx.moveTo(lstartX, lstartY)
		ctx.lineTo(endX, endY)
		ctx.stroke()
		ctx.save()
	}else {
		console.log(`ctx is not defined`)
	}
}
function drawReddot(){
	if (isDefined(reddot)){
		drawCircle(sqfd*reddot.x + sqfd/2, sqfd*reddot.y + sqfd/2 , (sqfd-5)/2, true)
	}else {
		console.log(`reddot is not defined`)
	}
}
function drawCircle(centerX, centerY, radius, reddot = false){
	let ctx = getCtx()
	if (isDefined(ctx)){
		ctx.beginPath()
		ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
		if (reddot) { 
			ctx.fillStyle = `red` 
			ctx.fill()
		} else{
			ctx.stroke()
		}
		ctx.save()
	}else {
		console.log(`ctx is not defined`)
	}
}

//classes
class Point {
	constructor(x, y){
		this.x = x
		this.y = y
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
		console.log(type + ` time: ` + time)
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