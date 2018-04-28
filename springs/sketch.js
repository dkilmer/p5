var frame = 0;
const NUM_BOIDS = 20;
const SCR_WIDTH = 640;
const SCR_HEIGHT = 640;
var boid_radius = 20;
var repel_dist = 50.0;
var repel_power = 0.0002;
var attract_dist = 200.0;
var attract_power = 0.001;
var coziness = 1.0000;
var conformity = 0.027;
var speed = 5.0;
var mouse_effect = 0;
var boids = [];
var springs = [];
var corners = [];
var repelDiv = 10000;
var conformDiv = 10000;
var cozyDiv = 1000;
var doUpdate = true;
var selIdx = -1;

var fontRegular;
var sizeSlider, speedSlider, repelDistSlider, repelPowerSlider, conformSlider, cozySlider, mouseSlider;

function preload() {
  fontRegular = loadFont('RobotoSlab-Light.ttf');
}

function setup() {
  createCanvas(SCR_WIDTH+200, SCR_HEIGHT);
  //randomSeed(142857);
  noFill();
  textSize(12);
  textFont(fontRegular);
  //fill(240);

  sizeSlider = createSlider(10,120,boid_radius,1);
  sizeSlider.position(SCR_WIDTH+20, 40);
  speedSlider = createSlider(3,12,speed);
  speedSlider.position(SCR_WIDTH+20, 80);
  repelDistSlider = createSlider(4,100,repel_dist, 1);
  repelDistSlider.position(SCR_WIDTH+20, 120);
  repelPowerSlider = createSlider(0,1000,270);
  repelPowerSlider.position(SCR_WIDTH+20, 160);
  conformSlider = createSlider(0,1000,270);
  conformSlider.position(SCR_WIDTH+20, 200);
  cozySlider = createSlider(0,1000,1000);
  cozySlider.position(SCR_WIDTH+20, 240);
  mouseSlider = createSlider(0,1,mouse_effect,1);
  mouseSlider.position(SCR_WIDTH+20, 280);

  corners.push(new Node2D(0, SCR_HEIGHT, 100000));
  corners.push(new Node2D(SCR_WIDTH, SCR_HEIGHT, 100000));
  corners.push(new Node2D(0, 0, 100000));
  corners.push(new Node2D(SCR_WIDTH, 1, 100000));

  // for (var i=0; i<NUM_BOIDS; i++) {
  // 	var x = random(SCR_WIDTH-boid_radius) + boid_radius;
  // 	var y = random(SCR_HEIGHT-boid_radius) + boid_radius;
  // 	boids.push(new Node2D(x, y, 1));
  // }

  // for (var i=0; i<boids.length; i++) {
  // 	for (var j=0; j<boids.length; j++) {
  // 		if (j == i) continue;
  // 		springs.push(new Spring2D(boids[i], boids[j], 200, -3));
  // 	}
  // 	for (var c=0; c<corners.length; c++) {
  // 		springs.push(new Spring2D(boids[i], corners[c], 120, -3));
  // 	}
  // }

}

function drawBoid(e) {
	stroke(0);
	ellipse(e.p.x, e.p.y, boid_radius*2, boid_radius*2);
	/*
	var vel = sqrt((e.v.x*e.v.x) + (e.v.y*e.v.y));
	e.num_pts = floor((vel / (speed * 2)) * 20)+10;
	if (e.num_pts > 30) {
		e.num_pts = 30;
	}
	var s_color = e.strayness - 5;
	if (s_color > 255) s_color = 255;
	stroke(0, 255-s_color);
	ellipse(e.x, e.y, e.r*2, e.r*2);

	var frac = TWO_PI / e.num_pts;

	var head = atan(e.vx/vel, e.vy/vel);
	for (var i=0; i<e.num_pts; i++) {
		var a1 = ((head + (i * frac)) % TWO_PI);
		var x1 = e.x + (cos(a1) * (e.r));
		var y1 = e.y + (sin(a1) * (e.r));
		ellipse(x1, y1, 4, 4);
		var j = ((i + 10) % e.num_pts);
		var a2 = ((head + (j * frac)) % TWO_PI);
		var x2 = e.x + (cos(a2) * (e.r));
		var y2 = e.y + (sin(a2) * (e.r));
		line(x1, y1, x2, y2);
	}
	*/
}

