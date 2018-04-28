const SCR_WIDTH = 640;
const SCR_HEIGHT = 640;
var fontRegular;

function preload() {
  fontRegular = loadFont('RobotoSlab-Light.ttf');
}

function setup() {
  createCanvas(SCR_WIDTH, SCR_HEIGHT);
  noFill();
  textSize(12);
  textFont(fontRegular);
}

function mouseClicked() {
}

function draw() {
	background(240);
}
