//set screen size
document.body.style.height = screen.height.toString() + 'px';

//datas
var snakeSpriteAddress = '/Users/alexisrichard/Desktop/Travail/Orange Labs SF/HTML learning/JavaScriptLearning/assets/sprites/snake.jpg';
var fruitSpriteAddress = '/Users/alexisrichard/Desktop/Travail/Orange Labs SF/HTML learning/JavaScriptLearning/assets/sprites/fruit.jpg';

//récupération des objets
var mainMessage = document.getElementById('message');

//definition des constantes
var left = 37;
var up = 38;
var right = 39;
var down = 40;
var deltaX = screen.width * 0.102;
var deltaY = 148;
var XMAX = 0.79 * screen.width - screen.width % 10;
var YMAX = 0.625 * screen.height - screen.height % 10;

//définition des variables globales
var gameStarted = false; 
var animStep = 5;
var speed = 15;
var snakeSize = 15;
var appleSize = 25;
var snake = null;
var idManager = null;
var scoreManager = null;
var appleManager = null;
var changeDirectionRequest = false;
var gettingBigger = false;
var gettingBiggerCount = 0;
var gettingBiggerCountMax = 5;

//class score manager
function ScoreCount(){
	this.scoreNum = 0;
	this.html = document.getElementById('score');

	this.incrScore = function(){
		this.scoreNum += Math.floor((animStep*gettingBiggerCountMax*snake.size())/(speed*snakeSize*1.2));
		this.html.innerHTML = 'score : ' + this.scoreNum.toString();
	}
}

//class gestionnaire d'id
function IDcount(){
	this.idCount = -1;

	this.nextID = function(){
		this.idCount++;
		return this.idCount;
	}
}

//classe Coordinate
function Coordinate(Xc, Yc){
	this.X = Xc;
	this.Y = Yc;

	this.toString = function(){
		return '('+ this.X.toString() + ',' + this.Y.toString() + ')';
	}
}

//class Apple
function Apple(coord, num){
	this.coordinate = coord;
	this.size = appleSize;
	this.id = num;

	//html model
	this.html = document.createElement('span');
	this.html.id = 'apple' + num.toString();
	this.html.style.position = 'absolute';
	this.html.style.backgroundColor = 'red';
	this.html.style.left = (this.coordinate.X + deltaX).toString() + 'px';
	this.html.style.top = (this.coordinate.Y + deltaY).toString() + 'px';
	this.html.style.width = this.size.toString() + 'px';
	this.html.style.height = this.size.toString() + 'px';

	this.create = function(){
		document.getElementById('gamewindowcontent').appendChild(this.html);
	}

	this.isEaten = function(headcoor,dir){
		if (dir == up){
			return (headcoor.X > this.coordinate.X - snakeSize)&&(headcoor.X < this.coordinate.X + this.size)&&(headcoor.Y > this.coordinate.Y)&&(headcoor.Y < this.coordinate.Y + this.size);
		}

		else if (dir == down){
			return (headcoor.X > this.coordinate.X - snakeSize)&&(headcoor.X < this.coordinate.X + this.size)&&(headcoor.Y > this.coordinate.Y)&&(headcoor.Y < this.coordinate.Y + this.size);
		}

		else if (dir == right){
			return (headcoor.X > this.coordinate.X)&&(headcoor.X < this.coordinate.X + this.size)&&(headcoor.Y > this.coordinate.Y - snakeSize)&&(headcoor.Y < this.coordinate.Y + this.size);
		}

		else if (dir == left){
			return (headcoor.X > this.coordinate.X)&&(headcoor.X < this.coordinate.X + this.size)&&(headcoor.Y > this.coordinate.Y - snakeSize)&&(headcoor.Y < this.coordinate.Y + this.size);
		}
	}

	this.erase = function(){
		document.getElementById('gamewindowcontent').removeChild(document.getElementById(this.html.id));
	}

}