function updateFromSliders() {
	var sizeVal = sizeSlider.value();
	if (sizeVal != boid_radius) {
		boid_radius = sizeVal;
		for (var i=0; i<NUM_BOIDS; i++) boids[i].r = sizeVal;
	}
	var speedVal = speedSlider.value();
	if (speed != speedVal) {
		speed = speedVal;
	}
	var repelDistVal = repelDistSlider.value();
	if (repel_dist != repelDistVal) {
		repel_dist = repelDistVal;
	}
	var repelPowerVal = repelPowerSlider.value() / repelDiv;
	if (repel_power != repelPowerVal) {
		repel_power = repelPowerVal;
	}
	var conformVal = conformSlider.value() / conformDiv;
	//conformVal = 1 / (conformVal * conformVal);
	if (conformity != conformVal) {
		conformity = conformVal;
	}
	var cozyVal = cozySlider.value() / cozyDiv;
	if (coziness != cozyVal) {
		coziness = cozyVal;
	}
	var mouseVal = mouseSlider.value();
	if (mouse_effect != mouseVal) {
		mouse_effect = mouseVal;
	}
}

function mouseClicked() {
	var minx =  SCR_WIDTH + 160;
	var maxx = minx + 30;
	var ta = textAscent();
	if (mouseX >= minx && mouseX <= maxx) {
		if (mouseY >= 160-ta && mouseY <= 190-ta) {
			repelDiv = repelDiv * 10;
			if (repelDiv > 10000000) repelDiv = 1000;
		} else if (mouseY >= 200-ta && mouseY <= 230-ta) {
			conformDiv = conformDiv * 10;
			if (conformDiv > 10000000) conformDiv = 1000;
		} else if (mouseY >= 240-ta && mouseY <= 270-ta) {
			cozyDiv = cozyDiv * 10;
			if (cozyDiv > 10000000) cozyDiv = 1000;
		}
	} else if (mouseButton == CENTER) {
		doUpdate = false;
	  for (var i=0; i<boids.length; i++) {
	  	boids[i].v.x = 0;
	  	boids[i].v.y = 0;
	  	boids[i].a.x = 0;
	  	boids[i].a.y = 0;
		}
		boids.push(new Node2D(mouseX, mouseY, 1));
		var j = boids.length-1;
	  for (var i=0; i<boids.length-1; i++) {
  		springs.push(new Spring2D(boids[j], boids[i], 200, -5));
	  }
  	for (var c=0; c<corners.length; c++) {
  		springs.push(new Spring2D(boids[j], corners[c], 120, -1));
  	}
		doUpdate = true;	  
	}
}

function mousePressed() {
	selIdx = -1;
	var mv = new Vector2(mouseX, mouseY);
	for (var i=0; i<boids.length; i++) {
		var dist = VecOp.distanceV2(mv, boids[i].p);
		if (dist < boid_radius) {
			selIdx = i;
			break;
		}
	}
}

function mouseReleased() {
	selIdx = -1;
}

function drawControls() {
	noStroke();
	fill(64);
	textAlign(LEFT);
	text("boid size", SCR_WIDTH+20, 40);
	text("boid speed", SCR_WIDTH+20, 80);
	text("repel distance", SCR_WIDTH+20, 120);
	text("repel power", SCR_WIDTH+20, 160);
	text("conformity", SCR_WIDTH+20, 200);
	text("coziness", SCR_WIDTH+20, 240);
	text("mouse effect", SCR_WIDTH+20, 280);
	textAlign(RIGHT);
	text(""+boid_radius, SCR_WIDTH+20+sizeSlider.width, 40);
	text(""+speed, SCR_WIDTH+20+sizeSlider.width, 80);
	text(""+repel_dist, SCR_WIDTH+20+repelDistSlider.width, 120);
	text(""+repel_power, SCR_WIDTH+20+repelPowerSlider.width, 160);
	text(""+conformity, SCR_WIDTH+20+conformSlider.width, 200);
	text(""+coziness, SCR_WIDTH+20+cozySlider.width, 240);
	text((mouse_effect == 0) ? "scare" : "attract", SCR_WIDTH+20+cozySlider.width, 280);
	textAlign(CENTER);
	text("[make tiny things]", SCR_WIDTH+100, SCR_HEIGHT-20);	
	noFill();
	stroke(128);
	var ta = textAscent();
	rect(SCR_WIDTH+160, 160-ta, 30, 30);
	rect(SCR_WIDTH+160, 200-ta, 30, 30);
	rect(SCR_WIDTH+160, 240-ta, 30, 30);
	noStroke();
	fill(64);
	text("10^"+pot(repelDiv),SCR_WIDTH+175, 175-(ta/2));
	text("10^"+pot(conformDiv),SCR_WIDTH+175, 215-(ta/2));
	text("10^"+pot(cozyDiv),SCR_WIDTH+175, 255-(ta/2));
}

