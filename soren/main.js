
const SCR_WIDTH = 800;
const SCR_HEIGHT = 600;
var score = 0;
var frames = 0;
var player;
var paused = true;
var lose = false;
var boulders = [];

// runs once at start
function setup() {
  createCanvas(SCR_WIDTH, SCR_HEIGHT);
  player = new Ball(SCR_WIDTH/2, SCR_HEIGHT - 20, 20, 0, 0);
}

// runs every frame
function draw() {
  background(0,0,0);

  if(!paused) {
    if (Math.random()<.03) {
    	var vy = (score * 0.1) + 2;
    	if (vy > 10) vy = 10;
    	boulders.push(new Ball(Math.random()*SCR_WIDTH, 100, 30, 0, vy));
    }
  }

  fill(255, 0, 0);
  if (!paused) {
  boulders.map(function(boulder) {
    boulder.move();
    boulder.draw();
	  if (boulder.collided(player)) {
	  	lose = true;
	  }
    })
  }
  fill(255, 229, 0);

  if (paused) {
    text('press space to play!', 250, 300);
  }

  // show score
  textSize(32);
  text(`your score is ${score}`, 0, 32);

  //ellipse(circle_x, circle_y, 40);
  player.draw();


  if (lose) {
    text('you lose!', 200, 200)
    boulders = [];
    paused = true;
  } else if (!paused) {
  	frames += 1;
  	if (frames > 60) {
  		frames = 0;		
	    score += 1;
	    boulders = boulders.filter(function(boulder) {
	    	return boulder.y < (SCR_HEIGHT+boulder.radius);
	    });
	    console.log("there are "+boulders.length);
  	}
  }

  if (!paused) {
    if (keyIsDown(LEFT_ARROW)) {
      if (player.x > 40) {
        player.x -= 5;
      }
    } else if (keyIsDown(RIGHT_ARROW)) {
      if (player.x < (SCR_WIDTH-20)) {
        player.x += 5;
      }
    }
  }
}

function keyPressed() {
  if (keyCode === 32) {//spacebar
    paused = !paused;
    if (lose) score = 0;
    lose = false;
  } else if (keyCode === 82) { //r
    score = 0;
    lose = false;
    boulders = [];
    player.x = SCR_WIDTH/2;
    player.y = SCR_HEIGHT - 20;
    paused = true;
  }
}


// resize canvas when the browser window resizes
function windowResized() {
  resizeCanvas(window.innerWidth, window.innerHeight);
}

// handles mouse clicks for the entire page
function mouseClicked() {
  //increment score by 1
  ///score += 1;
}

class Ball {
  constructor(x, y, radius, velocity_x, velocity_y) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.velocity_x = velocity_x;
    this.velocity_y = velocity_y;
  }

  draw() {
    ellipse(this.x, this.y, this.radius*2);
  }

  move() {
    this.x += this.velocity_x;
    this.y += this.velocity_y;
  }

  collided(otherBall) {
    var distance = dist(this.x, this.y, otherBall.x, otherBall.y);
    return distance <= this.radius + otherBall.radius;
  }
}