//class AppleManager
function AppleManager(){

	this.apples = [];

	this.newApple = function(){
		var newApple = new Apple(new Coordinate(Math.floor(Math.random()*(XMAX - snakeSize - appleSize)), Math.floor(Math.random()*(YMAX - snakeSize - appleSize))), idManager.nextID());
		newApple.create();
		this.apples.unshift(newApple);
	}

	this.erase = function(){
		while (this.apples.length > 0){
			this.apples.pop().erase();
		}
	}

	this.isAppleEaten = function(headcoor, dir){
		var cond = false;
		var i = 0;
		while ((!cond)&&(i < this.apples.length)){
			cond = this.apples[i].isEaten(headcoor, dir);
			i++;
		}

		return cond;
	}
}

//class SnakeSegment
function SnakeSegment(coord, size, direction, num ){

	//constructor
	this.coordinate = coord;
	this.direction = direction;
	this.id = num;
	this.size = size;

	//html model
	this.html = document.createElement('span');
	this.html.id = 'snakesegment' + num.toString();
	this.html.style.position = 'absolute';
	this.html.style.backgroundColor = 'black';

	if (this.direction == up){
		this.html.style.left = (this.coordinate.X + deltaX).toString() + 'px';
		this.html.style.top = (this.coordinate.Y + deltaY).toString() + 'px';
		this.html.style.width = snakeSize.toString() + 'px';
		this.html.style.height = this.size.toString() + 'px';
	}

	else if (this.direction == down){
		this.html.style.left = (this.coordinate.X + deltaX).toString() + 'px';
		this.html.style.top = (this.coordinate.Y - this.size + deltaY).toString() + 'px';
		this.html.style.width = snakeSize.toString() + 'px';
		this.html.style.height = this.size.toString() + 'px';
	}

	else if (this.direction == right){
		this.html.style.left = (this.coordinate.X + deltaX - this.size).toString() + 'px';
		this.html.style.top = (this.coordinate.Y + deltaY).toString() + 'px';
		this.html.style.width = this.size.toString() + 'px';
		this.html.style.height = snakeSize.toString() + 'px';
	}

	else if (this.direction == left){
		this.html.style.left = (this.coordinate.X + deltaX).toString() + 'px';
		this.html.style.top = (this.coordinate.Y + deltaY).toString() + 'px';
		this.html.style.width = this.size.toString() + 'px';
		this.html.style.height = snakeSize.toString() + 'px';
	}

	//update position for Head
	this.updateFront = function(){
		if (this.direction == up){
			this.coordinate.Y -= animStep;
			this.size += animStep;
			this.html.style.top = (this.coordinate.Y + deltaY).toString() + 'px';
			this.html.style.height = this.size.toString() + 'px';
		}

		else if (this.direction == down){
			this.coordinate.Y += animStep;
			this.size += animStep;
			this.html.style.height = this.size.toString() + 'px';
		}

		else if (this.direction == right){
			this.coordinate.X += animStep;
			this.size += animStep;
			this.html.style.width = this.size.toString() + 'px';
		}

		else if (this.direction == left){
			this.coordinate.X -= animStep;
			this.size += animStep;
			this.html.style.left = (this.coordinate.X + deltaX).toString() + 'px';
			this.html.style.width = this.size.toString() + 'px';
		}
	}

	//update position for Tail
	this.updateBack = function(){
		if (this.direction == up){
			this.size -= animStep;
			this.html.style.height = this.size.toString() + 'px';
		}

		else if (this.direction == down){
			this.size -= animStep;
			this.html.style.top = (this.coordinate.Y + deltaY - this.size).toString() + 'px';
			this.html.style.height = this.size.toString() + 'px';
		}

		else if (this.direction == right){
			this.size -= animStep;
			this.html.style.left = (this.coordinate.X + deltaX - this.size).toString() + 'px';
			this.html.style.width = this.size.toString() + 'px';
		}

		else if (this.direction == left){
			this.size -= animStep;
			this.html.style.width = this.size.toString() + 'px';
		}
	}

	this.absorbBack = function(){
		if (this.direction == up){
			this.size += snakeSize;
			this.html.style.height = this.size.toString() + 'px';
		}

		else if (this.direction == down){
			this.size += snakeSize;
			this.html.style.top = (this.coordinate.Y + deltaY - this.size).toString() + 'px';
			this.html.style.height = this.size.toString() + 'px';
		}

		else if (this.direction == right){
			this.size += snakeSize;
			this.html.style.left = (this.coordinate.X + deltaX - this.size).toString() + 'px';
			this.html.style.width = this.size.toString() + 'px';
		}

		else if (this.direction == left){
			this.size += snakeSize;
			this.html.style.width = this.size.toString() + 'px';
		}
	}

	this.isBiting = function(headcoor){
		if (this.direction == up){
			return (headcoor.X > this.coordinate.X)&&(headcoor.X < this.coordinate.X + snakeSize)&&(headcoor.Y > this.coordinate.Y)&&(headcoor.Y < this.coordinate.Y + this.size);
		}

		else if (this.direction == down){
			return (headcoor.X > this.coordinate.X)&&(headcoor.X < this.coordinate.X + snakeSize)&&(headcoor.Y > this.coordinate.Y - this.size)&&(headcoor.Y < this.coordinate.Y);
		}

		else if (this.direction == right){
			return (headcoor.X > this.coordinate.X - this.size)&&(headcoor.X < this.coordinate.X)&&(headcoor.Y > this.coordinate.Y)&&(headcoor.Y < this.coordinate.Y + snakeSize);
		}

		else if (this.direction == left){
			return (headcoor.X > this.coordinate.X)&&(headcoor.X < this.coordinate.X + this.size)&&(headcoor.Y > this.coordinate.Y)&&(headcoor.Y < this.coordinate.Y + snakeSize);
		}

	}

	this.create = function(){
		document.getElementById('gamewindowcontent').appendChild(this.html);
	}

	this.erase = function(){
		document.getElementById('gamewindowcontent').removeChild(document.getElementById(this.html.id));
	}

	this.toString = function(){
		return ('fragment n°' + this.id.toString() + ': ' + this.coordinate.toString() + ' ' + this.direction.toString() + ' ' + this.size.toString());
	}
}