function pot(n) {
	return (""+n).length-1;
}

function draw() {
	background(240);
	updateFromSliders();
	drawControls();
	stroke(192);
	line(SCR_WIDTH, 20, SCR_WIDTH, SCR_HEIGHT-20);
	stroke(32);
	noFill();
	if (selIdx >= 0) {
		boids[selIdx].p.x = mouseX;
		boids[selIdx].p.y = mouseY;
	}
	for (var i=0; i<boids.length; i++) {
		drawBoid(boids[i]);
	}
	// for (var i=0; i<springs.length; i++) {
	// 	line(springs[i].node1.p.x,springs[i].node1.p.y,springs[i].node2.p.x,springs[i].node2.p.y);
	// }
	if (mouseIsPressed && (mouseX < SCR_WIDTH)) {
		if (mouse_effect == 0) {
			stroke(192,0,0, 128);
			fill(128,0,0, 128);			
		} else {
			stroke(0,192,0, 128);
			fill(0,128,0, 128);			
		}
		ellipse(mouseX, mouseY, 16, 16);
	}
	frame = ((frame + 1) % 4);
	if (doUpdate) {
		updateBoids();		
	}
}


function updateBoids() {
	for (var i = 0; i < springs.length; i++) {
		springs[i].update();
	};

	for (var i = 0; i < boids.length; i++) {
		boids[i].update();
	};
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

		this.v.mult(0.97);
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

function Spring2D(node1_, node2_, restDistance, k) {
	this.b = 0.02;

	this.node1 = node1_;
	this.node2 = node2_;

	this.isString = false;

	if (!k)
		this.k = -1;
	else
		this.k = k;

	// If rest distance isn't defined then use the real distance between two the nodes
	if (restDistance)
		this.d = restDistance;
	else
		this.d = VecOp.distanceV2(node1_.p, node2_.p);

	this.update = function() {
		//     F = -k(|x|-d)(x/|x|) - bv

		// Vector2 F1 = -k * (xAbs - d) * (Vector2.Normalize(node2.p - node1.p) / xAbs) - b * (node1.v - node2.v);
		// Vector2 F2 = -k * (xAbs - d) * (Vector2.Normalize(node1.p - node2.p) / xAbs) - b * (node2.v - node1.v);

		//var F1 = sub(sub(node1.p, node2.p).normalize().divide(xAbs).mult(-k * (xAbs - d)), sub(node1.v, node2.v).mult(-b));
		//var F1 = sub(sub(node2.p, node1.p).normalize().divide(xAbs).mult(-k * (xAbs - d)), sub(node2.v, node1.v).mult(-b));

		var node1 = this.node1;
		var node2 = this.node2;
		var k = this.k;
		var d = this.d;
		var b = this.b;

		var xAbs = VecOp.distanceV2(node1.p, node2.p);

		if (this.isString && xAbs < this.d)
			return;

		var norm1 = VecOp.subV2(node2.p, node1.p).normalize();
		var norm2 = VecOp.subV2(node1.p, node2.p).normalize();
		var v1 = VecOp.subV2(node1.v, node2.v);
		var v2 = VecOp.subV2(node2.v, node1.v);

		var F1x = -k * (xAbs - d ) * (norm1.x / xAbs) - b * v1.x;
		var F1y = -k * (xAbs - d ) * (norm1.y / xAbs) - b * v1.y;

		var F2x = -k * (xAbs - d ) * (norm2.x / xAbs) - b * v2.x;
		var F2y = -k * (xAbs - d ) * (norm2.y / xAbs) - b * v2.y;

		// Add acceleration. Updating velocity\positions should happen after all springs are updated
		node1.a.x += F1x / node1.m;
		node1.a.y += F1y / node1.m;

		node2.a.x += F2x / node2.m;
		node2.a.y += F2y / node2.m;
	}

	this.toggleString = function() {
		this.isString = !this.isString;
	}

	this.setStringMode = function(mode) {
		this.isString = mode;
	}

	this.getStiffness = function() {
		return this.k;
	}

	this.setStiffness = function(val) {
		this.k = val;
	}

	this.getRest = function() {

		var node1 = this.node1;
		var node2 = this.node2;
		var xAbs = VecOp.distanceV2(node1.p, node2.p);

		return this.d / xAbs;
	}
}

