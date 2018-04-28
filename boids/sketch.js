var frame = 0;
const NUM_BOIDS = 20;
const SCR_WIDTH = 640;
const SCR_HEIGHT = 640;
var boid_radius = 20;
var repel_dist = 30.0;
var repel_power = 0.0001;
var coziness = 0.0004;
var conformity = 0.027;
var speed = 6.0;
var mouse_effect = 0;
var boids = [];
var repelDiv = 10000;
var conformDiv = 10000;
var cozyDiv = 100000;

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
  cozySlider = createSlider(0,1000,40);
  cozySlider.position(SCR_WIDTH+20, 240);
  mouseSlider = createSlider(0,1,mouse_effect,1);
  mouseSlider.position(SCR_WIDTH+20, 280);

  for (var i=0; i<NUM_BOIDS; i++) {
  	var a = random() * TWO_PI;
		var rvx = cos(a);
		var rvy = sin(a);

  	var inc = 1;
  	if (random(0,2) == 1) inc = -1;
  	boids.push({
  		x: random(SCR_WIDTH-boid_radius) + boid_radius,
  		y: random(SCR_HEIGHT-boid_radius) + boid_radius,
  		r: boid_radius,
  		vx: rvx * speed,
  		vy: rvy * speed,
  		num_pts: random(11, 30),
  		inc: inc
  	});
  }
}

function drawBoid(e) {
	var vel = sqrt((e.vx*e.vx) + (e.vy*e.vy));
	e.num_pts = floor((vel / (speed * 2)) * 20)+10;
	if (e.num_pts > 30) {
		e.num_pts = 30;
		//console.log("seeing pts "+e.num_pts);
	}
	//var pct_speed = (e.num_pts-10) / 20;
	//var v_color = 164 - (pct_speed * 255);
	//if (v_color < 0) v_color = 0;
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
	}
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
	for (var i=0; i<NUM_BOIDS; i++) {
		drawBoid(boids[i]);
	}
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
	updateBoids();
}


// This function finds the average location (centroid) of all the boids
// other than the one specified by idx. Then it calculates a vector
// from the specified boid to that centroid point. Then it scales that
// vector based on a "coziness" parameter. The resulting vector will be
// one of the three components used to update the boid's heading and speed.
// This component basically makes a boid want to head toward the average
// position of all its neighbors.
function centroidForBoid(idx) {
	var xx = 0;
	var yy = 0;
	// sum up all the positions (except the one at idx)
	for (var i=0; i<NUM_BOIDS; i++) {
		if (i == idx) continue;
		xx += boids[i].x;
		yy += boids[i].y;
	}
	// get the average position (centroid point)
	xx = xx / (NUM_BOIDS-1);
	yy = yy / (NUM_BOIDS-1);
	// subtract the position of the boid at idx to get a vector
	// from that boid to the centroid point
	xx = xx - boids[idx].x;
	yy = yy - boids[idx].y;
	boids[idx].strayness = sqrt((xx*xx)+(yy*yy));
	// scale by coziness
	xx = xx * coziness;
	yy = yy * coziness;
	return {x: xx, y: yy};
}

// This function finds all the boids closer to the boid at idx than the
// distance specified by the "repel_dist" parameter. For each one, it
// calculates a vector from that boid to the one at idx. It sums all of
// these vectors, which gives us a sort of weighted vector away from all
// of the "too close" boids. This vector is one of the three components
// used to update the boid's heading and speed.
function repelForBoid(idx) {
	var xx = 0;
	var yy = 0;
	for (var i=0; i<NUM_BOIDS; i++) {
		if (i == idx) continue;
		// get the vector from the boid at idx to the other boid
		var dx = boids[i].x - boids[idx].x;
		var dy = boids[i].y - boids[idx].y;
		// get the distance between the two boids (the magnitude of that vector)
		var dist = sqrt( (dx * dx) + (dy * dy) );
		// if that distance is less than our parameter, we want to
		// count that vector as something to be repelled from.
		if (dist < repel_dist) {
			// we're subtracting because we want the vector away from
			// other boid, not toward it.
			xx -= dx;
			yy -= dy;
		}
	}
	// scale by repel power
	xx = xx * repel_power;
	yy = yy * repel_power;
	return {x: xx, y: yy};
}

// This function gets the average heading/speed vector for all the boids
// other than the one specified by idx. This vector is then moved to be 
// relative to the boid at idx and scaled by a "conformity" parameter. 
// This vector is one of the three components used to update the boid's 
// heading and speed. It basically makes a boid want to match speed and 
// direction with all the other boids.
function velMatchForBoid(idx) {
	var xx = 0;
	var yy = 0;
	for (var i=0; i<NUM_BOIDS; i++) {
		if (i == idx) continue;
		xx += boids[i].vx;
		yy += boids[i].vy;
	}
	// get the average heading/speed
	xx = xx / (NUM_BOIDS-1);
	yy = yy / (NUM_BOIDS-1);

	xx = (xx - boids[idx].vx) * conformity;
	yy = (yy - boids[idx].vy) * conformity;
	return {x: xx, y: yy};
}

// This function looks to see if a boid is near the edge of the view.
// If so, it adjusts the heading/speed away from the top, bottom, left
// or right edge as appropriate.
function avoidWallsForBoid(idx) {
	
	if (boids[idx].x < boid_radius) {
		boids[idx].vx = (speed / 2);
	} else if (boids[idx].x > (SCR_WIDTH-boid_radius)) {
		boids[idx].vx = -(speed / 2);
	}
	if (boids[idx].y < boid_radius) {
		boids[idx].vy = (speed / 2);
	} else if (boids[idx].y > (SCR_HEIGHT-boid_radius)) {
		boids[idx].vy = -(speed / 2);
	}	
}

function updateBoids() {
	var mousePressed = (mouseIsPressed && (mouseX < SCR_WIDTH));
	for (var i=0; i<NUM_BOIDS; i++) {
		var centroid = centroidForBoid(i);
		var repel = repelForBoid(i);
		var velMatch = velMatchForBoid(i);

		var cvx = 0;
		var cvy = 0;
		var tvx = 0;
		var tvy = 0;
		if (mouse_effect > 0 && mousePressed) {
			// When the mouse is attracting boids, we just pretend
			// that the centroid is the mouse position.
			cvx = (mouseX - boids[i].x) * coziness;
			cvy = (mouseY - boids[i].y) * coziness;
		} else {
			cvx = centroid.x;
			cvy = centroid.y;
		}
		var rvx = repel.x;
		var rvy = repel.y;
		var mvx = velMatch.x;
		var mvy = velMatch.y;
		if (mouse_effect == 0 && mousePressed) {
			// when the mouse is scaring boids, we have an extra vector
			// away from the mouse position, scaled by the current
			// repel power.
			tvx = ((boids[i].x - mouseX) / SCR_WIDTH) * repel_power * 4;
			tvy = ((boids[i].y - mouseY) / SCR_HEIGHT) * repel_power * 4;
		}
		boids[i].vx += (cvx + rvx + mvx + tvx); 
		boids[i].vy += (cvy + rvy + mvy + tvy); 

		var vel = sqrt((boids[i].vx*boids[i].vx) + (boids[i].vy*boids[i].vy));
		if (vel > speed) {
			boids[i].vx = (boids[i].vx / vel) * speed;
			boids[i].vy = (boids[i].vy / vel) * speed;
		}

		avoidWallsForBoid(i);

		boids[i].x += boids[i].vx;
		boids[i].y += boids[i].vy;
	}

}