//classe Snake
function Snake(head){
	this.body = [head];


	this.changeDirection = function(newDir){
		var dirHead = this.head().direction;
		var virageID = parseInt(dirHead.toString() + newDir.toString());

		if (this.head().size >= snakeSize){

			//haut vers gauche
			if (virageID == 3837){
				snake.addSegment(new SnakeSegment(new Coordinate(this.head().coordinate.X,this.head().coordinate.Y), 0, left, idManager.nextID()));
			}

			//haut vers droite
			else if (virageID == 3839){
				snake.addSegment(new SnakeSegment(new Coordinate(this.head().coordinate.X + snakeSize,this.head().coordinate.Y), 0, right, idManager.nextID()));
			}

			//gauche vers bas
			else if (virageID == 3740){
				snake.addSegment(new SnakeSegment(new Coordinate(this.head().coordinate.X ,this.head().coordinate.Y + snakeSize), 0, down, idManager.nextID()));
			}

			//gauche vers haut
			else if (virageID == 3738){
				snake.addSegment(new SnakeSegment(new Coordinate(this.head().coordinate.X,this.head().coordinate.Y), 0, up, idManager.nextID()));
			}

			//droite vers bas
			else if (virageID == 3940){
				snake.addSegment(new SnakeSegment(new Coordinate(this.head().coordinate.X - snakeSize,this.head().coordinate.Y + snakeSize), 0, down, idManager.nextID()));
			}

			//droite vers haut
			else if (virageID == 3938){
				snake.addSegment(new SnakeSegment(new Coordinate(this.head().coordinate.X - snakeSize,this.head().coordinate.Y), 0, up, idManager.nextID()));
			}

			//bas vers gauche
			else if (virageID == 4037){
				snake.addSegment(new SnakeSegment(new Coordinate(this.head().coordinate.X,this.head().coordinate.Y - snakeSize), 0, left, idManager.nextID()));
			}

			//bas vers droite
			else if (virageID == 4039){
				snake.addSegment(new SnakeSegment(new Coordinate(this.head().coordinate.X + snakeSize,this.head().coordinate.Y - snakeSize), 0, right, idManager.nextID()));
			}
		}

	}

	this.move = function(e){
		if (this.tail().size == snakeSize){
			this.removeSegment();
			this.tail().absorbBack();
		}

		if ((!((this.head().coordinate.X > 0)&&(this.head().coordinate.X < XMAX)&&(this.head().coordinate.Y > 0)&&(this.head().coordinate.Y < YMAX)))||(this.isBiting(this.head().coordinate))){
			endGame();
		}
		
		if (appleManager.isAppleEaten(this.head().coordinate, this.head().direction)){
			scoreManager.incrScore();
			appleManager.apples.pop().erase();
			appleManager.newApple();
			this.head().updateFront();
			gettingBigger = true;
			gettingBiggerCount = 0;
			return null;
		}
		
		this.head().updateFront();
		if (gettingBigger){
			if (gettingBiggerCount > gettingBiggerCountMax){
				gettingBigger = false;
			}
			else{
				gettingBiggerCount++;
				return null;
			}
		}
		
		this.tail().updateBack();
	}

	this.size = function(){
		var size = 0;
		for(var i =0; i<this.body.length; i++){
			size += this.body[i].size;
		}
		return size;
	}
	
	this.isBiting = function(headcoor){
		var cond = false;
		var i = 1;
		while ((!cond)&&(i < this.body.length)){
			cond = this.body[i].isBiting(headcoor);
			i++;
		}

		return cond;
	}

	this.head = function(){
		return this.body[0];
	}

	this.tail = function(){
		return this.body[this.body.length-1];
	}

	this.create = function(){
		for (var i = 0; i<this.body.length; i++){
			this.body[i].create();
		}
	}

	this.erase = function(){
		for(var i=0; i<this.body.length; i++){
			this.body[i].erase();
		}
	}

	this.addSegment = function(segment){
		this.body.unshift(segment);
		segment.create();
	}

	this.removeSegment = function(){
		this.body.pop().erase();
	}

	this.toString = function(){
		var retour = '';
		for(var i = 0; i<this.body.length; i++){
			retour += this.body[i].toString() + '\n';
		}
		return retour;
	}
}

