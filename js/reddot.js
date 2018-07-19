//arrow fucntions
const isDefined = (check) => (check !== undefined);

//const or start data
var cwidth = 640
var cheight = 480
var sqfd = 20

const rPlace = 0.3
const dPlace = 0.7

var maze = undefined
var reddot = undefined
var exit = undefined

var drawFOV = true
var drawExitC = true

//int
function init(){
	var canvas = document.getElementById('field')
	if (canvas.getContext) {
		
		//set canvase size
		canvas.height = cheight
		canvas.width = cwidth

		//get context
		let ctx = canvas.getContext('2d')
		ctx.save()
		
		//add keypress listener
		let d = document
		d.addEventListener('keypress', handleKeys)

		//startMaze
		startMaze()

	} else {
		alert("Your browser does not support canvas")
	}
}

//create maze & reddot
function startMaze(){
	//create new field
	maze = new SqfField(cwidth/sqfd, cheight/sqfd)
	//create maze using method
	maze.createMaze('eller')
	//create point
	reddot = new Point(0,0)
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
		//set wall
		let walls = [`up`,`right`,`down`,`left`]
		let randomItem = walls[Math.floor(Math.random()*walls.length)];
		console.log(randomItem)
		if (randomItem == `up`){
			return new Point(Math.floor(Math.random()*cwidth/sqfd), 0)
		}else if (randomItem == `right`) {
			return new Point(cwidth/sqfd - 1, Math.floor(Math.random()*cheight/sqfd))
		}else if (randomItem == `down`) {
			return new Point(Math.floor(Math.random()*cwidth/sqfd), cheight/sqfd - 1)
		}else if (randomItem ==`left` ) {
			return new Point(0 ,Math.floor(Math.random()*cheight/sqfd))
		}else {
			return undefined
		}
	}
}
//handle keys
function handleKeys(event){
	// if (event.defaultPrevented) {
	// 	return
	// }
	if (isDefined(reddot)) {
		let move = false
		let key = event.key || event.keyCode
		if (key == `W` || key == `w`) {
			//check if can
			if (!checkWall(reddot.x, reddot.y, reddot.x, reddot.y-1)){
				reddot.y -= 1
				move = true
			}
		}
		if (key == `S` || key == `s`) {
			//check if can
			if (!checkWall(reddot.x, reddot.y, reddot.x, reddot.y+1)){
				reddot.y += 1
				move = true
			}
		}
		if (key == `A` || key == `a`) {
			//check if can
			if (!checkWall(reddot.x, reddot.y, reddot.x-1, reddot.y)){
				reddot.x -= 1
				move = true
			}
		}
		if (key == `D` || key == `d`) {
			//check if can
			if (!checkWall(reddot.x, reddot.y, reddot.x+1, reddot.y)){
				reddot.x += 1
				move = true
			}
		}
		if (move){
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
	}
}
//check if reddot in exit
function checkExit(){
	if (isDefined(reddot) && isDefined(exit)){
		return reddot.is(exit)
	}
}

//functions to draw stuff
function getCtx(){
	let canvas = document.getElementById(`field`)
	if (canvas.getContext){
		let ctx = canvas.getContext(`2d`)
		ctx.restore()
		return ctx
	}else {
		return undefined
	}
}
function clearCanvas(){
	let ctx = getCtx()
	if (isDefined(ctx)){
		let canvas = document.getElementById(`field`)
		ctx.clearRect(0, 0, canvas.width, canvas.height)
		ctx.save()
	}
}
function draw(){
	//clear canvas
	clearCanvas()
	if (isDefined(reddot) && drawFOV){
		drawGradient()
	}
	//redraw maze
	if (isDefined(maze)){
		drawMaze()
	}
	//redraw reddot
	if (isDefined(reddot)){
		drawReddot()
	}
	//draw exti
	if (isDefined(exit) && drawExitC){
		drawExit()
	}
	//check if exit
	if (checkExit()){
		startMaze()
	}
}
function drawExit(){
	if (isDefined(exit)){
		let ctx = getCtx()
		if (isDefined(ctx)){
			ctx.beginPath()
			ctx.strokeStyle = "red"
			ctx.strokeRect(exit.x*sqfd + sqfd/4, exit.y*sqfd + sqfd/4 ,sqfd/2,sqfd/2); 
		}
	}
}
function drawGradient(){
	if (isDefined(reddot)){
		let ctx = getCtx()	
		ctx.beginPath()
		let gradient = ctx.createRadialGradient(sqfd*reddot.x + sqfd/2, sqfd*reddot.y + sqfd/2, 50, sqfd*reddot.x + sqfd/2, sqfd*reddot.y + sqfd/2, 100);
		gradient.addColorStop(0, 'white');
		gradient.addColorStop(1, 'black');
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, 640, 480);
		ctx.save()
	}
}
function drawMaze(){
	if (isDefined(maze)){
		let ctx = getCtx()
		ctx.strokeStyle = "black"
		if (isDefined(ctx)){
			var startX = 0;
			var startY = 0;
			for (let i = 0; i < maze.height; i++){
				for (let j = 0; j < maze.width; j++){
					if (maze.field[i][j].up){
						drawLine(startX, startY, startX + sqfd, startY)
					}
					if (maze.field[i][j].right){
						drawLine(startX + sqfd, startY, startX + sqfd, startY + sqfd)
					}
					if (maze.field[i][j].down){
						drawLine(startX, startY + sqfd, startX + sqfd, startY + sqfd)
					}
					if (maze.field[i][j].left){
						drawLine(startX, startY, startX, startY + sqfd)
					}
					startX += sqfd
				}
				startX = 0
				startY += sqfd
			}
			ctx.save()
		}
	}
}
function drawLine(startX, startY, endX, endY){
	let ctx = getCtx()
	if (isDefined(ctx)){
		ctx.beginPath()
		ctx.moveTo(startX, startY)
		ctx.lineTo(endX, endY)
		ctx.stroke()
		ctx.save()
	}
}
function drawCircle(centerX, centerY, radius, reddot = false){
	let ctx = getCtx()
	if (isDefined(ctx)){
		ctx.beginPath()
		ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
		if (reddot) { 
			ctx.fillStyle = "red" 
			ctx.fill()
		} else{
			ctx.stroke()
		}
		ctx.save()
	}
}
function drawReddot(){
	if (isDefined(reddot)){
		drawCircle(sqfd*reddot.x + sqfd/2, sqfd*reddot.y + sqfd/2 , (sqfd-5)/2, true)
		/*
		var gradient = ctx.createRadialGradient(sqfd*reddot.x + sqfd/2, sqfd*reddot.y + sqfd/2, 50, sqfd*reddot.x + sqfd/2, sqfd*reddot.y + sqfd/2, 100);
		gradient.addColorStop(0, 'white');
		gradient.addColorStop(1, 'black');
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, 640 480);
		*/
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
		//borders are the same

  		switch (type) {
  			case `eller`:
  				this.eller()
  				break;
  			default:
  				console.log(`Not supproted`)
  				break;
  		}
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
				for (let j = 0; j < this.width; j++) {
					//place right
					if (j != this.width-1){
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
						if (j != this.width){
							line[j+1].left = false
						}
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
