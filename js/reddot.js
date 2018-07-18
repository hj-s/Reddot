//const or start data
var cwidth = 640
var cheight = 480
var fwidth = 40
var fheight = 40
var sqfd = 20



const rPlace = 0.3
const dPlace = 0.7

var maze = undefined
var canvas = undefined
var ctx = undefined
//int
function init(){
	canvas = document.getElementById('field')
	if (canvas.getContext) {
		
		//set canvase size
		canvas.height = cheight
		canvas.width = cwidth

		//get context
		ctx = canvas.getContext('2d')
		
		//init field
		maze = new SqfField(cwidth/sqfd, cheight/sqfd)
		maze.createMaze('eller')

		drawMaze(ctx, maze)

	} else {
		alert("Your browser does not support canvas")
	}
}

//functions to draw stuff
function drawMaze(ctx, maze){
	var startX = 0;
	var startY = 0;
	for (let i = 0; i < maze.height; i++){
		for (let j = 0; j < maze.width; j++){
			if (maze.field[i][j].up){
				drawLine(ctx, startX, startY, startX + sqfd, startY)
			}
			if (maze.field[i][j].right){
				drawLine(ctx, startX + sqfd, startY, startX + sqfd, startY + sqfd)
			}
			if (maze.field[i][j].down){
				drawLine(ctx, startX, startY + sqfd, startX + sqfd, startY + sqfd)
			}
			if (maze.field[i][j].left){
				drawLine(ctx, startX, startY, startX, startY + sqfd)
			}
			startX += sqfd
		}
		startX = 0
		startY += sqfd
	}
}
function drawLine(ctx, startX, startY, endX, endY){
	ctx.moveTo(startX, startY)
	ctx.lineTo(endX, endY)
	ctx.stroke()
}
function drawCircle(ctx, centerX, centerY, radius, reddot = false){
	ctx.beginPath()
	ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
	if (reddot) { 
		ctx.fillStyle = "red" 
		ctx.fill()
	} else{
		ctx.stroke()
	}
	
}

//classes
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
		//this.filed.map
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
							this.field[i][j].right = true
						}else{
							if (Math.random() < rPlace) { 
								this.field[i][j].right = true 
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
					}
					if (line[j].down){
						line[j].index = maxindex++
						line[j].down = false
					}
				}
				this.field[i+1] = line
			}else{
				//last line
				for (let j = 0; j < this.width; j++) {
					//place right
					if (j != this.width-1){
						if (this.field[i][j].index == this.field[i][j+1].index){
							this.field[i][j].right = true
						}
					}
				}
			}
		}
	}
}