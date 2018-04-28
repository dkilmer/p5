const SCR_WIDTH = 640;
const SCR_HEIGHT = 640;
const BODY_WIDTH = 30;
var fontRegular;
var skel = [];

function preload() {
  fontRegular = loadFont('RobotoSlab-Light.ttf');
}

function normalize(p) {
	var len = sqrt((p.x*p.x) + (p.y*p.y));
	return {x: p.x/len, y: p.y/len};
}

function mults(p, s) {
	return {x: p.x *s, y: p.y *s};
}

function add(v1, v2) {
	return {x: v1.x+v2.x, y: v1.y+v2.y};
}

function calcNormalMid(c, p0, p1, s) {
	var v1 = {x: p0.x-c.x, y: p0.y-c.y};
	var v2 = {x: p1.x-c.x, y: p1.y-c.y};
	
	var v1n1 = normalize({x: v1.y, y: -v1.x});
	var v1n2 = normalize({x: -v1.y, y: v1.x});

	var v2n1 = normalize({x: v2.y, y: -v2.x});
	var v2n2 = normalize({x: -v2.y, y: v2.x});

	var m1 = mults(normalize(add(v1n1, v2n2)), s);
	var m2 = mults(normalize(add(v1n2, v2n1)), s);

	// left-hand
	c.l = {x: m1.x+c.x, y: m1.y+c.y};
	// right-hand
	c.r = {x: m2.x+c.x, y: m2.y+c.y};
}

function calcNormalHead(c, p0, s) {
	var o = {x: p0.x-c.x, y: p0.y-c.y};
	var n1 = mults(normalize({x: o.y, y: -o.x}), s);
	var n2 = mults(normalize({x: -o.y, y: o.x}), s);
	// left-hand
	c.l = {x: n2.x+c.x, y: n2.y+c.y};
	// right-hand
	c.r = {x: n1.x+c.x, y: n1.y+c.y};
}

function calcNormalTail(c, p0, s) {
	var o = {x: p0.x-c.x, y: p0.y-c.y};
	var n1 = mults(normalize({x: o.y, y: -o.x}), s);
	var n2 = mults(normalize({x: -o.y, y: o.x}), s);
	// left-hand
	c.l = {x: n1.x+c.x, y: n1.y+c.y};
	// right-hand
	c.r = {x: n2.x+c.x, y: n2.y+c.y};
}

function setup() {
  createCanvas(SCR_WIDTH, SCR_HEIGHT);
  noFill();
  textSize(12);
  textFont(fontRegular);
}

function calcSides() {
	var w = BODY_WIDTH;
  for (var i=0; i<skel.length; i++) {
  	if (i == 0) {
  		if (skel.length > 1) {
  			calcNormalHead(skel[i], skel[i+1], w);
  		}
  	} else if (i == (skel.length-1)) {
  		calcNormalTail(skel[i], skel[i-1], w);
  	} else {
  		calcNormalMid(skel[i], skel[i-1], skel[i+1], w);
  	}
  	skel[i].w = w;
  	w -= 3;
  }
}

function mouseClicked() {
	skel.push({x: mouseX, y: mouseY});
	calcSides();
}

function drawTriangle(p0, p1, p2) {
	line(p0.x, p0.y, p1.x, p1.y);
	line(p1.x, p1.y, p2.x, p2.y);
	line(p2.x, p2.y, p0.x, p0.y);
}

function draw() {
	background(240);
  for (var i=skel.length-1; i>0; i--) {
  	//ellipse(skel[i].x, skel[i].y, 10, 10);
		//line(skel[i].x, skel[i].y, skel[i-1].x, skel[i-1].y);
		drawTriangle(skel[i].r, skel[i].l, skel[i-1].l);
		drawTriangle(skel[i-1].l, skel[i-1].r, skel[i].r);
  }
}
