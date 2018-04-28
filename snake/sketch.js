const SCR_WIDTH = 640;
const SCR_HEIGHT = 640;
const radius = 10;
var fontRegular;
var node = new Node2D(320, 630, 1);
var angle = 0;
var trail = [];
var frame = 0;

function preload() {
  fontRegular = loadFont('RobotoSlab-Light.ttf');
}

function setup() {
  createCanvas(SCR_WIDTH, SCR_HEIGHT);
  noFill();
  textSize(12);
  textFont(fontRegular);
  node.a.x = 0;
  node.a.y = -2;
  for (var i=0; i<100; i++) {
  	trail.push(new Vector2(320, 630))
  }
}

function mouseClicked() {
}

// function keyPressed() {
//   if (keyCode === LEFT_ARROW) {
//   } else if (keyCode === RIGHT_ARROW) {
//   }
// }

function draw() {
	background(240);
	for (var i=0; i<10; i++) {
		ellipse(trail[i*8].x, trail[i*8].y, radius*2, radius*2);		
	}
	line(node.p.x, node.p.y, (node.p.x + (node.v.x * 10)), (node.p.y+(node.v.y * 10)));
	if (keyIsDown(LEFT_ARROW)) {
    //node.v.rotate(-0.1);
    if (angle > -0.05) {
    	angle -= 0.001;    	
    }
	} else if (keyIsDown(RIGHT_ARROW)) {
    //node.v.rotate(0.1);
    if (angle < 0.05) {
    	angle += 0.001;
    }
	}
	node.update();
	node.v.rotate(angle);
	if (angle > 0) {
		angle -= 0.0005;
	} else if (angle < 0) {
		angle += 0.0005;
	}
	for (var i=99; i>0; i--) {
		trail[i].x = trail[i-1].x;
		trail[i].y = trail[i-1].y;
	}
	trail[0].x = node.p.x;
	trail[0].y = node.p.y;
}

var VecOp = {

	distanceV2 : function(v1, v2) {
		num2 = v1.x - v2.x;
		num = v1.y - v2.y;
		num3 = (num2 * num2) + (num * num);
		return Math.sqrt(num3);
	},

	subV2 : function(v1, v2) {
		var x = v1.x - v2.x;
		var y = v1.y - v2.y;
		return new Vector2(x, y);
	}
}

function Vector2(x_, y_) {
	if (x_)
		this.x = x_;
	else
		this.x = 0;

	if (y_)
		this.y = y_;
	else
		this.y = 1.0 * this.x;

	this.normalize = function() {
		var num2 = (this.x * this.x) + (this.y * this.y);
		var num = 1.0 / Math.sqrt(num2);
		this.x *= num;
		this.y *= num;

		return this;
	}

	this.getNormalized = function() {
		var temp = new Vector2(this.x, this.y);
		return temp.normalize();
	}

	this.invert = function() {
		this.x *= -1;
		this.y *= -1;

		return this;
	}

	this.mult = function(val) {
		this.x *= val;
		this.y *= val;

		return this;
	}

	this.divide = function(val) {
		this.x /= val;
		this.y /= val;

		return this;
	}

	this.add = function(v) {
		this.x += v.x;
		this.y += v.y;
	}

	this.zero = function() {
		return new Vector3(0, 0);
	}

	this.rotate = function(theta) {
		var sn = sin(theta);
		var cs = cos(theta);
		var nx = (cs * this.x) - (sn * this.y);
		var ny = (sn * this.x) + (cs * this.y);
		this.x = nx;
		this.y = ny;
	}
}

function Node2D(posX, posY, mass) {
	// Mass
	this.m = mass;

	// Position
	this.p = new Vector2(posX, posY);

	// Acceleration
	this.a = new Vector2(0, 0);

	// Velocity
	this.v = new Vector2(0, 0);

	this.update = function() {

		// Add gravity here?

		this.v.add(this.a);
		this.p.add(this.v);

		if (this.p.x < 0 || this.p.x > SCR_WIDTH) {
			this.v.x = this.v.x * -1;
		}
		if (this.p.y < 0 || this.p.y > SCR_HEIGHT) {
			this.v.y = this.v.y * -1;
		}

		//this.v.mult(0.97);
		this.a.mult(0.3);
	}

	this.getMass = function() {
		return this.m;
	}

	this.setMass = function(val) {
		if (val <= 0)
			return;

		this.m = val;
	}
}