//Initialize Function
var initializeGame = function(){
	//erase text
	mainMessage.innerHTML = '';
	document.getElementById('score').innerHTML = 'score : 0';

	//initialize variable
	speed = 20;

	//create ID manager
	idManager = new IDcount();

	//create score manager
	scoreManager = new ScoreCount();

	//create apple manager
	appleManager = new AppleManager();

	//create snake
	segment = new SnakeSegment(new Coordinate(500,250), 400, right, idManager.nextID());
	snake = new Snake(segment);
	snake.create();

	//create first apple
	appleManager.newApple();

	//start game
	gameStarted = true;
}

var endGame = function(){
	//end game
	gameStarted = false;

	//clear snake
	snake.erase();

	//clear apples
	appleManager.erase();

	document.getElementById('score').innerHTML = '';

	mainMessage.innerHTML = 'GAME OVER <br> Score : ' + scoreManager.scoreNum.toString() + '<br>press space for new game';
}

function snakeAnim(){
	if (gameStarted){
		snake.move();
		setTimeout(snakeAnim, speed);
	}
}

//onKeyDown method
function onKeyDown(e){

	if((e.keyCode>36)&&(e.keyCode<41)&&(gameStarted)){
		snake.changeDirection(e.keyCode);
	}

	else if ((e.keyCode==32)&&(!gameStarted)){
		initializeGame();
		snakeAnim();
	}





}

//main
document.addEventListener('keydown', function(e){ onKeyDown(e) }, false);


